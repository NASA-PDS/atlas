import React, { useState, useEffect } from 'react'
import { useDispatch } from 'react-redux'

import {
    setModal,
    queryFilexRegex,
    setFilexPreview,
    addToCart,
    setSnackBarText,
} from '../../../../core/redux/actions/actions.js'
import {
    getIn,
    getPDSUrl,
    getFilename,
    abbreviateNumber,
    getExtension,
    humanFileSize,
} from '../../../../core/utils'

import Typography from '@mui/material/Typography'
import Paper from '@mui/material/Paper'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import CloseSharpIcon from '@mui/icons-material/CloseSharp'
import TextField from '@mui/material/TextField'
import SearchIcon from '@mui/icons-material/Search'
import GetAppIcon from '@mui/icons-material/GetApp'
import ImageIcon from '@mui/icons-material/Image'
import InsertDriveFileOutlinedIcon from '@mui/icons-material/InsertDriveFileOutlined'
import FolderIcon from '@mui/icons-material/Folder'
import HelpOutlineIcon from '@mui/icons-material/HelpOutline'
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart'
import Tooltip from '@mui/material/Tooltip'
import InputAdornment from '@mui/material/InputAdornment'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import SpellcheckIcon from '@mui/icons-material/Spellcheck'
import Pagination from '@mui/material/Pagination'
import LinearProgress from '@mui/material/LinearProgress'

import { makeStyles } from '@mui/styles'
import { useTheme } from '@mui/material/styles'
import useMediaQuery from '@mui/material/useMediaQuery'

import { publicUrl, ES_PATHS, IMAGE_EXTENSIONS } from '../../../../core/constants'
import { streamDownloadFile } from '../../../../core/downloaders/ZipStream.js'

import clsx from 'clsx'
import ReactMarkdown from 'react-markdown'

