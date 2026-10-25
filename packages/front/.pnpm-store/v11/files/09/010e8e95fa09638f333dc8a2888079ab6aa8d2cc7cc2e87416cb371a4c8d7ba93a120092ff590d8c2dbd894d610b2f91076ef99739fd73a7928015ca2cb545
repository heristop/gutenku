/*!
  * shared v11.4.16
  * (c) 2026 kazuya kawaguchi
  * Released under the MIT License.
  */
/**
 * Original Utilities
 * written by kazuya kawaguchi
 */
const inBrowser = typeof window !== 'undefined';
let mark;
let measure;
if ((process.env.NODE_ENV !== 'production')) {
    const perf = inBrowser && window.performance;
    if (perf &&
        perf.mark &&
        perf.measure &&
        perf.clearMarks &&
        // @ts-ignore browser compat
        perf.clearMeasures) {
        mark = (tag) => {
            perf.mark(tag);
        };
        measure = (name, startTag, endTag) => {
            perf.measure(name, startTag, endTag);
            perf.clearMarks(startTag);
            perf.clearMarks(endTag);
        };
    }
}
const RE_ARGS = /\{([0-9a-zA-Z]+)\}/g;
/* eslint-disable */
function format(message, ...args) {
    if (args.length === 1 && isObject(args[0])) {
        args = args[0];
    }
    if (!args || !args.hasOwnProperty) {
        args = {};
    }
    return message.replace(RE_ARGS, (match, identifier) => {
        return args.hasOwnProperty(identifier) ? args[identifier] : '';
    });
}
const makeSymbol = (name, shareable = false) => !shareable ? Symbol(name) : Symbol.for(name);
const generateFormatCacheKey = (locale, key, source) => friendlyJSONstringify({ l: locale, k: key, s: source });
const friendlyJSONstringify = (json) => JSON.stringify(json)
    .replace(/\u2028/g, '\\u2028')
    .replace(/\u2029/g, '\\u2029')
    .replace(/\u0027/g, '\\u0027');
const isNumber = (val) => typeof val === 'number' && isFinite(val);
function toDevtoolsGroupId(type, key) {
    return isString(key) || isNumber(key) ? `${type}:${key}` : type;
}
const isDate = (val) => toTypeString(val) === '[object Date]';
const isRegExp = (val) => toTypeString(val) === '[object RegExp]';
const isEmptyObject = (val) => isPlainObject(val) && Object.keys(val).length === 0;
const assign = Object.assign;
const _create = Object.create;
const create = (obj = null) => _create(obj);
let _globalThis;
const getGlobalThis = () => {
    // prettier-ignore
    return (_globalThis ||
        (_globalThis =
            typeof globalThis !== 'undefined'
                ? globalThis
                : typeof self !== 'undefined'
                    ? self
                    : typeof window !== 'undefined'
                        ? window
                        : typeof global !== 'undefined'
                            ? global
                            : create()));
};
const hasOwnProperty = Object.prototype.hasOwnProperty;
function hasOwn(obj, key) {
    return hasOwnProperty.call(obj, key);
}
/* eslint-enable */
/**
 * Get `obj[key]` only when `key` is an own property of `obj`, so that a key
 * such as `constructor` does not read a property inherited from
 * `Object.prototype`.
 * The property is read before the check, so that a reactive `obj` tracks
 * `key` even when it is missing.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getOwn(obj, key) {
    const value = obj[key];
    return hasOwn(obj, key) ? value : undefined;
}
/**
 * Whether `key` is a property name of `Object.prototype`, such as `__proto__`,
 * `constructor` or `toString`.
 * On a plain object, such a key reads a built-in, and assigning to `__proto__`
 * replaces the prototype.
 */
function isObjectPrototypeKey(key) {
    return hasOwn(Object.prototype, key);
}
/**
 * Useful Utilities By Evan you
 * Modified by kazuya kawaguchi
 * MIT License
 * https://github.com/vuejs/vue-next/blob/master/packages/shared/src/index.ts
 * https://github.com/vuejs/vue-next/blob/master/packages/shared/src/codeframe.ts
 */
