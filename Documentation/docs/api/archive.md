---
sidebar_position: 5
---

# Archive

## Querying Atlas IV Archive Files

Atlas IV's file hierarchy is captured entirely in ElasticSearch.

```json title="Archive fields from a sample document"
{
  "uri": "atlas:pds4:mars_2020:perseverance:/mars2020_cachecam_ops_calibrated/browse",
  "archive": {
    "name": "browse",
    "fs_type": "directory",
    "parent_uri": "atlas:pds4:mars_2020:perseverance:/mars2020_cachecam_ops_calibrated"
  }
}
```

- `uri`: Every document is indexed with a `uri`. See [URI](./uri).
- `archive.name`: Name of the file or directory.
- `archive.fs_type`: File system type. Will be either `"file"` or `"directory"`
- `archive.parent_uri`: The core field that links documents together hierarchically.
  - For instance, for this given browse directory, if we wanted to query all the files and directories within, we would query for all documents who have a `parent_uri` as its `uri`.

---

### Files and Directories in /mars2020_cachecam_ops_calibrated

#### Query

```text title="Query"
curl 'https://pds-imaging.jpl.nasa.gov/api/search/atlas/_search?filter_path=hits.hits._source.archive,hits.hits._source.uri,hits.total,aggregations' -H 'accept: application/json' --data-raw '{"query":{"bool":{"must":[{"match":{"archive.parent_uri":"atlas:pds4:mars_2020:perseverance:/mars2020_cachecam_ops_calibrated"}}]}},"sort":[{"archive.name":"asc"}]}'
```

```json title="Body"
{
  "query": {
    "bool": {
      "must": [
        {
          "match": {
            "archive.parent_uri": "atlas:pds4:mars_2020:perseverance:/mars2020_cachecam_ops_calibrated"
          }
        }
      ]
    }
  },
  "sort": [
    {
      "archive.name": "asc"
    }
  ]
}
```

#### Response

File Structure:

/mars2020_cachecam_ops_calibrated

- browse (directory)
- bundle.xml
- data (directory)

```json title="Response"
{
  "hits": {
    "total": { "value": 3, "relation": "eq" },
    "hits": [
      {
        "_source": {
          "uri": "atlas:pds4:mars_2020:perseverance:/mars2020_cachecam_ops_calibrated/browse",
          "archive": {
            "bundle_id": "mars2020_cachecam_ops_calibrated",
            "mission": "mars_2020",
            "updated_at": "2023-02-20T08:21:03-08:00",
            "parent_uri": "atlas:pds4:mars_2020:perseverance:/mars2020_cachecam_ops_calibrated",
            "fs_type": "directory",
            "target": "Mars",
            "uri": "atlas:pds4:mars_2020:perseverance:/mars2020_cachecam_ops_calibrated/browse",
            "spacecraft": "perseverance",
            "name": "browse",
            "pds_standard": "pds4",
            "file_extension": "atlas:pds4:mars_2020:perseverance:/mars2020_cachecam_ops_calibrated/browse",
            "size": 3,
            "instrument": ["cachecam"]
          }
        }
      },
      {
        "_source": {
          "uri": "atlas:pds4:mars_2020:perseverance:/mars2020_cachecam_ops_calibrated/bundle.xml",
          "archive": {
            "md5_updated_at": "2023-03-11T14:08:40-08:00",
            "bundle_id": "mars2020_cachecam_ops_calibrated",
            "mission": "mars_2020",
            "parent_uri": "atlas:pds4:mars_2020:perseverance:/mars2020_cachecam_ops_calibrated",
            "fs_type": "file",
            "target": "Mars",
            "updated_at": "2022-11-09T08:32:05-08:00",
            "uri": "atlas:pds4:mars_2020:perseverance:/mars2020_cachecam_ops_calibrated/bundle.xml",
            "spacecraft": "perseverance",
            "name": "bundle.xml",
            "pds_standard": "pds4",
            "file_extension": "xml",
            "md5": "b95577649a90ad490bcd2c03cadeed02",
            "size": 6896,
            "instrument": ["cachecam"]
          }
        }
      },
      {
        "_source": {
          "uri": "atlas:pds4:mars_2020:perseverance:/mars2020_cachecam_ops_calibrated/data",
          "archive": {
            "bundle_id": "mars2020_cachecam_ops_calibrated",
            "mission": "mars_2020",
            "updated_at": "2023-02-20T08:22:24-08:00",
            "parent_uri": "atlas:pds4:mars_2020:perseverance:/mars2020_cachecam_ops_calibrated",
            "fs_type": "directory",
            "target": "Mars",
            "uri": "atlas:pds4:mars_2020:perseverance:/mars2020_cachecam_ops_calibrated/data",
            "spacecraft": "perseverance",
            "name": "data",
            "pds_standard": "pds4",
            "file_extension": "atlas:pds4:mars_2020:perseverance:/mars2020_cachecam_ops_calibrated/data",
            "size": 3,
            "instrument": ["cachecam"]
          }
        }
      }
    ]
  }
}
```