const useStyles = makeStyles((theme) => ({
    RegexModal: {
        position: 'absolute',
        width: '100%',
        height: '100%',
        top: 0,
        left: 0,
        background: theme.palette.swatches.grey.grey0,
        zIndex: 998,
        boxShadow: 'inset -1px 0px 5px 0px rgba(0,0,0,0.2)',
    },
    contents: {
        width: '100%',
        height: '100%',
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
    flexBetween1: {
        display: 'flex',
        justifyContent: 'space-between',
        flex: 1,
    },
    flex: {
        display: 'flex',
    },
    top: {
        display: 'flex',
        justifyContent: 'space-between',
        height: '40px',
        background: theme.palette.swatches.grey.grey0,
        borderBottom: `1px solid ${theme.palette.swatches.grey.grey300}`,
    },
    closeIcon: {
        padding: theme.spacing(1.5),
        margin: '4px',
    },
    title: {
        fontSize: '18px',
        fontWeight: 'bold',
        lineHeight: '42px',
        textTransform: 'uppercase',
    },
    subtitle: {
        'padding': '0px 10px',
        'fontSize': '14px',
        'lineHeight': '40px',
        'fontFamily': 'monospace',
        '& span:first-child': {
            color: 'darkgoldenrod',
            fontSize: '12px',
            fontWeight: 500,
            textTransform: 'uppercase',
            fontFamily: 'PublicSans',
            paddingRight: '6px',
        },
        '& span:last-child': {
            fontWeight: 'bold',
            fontSize: '16px',
            color: theme.palette.accent.main,
        },
    },
    bottom: {
        display: 'flex',
        flexFlow: 'column',
        width: '100%',
        height: 'calc(100% - 41px)',
    },
    input: {
        width: '100%',
        background: theme.palette.swatches.grey.grey100,
        borderBottom: `1px solid ${theme.palette.accent.main}`,
    },
    inputBar: {
        'height': '40px',
        'width': '100%',
        'display': 'flex',
        '& > div > div:first-child': {
            width: '100%',
            height: '100%',
        },
        '& > div > div:first-child > div:first-child': {
            width: '100%',
            height: '100%',
        },
        '& input': {
            width: '100%',
            padding: '0px 84px 0px 3px',
            color: theme.palette.accent.main,
            fontFamily: 'monospace',
        },
    },
    regexSearchInput: {
        '& input': {
            fontWeight: 'bold',
            fontSize: '14px',
        },
        '& input::placeholder': {
            fontWeight: 'initial',
            fontSize: '14px',
        },
        '& .MuiInputAdornment-root': {
            marginTop: '0px !important',
        },
        '& .MuiFilledInput-underline:after': {
            borderBottom: `2px solid ${theme.palette.accent.main}`,
        },
    },
    regexSearchSearch: {
        padding: '4px 40px',
        borderRadius: '0px',
        boxShadow: 'none',
    },
    helpButton: {
        height: '40px',
        width: '40px',
    },
    help: {
        'height': '0px',
        'overflow': 'hidden',
        'pointerEvents': 'none',
        'padding': '0px 25%',
        'transition': 'all 0.2s ease-in-out',
        'background': theme.palette.swatches.grey.grey0,
        '& code': {
            padding: '0px 4px',
            borderRadius: '2px',
            background: `rgba(0,0,0,0.07)`,
            borderBottom: `2px solid ${theme.palette.accent.main}`,
        },
        '& p': {
            fontSize: '16px',
        },
        '& li': {
            fontSize: '16px',
            lineHeight: '22px',
            marginBottom: '5px',
        },
        '& h2': {
            color: 'darkgoldenrod',
        },
        '& h4 > code': {
            fontSize: '20px',
        },
    },
    helpOpen: {
        pointerEvents: 'all',
        height: '100%',
        overflowY: 'auto',
        paddingTop: '20px',
        paddingBottom: '20px',
    },
    closeHelpIcon: {
        padding: theme.spacing(1.5),
        margin: '4px',
        position: 'absolute',
        top: '120px',
        right: '40px',
        display: 'none',
    },
    closeHelpIconOpen: {
        display: 'block',
    },
    results: {
        flex: 1,
        overflowY: 'auto',
    },
    list: {
        listStyleType: 'none',
        margin: 0,
        padding: `2px 0px`,
    },
    listItem: {
        'display': 'flex',
        'height': '32px',
        'lineHeight': '32px',
        'padding': `0px 12px 0px 4px`,
        'marginLeft': theme.spacing(1),
        'borderRadius': '4px 0px 0px 4px',
        'cursor': 'pointer',
        //'transition': 'background 0.1s ease-in',
        'overflow': 'hidden',
        'borderBottom': `1px solid ${theme.palette.swatches.grey.grey150}`,
        '&:hover': {
            'background': theme.palette.swatches.grey.grey150,
            '& .listItemButtons': {
                pointerEvents: 'inherit',
                opacity: 1,
            },
        },
        '& > div:last-child': {
            flex: 1,
        },
    },
    listItemButtons: {
        lineHeight: '33px',
        transition: 'opacity 0.2s ease-out',
        opacity: 0,
        pointerEvents: 'none',
    },
    listItemButtonsActive: {
        'background': theme.palette.accent.main,
        '& button': {
            color: theme.palette.swatches.grey.grey0,
        },
    },
    listItemLessPadding: {
        paddingRight: '0px',
    },
    listItemFilter: {
        justifyContent: 'space-between',
        padding: `0px ${theme.spacing(2)} 0px 0px`,
    },
    liType: {
        fontSize: '24px',
        padding: '2px',
    },
    liName: {
        margin: `0px ${theme.spacing(1.5)}`,
        lineHeight: '32px',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
    },
    liNameMobile: {
        lineHeight: `${theme.headHeights[3]}px`,
    },
    liSize: {
        marginRight: '10px',
        fontSize: '12px',
        color: theme.palette.swatches.grey.grey500,
        fontFamily: 'monospace',
    },
    liSizeActive: {
        color: theme.palette.text.secondary,
    },
    listItemActive: {
        background: `${theme.palette.accent.main} !important`,
        color: theme.palette.text.secondary,
    },
    listItemMobile: {
        height: `${theme.headHeights[3]}px`,
        lineHeight: `${theme.headHeights[3]}px`,
        fontSize: '16px',
    },
    button: {
        padding: '4px 4px 3px 4px',
        marginTop: '-4px',
    },
    bottomBar: {
        display: 'flex',
        justifyContent: 'space-between',
        background: theme.palette.swatches.grey.grey50,
        borderTop: `1px solid ${theme.palette.swatches.grey.grey300}`,
        height: '40px',
        width: '100%',
    },
    pagination: {
        display: 'flex',
        justifyContent: 'center',
    },
    inputWrapper: {
        width: '100%',
        height: '100%',
        position: 'relative',
    },
    flags: {
        position: 'absolute',
        right: 0,
        top: 0,
        display: 'flex',
    },
    flagIcon: {
        'padding': '4px',
        'margin': '5px',
        'borderRadius': '4px',
        'transition': 'all 0.2s ease-in-out',
        '&:hover': {
            background: theme.palette.swatches.grey.grey600,
            color: theme.palette.swatches.grey.grey0,
        },
    },
    flagOn: {
        background: theme.palette.swatches.grey.grey700,
        color: theme.palette.swatches.grey.grey0,
    },
    resultCount: {
        lineHeight: '40px',
        padding: '0px 16px',
        fontStyle: 'italic',
    },
    loading: {
        'position': 'absolute',
        'width': '100%',
        '& .MuiLinearProgress-barColorPrimary': {
            background: theme.palette.swatches.blue.blue500,
        },
        '& > div': {
            height: '2px !important',
        },
    },
    noResults: {
        'position': 'absolute',
        'top': '50%',
        'left': '50%',
        'transform': 'translateX(-50%) translateY(-50%)',
        'background': theme.palette.swatches.grey.grey700,
        'color': theme.palette.swatches.grey.grey0,
        'padding': '10px 20px',
        'fontSize': '16px',
        'lineHeight': '24px',
        'textAlign': 'center',
        '& div:first-child': {
            fontWeight: 'bold',
        },
    },
    addAllCart: {
        'padding': '4px 12px',
        'borderRadius': '4px',
        'boxShadow': 'none',
        'height': '28px',
        'margin': '6px 0px',
        'background': theme.palette.swatches.grey.grey600,
        'color': theme.palette.swatches.grey.grey0,
        '&:hover': {
            background: theme.palette.swatches.grey.grey500,
        },
    },
}))

let regexSearchValue = null

const RegexModal = (props) => {
    const { modal } = props
    const c = useStyles()

    const theme = useTheme()
    const isMobile = useMediaQuery(theme.breakpoints.down('lg'))

    const dispatch = useDispatch()

    const [helpOpen, setHelpOpen] = useState(false)
    const [caseSensitive, setCaseSensitive] = useState(false)
    const [includeDirectories, setIncludeDirectories] = useState(false)
    const [results, setResults] = useState(false)
    const [loading, setLoading] = useState(false)
    const [total, setTotal] = useState(0)
    const [page, setPage] = useState(1)
    const [pageSize, setPageSize] = useState(200)
    const [selectedUri, setSelectedUri] = useState(false)

    const open = modal !== false
    if (regexSearchValue == null && modal?.uri && typeof modal.uri === 'string')
        regexSearchValue = modal.uri.replace(/\//g, '\\/').replace(/:/g, '\\:') + '.*'
    const handleClose = () => {
        // close modal
        regexSearchValue = null
        dispatch(setModal(false))
    }

    const regexSearch = () => {
        if (!modal?.uri) return
        setHelpOpen(false)
        setPage(1)
        setLoading(true)
        dispatch(
            queryFilexRegex(
                regexSearchValue,
                0,
                {
                    caseSensitive: caseSensitive,
                    pageSize: pageSize,
                    includeDirectories: includeDirectories,
                },
                (res) => {
                    setLoading(false)
                    const newResults = getIn(res, ['data', 'hits', 'hits'], [])
                    setResults(newResults)
                    const newTotal = getIn(res, ['data', 'hits', 'total', 'value'], 0)
                    setTotal(newTotal)
                }
            )
        )
    }

    useEffect(() => {
        if (open) {
            regexSearch()
        }
    }, [open])

    if (!open) return null
    return (
        <div className={c.RegexModal}>
            <div className={c.contents}>
                <div className={c.top}>
                    <div className={c.flex}>
                        <Tooltip title="Help" arrow>
                            <IconButton
                                className={c.helpButton}
                                aria-label="regex help"
                                onClick={() => {
                                    setHelpOpen(!helpOpen)
                                }}
                                size="large">
                                <HelpOutlineIcon size="small" />
                            </IconButton>
                        </Tooltip>
                        <Typography className={c.title} variant="h2">
                            URI Regex Search
                        </Typography>
                    </div>

                    <div className={c.flex}>
                        <Button
                            className={c.addAllCart}
                            size="small"
                            variant="contained"
                            endIcon={<AddShoppingCartIcon />}
                            onClick={() => {
                                dispatch(addToCart('regex', 'lastRegexQuery'))

                                dispatch(setSnackBarText('Added to Cart!', 'success'))
                            }}
                        >
                            Add All Results to Cart
                        </Button>
                        <Tooltip title="Close" arrow>
                            <IconButton
                                className={c.closeIcon}
                                aria-label="close"
                                onClick={handleClose}
                                size="large">
                                <CloseSharpIcon fontSize="inherit" />
                            </IconButton>
                        </Tooltip>
                    </div>
                </div>
                <div className={c.bottom}>
                    <div className={c.input}>
                        <div className={c.inputBar}>
                            <div className={c.inputWrapper}>
                                <TextField
                                    className={c.regexSearchInput}
                                    placeholder="Enter a Regular Expression"
                                    defaultValue={regexSearchValue}
                                    variant="filled"
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <SearchIcon fontSize="small" />
                                            </InputAdornment>
                                        ),
                                    }}
                                    onChange={(e) => {
                                        regexSearchValue = e.target.value
                                    }}
                                    onKeyDown={(e) => {
                                        // Search when enter pressed
                                        if (e.keyCode == 13) regexSearch()
                                    }}
                                />
                                <div className={c.flags}>
                                    <Tooltip
                                        title={`Case Sensitivity ${
                                            caseSensitive ? '(ON)' : '(OFF)'
                                        }`}
                                        arrow
                                    >
                                        <IconButton
                                            className={clsx(c.flagIcon, {
                                                [c.flagOn]: caseSensitive,
                                            })}
                                            aria-label="toggle case-sensitivity"
                                            onClick={() => {
                                                setCaseSensitive(!caseSensitive)
                                            }}
                                            size="large">
                                            <SpellcheckIcon fontSize="inherit" />
                                        </IconButton>
                                    </Tooltip>
                                    <Tooltip
                                        title={`Include Directories ${
                                            includeDirectories ? '(ON)' : '(OFF)'
                                        }`}
                                        arrow
                                    >
                                        <IconButton
                                            className={clsx(c.flagIcon, {
                                                [c.flagOn]: includeDirectories,
                                            })}
                                            aria-label="toggle include directories"
                                            onClick={() => {
                                                setIncludeDirectories(!includeDirectories)
                                            }}
                                            size="large">
                                            <FolderIcon fontSize="inherit" />
                                        </IconButton>
                                    </Tooltip>
                                </div>
                            </div>
                            <Button
                                className={c.regexSearchSearch}
                                size="small"
                                variant="contained"
                                endIcon={<ArrowForwardIcon />}
                                onClick={regexSearch}
                            >
                                Search
                            </Button>
                        </div>
                        {loading ? (
                            <div className={c.loading}>
                                <LinearProgress />
                            </div>
                        ) : null}
                    </div>
                    <div
                        className={clsx(c.help, {
                            [c.helpOpen]: helpOpen,
                        })}
                    >
                        <ReactMarkdown linkTarget="_blank">
                            {[
                                `# Help - Regular Expressions`,
                                `A regular expression (regex) is a way to match patterns in data using placeholder characters, called operators.`,
                                `AtlasIV uses Elasticsearch to perform search queries. Full regular expression documentation can be found [here.](https://www.elastic.co/guide/en/elasticsearch/reference/7.10/regexp-syntax.html)`,
                                ``,
                                `## Quick and Common Examples`,
                                '- `.*` - Search for everything',
                                '- `.*\\.IMG` - Search for everything that ends with ".IMG"',
                                '- `.*\\/00<090-300>\\/.*` - Search for everything with a Sol directory of 00090 to 00300',
                                ``,
                                `## URI`,
                                'Regex queries are done over the `uri` field. `uri`s are unique AtlasIV cross-pds-standard IDs that are applied to each file and directory.',
                                ``,
                                '- `uri` is of the form:',
                                '  `atlas:{standard}:{mission}:{spacecraft}:/{bundleName?}{restOfPath?}`',
                                '  - _standard:_ `pds3` or `pds4`',
                                '  - _mission:_ Standardized mission name.',
                                '  - _spacecraft:_ Standardized spacecraft name.',
                                "  - _bundleName:_ Name of the volume or bundle. Optional but the only uri where the bundleName does not exist are on the mission-spacecraft's root directory (`atlas:{standard}:{mission}:{spacecraft}:/`)",
                                '  - _restOfPath:_ Rest of path to directory or file. Directory uris do not end with a `/`. Optional but the only uris without a restOfPath are root directories and bundle directories.',
                                ``,
                                `## Reserved characters`,
                                `All Unicode characters are supported, however, the following characters are reserved as operators:`,
                                ``,
                                '`. ? + * | { } [ ] ( ) " \\`',
                                ``,
                                `Depending on the optional operators enabled, the following characters may also be reserved:`,
                                ``,
                                '`# @ & < > ~`',
                                ``,
                                `To use one of these characters literally, escape it with a preceding backslash or surround it with double quotes. For example:`,
                                ``,
                                "`\\@` - renders as a literal '@'\n",
                                "`\\\\` - renders as a literal '\\\\'\n",
                                `\`"john@smith.com"\` - renders as 'john@smith.com'`,
                                ``,
                                `### Standard operators`,
                                `The following standard operators are supported:`,
                                ``,
                                '#### `.`',
                                `- Matches any character. For example:`,
                                ``,
                                "  - `ab.` - matches 'aba', 'abb', 'abz', etc.",
                                '#### `?`',
                                `- Repeat the preceding character zero or one times. Often used to make the preceding character optional. For example:`,
                                ``,
                                "  - `abc?` - matches 'ab' and 'abc'",
                                '#### `+`',
                                `- Repeat the preceding character one or more times. For example:`,
                                ``,
                                "  - `ab+` - matches 'ab', 'abb', 'abbb', etc.",
                                '#### `*`',
                                `- Repeat the preceding character zero or more times. For example:`,
                                ``,
                                "  - `ab*` - matches 'a', 'ab', 'abb', 'abbb', etc.",
                                '  - `.*` - matches as a full wildcard',
                                '#### `{}`',
                                `- Minimum and maximum number of times the preceding character can repeat. For example:`,
                                ``,
                                "  - `a{2}` - matches 'aa'",
                                "  - `a{2,4}` - matches 'aa', 'aaa', and 'aaaa'",
                                "  - `a{2,}` - matches 'a' repeated two or more times",
                                '#### `|`',
                                `- OR operator. The match will succeed if the longest pattern on either the left side OR the right side matches. For example:`,
                                ``,
                                "  - `abc|xyz` - matches 'abc' and 'xyz'",
                                '#### `( … )`',
                                `- Forms a group. You can use a group to treat part of the expression as a single character. For example:`,
                                ``,
                                "  - `abc(def)?` - matches 'abc' and 'abcdef' but not 'abcd'",
                                '#### `[ … ]`',
                                `- Match one of the characters in the brackets. For example:`,
                                ``,
                                "  - `[abc]` - matches 'a', 'b', 'c'",
                                ``,
                                `- Inside the brackets, - indicates a range unless - is the first character or escaped. For example:`,
                                ``,
                                "  - `[a-c]` - matches 'a', 'b', or 'c'",
                                "  - `[-abc]` - '-' is first character. Matches '-', 'a', 'b', or 'c'",
                                "  - `[abc-]` - Escapes '-'. Matches 'a', 'b', 'c', or '-'",
                                `- A ^ before a character in the brackets negates the character or range. For example:`,
                                ``,
                                "  - `[^abc]` - matches any character except 'a', 'b', or 'c'",
                                "  - `[^a-c]` - matches any character except 'a', 'b', or 'c'",
                                "  - `[^-abc]` - matches any character except '-', 'a', 'b', or 'c'",
                                "  - `[^abc-]` - matches any character except 'a', 'b', 'c', or '-'",
                                ``,
                                '#### `~`',
                                '- You can use `~` to negate the shortest following pattern. For example:',
                                ``,
                                "  - `a~bc` - matches 'adc' and 'aec' but not 'abc'",
                                ``,
                                '#### `<>`',
                                '- You can use `<>` to match a numeric range. For example:',
                                ``,
                                "  - `foo<1-100>` - matches 'foo1', 'foo2' ... 'foo99', 'foo100'",
                                "  - `foo<01-100>` - matches 'foo01', 'foo02' ... 'foo99', 'foo100'",
                                ``,
                                '#### `&`',
                                `- Acts as an AND operator. The match will succeed if patterns on both the left side AND the right side matches. For example:`,
                                ``,
                                "  - `aaa.+&.+bbb` - matches 'aaabbb'",
                                ``,
                                '#### `@`',
                                '- You can use `@` to match any entire string.',
                                ``,
                                '- You can combine the `@` operator with `&` and `~` operators to create an "everything except" logic. For example:',
                                ``,
                                "  - `@&~(abc.+)` - matches everything except terms beginning with 'abc'",
                                ``,
                                `## Unsupported operators`,
                                '- The regular expression engine, Lucene, does not support anchor operators, such as `^` (beginning of line) or `$` (end of line). To match a term, the regular expression must match the entire string.',
                            ].join('\n')}
                        </ReactMarkdown>
                        <Tooltip title="Close Help" arrow>
                            <IconButton
                                className={clsx(c.closeHelpIcon, {
                                    [c.closeHelpIconOpen]: helpOpen,
                                })}
                                aria-label="close help"
                                onClick={() => {
                                    setHelpOpen(false)
                                }}
                                size="large">
                                <CloseSharpIcon fontSize="inherit" />
                            </IconButton>
                        </Tooltip>
                    </div>
                    <div className={c.results}>
                        {results && results.length > 0 ? (
                            results.map((r, idx) => {
                                const s = r._source || {}
                                const result = s.archive || {}
                                const pds4_label = s.pds4_label || {}

                                return (
                                    <li
                                        key={idx}
                                        className={clsx(c.listItem, c.listItemLessPadding, {
                                            [c.listItemActive]: selectedUri === s.uri,
                                        })}
                                        onClick={() => {
                                            setSelectedUri(s.uri)
                                            dispatch(
                                                setFilexPreview({
                                                    ...r._source.archive,
                                                    ...r._source.pds4_label,
                                                    key: getFilename(s.uri),
                                                })
                                            )
                                        }}
                                    >
                                        <div className={c.liType}>
                                            {getIn(r._source, ES_PATHS.archive.fs_type) ===
                                            'file' ? (
                                                <>
                                                    {IMAGE_EXTENSIONS.includes(
                                                        getExtension(result.uri, true)
                                                    ) ? (
                                                        <ImageIcon size="small" />
                                                    ) : (
                                                        <InsertDriveFileOutlinedIcon size="small" />
                                                    )}{' '}
                                                </>
                                            ) : (
                                                <FolderIcon size="small" />
                                            )}
                                        </div>
                                        <div className={c.flexBetween}>
                                            <div className={c.flexBetween1}>
                                                <div className={clsx(c.liName)} title={result.name}>
                                                    {s.uri.replace(modal.uri, '')}
                                                </div>
                                                {result.fs_type === 'file' && (
                                                    <div
                                                        className={clsx(c.liSize, {
                                                            [c.liSizeActive]: selectedUri === s.uri,
                                                        })}
                                                        title={result.size}
                                                    >
                                                        {humanFileSize(result.size)}
                                                    </div>
                                                )}
                                            </div>
                                            <div
                                                className={clsx(
                                                    c.listItemButtons,
                                                    'listItemButtons',
                                                    {
                                                        [c.listItemButtonsActive]:
                                                            selectedUri === s.uri,
                                                    }
                                                )}
                                            >
                                                {getIn(s, ES_PATHS.archive.fs_type) === 'file' ? (
                                                    <Tooltip title="Download" arrow>
                                                        <IconButton
                                                            className={clsx(c.button)}
                                                            aria-label="quick download"
                                                            onClick={(e) => {
                                                                e.stopPropagation()
                                                                if (s.uri != null) {
                                                                    streamDownloadFile(
                                                                        getPDSUrl(
                                                                            s.uri,
                                                                            getIn(
                                                                                s,
                                                                                ES_PATHS.release_id
                                                                            )
                                                                        ),
                                                                        getFilename(s.uri)
                                                                    )
                                                                }
                                                            }}
                                                            size="large">
                                                            <GetAppIcon size="small" />
                                                        </IconButton>
                                                    </Tooltip>
                                                ) : null}
                                                <Tooltip title="Add to Cart" arrow>
                                                    <IconButton
                                                        className={clsx(c.button, {
                                                            [c.buttonMobile]: isMobile,
                                                        })}
                                                        aria-label="add to cart"
                                                        onClick={(e) => {
                                                            e.stopPropagation()
                                                            dispatch(
                                                                addToCart(
                                                                    getIn(
                                                                        s,
                                                                        ES_PATHS.archive.fs_type
                                                                    ) === 'directory'
                                                                        ? 'directory'
                                                                        : 'file',
                                                                    {
                                                                        uri: getIn(
                                                                            s,
                                                                            ES_PATHS.source
                                                                        ),
                                                                        related: getIn(
                                                                            s,
                                                                            ES_PATHS.related
                                                                        ),
                                                                        release_id: getIn(
                                                                            s,
                                                                            ES_PATHS.release_id
                                                                        ),
                                                                        size: getIn(
                                                                            s,
                                                                            ES_PATHS.archive.size
                                                                        ),
                                                                    }
                                                                )
                                                            )

                                                            dispatch(
                                                                setSnackBarText(
                                                                    'Added to Cart!',
                                                                    'success'
                                                                )
                                                            )
                                                        }}
                                                        size="large">
                                                        <AddShoppingCartIcon size="small" />
                                                    </IconButton>
                                                </Tooltip>
                                            </div>
                                        </div>
                                    </li>
                                );
                            })
                        ) : !loading ? (
                            <Paper className={c.noResults}>
                                <div>No Results Were Found</div>
                                <div>Try a different query.</div>
                            </Paper>
                        ) : null}
                    </div>
                    <div className={c.bottomBar}>
                        <div className={c.pagination}>
                            <Pagination
                                count={total > 0 ? Math.ceil(Math.min(10000, total) / pageSize) : 0}
                                page={parseInt(page)}
                                onChange={(e, value) => {
                                    setLoading(true)
                                    dispatch(
                                        queryFilexRegex(
                                            regexSearchValue,
                                            value - 1,
                                            {
                                                caseSensitive: caseSensitive,
                                                pageSize: pageSize,
                                                includeDirectories: includeDirectories,
                                            },
                                            (res) => {
                                                setLoading(false)
                                                const newResults = getIn(
                                                    res,
                                                    ['data', 'hits', 'hits'],
                                                    []
                                                )
                                                setResults(newResults)
                                                const newTotal = getIn(
                                                    res,
                                                    ['data', 'hits', 'total', 'value'],
                                                    0
                                                )
                                                setTotal(newTotal)
                                                setPage(value)
                                            }
                                        )
                                    )
                                }}
                                shape="rounded"
                                size={'large'}
                                showFirstButton
                                showLastButton
                            />
                        </div>
                        <div className={c.resultCount}>
                            {total > 0
                                ? `${Math.min((page - 1) * pageSize + 1, total)} to ${Math.min(
                                      page * pageSize,
                                      total
                                  )} out of ${total} items`
                                : '0 items'}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

RegexModal.propTypes = {}

export default RegexModal