const isArray = Array.isArray;
const isFunction = (val) => typeof val === 'function';
const isString = (val) => typeof val === 'string';
const isBoolean = (val) => typeof val === 'boolean';
const isSymbol = (val) => typeof val === 'symbol';
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const isObject = (val) => val !== null && typeof val === 'object';
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const isPromise = (val) => {
    return isObject(val) && isFunction(val.then) && isFunction(val.catch);
};
const objectToString = Object.prototype.toString;
const toTypeString = (value) => objectToString.call(value);
const isPlainObject = (val) => toTypeString(val) === '[object Object]';
// for converting list and named values to displayed strings.
const toDisplayString = (val) => {
    return val == null
        ? ''
        : isArray(val) || (isPlainObject(val) && val.toString === objectToString)
            ? JSON.stringify(val, null, 2)
            : String(val);
};
function join(items, separator = '') {
    return items.reduce((str, item, index) => (index === 0 ? str + item : str + separator + item), '');
}
const RANGE = 2;
function generateCodeFrame(source, start = 0, end = source.length) {
    const lines = source.split(/\r?\n/);
    let count = 0;
    const res = [];
    for (let i = 0; i < lines.length; i++) {
        count += lines[i].length + 1;
        if (count >= start) {
            for (let j = i - RANGE; j <= i + RANGE || end > count; j++) {
                if (j < 0 || j >= lines.length)
                    continue;
                const line = j + 1;
                res.push(`${line}${' '.repeat(3 - String(line).length)}|  ${lines[j]}`);
                const lineLength = lines[j].length;
                if (j === i) {
                    // push underline
                    const pad = start - (count - lineLength) + 1;
                    const length = Math.max(1, end > count ? lineLength - pad : end - start);
                    res.push(`   |  ` + ' '.repeat(pad) + '^'.repeat(length));
                }
                else if (j > i) {
                    if (end > count) {
                        const length = Math.max(Math.min(end - count, lineLength), 1);
                        res.push(`   |  ` + '^'.repeat(length));
                    }
                    count += lineLength + 1;
                }
            }
            break;
        }
    }
    return res.join('\n');
}

function warn(msg, err) {
    if (typeof console !== 'undefined') {
        console.warn(`[intlify] ` + msg);
        /* istanbul ignore if */
        if (err) {
            console.warn(err.stack);
        }
    }
}
const hasWarned = {};
function warnOnce(msg) {
    if (!hasWarned[msg]) {
        hasWarned[msg] = true;
        warn(msg);
    }
}