---

### Files and Directories in /mars2020_cachecam_ops_calibrated/data

We can use the `uri` of the `data` directory from the previous response as the `parent_uri` of the next query:

#### Query

```text title="Query"
curl 'https://pds-imaging.jpl.nasa.gov/api/search/atlas/_search?filter_path=hits.hits._source.archive,hits.hits._source.uri,hits.total,aggregations' -H 'accept: application/json' --data-raw '{"query":{"bool":{"must":[{"match":{"archive.parent_uri":"atlas:pds4:mars_2020:perseverance:/mars2020_cachecam_ops_calibrated/data"}}]}},"sort":[{"archive.name":"asc"}]}'
```

```json title="Body"
{
  "query": {
    "bool": {
      "must": [
        {
          "match": {
            "archive.parent_uri": "atlas:pds4:mars_2020:perseverance:/mars2020_cachecam_ops_calibrated/data"
          }
        }
      ]
    }
  },
  "sort": [
    {
      "archive.name": "asc"
    }
  ]
}
```

#### Response

File Structure:

- collection_data.xml
- collection_data_inventory.csv
- sol (directory)

```json title="Response"
{
  "hits": {
    "total": { "value": 3, "relation": "eq" },
    "hits": [
      {
        "_source": {
          "uri": "atlas:pds4:mars_2020:perseverance:/mars2020_cachecam_ops_calibrated/data/collection_data.xml",
          "archive": {
            "md5_updated_at": "2023-03-11T14:33:31-08:00",
            "collection_id": "data",
            "bundle_id": "mars2020_cachecam_ops_calibrated",
            "mission": "mars_2020",
            "parent_uri": "atlas:pds4:mars_2020:perseverance:/mars2020_cachecam_ops_calibrated/data",
            "fs_type": "file",
            "target": "Mars",
            "updated_at": "2022-11-09T08:41:23-08:00",
            "uri": "atlas:pds4:mars_2020:perseverance:/mars2020_cachecam_ops_calibrated/data/collection_data.xml",
            "spacecraft": "perseverance",
            "name": "collection_data.xml",
            "pds_standard": "pds4",
            "file_extension": "xml",
            "md5": "4d0faa8f657a7948b67fa4f523e13872",
            "size": 7208,
            "instrument": ["cachecam"]
          }
        }
      },
      {
        "_source": {
          "uri": "atlas:pds4:mars_2020:perseverance:/mars2020_cachecam_ops_calibrated/data/collection_data_inventory.csv",
          "archive": {
            "md5_updated_at": "2023-03-11T14:14:22-08:00",
            "collection_id": "data",
            "bundle_id": "mars2020_cachecam_ops_calibrated",
            "mission": "mars_2020",
            "parent_uri": "atlas:pds4:mars_2020:perseverance:/mars2020_cachecam_ops_calibrated/data",
            "fs_type": "file",
            "target": "Mars",
            "updated_at": "2022-11-13T13:13:51-08:00",
            "uri": "atlas:pds4:mars_2020:perseverance:/mars2020_cachecam_ops_calibrated/data/collection_data_inventory.csv",
            "spacecraft": "perseverance",
            "name": "collection_data_inventory.csv",
            "pds_standard": "pds4",
            "file_extension": "csv",
            "md5": "d83b44daacd33125e3f3da643557bd46",
            "size": 316072,
            "instrument": ["cachecam"]
          }
        }
      },
      {
        "_source": {
          "uri": "atlas:pds4:mars_2020:perseverance:/mars2020_cachecam_ops_calibrated/data/sol",
          "archive": {
            "collection_id": "data",
            "bundle_id": "mars2020_cachecam_ops_calibrated",
            "mission": "mars_2020",
            "parent_uri": "atlas:pds4:mars_2020:perseverance:/mars2020_cachecam_ops_calibrated/data",
            "fs_type": "directory",
            "target": "Mars",
            "updated_at": "2023-02-20T08:25:05-08:00",
            "uri": "atlas:pds4:mars_2020:perseverance:/mars2020_cachecam_ops_calibrated/data/sol",
            "spacecraft": "perseverance",
            "name": "sol",
            "pds_standard": "pds4",
            "file_extension": "atlas:pds4:mars_2020:perseverance:/mars2020_cachecam_ops_calibrated/data/sol",
            "size": 20,
            "instrument": ["cachecam"]
          }
        }
      }
    ]
  }
}
```

