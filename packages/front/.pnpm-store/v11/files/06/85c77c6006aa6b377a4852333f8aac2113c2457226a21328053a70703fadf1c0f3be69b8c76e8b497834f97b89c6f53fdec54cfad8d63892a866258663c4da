'use strict';

const unplugin = require('unplugin');
const index = require('./index.cjs');
require('debug');
require('@intlify/shared');
require('pathe');
require('@intlify/bundle-utils');
require('@rollup/pluginutils');
require('node:fs');
require('tinyglobby');
require('vue/compiler-sfc');
require('picocolors');
require('node:path');
require('@intlify/vue-i18n-extensions');
require('@typescript-eslint/scope-manager');

const vite = unplugin.createVitePlugin(index.unpluginFactory);

module.exports = vite;
