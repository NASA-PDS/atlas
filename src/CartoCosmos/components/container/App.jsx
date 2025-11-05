import React, { useState } from 'react'
import Paper from '@mui/material/Paper'
import { makeStyles } from '@mui/styles'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import Input from '@mui/material/Input'
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'
import Typography from '@mui/material/Typography'
import ConsoleContainer from './ConsoleContainer.jsx'
import MapContainer from './MapContainer.jsx'
import ListSubheader from '@mui/material/ListSubheader'
import WellKnownTextInput from '../presentational/WellKnownTextInput.jsx'

import { useSelector, useDispatch } from 'react-redux'
import { MISSIONS_TO_BODIES } from '../../../core/constants'
import { sAKeys, sASet } from '../../../core/redux/actions/subscribableActions'
import clsx from 'clsx'

/**
 * Controls css styling for this component using js to css
 */
const useStyles = makeStyles((theme) => ({
    root: {
        position: 'relative',
    },
    changePlanet: {
        'position': 'absolute',
        'top': 10,
        'left': 10,
        'zIndex': 1100,
        'background': 'black',
        '& .MuiInput-underline:before': {
            'border-bottom': '1px solid black',
        },
    },
    formControl: {
        minWidth: 125,
    },
    select: {
        'color': '#efefef',
        'background': '#000',
        'border-bottom': '1px solid black',
        'borderRadius': '3px',
        '& > div:first-child': {
            padding: '8px 20px 6px 6px',
        },
        '& > svg': {
            color: '#efefef',
            top: '4px',
            right: '2px',
        },
    },
    listTitle: {
        pointerEvents: 'none',
        display: 'none',
    },
    subheader: {
        lineHeight: '33px !important',
        fontSize: '14px !important',
        color: '#1c67e3',
        pointerEvents: 'none',
        minWidth: '180px',
    },
    indent: {
        paddingLeft: '48px !important',
    },
    bold: {
        fontWeight: 'bold !important',
        paddingLeft: '32px !important',
    },
    disabled: {
        pointerEvents: 'none',
        opacity: 0.4,
        color: 'rgba(0,0,0,0.4) !important',
    },
    disabled2: {
        display: 'none',
    },
    autoComplete: {},
    paper: {
        height: '100%',
    },
    none: {
        width: '100%',
        height: '100%',
        backgroundSize: '18px 18px', //'32px 32px',
        backgroundImage: `linear-gradient(to right, ${theme.palette.swatches.grey.grey700} 1px, transparent 1px), linear-gradient(to bottom, ${theme.palette.swatches.grey.grey700} 1px, transparent 1px)`,
        backgroundRepeat: 'repeat',
    },
    messageCont: {
        background: theme.palette.swatches.grey.grey150,
        position: 'absolute',
        left: '50%',
        top: '50%',
        transform: 'translateX(-50%) translateY(-50%)',
        padding: '24px',
    },
    message: {
        fontSize: '16px',
        fontWeight: 700,
        textAlign: 'center',
    },
    messageChangePlanet: {
        'display': 'flex',
        'justifyContent': 'center',
        'marginTop': '12px',
        '& .MuiInput-underline:before': {
            'border-bottom': '1px solid black',
        },
    },
}))

