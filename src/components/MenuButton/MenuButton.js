import React, { useState, useEffect, useRef } from 'react'
import PropTypes from 'prop-types'

import clsx from 'clsx'

import { makeStyles, useTheme } from '@mui/material/styles'
import withWidth from '@mui/material/withWidth'

import IconButton from '@mui/material/IconButton'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import Checkbox from '@mui/material/Checkbox'

import ClickAwayListener from '@mui/material/ClickAwayListener'
import Grow from '@mui/material/Grow'
import Paper from '@mui/material/Paper'
import Popper from '@mui/material/Popper'
import MenuItem from '@mui/material/MenuItem'
import MenuList from '@mui/material/MenuList'

const useStyles = makeStyles((theme) => ({
    MenuButton: {
        zIndex: 1200,
    },
    button: {
        'color': theme.palette.swatches.grey.grey500,
        'padding': '9px 10px 10px 10px',
        'background': 'rgba(0,0,0,0)',
        'transition': 'all 0.2s ease-out',
        '&:hover': {
            background: theme.palette.swatches.grey.grey150,
            color: theme.palette.text.primary,
        },
    },
    open: {
        background: theme.palette.swatches.grey.grey150,
        color: theme.palette.text.primary,
    },
    menu: {
        background: theme.palette.swatches.grey.grey800,
        color: theme.palette.text.secondary,
        marginTop: '4px',
    },
    menuli: {
        'borderLeft': '4px solid rgba(0,0,0,0)',
        'transition': 'background 0.2s ease-out',
        '&:hover': {
            background: theme.palette.swatches.grey.grey700,
        },
    },
    menuliActive: {
        borderLeft: `4px solid ${theme.palette.swatches.blue.blue500}`,
        background: theme.palette.swatches.grey.grey700,
    },
    menuliCheck: {
        paddingLeft: theme.spacing(2),
    },
    hr: {
        width: '100%',
        height: '1px',
        background: theme.palette.swatches.grey.grey600,
    },
    checkbox: {
        'padding': `0px ${theme.spacing(2)}px 0px 0px`,
        '&.Mui-checked': {
            color: theme.palette.swatches.grey.grey100,
        },
    },
}))

const MenuButton = (props) => {
    const { options, active, checkboxIndices, buttonComponent, title, onChange } = props
    const c = useStyles()

    let currentActive = active || null

    const [open, setOpen] = useState(false)
    const anchorRef = useRef(null)

    const handleToggle = () => {
        setOpen((prevOpen) => !prevOpen)
    }

    const handleClose = (event, option, idx) => {
        if (typeof onChange === 'function') onChange(option, idx)
        if (anchorRef.current && anchorRef.current.contains(event.target)) {
            return
        }

        setOpen(false)
    }

    function handleListKeyDown(event) {
        if (event.key === 'Tab') {
            event.preventDefault()
            setOpen(false)
        }
    }

    // return focus to the button when we transitioned from !open -> open
    const prevOpen = React.useRef(open)
    useEffect(() => {
        if (prevOpen.current === true && open === false) {
            anchorRef.current.focus()
        }

        prevOpen.current = open
    }, [open])

    return (
        <div className={c.MenuButton}>
            <IconButton
                className={clsx(c.button, { [c.open]: open })}
                aria-label="menu"
                ref={anchorRef}
                aria-controls={open ? 'menu-list-grow' : undefined}
                aria-haspopup="true"
                onClick={handleToggle}
            >
                {buttonComponent}
            </IconButton>
            <Popper
                open={open}
                anchorEl={anchorRef.current}
                role={undefined}
                transition
                disablePortal
                placement="bottom-end"
                style={{
                    zIndex: 1300,
                }}
            >
                {({ TransitionProps, placement }) => (
                    <Grow
                        {...TransitionProps}
                        style={{
                            transformOrigin:
                                placement === 'bottom' ? 'center top' : 'center bottom',
                        }}
                    >
                        <Paper className={c.menu}>
                            <ClickAwayListener onClickAway={handleClose}>
                                <MenuList
                                    autoFocusItem={open}
                                    id="menu-list-grow"
                                    onKeyDown={handleListKeyDown}
                                >
                                    {title != null ? (
                                        <MenuItem key={-1} className={c.menuli} disabled>
                                            {title}
                                        </MenuItem>
                                    ) : null}
                                    {options.map((o, idx) =>
                                        o === '-' ? (
                                            <div key={idx} className={c.hr}></div>
                                        ) : (
                                            <MenuItem
                                                key={idx}
                                                className={clsx(c.menuli, {
                                                    [c.menuliActive]: o === currentActive,
                                                    [c.menuliCheck]:
                                                        checkboxIndices &&
                                                        checkboxIndices.includes(idx),
                                                })}
                                                onClick={(e) => handleClose(e, o, idx)}
                                            >
                                                {checkboxIndices &&
                                                    checkboxIndices.includes(idx) && (
                                                        <Checkbox
                                                            className={c.checkbox}
                                                            color="default"
                                                            checked={o === currentActive}
                                                            aria-label={
                                                                o === currentActive
                                                                    ? 'selected'
                                                                    : 'select'
                                                            }
                                                        />
                                                    )}
                                                {o}
                                            </MenuItem>
                                        )
                                    )}
                                </MenuList>
                            </ClickAwayListener>
                        </Paper>
                    </Grow>
                )}
            </Popper>
        </div>
    )
}

MenuButton.propTypes = {
    options: PropTypes.array.isRequired,
    checkboxIndices: PropTypes.array,
    active: PropTypes.string,
    onChange: PropTypes.func,
}

export default MenuButton
