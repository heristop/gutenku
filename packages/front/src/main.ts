/**
 * main.ts
 *
 * Bootstraps Vuetify and other plugins then mounts the App`
 */

// Components
import App from './App.vue';

// Composables
import { createApp, h } from 'vue';
import { apolloClient } from './client';
import { ApolloClients } from '@vue/apollo-composable';

// Plugins
import { registerPlugins } from '@/plugins';

const app = createApp({
  render: () => h(App),
});

app.provide(ApolloClients, {
  default: apolloClient,
});

registerPlugins(app);

app.mount('#app');
