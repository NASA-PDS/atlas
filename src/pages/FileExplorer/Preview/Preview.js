import React, { useState, useEffect, version } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useHistory } from 'react-router-dom'
import PropTypes from 'prop-types'

import clsx from 'clsx'
import axios from 'axios'

import {
    getIn,
    getHeader,
    getExtension,
    prettify,
    humanFileSize,
    getPDSUrl,
    getFilename,
    copyToClipboard,
} from '../../../core/utils'

import {
    updateFilexColumn,
    goToFilexURI,
    addToCart,
    setSnackBarText,
} from '../../../core/redux/actions/actions'
import { ES_PATHS, HASH_PATHS, IMAGE_EXTENSIONS, domain, endpoints } from '../../../core/constants'
import { streamDownloadFile } from '../../../core/downloaders/ZipStream.js'

import ProductIcons from '../../../components/ProductIcons/ProductIcons'

import Typography from '@material-ui/core/Typography'
import Divider from '@material-ui/core/Divider'
import IconButton from '@material-ui/core/IconButton'
import Tooltip from '@material-ui/core/Tooltip'
import Button from '@material-ui/core/Button'

import PageviewIcon from '@material-ui/icons/Pageview'
import GetAppIcon from '@material-ui/icons/GetApp'
import AddShoppingCartIcon from '@material-ui/icons/AddShoppingCart'
import LinkIcon from '@material-ui/icons/Link'
import LaunchIcon from '@material-ui/icons/Launch'
import ArrowBackIcon from '@material-ui/icons/ArrowBack'
import ArrowForwardIcon from '@material-ui/icons/ArrowForward'
import WarningIcon from '@material-ui/icons/Warning'

import MenuItem from '@material-ui/core/MenuItem'
import Select from '@material-ui/core/Select'
import FormControl from '@material-ui/core/FormControl'

import Image from 'material-ui-image'

import { makeStyles } from '@material-ui/core/styles'

import './Preview.css'

