import React, { useState, useEffect, useRef } from 'react'

import clsx from 'clsx'
import Button from '@mui/material/Button'
import ButtonGroup from '@mui/material/ButtonGroup'
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown'
import ClickAwayListener from '@mui/material/ClickAwayListener'
import Grow from '@mui/material/Grow'
import Paper from '@mui/material/Paper'
import Popper from '@mui/material/Popper'
import MenuItem from '@mui/material/MenuItem'
import MenuList from '@mui/material/MenuList'
import Checkbox from '@mui/material/Checkbox'

import { makeStyles } from '@mui/material/styles'

const useStyles = makeStyles((theme) => ({
    SplitButton: {
        'borderRadius': '2px',
        '& > .MuiButton-root': {
            background: theme.palette.swatches.grey.grey0,
        },
        '& .MuiButtonGroup-groupedOutlinedHorizontal:not(:last-child)': {
            borderRight: '2px solid rgba(23, 23, 27, 0.5) !important',
        },
    },
    contained: {
        'border': 'none',
        'borderRadius': '2px',
        '& > .MuiButton-root': {
            background: theme.palette.accent.main,
            border: 'none',
        },
    },
    arrow: {
        padding: '4px 0px',
        minWidth: '33px',
        borderLeft: `1px solid rgba(255,255,255,0.4) !important`,
    },
    popper: {
        zIndex: 3000,
        marginTop: '5px',
    },
    menu: {
        background: theme.palette.swatches.grey.grey800,
        color: theme.palette.text.secondary,
        borderRadius: '3px',
    },
    menuli: {
        'display': 'flex',
        'justifyContent': 'space-between',
        'borderLeft': '4px solid rgba(0,0,0,0)',
        'transition': 'background 0.2s ease-out',
        '&:hover': {
            background: theme.palette.swatches.grey.grey700,
        },
    },
    menuliLeft: {
        display: 'flex',
    },
    menuliSubname: {
        opacity: 0.7,
        marginLeft: '24px',
    },
    menuliActive: {
        borderLeft: `4px solid ${theme.palette.swatches.blue.blue500}`,
        background: `${theme.palette.swatches.grey.grey700} !important`,
    },
    delimitedPath: {
        opacity: 0.7,
        lineHeight: '27px',
    },
    menuName: {
        lineHeight: '27px',
    },
    menuNameBold: {
        fontWeight: 'bold',
    },
    checkbox: {
        marginRight: '4px',
    },
}))

// items is [{ name: 'My Items' }, { ... }]

