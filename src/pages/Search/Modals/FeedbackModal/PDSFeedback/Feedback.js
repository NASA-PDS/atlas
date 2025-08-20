import React, { useState, useEffect } from 'react'

import { makeStyles } from '@mui/styles'
import { useTheme } from '@mui/material/styles'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogContentText from '@mui/material/DialogContentText'
import DialogTitle from '@mui/material/DialogTitle'
import FormGroup from '@mui/material/FormGroup'
import FormControl from '@mui/material/FormControl'
import FormControlLabel from '@mui/material/FormControlLabel'
import FormLabel from '@mui/material/FormLabel'
import TextField from '@mui/material/TextField'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import IconButton from '@mui/material/IconButton'

import useMediaQuery from '@mui/material/useMediaQuery'

import CloseSharpIcon from '@mui/icons-material/CloseSharp'
import SendSharpIcon from '@mui/icons-material/SendSharp'

const useStyles = makeStyles((theme) => ({
    root: {},
    contents: {
        borderRadius: '4px',
        width: 760,
        overflow: 'hidden',
    },
    contentsMobile: {},
    content: {
        padding: 0,
        paddingTop: '0 !important',
        overflow: 'hidden',
        display: 'flex',
        flexFlow: 'column',
    },
    top: {
        'display': 'flex',
        'justifyContent': 'space-between',
        'height': '49px',
        'borderBottom': '1px solid #E7E7E7',
        '& > div:first-child': {
            display: 'flex',
        },
    },
    title: {
        fontSize: '20px',
        padding: '12px 16px 12px 0px',
        color: 'black',
        fontWeight: 'bold',
    },
    titleLogo: {
        height: '33px',
        padding: '8px',
    },
    closeButton: {
        width: '49px',
        height: '49px',
    },
    form: {
        color: 'black !important',
        padding: '16px',
        paddingBottom: '8px',
        borderBottom: '1px solid #E7E7E7',
        overflow: 'auto',
    },
    introduction: {
        paddingBottom: '8px',
        marginBottom: '8px',
        borderBottom: '1px solid #E7E7E7',
    },
    row: {
        'display': 'flex',
        'justifyContent': 'space-between',
        'height': 32,
        'marginBottom': 8,
        '& > div:last-child': {
            flex: 1,
            background: '#F6F6F6',
        },
        '& .MuiInput-input': {
            paddingLeft: '6px',
        },
        '& .MuiSelect-select': {
            paddingLeft: '6px',
        },
    },
    label: {
        lineHeight: '32px',
        textAlign: 'left',
        width: '80px',
        fontSize: '15px',
        fontWeight: 'bold',
    },
    labelReq: {
        'lineHeight': '32px',
        'textAlign': 'left',
        'fontSize': '15px',
        'fontWeight': 'bold',
        'display': 'flex',
        '& > span:last-child': {
            color: 'crimson',
            fontSize: '13px',
            fontWeight: 500,
            marginLeft: '4px',
        },
    },
    textarea: {
        width: 'calc(100% - 14px) !important',
        minHeight: '120px',
        height: '120px',
        background: '#F6F6F6',
        fontSize: '16px',
        padding: 6,
        fontFamily: 'sans-serif',
    },
    bottom: {
        padding: '8px 0px',
    },
    footer: {
        padding: '8px 16px',
        background: '#E7E7E7',
    },
    footerLeft: {
        fontSize: '12px',
        paddingRight: '6px',
    },
    send: {
        'fontSize': '12px',
        'whiteSpace': 'nowrap',
        'background': '#1c67e3',
        'color': '#F6F6F6',
        '&:hover': {
            background: '#288BFF',
        },
    },
    submitted: {
        color: 'black !important',
        padding: '16px',
        paddingBottom: '8px',
        borderBottom: '1px solid #E7E7E7',
    },
    submittedMessage: {
        paddingBottom: '8px',
        marginBottom: '8px',
        borderBottom: '1px solid #E7E7E7',
    },
    ul: {
        margin: '8px 0px',
    },
    link: {
        '& > a': {
            textDecoration: 'none',
        },
        'margin': '4px 0px',
    },
    sentCont: {
        textAlign: 'center',
        marginBottom: '14px',
    },
    sentIcon: {
        fontSize: '48px',
        color: '#1c67e3',
    },
    sentMessage: {
        fontSize: '18px',
        fontWeight: 'bold',
        textTransform: 'uppercase',
    },
}))

