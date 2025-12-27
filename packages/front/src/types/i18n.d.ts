/**
 * types/i18n.d.ts
 *
 * Type augmentation for vue-i18n global types
 */

import type { MessageSchema } from '@/locales';

declare module 'vue-i18n' {
  // Define the locale messages schema for global scope
  export interface DefineLocaleMessage extends MessageSchema {}
}
