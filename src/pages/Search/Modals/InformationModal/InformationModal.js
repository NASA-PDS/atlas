import React from 'react'
import { useDispatch, useSelector } from 'react-redux'

import { setModal } from '../../../../core/redux/actions/actions.js'

import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import IconButton from '@mui/material/IconButton'
import CloseSharpIcon from '@mui/icons-material/CloseSharp'

import { makeStyles, useTheme } from '@mui/material/styles'
import useMediaQuery from '@mui/material/useMediaQuery'

import NASALogo from '../../../../media/images/nasa-logo.svg'

import { publicUrl } from '../../../../core/constants'

const useStyles = makeStyles((theme) => ({
    InformationModal: {
        margin: theme.headHeights[1],
        [theme.breakpoints.down('xs')]: {
            margin: '6px',
        },
    },
    contents: {
        background: theme.palette.primary.main,
        width: '960px',
        maxWidth: '960px',
    },
    contentsMobile: {
        background: theme.palette.primary.main,
        height: '100%',
    },
    content: {
        padding: '20px 40px 8px 40px',
        height: `calc(100% - ${theme.headHeights[2]}px)`,
        textAlign: 'center',
    },
    closeIcon: {
        padding: theme.spacing(1.5),
        height: '100%',
        margin: '4px 0px',
    },
    flexBetween: {
        display: 'flex',
        justifyContent: 'space-between',
    },
    head: {
        display: 'flex',
        justifyContent: 'center',
        [theme.breakpoints.down('xs')]: {
            flexFlow: 'column',
        },
    },
    closeIcon: {
        padding: theme.spacing(1.5),
        margin: '4px',
        position: 'absolute',
        top: '0px',
        right: '0px',
    },
    logo: {
        '& > img': {
            width: '100px',
            height: '100px',
            marginLeft: '12px',
        },
    },
    pdsAndNode: {
        textAlign: 'left',
        padding: '26px 0px',
        [theme.breakpoints.down('xs')]: {
            paddingTop: '4px',
        },
    },
    pds: {
        fontSize: '18px',
        textTransform: 'uppercase',
        [theme.breakpoints.down('xs')]: {
            textAlign: 'center',
        },
    },
    node: {
        fontSize: '24px',
        [theme.breakpoints.down('xs')]: {
            textAlign: 'center',
        },
    },
    title: {
        margin: `0px 0px ${theme.spacing(6)}px 0px`,
        padding: '0px 2px',
        fontSize: '30px',
        fontWeight: 'bold',
        lineHeight: '28px',
        textTransform: 'uppercase',
    },
    description: {
        textAlign: 'justify',
    },
    message: {
        margin: `${theme.spacing(4)}px 0px`,
    },
    aLink: {
        color: 'link',
        cursor: 'pointer',
        textDecoration: 'underline',
        fontWeight: 'bold',
    },
    metadata: {
        '& > p': {
            fontFamily: 'monospace',
        },
    },
    footer: {
        'backgroundColor': 'rgba(0,0,0,0)',
        'display': 'flex',
        'justifyContent': 'space-between',
        '& .MuiButton-text': {
            color: theme.palette.primary.light,
        },
    },
}))

const InformationModal = (props) => {
    const {} = props
    const c = useStyles()

    const theme = useTheme()
    const isMobile = useMediaQuery(theme.breakpoints.down('md'))

    const dispatch = useDispatch()
    const modal = useSelector((state) => {
        const m = state.getIn(['modals', 'information'])
        if (typeof m.toJS === 'function') return m.toJS()
        return m
    })
    const open = modal !== false
    const handleClose = () => {
        // close modal
        dispatch(setModal(false))
    }

    const openFeedback = () => {
        dispatch(setModal('feedback'))
    }

    const newsPath = `https://pds-imaging.jpl.nasa.gov/`

    return (
        <Dialog
            className={c.InformationModal}
            fullScreen={isMobile}
            open={open}
            onClose={handleClose}
            aria-labelledby="responsive-dialog-title"
            PaperProps={{
                className: isMobile ? c.contentsMobile : c.contents,
            }}
        >
            <DialogContent className={c.content}>
                <div className={c.top}>
                    <div className={c.head}>
                        <div className={c.logo}>
                            <img src={NASALogo} alt={'NASA Logo'} />
                        </div>
                        <div className={c.pdsAndNode}>
                            <Typography className={c.pds} variant="h3">
                                Planetary Data System
                            </Typography>
                            <Typography className={c.node} variant="h3">
                                Cartography and Imaging Sciences
                            </Typography>
                        </div>
                    </div>
                    <Typography className={c.title} variant="h2">
                        Atlas
                    </Typography>
                    <IconButton
                        className={c.closeIcon}
                        title="Close"
                        aria-label="close"
                        onClick={handleClose}
                    >
                        <CloseSharpIcon fontSize="inherit" />
                    </IconButton>
                </div>
                <div className={c.bottom}>
                    <div className={c.description}>
                        <Typography>
                            The Cartography and Imaging Sciences Node of the Planetary Data System
                            provides a set of applications under the name, "Atlas". These
                            applications allow users to explore, search, and download imaging and
                            data products that have been collected from a variety NASA's planetary
                            space missions. Through the use of these tools, users have access to
                            petabytes of imaging data in one central location. This collection of
                            data is updated periodically and is reported within the{' '}
                            <a className={c.aLink} href={newsPath} rel="noopener">
                                Latest News
                            </a>{' '}
                            section of our home page.
                        </Typography>
                    </div>
                    <div className={c.message}>
                        <Typography>
                            If you have questions, want to share feedback, or need support,{' '}
                            <a
                                className={c.aLink}
                                aria-label="give feedback"
                                onClick={openFeedback}
                            >
                                please send us a message
                            </a>
                            .
                        </Typography>
                    </div>
                    <div className={c.metadata}>
                        <Typography>Version Number: {process.env.REACT_APP_VERSION}</Typography>
                        <Typography>
                            Clearance Number: {process.env.REACT_APP_CLEARANCE_NUMBER}
                        </Typography>
                        <Typography>Last Updated: {process.env.REACT_APP_LAST_UPDATED}</Typography>
                    </div>
                </div>
            </DialogContent>
            <DialogActions className={c.footer}>
                <div className={c.footerLeft}>
                    <Button href="https://www.jpl.nasa.gov/jpl-image-use-policy">
                        Image Use Policy
                    </Button>
                    <Button href="https://www.jpl.nasa.gov/caltechjpl-privacy-policies-and-important-notices">
                        Privacy Policy
                    </Button>
                </div>
                <div className={c.footerRight}>
                    <Button title="Close" aria-label="close" onClick={handleClose}>
                        Close
                    </Button>
                </div>
            </DialogActions>
        </Dialog>
    )
}

InformationModal.propTypes = {}

export default InformationModal