const Feedback = ({ open, verify, handleClose, links, site_key, logoUrl }) => {
    const c = useStyles()

    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [type, setType] = useState('Comment')
    const [message, setMessage] = useState('')
    const [messageInvalid, setMessageInvalid] = useState(false)

    const [submitted, setSubmitted] = useState(false)

    const theme = useTheme()
    const isMobile = useMediaQuery(theme.breakpoints.down('lg'))

    const handleChange = () => {}

    useEffect(() => {
        // opening resets the submitted state to false
        if (open) {
            setMessageInvalid(false)
            setSubmitted(false)
            setName('')
            setEmail('')
            setType('Comment')
            setMessage('')
        }
    }, [open])

    const verifyAndSubmit = (token) => {
        if (typeof verify !== 'function')
            verify = (t, cb) => {
                cb()
            }
        verify(token, () =>
            submitFeedback(
                {
                    name: name,
                    email: email,
                    type: type,
                    comment: message,
                },
                () => {
                    setSubmitted(true)
                },
                () => {
                    setFailed(true)
                    setSubmitted(true)
                }
            )
        )
    }

    const submit = () => {
        if (message.length > 3) {
            setMessageInvalid(false)
            try {
                window.grecaptcha.ready((a, b, c, d) => {
                    try {
                        window.grecaptcha.execute(site_key, { action: 'submit' }).then((token) => {
                            verifyAndSubmit(token)
                        })
                    } catch (err) {
                        console.warn('Captcha failed but ignoring it for now.')
                        verifyAndSubmit()
                    }
                })
            } catch (err) {
                console.warn('Captcha failed but ignoring it for now.')
                verifyAndSubmit()
            }
        } else {
            setMessageInvalid(true)
        }
    }

    return (
        <Dialog
            className={c.root}
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
                    <div>
                        {logoUrl && <img className={c.titleLogo} src={logoUrl} />}
                        <Typography className={c.title} variant="h2">
                            Help Desk
                        </Typography>
                    </div>
                    <IconButton
                        className={c.closeButton}
                        aria-label={'close feedback'}
                        onClick={handleClose}
                        size="large">
                        <CloseSharpIcon fontSize="inherit" />
                    </IconButton>
                </div>
                {!submitted ? (
                    <div className={c.form}>
                        <Typography className={c.introduction}>
                            How can we help you? Send us your question or feedback and we'll get
                            back to you within one business day.
                        </Typography>
                        <div className={c.row}>
                            <Typography className={c.label}>Name</Typography>
                            <TextField value={name} onChange={(e) => setName(e.target.value)} />
                        </div>
                        <div className={c.row}>
                            <Typography className={c.label}>Email</Typography>
                            <TextField value={email} onChange={(e) => setEmail(e.target.value)} />
                        </div>
                        <div className={c.row}>
                            <Typography className={c.label}>Type</Typography>
                            <Select value={type} onChange={(e) => setType(e.target.value)}>
                                <MenuItem value={'Comment'}>Comment</MenuItem>
                                <MenuItem value={'Question'}>Question</MenuItem>
                                <MenuItem value={'Problem/Bug'}>Problem/Bug</MenuItem>
                                <MenuItem value={'Kudos'}>Kudos</MenuItem>
                                <MenuItem value={'Other'}>Other</MenuItem>
                            </Select>
                        </div>
                        <div>
                            <div className={c.labelReq}>
                                <div>Message</div>
                                {messageInvalid && (
                                    <>
                                        <span>* </span>
                                        <span>(required)</span>
                                    </>
                                )}
                            </div>
                            <textarea
                                className={c.textarea}
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                            />
                        </div>
                    </div>
                ) : (
                    <div className={c.submitted}>
                        <div className={c.sentCont}>
                            <SendSharpIcon className={c.sentIcon} />
                            <Typography className={c.sentMessage}>
                                Your message is on its way.
                            </Typography>
                        </div>
                        <Typography className={c.submittedMessage}>
                            Thank you for making the PDS a better site. If you provided an email
                            address, a PDS representative will get back to you as soon as possible.
                        </Typography>
                        {links && links.length > 0 && (
                            <div className={c.bottom}>
                                <Typography>
                                    In the meantime, you may find the following links helpful:
                                </Typography>
                                <ul className={c.ul}>
                                    {links.map((item, idx) => (
                                        <li key={idx} className={c.link}>
                                            <a href={item.link}>{item.name}</a>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                )}
            </DialogContent>
            <DialogActions className={c.footer}>
                {!submitted ? (
                    <>
                        <div className={c.footerLeft}>
                            This site is protected by reCAPTCHA and the Google{' '}
                            <a href="https://policies.google.com/privacy" target="_blank">
                                Privacy Policy
                            </a>{' '}
                            and{' '}
                            <a href="https://policies.google.com/terms" target="_blank">
                                Terms of Service
                            </a>{' '}
                            apply.
                        </div>
                        <div className={c.footerRight}>
                            <Button
                                className={c.send}
                                onClick={submit}
                                aria-label={'send feedback'}
                            >
                                Send Feedback
                            </Button>
                        </div>
                    </>
                ) : (
                    <>
                        <div className={c.footerLeft}></div>
                        <div className={c.footerRight}>
                            <Button
                                className={c.send}
                                onClick={handleClose}
                                aria-label={'close feedback'}
                            >
                                Close
                            </Button>
                        </div>
                    </>
                )}
            </DialogActions>
        </Dialog>
    );
}

const FEEDBACK_URL = 'https://pds.nasa.gov/email-service/SubmitFeedback'

const submitFeedback = (data, successCb, failureCb) => {
    let body = `subject=Feedback from ${window.location.hostname}&content=`
    for (let key in data) body += `${key}: ${data[key]}\n`
    body += `path: ${window.location.href}`

    // Skip captcha for now
    fetch(FEEDBACK_URL, {
        method: 'POST',
        body: body,
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
    })
        .then((res) => res.text())
        .then((text) => {
            successCb(text)
        })
        .catch((err) => {
            console.error(err)
            failureCb(err)
        })
}

export default Feedback
