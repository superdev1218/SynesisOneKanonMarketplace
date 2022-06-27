import { createTheme, responsiveFontSizes } from '@mui/material/styles';
import * as locale from '@mui/material/locale';

// colors [dark]
const dark_primary = '#6E56F8';
const dark_secondary = '#11243E';
const dark_black = '#303030';
const dark_darkBlack = '#0c1319';
const dark_background = '#141424';
const dark_black1 = '#202036';
const dark_black2 = '#27273E';
const dark_black3 = '#33334B';
const dark_warningLight = 'rgba(255, 246, 32, .3)';
const dark_warningMain = 'rgba(255, 246, 32, .5)';
const dark_warningDark = 'rgba(255, 246, 32, .7)';
const dark_borderColor = '#2e6da4';
const dark_navMenu = '#fff';

// colors [light]
const light_primary = '#6E56F8';
const light_secondary = '#11243E';
const light_black = '#303030';
const light_darkBlack = '#0c1319';
const light_background = '#fff';
const light_warningLight = 'rgba(255, 246, 32, .3)';
const light_warningMain = 'rgba(255, 246, 32, .5)';
const light_warningDark = 'rgba(255, 246, 32, .7)';
const light_borderColor = '#2e6da4';
const light_navMenu = '#141414';

// border
const borderWidth = 1;

// breakpoints
const xl = 1536;
const lg = 1240;
const md = 900;
const sm = 600;
const xs = 0;

// spacing
const spacing = 8;

const darktheme = createTheme({
  layout: {
    contentWidth: 1140,
    footerWidth: 1400
  },
  palette: {
    mode: 'dark',
    primary: { main: dark_primary, footer: '#055da6' },
    secondary: { main: dark_secondary },
    common: {
      black: dark_black,
      black1: dark_black1,
      black2: dark_black2,
      black3: dark_black3,
      darkBlack: dark_darkBlack
    },
    warning: {
      light: dark_warningLight,
      main: dark_warningMain,
      dark: dark_warningDark
    },
    tonalOffset: 0.2,
    background: {
      default: dark_background,
      gray: '#f1f1f170'
    },
    navMenu: dark_navMenu,
    spacing
  },
  breakpoints: {
    values: {
      xs,
      sm,
      md,
      lg,
      xl
    }
  },
  border: {
    borderColor: dark_borderColor,
    borderWidth: borderWidth
  },
  overrides: {},
  typography: {
    fontFamily: 'Klavika, Montserrat'
  }
});
const lighttheme = createTheme({
  layout: {
    contentWidth: 1140,
    footerWidth: 1400
  },
  palette: {
    mode: 'light',
    primary: { main: light_primary, footer: '#055da6' },
    secondary: { main: light_secondary },
    common: {
      black: light_black,
      darkBlack: light_darkBlack
    },
    warning: {
      light: light_warningLight,
      main: light_warningMain,
      dark: light_warningDark
    },
    tonalOffset: 0.2,
    background: {
      default: light_background,
      gray: '#f1f1f170'
    },
    navMenu: light_navMenu,
    spacing
  },
  breakpoints: {
    values: {
      xs: 0,
      sm: 600,
      md: 900,
      lg: 1200,
      xl: 1536
    }
  },
  border: {
    borderColor: light_borderColor,
    borderWidth: borderWidth
  },
  overrides: {},
  typography: {
    fontFamily: 'Klavika, Montserrat'
  }
});
export { lighttheme, darktheme };

