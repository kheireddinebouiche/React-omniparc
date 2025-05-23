import { extendTheme } from '@chakra-ui/react';

export const theme = extendTheme({
  colors: {
    primary: {
      50: '#e6f0ff',
      100: '#cce0ff',
      200: '#99c2ff',
      300: '#66a3ff',
      400: '#3385ff',
      500: '#0066ff', // Bleu moderne
      600: '#0052cc',
      700: '#003d99',
      800: '#002966',
      900: '#001433',
    },
    secondary: {
      50: '#f3e6ff',
      100: '#e6ccff',
      200: '#cc99ff',
      300: '#b366ff',
      400: '#9933ff',
      500: '#8000ff', // Violet moderne
      600: '#6600cc',
      700: '#4c0099',
      800: '#330066',
      900: '#190033',
    },
    error: {
      50: '#ffe6e6',
      100: '#ffcccc',
      200: '#ff9999',
      300: '#ff6666',
      400: '#ff3333',
      500: '#ff0000',
      600: '#cc0000',
      700: '#990000',
      800: '#660000',
      900: '#330000',
    },
    success: {
      50: '#e6ffe6',
      100: '#ccffcc',
      200: '#99ff99',
      300: '#66ff66',
      400: '#33ff33',
      500: '#00ff00',
      600: '#00cc00',
      700: '#009900',
      800: '#006600',
      900: '#003300',
    },
    warning: {
      50: '#fff7e6',
      100: '#ffefcc',
      200: '#ffdf99',
      300: '#ffcf66',
      400: '#ffbf33',
      500: '#ffaf00',
      600: '#cc8c00',
      700: '#996900',
      800: '#664600',
      900: '#332300',
    },
    info: {
      50: '#e6f7ff',
      100: '#ccefff',
      200: '#99dfff',
      300: '#66cfff',
      400: '#33bfff',
      500: '#00afff',
      600: '#008ccc',
      700: '#006999',
      800: '#004666',
      900: '#002333',
    },
  },
  fonts: {
    heading: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    body: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
  },
  fontSizes: {
    xs: '0.75rem',
    sm: '0.875rem',
    md: '1rem',
    lg: '1.125rem',
    xl: '1.25rem',
    '2xl': '1.5rem',
    '3xl': '1.875rem',
    '4xl': '2.25rem',
    '5xl': '3rem',
    '6xl': '3.75rem',
    '7xl': '4.5rem',
    '8xl': '6rem',
    '9xl': '8rem',
  },
  fontWeights: {
    hairline: 100,
    thin: 200,
    light: 300,
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
    extrabold: 800,
    black: 900,
  },
  lineHeights: {
    normal: 'normal',
    none: 1,
    shorter: 1.25,
    short: 1.375,
    base: 1.5,
    tall: 1.625,
    taller: 2,
  },
  letterSpacings: {
    tighter: '-0.05em',
    tight: '-0.025em',
    normal: '0',
    wide: '0.025em',
    wider: '0.05em',
    widest: '0.1em',
  },
  radii: {
    none: '0',
    sm: '0.125rem',
    base: '0.25rem',
    md: '0.375rem',
    lg: '0.5rem',
    xl: '0.75rem',
    '2xl': '1rem',
    '3xl': '1.5rem',
    full: '9999px',
  },
  shadows: {
    xs: '0 0 0 1px rgba(0, 0, 0, 0.05)',
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    base: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    '3xl': '0 35px 60px -15px rgba(0, 0, 0, 0.3)',
    inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
    none: 'none',
  },
  components: {
    Button: {
      baseStyle: {
        fontWeight: 'semibold',
        borderRadius: 'md',
      },
    },
    Card: {
      baseStyle: {
        container: {
          borderRadius: 'lg',
          boxShadow: 'md',
        },
      },
    },
  },
});

export default theme; 