const useStyles = makeStyles((theme) => ({
    Preview: {
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        boxSizing: 'border-box',
        boxShadow: '0px 0px 6px 0px rgba(0,0,0,0.4)',
        display: 'flex',
        flexFlow: 'column',
        background: theme.palette.swatches.grey.grey800,
        color: theme.palette.swatches.grey.grey150,
        zIndex: 2,
    },
    PreviewMobile: {
        zIndex: 999,
        display: 'flex',
        flexFlow: 'column',
        borderLeft: 'none',
        background: theme.palette.swatches.grey.grey800,
        color: theme.palette.swatches.grey.grey150,
    },
    header: {
        width: '100%',
        boxSizing: 'border-box',
        boxShadow: '0px 1px 2px 0px rgba(0,0,0,0.19)',
        background: theme.palette.swatches.grey.grey700,
    },
    headerMobile: {
        width: '100%',
        display: 'flex',
        justifyContent: 'center',
        boxSizing: 'border-box',
        background: theme.palette.swatches.grey.grey700,
    },
    headerTitle: {},
    headerBanner: {
        'fontSize': '15px',
        'padding': '6px',
        'background': theme.palette.swatches.orange.orange600,
        'color': 'rgba(0,0,0,0.6)',
        'fontWeight': 'bold',
        'display': 'flex',
        'justifyContent': 'space-between',
        'cursor': 'pointer',
        '& > div': {
            display: 'flex',
        },
        '& > div > div': {
            paddingLeft: '5px',
        },
    },
    icon: {
        fontSize: '24px',
    },
    iconMobile: {
        fontSize: '30px',
        padding: '5px',
    },
    title: {
        fontSize: '18px',
        fontWeight: 'bold',
        margin: '8px 8px 0px 8px',
        fontFamily: 'inherit',
        wordBreak: 'break-all',
    },
    titleMobile: {
        fontSize: '16px',
        margin: '0px',
        fontFamily: 'inherit',
        lineHeight: `${theme.headHeights[2]}px`,
    },
    headerRight: {
        flex: 1,
        display: 'flex',
        justifyContent: 'space-between',
    },
    button: {
        'width': `${theme.headHeights[2]}px`,
        'height': `${theme.headHeights[2]}px`,
        'color': theme.palette.swatches.blue.blue400,
        '&:hover': {
            background: 'rgba(255,255,255,0.1)',
        },
        '&.Mui-disabled': {
            color: theme.palette.swatches.grey.grey400,
            cursor: 'not-allowed',
        },
    },
    buttonMobile: {
        width: `${theme.headHeights[2]}px`,
        height: `${theme.headHeights[2]}px`,
    },
    buttonIcon: {},
    body: {
        flex: 1,
        overflowY: 'auto',
        overflowX: 'hidden',
    },
    bodyInner: {
        padding: '16px 0px',
    },
    bodyMobile: {},
    properties: {},
    heading: {
        fontSize: '14px',
        lineHeight: '30px',
        color: theme.palette.swatches.yellow.yellow500,
        textTransform: 'uppercase',
        padding: '0px 16px 4px 16px',
    },
    sectionBody: {
        marginBottom: '20px',
    },
    relatedList: {
        'listStyleType': 'none',
        'margin': `4px 0px 0px 0px`,
        'padding': '0px 16px',
        '& > li': {
            lineHeight: '24px',
            marginBottom: '8px',
            display: 'flex',
            justifyContent: 'flex-start',
        },
    },
    relatedGroup: {
        textTransform: 'uppercase',
        lineHeight: '28px',
        width: '70px',
        color: theme.palette.swatches.grey.grey300,
    },
    relatedLinks: {
        display: 'flex',
        justifyContent: 'flex-start',
        flex: '1',
    },
    relatedItem: {},
    relatedButton: {
        'background': theme.palette.swatches.grey.grey700,
        'color': theme.palette.swatches.blue.blue400,
        'marginLeft': '4px',
        '&:hover': {
            border: `1px solid ${theme.palette.swatches.grey.grey600}`,
        },
        '& .MuiButton-label': {
            lineHeight: '20px',
        },
        '& .MuiButton-endIcon': {
            marginLeft: '6px',
        },
        '& .MuiButton-endIcon > svg': {
            fontSize: '14px',
        },
    },
    propertiesList: {
        'listStyleType': 'none',
        'margin': `0px`,
        'padding': '0px',
        '& > li': {
            'display': 'flex',
            'justifyContent': 'space-between',
            'lineHeight': '24px',
            'padding': '2px 16px',
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
    key: {
        marginRight: '16px',
        textTransform: 'uppercase',
        color: theme.palette.swatches.grey.grey300,
        fontSize: '12px',
    },
    value: {
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
        textAlign: 'right',
        flex: '1',
    },
    image: {
        width: '100%',
        height: '400px',
        position: 'relative',
        cursor: 'pointer',
        overflow: 'hidden',
        borderTop: `1px solid ${theme.palette.swatches.grey.grey700}`,
        borderBottom: `1px solid ${theme.palette.swatches.grey.grey700}`,
    },
    previewImage: {
        'overflow': 'hidden',
        'position': 'static !important',
        'objectFit': 'cover !important',
        'transition': 'filter 0.15s ease-in-out !important',
        '&:hover': {
            filter: 'brightness(1.25)',
        },
    },
    imageCover: {
        position: 'absolute',
        pointerEvents: 'none',
        top: 0,
        width: '100%',
        height: '100%',
        boxShadow: 'inset 0px 1px 6px 1px rgba(0,0,0,0.16)',
    },
    imageless: {
        'width': '100%',
        'height': '100%',
        'poisition': 'relative',
        '& > div': {
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translateX(-50%) translateY(-50%)',
        },
    },
    description: {},
    navHeader: {
        'height': `${theme.headHeights[2]}px`,
        'minHeight': `${theme.headHeights[2]}px`,
        'background': theme.palette.swatches.grey.grey700,
        'boxSizing': 'border-box',
        'display': 'flex',
        'justifyContent': 'space-between',
        'borderBottom': `1px solid ${theme.palette.swatches.grey.grey900}`,
        '& > div': {
            display: 'flex',
            justifyContent: 'space-between',
        },
        '& > div:last-child': {
            flex: 1,
        },
    },
    backButton: {
        lineHeight: '28px',
        borderRadius: 0,
        color: theme.palette.swatches.grey.grey150,
    },
    emptyPreview: {
        textAlign: 'center',
        margin: `${theme.spacing(10)}px 0px`,
        color: theme.palette.swatches.grey.grey500,
        fontSize: '16px',
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
}))

const ButtonBar = (props) => {
    const { isMobile, preview, related } = props
    const c = useStyles()
    const dispatch = useDispatch()
    const history = useHistory()

    let iconSize = isMobile ? 'inherit' : 'inherit'

    return (
        <div className={c.buttonBar}>
            <Tooltip title="View" arrow>
                <span>
                    <IconButton
                        className={clsx(c.button, { [c.buttonMobile]: isMobile })}
                        aria-label="view"
                        disabled={
                            preview.fs_type !== 'file' || related == null || related.uri == null
                        }
                        onClick={() => {
                            if (related && related.uri)
                                history.push(`${HASH_PATHS.record}?uri=${related.uri}&back=page`)
                        }}
                    >
                        <PageviewIcon className={c.buttonIcon} fontSize={iconSize} />
                    </IconButton>
                </span>
            </Tooltip>
            <Tooltip title="Open" arrow>
                <span>
                    <IconButton
                        className={clsx(c.button, { [c.buttonMobile]: isMobile })}
                        aria-label="open"
                        disabled={preview.fs_type !== 'file'}
                        onClick={() => {
                            if (preview.uri)
                                window.open(
                                    getPDSUrl(preview.uri, getIn(preview, ES_PATHS.release_id)),
                                    '_blank'
                                )
                        }}
                    >
                        <LaunchIcon className={c.buttonIcon} fontSize={iconSize} />
                    </IconButton>
                </span>
            </Tooltip>
            <Tooltip title="Download" arrow>
                <span>
                    <IconButton
                        className={clsx(c.button, { [c.buttonMobile]: isMobile })}
                        aria-label="quick download"
                        disabled={preview.fs_type !== 'file'}
                        onClick={() => {
                            if (preview.uri != null) {
                                streamDownloadFile(
                                    getPDSUrl(preview.uri, getIn(preview, ES_PATHS.release_id)),
                                    getFilename(preview.uri)
                                )
                            }
                        }}
                    >
                        <GetAppIcon className={c.buttonIcon} fontSize={iconSize} />
                    </IconButton>
                </span>
            </Tooltip>
            <Tooltip title="Add to Cart" arrow>
                <span>
                    <IconButton
                        className={clsx(c.button, {
                            [c.buttonMobile]: isMobile,
                        })}
                        aria-label="add to cart"
                        disabled={preview.fs_type !== 'file' && preview.fs_type !== 'directory'}
                        onClick={() => {
                            dispatch(
                                addToCart(preview.fs_type === 'directory' ? 'directory' : 'file', {
                                    uri: preview.uri,
                                    related: related,
                                    size: preview.size,
                                    release_id: getIn(preview, ES_PATHS.release_id),
                                })
                            )
                            dispatch(setSnackBarText('Added to Cart!', 'success'))
                        }}
                    >
                        <AddShoppingCartIcon size="small" />
                    </IconButton>
                </span>
            </Tooltip>
        </div>
    )
}

const Preview = (props) => {
    const { isMobile, showMobilePreview, setShowMobilePreview, forcedPreview } = props

    const c = useStyles()
    const history = useHistory()

    const dispatch = useDispatch()

    const [related, setRelated] = useState(null)
    const [versions, setVersions] = useState([])
    const [activeVersion, setActiveVersion] = useState(null)

    let preview = useSelector((state) => {
        const filexPreview = state.get('filexPreview')
        return typeof filexPreview.toJS === 'function' ? {} : filexPreview
    })
    preview = forcedPreview || preview

    useEffect(() => {
        // Query Related
        if (preview.uri && preview.fs_type === 'file') {
            let uri = preview.uri
            uri = uri
                .replaceAll('/', '\\/')
                .replaceAll(':', '\\:')
                .replace(/\.[^/.]+$/, '')
            const dsl = {
                query: {
                    bool: {
                        must: [
                            { query_string: { query: `${uri}.*`, default_field: '*uri' } },
                            { exists: { field: 'gather.common' } },
                        ],
                    },
                },
                size: 1,
                _source: ['uri', 'gather.pds_archive.related', ES_PATHS.release_id.join('.')],
                sort: [{ [ES_PATHS.release_id.join('.')]: 'desc' }],
                collapse: {
                    field: 'uri',
                },
            }

            axios
                .post(`${domain}${endpoints.search}`, dsl, getHeader())
                .then((response) => {
                    const hit = response?.data?.hits?.hits?.[0]?._source
                    if (hit) setRelated(hit)
                    else setRelated(null)
                })
                .catch((err) => {
                    setRelated(null)
                })
        } else {
            setRelated(null)
        }

        // Query Versions (Current PDS4 specific)
        if (preview.uri && preview.fs_type === 'file' && preview.lidvid) {
            let [lid, vid] = preview.lidvid.split('::')
            lid = lid
                .replaceAll('/', '\\/')
                .replaceAll(':', '\\:')
                .replace(/\.[^/.]+$/, '')
            const dsl = {
                query: {
                    bool: {
                        must: [
                            {
                                regexp: {
                                    [ES_PATHS.pds4_label.lidvid.join('.')]: {
                                        value: `${lid}.*`,
                                    },
                                },
                            },
                        ],
                    },
                },
                _source: [
                    'uri',
                    ES_PATHS.pds4_label.lidvid.join('.'),
                    ES_PATHS.release_id.join('.'),
                ],
            }

            axios
                .post(`${domain}${endpoints.search}`, dsl, getHeader())
                .then((response) => {
                    const nextVersions = []
                    if (response?.data?.hits?.hits?.[0] != null) {
                        response.data.hits.hits.forEach((r) => {
                            if (r._source?.pds4_label?.lidvid != null) {
                                let [rlid, rvid] = r._source.pds4_label.lidvid.split('::')
                                nextVersions.push({
                                    uri: r._source.uri,
                                    name: r._source.uri.split('/').pop(),
                                    version: `Version ${rvid}`,
                                    versionRaw: rvid,
                                    versionNum: parseFloat(rvid),
                                })
                            }
                        })
                        nextVersions.sort(function (a, b) {
                            return b.versionNum - a.versionNum
                        })
                    }

                    if (nextVersions.length > 0) {
                        const [flid, fvid] = preview.lidvid.split('::')
                        for (let i = 0; i < nextVersions.length; i++) {
                            if (nextVersions[i].versionRaw == fvid) {
                                setActiveVersion(i)
                                break
                            }
                        }
                    }

                    setVersions(nextVersions)
                })
                .catch((err) => {
                    setVersions([])
                })
        } else {
            setVersions([])
        }
    }, [JSON.stringify(preview)])

    if (!showMobilePreview && isMobile && (preview == null || preview.fs_type != 'file'))
        return null

    let imageUrl = 'null'
    const browseUri = getIn(related, 'gather.pds_archive.related.browse.uri')
    const release_id = getIn(related, ES_PATHS.release_id)

    if (browseUri && IMAGE_EXTENSIONS.includes(getExtension(browseUri)))
        imageUrl = getPDSUrl(browseUri, release_id, 'md')

    if (Object.keys(preview).length == 0) {
        return (
            <div className={c.Preview}>
                <div className={c.emptyPreview}>No File Object Selected</div>
            </div>
        )
    }

    return (
        <div className={clsx(c.Preview, { [c.PreviewMobile]: isMobile, ['fade-in']: isMobile })}>
            {isMobile && (
                <>
                    <div className={clsx(c.navHeader)}>
                        <div>
                            <IconButton
                                className={c.backButton}
                                aria-label="back"
                                onClick={() => {
                                    if (showMobilePreview && setShowMobilePreview)
                                        setShowMobilePreview(false)
                                    // If preview was not forced (i.e. a final file)
                                    if (!showMobilePreview)
                                        dispatch(
                                            updateFilexColumn(null, {
                                                removePreview: true,
                                                active: null,
                                            })
                                        )
                                }}
                            >
                                <ArrowBackIcon fontSize="small" />
                            </IconButton>
                        </div>
                        <div>
                            <Typography
                                noWrap
                                className={c.titleMobile}
                                title={preview.key}
                                variant="h5"
                            >
                                {preview.key}
                            </Typography>
                        </div>
                    </div>

                    {activeVersion != 0 && activeVersion != null && versions.length > 0 ? (
                        <div
                            className={c.headerBanner}
                            aria-label="go to latest version"
                            onClick={() => {
                                dispatch(goToFilexURI(versions[0].uri))
                            }}
                        >
                            <div>
                                <WarningIcon fontSize="small" />
                                <div>A newer version of this data product is available.</div>
                            </div>
                            <ArrowForwardIcon fontSize="small" />
                        </div>
                    ) : null}
                </>
            )}
            {!isMobile && (
                <div className={c.header}>
                    <div className={c.headerTitle}>
                        <div>
                            <Typography className={c.title} title={preview.key} variant="h5">
                                {preview.key}
                            </Typography>
                        </div>
                    </div>
                    <div className={c.headerRight}>
                        <ButtonBar preview={preview} related={related} />
                    </div>
                    {activeVersion != 0 && activeVersion != null && versions.length > 0 ? (
                        <div
                            className={c.headerBanner}
                            aria-label="go to latest version"
                            onClick={() => {
                                dispatch(goToFilexURI(versions[0].uri))
                            }}
                        >
                            <div>
                                <WarningIcon fontSize="small" />
                                <div>A newer version of this data product is available.</div>
                            </div>
                            <ArrowForwardIcon fontSize="small" />
                        </div>
                    ) : null}
                </div>
            )}
            <div className={clsx(c.body, { [c.bodyMobile]: isMobile })}>
                <div
                    className={c.image}
                    style={imageUrl == 'null' ? { height: '100px' } : {}}
                    onClick={() => {
                        if (imageUrl != null && preview.uri)
                            history.push(`${HASH_PATHS.record}?uri=${preview.uri}&back=page`)
                    }}
                >
                    {imageUrl != 'null' ? (
                        <Image
                            className={c.previewImage}
                            style={{
                                height: '100%',
                                paddingTop: 'unset',
                                position: 'initial',
                                background:
                                    'radial-gradient(ellipse, rgb(46, 46, 50), rgb(10, 10, 10))',
                            }}
                            disableSpinner={false}
                            animationDuration={1200}
                            src={imageUrl}
                            alt={imageUrl}
                            errorIcon={<ProductIcons filename={imageUrl} type={preview.fs_type} />}
                        />
                    ) : (
                        <div className={c.imageless}>
                            <ProductIcons filename={imageUrl} type={preview.fs_type} />
                        </div>
                    )}
                    <div className={c.imageCover}></div>
                </div>
                {isMobile && (
                    <div className={c.headerMobile}>
                        <div className={c.headerTop}>
                            <ButtonBar preview={preview} related={related} isMobile={true} />
                        </div>
                    </div>
                )}
                <div className={c.bodyInner}>
                    {/*
                        <div className={c.description}>
                            <div className={c.heading}>
                                <Typography noWrap className={c.title2} variant="subtitle2">
                                    Description
                                </Typography>
                                <Divider />
                            </div>
                            <div className={c.sectionBody}>
                                <Typography>
                                    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce
                                    volutpat mi tincidunt nisi gravida tincidunt. Pellentesque a mattis
                                    purus. Sed rutrum, lectus at aliquet dapibus, ligula risus aliquet
                                    mi, id efficitur ex nulla quis augue. Fusce ultrices lectus in dui
                                    scelerisque maximus. Quisque id tristique arcu.
                                </Typography>
                            </div>
                        </div>
                    */}

                    {related && (
                        <div className={c.related}>
                            <div className={c.heading}>
                                <Typography noWrap className={c.title2} variant="subtitle2">
                                    Related
                                </Typography>
                                <Divider />
                            </div>
                            <div className={c.sectionBody}>
                                <ul className={c.relatedList}>
                                    {getIn(related, 'uri') && (
                                        <li>
                                            <div className={c.relatedGroup}>Product</div>

                                            <div className={c.relatedLinks}>
                                                <div className={c.relatedItem}>
                                                    <Button
                                                        className={c.relatedButton}
                                                        size="small"
                                                        variant="outlined"
                                                        endIcon={
                                                            <LaunchIcon className={c.buttonIcon} />
                                                        }
                                                        onClick={() => {
                                                            const uri = getIn(related, 'uri')
                                                            const release_id = getIn(
                                                                related,
                                                                ES_PATHS.release_id
                                                            )
                                                            if (uri)
                                                                window.open(
                                                                    getPDSUrl(uri, release_id),
                                                                    '_blank'
                                                                )
                                                        }}
                                                    >
                                                        {getExtension(getIn(related, 'uri'))}
                                                    </Button>
                                                </div>
                                            </div>
                                        </li>
                                    )}
                                    {getIn(related, 'gather.pds_archive.related.label.uri') && (
                                        <li>
                                            <div className={c.relatedGroup}>Label</div>

                                            <div className={c.relatedLinks}>
                                                <div className={c.relatedItem}>
                                                    <Button
                                                        className={c.relatedButton}
                                                        size="small"
                                                        variant="outlined"
                                                        endIcon={
                                                            <LaunchIcon className={c.buttonIcon} />
                                                        }
                                                        onClick={() => {
                                                            const uri = getIn(
                                                                related,
                                                                'gather.pds_archive.related.label.uri'
                                                            )
                                                            const release_id = getIn(
                                                                related,
                                                                ES_PATHS.release_id
                                                            )
                                                            if (uri)
                                                                window.open(
                                                                    getPDSUrl(uri, release_id),
                                                                    '_blank'
                                                                )
                                                        }}
                                                    >
                                                        {getExtension(
                                                            getIn(
                                                                related,
                                                                'gather.pds_archive.related.label.uri'
                                                            )
                                                        )}
                                                    </Button>
                                                </div>
                                            </div>
                                        </li>
                                    )}
                                    {getIn(related, 'gather.pds_archive.related.browse.uri') && (
                                        <li>
                                            <div className={c.relatedGroup}>Browse</div>
                                            <div className={c.relatedLinks}>
                                                <Button
                                                    className={c.relatedButton}
                                                    size="small"
                                                    variant="outlined"
                                                    endIcon={
                                                        <LaunchIcon className={c.buttonIcon} />
                                                    }
                                                    onClick={() => {
                                                        const uri = getIn(
                                                            related,
                                                            'gather.pds_archive.related.browse.uri'
                                                        )
                                                        const release_id = getIn(
                                                            related,
                                                            ES_PATHS.release_id
                                                        )
                                                        if (uri)
                                                            window.open(
                                                                getPDSUrl(uri, release_id),
                                                                '_blank'
                                                            )
                                                    }}
                                                >
                                                    <div className={c.relatedItem}>Full</div>
                                                </Button>
                                                <Button
                                                    className={c.relatedButton}
                                                    size="small"
                                                    variant="outlined"
                                                    endIcon={
                                                        <LaunchIcon className={c.buttonIcon} />
                                                    }
                                                    onClick={() => {
                                                        const uri = getIn(
                                                            related,
                                                            'gather.pds_archive.related.browse.uri'
                                                        )
                                                        const release_id = getIn(
                                                            related,
                                                            ES_PATHS.release_id
                                                        )
                                                        if (uri)
                                                            window.open(
                                                                getPDSUrl(uri, release_id, 'lg'),
                                                                '_blank'
                                                            )
                                                    }}
                                                >
                                                    <div className={c.relatedItem}>Large</div>
                                                </Button>
                                                <Button
                                                    className={c.relatedButton}
                                                    size="small"
                                                    variant="outlined"
                                                    endIcon={
                                                        <LaunchIcon className={c.buttonIcon} />
                                                    }
                                                    onClick={() => {
                                                        const uri = getIn(
                                                            related,
                                                            'gather.pds_archive.related.browse.uri'
                                                        )
                                                        const release_id = getIn(
                                                            related,
                                                            ES_PATHS.release_id
                                                        )
                                                        if (uri)
                                                            window.open(
                                                                getPDSUrl(uri, release_id, 'md'),
                                                                '_blank'
                                                            )
                                                    }}
                                                >
                                                    <div className={c.relatedItem}>Medium</div>
                                                </Button>
                                                <Button
                                                    className={c.relatedButton}
                                                    size="small"
                                                    variant="outlined"
                                                    endIcon={
                                                        <LaunchIcon className={c.buttonIcon} />
                                                    }
                                                    onClick={() => {
                                                        const uri = getIn(
                                                            related,
                                                            'gather.pds_archive.related.browse.uri'
                                                        )
                                                        const release_id = getIn(
                                                            related,
                                                            ES_PATHS.release_id
                                                        )
                                                        if (uri)
                                                            window.open(
                                                                getPDSUrl(uri, release_id, 'sm'),
                                                                '_blank'
                                                            )
                                                    }}
                                                >
                                                    <div className={c.relatedItem}>Small</div>
                                                </Button>
                                                <Button
                                                    className={c.relatedButton}
                                                    size="small"
                                                    variant="outlined"
                                                    endIcon={
                                                        <LaunchIcon className={c.buttonIcon} />
                                                    }
                                                    onClick={() => {
                                                        const uri = getIn(
                                                            related,
                                                            'gather.pds_archive.related.browse.uri'
                                                        )
                                                        const release_id = getIn(
                                                            related,
                                                            ES_PATHS.release_id
                                                        )
                                                        if (uri)
                                                            window.open(
                                                                getPDSUrl(uri, release_id, 'xs'),
                                                                '_blank'
                                                            )
                                                    }}
                                                >
                                                    <div className={c.relatedItem}>Tiny</div>
                                                </Button>
                                            </div>
                                        </li>
                                    )}
                                </ul>
                            </div>
                        </div>
                    )}

                    <div className={c.properties}>
                        <div className={c.heading}>
                            <Typography noWrap className={c.title2} variant="subtitle2">
                                Properties
                            </Typography>
                            <Divider />
                        </div>
                        <div className={c.sectionBody}>
                            <ul className={c.propertiesList}>
                                {Object.keys(preview)
                                    .sort((a, b) => a.localeCompare(b))
                                    .map((key, idx) => {
                                        let value = preview[key]
                                        switch (key) {
                                            case 'size':
                                                value = humanFileSize(value, true)
                                                break
                                            default:
                                                break
                                        }
                                        let versionSelector = null
                                        if (
                                            key.toLowerCase().endsWith('version_id') &&
                                            versions.length > 0
                                        ) {
                                            versionSelector = (
                                                <div>
                                                    <FormControl
                                                        className={c.formControl}
                                                        size="small"
                                                    >
                                                        <Select
                                                            className={c.select}
                                                            onChange={(e) => {
                                                                dispatch(
                                                                    goToFilexURI(
                                                                        versions[e.target.value].uri
                                                                    )
                                                                )
                                                            }}
                                                            value={
                                                                activeVersion == null
                                                                    ? ''
                                                                    : activeVersion
                                                            }
                                                        >
                                                            {versions.map((v, idx) => {
                                                                return (
                                                                    <MenuItem
                                                                        className={
                                                                            c.versionSelectItem
                                                                        }
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
                                            <li key={idx}>
                                                <div className={c.key}>{prettify(key)}</div>
                                                {versionSelector || (
                                                    <div
                                                        className={c.value}
                                                        title={`Click to copy: ${value}`}
                                                        onClick={() => {
                                                            copyToClipboard(value)
                                                        }}
                                                    >
                                                        {value}
                                                    </div>
                                                )}
                                            </li>
                                        )
                                    })}
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

Preview.propTypes = {}

export default Preview
