import React from 'react'
import ConsoleAppBar from '../presentational/ConsoleAppBar.jsx'
import { makeStyles } from '@mui/material/styles'

/**
 * Controls css styling for this component using js to css
 */
const useStyles = makeStyles({
    root: {
        maxWidth: 800,
        height: 100,
        width: '100%',
        display: 'none',
    },
    consAppbar: {
        maxWidth: 800,
        height: 100,
        width: 'auto',
    },
})

/**
 * Container component that holds the ConsoleAppBar and all of its subcomponents
 *
 * @component
 *
 */
export default function ConsoleContainer(props) {
    const classes = useStyles()
    return (
        <div className={classes.root}>
            <ConsoleAppBar target={props.target} className={classes.consAppbar} />
        </div>
    )
}
