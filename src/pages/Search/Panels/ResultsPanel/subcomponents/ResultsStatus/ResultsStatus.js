import React from 'react'
import { useSelector, useDispatch } from 'react-redux'
import PropTypes from 'prop-types'

import clsx from 'clsx'

import { setFieldState } from '../../../../../../core/redux/actions/actions'

import { getIn, capitalize, prettify, isObject, objectToString } from '../../../../../../core/utils'
import { resultsStatuses } from '../../../../../../core/constants'

import { makeStyles } from '@mui/styles'

import Paper from '@mui/material/Paper'
import CircularProgress from '@mui/material/CircularProgress'
import LinearProgress from '@mui/material/LinearProgress'
import Tooltip from '@mui/material/Tooltip'

import ReportProblemOutlinedIcon from '@mui/icons-material/ReportProblemOutlined'
import ErrorOutlineOutlinedIcon from '@mui/icons-material/ErrorOutlineOutlined'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'

const useStyles = makeStyles((theme) => ({
    ResultsStatus: {
        'position': 'absolute',
        'top': 0,
        'width': '100%',
        'height': '100%',
        'transition': 'all 0.2s ease-out',
        '& > div': {
            transition: 'background 0.4s ease-out',
        },
        '& > div > div': {
            transition: 'background 0.4s ease-out',
        },
    },
    hidden: {
        pointerEvents: 'none',
        opacity: 0,
    },
    paper: {
        'position': 'absolute',
        'top': '50%',
        'left': '50%',
        'transform': 'translateX(-50%) translateY(-50%)',
        'background': theme.palette.primary.main,
        '& > div': {
            padding: `${theme.spacing(4)} ${theme.spacing(6)}`,
        },
    },
    waiting: {
        background: theme.palette.swatches.grey.grey100,
        fontSize: '16px',
        paddingBottom: theme.spacing(0.5),
    },
    waitingTitle: {
        'display': 'flex',
        'justifyContent': 'center',
        'fontSize': '16px',
        'fontWeight': 'bold',
        'marginBottom': theme.spacing(1.5),
        '& > div': {
            marginLeft: theme.spacing(1.5),
        },
    },
    waitingMessage: {
        textAlign: 'center',
        margin: '0px 5%',
        maxWidth: '340px',
    },
    searching: {
        background: theme.palette.accent.main,
        fontSize: '16px',
        color: theme.palette.text.secondary,
        paddingBottom: theme.spacing(0.5),
    },
    searchingProgress: {
        'display': 'flex',
        'justifyContent': 'center',
        'marginTop': theme.spacing(1),
        'marginBottom': theme.spacing(4),
        '& .MuiCircularProgress-colorPrimary': {
            color: theme.palette.text.secondary,
        },
    },
    searchingMessage: {
        fontWeight: 'bold',
        fontSize: '16px',
        textTransform: 'uppercase',
    },
    loading: {
        position: 'absolute',
        top: `-${theme.headHeights[1] * 2 + 1}px`,
        width: '100%',
    },
    loadingProgress: {
        'width': '100%',
        'height': '2px',
        'overflow': 'hidden',
        '& .MuiLinearProgress-colorPrimary': {
            background: 'transparent',
        },
        '& .MuiLinearProgress-barColorPrimary': {
            background: theme.palette.accent.main,
        },
        '& .MuiLinearProgress-bar1Indeterminate': {
            animation:
                'MuiLinearProgress-keyframes-indeterminate1 6.3s cubic-bezier(0.65, 0.815, 0.735, 0.395) infinite',
        },
        '& .MuiLinearProgress-bar2Indeterminate': {
            animation:
                'MuiLinearProgress-keyframes-indeterminate2 6.3s cubic-bezier(0.165, 0.84, 0.44, 1) 3.45s infinite',
        },
    },
    none: {
        background: theme.palette.swatches.yellow.yellow700,
        fontSize: '16px',
        paddingBottom: theme.spacing(0.5),
    },
    noneTitle: {
        'display': 'flex',
        'justifyContent': 'center',
        'fontSize': '24px',
        'fontWeight': 'bold',
        'marginBottom': theme.spacing(1.5),
        '& > div': {
            marginLeft: theme.spacing(1.5),
        },
    },
    noneMessage: {
        textAlign: 'center',
        margin: '0px 5%',
        maxWidth: '500px',
    },
    error: {
        background: theme.palette.swatches.red.red500,
        fontSize: '16px',
        color: theme.palette.text.primary,
        paddingBottom: theme.spacing(0.5),
    },
    errorTitle: {
        'display': 'flex',
        'justifyContent': 'center',
        'fontSize': '24px',
        'fontWeight': 'bold',
        'marginBottom': theme.spacing(1.5),
        '& > div': {
            marginLeft: theme.spacing(1.5),
        },
    },
    errorMessage: {
        textAlign: 'center',
        margin: '0px 5%',
        maxWidth: '600px',
    },
}))

const ResultsStatus = (props) => {
    const c = useStyles()
    const dispatch = useDispatch()

    const resultsStatus = useSelector((state) => {
        return state.getIn(['resultsStatus'])
    }).toJS()

    let inner = null
    let outer = null
    let isHidden = false

    switch (resultsStatus.status) {
        case resultsStatuses.WAITING:
            inner = (
                <div className={c.waiting}>
                    <div className={c.waitingTitle}>
                        <ArrowBackIcon />
                        <div>Search for Imagery</div>
                    </div>
                    <div className={c.waitingMessage}>
                        To begin, narrow your query down using the filters provided on the left.
                    </div>
                </div>
            )
            break
        case resultsStatuses.SEARCHING:
            inner = (
                <div className={c.searching}>
                    <div className={c.searchingProgress}>
                        <CircularProgress size={36} />
                    </div>
                    <div className={c.searchingMessage}>Searching</div>
                </div>
            )
            break
        case resultsStatuses.LOADING:
            outer = (
                <div className={c.loading}>
                    <div className={c.loadingProgress}>
                        <LinearProgress />
                    </div>
                </div>
            )
            break
        case resultsStatuses.NONE:
            inner = (
                <div className={c.none}>
                    <div className={c.noneTitle}>
                        <ReportProblemOutlinedIcon fontSize="large" />
                        <div>No Records Found</div>
                    </div>
                    <div className={c.noneMessage}>
                        If you were expecting to see some records, review your query or remove
                        filters to broaden the search.
                    </div>
                </div>
            )
            break
        case resultsStatuses.SUCCESSFUL:
            isHidden = true
            break
        case resultsStatuses.ERROR:
            inner = (
                <div className={c.error}>
                    <div className={c.errorTitle}>
                        <Tooltip title={resultsStatus.message?.error} arrow placement="left-end">
                            <ErrorOutlineOutlinedIcon fontSize="large" />
                        </Tooltip>
                        <div>Search Error</div>
                    </div>
                    <div className={c.errorMessage}>
                        We encountered an error while trying to search our imaging archive, please
                        try again. If the issue persists, please contact a site administrator.
                    </div>
                </div>
            )
            break
        default:
            break
    }

    return (
        <div className={clsx(c.ResultsStatus, { [c.hidden]: isHidden })}>
            {outer}
            <Paper className={c.paper} elevation={2}>
                {inner}
            </Paper>
        </div>
    )
}

ResultsStatus.propTypes = {}

export default ResultsStatus
