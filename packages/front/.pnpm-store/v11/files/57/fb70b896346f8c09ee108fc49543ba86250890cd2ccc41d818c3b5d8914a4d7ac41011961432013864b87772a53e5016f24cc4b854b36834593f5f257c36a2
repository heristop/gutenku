import { a as createUnhead } from './shared/unhead.BrXkGDAU.mjs';
import { D as DeprecationsPlugin, P as PromisesPlugin, T as TemplateParamsPlugin, A as AliasSortingPlugin } from './shared/unhead.AtIkjM2B.mjs';
export { u as useHead, a as useHeadSafe, b as useSeoMeta, c as useServerHead, d as useServerHeadSafe, e as useServerSeoMeta } from './shared/unhead.C-69jnXc.mjs';
export { u as useScript } from './shared/unhead.B0o2oYhg.mjs';
import 'hookable';
import './shared/unhead.AvDFlk_u.mjs';
import './shared/unhead.J7R8psSN.mjs';
import './shared/unhead.ChXiQvI8.mjs';
import './shared/unhead.ylJpsHyA.mjs';
import './shared/unhead.h_KkEIE6.mjs';
import './shared/unhead.BYvz9V1x.mjs';

const activeHead = { value: null };
function getActiveHead() {
  return activeHead?.value;
}
function createServerHead(options = {}) {
  return activeHead.value = createUnhead({
    disableCapoSorting: true,
    ...options,
    // @ts-expect-error untyped
    document: false,
    plugins: [
      ...options.plugins || [],
      DeprecationsPlugin,
      PromisesPlugin,
      TemplateParamsPlugin,
      AliasSortingPlugin
    ]
  });
}
function createHead(options = {}) {
  return activeHead.value = createUnhead({
    disableCapoSorting: true,
    ...options,
    plugins: [
      ...options.plugins || [],
      DeprecationsPlugin,
      PromisesPlugin,
      TemplateParamsPlugin,
      AliasSortingPlugin
    ]
  });
}
const createHeadCore = createUnhead;

export { activeHead, createHead, createHeadCore, createServerHead, createUnhead, getActiveHead };
