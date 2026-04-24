---
sidebar_position: 1
---

# Missions and Spacecraft

The `name` fields denote the standardized Atlas IV mission and spacecraft names used in the `uri`.

```json
{
  "missions": [
    {
      "name": "cas",
      "display_name": "Cassini",
      "spacecraft": [
        {
          "name": "cassini_orbiter",
          "display_name": "Cassini Orbiter",
          "pds_standard": "pds4",
          "bundles": ["cassini_iss_cruise"]
        }
      ]
    },
    {
      "name": "clem",
      "display_name": "Clementine",
      "spacecraft": [
        {
          "name": "clementine",
          "display_name": "Clementine",
          "pds_standard": "pds3",
          "tables": []
        }
      ]
    },
    {
      "name": "go",
      "display_name": "Galileo",
      "spacecraft": [
        {
          "name": "galileo_orbiter",
          "display_name": "Galileo",
          "pds_standard": "pds3",
          "tables": []
        }
      ]
    },
    {
      "name": "juno",
      "display_name": "Juno",
      "spacecraft": [
        {
          "name": "juno",
          "display_name": "Juno",
          "pds_standard": "pds3",
          "tables": []
        }
      ]
    },
    {
      "name": "lcro",
      "display_name": "LCROSS",
      "spacecraft": [
        {
          "name": "lcross",
          "display_name": "Lunar Crater Observation and Sensing Satellite",
          "pds_standard": "pds3",
          "tables": []
        }
      ]
    },
    {
      "name": "lo",
      "display_name": "Lunar Orbiter",
      "spacecraft": [
        {
          "name": "lunar_orbiters",
          "display_name": "Lunar Orbiter",
          "pds_standard": "pds3",
          "tables": []
        }
      ]
    },
    {
      "name": "lro",
      "display_name": "Lunar Reconnaissance Orbiter",
      "spacecraft": [
        {
          "name": "lunar_reconnaissance_orbiter",
          "display_name": "Lunar Reconnaissance Orbiter",
          "pds_standard": "pds3",
          "tables": []
        }
      ]
    },
    {
      "name": "ch1",
      "display_name": "Chandrayaan-1",
      "spacecraft": [
        {
          "name": "chandrayaan_1",
          "display_name": "Chandrayaan-1",
          "pds_standard": "pds3",
          "tables": ["m3"]
        }
      ]
    },
    {
      "name": "nyst",
      "display_name": "InSight",
      "spacecraft": [
        {
          "name": "insight_lander",
          "display_name": "InSight Lander",
          "pds_standard": "pds4",
          "bundles": ["insight_cameras"]
        }
      ]
    },
    {
      "name": "mgn",
      "display_name": "Magellan",
      "spacecraft": [
        {
          "name": "magellan",
          "display_name": "Magellan",
          "pds_standard": "pds3",
          "tables": []
        }
      ]
    },
    {
      "name": "m20",
      "display_name": "Mars 2020",
      "spacecraft": [
        {
          "name": "perseverance",
          "display_name": "Perseverance",
          "pds_standard": "pds4",
          "bundles": [
            "m2020_edlcam_raw",
            "mars2020_cachecam_ops_calibrated",
            "mars2020_cachecam_ops_raw",
            "mars2020_edlcam_ops_calibrated",
            "mars2020_edlcam_ops_raw",
            "mars2020_hazcam_ops_calibrated",
            "mars2020_hazcam_ops_mesh",
            "mars2020_hazcam_ops_mosaic",
            "mars2020_hazcam_ops_raw",
            "mars2020_hazcam_ops_stereo",
            "mars2020_imgops",
            "mars2020_mastcamz_ops_calibrated",
            "mars2020_mastcamz_ops_mesh",
            "mars2020_mastcamz_ops_mosaic",
            "mars2020_mastcamz_ops_raw",
            "mars2020_mastcamz_ops_stereo",
            "mars2020_mastcamz_sci_calibrated",
            "mars2020_navcam_ops_calibrated",
            "mars2020_navcam_ops_mesh",
            "mars2020_navcam_ops_mosaic",
            "mars2020_navcam_ops_raw",
            "mars2020_navcam_ops_stereo"
          ]
        },
        {
          "name": "ingenuity",
          "display_name": "Ingenuity",
          "pds_standard": "pds4",
          "bundles": ["mars2020_helicam"]
        }
      ]
    },
    {
      "name": "mer",
      "display_name": "Mars Exploration Rover",
      "spacecraft": [
        {
          "name": "opportunity",
          "aliases": ["merb", "mer1"],
          "display_name": "Opportunity",
          "pds_standard": "pds3",
          "tables": []
        },
        {
          "name": "spirit",
          "aliases": ["mera", "mer2"],
          "display_name": "Spirit",
          "pds_standard": "pds3",
          "tables": []
        }
      ]
    },
    {
      "name": "mess",
      "display_name": "MESSENGER",
      "spacecraft": [
        {
          "name": "messenger",
          "display_name": "MESSENGER",
          "pds_standard": "pds3",
          "tables": []
        }
      ]
    },
    {
      "name": "mex",
      "display_name": "Mars Express",
      "spacecraft": [
        {
          "name": "mexo",
          "display_name": "Mars Express Orbiter",
          "pds_standard": "pds3",
          "tables": []
        },
        {
          "name": "beagle_2",
          "display_name": "Beagle 2",
          "pds_standard": "pds3",
          "tables": []
        }
      ]
    },
    {
      "name": "mgs",
      "display_name": "Mars Global Surveyor",
      "spacecraft": [
        {
          "name": "mars_global_surveyor",
          "display_name": "Mars Global Surveyor",
          "pds_standard": "pds3",
          "tables": []
        }
      ]
    },
    {
      "name": "mpf",
      "display_name": "Mars Pathfinder",
      "spacecraft": [
        {
          "name": "csms",
          "display_name": "Carl Sagan Memorial Station",
          "pds_standard": "pds3",
          "tables": []
        },
        {
          "name": "sojourner",
          "display_name": "Sojourner",
          "pds_standard": "pds3",
          "tables": []
        }
      ]
    },
    {
      "name": "mro",
      "display_name": "Mars Reconnaissance Orbiter",
      "spacecraft": [
        {
          "name": "mars_reconnaissance_orbiter",
          "display_name": "Mars Reconnaissance Orbiter",
          "pds_standard": "pds3",
          "volumes": ["MROHR_0001"]
        }
      ]
    },
    {
      "name": "msl",
      "display_name": "Mars Science Laboratory",
      "spacecraft": [
        {
          "name": "curiosity",
          "display_name": "Curiosity",
          "pds_standard": "pds3",
          "volumes": [
            "MSLHAZ_0XXX",
            "MSLMHL_0010",
            "MSLMHL_0021",
            "MSLMHL_0031",
            "MSLMRD_0009",
            "MSLMRD_0020",
            "MSLMRD_0031",
            "MSLMST_0010",
            "MSLMST_0021",
            "MSLHAZ_1XXX",
            "MSLMHL_0011",
            "MSLMHL_0022",
            "MSLMHL_0032",
            "MSLMRD_0010",
            "MSLMRD_0021",
            "MSLMRD_0032",
            "MSLMST_0011",
            "MSLMST_0022",
            "MSLMST_0032",
            "MSLMHL_0001",
            "MSLMHL_0012",
            "MSLMHL_0023",
            "MSLMOS_1XXX",
            "MSLMRD_0011",
            "MSLMRD_0022",
            "MSLMST_0001",
            "MSLMST_0012",
            "MSLMST_0023",
            "MSLNAV_0XXX",
            "MSLMHL_0002",
            "MSLMHL_0013",
            "MSLMRD_0001",
            "MSLMRD_0012",
            "MSLMRD_0023",
            "MSLMST_0002",
            "MSLMST_0013",
            "MSLMST_0024",
            "MSLNAV_1XXX",
            "MSLMHL_0003",
            "MSLMHL_0014",
            "MSLMHL_0024",
            "MSLMRD_0002",
            "MSLMRD_0013",
            "MSLMRD_0024",
            "MSLMST_0003",
            "MSLMST_0014",
            "MSLMST_0025",
            "MSLPLC_1XXX",
            "MSLMHL_0004",
            "MSLMHL_0015",
            "MSLMHL_0025",
            "MSLMRD_0003",
            "MSLMRD_0014",
            "MSLMRD_0025",
            "MSLMST_0004",
            "MSLMST_0015",
            "MSLMST_0026",
            "MSLMHL_0005",
            "MSLMHL_0016",
            "MSLMHL_0026",
            "MSLMRD_0004",
            "MSLMRD_0015",
            "MSLMRD_0026",
            "MSLMST_0005",
            "MSLMST_0016",
            "MSLMST_0027",
            "MSLMHL_0006",
            "MSLMHL_0017",
            "MSLMHL_0027",
            "MSLMRD_0005",
            "MSLMRD_0016",
            "MSLMRD_0027",
            "MSLMST_0006",
            "MSLMST_0017",
            "MSLMST_0028",
            "MSLMHL_0007",
            "MSLMHL_0018",
            "MSLMHL_0028",
            "MSLMRD_0006",
            "MSLMRD_0017",
            "MSLMRD_0028",
            "MSLMST_0007",
            "MSLMST_0018",
            "MSLMST_0029",
            "MSLMHL_0008",
            "MSLMHL_0019",
            "MSLMHL_0029",
            "MSLMRD_0007",
            "MSLMRD_0018",
            "MSLMRD_0029",
            "MSLMST_0008",
            "MSLMST_0019",
            "MSLMST_0030",
            "MSLMHL_0009",
            "MSLMHL_0020",
            "MSLMHL_0030",
            "MSLMRD_0008",
            "MSLMRD_0019",
            "MSLMRD_0030",
            "MSLMST_0009",
            "MSLMST_0020",
            "MSLMST_0031"
          ]
        }
      ]
    },
    {
      "name": "nh",
      "display_name": "New Horizons",
      "spacecraft": [
        {
          "name": "new_horizons",
          "display_name": "New Horizons",
          "pds_standard": "pds3",
          "tables": []
        }
      ]
    },
    {
      "name": "ody",
      "display_name": "2001 Mars Odyssey",
      "spacecraft": [
        {
          "name": "2001_mars_odyssey",
          "display_name": "2001 Mars Odyssey",
          "pds_standard": "pds3",
          "tables": []
        }
      ]
    },
    {
      "name": "phx",
      "display_name": "Mars Phoenix",
      "spacecraft": [
        {
          "name": "phoenix_lander",
          "display_name": "Mars Phoenix Lander",
          "pds_standard": "pds3",
          "tables": []
        }
      ]
    },
    {
      "name": "vik",
      "display_name": "Viking",
      "spacecraft": [
        {
          "name": "viking_orbiter_1",
          "display_name": "Viking Orbiter 1",
          "pds_standard": "pds3",
          "tables": []
        },
        {
          "name": "viking_lander_1",
          "display_name": "Viking Lander 1",
          "pds_standard": "pds3",
          "tables": []
        },
        {
          "name": "viking_orbiter_2",
          "display_name": "Viking Orbiter 2",
          "pds_standard": "pds3",
          "tables": []
        },
        {
          "name": "viking_lander_2",
          "display_name": "Viking Lander 2",
          "pds_standard": "pds3",
          "tables": []
        },
        {
          "name": "viking_orbiters",
          "display_name": "Viking Orbiters",
          "pds_standard": "pds3",
          "tables": []
        }
      ]
    },
    {
      "name": "vgr",
      "display_name": "Voyager",
      "spacecraft": [
        {
          "name": "voyager_1",
          "display_name": "Voyager 1",
          "pds_standard": "pds3",
          "tables": []
        },
        {
          "name": "voyager_2",
          "display_name": "Voyager 2",
          "pds_standard": "pds3",
          "tables": []
        },
        {
          "name": "voyager",
          "display_name": "Voyager",
          "pds_standard": "pds3",
          "tables": []
        }
      ]
    }
  ]
}
```
