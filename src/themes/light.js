import { adaptV4Theme, createTheme } from '@mui/material/styles';

export const palette = {
    mode: 'light',
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
    components: {
      MuiIconButton: {
        styleOverrides: {
            root: {
                borderRadius: '0px',
            }
        }
      },
      MuiButton: {
        styleOverrides: {
            contained: {
                'fontSize': '11.375px',
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
        }
      },
      MuiInput: {
        styleOverrides: {
          underline: {
              '&:after': {
                  borderBottom: `2px solid ${palette.accent.main}`,
              },
          },
        }
      },
      MuiListSubheader: {
        styleOverrides: {
          root: {
              color: palette.text.main,
              fontWeight: 700,
              background: `${palette.swatches.grey.grey100} !important`,
          },
        }
      },
      MuiTooltip: {
        styleOverrides: {
          tooltip: {
              fontSize: '1em',
              color: palette.text.secondary,
              backgroundColor: palette.swatches.grey.grey800,
              maxWidth: '1400px',
          },
          arrow: {
              color: palette.secondary.main,
          },
        }
      },
      MuiBadge: {
        styleOverrides: {
          colorPrimary: {
              backgroundColor: palette.accent.secondary,
          },
        }
      },
      MuiTabs: {
        styleOverrides: {
          root: {
              minHeight: '40px',
          },
        }
      },
      MuiTab: {
        styleOverrides: {
          root: {
              color: palette.text.primary,
              opacity: "0.7",
              minHeight: '40px',
              "&.Mui-selected": {
                color: palette.text.primary,
                opacity: "1.0",
              }
          },
        }
      },
      MuiCheckbox: {
        styleOverrides: {
          root: {
              'color': palette.swatches.grey.grey300,
              '&.Mui-checked': {
                  color: palette.active.main,
              },
              'padding': '3.25px',
          },
        }
      },
      MuiPagination: {
        styleOverrides: {
          root: {},
          ul: {},
        }
      },
      MuiPaginationItem: {
        styleOverrides: {
          root: {
              height: '24px',
              minWidth: '24px',
          },
        }
      },
      MuiCircularProgress: {
        styleOverrides: {
          colorPrimary: {
              color: palette.accent.main,
          },
        }
      },
      MuiSwitch: {
        styleOverrides: {
          root: {
              '& > span': {
                  'color': palette.primary.light,
                  '&.Mui-checked': {
                      color: palette.accent.main,
                  },
                  '&.Mui-checked + .MuiSwitch-track': {
                      backgroundColor: palette.accent.main,
                  },
              },
          },
        }
      },
      MuiDialogActions: {
        styleOverrides: {
          root: {
              backgroundColor: palette.swatches.grey.grey150,
              padding: '4px',
              justifyContent: 'space-between',
          },
        }
      },
      MuiSlider: {
        styleOverrides: {
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
        }
      },
      MuiTypography: {
        styleOverrides: {
          root: {
              fontFamily: '"Inter", "Helvetica", "Arial", sans-serif',
          },
          h2: {
              fontFamily: '"Inter", "Helvetica", "Arial", sans-serif',
          },
        }
      },
      MuiSnackbar: {
        styleOverrides: {
          anchorOriginTopCenter: {
              top: '16px !important',
          },
        }
      },
      MuiInputLabel: {
        styleOverrides: {
          outlined: {
              color: palette.text.primary,
          },
        }
      },
      MuiSelect: {
        styleOverrides: {
          outlined: {
              padding: '8px 32px 8px 14px',
          },
        }
      }
    },
}

const light = createTheme(theme)

export default light
