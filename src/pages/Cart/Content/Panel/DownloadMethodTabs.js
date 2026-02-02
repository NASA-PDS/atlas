import React from 'react'
import PropTypes from 'prop-types'

import { makeStyles, withStyles } from '@mui/styles'
import Tabs from '@mui/material/Tabs'
import Tab from '@mui/material/Tab'
import Typography from '@mui/material/Typography'

const useStyles = makeStyles((theme) => ({
    title: {
        padding: `${theme.spacing(2)} ${theme.spacing(3)} ${theme.spacing(1)} ${theme.spacing(3)}`,
        fontSize: '16px',
        fontWeight: 'bold',
        marginBottom: theme.spacing(3),
    },
    tabs: {
        height: theme.headHeights[2],
        width: '100%',
        boxSizing: 'border-box',
        background: theme.palette.swatches.grey.grey150,
        borderBottom: `1px solid ${theme.palette.swatches.grey.grey200}`,
        color: theme.palette.text.main,
    },
}))

const StyledTabs = withStyles((theme) => ({
    indicator: {
        'display': 'flex',
        'justifyContent': 'center',
        'backgroundColor': 'transparent',
        'height': '5px',
        '& > span': {
            maxWidth: 124,
            width: '100%',
            backgroundColor: theme.palette.accent.main,
        },
    },
}))((props) => <Tabs {...props} TabIndicatorProps={{ children: <span /> }} />)

const StyledTab = withStyles((theme) => ({
    root: {
        'color': theme.palette.text.main,
        'fontSize': theme.typography.pxToRem(14),
        'marginRight': theme.spacing(1),
        'minWidth': 58,
        '&:focus': {
            opacity: 1,
        },
    },
}))((props) => <Tab disableRipple {...props} />)

const DownloadMethodTabs = ({ value, onChange }) => {
    const c = useStyles()

    return (
        <>
            <Typography className={c.title}>
                Choose your download method:
            </Typography>
            <div className={c.tabs}>
                <StyledTabs
                    value={value}
                    onChange={onChange}
                    aria-label="cart download tab"
                >
                    <StyledTab label="ZIP" />
                    <StyledTab label="WGET" />
                    <StyledTab label="CURL" />
                    <StyledTab label="CSV" />
                    <StyledTab label="TXT" />
                </StyledTabs>
            </div>
        </>
    )
}

DownloadMethodTabs.propTypes = {
    value: PropTypes.number.isRequired,
    onChange: PropTypes.func.isRequired,
}

export default DownloadMethodTabs