function escapeHtml(rawText) {
    return rawText
        .replace(/&/g, '&amp;') // escape `&` first to avoid double escaping
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;')
        .replace(/\//g, '&#x2F;') // escape `/` to prevent closing tags or JavaScript URLs
        .replace(/=/g, '&#x3D;'); // escape `=` to prevent attribute injection
}
function escapeAttributeValue(value) {
    return value
        .replace(/&(?![a-z0-9#]{2,6};)/gi, '&amp;') // escape unescaped `&`
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
}
const javascriptSchemePattern = /^javascript:/i;
const urlAttributePattern = /^(?:href|src|action|formaction)$/i;
const numericCharacterReferencePattern = /&#(?:x([0-9a-f]+)|(\d+));?/gi;
const namedWhitespaceCharacterReferencePattern = /&(?:Tab|NewLine);/g;
const colonCharacterReferencePattern = /&colon;?/gi;
// eslint-disable-next-line no-control-regex -- URL scheme normalization requires the full control range
const controlOrWhitespacePattern = /[\u0000-\u0020\u007f-\u009f]/g;
const eventHandlerPattern = /(?:^|[\s"'<>/])on\w+\s*=\s*["']?[^"'>]+["']?/i;
const eventHandlerAttributePattern = /(^|[\s"'<>/])on(\w+\s*=)/gi;
// `srcdoc` holds a whole HTML document: its value is entity-decoded and then parsed again,
// so neither escaping the value nor neutralizing `on*` inside it makes it inert
const srcdocPattern = /(?:^|[\s"'<>/])srcdoc\s*=/i;
const srcdocAttributePattern = /(^|[\s"'<>/])s(rcdoc\s*=)/gi;
const unquotedUrlAttributePattern = /(^|[\s"'<>/])((?:href|src|action|formaction)\s*=\s*)([^\s"'=<>`]+)/gi;
function decodeNumericCharacterReference(match, hex, decimal) {
    const digits = hex || decimal;
    if (!digits) {
        return match;
    }
    const codePoint = Number.parseInt(digits, hex ? 16 : 10);
    return codePoint <= 0x7f ? String.fromCharCode(codePoint) : match;
}
function hasJavascriptScheme(value) {
    const normalized = value
        .replace(numericCharacterReferencePattern, decodeNumericCharacterReference)
        .replace(namedWhitespaceCharacterReferencePattern, '')
        .replace(colonCharacterReferencePattern, ':')
        .replace(controlOrWhitespacePattern, '');
    return javascriptSchemePattern.test(normalized);
}
function sanitizeStyleValue(value) {
    const urlPattern = /url\s*\(/gi;
    let sanitized = '';
    let cursor = 0;
    let match;
    while ((match = urlPattern.exec(value)) !== null) {
        const urlStart = match.index;
        const openParenIndex = urlPattern.lastIndex - 1;
        let index = openParenIndex + 1;
        let depth = 1;
        let quote = null;
        for (; index < value.length; index++) {
            const char = value[index];
            if (quote) {
                if (char === quote) {
                    quote = null;
                }
                continue;
            }
            if (char === '"' || char === "'") {
                quote = char;
            }
            else if (char === '(') {
                depth++;
            }
            else if (char === ')') {
                depth--;
                if (depth === 0) {
                    break;
                }
            }
        }
        if (depth !== 0) {
            break;
        }
        const rawUrlValue = value.slice(openParenIndex + 1, index).trim();
        const unquotedUrlValue = (rawUrlValue.startsWith('"') && rawUrlValue.endsWith('"')) ||
            (rawUrlValue.startsWith("'") && rawUrlValue.endsWith("'"))
            ? rawUrlValue.slice(1, -1).trim()
            : rawUrlValue;
        sanitized += value.slice(cursor, urlStart);
        sanitized += hasJavascriptScheme(unquotedUrlValue)
            ? 'url(about:blank)'
            : value.slice(urlStart, index + 1);
        cursor = index + 1;
    }
    return sanitized + value.slice(cursor);
}
function sanitizeAttributeValue(attrName, value) {
    if (urlAttributePattern.test(attrName) && hasJavascriptScheme(value)) {
        return 'about:blank';
    }
    const sanitizedValue = attrName.toLowerCase() === 'style' ? sanitizeStyleValue(value) : value;
    return escapeAttributeValue(sanitizedValue);
}
function sanitizeTranslatedHtml(html) {
    // Escape dangerous characters in attribute values
    // Process attributes with double quotes
    html = html.replace(/([\w:-]+)\s*=\s*"([^"]*)"/g, (_, attrName, attrValue) => `${attrName}="${sanitizeAttributeValue(attrName, attrValue)}"`);
    // Process attributes with single quotes
    html = html.replace(/([\w:-]+)\s*=\s*'([^']*)'/g, (_, attrName, attrValue) => `${attrName}='${sanitizeAttributeValue(attrName, attrValue)}'`);
    // Detect and neutralize event handler attributes
    if (eventHandlerPattern.test(html)) {
        if ((process.env.NODE_ENV !== 'production')) {
            warn('Potentially dangerous event handlers detected in translation. ' +
                'Consider removing onclick, onerror, etc. from your translation messages.');
        }
        // Neutralize event handler attributes by escaping 'on'
        html = html.replace(eventHandlerAttributePattern, '$1&#111;n$2');
    }
    // Detect and neutralize `srcdoc` attributes
    if (srcdocPattern.test(html)) {
        if ((process.env.NODE_ENV !== 'production')) {
            warn('Potentially dangerous srcdoc attribute detected in translation. ' +
                'Consider removing srcdoc from your translation messages.');
        }
        // Neutralize `srcdoc` by escaping 's': character references are not decoded in attribute names
        html = html.replace(srcdocAttributePattern, '$1&#115;$2');
    }
    // Disable javascript: URLs in unquoted attributes
    html = html.replace(unquotedUrlAttributePattern, (match, boundary, prefix, attrValue) => hasJavascriptScheme(attrValue) ? `${boundary}${prefix}about:blank` : match);
    return html;
}

/**
 * Event emitter, forked from the below:
 * - original repository url: https://github.com/developit/mitt
 * - code url: https://github.com/developit/mitt/blob/master/src/index.ts
 * - author: Jason Miller (https://github.com/developit)
 * - license: MIT
 */
/**
 * Create a event emitter
 *
 * @returns An event emitter
 */
function createEmitter() {
    const events = new Map();
    const emitter = {
        events,
        on(event, handler) {
            const handlers = events.get(event);
            const added = handlers && handlers.push(handler);
            if (!added) {
                events.set(event, [handler]);
            }
        },
        off(event, handler) {
            const handlers = events.get(event);
            if (handlers) {
                handlers.splice(handlers.indexOf(handler) >>> 0, 1);
            }
        },
        emit(event, payload) {
            (events.get(event) || [])
                .slice()
                .map(handler => handler(payload));
            (events.get('*') || [])
                .slice()
                .map(handler => handler(event, payload));
        }
    };
    return emitter;
}

const isNotObjectOrIsArray = (val) => !isObject(val) || isArray(val);
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function deepCopy(src, des) {
    // src and des should both be objects, and none of them can be a array.
    // des can't be `Object.prototype` either: copying into it would pollute
    // every object
    if (isNotObjectOrIsArray(src) ||
        isNotObjectOrIsArray(des) ||
        des === Object.prototype) {
        throw new Error('Invalid value');
    }
    const stack = [{ src, des }];
    while (stack.length) {
        const { src, des } = stack.pop();
        // using `Object.keys` which skips prototype properties
        Object.keys(src).forEach(key => {
            if (key === '__proto__') {
                return;
            }
            const value = src[key];
            if (isArray(value)) {
                // replace arrays instead of merging them, without retaining source references
                const copied = [];
                copied.length = value.length;
                des[key] = copied;
                stack.push({ src: value, des: copied });
            }
            else if (isObject(value)) {
                if (!isObject(des[key]) || isArray(des[key])) {
                    des[key] = create();
                }
                stack.push({ src: value, des: des[key] });
            }
            else {
                des[key] = value;
            }
        });
    }
}

export { assign, create, createEmitter, deepCopy, escapeHtml, format, friendlyJSONstringify, generateCodeFrame, generateFormatCacheKey, getGlobalThis, getOwn, hasOwn, inBrowser, isArray, isBoolean, isDate, isEmptyObject, isFunction, isNumber, isObject, isObjectPrototypeKey, isPlainObject, isPromise, isRegExp, isString, isSymbol, join, makeSymbol, mark, measure, objectToString, sanitizeTranslatedHtml, toDevtoolsGroupId, toDisplayString, toTypeString, warn, warnOnce };