export default function SplitButton(props) {
    const {
        className,
        forceName,
        items,
        type,
        onClick,
        onChange,
        startIcon,
        forceIndex,
        startingIndex,
        truncateDelimiter,
        variant,
    } = props

    const c = useStyles()

    const [open, setOpen] = useState(false)
    const anchorRef = useRef(null)
    const [selectedIndex, setSelectedIndex] = useState(startingIndex || 0)
    const [checkedIndices, setCheckedIndices] = useState([])

    useEffect(() => {
        if (type === 'checklist') {
            const nextCheckedIndices = []
            items.forEach((item, idx) => {
                if (item.checked) nextCheckedIndices.push(idx)
            })
            setCheckedIndices(nextCheckedIndices)
        }
    }, [])

    const handleClick = () => {
        if (typeof onClick === 'function') {
            if (type === 'checklist') {
                const checkedItems = []
                checkedIndices.forEach((index) => {
                    checkedItems.push(items[index])
                })
                onClick(checkedItems)
            } else onClick(items[selectedIndex], selectedIndex)
        }
    }

    const handleMenuItemClick = (event, index) => {
        if (type === 'checklist') {
            let nextCheckedIndices = JSON.parse(JSON.stringify(checkedIndices))
            const indexOfIndex = nextCheckedIndices.indexOf(index)
            if (indexOfIndex === -1) nextCheckedIndices.push(index)
            else nextCheckedIndices.splice(indexOfIndex, 1)
            setCheckedIndices(nextCheckedIndices)
        } else {
            setOpen(false)
            setSelectedIndex(index)
            if (typeof onChange === 'function') onChange(items[index], index)
        }
    }

    const handleToggle = () => {
        setOpen((prevOpen) => !prevOpen)
    }

    const handleClose = (event) => {
        if (anchorRef.current && anchorRef.current.contains(event.target)) {
            return
        }

        setOpen(false)
    }

    let name = items[forceIndex != null ? forceIndex : selectedIndex].name
    if (truncateDelimiter) {
        name = name.split(truncateDelimiter)
        name = name[name.length - 1]
    }

    if (forceName) name = forceName

    return (
        <>
            <ButtonGroup
                className={clsx(c.SplitButton, className, {
                    [c.contained]: variant != 'outlined',
                })}
                variant={variant || 'contained'}
                color="secondary"
                size="small"
                aria-label="split button"
            >
                <Button startIcon={startIcon} onClick={handleClick}>
                    {name}
                </Button>
                <Button
                    className={c.arrow}
                    color="secondary"
                    size="small"
                    aria-controls={open ? 'split-button-menu' : undefined}
                    aria-expanded={open ? 'true' : undefined}
                    aria-label="button options"
                    aria-haspopup="menu"
                    onClick={handleToggle}
                    ref={anchorRef}
                >
                    <ArrowDropDownIcon />
                </Button>
            </ButtonGroup>
            <Popper
                className={c.popper}
                open={open}
                anchorEl={anchorRef.current}
                placement="bottom-end"
                transition
                disablePortal
            >
                {({ TransitionProps, placement }) => (
                    <Grow
                        {...TransitionProps}
                        style={{
                            transformOrigin:
                                placement === 'bottom' ? 'center top' : 'center bottom',
                        }}
                    >
                        <Paper>
                            <ClickAwayListener onClickAway={handleClose}>
                                <MenuList className={c.menu}>
                                    {items.map((item, index) => {
                                        let delimitedName
                                        let delimitedPath
                                        if (truncateDelimiter) {
                                            let lastIndex = item.name.lastIndexOf('.')
                                            if (lastIndex != -1) {
                                                delimitedName = item.name.substr(lastIndex + 1)
                                                delimitedPath = item.name.substr(0, lastIndex + 1)
                                            }
                                        }
                                        return (
                                            <MenuItem
                                                key={index}
                                                className={clsx(c.menuli, {
                                                    [c.menuliActive]:
                                                        index === selectedIndex &&
                                                        type !== 'checklist',
                                                })}
                                                selected={
                                                    index === selectedIndex && type !== 'checklist'
                                                }
                                                onClick={(event) =>
                                                    handleMenuItemClick(event, index)
                                                }
                                            >
                                                <div className={c.menuliLeft}>
                                                    {type === 'checklist' && (
                                                        <Checkbox
                                                            className={c.checkbox}
                                                            color="default"
                                                            checked={checkedIndices.includes(index)}
                                                            size="medium"
                                                        />
                                                    )}
                                                    {delimitedPath && delimitedName ? (
                                                        <>
                                                            <div className={c.delimitedPath}>
                                                                {delimitedPath}
                                                            </div>
                                                            <div className={c.menuName}>
                                                                {delimitedName}
                                                            </div>
                                                        </>
                                                    ) : (
                                                        <div
                                                            className={clsx(c.menuName, {
                                                                [c.menuNameBold]:
                                                                    type !== 'checklist' ||
                                                                    checkedIndices.includes(index),
                                                            })}
                                                        >
                                                            {item.name}
                                                        </div>
                                                    )}
                                                </div>
                                                {item.subname != null && (
                                                    <div className={c.menuliSubname}>
                                                        {item.subname}
                                                    </div>
                                                )}
                                            </MenuItem>
                                        )
                                    })}
                                </MenuList>
                            </ClickAwayListener>
                        </Paper>
                    </Grow>
                )}
            </Popper>
        </>
    )
}
