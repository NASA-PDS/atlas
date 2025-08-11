import React, { useState, useEffect, useRef } from 'react'
import PropTypes from 'prop-types'

import clsx from 'clsx'

import { makeStyles, useTheme } from '@mui/material/styles'
import { getExtension } from '../../core/utils'

import ImageIcon from '@mui/icons-material/Image'
import InsertDriveFileOutlinedIcon from '@mui/icons-material/InsertDriveFileOutlined'
import FolderIcon from '@mui/icons-material/Folder'

const useStyles = makeStyles((theme) => ({
    ProductIcons: {
        color: 'white',
        opacity: 0.7,
    },
    model: {
        'position': 'absolute',
        'top': '50%',
        'left': '50%',
        'transformStyle': 'preserve-3d',
        'transform': 'rotateX(-30deg) rotateY(-45deg)',

        '& > .face': {
            position: 'absolute',
        },

        '& > .-front': {
            width: '34px',
            height: '34px',
            transform: 'translate(-50%, -50%) rotateY(0deg) translateZ(17px)',
            background: 'rgba(246, 187, 40, 1)',
            border: '1px solid black',
        },

        '& > .-left': {
            width: '34px',
            height: '34px',
            transform: 'translate(-50%, -50%) rotateY(90deg) translateZ(17px)',
            background: 'rgba(211, 152, 5, 1)',
            border: '1px solid black',
        },

        '& > .-top': {
            width: '34px',
            height: '34px',
            transform: 'translate(-50%, -50%) rotateX(90deg) translateZ(17px)',
            background: 'rgba(251, 192, 45, 1)',
            border: '1px solid black',
        },

        '& .-bottom': {
            width: '34px',
            height: '34px',
            transform: 'translate(-50%, -50%) rotateX(-90deg) translateZ(17px)',
            background: 'rgba(171, 112, -35, 1)',
            border: '1px solid black',
        },

        '& > .-right': {
            width: '34px',
            height: '34px',
            transform: 'translate(-50%, -50%) rotateY(-90deg) translateZ(17px)',
            background: 'rgba(211, 152, 5, 1)',
            border: '1px solid black',
        },

        '& > .-back': {
            width: '34px',
            height: '34px',
            transform: 'translate(-50%, -50%) rotateY(180deg) translateZ(17px)',
            background: 'rgba(191, 132, -15, 1)',
            border: '1px solid black',
        },
    },
    default: {
        fontSize: '42px',
    },
    small: {
        transform: 'scale(0.4)',
    },
    dark: {
        color: 'black',
    },
    missing: {
        color: theme.palette.accent.main,
    },
    iconSvg: {
        width: '48px',
        height: '48px',
        paddingLeft: '2px',
    },
}))

window.addEventListener('mousemove', function (e) {
    const cubes = document.getElementsByClassName('modelIcon')
    Array.from(cubes).forEach((cube) => {
        const bcr = cube.getBoundingClientRect()
        const rY = (e.clientX - bcr.x) / 32
        const rX = -(e.clientY - bcr.y) / 32
        cube.style.transition = 'unset'
        cube.style.transform = `rotateX(${rX}deg) rotateY(${rY}deg)`
    })
})

const ProductIcons = (props) => {
    const { filename, size, color, type } = props
    const c = useStyles()

    let Icon

    let isMissing = false

    if (type) {
        switch (type) {
            case 'filter':
                Icon = (
                    <svg className={clsx(c.default, c.iconSvg)} viewBox="0 0 24 24">
                        <path
                            fill="currentColor"
                            d="M15,19.88C15.04,20.18 14.94,20.5 14.71,20.71C14.32,21.1 13.69,21.1 13.3,20.71L9.29,16.7C9.06,16.47 8.96,16.16 9,15.87V10.75L4.21,4.62C3.87,4.19 3.95,3.56 4.38,3.22C4.57,3.08 4.78,3 5,3V3H19V3C19.22,3 19.43,3.08 19.62,3.22C20.05,3.56 20.13,4.19 19.79,4.62L15,10.75V19.88M7.04,5L11,10.06V15.58L13,17.58V10.05L16.96,5H7.04Z"
                        />
                    </svg>
                )
                break
                break
            case 'volume':
                Icon = (
                    <svg className={clsx(c.default, c.iconSvg)} viewBox="0 0 24 24">
                        <path
                            fill="currentColor"
                            d="M2,10.96C1.5,10.68 1.35,10.07 1.63,9.59L3.13,7C3.24,6.8 3.41,6.66 3.6,6.58L11.43,2.18C11.59,2.06 11.79,2 12,2C12.21,2 12.41,2.06 12.57,2.18L20.47,6.62C20.66,6.72 20.82,6.88 20.91,7.08L22.36,9.6C22.64,10.08 22.47,10.69 22,10.96L21,11.54V16.5C21,16.88 20.79,17.21 20.47,17.38L12.57,21.82C12.41,21.94 12.21,22 12,22C11.79,22 11.59,21.94 11.43,21.82L3.53,17.38C3.21,17.21 3,16.88 3,16.5V10.96C2.7,11.13 2.32,11.14 2,10.96M12,4.15V4.15L12,10.85V10.85L17.96,7.5L12,4.15M5,15.91L11,19.29V12.58L5,9.21V15.91M19,15.91V12.69L14,15.59C13.67,15.77 13.3,15.76 13,15.6V19.29L19,15.91M13.85,13.36L20.13,9.73L19.55,8.72L13.27,12.35L13.85,13.36Z"
                        />
                    </svg>
                )
                break
            case 'directory':
                Icon = <FolderIcon className={clsx(c.default)} />
                break
            case 'file':
                Icon = <InsertDriveFileOutlinedIcon className={clsx(c.default)} />
                break
            default:
                isMissing = true
                Icon = <ImageIcon className={clsx(c.default)} />
        }
    } else {
        const ext = getExtension(filename, true)
        switch (ext) {
            case 'obj':
                Icon = (
                    <div className={clsx(c.model, 'modelIcon')}>
                        <div className="face -front" />
                        <div className="face -left" />
                        <div className="face -top" />
                        <div className="face -bottom" />
                        <div className="face -right" />
                        <div className="face -back" />
                    </div>
                )
                break
            default:
                isMissing = true
                Icon = <ImageIcon className={clsx(c.default)} />
        }
    }

    return (
        <div
            className={clsx(c.ProductIcons, {
                [c.small]: size === 'small',
                [c.dark]: color === 'dark',
                [c.missing]: isMissing === true,
            })}
        >
            {Icon}
        </div>
    )
}

ProductIcons.propTypes = {
    filename: PropTypes.string.isRequired,
}

export default ProductIcons
