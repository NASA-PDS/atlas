---
sidebar_position: 3
---

# Search

## Common Atlas IV Search Queries

### Get record based on lidvid

#### Query

```text title="Query"
curl -XPOST "https://pds-imaging.jpl.nasa.gov/api/search/atlas/_search" -H "Content-Type: application/json" -d '{"query":{"bool":{"must":[{"match": {"pds4_label.lidvid": "urn:nasa:pds:mars2020_helicam:data:hsf_0649_0724570000_955ecm_n0370001heli00002_000085j"}}]}}, "size": 1}' | jq
```

#### Response

```json title="Response"
{
  "took": 1,
  "timed_out": false,
  "_shards": {
    "total": 5,
    "successful": 5,
    "skipped": 0,
    "failed": 0
  },
  "hits": {
    "total": {
      "value": 1,
      "relation": "eq"
    },
    "max_score": 11.724767,
    "hits": [
      {
        "_index": "atlas",
        "_type": "_doc",
        "_id": "atlas:pds4:mars_2020:perseverance:/mars2020_helicam/data/sol/00649/ids/edr/heli/HSF_0649_0724570000_955ECM_N0370001HELI00002_000085J01.IMG",
        "_score": 11.724767,
        "_source": {
          "pds4_label": {
            "lidvid": "urn:nasa:pds:mars2020_helicam:data:hsf_0649_0724570000_955ecm_n0370001heli00002_000085j::1.0",
            "pds:Identification_Area/pds:logical_identifier": "urn:nasa:pds:mars2020_helicam:data:hsf_0649_0724570000_955ecm_n0370001heli00002_000085j",
            ...
          },
          "uri": "atlas:pds4:mars_2020:perseverance:/mars2020_helicam/data/sol/00649/ids/edr/heli/HSF_0649_0724570000_955ECM_N0370001HELI00002_000085J01.IMG",
          "gather": {
            "common": {
              ...
            },
            "pds_archive": {
              "collection_id": "data",
              "pds_standard": "pds4",
              "related": {
                "supplemental": [],
                "label": {
                  "uri": "atlas:pds4:mars_2020:perseverance:/mars2020_helicam/data/sol/00649/ids/edr/heli/HSF_0649_0724570000_955ECM_N0370001HELI00002_000085J01.xml"
                },
                "browse": {
                  "uri": "atlas:pds4:mars_2020:perseverance:/mars2020_helicam/browse/sol/00649/ids/edr/heli/HSF_0649_0724570000_955ECM_N0370001HELI00002_000085J01.png"
                }
              },
              "file_name": "HSF_0649_0724570000_955ECM_N0370001HELI00002_000085J01.IMG,HSF_0649_0724570000_955EJP_N0370001HELI00002_000085J01.JPG",
              "bundle_id": "mars2020_helicam",
              "product_id": "urn:nasa:pds:mars2020_helicam:data:hsf_0649_0724570000_955ecm_n0370001heli00002_000085j"
            },
            "time": {
              ...
            },
            "uri": "atlas:pds4:mars_2020:perseverance:/mars2020_helicam/data/sol/00649/ids/edr/heli/HSF_0649_0724570000_955ECM_N0370001HELI00002_000085J01.IMG"
          },
          "archive": {
            ...
          },
          ...
        }
      }
    ]
  }
}
```
