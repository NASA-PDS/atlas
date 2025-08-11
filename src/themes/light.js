import { createMuiTheme } from '@mui/material/styles'

export const palette = {
    type: 'light',
    primary: {
        main: '#FFFFFF',
        light: '#1C67E3', //'#62c6f5', //'#D5EBFD',
    },
    secondary: {
        main: '#17171B', //'#000000',
    },
    accent: {
        main: '#1C67E3', //'#62c6f5', //'#D5EBFD',
        secondary: '#0B3D91',
        tertiary: '#288BFF',
    },
    text: {
        primary: '#000000',
        secondary: '#F6F6F6',
        muted: '#919496',
        accent: '#12181e',
    },
    active: {
        main: '#288BFF', //'#47DA84',
        secondary: '#EA6F24',
    },
    swatches: {
        black: {
            black0: '#000000',
        },
        blue: {
            blue50: '#E5F3FE',
            blue100: '#D5EBFD',
            blue200: '#B5DCFB',
            blue300: '#64B6F7',
            blue400: '#57B4FF',
            blue500: '#2398F4',
            blue600: '#1390F3',
            blue700: '#0B7ED9',
            blue800: '#0A6BB9',
            blue900: '#085898',
        },
        lightblue: {
            lightblue700: '#2dd5fb',
        },
        green: {
            green200: '#8AF4D4',
            green500: '#47DA84',
        },
        grey: {
            grey0: '#FFFFFF',
            grey50: '#FDFDFD',
            grey100: '#F7F7F7',
            grey150: '#E7E7E7',
            grey200: '#D1D1D1',
            grey300: '#B9B9BD',
            grey400: '#959599',
            grey500: '#656666',
            grey600: '#58585B', //'#474C53',
            grey700: '#2E2E32', //#282F36',
            grey800: '#17171B', //'#192028',
            grey850: '#101013',
            grey900: '#000000', //'#12181e',
        },
        yellow: {
            highlight1: 'rgba(255, 255, 0, 0.18)',
            highlight2: 'rgba(255, 255, 0, 0.36)',
            yellow500: '#f2d897',
            yellow600: '#e3c51c',
            yellow700: '#FBC02D',
            yellow800: '#e39d1c',
        },
        orange: {
            orange500: '#EA6F24',
            orange600: '#FF9800',
        },
        red: {
            red400: '#FF5C52',
            red500_30: 'rgba(246, 65, 55, 30%)',
            red500: '#F64137',
            red600: '#B60109',
        },
    },
}

export const theme = {
    palette,
    spacing: 4,
    headHeights: [56, 40, 40, 32, 24],
    breakpoints: {
        values: {
            xs: 0,
            sm: 600,
            md: 960,
            lg: 1280,
            xl: 1920,
        },
    },
    overrides: {
        MuiIconButton: {
            root: {
                borderRadius: '0px',
            },
        },
        MuiButton: {
            contained: {
                'fontSize': '13px',
                'padding': '3px 10px',
                'backgroundColor': palette.primary.light,
                'borderRadius': '2px',
                'color': palette.text.secondary,
                '&:hover': {
                    backgroundColor: palette.accent.tertiary,
                },
            },
            startIcon: {
                marginRight: '4px',
            },
        },
        MuiInput: {
            underline: {
                '&:after': {
                    borderBottom: `2px solid ${palette.accent.main}`,
                },
            },
        },
        MuiListSubheader: {
            root: {
                color: palette.text.main,
                fontWeight: 700,
                background: `${palette.swatches.grey.grey100} !important`,
            },
        },
        MuiTooltip: {
            tooltip: {
                fontSize: '1em',
                color: palette.text.secondary,
                backgroundColor: palette.swatches.grey.grey800,
                maxWidth: '1400px',
            },
            arrow: {
                color: palette.secondary.main,
            },
        },
        MuiBadge: {
            colorPrimary: {
                backgroundColor: palette.accent.secondary,
            },
        },
        MuiTabs: {
            root: {
                minHeight: '40px',
            },
        },
        MuiTab: {
            root: {
                minHeight: '40px',
            },
        },
        MuiCheckbox: {
            root: {
                'color': palette.swatches.grey.grey300,
                '&$checked': {
                    color: palette.active.main,
                },
                'padding': '3.25px',
            },
        },
        MuiPagination: {
            root: {},
            ul: {},
        },
        MuiPaginationItem: {
            root: {
                height: '24px',
                minWidth: '24px',
            },
        },
        MuiCircularProgress: {
            colorPrimary: {
                color: palette.accent.main,
            },
        },
        MuiSwitch: {
            root: {
                '& > span': {
                    'color': palette.primary.light,
                    '&$checked': {
                        color: palette.accent.main,
                    },
                    '&$checked + $track': {
                        backgroundColor: palette.accent.main,
                    },
                },
            },
        },
        MuiDialogActions: {
            root: {
                backgroundColor: palette.swatches.grey.grey150,
                padding: '4px',
                justifyContent: 'space-between',
            },
        },
        MuiSlider: {
            root: {
                color: palette.accent.main,
            },
            rail: {
                color: palette.swatches.grey.grey500,
            },
            valueLabel: {
                '& > span > span': {
                    color: 'black',
                    fontWeight: 'bold',
                },
            },
        },
        MuiTypography: {
            root: {
                fontFamily: '"Inter", "Helvetica", "Arial", sans-serif',
            },
            h2: {
                fontFamily: '"Inter", "Helvetica", "Arial", sans-serif',
            },
        },
        MuiSnackbar: {
            anchorOriginTopCenter: {
                top: '16px !important',
            },
        },
        MuiInputLabel: {
            outlined: {
                color: palette.text.primary,
            },
        },
        MuiSelect: {
            outlined: {
                padding: '8px 32px 8px 14px',
            },
        },
    },
}

const light = createMuiTheme(theme)

export default light
