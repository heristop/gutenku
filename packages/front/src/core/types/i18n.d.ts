import type { MessageSchema } from '@/locales';

declare module 'vue-i18n' {
  export interface DefineLocaleMessage extends MessageSchema {}
}
