import { defineConfig } from 'cypress';

export default defineConfig({
  video: false,
  chromeWebSecurity: false,
  retries: 1,
  viewportWidth: 1280,
  viewportHeight: 800,
  e2e: {
    baseUrl: 'http://localhost:3333',
    supportFile: 'cypress/support/e2e.ts',
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
  },
});
