import JSDOM from 'jsdom';

const defaultHtml = '<!doctype html><html><head><meta charset="utf-8"></head><body></body></html>';
const KEYS = [];
function jsdomGlobal(html = defaultHtml, options = {}) {
  if (global.navigator && global.navigator.userAgent && global.navigator.userAgent.includes("Node.js") && global.document && typeof global.document.destroy === "function") {
    return global.document.destroy;
  }
  if (!("url" in options))
    Object.assign(options, { url: "http://localhost:3000" });
  if (!("pretendToBeVisual" in options))
    Object.assign(options, { pretendToBeVisual: true });
  const jsdom = new JSDOM.JSDOM(html, options);
  const { window } = jsdom;
  const { document } = window;
  if (KEYS.length === 0) {
    KEYS.push(...Object.getOwnPropertyNames(window).filter((k) => !k.startsWith("_")).filter((k) => !(k in global)));
    KEYS.push("$jsdom");
  }
  KEYS.forEach((key) => global[key] = window[key]);
  global.document = document;
  global.window = window;
  window.console = global.console;
  global.$jsdom = jsdom;
  const cleanup = () => KEYS.forEach((key) => delete global[key]);
  document.destroy = cleanup;
  return cleanup;
}

export { jsdomGlobal };