function TargetDropdown(props) {
    const { className, targetPlanet, handleChange, hasNone, bodyLimits } = props
    const c = useStyles()

    const structure = {
        planets: {
            name: 'Planets',
            children: [
                {
                    name: 'Mercury',
                    children: [],
                },
                {
                    name: 'Venus',
                    children: [],
                },
                {
                    name: 'Earth',
                    children: ['Moon'],
                },
                {
                    name: 'Mars',
                    children: ['Deimos', 'Phobos'],
                },
                {
                    name: 'Jupiter',
                    children: ['Callisto', 'Europa', 'Ganymede', 'Io'],
                },
                {
                    name: 'Saturn',
                    children: [
                        'Dione',
                        'Enceladus',
                        'Hyperion',
                        'Iapetus',
                        'Mimas',
                        'Phoebe',
                        'Rhea',
                        'Tethys',
                        'Titan',
                    ],
                },
                {
                    name: 'Uranus',
                    children: [],
                },
                {
                    name: 'Neptune',
                    children: [],
                },
            ],
        },
        otherBodies: {
            name: 'Other Bodies',
            children: [
                {
                    name: 'Ceres',
                    children: [],
                },
                {
                    name: 'Pluto',
                    children: ['Charon'],
                },
                {
                    name: 'Vesta',
                    children: [],
                },
            ],
        },
    }

    const constructItems = () => {
        const items = []
        if (hasNone)
            items.push(
                <ListSubheader key="none" value="None" className={c.listTitle}>
                    Target Bodies
                </ListSubheader>
            )

        for (let h in structure) {
            items.push(
                <ListSubheader key={h} className={c.subheader}>
                    {structure[h].name}
                </ListSubheader>
            )
            structure[h].children.forEach((child, idx) => {
                items.push(
                    <MenuItem
                        key={`${h}_${idx}`}
                        value={child.name}
                        className={clsx(c.bold, {
                            [c.disabled]: !(
                                bodyLimits == null || bodyLimits.includes(child.name.toLowerCase())
                            ),
                        })}
                    >
                        {child.name}
                    </MenuItem>
                )
                child.children.forEach((child2, idx2) => {
                    items.push(
                        <MenuItem
                            key={`${h}_${idx}_${idx2}`}
                            value={child2}
                            className={clsx(c.indent, {
                                [c.disabled2]: !(
                                    bodyLimits == null || bodyLimits.includes(child2.toLowerCase())
                                ),
                            })}
                        >
                            {`${child2 === 'Moon' ? 'The ' : ''}${child2}`}
                        </MenuItem>
                    )
                })
            })
        }

        return items
    }

    return (
        <div className={className}>
            <FormControl className={c.formControl} size="small">
                <Select
                    className={c.select}
                    defaultValue={1}
                    onChange={handleChange}
                    value={targetPlanet}
                    input={<Input id="grouped-select" />}
                >
                    {constructItems()}
                </Select>
            </FormControl>
        </div>
    )
}

/**
 * App is the parent component for all of the other components in the project. It
 * imports and creates all of the map and console components and contains the
 * target selector.
 *
 * @component
 */
export default function App(props) {
    const c = useStyles()
    const dispatch = useDispatch()

    const [targetPlanet, setTargetPlanet] = useState('None')

    const activeMissions = useSelector((state) => {
        return state.getIn(['activeMissions'])
    }).toJS()

    let bodyLimits = []
    if (activeMissions == null || activeMissions.length === 0) bodyLimits = null
    else {
        const mains = []
        activeMissions.forEach((m) => {
            const bodies = MISSIONS_TO_BODIES[m]
            if (bodies) {
                for (let key in bodies) {
                    if (key !== 'main') bodyLimits = bodyLimits.concat(bodies[key])
                }
                if (bodies.main) mains.push(bodies.main)
            }
        })
        // If target planet is outside of the limits
        if (!bodyLimits.includes(targetPlanet.toLowerCase())) {
            const nextTargetPlanet = mains[0] || 'None'
            if (nextTargetPlanet != targetPlanet) setTargetPlanet(nextTargetPlanet)
            sASet(sAKeys.MAP_TARGET, mains[0] || 'None')
        }
    }

    /**
     * Handles target selection
     *
     * @param {*} event selection event
     */
    const handleChange = (event) => {
        if (event.target.value != targetPlanet) setTargetPlanet(event.target.value)
        sASet(sAKeys.MAP_TARGET, event.target.value)
    }

    return (
        <div className={c.root}>
            {targetPlanet === 'None' ? (
                <div className={c.none}>
                    <Paper className={c.messageCont} elevation={10}>
                        <Typography className={c.message}>
                            Select a target body to get started
                        </Typography>
                        <TargetDropdown
                            className={c.messageChangePlanet}
                            targetPlanet={targetPlanet}
                            handleChange={handleChange}
                            hasNone={true}
                            bodyLimits={bodyLimits}
                        />
                    </Paper>
                </div>
            ) : (
                <React.Fragment>
                    <TargetDropdown
                        className={c.changePlanet}
                        targetPlanet={targetPlanet}
                        handleChange={handleChange}
                        bodyLimits={bodyLimits}
                    />
                    <Paper className={c.paper} elevation={10}>
                        <ConsoleContainer target={targetPlanet} />
                        <MapContainer target={targetPlanet} firstOpen={props.firstOpen} />
                        <WellKnownTextInput />
                    </Paper>
                </React.Fragment>
            )}
        </div>
    )
}
