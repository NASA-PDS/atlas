import React, { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import { makeStyles, withStyles } from '@mui/styles'

import clsx from 'clsx'
import moment from 'moment'

import Paper from '@mui/material/Paper'
import IconButton from '@mui/material/IconButton'
import Tooltip from '@mui/material/Tooltip'
import LinearProgress from '@mui/material/LinearProgress'
import PauseIcon from '@mui/icons-material/Pause'
import PlayIcon from '@mui/icons-material/PlayArrow'
import StopIcon from '@mui/icons-material/Stop'

import { abbreviateNumber } from '../../core/utils.js'

const DownloadingLinearProgress = withStyles((theme) => ({
    root: {},
    colorPrimary: {
        backgroundColor: theme.palette.swatches.grey.grey1500,
    },
    bar: {
        backgroundColor: theme.palette.accent.main,
    },
    bar2Buffer: {
        backgroundColor: theme.palette.swatches.blue.blue200,
    },
    dashed: {
        backgroundImage: `radial-gradient(${theme.palette.swatches.grey.grey400} 0%, ${theme.palette.swatches.grey.grey400} 16%, transparent 42%)`,
    },
}))(LinearProgress)

const useStyles = makeStyles((theme) => ({
    status: {
        border: `1px solid ${theme.palette.swatches.grey.grey300}`,
    },
    statusInner: {
        display: 'flex',
        justifyContent: 'space-between',
        padding: theme.spacing(1.5),
        height: '48px',
    },
    statusLeft: {
        width: '108px',
        position: 'relative',
        paddingLeft: 10,
        cursor: 'pointer',
    },
    statusProgress: {
        'lineHeight': '48px',
        '&:hover': {
            opacity: 0,
        },
    },
    statusCount: {
        'fontSize': 18,
        'position': 'absolute',
        'top': '0px',
        'lineHeight': '48px',
        'width': '100%',
        'background': 'white',
        'opacity': 0,
        '&:hover': {
            opacity: 1,
        },
    },
    statusMiddle: {
        textAlign: 'center',
    },
    statusElapsed: {
        fontSize: 14,
        marginTop: '7px',
    },
    statusRemaining: {
        fontSize: 16,
    },
    statusRight: {
        width: '108px',
        display: 'flex',
        justifyContent: 'end',
    },
    statusButtonBlue: {
        'fontSize': 30,
        'transition': 'color 0.2s ease-in-out',
        '&:hover': {
            color: theme.palette.accent.main,
        },
    },
    statusButtonRed: {
        'fontSize': 30,
        'transition': 'color 0.2s ease-in-out',
        '&:hover': {
            color: theme.palette.swatches.red.red500,
        },
    },
    statusDone: {
        opacity: 0.5,
        pointerEvents: 'none',
    },
    stoppedBar: {
        height: '4px',
        width: '100%',
        background: theme.palette.swatches.red.red500,
    },
    doneBar: {
        height: '4px',
        width: '100%',
        background: theme.palette.swatches.green.green500,
    },
    hide: {
        display: 'none',
    },
}))

function DownloadingCard(props) {
    const { downloadId, status, controller, controllerType, onStop, hideActions, hidePause } = props
    const c = useStyles()

    const modes = {
        running: 'running',
        paused: 'paused',
        stopped: 'stopped',
        done: 'done',
    }
    const [mode, setMode] = useState(modes.running)

    // Restart mode when download id changes
    useEffect(() => {
        setMode(modes.running)
    }, [downloadId])

    const pause = () => {
        if (controller) {
            switch (controllerType) {
                case 'zip':
                    controller.pause()
                    break
                default:
                    break
            }
            setMode(modes.paused)
        }
    }
    const resume = () => {
        if (controller) {
            switch (controllerType) {
                case 'zip':
                    controller.resume()
                    break
                default:
                    break
            }
            setMode(modes.running)
        }
    }
    const stop = () => {
        if (controller) {
            switch (controllerType) {
                case 'zip':
                    controller.closeWithMetadata()
                    break
                default:
                    break
            }
        }
        setMode(modes.stopped)
        if (typeof onStop === 'function') onStop()
    }

    if (status == null) return null

    let progressText
    let progressFontSize = 30
    switch (mode) {
        case modes.running:
            progressText = `${status.overall.percent.toFixed(2)}%`
            break
        case modes.paused:
            progressText = 'Paused'
            progressFontSize = 26
            break
        case modes.stopped:
            progressText = 'Stopped'
            progressFontSize = 22
            break
        case modes.done:
            progressText = 'Done'
            break
        default:
            progressText = mode
            break
    }

    if (mode === modes.running && status.overall.percent >= 100) setMode(modes.done)
    else if (mode === modes.done && status.overall.percent < 100) setMode(modes.running)

    let remaining = moment
        .utc(moment.duration(status.overall.estimatedTimeRemaining).as('milliseconds'))
        .format('HH:mm:ss')
    if (isNaN(status.overall.estimatedTimeRemaining)) remaining = 'Calculating'
    else if (status.overall.estimatedTimeRemaining < 0) remaining = '00:00:00'

    return (
        <Paper className={c.status} elevation={0}>
            {mode === modes.running && (
                <DownloadingLinearProgress
                    variant="buffer"
                    value={status.overall.percent}
                    valueBuffer={status.overall.buffer}
                />
            )}
            {mode === modes.stopped && <div className={c.stoppedBar}></div>}
            {mode === modes.done && <div className={c.doneBar}></div>}
            <div className={c.statusInner}>
                <div className={c.statusLeft}>
                    <div className={c.statusProgress} style={{ fontSize: progressFontSize }}>
                        {progressText}
                    </div>
                    <div className={c.statusCount}>
                        {`${abbreviateNumber(status.overall.current)} / ${abbreviateNumber(
                            status.overall.total
                        )}`}
                    </div>
                </div>
                <div className={c.statusMiddle}>
                    <div className={c.statusElapsed}>{`Elapsed: ${moment
                        .utc(moment.duration(status.overall.elapsedTime).as('milliseconds'))
                        .format('HH:mm:ss')}`}</div>
                    <div className={c.statusRemaining}>{`Remaining: ${
                        remaining == 'Invalid date' ? 'Calculating' : remaining
                    }`}</div>
                </div>
                <div
                    className={clsx(c.statusRight, {
                        [c.statusDone]: mode === modes.done || mode === modes.stopped,
                        [c.hide]: hideActions === true,
                    })}
                >
                    <Tooltip title={`${mode === modes.paused ? 'Resume' : 'Pause'} Download`} arrow>
                        <IconButton
                            className={clsx(c.statusButtonBlue, { [c.hide]: hidePause === true })}
                            onClick={() => {
                                if (mode === modes.running) {
                                    pause()
                                } else if (mode === modes.paused) {
                                    resume()
                                }
                            }}
                            size="large">
                            {mode === modes.paused ? (
                                <PlayIcon fontSize="inherit" />
                            ) : (
                                <PauseIcon fontSize="inherit" />
                            )}
                        </IconButton>
                    </Tooltip>

                    <Tooltip title="Stop Download" arrow>
                        <IconButton className={c.statusButtonRed} onClick={stop} size="large">
                            <StopIcon fontSize="inherit" />
                        </IconButton>
                    </Tooltip>
                </div>
            </div>
        </Paper>
    );
}

DownloadingCard.propTypes = {}

export default DownloadingCard
