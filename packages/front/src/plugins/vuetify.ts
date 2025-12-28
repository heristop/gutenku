import 'vuetify/styles';
import { createVuetify } from 'vuetify';

// https://vuetifyjs.com/en/introduction/why-vuetify/#feature-guides
const gutenkuTheme = {
  dark: false,
  colors: {
    background: '#fbf3ea',
    surface: '#fdf8f3',
    // https://colorhunt.co/palette/2f5d625e8b7ea7c4bcdfeeea
    // https://colorhunt.co/palette/f0ebe3e4dccf7d9d9c576f72
    primary: '#2F5D62',
    secondary: '#7D9D9C',
    accent: '#A7C4BC',
  },
};

// Dark theme with zen/book colors
const gutenkuDarkTheme = {
  dark: true,
  colors: {
    background: '#272523',
    surface: '#2d2b29',
    primary: '#5a8a8f', // Lighter zen teal for dark mode visibility
    secondary: '#9bb6b4', // Adapted secondary for dark mode
    accent: '#bfd4d0', // Gentle accent for dark mode
    'surface-bright': '#353331',
    'surface-light': '#302e2c',
    'surface-variant': '#353331',
    'on-surface-variant': '#c4bfb4',
  },
};

export default createVuetify({
  theme: {
    defaultTheme: 'gutenkuTheme',
    themes: {
      gutenkuTheme,
      gutenkuDarkTheme,
    },
  },
  defaults: {
    VBtn: {
      style: 'font-family: "JMH Typewriter", monospace !important;',
    },
    VCard: {
      style: 'font-family: "JMH Typewriter", monospace !important;',
    },
    VTextField: {
      style: 'font-family: "JMH Typewriter", monospace !important;',
    },
    VSelect: {
      style: 'font-family: "JMH Typewriter", monospace !important;',
    },
    VSlider: {
      style: 'font-family: "JMH Typewriter", monospace !important;',
    },
    VField: {
      style: 'font-family: "JMH Typewriter", monospace !important;',
    },
    VLabel: {
      style: 'font-family: "JMH Typewriter", monospace !important;',
    },
    VTooltip: {
      style: 'font-family: "JMH Typewriter", monospace !important;',
    },
    VCol: {
      style: 'font-family: "JMH Typewriter", monospace !important;',
    },
    VRow: {
      style: 'font-family: "JMH Typewriter", monospace !important;',
    },
    VChip: {
      style: 'font-family: "JMH Typewriter", monospace !important;',
    },
    VProgressLinear: {
      style: 'font-family: "JMH Typewriter", monospace !important;',
    },
  },
});
