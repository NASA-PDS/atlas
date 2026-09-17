# AGENTS.md

Notes for AI agents (and humans) working on Atlas. Captures non-obvious
context that has tripped up agents in the past.

> If you discover something else that would have saved you an hour,
> please add it here.

## What Atlas is

Atlas is a React/Redux SPA for searching, browsing, and bulk-downloading
NASA PDS planetary imagery. It does **not** include a database — its
search/data backends are separate services maintained elsewhere.

## Architecture (production)

Atlas and its data backends are independent services that share a
domain in production:

| Service | URL | Purpose |
|---|---|---|
| **Atlas SPA** (this repo) | `https://pds-imaging.jpl.nasa.gov/tools/atlas/*` | The web client |
| **Search proxy** | `https://pds-imaging.jpl.nasa.gov/api/...` | API Gateway → Lambda → OpenSearch. Used by `/search` and `/archive-explorer` for queries. |
| **Archive (data access)** | `https://pds-imaging.jpl.nasa.gov/archive/*` | Binary image content / asset bytes. Used by `/search` thumbnails, `/record`'s full-res OpenSeadragon viewer, and anywhere else images get rendered. **NOT tied to `/archive-explorer`** — that's a search-proxy consumer like `/search`. |

Common confusion: `/archive` (the data service) and `/archive-explorer`
(the FileExplorer SPA route) are unrelated. The route name is about
"exploring the PDS archive", not about hitting the `/archive` service.

## Bulk-download rule (READ THIS BEFORE TESTING)

**Never click any download / bulk-download button in tests.** A wrong
click can trigger a multi-TB transfer over real PDS infrastructure.
This applies to:

- "Add All to Cart" / "Add All Results to Cart"
- Cart "DOWNLOAD" button (any tab: CSV / Browser / WGET / TXT / CURL)
- Any per-record download trigger
- Any "ADD TO CART" → "DOWNLOAD" combo in cart that initiates a
  multi-record transfer

Tests may **assert these affordances are reachable / visible**, but
must never `click()` them. The Playwright suite is intentionally
written to exercise everything around the download surfaces without
crossing that line.

## Routes

| Route | Component | URL params |
|---|---|---|
| `/search` | `src/pages/Search/Search.js` | filter keys (`_text`, `mission`, `target`, etc.) — Atlas strips unknown params |
| `/record` | `src/pages/Record/*` | `uri=<lidvid>` — keys the entire view |
| `/cart` | `src/pages/Cart/*` | none |
| `/archive-explorer` | `src/pages/FileExplorer/*` (a.k.a. **FileX**) | column-drilling state via params like `?mission=...&bundle=...` |

Root `/` 307-redirects to `/search`.

## Build / dev / test runtime

- Default dev port: **8500**. Tests use **18500** to avoid conflicts.
- Production server: `node scripts/start-prod.js`
- Build directory: `build/atlas/`
- Bundle analysis: `npm run analyze` runs a production webpack build with
  `webpack-bundle-analyzer` and writes `reports/bundle-report.html`
  (outside `build/atlas/` so it is never deployed). Dev can still pass
  `--analyze` to `scripts/start-dev.js` for the interactive analyzer server.
- Required env for tests: `NODE_ENV=production`, `DISABLE_CSP=true`,
  `PUBLIC_URL=''`, `REACT_APP_DOMAIN` (defaults to
  `https://pds-imaging.jpl.nasa.gov/api`)
- `REACT_APP_*` vars are **build-time** (CRA convention) — they're
  baked into the bundle by `npm run build`. Runtime overrides go
  through `window.APP_CONFIG` (see `src/core/runtimeConfig.js`).
- `PUBLIC_URL` is read from `.env` at build time; `dotenv-expand`
  has caused it to leak in unexpected ways — keep an eye on it.

### Docker runner stage

The production image's runner stage hand-lists runtime files rather
than copying all of `config/` / `scripts/`:

- `config/paths.js` + `config/package.json` (`"type": "module"`)
- `scripts/start-prod.js` + `scripts/package.json` (`"type": "module"`)

