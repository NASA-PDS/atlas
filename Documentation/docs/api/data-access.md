---
sidebar_position: 2
---

# Data Access

The Data Access API is the primary endpoint to get at PDSIMG Atlas 4 holdings.

The Data Access API maps `uri`s to their data locations and then returns an HTTP redirect to its source product's location.

## Usage:

To use the Data Access API use the following:

```
https://pds-imaging.jpl.nasa.gov/api/data/{uri}{::release_id?}{:resize?}
```

- _uri:_ A full uri to a file. See [URI](./uri).
- _release_id:_ **Optional** Technically part of the `uri` but restated here for emphasis. Many Data Providers periodically send batches of data for archive to the PDS Imaging Node. Release Id designates that batch or release. Release Id can be thought of as a "delivery version" and is an internal PDSIMGism. Release Id **is not** the mission's version of the product itself. A mission may deliver a product named `A.IMG` with version 1 in release 1 and then deliver an updated version of `A.IMG` in release 2 with a version of 3. In this case, version 2 of the product was not delivered and Release Id 1 => version 1, Release Id 2 => version 3. If unset, assumes a Release Id of 0 (indicating no release id which is true in some cases).
- _resize:_ **Optional** If the uri is of an image (png/jpg/jpeg/webp), instead of the original, the Data Access API can resize that image on the fly and return it as a .webp. Tack on the following to the uri to resize:
  - **:xs** - 128x128
  - **:sm** - 256x256
  - **:md** - 512x512
  - **:lg** - 1024x1024

#### Examples:

- https://pds-imaging.jpl.nasa.gov/api/data/atlas:pds4:mars_2020:perseverance:/mars2020_hazcam_ops_raw/browse/sol/00020/ids/edr/fcam/FLF_0020_0668728043_977ECM_N0030770FHAZ02003_07_295J03.png
- https://pds-imaging.jpl.nasa.gov/api/data/atlas:pds4:mars_2020:perseverance:/mars2020_hazcam_ops_raw/browse/sol/00020/ids/edr/fcam/FLF_0020_0668728043_977ECM_N0030770FHAZ02003_07_295J03.png:xs
- https://pds-imaging.jpl.nasa.gov/api/data/atlas:pds4:mars_2020:perseverance:/mars2020_navcam_ops_calibrated/browse/sol/01139/ids/rdr/ncam/NLG_1139_0768057921_410RZS_N0520870NCAM00524_0A02I4J01.png::10:md
