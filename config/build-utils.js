/**
 * Build utility functions.
 *
 * Historically this file also carried webpack-era helpers (FileSizeReporter,
 * formatWebpackMessages, printBuildError, checkBrowsers, noopServiceWorkerMiddleware)
 * adapted from Create React App / react-dev-utils. Those were removed when the
 * build moved to Vite (Phase 2) — Vite's own CLI provides build-size reporting,
 * error formatting, and dev-server middleware, so they're no longer needed.
 *
 * `htmlToPug` remains: it powers the Vite `html2pug` plugin (see
 * plugins/vite-plugin-html2pug.js), which preserves the "build once, deploy
 * anywhere" Express + Pug + window.APP_CONFIG + per-request CSP nonce model.
 */

import { parse } from "parse5";

// ---------------------------------------------------------------------------
// htmlToPug
// Minimal HTML → Pug converter for the built index.html.
// Replaces the previous `html2pug` dependency (which transitively pulled in
// the deprecated, REDoS-vulnerable `html-minifier`).
//
// Design tradeoffs vs. the full html2pug:
//   - No HTML minification pass (the bundler already minifies), but we do
//     collapse a small whitelist of boolean attributes (defer/async) so
//     `defer="defer"` → `defer`.
//   - Output mirrors html2pug's defaults: 2-space indent, commas between
//     attributes, single-quoted values, `#id` / `.class` shorthand on <div>.
//   - parse5 is used directly for parsing (a stable, well-maintained MIT
//     package).
// ---------------------------------------------------------------------------

const BOOLEAN_ATTRS = new Set([
  "async",
  "autofocus",
  "autoplay",
  "checked",
  "controls",
  "defer",
  "disabled",
  "hidden",
  "ismap",
  "loop",
  "multiple",
  "muted",
  "novalidate",
  "open",
  "readonly",
  "required",
  "reversed",
  "selected",
]);

function nodeAttrsToPug(tagName, attrs) {
  const parts = [];
  let prefix = tagName;

  for (const { name, value } of attrs) {
    // div#id / div.class shorthand
    if (tagName === "div" && (name === "id" || name === "class")) {
      prefix = prefix.replace(/^div/, "");
    }

    if (name === "id") {
      prefix += `#${value}`;
      continue;
    }
    if (name === "class") {
      prefix += `.${value.split(/\s+/).filter(Boolean).join(".")}`;
      continue;
    }

    if (BOOLEAN_ATTRS.has(name) && (value === "" || value === name)) {
      parts.push(name);
      continue;
    }

    if (value === "") {
      // Skip empty non-boolean attributes (matches html-minifier's removeEmptyAttributes).
      continue;
    }

    const escaped = value.replace(/'/g, "\\'");
    parts.push(`${name}='${escaped}'`);
  }

  return parts.length ? `${prefix}(${parts.join(", ")})` : prefix;
}

function walkNode(node, level, out) {
  const indent = "  ".repeat(level);

  switch (node.nodeName) {
    case "#documentType":
      out.push(`${indent}doctype html`);
      return;

    case "#comment":
      // Block (non-buffered) Pug comment.
      out.push(`${indent}//${node.data ? ` ${node.data}` : ""}`);
      return;

    case "#text": {
      const text = node.value || "";
      if (/^\s*$/.test(text)) return; // Pure-whitespace text nodes are noise.
      out.push(`${indent}| ${text}`);
      return;
    }

    default: {
      const tag = node.tagName;
      const pugTag = nodeAttrsToPug(tag, node.attrs || []);
      const children = node.childNodes || [];

      // Inline a single text-node child on the same line: `tag content`.
      if (
        children.length === 1 &&
        children[0].nodeName === "#text" &&
        !/\n/.test(children[0].value || "")
      ) {
        const inner = children[0].value;
        out.push(inner ? `${indent}${pugTag} ${inner}` : `${indent}${pugTag}`);
        return;
      }

      out.push(`${indent}${pugTag}`);
      for (const child of children) {
        walkNode(child, level + 1, out);
      }
      return;
    }
  }
}

function htmlToPug(html) {
  const doc = parse(html);
  const out = [];
  for (const child of doc.childNodes || []) {
    walkNode(child, 0, out);
  }
  return out.join("\n");
}

// ---------------------------------------------------------------------------
// Exports
// ---------------------------------------------------------------------------
export { htmlToPug };