Those scoped `package.json` files are required so Node treats the
scripts as ESM without emitting `MODULE_TYPELESS_PACKAGE_JSON` (and
the related reparse overhead). If `scripts/start-prod.js` or
`config/paths.js` gains a new local import, update the Dockerfile
runner stage's `COPY` lines to include it — the builder stage uses
`COPY . .`, but the runner does not.

## Selector patterns (Playwright / DOM)

The codebase uses **MUI 5** with `@mui/styles/makeStyles`, which
generates **hashed JSS class names** (`jss1`, `jss10`, …) that change
between builds. **Never select on those hashed classes.**

Stable selector strategy (in order of preference):

1. `getByRole(role, { name })` — semantic, accessible, MUI-friendly
2. `getByLabel(text)` / `getByPlaceholder(text)`
3. `getByText(text, { exact })`
4. `aria-label="..."` via attribute selectors
5. Custom data attributes (e.g. `[result-id]`) and **stable**,
   manually-set class names (e.g. `.GridViewMasonryItem`) are fine
6. XPath axes (`following::`, `ancestor::`) for proximity-based scoping

The rule is about **avoiding selectors that depend on JSS hashes**
(which change every build), not about class selectors in general.
If a class name is set explicitly in source (`className="FooBar"`)
and isn't going to be renamed for cosmetic reasons, it's a fine
selector — usually `getByRole` is still preferable for semantics,
but not a hard rule.

### Component → role cheat sheet

| Component | Role | Notes |
|---|---|---|
| MUI `<Tab>` (e.g. ResultsPanel grid/list/table, Record Overview/Product Label) | `tab` | NOT `button`. Wrapped in `<Tabs role="tablist">`. |
| MUI `<MenuItem>` | `menuitem` | Composed accessible name = checkbox `aria-label` (`"select"` / `"selected"`) + option text. Use a non-anchored regex like `/basic filters/i`, NOT `/^basic filters$/i`. |
| MUI `<Dialog>` | `dialog` | Has `aria-labelledby="responsive-dialog-title"`. Close button typically `aria-label="close"`. |
| MUI `<IconButton>` (custom MenuButton trigger) | `button` | Has `aria-label="menu"`. Multiple per page (Topbar, FiltersPanel, ResultsPanel) — disambiguate by proximity. |
| OpenSeadragon viewer controls | `button` | `aria-label="image view home"`, `"image view zoom in/out"`, `"image view rotate clockwise/counter clockwise"`, `"image view fullscreen"` |
| RemoveFromCartModal buttons | `button` | `aria-label="yes button"`, `"no button"`, `"close modal"` (literal strings, not regex matches) |
| Title back button | `button` | Conditional: `aria-label={back === 'page' ? 'go back a page' : 'return to search'}` — use Playwright's `.or()` |
| Topbar nav buttons | `button` | `name=/go to cart/i`, `"navigation"` (drawer toggle) |
| Toolbar workspace switches (mobile) | `button` | `"filters panel"`, `"Map Panel"`, `"Results Panel"` |

### Modals (Redux `modal` slice)

All 9 modals live in `src/pages/Search/Modals/*` (with cart-specific
ones in `src/pages/Cart/Modals/*`). They're opened via
`dispatch(setModal(<key>))` and rendered conditionally based on the
`modal` slice. Closing typically dispatches `setModal(null)`.

Modal keys: `information`, `addFilter`, `editColumns`, `advancedFilter`,
`advancedFilterReturn`, `feedback`, `removeFromCart`, `regex` (in FileX),
`emptyCart` (cart). All except `regex` originate in the search/cart UIs.

### URL state quirks

- `/search?<query>` strips unknown params. The SPA also re-normalizes
  the URL after the API responds, which can change the URL between
  page-load and "settled". Tests for refresh-preservation should
  capture the **post-settle** URL, not the goto'd URL.
- `/record?uri=<lidvid>` survives reload regardless of whether the
  URI corresponds to a real record.

## Test infrastructure

Layout (under `tests/`):

