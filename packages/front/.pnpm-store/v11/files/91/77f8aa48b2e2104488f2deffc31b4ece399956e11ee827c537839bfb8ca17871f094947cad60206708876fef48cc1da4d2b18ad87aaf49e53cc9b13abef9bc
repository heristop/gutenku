import { createWebpackPlugin } from 'unplugin';
import { unpluginFactory } from './index.mjs';
import 'debug';
import '@intlify/shared';
import 'pathe';
import '@intlify/bundle-utils';
import '@rollup/pluginutils';
import 'node:fs';
import 'tinyglobby';
import 'vue/compiler-sfc';
import 'picocolors';
import 'node:path';
import '@intlify/vue-i18n-extensions';
import '@typescript-eslint/scope-manager';

const webpack = createWebpackPlugin(unpluginFactory);

export { webpack as default };
