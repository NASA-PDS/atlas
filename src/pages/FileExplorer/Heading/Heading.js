import { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'

import Url from 'url-parse'
import clsx from 'clsx'

import Typography from '@mui/material/Typography'
import IconButton from '@mui/material/IconButton'
import Tooltip from '@mui/material/Tooltip'
import Snackbar from '@mui/material/Snackbar'
import MuiAlert from '@mui/material/Alert'

import LinkIcon from '@mui/icons-material/Link'

import { makeStyles } from '@mui/material/styles'

import { copyToClipboard, splitUri } from '../../../core/utils'
import { HASH_PATHS, ES_PATHS } from '../../../core/constants'

const useStyles = makeStyles((theme) => ({
    Heading: {
        'display': 'flex',
        'justifyContent': 'space-between',
        'width': '100%',
        'background': theme.palette.swatches.grey.grey100,
        'height': theme.headHeights[2],
        'borderBottom': `1px solid ${theme.palette.swatches.grey.grey200}`,
        '& > div': {
            display: 'flex',
        },
        '& > div:first-child': {
            width: '100%',
        },
    },
    hide: {
        height: '0px',
        overflow: 'hidden',
    },
    path: {
        margin: 0,
        padding: `0px ${theme.spacing(1)}px 0px ${theme.spacing(3)}px`,
        boxSizing: 'border-box',
        width: 'calc(100% - 40px)',
    },
    pathTitle: {
        'fontSize': 14,
        'lineHeight': `${theme.headHeights[2]}px`,
        'fontFamily': 'monospace',
        'textOverflow': 'ellipsis',
        'whiteSpace': 'nowrap',
        'overflow': 'hidden',
        '& > span:first-child': {
            color: theme.palette.swatches.grey.grey500,
        },
    },
    copyLink: {},
    copyButton: {
        'padding': 10,
        'borderRadius': 0,
        'opacity': 0.5,
        'transition': 'opacity 0.2s ease-out',
        '&:hover': {
            opacity: 1,
        },
    },
    copyIcon: {
        fontSize: 20,
    },
    snackbar: {
        fontSize: 14,
        fontWeight: 'bold',
    },
}))

const Heading = (props) => {
    const { menuItems, hide } = props

    const c = useStyles()

    const navigate = useNavigate()

    const preview = useSelector((state) => {
        const filexPreview = state.get('filexPreview')
        return typeof filexPreview.toJS === 'function' ? {} : filexPreview
    })

    //========= Update page URL to match state ==========
    const columns = useSelector((state) => {
        const cols = state.get('columns')
        return typeof cols.toJS === 'function' ? [] : cols
    })

    const getParams = []

    columns.forEach((c) => {
        if (c.type === 'filter') {
            let v = c.value.split('.')
            v = v[v.length - 1]
            if (c.active) getParams.push({ key: v, value: c.active.key })
        } else if (c.type === 'volume') {
            if (c.active) {
                getParams.push({ key: 'bundle', value: c.active.key })
                // Add pds_standard parameter to distinguish bundles from volumes
                const pdsStandard = (c.active.type === 'volume') ? '3' : '4'
                getParams.push({ key: 'pds', value: pdsStandard })
            }
        }
    })

    let path = preview.uri ? preview.uri : null
    if (preview.fs_type === 'file') path += '-'
    if (path) getParams.push({ key: 'uri', value: path })

    let fullPath = ''
    let url = ''
    getParams.forEach((p, idx) => {
        url += `${idx === 0 ? '?' : '&'}${p.key}=${encodeURI(p.value)}`
        let v = p.value
        if (p.key === 'uri') v = splitUri(v).relativeUrl || ''
        fullPath += `${v[0] === '/' ? '' : '/'}${v}`
    })
    if (fullPath[fullPath.length - 1] == '-') fullPath = fullPath.slice(0, -1)

    useEffect(() => {
        if (url !== '') {
            const newPath = HASH_PATHS.fileExplorer + url
            const currentURL = new Url(window.location, true)
            if (currentURL.pathname !== newPath) {
                navigate(newPath, { replace: true })
            }
        }
    }, [url])

    const [openSnackbar, setOpenSnackbar] = useState(false)

    const handleOpenSnackbar = () => {
        setOpenSnackbar(true)
    }

    const handleCloseSnackbar = (e, reason) => {
        if (reason === 'clickaway') return
        setOpenSnackbar(false)
    }

    return (
        <div className={clsx(c.Heading, { [c.hide]: hide })}>
            <div
                style={{
                    width: `calc(100% - ${menuItems ? menuItems.length * 40 : 0}px)`,
                }}
            >
                <div className={c.path}>
                    <Typography className={c.pathTitle} variant="h4">
                        <span>{fullPath.split('/').splice(0, 3).join('/')}</span>
                        <span>/{fullPath.split('/').splice(3).join('/')}</span>
                    </Typography>
                </div>
                <div className={c.copyLink}>
                    <Tooltip title="Copy Link" arrow>
                        <IconButton
                            className={c.copyButton}
                            aria-label="copy link to file explorer"
                            onClick={() => {
                                copyToClipboard(window.location.href)
                                handleOpenSnackbar()
                            }}
                        >
                            <LinkIcon className={c.copyIcon} />
                        </IconButton>
                    </Tooltip>
                </div>
            </div>
            <div>{menuItems && menuItems.map((m) => m)}</div>
            <Snackbar
                anchorOrigin={{
                    vertical: 'top',
                    horizontal: 'center',
                }}
                open={openSnackbar}
                autoHideDuration={4000}
                onClose={handleCloseSnackbar}
            >
                <MuiAlert
                    className={c.snackbar}
                    elevation={6}
                    variant="filled"
                    onClose={handleCloseSnackbar}
                    severity="success"
                >
                    Copied Link to Clipboard!
                </MuiAlert>
            </Snackbar>
        </div>
    )
}

Heading.propTypes = {}

export default Heading