```
tests/
├── e2e/
│   ├── smoke.spec.js                       # SPA shell + redirect + stylesheets
│   ├── startup/                            # /_health, /robots.txt, per-route shell
│   ├── search/                             # Search route (16 specs)
│   ├── record/                             # /record (4 specs)
│   ├── cart/                               # /cart (8 specs)
│   ├── archive-explorer/                   # FileX (3 specs)
│   ├── navigation/                         # Routing + click nav + drawer (6 specs)
│   ├── integration/                        # /search → /record → /cart e2e (1 spec)
│   ├── performance/                        # Load timing + JS heap (3 specs)
│   ├── accessibility/                      # axe-core + a11y basics (4 specs)
│   ├── mobile/                             # 375x667 viewport + tablet (3 specs)
│   ├── security/                           # Headers + XSS + CSP (4 specs)
│   └── cross-browser/                      # Firefox-only smoke (1 spec)
├── helpers/atlas-helpers.js                # navigateTo*, filterCriticalJsErrors, waitForAppReady
├── fixtures/search-params.js
├── global-setup.js                         # Builds if `build/atlas/` is missing
└── README.md
```

Key helpers:

- `waitForAppReady(page)` — `.catch()`es networkidle timeouts because
  the live PDS API may be slow / unreachable. Reliable in CI.
- `filterCriticalJsErrors(errorList)` — suppresses two well-known
  noise categories: (1) network errors (`Failed to fetch`,
  `NetworkError`, `net::ERR`, `404`, `AbortError`); (2) downstream
  Redux/immutable.js crashes (`Cannot read properties of undefined`,
  `toJS is not a function`, etc.) that fire when a reducer receives
  `undefined` instead of a Map. **Always use this helper instead of
  inlining the filter** — the centralised list catches more cases.

Playwright projects:

- `chromium` — primary CI suite. `testIgnore: /cross-browser/`.
- `firefox` — cross-browser smoke only. `testMatch: /cross-browser/`.

To deterministically test API behavior, use `page.route()` to mock
the search proxy or archive responses — e.g.:

```js
await page.route(/_search/, route => route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify({ hits: { total: { value: 0 }, hits: [] } }),
}))
```

The `/_search/` regex matches both the search proxy URL (used by
`/search`) AND the archive endpoint config (`REACT_APP_ARCHIVE_ENDPOINT
= '/search/atlas/_search'`), so a single mock covers both `/search`
and `/archive-explorer` queries.

## CI

The only CI check on PRs in `JPL-Devin/atlas` is **Devin Review**.
There are no other CI pipelines (build, lint, test, etc.) configured
on the repo. The `.github/workflows/playwright-tests.yml` workflow
exists but is informational — when iterating on a PR, don't wait for
additional CI checks beyond Devin Review.

## Coding & repo conventions

- ES6+ modules, function components, hooks. No class components in
  new code.
- Redux state uses **immutable.js** (`Map`, `List`). Selectors call
  `state.getIn(['path', 'to', 'value'])` and `.toJS()`. Receiving
  `undefined` in a selector is what causes the
  `Cannot read properties of undefined` / `toJS is not a function`
  errors that the test suite filters as expected upstream noise.
- MUI styling via `@mui/styles/makeStyles` (legacy, JSS-based) **and**
  newer `sx={...}` / `styled()` from `@mui/material`. Both coexist;
  follow the convention of the file you're editing.
- No TypeScript — JS only.
- Lint: `npm run lint` (eslint).

## What NOT to do

- Don't access the parent directory of the project (see
  `.cursorrules`).
- Don't click bulk-download buttons (see top of file).
- Don't select on MUI's hashed JSS class names (`jss1`, `jss10`,
  etc.) — they change every build. Stable manually-set class names
  (e.g. `.GridViewMasonryItem`) and data attributes are fine.
- Don't assume `npm run build` will pick up `.env` changes mid-test —
  the build is cached in `build/atlas/` and `tests/global-setup.js`
  only rebuilds if that directory is missing. Delete the directory
  to force a rebuild.
- Don't replace `filterCriticalJsErrors` with hand-rolled inline
  filters — the helper is the single source of truth for what
  upstream noise to suppress.
