import React, { useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useHistory } from 'react-router-dom'
import PropTypes from 'prop-types'

import { makeStyles, useTheme } from '@material-ui/core/styles'
import useMediaQuery from '@material-ui/core/useMediaQuery'
import withWidth from '@material-ui/core/withWidth'

import { getIn, getPDSUrl, prettify, getExtension } from '../../../../../core/utils.js'
import { HASH_PATHS, ES_PATHS, IMAGE_EXTENSIONS } from '../../../../../core/constants.js'

import MenuItem from '@material-ui/core/MenuItem'
import Select from '@material-ui/core/Select'
import FormControl from '@material-ui/core/FormControl'

import OpenSeadragonViewer from '../../../../../components/OpenSeadragonViewer/OpenSeadragonViewer'
import ThreeViewer from '../../../../../components/ThreeViewer/ThreeViewer'

const useStyles = makeStyles((theme) => ({
    Overview: {
        width: '100%',
        height: '100%',
        background: theme.palette.swatches.grey.grey900,
        color: theme.palette.swatches.grey.grey150,
        display: 'flex',
        [theme.breakpoints.down('sm')]: {
            flexFlow: 'column',
        },
    },
    viewer: {
        height: '100%',
        flex: 1,
        [theme.breakpoints.down('sm')]: {
            minHeight: '60%',
            flex: 'unset',
            height: 'unset',
        },
    },
    fields: {
        width: '480px',
        height: '100%',
        boxSizing: 'border-box',
        overflowY: 'auto',
        background: '#101013',
        borderLeft: `1px solid ${theme.palette.swatches.grey.grey700}`,
        padding: '0px 0px 32px 0px',
        [theme.breakpoints.down('sm')]: {
            width: '100%',
            borderLeft: 'none',
            borderTop: `2px solid ${theme.palette.swatches.grey.grey900}`,
        },
    },
    /*
    fieldList: {
        listStyleType: 'none',
        margin: 0,
        padding: 0,
        fontSize: '14px',
        color: theme.palette.text.primary,
    },
    fieldLi: {
        display: 'flex',
        justifyContent: 'space-between',
        lineHeight: `${theme.headHeights[3]}px`,
        border: `1px solid ${theme.palette.swatches.grey.grey200}`,
        padding: '0px 8px 0px 16px',
        margin: '5px 0px',
        background: 'white',
    },
    */
    fieldList: {
        'listStyleType': 'none',
        'margin': `0px`,
        'padding': '0px',
        '& > li': {
            'display': 'flex',
            'justifyContent': 'space-between',
            'lineHeight': '24px',
            'padding': '4px 8px',
            'transition': 'max-height 0.3s ease-in',
            'wordBreak': 'break-all',
            '& > div:last-child': {
                whiteSpace: 'inherit',
            },
        },
        '& > li:nth-child(odd)': {
            background: theme.palette.swatches.grey.grey700,
        },
    },
    fieldName: {
        marginRight: '16px',
        textTransform: 'uppercase',
        color: theme.palette.swatches.grey.grey300,
        fontSize: '12px',
    },
    fieldValue: {
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
        textAlign: 'right',
        flex: '1',
    },
    formControl: {
        minWidth: 125,
        margin: '5px 0px 3px 8px',
    },
    select: {
        'color': theme.palette.swatches.grey.grey300,
        'background': theme.palette.swatches.grey.grey800,
        'border-bottom': `2px solid ${theme.palette.swatches.grey.grey600}`,
        'paddingLeft': '4px',
        '& > div:first-child': {
            padding: '8px 20px 6px 6px',
            textAlign: 'left',
        },
        '& > svg': {
            color: '#efefef',
            top: '4px',
            right: '2px',
        },
    },
    versionSelectItem: {},
    heading: {
        fontSize: '14px',
        lineHeight: '32px',
        fontWeight: 'bold',
        color: theme.palette.swatches.grey.grey100,
        textTransform: 'uppercase',
        padding: '4px 8px 4px 8px',
    },
}))