#### Notes:

- `filter_path=hits.hits._source.archive,hits.hits._source.uri,hits.total,aggregations` in the URL is restricting the returned documents to just a few fields.
  - Leaf node documents have tons of metadata (their full label). Not using `filter_path` may cause some queries with a large set of results to fail.
- Being in Elasticsearch, all fields can be queried upon. See [Elasticsearch 7.10 DSL](https://www.elastic.co/guide/en/elasticsearch/reference/7.10/query-filter-context.html) for query documentation.

---

### Getting Related Files

If you have the `uri` of a browse, label or source product, you can get the related products (i.e. browse from label) via:

#### Query

```text title="Query"
curl 'https://pds-imaging.jpl.nasa.gov/api/search/atlas/_search' -H 'accept: application/json' --data-raw '{"query":{"bool":{"must":[{"query_string":{"query":"atlas\\:pds4\\:mars_2020\\:perseverance\\:\\/mars2020_cachecam_ops_calibrated\\/data\\/sol\\/00088\\/ids\\/rdr\\/cachecam\\/CCF_0088_0674757853_190IDM_N0040048CACH00100_0A10LLJ05.*","default_field":"*uri"}},{"exists":{"field":"gather"}}]}},"size":1,"_source":["uri","gather.pds_archive.related"]}'
```

```json title="Body"
{
  "query": {
    "bool": {
      "must": [
        {
          "query_string": {
            "query": "atlas\\:pds4\\:mars_2020\\:perseverance\\:\\/mars2020_cachecam_ops_calibrated\\/data\\/sol\\/00088\\/ids\\/rdr\\/cachecam\\/CCF_0088_0674757853_190IDM_N0040048CACH00100_0A10LLJ05.*",
            "default_field": "*uri"
          }
        },
        { "exists": { "field": "gather" } }
      ]
    }
  },
  "size": 1,
  "_source": ["uri", "gather.pds_archive.related"]
}
```

#### Response

```json title="Response"
{
  "took": 114,
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
    "max_score": 2,
    "hits": [
      {
        "_index": "atlas",
        "_type": "_doc",
        "_id": "atlas:pds4:mars_2020:perseverance:/mars2020_cachecam_ops_calibrated/data/sol/00088/ids/rdr/cachecam/CCF_0088_0674757853_190IDM_N0040048CACH00100_0A10LLJ05.IMG",
        "_score": 2,
        "_source": {
          "gather": {
            "pds_archive": {
              "related": {
                "label": {
                  "uri": "atlas:pds4:mars_2020:perseverance:/mars2020_cachecam_ops_calibrated/data/sol/00088/ids/rdr/cachecam/CCF_0088_0674757853_190IDM_N0040048CACH00100_0A10LLJ05.xml"
                },
                "browse": {
                  "uri": "atlas:pds4:mars_2020:perseverance:/mars2020_cachecam_ops_calibrated/browse/sol/00088/ids/rdr/cachecam/CCF_0088_0674757853_190IDM_N0040048CACH00100_0A10LLJ05.png"
                }
              }
            }
          },
          "uri": "atlas:pds4:mars_2020:perseverance:/mars2020_cachecam_ops_calibrated/data/sol/00088/ids/rdr/cachecam/CCF_0088_0674757853_190IDM_N0040048CACH00100_0A10LLJ05.IMG"
        }
      }
    ]
  }
}
```
