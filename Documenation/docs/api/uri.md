---
sidebar_position: 1
---

# URI

Atlas 4 has its own internal UUID schema known as `uri`:

- This differs from the standardized PDS4 `lid`.
- This works across both PDS3 and PDS4.
- All products, labels, ancillary files and directories are assigned a `uri`.

## Scheme

```
atlas:{standard}:{mission}:{spacecraft}:/{bundleName?}{restOfPath?}{::release_id?}
```

### `atlas`

All Atlas 4 `uri`s being with `atlas`.

### `{standard}`

The PDS standard.

Values:
`"pds3"` or `"pds4"`

### `{mission}`

Mission name.

See [Missions and Spacecraft](../standards/missions-and-spacecraft).

### `{spacecraft}`

Spacecraft name.

See [Missions and Spacecraft](../standards/missions-and-spacecraft).

### `{bundleName}`

Name of the volume (PDS3) or bundle (PDS4). Optional but the only `uri` where the `{bundleName}` does not exist are on the mission-spacecraft's root directory (`atlas:{standard}:{mission}:{spacecraft}:/`)

### `{restOfPath}`

Rest of path to directory or file. Directory `uri`s do not end with a `/`. Optional but the only `uri`s without a `{restOfPath}` are root directories and bundle directories.

### `{::release_id?}`

Release version of the product. For example: `....IMG::9` for release 9.

_Optional._
