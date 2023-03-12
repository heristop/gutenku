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
const theme = {
    dark: false,
    colors: {
        background: '#FFFFFF',
        surface: '#FFFFFF',
        // https://colorhunt.co/palette/2f5d625e8b7ea7c4bcdfeeea
        primary: '#2F5D62',
        secondary: '#5E8B7E',
        third: "#A7C4BC"
    }
}

export default createVuetify({
    theme: {
        defaultTheme: 'theme',
        themes: {
            theme,
        }
    }
});
