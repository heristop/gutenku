/**
 * main.ts
 *
 * Bootstraps Vuetify and other plugins then mounts the App`
 */

// Components
import App from './App.vue';

// Composables
import { createApp, h } from 'vue';
import { apolloProvider } from './client';

// Plugins
import { registerPlugins } from '@/plugins';

const app = createApp({
    apolloProvider,

    render: () => h(App),
});

registerPlugins(app);

app.mount('#app');
