/**
 * main.ts
 *
 * Bootstraps Vuetify and other plugins then mounts the App`
 */

// Components
import App from './App.vue';

// Composables
import { createApp, h } from 'vue';
import urql from '@urql/vue';
import { urqlClient } from './client';
import { MotionPlugin } from '@vueuse/motion';

// Plugins
import { registerPlugins } from '@/plugins';

const app = createApp({
  render: () => h(App),
});

app.use(urql, urqlClient);

// Motion plugin with custom zen-style directives
app.use(MotionPlugin, {
  directives: {
    'zen-fade': {
      initial: { opacity: 0, y: 20 },
      enter: {
        opacity: 1,
        y: 0,
        transition: { duration: 400, ease: [0.25, 0.8, 0.25, 1] },
      },
    },
    'zen-scale': {
      initial: { opacity: 0, scale: 0.9 },
      enter: {
        opacity: 1,
        scale: 1,
        transition: { duration: 400, ease: [0.25, 0.8, 0.25, 1] },
      },
    },
    'zen-slide': {
      initial: { opacity: 0, x: -20 },
      enter: {
        opacity: 1,
        x: 0,
        transition: { duration: 300, ease: 'easeOut' },
      },
    },
  },
});

registerPlugins(app);

app.mount('#app');