const fields = [
    'gather.pds_archive.bundle_id',
    'gather.pds_archive.collection_id',
    'gather.pds_archive.data_set_id',
    'gather.pds_archive.file_name',
    'gather.common.instrument',
    'gather.common.latitude',
    'pds4_label.lidvid',
    'gather.common.longitude',
    'gather.common.mission',
    'gather.pds_archive.pds_standard',
    'gather.time.product_creation_time',
    'gather.pds_archive.product_id',
    'gather.common.product_type',
    'gather.common.spacecraft',
    'gather.time.spacecraft_clock_start_count',
    'gather.time.start_time',
    'gather.time.stop_time',
    'gather.common.target',
    'uri',
    'pds4_label.pds:Identification_Area/pds:version_id',
    'gather.pds_archive.volume_id',
]

const Overview = (props) => {
    const { recordData, versions, activeVersion } = props
    const c = useStyles()
    const history = useHistory()
    const theme = useTheme()
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'))

    const release_id = getIn(recordData, ES_PATHS.release_id)

    const browse_uri = getIn(recordData, ES_PATHS.browse)
    const uri = getIn(recordData, ES_PATHS.source)
    const supplemental = getIn(recordData, ES_PATHS.supplemental)

    let imgURL = getPDSUrl(browse_uri, release_id)

    let type = getExtension(imgURL, true)
    if (!IMAGE_EXTENSIONS.includes(type)) {
        imgURL = getPDSUrl(uri, release_id)
        type = getExtension(imgURL, true)
    }

    let Viewer
    switch (type) {
        case 'obj':
            Viewer = (
                <ThreeViewer url={imgURL} release_id={release_id} supplemental={supplemental} />
            )
            break
        default:
            Viewer = (
                <OpenSeadragonViewer
                    image={{
                        src: imgURL,
                    }}
                    settings={{ defaultZoomLevel: 0.5 }}
                />
            )
    }

    const pds_standard = getIn(recordData, ES_PATHS.pds_standard)

    return (
        <div className={c.Overview}>
            <div className={c.viewer}>{Viewer}</div>
            <div className={c.fields}>
                <div className={c.heading}>Overview Fields</div>
                <ul className={c.fieldList}>
                    {fields.map((field, idx) => {
                        const split = field.split('.')
                        const name = prettify(split[split.length - 1])
                        let value = getIn(recordData, field)
                        if (name == null || value == null) return
                        if (typeof value != 'string' && value.length != null)
                            value = value.join(', ')

                        let versionSelector = null
                        if (
                            pds_standard === 'pds4' &&
                            field.toLowerCase().endsWith('version_id') &&
                            versions.length > 0
                        ) {
                            versionSelector = (
                                <div>
                                    <FormControl className={c.formControl} size="small">
                                        <Select
                                            className={c.select}
                                            onChange={(e) => {
                                                history.push(
                                                    `${HASH_PATHS.record}?uri=${
                                                        versions[e.target.value].uri
                                                    }`
                                                )
                                            }}
                                            value={activeVersion == null ? '' : activeVersion}
                                        >
                                            {versions.map((v, idx) => {
                                                return (
                                                    <MenuItem
                                                        className={c.versionSelectItem}
                                                        key={idx}
                                                        value={idx}
                                                    >
                                                        <div>{v.version}</div>
                                                    </MenuItem>
                                                )
                                            })}
                                        </Select>
                                    </FormControl>
                                </div>
                            )
                        }

                        return (
                            <li className={c.fieldLi} key={idx}>
                                <div className={c.fieldName}>{name}</div>
                                <div className={c.fieldValue}>{versionSelector || value}</div>
                            </li>
                        )
                    })}
                </ul>
            </div>
        </div>
    )
}

Overview.propTypes = {
    recordData: PropTypes.object,
}

export default withWidth()(Overview)
