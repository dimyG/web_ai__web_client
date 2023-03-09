import _ from 'lodash';
import {
  colors,
  createMuiTheme,
  responsiveFontSizes
} from '@material-ui/core';
import { THEMES } from 'src/constants';
import { softShadows, strongShadows } from './shadows';
import originalTypography from './typography';
import { fade } from '@material-ui/core/styles/colorManipulator';

const typography = {
  ...originalTypography,
  h3: {
    fontSize: '0.85rem',
    '@media (max-width:420px)': {
      fontSize: '0.6rem',
    },
 },
}

const baseOptions = {
  direction: 'ltr',
  typography,
  overrides: {
    MuiLinearProgress: {
      root: {
        borderRadius: 3,
        overflow: 'hidden'
      }
    },
    MuiListItemIcon: {
      root: {
        minWidth: 32
      }
    },
    MuiChip: {
      root: {
        backgroundColor: 'rgba(0,0,0,0.075)'
      }
    }
  }
};

const lightSecondary = '#5850EC'

const themesOptions = [
  {
    name: THEMES.LIGHT,
    overrides: {
      MuiInputBase: {
        input: {
          '&::placeholder': {
            opacity: 1,
            color: colors.blueGrey[600]
          }
        }
      }
    },
    palette: {
      type: 'light',
      action: {
        active: colors.blueGrey[600]
      },
      background: {
        default: colors.common.white,
        dark: '#f4f6f8',
        paper: colors.common.white,
        secondary: fade(colors.indigo[600], 0.9),
        third: colors.indigo[400],
        fourth: colors.indigo[700],
        fifth: 'rgba(57,73,171,0.6)',
      },
      primary: {
        main: colors.indigo[600]
      },
      secondary: {
        main: lightSecondary
      },
      text: {
        primary: colors.blueGrey[900],
        secondary: '#e6e5e8',
      }
    },
    heapCirclesTheme: {
      circleFill: lightSecondary,
      circleFillOpacity: 0.9,
      circleTextFill: "white",
      heapCircleFill: "yellow",
      heapCircleFillOpacity: 0.4,
      lineStroke: "grey",
    },
    shadows: softShadows
  },
  {
    name: THEMES.ONE_DARK,
    palette: {
      type: 'dark',
      action: {
        active: 'rgba(255, 255, 255, 0.54)',
        hover: 'rgba(255, 255, 255, 0.04)',
        selected: 'rgba(255, 255, 255, 0.08)',
        disabled: 'rgba(255, 255, 255, 0.26)',
        disabledBackground: 'rgba(255, 255, 255, 0.12)',
        focus: 'rgba(255, 255, 255, 0.12)'
      },
      background: {
        default: '#282C34',
        dark: '#1c2025',
        paper: '#282C34',
        secondary: fade('#8a85ff', 0.9),
        third: colors.indigo[500],
        fourth: colors.indigo[700],
        fifth: 'rgba(138, 133, 255, 0.75)',
      },
      primary: {
        main: '#8a85ff'
      },
      secondary: {
        main: '#8a85ff'  //  #ffce85
      },
      text: {
        primary: '#e6e5e8',
        secondary: '#adb0bb',
      }
    },
    heapCirclesTheme: {
      circleFill: "purple",
      circleFillOpacity: 0.2,
      circleTextFill: "orange",
      heapCircleFill: "yellow",
      heapCircleFillOpacity: 0.1,
      lineStroke: "#ccc",
    },
    shadows: strongShadows
  },
  {
    name: THEMES.UNICORN,
    palette: {
      type: 'dark',
      action: {
        active: 'rgba(255, 255, 255, 0.54)',
        hover: 'rgba(255, 255, 255, 0.04)',
        selected: 'rgba(255, 255, 255, 0.08)',
        disabled: 'rgba(255, 255, 255, 0.26)',
        disabledBackground: 'rgba(255, 255, 255, 0.12)',
        focus: 'rgba(255, 255, 255, 0.12)'
      },
      background: {
        default: '#2a2d3d',
        dark: '#222431',
        paper: '#2a2d3d',
        secondary: fade('#a67dff', 0.9),
        third: colors.indigo[500],
        fourth: colors.indigo[700],
        fifth: 'rgba(138, 133, 255, 0.75)',
      },
      primary: {
        main: '#a67dff'
      },
      secondary: {
        main: '#a67dff'
      },
      text: {
        primary: '#f6f5f8',
        secondary: '#9699a4',
      }
    },
    heapCirclesTheme: {
      circleFill: "purple",
      circleFillOpacity: 0.2,
      circleTextFill: "orange",
      heapCircleFill: "yellow",
      heapCircleFillOpacity: 0.1,
      lineStroke: "#ccc",
    },
    shadows: strongShadows
  }
];

export const createTheme = (config = {}) => {
  let themeOptions = themesOptions.find((theme) => theme.name === config.theme);

  if (!themeOptions) {
    console.warn(new Error(`The theme ${config.theme} is not valid`));
    [themeOptions] = themesOptions;
  }

  let theme = createMuiTheme(
    _.merge(
      {},
      baseOptions,
      themeOptions,
      { direction: config.direction }
    )
  );

  if (config.responsiveFontSizes) {
    const options = {
      breakpoints: ['xs', 'sm', 'md', 'lg']
    }
    theme = responsiveFontSizes(theme, options);
  }

  return theme;
}
