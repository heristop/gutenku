/**
 * plugins/vuetify.ts
 *
 * Framework documentation: https://vuetifyjs.com`
 */

// Styles
import '@mdi/font/css/materialdesignicons.css';
import 'vuetify/styles';

// Composables
import { createVuetify } from 'vuetify';

// https://vuetifyjs.com/en/introduction/why-vuetify/#feature-guides
const gutenkuTheme = {
    dark: false,
    colors: {
        background: '#FFFFFF',
        surface: '#FFFFFF',
        // https://colorhunt.co/palette/2f5d625e8b7ea7c4bcdfeeea
        // https://colorhunt.co/palette/f0ebe3e4dccf7d9d9c576f72
        primary: '#2F5D62',
        secondary: '#7D9D9C',
        accent: "#A7C4BC"
    }
}

export default createVuetify({
    theme: {
        defaultTheme: 'gutenkuTheme',
        themes: {
            gutenkuTheme,
        }
    }
});
