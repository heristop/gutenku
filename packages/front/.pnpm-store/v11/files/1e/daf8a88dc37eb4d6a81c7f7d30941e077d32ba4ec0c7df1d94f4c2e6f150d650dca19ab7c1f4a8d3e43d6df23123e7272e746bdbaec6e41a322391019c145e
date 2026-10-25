
/**
 * @vue/test-utils v2.5.1
 * (c) 2026 Lachlan Miller
 * Released under the MIT License
 */

import * as Vue from 'vue';
import { nextTick as nextTick$1, Fragment as Fragment$1, setDevtoolsHook, proxyRefs as proxyRefs$1, unref as unref$1, TransitionGroup, Transition, BaseTransition, defineComponent, h, isRef as isRef$1, shallowReactive as shallowReactive$1, reactive as reactive$1, ref, createApp as createApp$1, transformVNodeArgs, computed as computed$2 } from 'vue';

/******************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */
/* global Reflect, Promise, SuppressedError, Symbol, Iterator */


function __awaiter(thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
}

typeof SuppressedError === "function" ? SuppressedError : function (error, suppressed, message) {
    var e = new Error(message);
    return e.name = "SuppressedError", e.error = error, e.suppressed = suppressed, e;
};

var _a;
class Pluggable {
    constructor() {
        this.installedPlugins = [];
    }
    install(handler, options) {
        if (typeof handler !== 'function') {
            console.error('plugin.install must receive a function');
            handler = () => ({});
        }
        this.installedPlugins.push({ handler, options });
    }
    extend(instance) {
        const invokeSetup = ({ handler, options }) => {
            return handler(instance, options); // invoke the setup method passed to install
        };
        const bindProperty = ([property, value]) => {
            instance[property] =
                typeof value === 'function' ? value.bind(instance) : value;
        };
        const addAllPropertiesFromSetup = (setupResult) => {
            setupResult = typeof setupResult === 'object' ? setupResult : {};
            Object.entries(setupResult).forEach(bindProperty);
        };
        this.installedPlugins.map(invokeSetup).forEach(addAllPropertiesFromSetup);
    }
    /** For testing */
    reset() {
        this.installedPlugins = [];
    }
}
// Different builds of Vue Test Utils can be loaded in the same JavaScript
// realm. Store config under a versioned global symbol so those builds share
// state without sharing it across incompatible major versions.
const configKey = Symbol.for('@vue/test-utils:config:v2');
function createConfig() {
    return {
        global: {
            stubs: {
                transition: true,
                'transition-group': true
            },
            provide: {},
            components: {},
            config: {},
            directives: {},
            mixins: [],
            mocks: {},
            plugins: [],
            renderStubDefaultSlot: false
        },
        plugins: {
            VueWrapper: new Pluggable(),
            DOMWrapper: new Pluggable()
        }
    };
}
const sharedState = globalThis;
const config = (_a = sharedState[configKey]) !== null && _a !== void 0 ? _a : (sharedState[configKey] = createConfig());

function mergeStubs(target, source) {
    if (source.stubs) {
        if (Array.isArray(source.stubs)) {
            source.stubs.forEach(x => (target[x] = true));
        }
        else {
            for (const [k, v] of Object.entries(source.stubs)) {
                target[k] = v;
            }
        }
    }
}
// perform 1-level-deep-pseudo-clone merge in order to prevent config leaks
// example: vue-router overwrites globalProperties.$router
function mergeAppConfig(configGlobalConfig, mountGlobalConfig) {
    return Object.assign(Object.assign(Object.assign({}, configGlobalConfig), mountGlobalConfig), { globalProperties: Object.assign(Object.assign({}, configGlobalConfig === null || configGlobalConfig === void 0 ? void 0 : configGlobalConfig.globalProperties), mountGlobalConfig === null || mountGlobalConfig === void 0 ? void 0 : mountGlobalConfig.globalProperties) });
}
function mergeGlobalProperties(mountGlobal = {}) {
    var _a, _b, _c;
    const stubs = {};
    const configGlobal = (_a = config === null || config === void 0 ? void 0 : config.global) !== null && _a !== void 0 ? _a : {};
    mergeStubs(stubs, configGlobal);
    mergeStubs(stubs, mountGlobal);
    const renderStubDefaultSlot = (_c = (_b = mountGlobal.renderStubDefaultSlot) !== null && _b !== void 0 ? _b : (configGlobal.renderStubDefaultSlot || (config === null || config === void 0 ? void 0 : config.renderStubDefaultSlot))) !== null && _c !== void 0 ? _c : false;
    if (config.renderStubDefaultSlot === true) {
        console.warn('config.renderStubDefaultSlot is deprecated, use config.global.renderStubDefaultSlot instead');
    }
    return {
        mixins: [...(configGlobal.mixins || []), ...(mountGlobal.mixins || [])],
        plugins: [...(configGlobal.plugins || []), ...(mountGlobal.plugins || [])],
        stubs,
        components: Object.assign(Object.assign({}, configGlobal.components), mountGlobal.components),
        provide: Object.assign(Object.assign({}, configGlobal.provide), mountGlobal.provide),
        mocks: Object.assign(Object.assign({}, configGlobal.mocks), mountGlobal.mocks),
        config: mergeAppConfig(configGlobal.config, mountGlobal.config),
        directives: Object.assign(Object.assign({}, configGlobal.directives), mountGlobal.directives),
        renderStubDefaultSlot
    };
}
const isObject$1 = (obj) => !!obj && typeof obj === 'object';
function isClass(obj) {
    if (!(obj instanceof Object))
        return;
    const isCtorClass = obj.constructor && obj.constructor.toString().substring(0, 5) === 'class';
    if (!('prototype' in obj)) {
        return isCtorClass;
    }
    const prototype = obj.prototype;
    const isPrototypeCtorClass = prototype.constructor &&
        prototype.constructor.toString &&
        prototype.constructor.toString().substring(0, 5) === 'class';
    return isCtorClass || isPrototypeCtorClass;
}
// https://stackoverflow.com/a/48218209
const mergeDeep = (target, source) => {
    var _a;
    if (!isObject$1(target) || !isObject$1(source)) {
        return source;
    }
    Object.keys(source)
        .concat(isClass(source)
        ? Object.getOwnPropertyNames((_a = Object.getPrototypeOf(source)) !== null && _a !== void 0 ? _a : {})
        : Object.getOwnPropertyNames(source))
        .forEach(key => {
        const targetValue = target[key];
        const sourceValue = source[key];
        if (Array.isArray(targetValue) && Array.isArray(sourceValue)) {
            target[key] = sourceValue;
        }
        else if (sourceValue instanceof Date) {
            target[key] = sourceValue;
        }
        else if (isObject$1(targetValue) && isObject$1(sourceValue)) {
            target[key] = mergeDeep(Object.assign({}, targetValue), sourceValue);
        }
        else {
            target[key] = sourceValue;
        }
    });
    return target;
};
function isComponent$1(component) {
    return Boolean(component &&
        (typeof component === 'object' || typeof component === 'function'));
}
function isFunctionalComponent(component) {
    return typeof component === 'function';
}
function isObjectComponent(component) {
    return Boolean(component && typeof component === 'object');
}
function textContent(element) {
    var _a, _b;
    // we check if the element is a comment first
    // to return an empty string in that case, instead of the comment content
    return element.nodeType !== Node.COMMENT_NODE
        ? ((_b = (_a = element.textContent) === null || _a === void 0 ? void 0 : _a.trim()) !== null && _b !== void 0 ? _b : '')
        : '';
}
function hasOwnProperty$2(obj, prop) {
    // eslint-disable-next-line no-prototype-builtins
    return obj.hasOwnProperty(prop);
}
function isNotNullOrUndefined(obj) {
    return Boolean(obj);
}
function isRefSelector(selector) {
    return typeof selector === 'object' && 'ref' in selector;
}
function convertStubsToRecord(stubs) {
    if (Array.isArray(stubs)) {
        // ['Foo', 'Bar'] => { Foo: true, Bar: true }
        return stubs.reduce((acc, current) => {
            acc[current] = true;
            return acc;
        }, {});
    }
    return stubs;
}
const isDirectiveKey = (key) => key.match(/^v[A-Z].*/);
function getComponentsFromStubs(stubs) {
    const normalizedStubs = convertStubsToRecord(stubs);
    return Object.fromEntries(Object.entries(normalizedStubs).filter(([key]) => !isDirectiveKey(key)));
}
function getDirectivesFromStubs(stubs) {
    const normalizedStubs = convertStubsToRecord(stubs);
    return Object.fromEntries(Object.entries(normalizedStubs)
        .filter(([key, value]) => isDirectiveKey(key) && value !== false)
        .map(([key, value]) => [key.substring(1), value]));
}
function hasSetupState(vm) {
    return (vm &&
        vm.$.devtoolsRawSetupState);
}
function isScriptSetup(vm) {
    return (vm && vm.$.setupState.__isScriptSetup);
}
let _globalThis$1;
const getGlobalThis$1 = () => {
    return (_globalThis$1 ||
        (_globalThis$1 =
            typeof globalThis !== 'undefined'
                ? globalThis
                : typeof self !== 'undefined'
                    ? self
                    : typeof window !== 'undefined'
                        ? window
                        : typeof global !== 'undefined'
                            ? global
                            : {}));
};

const ignorableKeyModifiers = [
    'stop',
    'prevent',
    'self',
    'exact',
    'prevent',
    'capture'
];
const systemKeyModifiers = ['ctrl', 'shift', 'alt', 'meta'];
const mouseKeyModifiers = ['left', 'middle', 'right'];
const keyCodesByKeyName = {
    backspace: 8,
    tab: 9,
    enter: 13,
    esc: 27,
    space: 32,
    pageup: 33,
    pagedown: 34,
    end: 35,
    home: 36,
    left: 37,
    up: 38,
    right: 39,
    down: 40,
    insert: 45,
    delete: 46
};
// Maps each supported key modifier to the W3C UI Events `KeyboardEvent.code`
// string. Keep keys aligned with `keyCodesByKeyName`.
const codesByKeyName = {
    backspace: 'Backspace',
    tab: 'Tab',
    enter: 'Enter',
    esc: 'Escape',
    space: 'Space',
    pageup: 'PageUp',
    pagedown: 'PageDown',
    end: 'End',
    home: 'Home',
    left: 'ArrowLeft',
    up: 'ArrowUp',
    right: 'ArrowRight',
    down: 'ArrowDown',
    insert: 'Insert',
    delete: 'Delete'
};
const domEvents = {
    abort: {
        eventInterface: 'Event',
        bubbles: false,
        cancelable: false
    },
    afterprint: {
        eventInterface: 'Event',
        bubbles: false,
        cancelable: false
    },
    animationend: {
        eventInterface: 'AnimationEvent',
        bubbles: true,
        cancelable: false
    },
    animationiteration: {
        eventInterface: 'AnimationEvent',
        bubbles: true,
        cancelable: false
    },
    animationstart: {
        eventInterface: 'AnimationEvent',
        bubbles: true,
        cancelable: false
    },
    appinstalled: {
        eventInterface: 'Event',
        bubbles: false,
        cancelable: false
    },
    /**
     * @deprecated
     */
    audioprocess: {
        eventInterface: 'AudioProcessingEvent',
        bubbles: false,
        cancelable: false
    },
    audioend: {
        eventInterface: 'Event',
        bubbles: false,
        cancelable: false
    },
    audiostart: {
        eventInterface: 'Event',
        bubbles: false,
        cancelable: false
    },
    beforeprint: {
        eventInterface: 'Event',
        bubbles: false,
        cancelable: false
    },
    beforeunload: {
        eventInterface: 'BeforeUnloadEvent',
        bubbles: false,
        cancelable: true
    },
    beginEvent: {
        eventInterface: 'TimeEvent',
        bubbles: false,
        cancelable: false
    },
    blur: {
        eventInterface: 'FocusEvent',
        bubbles: false,
        cancelable: false
    },
    boundary: {
        eventInterface: 'SpeechSynthesisEvent',
        bubbles: false,
        cancelable: false
    },
    cached: {
        eventInterface: 'Event',
        bubbles: false,
        cancelable: false
    },
    canplay: {
        eventInterface: 'Event',
        bubbles: false,
        cancelable: false
    },
    canplaythrough: {
        eventInterface: 'Event',
        bubbles: false,
        cancelable: false
    },
    change: {
        eventInterface: 'Event',
        bubbles: true,
        cancelable: false
    },
    chargingchange: {
        eventInterface: 'Event',
        bubbles: false,
        cancelable: false
    },
    chargingtimechange: {
        eventInterface: 'Event',
        bubbles: false,
        cancelable: false
    },
    checking: {
        eventInterface: 'Event',
        bubbles: false,
        cancelable: false
    },
    click: {
        eventInterface: 'MouseEvent',
        bubbles: true,
        cancelable: true
    },
    close: {
        eventInterface: 'Event',
        bubbles: false,
        cancelable: false
    },
    complete: {
        eventInterface: 'OfflineAudioCompletionEvent',
        bubbles: false,
        cancelable: false
    },
    compositionend: {
        eventInterface: 'CompositionEvent',
        bubbles: true,
        cancelable: true
    },
    compositionstart: {
        eventInterface: 'CompositionEvent',
        bubbles: true,
        cancelable: true
    },
    compositionupdate: {
        eventInterface: 'CompositionEvent',
        bubbles: true,
        cancelable: false
    },
    contextmenu: {
        eventInterface: 'MouseEvent',
        bubbles: true,
        cancelable: true
    },
    copy: {
        eventInterface: 'ClipboardEvent',
        bubbles: true,
        cancelable: true
    },
    cut: {
        eventInterface: 'ClipboardEvent',
        bubbles: true,
        cancelable: true
    },
    dblclick: {
        eventInterface: 'MouseEvent',
        bubbles: true,
        cancelable: true
    },
    devicechange: {
        eventInterface: 'Event',
        bubbles: false,
        cancelable: false
    },
    devicelight: {
        eventInterface: 'DeviceLightEvent',
        bubbles: false,
        cancelable: false
    },
    devicemotion: {
        eventInterface: 'DeviceMotionEvent',
        bubbles: false,
        cancelable: false
    },
    deviceorientation: {
        eventInterface: 'DeviceOrientationEvent',
        bubbles: false,
        cancelable: false
    },
    deviceproximity: {
        eventInterface: 'DeviceProximityEvent',
        bubbles: false,
        cancelable: false
    },
    dischargingtimechange: {
        eventInterface: 'Event',
        bubbles: false,
        cancelable: false
    },
    DOMActivate: {
        eventInterface: 'UIEvent',
        bubbles: true,
        cancelable: true
    },
    DOMAttributeNameChanged: {
        eventInterface: 'MutationNameEvent',
        bubbles: true,
        cancelable: true
    },
    DOMContentLoaded: {
        eventInterface: 'Event',
        bubbles: true,
        cancelable: true
    },
    DOMElementNameChanged: {
        eventInterface: 'MutationNameEvent',
        bubbles: true,
        cancelable: true
    },
    DOMFocusIn: {
        eventInterface: 'FocusEvent',
        bubbles: true,
        cancelable: true
    },
    DOMFocusOut: {
        eventInterface: 'FocusEvent',
        bubbles: true,
        cancelable: true
    },
    // Mutation Events (DOMAttrModified, DOMCharacterDataModified, DOMNodeInserted,
    // DOMNodeInsertedIntoDocument, DOMNodeRemoved, DOMNodeRemovedFromDocument,
    // DOMSubtreeModified) were removed from the dispatch table because Chrome 127
    // removed support for these legacy MutationEvents. Listening for them in the
    // browser now logs a deprecation warning. Use MutationObserver instead.
    // See https://chromestatus.com/feature/5083947249172480 and #2449.
    downloading: {
        eventInterface: 'Event',
        bubbles: false,
        cancelable: false
    },
    drag: {
        eventInterface: 'DragEvent',
        bubbles: true,
        cancelable: true
    },
    dragend: {
        eventInterface: 'DragEvent',
        bubbles: true,
        cancelable: false
    },
    dragenter: {
        eventInterface: 'DragEvent',
        bubbles: true,
        cancelable: true
    },
    dragleave: {
        eventInterface: 'DragEvent',
        bubbles: true,
        cancelable: false
    },
    dragover: {
        eventInterface: 'DragEvent',
        bubbles: true,
        cancelable: true
    },
    dragstart: {
        eventInterface: 'DragEvent',
        bubbles: true,
        cancelable: true
    },
    drop: {
        eventInterface: 'DragEvent',
        bubbles: true,
        cancelable: true
    },
    durationchange: {
        eventInterface: 'Event',
        bubbles: false,
        cancelable: false
    },
    emptied: {
        eventInterface: 'Event',
        bubbles: false,
        cancelable: false
    },
    end: {
        eventInterface: 'Event',
        bubbles: false,
        cancelable: false
    },
    ended: {
        eventInterface: 'Event',
        bubbles: false,
        cancelable: false
    },
    endEvent: {
        eventInterface: 'TimeEvent',
        bubbles: false,
        cancelable: false
    },
    error: {
        eventInterface: 'Event',
        bubbles: false,
        cancelable: false
    },
    focus: {
        eventInterface: 'FocusEvent',
        bubbles: false,
        cancelable: false
    },
    focusin: {
        eventInterface: 'FocusEvent',
        bubbles: true,
        cancelable: false
    },
    focusout: {
        eventInterface: 'FocusEvent',
        bubbles: true,
        cancelable: false
    },
    fullscreenchange: {
        eventInterface: 'Event',
        bubbles: true,
        cancelable: false
    },
    fullscreenerror: {
        eventInterface: 'Event',
        bubbles: true,
        cancelable: false
    },
    gamepadconnected: {
        eventInterface: 'GamepadEvent',
        bubbles: false,
        cancelable: false
    },
    gamepaddisconnected: {
        eventInterface: 'GamepadEvent',
        bubbles: false,
        cancelable: false
    },
    gotpointercapture: {
        eventInterface: 'PointerEvent',
        bubbles: false,
        cancelable: false
    },
    hashchange: {
        eventInterface: 'HashChangeEvent',
        bubbles: true,
        cancelable: false
    },
    lostpointercapture: {
        eventInterface: 'PointerEvent',
        bubbles: false,
        cancelable: false
    },
    input: {
        eventInterface: 'Event',
        bubbles: true,
        cancelable: false
    },
    invalid: {
        eventInterface: 'Event',
        cancelable: true,
        bubbles: false
    },
    keydown: {
        eventInterface: 'KeyboardEvent',
        bubbles: true,
        cancelable: true
    },
    keypress: {
        eventInterface: 'KeyboardEvent',
        bubbles: true,
        cancelable: true
    },
    keyup: {
        eventInterface: 'KeyboardEvent',
        bubbles: true,
        cancelable: true
    },
    languagechange: {
        eventInterface: 'Event',
        bubbles: false,
        cancelable: false
    },
    levelchange: {
        eventInterface: 'Event',
        bubbles: false,
        cancelable: false
    },
    load: {
        eventInterface: 'UIEvent',
        bubbles: false,
        cancelable: false
    },
    loadeddata: {
        eventInterface: 'Event',
        bubbles: false,
        cancelable: false
    },
    loadedmetadata: {
        eventInterface: 'Event',
        bubbles: false,
        cancelable: false
    },
    loadend: {
        eventInterface: 'ProgressEvent',
        bubbles: false,
        cancelable: false
    },
    loadstart: {
        eventInterface: 'ProgressEvent',
        bubbles: false,
        cancelable: false
    },
    mark: {
        eventInterface: 'SpeechSynthesisEvent',
        bubbles: false,
        cancelable: false
    },
    message: {
        eventInterface: 'MessageEvent',
        bubbles: false,
        cancelable: false
    },
    messageerror: {
        eventInterface: 'MessageEvent',
        bubbles: false,
        cancelable: false
    },
    mousedown: {
        eventInterface: 'MouseEvent',
        bubbles: true,
        cancelable: true
    },
    mouseenter: {
        eventInterface: 'MouseEvent',
        bubbles: false,
        cancelable: false
    },
    mouseleave: {
        eventInterface: 'MouseEvent',
        bubbles: false,
        cancelable: false
    },
    mousemove: {
        eventInterface: 'MouseEvent',
        bubbles: true,
        cancelable: true
    },
    mouseout: {
        eventInterface: 'MouseEvent',
        bubbles: true,
        cancelable: true
    },
    mouseover: {
        eventInterface: 'MouseEvent',
        bubbles: true,
        cancelable: true
    },
    mouseup: {
        eventInterface: 'MouseEvent',
        bubbles: true,
        cancelable: true
    },
    nomatch: {
        eventInterface: 'SpeechRecognitionEvent',
        bubbles: false,
        cancelable: false
    },
    notificationclick: {
        eventInterface: 'NotificationEvent',
        bubbles: false,
        cancelable: false
    },
    noupdate: {
        eventInterface: 'Event',
        bubbles: false,
        cancelable: false
    },
    obsolete: {
        eventInterface: 'Event',
        bubbles: false,
        cancelable: false
    },
    offline: {
        eventInterface: 'Event',
        bubbles: false,
        cancelable: false
    },
    online: {
        eventInterface: 'Event',
        bubbles: false,
        cancelable: false
    },
    open: {
        eventInterface: 'Event',
        bubbles: false,
        cancelable: false
    },
    orientationchange: {
        eventInterface: 'Event',
        bubbles: false,
        cancelable: false
    },
    pagehide: {
        eventInterface: 'PageTransitionEvent',
        bubbles: false,
        cancelable: false
    },
    pageshow: {
        eventInterface: 'PageTransitionEvent',
        bubbles: false,
        cancelable: false
    },
    paste: {
        eventInterface: 'ClipboardEvent',
        bubbles: true,
        cancelable: true
    },
    pause: {
        eventInterface: 'SpeechSynthesisEvent',
        bubbles: false,
        cancelable: false
    },
    pointercancel: {
        eventInterface: 'PointerEvent',
        bubbles: true,
        cancelable: false
    },
    pointerdown: {
        eventInterface: 'PointerEvent',
        bubbles: true,
        cancelable: true
    },
    pointerenter: {
        eventInterface: 'PointerEvent',
        bubbles: false,
        cancelable: false
    },
    pointerleave: {
        eventInterface: 'PointerEvent',
        bubbles: false,
        cancelable: false
    },
    pointerlockchange: {
        eventInterface: 'Event',
        bubbles: true,
        cancelable: false
    },
    pointerlockerror: {
        eventInterface: 'Event',
        bubbles: true,
        cancelable: false
    },
    pointermove: {
        eventInterface: 'PointerEvent',
        bubbles: true,
        cancelable: true
    },
    pointerout: {
        eventInterface: 'PointerEvent',
        bubbles: true,
        cancelable: true
    },
    pointerover: {
        eventInterface: 'PointerEvent',
        bubbles: true,
        cancelable: true
    },
    pointerup: {
        eventInterface: 'PointerEvent',
        bubbles: true,
        cancelable: true
    },
    play: {
        eventInterface: 'Event',
        bubbles: false,
        cancelable: false
    },
    playing: {
        eventInterface: 'Event',
        bubbles: false,
        cancelable: false
    },
    popstate: {
        eventInterface: 'PopStateEvent',
        bubbles: true,
        cancelable: false
    },
    progress: {
        eventInterface: 'ProgressEvent',
        bubbles: false,
        cancelable: false
    },
    push: {
        eventInterface: 'PushEvent',
        bubbles: false,
        cancelable: false
    },
    pushsubscriptionchange: {
        eventInterface: 'PushEvent',
        bubbles: false,
        cancelable: false
    },
    ratechange: {
        eventInterface: 'Event',
        bubbles: false,
        cancelable: false
    },
    readystatechange: {
        eventInterface: 'Event',
        bubbles: false,
        cancelable: false
    },
    repeatEvent: {
        eventInterface: 'TimeEvent',
        bubbles: false,
        cancelable: false
    },
    reset: {
        eventInterface: 'Event',
        bubbles: true,
        cancelable: true
    },
    resize: {
        eventInterface: 'UIEvent',
        bubbles: false,
        cancelable: false
    },
    resourcetimingbufferfull: {
        eventInterface: 'Performance',
        bubbles: true,
        cancelable: true
    },
    result: {
        eventInterface: 'SpeechRecognitionEvent',
        bubbles: false,
        cancelable: false
    },
    resume: {
        eventInterface: 'SpeechSynthesisEvent',
        bubbles: false,
        cancelable: false
    },
    scroll: {
        eventInterface: 'UIEvent',
        bubbles: false,
        cancelable: false
    },
    seeked: {
        eventInterface: 'Event',
        bubbles: false,
        cancelable: false
    },
    seeking: {
        eventInterface: 'Event',
        bubbles: false,
        cancelable: false
    },
    select: {
        eventInterface: 'UIEvent',
        bubbles: true,
        cancelable: false
    },
    selectstart: {
        eventInterface: 'Event',
        bubbles: true,
        cancelable: true
    },
    selectionchange: {
        eventInterface: 'Event',
        bubbles: false,
        cancelable: false
    },
    show: {
        eventInterface: 'MouseEvent',
        bubbles: false,
        cancelable: false
    },
    slotchange: {
        eventInterface: 'Event',
        bubbles: true,
        cancelable: false
    },
    soundend: {
        eventInterface: 'Event',
        bubbles: false,
        cancelable: false
    },
    soundstart: {
        eventInterface: 'Event',
        bubbles: false,
        cancelable: false
    },
    speechend: {
        eventInterface: 'Event',
        bubbles: false,
        cancelable: false
    },
    speechstart: {
        eventInterface: 'Event',
        bubbles: false,
        cancelable: false
    },
    stalled: {
        eventInterface: 'Event',
        bubbles: false,
        cancelable: false
    },
    start: {
        eventInterface: 'SpeechSynthesisEvent',
        bubbles: false,
        cancelable: false
    },
    storage: {
        eventInterface: 'StorageEvent',
        bubbles: false,
        cancelable: false
    },
    submit: {
        eventInterface: 'Event',
        bubbles: true,
        cancelable: true
    },
    success: {
        eventInterface: 'Event',
        bubbles: false,
        cancelable: false
    },
    suspend: {
        eventInterface: 'Event',
        bubbles: false,
        cancelable: false
    },
    SVGAbort: {
        eventInterface: 'SVGEvent',
        bubbles: true,
        cancelable: false
    },
    SVGError: {
        eventInterface: 'SVGEvent',
        bubbles: true,
        cancelable: false
    },
    SVGLoad: {
        eventInterface: 'SVGEvent',
        bubbles: false,
        cancelable: false
    },
    SVGResize: {
        eventInterface: 'SVGEvent',
        bubbles: true,
        cancelable: false
    },
    SVGScroll: {
        eventInterface: 'SVGEvent',
        bubbles: true,
        cancelable: false
    },
    SVGUnload: {
        eventInterface: 'SVGEvent',
        bubbles: false,
        cancelable: false
    },
    SVGZoom: {
        eventInterface: 'SVGZoomEvent',
        bubbles: true,
        cancelable: false
    },
    timeout: {
        eventInterface: 'ProgressEvent',
        bubbles: false,
        cancelable: false
    },
    timeupdate: {
        eventInterface: 'Event',
        bubbles: false,
        cancelable: false
    },
    touchcancel: {
        eventInterface: 'TouchEvent',
        bubbles: true,
        cancelable: false
    },
    touchend: {
        eventInterface: 'TouchEvent',
        bubbles: true,
        cancelable: true
    },
    touchmove: {
        eventInterface: 'TouchEvent',
        bubbles: true,
        cancelable: true
    },
    touchstart: {
        eventInterface: 'TouchEvent',
        bubbles: true,
        cancelable: true
    },
    transitionend: {
        eventInterface: 'TransitionEvent',
        bubbles: true,
        cancelable: true
    },
    unload: {
        eventInterface: 'UIEvent',
        bubbles: false,
        cancelable: false
    },
    updateready: {
        eventInterface: 'Event',
        bubbles: false,
        cancelable: false
    },
    userproximity: {
        eventInterface: 'UserProximityEvent',
        bubbles: false,
        cancelable: false
    },
    voiceschanged: {
        eventInterface: 'Event',
        bubbles: false,
        cancelable: false
    },
    visibilitychange: {
        eventInterface: 'Event',
        bubbles: true,
        cancelable: false
    },
    volumechange: {
        eventInterface: 'Event',
        bubbles: false,
        cancelable: false
    },
    waiting: {
        eventInterface: 'Event',
        bubbles: false,
        cancelable: false
    },
    wheel: {
        eventInterface: 'WheelEvent',
        bubbles: true,
        cancelable: true
    }
};

/**
 * Groups modifiers into lists
 */
function generateModifiers(modifiers, isOnClick) {
    const keyModifiers = [];
    const systemModifiers = [];
    for (let i = 0; i < modifiers.length; i++) {
        const modifier = modifiers[i];
        // addEventListener() options, e.g. .passive & .capture, that we dont need to handle
        if (ignorableKeyModifiers.includes(modifier)) {
            continue;
        }
        // modifiers that require special conversion
        // if passed a left/right key modifier with onClick, add it here as well.
        if (systemKeyModifiers.includes(modifier) ||
            (mouseKeyModifiers.includes(modifier) &&
                isOnClick)) {
            systemModifiers.push(modifier);
        }
        else {
            keyModifiers.push(modifier);
        }
    }
    return {
        keyModifiers,
        systemModifiers
    };
}
function getEventProperties(eventParams) {
    const { modifiers, options = {} } = eventParams;
    let { eventType } = eventParams;
    const isOnClick = eventType === 'click';
    const { keyModifiers, systemModifiers } = generateModifiers(modifiers, isOnClick);
    if (isOnClick) {
        // if it's a right click, it should fire a `contextmenu` event
        if (systemModifiers.includes('right')) {
            eventType = 'contextmenu';
            options.button = 2;
            // if its a middle click, fire a `mouseup` event
        }
        else if (systemModifiers.includes('middle')) {
            eventType = 'mouseup';
            options.button = 1;
        }
    }
    const meta = domEvents[eventType] || {
        eventInterface: 'Event',
        cancelable: true,
        bubbles: true
    };
    // convert `shift, ctrl` to `shiftKey, ctrlKey`
    // allows trigger('keydown.shift.ctrl.n') directly
    const systemModifiersMeta = systemModifiers.reduce((all, key) => {
        all[`${key}Key`] = true;
        return all;
    }, {});
    // get the keyCode for backwards compat
    const keyCode = keyCodesByKeyName[keyModifiers[0]] ||
        (options && (options.keyCode || options.code));
    const eventProperties = Object.assign(Object.assign(Object.assign(Object.assign({}, systemModifiersMeta), options), { bubbles: meta.bubbles, cancelable: meta.cancelable, 
        // Any derived options should go here
        keyCode, code: options.code || codesByKeyName[keyModifiers[0]] || keyCode }), (keyModifiers[0] ? { key: keyModifiers[0] } : {}));
    return {
        eventProperties,
        meta,
        eventType
    };
}
function createEvent(eventParams) {
    const { eventProperties, meta, eventType } = getEventProperties(eventParams);
    // user defined eventInterface
    const eventInterface = meta.eventInterface;
    const metaEventInterface = window[eventInterface];
    const SupportedEventInterface = typeof metaEventInterface === 'function' ? metaEventInterface : window.Event;
    return new SupportedEventInterface(eventType, 
    // event properties can only be added when the event is instantiated
    // custom properties must be added after the event has been instantiated
    eventProperties);
}
function createDOMEvent(eventString, options) {
    // split eventString like `keydown.ctrl.shift` into `keydown` and array of modifiers
    const [eventType, ...modifiers] = eventString.split('.');
    const eventParams = {
        eventType: eventType,
        modifiers: modifiers,
        options
    };
    const event = createEvent(eventParams);
    const eventPrototype = Object.getPrototypeOf(event);
    // attach custom options to the event, like `relatedTarget` and so on.
    if (options) {
        Object.keys(options).forEach(key => {
            const propertyDescriptor = Object.getOwnPropertyDescriptor(eventPrototype, key);
            const canSetProperty = !(propertyDescriptor && propertyDescriptor.set === undefined);
            if (canSetProperty) {
                event[key] = options[key];
            }
        });
    }
    return event;
}

// Stubbing occurs when in vnode transformer we're swapping
// component vnode type due to stubbing either component
// or directive on component
// In order to be able to find components we need to track pairs
// stub --> original component
// Having this as global might feel unsafe at first point
// One can assume that sharing stub map across mounts might
// lead to false matches, however our vnode mappers always
// produce new nodeTypes for each mount even if you're reusing
// same stub, so we're safe and do not need to pass these stubs
// for each mount operation
const stubs = new WeakMap();
function registerStub({ source, stub }) {
    stubs.set(stub, source);
}
function getOriginalComponentFromStub(stub) {
    return stubs.get(stub);
}

const cacheStringFunction$1 = (fn) => {
    const cache = Object.create(null);
    return ((str) => {
        const hit = cache[str];
        return hit || (cache[str] = fn(str));
    });
};
const camelizeRE$1 = /-(\w)/g;
const camelize$1 = cacheStringFunction$1((str) => {
    return str.replace(camelizeRE$1, (_, c) => (c ? c.toUpperCase() : ''));
});
const capitalize$1 = cacheStringFunction$1((str) => {
    return str.charAt(0).toUpperCase() + str.slice(1);
});
const hyphenateRE$1 = /\B([A-Z])/g;
const hyphenate$1 = cacheStringFunction$1((str) => {
    return str.replace(hyphenateRE$1, '-$1').toLowerCase();
});

function matchName(target, sourceName) {
    const camelized = camelize$1(target);
    const capitalized = capitalize$1(camelized);
    return (!!sourceName &&
        (sourceName === target ||
            sourceName === camelized ||
            sourceName === capitalized ||
            capitalize$1(camelize$1(sourceName)) === capitalized));
}

function isCompatEnabled$1(key) {
    var _a, _b;
    return (_b = (_a = Vue.compatUtils) === null || _a === void 0 ? void 0 : _a.isCompatEnabled(key)) !== null && _b !== void 0 ? _b : false;
}
function isLegacyExtendedComponent(component) {
    if (!isCompatEnabled$1('GLOBAL_EXTEND') || typeof component !== 'function') {
        return false;
    }
    return (hasOwnProperty$2(component, 'super') &&
        component.super.extend({}).super === component.super);
}
function unwrapLegacyVueExtendComponent(selector) {
    return isLegacyExtendedComponent(selector) ? selector.options : selector;
}
function isLegacyFunctionalComponent(component) {
    return Boolean(component &&
        typeof component === 'object' &&
        hasOwnProperty$2(component, 'functional') &&
        component.functional);
}

const getComponentNameInSetup = (instance, type) => Object.keys((instance === null || instance === void 0 ? void 0 : instance.setupState) || {}).find(key => { var _a; return ((_a = Object.getOwnPropertyDescriptor(instance.setupState, key)) === null || _a === void 0 ? void 0 : _a.value) === type; });
const getComponentRegisteredName = (instance, type) => {
    if (!instance || !instance.parent)
        return null;
    // try to infer the name based on local resolution
    const registry = instance.type.components;
    for (const key in registry) {
        if (registry[key] === type) {
            return key;
        }
    }
    // try to retrieve name imported in script setup
    return getComponentNameInSetup(instance.parent, type) || null;
};
const getComponentName$1 = (instance, type) => {
    if (isObjectComponent(type)) {
        return (
        // If the component we stub is a script setup component and is automatically
        // imported by unplugin-vue-components we can only get its name through
        // the `__name` property.
        getComponentNameInSetup(instance, type) || type.name || type.__name || '');
    }
    if (isLegacyExtendedComponent(type)) {
        return unwrapLegacyVueExtendComponent(type).name || '';
    }
    if (isFunctionalComponent(type)) {
        return type.displayName || type.name;
    }
    return '';
};

/**
 * Detect whether a selector matches a VNode
 * @param node
 * @param selector
 * @return {boolean | ((value: any) => boolean)}
 */
function matches(node, rawSelector) {
    var _a, _b, _c;
    const selector = unwrapLegacyVueExtendComponent(rawSelector);
    // do not return none Vue components
    if (!node.component)
        return false;
    const nodeType = node.type;
    if (!isComponent$1(nodeType))
        return false;
    if (typeof selector === 'string') {
        return (_b = (_a = node.el) === null || _a === void 0 ? void 0 : _a.matches) === null || _b === void 0 ? void 0 : _b.call(_a, selector);
    }
    // When we're using stubs we want user to be able to
    // find stubbed components both by original component
    // or stub definition. That's why we are trying to
    // extract original component and also stub, which was
    // used to create specialized stub for render
    const nodeTypeCandidates = [
        nodeType,
        getOriginalComponentFromStub(nodeType)
    ].filter(Boolean);
    // our selector might be a stub itself
    const target = (_c = getOriginalComponentFromStub(selector)) !== null && _c !== void 0 ? _c : selector;
    if (nodeTypeCandidates.includes(target)) {
        return true;
    }
    let componentName;
    componentName = getComponentName$1(node.component, nodeType);
    let selectorName = selector.name;
    // the component and selector both have a name
    if (componentName && selectorName) {
        return matchName(selectorName, componentName);
    }
    componentName =
        getComponentRegisteredName(node.component, nodeType) || undefined;
    // if a name is missing, then check the locally registered components in the parent
    if (node.component.parent) {
        const registry = node.component.parent.type.components;
        for (const key in registry) {
            // is it the selector
            if (!selectorName && registry[key] === selector) {
                selectorName = key;
            }
            // is it the component
            if (!componentName && registry[key] === nodeType) {
                componentName = key;
            }
        }
    }
    if (selectorName && componentName) {
        return matchName(selectorName, componentName);
    }
    return false;
}
/**
 * Filters out the null, undefined and primitive values,
 * to only keep VNode and VNodeArrayChildren values
 * @param value
 */
function nodesAsObject(value) {
    return !!value && typeof value === 'object';
}
/**
 * Collect all children
 * @param nodes
 * @param children
 */
function aggregateChildren(nodes, children) {
    if (children && Array.isArray(children)) {
        const reversedNodes = [...children].reverse().filter(nodesAsObject);
        reversedNodes.forEach((node) => {
            if (Array.isArray(node)) {
                aggregateChildren(nodes, node);
            }
            else {
                nodes.unshift(node);
            }
        });
    }
}
function findAllVNodes(vnode, selector) {
    const matchingNodes = [];
    const nodes = [vnode];
    while (nodes.length) {
        const node = nodes.shift();
        aggregateChildren(nodes, node.children);
        if (node.component) {
            aggregateChildren(nodes, [node.component.subTree]);
        }
        if (node.suspense) {
            // match children if component is Suspense
            const { activeBranch } = node.suspense;
            aggregateChildren(nodes, [activeBranch]);
        }
        if (matches(node, selector) && !matchingNodes.includes(node)) {
            matchingNodes.push(node);
        }
    }
    return matchingNodes;
}
function find(root, selector) {
    let matchingVNodes = findAllVNodes(root, selector);
    if (typeof selector === 'string') {
        // When searching by CSS selector we want only one (topmost) vnode for each el`
        matchingVNodes = matchingVNodes.filter((vnode) => { var _a; return ((_a = vnode.component.parent) === null || _a === void 0 ? void 0 : _a.vnode.el) !== vnode.el; });
    }
    return matchingVNodes.map((vnode) => vnode.component);
}

function createWrapperError(wrapperType) {
    return new Proxy(Object.create(null), {
        get(obj, prop) {
            switch (prop) {
                case 'then':
                    // allows for better errors when wrapping `find` in `await`
                    // https://github.com/vuejs/test-utils/issues/638
                    return;
                case 'exists':
                    return () => false;
                default:
                    throw new Error(`Cannot call ${String(prop)} on an empty ${wrapperType}.`);
            }
        }
    });
}

/*!
 * isElementVisible
 * Adapted from https://github.com/testing-library/jest-dom
 * Licensed under the MIT License.
 */
function isStyleVisible(element) {
    if (!(element instanceof HTMLElement) && !(element instanceof SVGElement)) {
        return false;
    }
    const { display, visibility, opacity } = getComputedStyle(element);
    return (display !== 'none' &&
        visibility !== 'hidden' &&
        visibility !== 'collapse' &&
        opacity !== '0');
}
/**
 * checks if an element is visible by checking its hidden attribute and parent visibility.
 * @param element
 * @returns boolean
 */
function isElementVisibleByAttribute(element) {
    if (element instanceof HTMLElement && element.hidden) {
        return false;
    }
    return true;
}
/**
 * checks if an element is hidden by a closed details element.
 * @param element
 * @returns boolean
 */
function isHiddenByClosedDetails(element) {
    const summary = element.closest('summary');
    let parent = element.parentElement;
    while (parent) {
        if (parent.nodeName === 'DETAILS' && !parent.open) {
            // If no <summary> ancestor exists, or the <summary> is not a direct child of this <details>,
            // then the content is hidden
            if (!summary || summary.parentElement !== parent) {
                return true;
            }
        }
        parent = parent.parentElement;
    }
    return false;
}
function isElementVisible(element) {
    return (element.nodeName !== '#comment' &&
        isStyleVisible(element) &&
        isElementVisibleByAttribute(element) &&
        !isHiddenByClosedDetails(element) &&
        (!element.parentElement || isElementVisible(element.parentElement)));
}

function isElement(element) {
    return element instanceof Element;
}

var WrapperType;
(function (WrapperType) {
    WrapperType[WrapperType["DOMWrapper"] = 0] = "DOMWrapper";
    WrapperType[WrapperType["VueWrapper"] = 1] = "VueWrapper";
})(WrapperType || (WrapperType = {}));
const factories = {};
function registerFactory(type, fn) {
    factories[type] = fn;
}
const createDOMWrapper = (element, subTree) => factories[WrapperType.DOMWrapper](element, subTree);
const createVueWrapper = (app, vm, setProps) => factories[WrapperType.VueWrapper](app, vm, setProps);

function stringifyNode(node) {
    return node instanceof Element
        ? node.outerHTML
        : new XMLSerializer().serializeToString(node);
}

function getDefaultExportFromCjs (x) {
	return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, 'default') ? x['default'] : x;
}

var js = {exports: {}};

var src = {};

var javascript = {exports: {}};

var beautifier$2 = {};

var output = {};

/*jshint node:true */

var hasRequiredOutput;

function requireOutput () {
	if (hasRequiredOutput) return output;
	hasRequiredOutput = 1;

	function OutputLine(parent) {
	  this.__parent = parent;
	  this.__character_count = 0;
	  // use indent_count as a marker for this.__lines that have preserved indentation
	  this.__indent_count = -1;
	  this.__alignment_count = 0;
	  this.__wrap_point_index = 0;
	  this.__wrap_point_character_count = 0;
	  this.__wrap_point_indent_count = -1;
	  this.__wrap_point_alignment_count = 0;

	  this.__items = [];
	}

	OutputLine.prototype.clone_empty = function() {
	  var line = new OutputLine(this.__parent);
	  line.set_indent(this.__indent_count, this.__alignment_count);
	  return line;
	};

	OutputLine.prototype.item = function(index) {
	  if (index < 0) {
	    return this.__items[this.__items.length + index];
	  } else {
	    return this.__items[index];
	  }
	};

	OutputLine.prototype.has_match = function(pattern) {
	  for (var lastCheckedOutput = this.__items.length - 1; lastCheckedOutput >= 0; lastCheckedOutput--) {
	    if (this.__items[lastCheckedOutput].match(pattern)) {
	      return true;
	    }
	  }
	  return false;
	};

	OutputLine.prototype.set_indent = function(indent, alignment) {
	  if (this.is_empty()) {
	    this.__indent_count = indent || 0;
	    this.__alignment_count = alignment || 0;
	    this.__character_count = this.__parent.get_indent_size(this.__indent_count, this.__alignment_count);
	  }
	};

	OutputLine.prototype._set_wrap_point = function() {
	  if (this.__parent.wrap_line_length) {
	    this.__wrap_point_index = this.__items.length;
	    this.__wrap_point_character_count = this.__character_count;
	    this.__wrap_point_indent_count = this.__parent.next_line.__indent_count;
	    this.__wrap_point_alignment_count = this.__parent.next_line.__alignment_count;
	  }
	};

	OutputLine.prototype._should_wrap = function() {
	  return this.__wrap_point_index &&
	    this.__character_count > this.__parent.wrap_line_length &&
	    this.__wrap_point_character_count > this.__parent.next_line.__character_count;
	};

	OutputLine.prototype._allow_wrap = function() {
	  if (this._should_wrap()) {
	    this.__parent.add_new_line();
	    var next = this.__parent.current_line;
	    next.set_indent(this.__wrap_point_indent_count, this.__wrap_point_alignment_count);
	    next.__items = this.__items.slice(this.__wrap_point_index);
	    this.__items = this.__items.slice(0, this.__wrap_point_index);

	    next.__character_count += this.__character_count - this.__wrap_point_character_count;
	    this.__character_count = this.__wrap_point_character_count;

	    if (next.__items[0] === " ") {
	      next.__items.splice(0, 1);
	      next.__character_count -= 1;
	    }
	    return true;
	  }
	  return false;
	};

	OutputLine.prototype.is_empty = function() {
	  return this.__items.length === 0;
	};

	OutputLine.prototype.last = function() {
	  if (!this.is_empty()) {
	    return this.__items[this.__items.length - 1];
	  } else {
	    return null;
	  }
	};

	OutputLine.prototype.push = function(item) {
	  this.__items.push(item);
	  var last_newline_index = item.lastIndexOf('\n');
	  if (last_newline_index !== -1) {
	    this.__character_count = item.length - last_newline_index;
	  } else {
	    this.__character_count += item.length;
	  }
	};

	OutputLine.prototype.pop = function() {
	  var item = null;
	  if (!this.is_empty()) {
	    item = this.__items.pop();
	    this.__character_count -= item.length;
	  }
	  return item;
	};


	OutputLine.prototype._remove_indent = function() {
	  if (this.__indent_count > 0) {
	    this.__indent_count -= 1;
	    this.__character_count -= this.__parent.indent_size;
	  }
	};

	OutputLine.prototype._remove_wrap_indent = function() {
	  if (this.__wrap_point_indent_count > 0) {
	    this.__wrap_point_indent_count -= 1;
	  }
	};
	OutputLine.prototype.trim = function() {
	  while (this.last() === ' ') {
	    this.__items.pop();
	    this.__character_count -= 1;
	  }
	};

	OutputLine.prototype.toString = function() {
	  var result = '';
	  if (this.is_empty()) {
	    if (this.__parent.indent_empty_lines) {
	      result = this.__parent.get_indent_string(this.__indent_count);
	    }
	  } else {
	    result = this.__parent.get_indent_string(this.__indent_count, this.__alignment_count);
	    result += this.__items.join('');
	  }
	  return result;
	};

	function IndentStringCache(options, baseIndentString) {
	  this.__cache = [''];
	  this.__indent_size = options.indent_size;
	  this.__indent_string = options.indent_char;
	  if (!options.indent_with_tabs) {
	    this.__indent_string = new Array(options.indent_size + 1).join(options.indent_char);
	  }

	  // Set to null to continue support for auto detection of base indent
	  baseIndentString = baseIndentString || '';
	  if (options.indent_level > 0) {
	    baseIndentString = new Array(options.indent_level + 1).join(this.__indent_string);
	  }

	  this.__base_string = baseIndentString;
	  this.__base_string_length = baseIndentString.length;
	}

	IndentStringCache.prototype.get_indent_size = function(indent, column) {
	  var result = this.__base_string_length;
	  column = column || 0;
	  if (indent < 0) {
	    result = 0;
	  }
	  result += indent * this.__indent_size;
	  result += column;
	  return result;
	};

	IndentStringCache.prototype.get_indent_string = function(indent_level, column) {
	  var result = this.__base_string;
	  column = column || 0;
	  if (indent_level < 0) {
	    indent_level = 0;
	    result = '';
	  }
	  column += indent_level * this.__indent_size;
	  this.__ensure_cache(column);
	  result += this.__cache[column];
	  return result;
	};

	IndentStringCache.prototype.__ensure_cache = function(column) {
	  while (column >= this.__cache.length) {
	    this.__add_column();
	  }
	};

	IndentStringCache.prototype.__add_column = function() {
	  var column = this.__cache.length;
	  var indent = 0;
	  var result = '';
	  if (this.__indent_size && column >= this.__indent_size) {
	    indent = Math.floor(column / this.__indent_size);
	    column -= indent * this.__indent_size;
	    result = new Array(indent + 1).join(this.__indent_string);
	  }
	  if (column) {
	    result += new Array(column + 1).join(' ');
	  }

	  this.__cache.push(result);
	};

	function Output(options, baseIndentString) {
	  this.__indent_cache = new IndentStringCache(options, baseIndentString);
	  this.raw = false;
	  this._end_with_newline = options.end_with_newline;
	  this.indent_size = options.indent_size;
	  this.wrap_line_length = options.wrap_line_length;
	  this.indent_empty_lines = options.indent_empty_lines;
	  this.__lines = [];
	  this.previous_line = null;
	  this.current_line = null;
	  this.next_line = new OutputLine(this);
	  this.space_before_token = false;
	  this.non_breaking_space = false;
	  this.previous_token_wrapped = false;
	  // initialize
	  this.__add_outputline();
	}

	Output.prototype.__add_outputline = function() {
	  this.previous_line = this.current_line;
	  this.current_line = this.next_line.clone_empty();
	  this.__lines.push(this.current_line);
	};

	Output.prototype.get_line_number = function() {
	  return this.__lines.length;
	};

	Output.prototype.get_indent_string = function(indent, column) {
	  return this.__indent_cache.get_indent_string(indent, column);
	};

	Output.prototype.get_indent_size = function(indent, column) {
	  return this.__indent_cache.get_indent_size(indent, column);
	};

	Output.prototype.is_empty = function() {
	  return !this.previous_line && this.current_line.is_empty();
	};

	Output.prototype.add_new_line = function(force_newline) {
	  // never newline at the start of file
	  // otherwise, newline only if we didn't just add one or we're forced
	  if (this.is_empty() ||
	    (!force_newline && this.just_added_newline())) {
	    return false;
	  }

	  // if raw output is enabled, don't print additional newlines,
	  // but still return True as though you had
	  if (!this.raw) {
	    this.__add_outputline();
	  }
	  return true;
	};

	Output.prototype.get_code = function(eol) {
	  this.trim(true);

	  // handle some edge cases where the last tokens
	  // has text that ends with newline(s)
	  var last_item = this.current_line.pop();
	  if (last_item) {
	    if (last_item[last_item.length - 1] === '\n') {
	      last_item = last_item.replace(/\n+$/g, '');
	    }
	    this.current_line.push(last_item);
	  }

	  if (this._end_with_newline) {
	    this.__add_outputline();
	  }

	  var sweet_code = this.__lines.join('\n');

	  if (eol !== '\n') {
	    sweet_code = sweet_code.replace(/[\n]/g, eol);
	  }
	  return sweet_code;
	};

	Output.prototype.set_wrap_point = function() {
	  this.current_line._set_wrap_point();
	};

	Output.prototype.set_indent = function(indent, alignment) {
	  indent = indent || 0;
	  alignment = alignment || 0;

	  // Next line stores alignment values
	  this.next_line.set_indent(indent, alignment);

	  // Never indent your first output indent at the start of the file
	  if (this.__lines.length > 1) {
	    this.current_line.set_indent(indent, alignment);
	    return true;
	  }

	  this.current_line.set_indent();
	  return false;
	};

	Output.prototype.add_raw_token = function(token) {
	  for (var x = 0; x < token.newlines; x++) {
	    this.__add_outputline();
	  }
	  this.current_line.set_indent(-1);
	  this.current_line.push(token.whitespace_before);
	  this.current_line.push(token.text);
	  this.space_before_token = false;
	  this.non_breaking_space = false;
	  this.previous_token_wrapped = false;
	};

	Output.prototype.add_token = function(printable_token) {
	  this.__add_space_before_token();
	  this.current_line.push(printable_token);
	  this.space_before_token = false;
	  this.non_breaking_space = false;
	  this.previous_token_wrapped = this.current_line._allow_wrap();
	};

	Output.prototype.__add_space_before_token = function() {
	  if (this.space_before_token && !this.just_added_newline()) {
	    if (!this.non_breaking_space) {
	      this.set_wrap_point();
	    }
	    this.current_line.push(' ');
	  }
	};

	Output.prototype.remove_indent = function(index) {
	  var output_length = this.__lines.length;
	  while (index < output_length) {
	    this.__lines[index]._remove_indent();
	    index++;
	  }
	  this.current_line._remove_wrap_indent();
	};

	Output.prototype.trim = function(eat_newlines) {
	  eat_newlines = (eat_newlines === undefined) ? false : eat_newlines;

	  this.current_line.trim();

	  while (eat_newlines && this.__lines.length > 1 &&
	    this.current_line.is_empty()) {
	    this.__lines.pop();
	    this.current_line = this.__lines[this.__lines.length - 1];
	    this.current_line.trim();
	  }

	  this.previous_line = this.__lines.length > 1 ?
	    this.__lines[this.__lines.length - 2] : null;
	};

	Output.prototype.just_added_newline = function() {
	  return this.current_line.is_empty();
	};

	Output.prototype.just_added_blankline = function() {
	  return this.is_empty() ||
	    (this.current_line.is_empty() && this.previous_line.is_empty());
	};

	Output.prototype.ensure_empty_line_above = function(starts_with, ends_with) {
	  var index = this.__lines.length - 2;
	  while (index >= 0) {
	    var potentialEmptyLine = this.__lines[index];
	    if (potentialEmptyLine.is_empty()) {
	      break;
	    } else if (potentialEmptyLine.item(0).indexOf(starts_with) !== 0 &&
	      potentialEmptyLine.item(-1) !== ends_with) {
	      this.__lines.splice(index + 1, 0, new OutputLine(this));
	      this.previous_line = this.__lines[this.__lines.length - 2];
	      break;
	    }
	    index--;
	  }
	};

	output.Output = Output;
	return output;
}

var token = {};

/*jshint node:true */

var hasRequiredToken;

function requireToken () {
	if (hasRequiredToken) return token;
	hasRequiredToken = 1;

	function Token(type, text, newlines, whitespace_before) {
	  this.type = type;
	  this.text = text;

	  // comments_before are
	  // comments that have a new line before them
	  // and may or may not have a newline after
	  // this is a set of comments before
	  this.comments_before = null; /* inline comment*/


	  // this.comments_after =  new TokenStream(); // no new line before and newline after
	  this.newlines = newlines || 0;
	  this.whitespace_before = whitespace_before || '';
	  this.parent = null;
	  this.next = null;
	  this.previous = null;
	  this.opened = null;
	  this.closed = null;
	  this.directives = null;
	}


	token.Token = Token;
	return token;
}

var acorn = {};

/* jshint node: true, curly: false */

var hasRequiredAcorn;

function requireAcorn () {
	if (hasRequiredAcorn) return acorn;
	hasRequiredAcorn = 1;
	(function (exports) {

		// acorn used char codes to squeeze the last bit of performance out
		// Beautifier is okay without that, so we're using regex
		// permit # (23), $ (36), and @ (64). @ is used in ES7 decorators.
		// 65 through 91 are uppercase letters.
		// permit _ (95).
		// 97 through 123 are lowercase letters.
		var baseASCIIidentifierStartChars = "\\x23\\x24\\x40\\x41-\\x5a\\x5f\\x61-\\x7a";

		// inside an identifier @ is not allowed but 0-9 are.
		var baseASCIIidentifierChars = "\\x24\\x30-\\x39\\x41-\\x5a\\x5f\\x61-\\x7a";

		// Big ugly regular expressions that match characters in the
		// whitespace, identifier, and identifier-start categories. These
		// are only applied when a character is found to actually have a
		// code point above 128.
		var nonASCIIidentifierStartChars = "\\xaa\\xb5\\xba\\xc0-\\xd6\\xd8-\\xf6\\xf8-\\u02c1\\u02c6-\\u02d1\\u02e0-\\u02e4\\u02ec\\u02ee\\u0370-\\u0374\\u0376\\u0377\\u037a-\\u037d\\u0386\\u0388-\\u038a\\u038c\\u038e-\\u03a1\\u03a3-\\u03f5\\u03f7-\\u0481\\u048a-\\u0527\\u0531-\\u0556\\u0559\\u0561-\\u0587\\u05d0-\\u05ea\\u05f0-\\u05f2\\u0620-\\u064a\\u066e\\u066f\\u0671-\\u06d3\\u06d5\\u06e5\\u06e6\\u06ee\\u06ef\\u06fa-\\u06fc\\u06ff\\u0710\\u0712-\\u072f\\u074d-\\u07a5\\u07b1\\u07ca-\\u07ea\\u07f4\\u07f5\\u07fa\\u0800-\\u0815\\u081a\\u0824\\u0828\\u0840-\\u0858\\u08a0\\u08a2-\\u08ac\\u0904-\\u0939\\u093d\\u0950\\u0958-\\u0961\\u0971-\\u0977\\u0979-\\u097f\\u0985-\\u098c\\u098f\\u0990\\u0993-\\u09a8\\u09aa-\\u09b0\\u09b2\\u09b6-\\u09b9\\u09bd\\u09ce\\u09dc\\u09dd\\u09df-\\u09e1\\u09f0\\u09f1\\u0a05-\\u0a0a\\u0a0f\\u0a10\\u0a13-\\u0a28\\u0a2a-\\u0a30\\u0a32\\u0a33\\u0a35\\u0a36\\u0a38\\u0a39\\u0a59-\\u0a5c\\u0a5e\\u0a72-\\u0a74\\u0a85-\\u0a8d\\u0a8f-\\u0a91\\u0a93-\\u0aa8\\u0aaa-\\u0ab0\\u0ab2\\u0ab3\\u0ab5-\\u0ab9\\u0abd\\u0ad0\\u0ae0\\u0ae1\\u0b05-\\u0b0c\\u0b0f\\u0b10\\u0b13-\\u0b28\\u0b2a-\\u0b30\\u0b32\\u0b33\\u0b35-\\u0b39\\u0b3d\\u0b5c\\u0b5d\\u0b5f-\\u0b61\\u0b71\\u0b83\\u0b85-\\u0b8a\\u0b8e-\\u0b90\\u0b92-\\u0b95\\u0b99\\u0b9a\\u0b9c\\u0b9e\\u0b9f\\u0ba3\\u0ba4\\u0ba8-\\u0baa\\u0bae-\\u0bb9\\u0bd0\\u0c05-\\u0c0c\\u0c0e-\\u0c10\\u0c12-\\u0c28\\u0c2a-\\u0c33\\u0c35-\\u0c39\\u0c3d\\u0c58\\u0c59\\u0c60\\u0c61\\u0c85-\\u0c8c\\u0c8e-\\u0c90\\u0c92-\\u0ca8\\u0caa-\\u0cb3\\u0cb5-\\u0cb9\\u0cbd\\u0cde\\u0ce0\\u0ce1\\u0cf1\\u0cf2\\u0d05-\\u0d0c\\u0d0e-\\u0d10\\u0d12-\\u0d3a\\u0d3d\\u0d4e\\u0d60\\u0d61\\u0d7a-\\u0d7f\\u0d85-\\u0d96\\u0d9a-\\u0db1\\u0db3-\\u0dbb\\u0dbd\\u0dc0-\\u0dc6\\u0e01-\\u0e30\\u0e32\\u0e33\\u0e40-\\u0e46\\u0e81\\u0e82\\u0e84\\u0e87\\u0e88\\u0e8a\\u0e8d\\u0e94-\\u0e97\\u0e99-\\u0e9f\\u0ea1-\\u0ea3\\u0ea5\\u0ea7\\u0eaa\\u0eab\\u0ead-\\u0eb0\\u0eb2\\u0eb3\\u0ebd\\u0ec0-\\u0ec4\\u0ec6\\u0edc-\\u0edf\\u0f00\\u0f40-\\u0f47\\u0f49-\\u0f6c\\u0f88-\\u0f8c\\u1000-\\u102a\\u103f\\u1050-\\u1055\\u105a-\\u105d\\u1061\\u1065\\u1066\\u106e-\\u1070\\u1075-\\u1081\\u108e\\u10a0-\\u10c5\\u10c7\\u10cd\\u10d0-\\u10fa\\u10fc-\\u1248\\u124a-\\u124d\\u1250-\\u1256\\u1258\\u125a-\\u125d\\u1260-\\u1288\\u128a-\\u128d\\u1290-\\u12b0\\u12b2-\\u12b5\\u12b8-\\u12be\\u12c0\\u12c2-\\u12c5\\u12c8-\\u12d6\\u12d8-\\u1310\\u1312-\\u1315\\u1318-\\u135a\\u1380-\\u138f\\u13a0-\\u13f4\\u1401-\\u166c\\u166f-\\u167f\\u1681-\\u169a\\u16a0-\\u16ea\\u16ee-\\u16f0\\u1700-\\u170c\\u170e-\\u1711\\u1720-\\u1731\\u1740-\\u1751\\u1760-\\u176c\\u176e-\\u1770\\u1780-\\u17b3\\u17d7\\u17dc\\u1820-\\u1877\\u1880-\\u18a8\\u18aa\\u18b0-\\u18f5\\u1900-\\u191c\\u1950-\\u196d\\u1970-\\u1974\\u1980-\\u19ab\\u19c1-\\u19c7\\u1a00-\\u1a16\\u1a20-\\u1a54\\u1aa7\\u1b05-\\u1b33\\u1b45-\\u1b4b\\u1b83-\\u1ba0\\u1bae\\u1baf\\u1bba-\\u1be5\\u1c00-\\u1c23\\u1c4d-\\u1c4f\\u1c5a-\\u1c7d\\u1ce9-\\u1cec\\u1cee-\\u1cf1\\u1cf5\\u1cf6\\u1d00-\\u1dbf\\u1e00-\\u1f15\\u1f18-\\u1f1d\\u1f20-\\u1f45\\u1f48-\\u1f4d\\u1f50-\\u1f57\\u1f59\\u1f5b\\u1f5d\\u1f5f-\\u1f7d\\u1f80-\\u1fb4\\u1fb6-\\u1fbc\\u1fbe\\u1fc2-\\u1fc4\\u1fc6-\\u1fcc\\u1fd0-\\u1fd3\\u1fd6-\\u1fdb\\u1fe0-\\u1fec\\u1ff2-\\u1ff4\\u1ff6-\\u1ffc\\u2071\\u207f\\u2090-\\u209c\\u2102\\u2107\\u210a-\\u2113\\u2115\\u2119-\\u211d\\u2124\\u2126\\u2128\\u212a-\\u212d\\u212f-\\u2139\\u213c-\\u213f\\u2145-\\u2149\\u214e\\u2160-\\u2188\\u2c00-\\u2c2e\\u2c30-\\u2c5e\\u2c60-\\u2ce4\\u2ceb-\\u2cee\\u2cf2\\u2cf3\\u2d00-\\u2d25\\u2d27\\u2d2d\\u2d30-\\u2d67\\u2d6f\\u2d80-\\u2d96\\u2da0-\\u2da6\\u2da8-\\u2dae\\u2db0-\\u2db6\\u2db8-\\u2dbe\\u2dc0-\\u2dc6\\u2dc8-\\u2dce\\u2dd0-\\u2dd6\\u2dd8-\\u2dde\\u2e2f\\u3005-\\u3007\\u3021-\\u3029\\u3031-\\u3035\\u3038-\\u303c\\u3041-\\u3096\\u309d-\\u309f\\u30a1-\\u30fa\\u30fc-\\u30ff\\u3105-\\u312d\\u3131-\\u318e\\u31a0-\\u31ba\\u31f0-\\u31ff\\u3400-\\u4db5\\u4e00-\\u9fcc\\ua000-\\ua48c\\ua4d0-\\ua4fd\\ua500-\\ua60c\\ua610-\\ua61f\\ua62a\\ua62b\\ua640-\\ua66e\\ua67f-\\ua697\\ua6a0-\\ua6ef\\ua717-\\ua71f\\ua722-\\ua788\\ua78b-\\ua78e\\ua790-\\ua793\\ua7a0-\\ua7aa\\ua7f8-\\ua801\\ua803-\\ua805\\ua807-\\ua80a\\ua80c-\\ua822\\ua840-\\ua873\\ua882-\\ua8b3\\ua8f2-\\ua8f7\\ua8fb\\ua90a-\\ua925\\ua930-\\ua946\\ua960-\\ua97c\\ua984-\\ua9b2\\ua9cf\\uaa00-\\uaa28\\uaa40-\\uaa42\\uaa44-\\uaa4b\\uaa60-\\uaa76\\uaa7a\\uaa80-\\uaaaf\\uaab1\\uaab5\\uaab6\\uaab9-\\uaabd\\uaac0\\uaac2\\uaadb-\\uaadd\\uaae0-\\uaaea\\uaaf2-\\uaaf4\\uab01-\\uab06\\uab09-\\uab0e\\uab11-\\uab16\\uab20-\\uab26\\uab28-\\uab2e\\uabc0-\\uabe2\\uac00-\\ud7a3\\ud7b0-\\ud7c6\\ud7cb-\\ud7fb\\uf900-\\ufa6d\\ufa70-\\ufad9\\ufb00-\\ufb06\\ufb13-\\ufb17\\ufb1d\\ufb1f-\\ufb28\\ufb2a-\\ufb36\\ufb38-\\ufb3c\\ufb3e\\ufb40\\ufb41\\ufb43\\ufb44\\ufb46-\\ufbb1\\ufbd3-\\ufd3d\\ufd50-\\ufd8f\\ufd92-\\ufdc7\\ufdf0-\\ufdfb\\ufe70-\\ufe74\\ufe76-\\ufefc\\uff21-\\uff3a\\uff41-\\uff5a\\uff66-\\uffbe\\uffc2-\\uffc7\\uffca-\\uffcf\\uffd2-\\uffd7\\uffda-\\uffdc";
		var nonASCIIidentifierChars = "\\u0300-\\u036f\\u0483-\\u0487\\u0591-\\u05bd\\u05bf\\u05c1\\u05c2\\u05c4\\u05c5\\u05c7\\u0610-\\u061a\\u0620-\\u0649\\u0672-\\u06d3\\u06e7-\\u06e8\\u06fb-\\u06fc\\u0730-\\u074a\\u0800-\\u0814\\u081b-\\u0823\\u0825-\\u0827\\u0829-\\u082d\\u0840-\\u0857\\u08e4-\\u08fe\\u0900-\\u0903\\u093a-\\u093c\\u093e-\\u094f\\u0951-\\u0957\\u0962-\\u0963\\u0966-\\u096f\\u0981-\\u0983\\u09bc\\u09be-\\u09c4\\u09c7\\u09c8\\u09d7\\u09df-\\u09e0\\u0a01-\\u0a03\\u0a3c\\u0a3e-\\u0a42\\u0a47\\u0a48\\u0a4b-\\u0a4d\\u0a51\\u0a66-\\u0a71\\u0a75\\u0a81-\\u0a83\\u0abc\\u0abe-\\u0ac5\\u0ac7-\\u0ac9\\u0acb-\\u0acd\\u0ae2-\\u0ae3\\u0ae6-\\u0aef\\u0b01-\\u0b03\\u0b3c\\u0b3e-\\u0b44\\u0b47\\u0b48\\u0b4b-\\u0b4d\\u0b56\\u0b57\\u0b5f-\\u0b60\\u0b66-\\u0b6f\\u0b82\\u0bbe-\\u0bc2\\u0bc6-\\u0bc8\\u0bca-\\u0bcd\\u0bd7\\u0be6-\\u0bef\\u0c01-\\u0c03\\u0c46-\\u0c48\\u0c4a-\\u0c4d\\u0c55\\u0c56\\u0c62-\\u0c63\\u0c66-\\u0c6f\\u0c82\\u0c83\\u0cbc\\u0cbe-\\u0cc4\\u0cc6-\\u0cc8\\u0cca-\\u0ccd\\u0cd5\\u0cd6\\u0ce2-\\u0ce3\\u0ce6-\\u0cef\\u0d02\\u0d03\\u0d46-\\u0d48\\u0d57\\u0d62-\\u0d63\\u0d66-\\u0d6f\\u0d82\\u0d83\\u0dca\\u0dcf-\\u0dd4\\u0dd6\\u0dd8-\\u0ddf\\u0df2\\u0df3\\u0e34-\\u0e3a\\u0e40-\\u0e45\\u0e50-\\u0e59\\u0eb4-\\u0eb9\\u0ec8-\\u0ecd\\u0ed0-\\u0ed9\\u0f18\\u0f19\\u0f20-\\u0f29\\u0f35\\u0f37\\u0f39\\u0f41-\\u0f47\\u0f71-\\u0f84\\u0f86-\\u0f87\\u0f8d-\\u0f97\\u0f99-\\u0fbc\\u0fc6\\u1000-\\u1029\\u1040-\\u1049\\u1067-\\u106d\\u1071-\\u1074\\u1082-\\u108d\\u108f-\\u109d\\u135d-\\u135f\\u170e-\\u1710\\u1720-\\u1730\\u1740-\\u1750\\u1772\\u1773\\u1780-\\u17b2\\u17dd\\u17e0-\\u17e9\\u180b-\\u180d\\u1810-\\u1819\\u1920-\\u192b\\u1930-\\u193b\\u1951-\\u196d\\u19b0-\\u19c0\\u19c8-\\u19c9\\u19d0-\\u19d9\\u1a00-\\u1a15\\u1a20-\\u1a53\\u1a60-\\u1a7c\\u1a7f-\\u1a89\\u1a90-\\u1a99\\u1b46-\\u1b4b\\u1b50-\\u1b59\\u1b6b-\\u1b73\\u1bb0-\\u1bb9\\u1be6-\\u1bf3\\u1c00-\\u1c22\\u1c40-\\u1c49\\u1c5b-\\u1c7d\\u1cd0-\\u1cd2\\u1d00-\\u1dbe\\u1e01-\\u1f15\\u200c\\u200d\\u203f\\u2040\\u2054\\u20d0-\\u20dc\\u20e1\\u20e5-\\u20f0\\u2d81-\\u2d96\\u2de0-\\u2dff\\u3021-\\u3028\\u3099\\u309a\\ua640-\\ua66d\\ua674-\\ua67d\\ua69f\\ua6f0-\\ua6f1\\ua7f8-\\ua800\\ua806\\ua80b\\ua823-\\ua827\\ua880-\\ua881\\ua8b4-\\ua8c4\\ua8d0-\\ua8d9\\ua8f3-\\ua8f7\\ua900-\\ua909\\ua926-\\ua92d\\ua930-\\ua945\\ua980-\\ua983\\ua9b3-\\ua9c0\\uaa00-\\uaa27\\uaa40-\\uaa41\\uaa4c-\\uaa4d\\uaa50-\\uaa59\\uaa7b\\uaae0-\\uaae9\\uaaf2-\\uaaf3\\uabc0-\\uabe1\\uabec\\uabed\\uabf0-\\uabf9\\ufb20-\\ufb28\\ufe00-\\ufe0f\\ufe20-\\ufe26\\ufe33\\ufe34\\ufe4d-\\ufe4f\\uff10-\\uff19\\uff3f";
		//var nonASCIIidentifierStart = new RegExp("[" + nonASCIIidentifierStartChars + "]");
		//var nonASCIIidentifier = new RegExp("[" + nonASCIIidentifierStartChars + nonASCIIidentifierChars + "]");

		var unicodeEscapeOrCodePoint = "\\\\u[0-9a-fA-F]{4}|\\\\u\\{[0-9a-fA-F]+\\}";
		var identifierStart = "(?:" + unicodeEscapeOrCodePoint + "|[" + baseASCIIidentifierStartChars + nonASCIIidentifierStartChars + "])";
		var identifierChars = "(?:" + unicodeEscapeOrCodePoint + "|[" + baseASCIIidentifierChars + nonASCIIidentifierStartChars + nonASCIIidentifierChars + "])*";

		exports.identifier = new RegExp(identifierStart + identifierChars, 'g');
		exports.identifierStart = new RegExp(identifierStart);
		exports.identifierMatch = new RegExp("(?:" + unicodeEscapeOrCodePoint + "|[" + baseASCIIidentifierChars + nonASCIIidentifierStartChars + nonASCIIidentifierChars + "])+");

		// Whether a single character denotes a newline.

		exports.newline = /[\n\r\u2028\u2029]/;

		// Matches a whole line break (where CRLF is considered a single
		// line break). Used to count lines.

		// in javascript, these two differ
		// in python they are the same, different methods are called on them
		exports.lineBreak = new RegExp('\r\n|' + exports.newline.source);
		exports.allLineBreaks = new RegExp(exports.lineBreak.source, 'g'); 
	} (acorn));
	return acorn;
}

var options$3 = {};

var options$2 = {};

/*jshint node:true */

var hasRequiredOptions$3;

function requireOptions$3 () {
	if (hasRequiredOptions$3) return options$2;
	hasRequiredOptions$3 = 1;

	function Options(options, merge_child_field) {
	  this.raw_options = _mergeOpts(options, merge_child_field);

	  // Support passing the source text back with no change
	  this.disabled = this._get_boolean('disabled');

	  this.eol = this._get_characters('eol', 'auto');
	  this.end_with_newline = this._get_boolean('end_with_newline');
	  this.indent_size = this._get_number('indent_size', 4);
	  this.indent_char = this._get_characters('indent_char', ' ');
	  this.indent_level = this._get_number('indent_level');

	  this.preserve_newlines = this._get_boolean('preserve_newlines', true);
	  this.max_preserve_newlines = this._get_number('max_preserve_newlines', 32786);
	  if (!this.preserve_newlines) {
	    this.max_preserve_newlines = 0;
	  }

	  this.indent_with_tabs = this._get_boolean('indent_with_tabs', this.indent_char === '\t');
	  if (this.indent_with_tabs) {
	    this.indent_char = '\t';

	    // indent_size behavior changed after 1.8.6
	    // It used to be that indent_size would be
	    // set to 1 for indent_with_tabs. That is no longer needed and
	    // actually doesn't make sense - why not use spaces? Further,
	    // that might produce unexpected behavior - tabs being used
	    // for single-column alignment. So, when indent_with_tabs is true
	    // and indent_size is 1, reset indent_size to 4.
	    if (this.indent_size === 1) {
	      this.indent_size = 4;
	    }
	  }

	  // Backwards compat with 1.3.x
	  this.wrap_line_length = this._get_number('wrap_line_length', this._get_number('max_char'));

	  this.indent_empty_lines = this._get_boolean('indent_empty_lines');

	  // valid templating languages ['django', 'erb', 'handlebars', 'php', 'smarty', 'angular']
	  // For now, 'auto' = all off for javascript, all except angular on for html (and inline javascript/css).
	  // other values ignored
	  this.templating = this._get_selection_list('templating', ['auto', 'none', 'angular', 'django', 'erb', 'handlebars', 'php', 'smarty'], ['auto']);
	}

	Options.prototype._get_array = function(name, default_value) {
	  var option_value = this.raw_options[name];
	  var result = default_value || [];
	  if (typeof option_value === 'object') {
	    if (option_value !== null && typeof option_value.concat === 'function') {
	      result = option_value.concat();
	    }
	  } else if (typeof option_value === 'string') {
	    result = option_value.split(/[^a-zA-Z0-9_\/\-]+/);
	  }
	  return result;
	};

	Options.prototype._get_boolean = function(name, default_value) {
	  var option_value = this.raw_options[name];
	  var result = option_value === undefined ? !!default_value : !!option_value;
	  return result;
	};

	Options.prototype._get_characters = function(name, default_value) {
	  var option_value = this.raw_options[name];
	  var result = default_value || '';
	  if (typeof option_value === 'string') {
	    result = option_value.replace(/\\r/, '\r').replace(/\\n/, '\n').replace(/\\t/, '\t');
	  }
	  return result;
	};

	Options.prototype._get_number = function(name, default_value) {
	  var option_value = this.raw_options[name];
	  default_value = parseInt(default_value, 10);
	  if (isNaN(default_value)) {
	    default_value = 0;
	  }
	  var result = parseInt(option_value, 10);
	  if (isNaN(result)) {
	    result = default_value;
	  }
	  return result;
	};

	Options.prototype._get_selection = function(name, selection_list, default_value) {
	  var result = this._get_selection_list(name, selection_list, default_value);
	  if (result.length !== 1) {
	    throw new Error(
	      "Invalid Option Value: The option '" + name + "' can only be one of the following values:\n" +
	      selection_list + "\nYou passed in: '" + this.raw_options[name] + "'");
	  }

	  return result[0];
	};


	Options.prototype._get_selection_list = function(name, selection_list, default_value) {
	  if (!selection_list || selection_list.length === 0) {
	    throw new Error("Selection list cannot be empty.");
	  }

	  default_value = default_value || [selection_list[0]];
	  if (!this._is_valid_selection(default_value, selection_list)) {
	    throw new Error("Invalid Default Value!");
	  }

	  var result = this._get_array(name, default_value);
	  if (!this._is_valid_selection(result, selection_list)) {
	    throw new Error(
	      "Invalid Option Value: The option '" + name + "' can contain only the following values:\n" +
	      selection_list + "\nYou passed in: '" + this.raw_options[name] + "'");
	  }

	  return result;
	};

	Options.prototype._is_valid_selection = function(result, selection_list) {
	  return result.length && selection_list.length &&
	    !result.some(function(item) { return selection_list.indexOf(item) === -1; });
	};


	// merges child options up with the parent options object
	// Example: obj = {a: 1, b: {a: 2}}
	//          mergeOpts(obj, 'b')
	//
	//          Returns: {a: 2}
	function _mergeOpts(allOptions, childFieldName) {
	  var finalOpts = {};
	  allOptions = _normalizeOpts(allOptions);
	  var name;

	  for (name in allOptions) {
	    if (name !== childFieldName) {
	      finalOpts[name] = allOptions[name];
	    }
	  }

	  //merge in the per type settings for the childFieldName
	  if (childFieldName && allOptions[childFieldName]) {
	    for (name in allOptions[childFieldName]) {
	      finalOpts[name] = allOptions[childFieldName][name];
	    }
	  }
	  return finalOpts;
	}

	function _normalizeOpts(options) {
	  var convertedOpts = {};
	  var key;

	  for (key in options) {
	    var newKey = key.replace(/-/g, "_");
	    convertedOpts[newKey] = options[key];
	  }
	  return convertedOpts;
	}

	options$2.Options = Options;
	options$2.normalizeOpts = _normalizeOpts;
	options$2.mergeOpts = _mergeOpts;
	return options$2;
}

/*jshint node:true */

var hasRequiredOptions$2;

function requireOptions$2 () {
	if (hasRequiredOptions$2) return options$3;
	hasRequiredOptions$2 = 1;

	var BaseOptions = requireOptions$3().Options;

	var validPositionValues = ['before-newline', 'after-newline', 'preserve-newline'];

	function Options(options) {
	  BaseOptions.call(this, options, 'js');

	  // compatibility, re
	  var raw_brace_style = this.raw_options.brace_style || null;
	  if (raw_brace_style === "expand-strict") { //graceful handling of deprecated option
	    this.raw_options.brace_style = "expand";
	  } else if (raw_brace_style === "collapse-preserve-inline") { //graceful handling of deprecated option
	    this.raw_options.brace_style = "collapse,preserve-inline";
	  } else if (this.raw_options.braces_on_own_line !== undefined) { //graceful handling of deprecated option
	    this.raw_options.brace_style = this.raw_options.braces_on_own_line ? "expand" : "collapse";
	    // } else if (!raw_brace_style) { //Nothing exists to set it
	    //   raw_brace_style = "collapse";
	  }

	  //preserve-inline in delimited string will trigger brace_preserve_inline, everything
	  //else is considered a brace_style and the last one only will have an effect

	  var brace_style_split = this._get_selection_list('brace_style', ['collapse', 'expand', 'end-expand', 'none', 'preserve-inline']);

	  this.brace_preserve_inline = false; //Defaults in case one or other was not specified in meta-option
	  this.brace_style = "collapse";

	  for (var bs = 0; bs < brace_style_split.length; bs++) {
	    if (brace_style_split[bs] === "preserve-inline") {
	      this.brace_preserve_inline = true;
	    } else {
	      this.brace_style = brace_style_split[bs];
	    }
	  }

	  this.unindent_chained_methods = this._get_boolean('unindent_chained_methods');
	  this.break_chained_methods = this._get_boolean('break_chained_methods');
	  this.space_in_paren = this._get_boolean('space_in_paren');
	  this.space_in_empty_paren = this._get_boolean('space_in_empty_paren');
	  this.jslint_happy = this._get_boolean('jslint_happy');
	  this.space_after_anon_function = this._get_boolean('space_after_anon_function');
	  this.space_after_named_function = this._get_boolean('space_after_named_function');
	  this.keep_array_indentation = this._get_boolean('keep_array_indentation');
	  this.space_before_conditional = this._get_boolean('space_before_conditional', true);
	  this.unescape_strings = this._get_boolean('unescape_strings');
	  this.e4x = this._get_boolean('e4x');
	  this.comma_first = this._get_boolean('comma_first');
	  this.operator_position = this._get_selection('operator_position', validPositionValues);

	  // For testing of beautify preserve:start directive
	  this.test_output_raw = this._get_boolean('test_output_raw');

	  // force this._options.space_after_anon_function to true if this._options.jslint_happy
	  if (this.jslint_happy) {
	    this.space_after_anon_function = true;
	  }

	}
	Options.prototype = new BaseOptions();



	options$3.Options = Options;
	return options$3;
}

var tokenizer$3 = {};

var inputscanner = {};

/*jshint node:true */

var hasRequiredInputscanner;

function requireInputscanner () {
	if (hasRequiredInputscanner) return inputscanner;
	hasRequiredInputscanner = 1;

	var regexp_has_sticky = RegExp.prototype.hasOwnProperty('sticky');

	function InputScanner(input_string) {
	  this.__input = input_string || '';
	  this.__input_length = this.__input.length;
	  this.__position = 0;
	}

	InputScanner.prototype.restart = function() {
	  this.__position = 0;
	};

	InputScanner.prototype.back = function() {
	  if (this.__position > 0) {
	    this.__position -= 1;
	  }
	};

	InputScanner.prototype.hasNext = function() {
	  return this.__position < this.__input_length;
	};

	InputScanner.prototype.next = function() {
	  var val = null;
	  if (this.hasNext()) {
	    val = this.__input.charAt(this.__position);
	    this.__position += 1;
	  }
	  return val;
	};

	InputScanner.prototype.peek = function(index) {
	  var val = null;
	  index = index || 0;
	  index += this.__position;
	  if (index >= 0 && index < this.__input_length) {
	    val = this.__input.charAt(index);
	  }
	  return val;
	};

	// This is a JavaScript only helper function (not in python)
	// Javascript doesn't have a match method
	// and not all implementation support "sticky" flag.
	// If they do not support sticky then both this.match() and this.test() method
	// must get the match and check the index of the match.
	// If sticky is supported and set, this method will use it.
	// Otherwise it will check that global is set, and fall back to the slower method.
	InputScanner.prototype.__match = function(pattern, index) {
	  pattern.lastIndex = index;
	  var pattern_match = pattern.exec(this.__input);

	  if (pattern_match && !(regexp_has_sticky && pattern.sticky)) {
	    if (pattern_match.index !== index) {
	      pattern_match = null;
	    }
	  }

	  return pattern_match;
	};

	InputScanner.prototype.test = function(pattern, index) {
	  index = index || 0;
	  index += this.__position;

	  if (index >= 0 && index < this.__input_length) {
	    return !!this.__match(pattern, index);
	  } else {
	    return false;
	  }
	};

	InputScanner.prototype.testChar = function(pattern, index) {
	  // test one character regex match
	  var val = this.peek(index);
	  pattern.lastIndex = 0;
	  return val !== null && pattern.test(val);
	};

	InputScanner.prototype.match = function(pattern) {
	  var pattern_match = this.__match(pattern, this.__position);
	  if (pattern_match) {
	    this.__position += pattern_match[0].length;
	  } else {
	    pattern_match = null;
	  }
	  return pattern_match;
	};

	InputScanner.prototype.read = function(starting_pattern, until_pattern, until_after) {
	  var val = '';
	  var match;
	  if (starting_pattern) {
	    match = this.match(starting_pattern);
	    if (match) {
	      val += match[0];
	    }
	  }
	  if (until_pattern && (match || !starting_pattern)) {
	    val += this.readUntil(until_pattern, until_after);
	  }
	  return val;
	};

	InputScanner.prototype.readUntil = function(pattern, until_after) {
	  var val = '';
	  var match_index = this.__position;
	  pattern.lastIndex = this.__position;
	  var pattern_match = pattern.exec(this.__input);
	  if (pattern_match) {
	    match_index = pattern_match.index;
	    if (until_after) {
	      match_index += pattern_match[0].length;
	    }
	  } else {
	    match_index = this.__input_length;
	  }

	  val = this.__input.substring(this.__position, match_index);
	  this.__position = match_index;
	  return val;
	};

	InputScanner.prototype.readUntilAfter = function(pattern) {
	  return this.readUntil(pattern, true);
	};

	InputScanner.prototype.get_regexp = function(pattern, match_from) {
	  var result = null;
	  var flags = 'g';
	  if (match_from && regexp_has_sticky) {
	    flags = 'y';
	  }
	  // strings are converted to regexp
	  if (typeof pattern === "string" && pattern !== '') {
	    // result = new RegExp(pattern.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'), flags);
	    result = new RegExp(pattern, flags);
	  } else if (pattern) {
	    result = new RegExp(pattern.source, flags);
	  }
	  return result;
	};

	InputScanner.prototype.get_literal_regexp = function(literal_string) {
	  return RegExp(literal_string.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'));
	};

	/* css beautifier legacy helpers */
	InputScanner.prototype.peekUntilAfter = function(pattern) {
	  var start = this.__position;
	  var val = this.readUntilAfter(pattern);
	  this.__position = start;
	  return val;
	};

	InputScanner.prototype.lookBack = function(testVal) {
	  var start = this.__position - 1;
	  return start >= testVal.length && this.__input.substring(start - testVal.length, start)
	    .toLowerCase() === testVal;
	};

	inputscanner.InputScanner = InputScanner;
	return inputscanner;
}

var tokenizer$2 = {};

var tokenstream = {};

/*jshint node:true */

var hasRequiredTokenstream;

function requireTokenstream () {
	if (hasRequiredTokenstream) return tokenstream;
	hasRequiredTokenstream = 1;

	function TokenStream(parent_token) {
	  // private
	  this.__tokens = [];
	  this.__tokens_length = this.__tokens.length;
	  this.__position = 0;
	  this.__parent_token = parent_token;
	}

	TokenStream.prototype.restart = function() {
	  this.__position = 0;
	};

	TokenStream.prototype.isEmpty = function() {
	  return this.__tokens_length === 0;
	};

	TokenStream.prototype.hasNext = function() {
	  return this.__position < this.__tokens_length;
	};

	TokenStream.prototype.next = function() {
	  var val = null;
	  if (this.hasNext()) {
	    val = this.__tokens[this.__position];
	    this.__position += 1;
	  }
	  return val;
	};

	TokenStream.prototype.peek = function(index) {
	  var val = null;
	  index = index || 0;
	  index += this.__position;
	  if (index >= 0 && index < this.__tokens_length) {
	    val = this.__tokens[index];
	  }
	  return val;
	};

	TokenStream.prototype.add = function(token) {
	  if (this.__parent_token) {
	    token.parent = this.__parent_token;
	  }
	  this.__tokens.push(token);
	  this.__tokens_length += 1;
	};

	tokenstream.TokenStream = TokenStream;
	return tokenstream;
}

var whitespacepattern = {};

var pattern = {};

/*jshint node:true */

var hasRequiredPattern;

function requirePattern () {
	if (hasRequiredPattern) return pattern;
	hasRequiredPattern = 1;

	function Pattern(input_scanner, parent) {
	  this._input = input_scanner;
	  this._starting_pattern = null;
	  this._match_pattern = null;
	  this._until_pattern = null;
	  this._until_after = false;

	  if (parent) {
	    this._starting_pattern = this._input.get_regexp(parent._starting_pattern, true);
	    this._match_pattern = this._input.get_regexp(parent._match_pattern, true);
	    this._until_pattern = this._input.get_regexp(parent._until_pattern);
	    this._until_after = parent._until_after;
	  }
	}

	Pattern.prototype.read = function() {
	  var result = this._input.read(this._starting_pattern);
	  if (!this._starting_pattern || result) {
	    result += this._input.read(this._match_pattern, this._until_pattern, this._until_after);
	  }
	  return result;
	};

	Pattern.prototype.read_match = function() {
	  return this._input.match(this._match_pattern);
	};

	Pattern.prototype.until_after = function(pattern) {
	  var result = this._create();
	  result._until_after = true;
	  result._until_pattern = this._input.get_regexp(pattern);
	  result._update();
	  return result;
	};

	Pattern.prototype.until = function(pattern) {
	  var result = this._create();
	  result._until_after = false;
	  result._until_pattern = this._input.get_regexp(pattern);
	  result._update();
	  return result;
	};

	Pattern.prototype.starting_with = function(pattern) {
	  var result = this._create();
	  result._starting_pattern = this._input.get_regexp(pattern, true);
	  result._update();
	  return result;
	};

	Pattern.prototype.matching = function(pattern) {
	  var result = this._create();
	  result._match_pattern = this._input.get_regexp(pattern, true);
	  result._update();
	  return result;
	};

	Pattern.prototype._create = function() {
	  return new Pattern(this._input, this);
	};

	Pattern.prototype._update = function() {};

	pattern.Pattern = Pattern;
	return pattern;
}

/*jshint node:true */

var hasRequiredWhitespacepattern;

function requireWhitespacepattern () {
	if (hasRequiredWhitespacepattern) return whitespacepattern;
	hasRequiredWhitespacepattern = 1;

	var Pattern = requirePattern().Pattern;

	function WhitespacePattern(input_scanner, parent) {
	  Pattern.call(this, input_scanner, parent);
	  if (parent) {
	    this._line_regexp = this._input.get_regexp(parent._line_regexp);
	  } else {
	    this.__set_whitespace_patterns('', '');
	  }

	  this.newline_count = 0;
	  this.whitespace_before_token = '';
	}
	WhitespacePattern.prototype = new Pattern();

	WhitespacePattern.prototype.__set_whitespace_patterns = function(whitespace_chars, newline_chars) {
	  whitespace_chars += '\\t ';
	  newline_chars += '\\n\\r';

	  this._match_pattern = this._input.get_regexp(
	    '[' + whitespace_chars + newline_chars + ']+', true);
	  this._newline_regexp = this._input.get_regexp(
	    '\\r\\n|[' + newline_chars + ']');
	};

	WhitespacePattern.prototype.read = function() {
	  this.newline_count = 0;
	  this.whitespace_before_token = '';

	  var resulting_string = this._input.read(this._match_pattern);
	  if (resulting_string === ' ') {
	    this.whitespace_before_token = ' ';
	  } else if (resulting_string) {
	    var matches = this.__split(this._newline_regexp, resulting_string);
	    this.newline_count = matches.length - 1;
	    this.whitespace_before_token = matches[this.newline_count];
	  }

	  return resulting_string;
	};

	WhitespacePattern.prototype.matching = function(whitespace_chars, newline_chars) {
	  var result = this._create();
	  result.__set_whitespace_patterns(whitespace_chars, newline_chars);
	  result._update();
	  return result;
	};

	WhitespacePattern.prototype._create = function() {
	  return new WhitespacePattern(this._input, this);
	};

	WhitespacePattern.prototype.__split = function(regexp, input_string) {
	  regexp.lastIndex = 0;
	  var start_index = 0;
	  var result = [];
	  var next_match = regexp.exec(input_string);
	  while (next_match) {
	    result.push(input_string.substring(start_index, next_match.index));
	    start_index = next_match.index + next_match[0].length;
	    next_match = regexp.exec(input_string);
	  }

	  if (start_index < input_string.length) {
	    result.push(input_string.substring(start_index, input_string.length));
	  } else {
	    result.push('');
	  }

	  return result;
	};



	whitespacepattern.WhitespacePattern = WhitespacePattern;
	return whitespacepattern;
}

/*jshint node:true */

var hasRequiredTokenizer$2;

function requireTokenizer$2 () {
	if (hasRequiredTokenizer$2) return tokenizer$2;
	hasRequiredTokenizer$2 = 1;

	var InputScanner = requireInputscanner().InputScanner;
	var Token = requireToken().Token;
	var TokenStream = requireTokenstream().TokenStream;
	var WhitespacePattern = requireWhitespacepattern().WhitespacePattern;

	var TOKEN = {
	  START: 'TK_START',
	  RAW: 'TK_RAW',
	  EOF: 'TK_EOF'
	};

	var Tokenizer = function(input_string, options) {
	  this._input = new InputScanner(input_string);
	  this._options = options || {};
	  this.__tokens = null;

	  this._patterns = {};
	  this._patterns.whitespace = new WhitespacePattern(this._input);
	};

	Tokenizer.prototype.tokenize = function() {
	  this._input.restart();
	  this.__tokens = new TokenStream();

	  this._reset();

	  var current;
	  var previous = new Token(TOKEN.START, '');
	  var open_token = null;
	  var open_stack = [];
	  var comments = new TokenStream();

	  while (previous.type !== TOKEN.EOF) {
	    current = this._get_next_token(previous, open_token);
	    while (this._is_comment(current)) {
	      comments.add(current);
	      current = this._get_next_token(previous, open_token);
	    }

	    if (!comments.isEmpty()) {
	      current.comments_before = comments;
	      comments = new TokenStream();
	    }

	    current.parent = open_token;

	    if (this._is_opening(current)) {
	      open_stack.push(open_token);
	      open_token = current;
	    } else if (open_token && this._is_closing(current, open_token)) {
	      current.opened = open_token;
	      open_token.closed = current;
	      open_token = open_stack.pop();
	      current.parent = open_token;
	    }

	    current.previous = previous;
	    previous.next = current;

	    this.__tokens.add(current);
	    previous = current;
	  }

	  return this.__tokens;
	};


	Tokenizer.prototype._is_first_token = function() {
	  return this.__tokens.isEmpty();
	};

	Tokenizer.prototype._reset = function() {};

	Tokenizer.prototype._get_next_token = function(previous_token, open_token) { // jshint unused:false
	  this._readWhitespace();
	  var resulting_string = this._input.read(/.+/g);
	  if (resulting_string) {
	    return this._create_token(TOKEN.RAW, resulting_string);
	  } else {
	    return this._create_token(TOKEN.EOF, '');
	  }
	};

	Tokenizer.prototype._is_comment = function(current_token) { // jshint unused:false
	  return false;
	};

	Tokenizer.prototype._is_opening = function(current_token) { // jshint unused:false
	  return false;
	};

	Tokenizer.prototype._is_closing = function(current_token, open_token) { // jshint unused:false
	  return false;
	};

	Tokenizer.prototype._create_token = function(type, text) {
	  var token = new Token(type, text,
	    this._patterns.whitespace.newline_count,
	    this._patterns.whitespace.whitespace_before_token);
	  return token;
	};

	Tokenizer.prototype._readWhitespace = function() {
	  return this._patterns.whitespace.read();
	};



	tokenizer$2.Tokenizer = Tokenizer;
	tokenizer$2.TOKEN = TOKEN;
	return tokenizer$2;
}

var directives = {};

/*jshint node:true */

var hasRequiredDirectives;

function requireDirectives () {
	if (hasRequiredDirectives) return directives;
	hasRequiredDirectives = 1;

	function Directives(start_block_pattern, end_block_pattern) {
	  start_block_pattern = typeof start_block_pattern === 'string' ? start_block_pattern : start_block_pattern.source;
	  end_block_pattern = typeof end_block_pattern === 'string' ? end_block_pattern : end_block_pattern.source;
	  this.__directives_block_pattern = new RegExp(start_block_pattern + / beautify( \w+[:]\w+)+ /.source + end_block_pattern, 'g');
	  this.__directive_pattern = / (\w+)[:](\w+)/g;

	  this.__directives_end_ignore_pattern = new RegExp(start_block_pattern + /\sbeautify\signore:end\s/.source + end_block_pattern, 'g');
	}

	Directives.prototype.get_directives = function(text) {
	  if (!text.match(this.__directives_block_pattern)) {
	    return null;
	  }

	  var directives = {};
	  this.__directive_pattern.lastIndex = 0;
	  var directive_match = this.__directive_pattern.exec(text);

	  while (directive_match) {
	    directives[directive_match[1]] = directive_match[2];
	    directive_match = this.__directive_pattern.exec(text);
	  }

	  return directives;
	};

	Directives.prototype.readIgnored = function(input) {
	  return input.readUntilAfter(this.__directives_end_ignore_pattern);
	};


	directives.Directives = Directives;
	return directives;
}

var templatablepattern = {};

/*jshint node:true */

var hasRequiredTemplatablepattern;

function requireTemplatablepattern () {
	if (hasRequiredTemplatablepattern) return templatablepattern;
	hasRequiredTemplatablepattern = 1;

	var Pattern = requirePattern().Pattern;


	var template_names = {
	  django: false,
	  erb: false,
	  handlebars: false,
	  php: false,
	  smarty: false,
	  angular: false
	};

	// This lets templates appear anywhere we would do a readUntil
	// The cost is higher but it is pay to play.
	function TemplatablePattern(input_scanner, parent) {
	  Pattern.call(this, input_scanner, parent);
	  this.__template_pattern = null;
	  this._disabled = Object.assign({}, template_names);
	  this._excluded = Object.assign({}, template_names);

	  if (parent) {
	    this.__template_pattern = this._input.get_regexp(parent.__template_pattern);
	    this._excluded = Object.assign(this._excluded, parent._excluded);
	    this._disabled = Object.assign(this._disabled, parent._disabled);
	  }
	  var pattern = new Pattern(input_scanner);
	  this.__patterns = {
	    handlebars_comment: pattern.starting_with(/{{!--/).until_after(/--}}/),
	    handlebars_unescaped: pattern.starting_with(/{{{/).until_after(/}}}/),
	    handlebars: pattern.starting_with(/{{/).until_after(/}}/),
	    php: pattern.starting_with(/<\?(?:[= ]|php)/).until_after(/\?>/),
	    erb: pattern.starting_with(/<%[^%]/).until_after(/[^%]%>/),
	    // django coflicts with handlebars a bit.
	    django: pattern.starting_with(/{%/).until_after(/%}/),
	    django_value: pattern.starting_with(/{{/).until_after(/}}/),
	    django_comment: pattern.starting_with(/{#/).until_after(/#}/),
	    smarty: pattern.starting_with(/{(?=[^}{\s\n])/).until_after(/[^\s\n]}/),
	    smarty_comment: pattern.starting_with(/{\*/).until_after(/\*}/),
	    smarty_literal: pattern.starting_with(/{literal}/).until_after(/{\/literal}/)
	  };
	}
	TemplatablePattern.prototype = new Pattern();

	TemplatablePattern.prototype._create = function() {
	  return new TemplatablePattern(this._input, this);
	};

	TemplatablePattern.prototype._update = function() {
	  this.__set_templated_pattern();
	};

	TemplatablePattern.prototype.disable = function(language) {
	  var result = this._create();
	  result._disabled[language] = true;
	  result._update();
	  return result;
	};

	TemplatablePattern.prototype.read_options = function(options) {
	  var result = this._create();
	  for (var language in template_names) {
	    result._disabled[language] = options.templating.indexOf(language) === -1;
	  }
	  result._update();
	  return result;
	};

	TemplatablePattern.prototype.exclude = function(language) {
	  var result = this._create();
	  result._excluded[language] = true;
	  result._update();
	  return result;
	};

	TemplatablePattern.prototype.read = function() {
	  var result = '';
	  if (this._match_pattern) {
	    result = this._input.read(this._starting_pattern);
	  } else {
	    result = this._input.read(this._starting_pattern, this.__template_pattern);
	  }
	  var next = this._read_template();
	  while (next) {
	    if (this._match_pattern) {
	      next += this._input.read(this._match_pattern);
	    } else {
	      next += this._input.readUntil(this.__template_pattern);
	    }
	    result += next;
	    next = this._read_template();
	  }

	  if (this._until_after) {
	    result += this._input.readUntilAfter(this._until_pattern);
	  }
	  return result;
	};

	TemplatablePattern.prototype.__set_templated_pattern = function() {
	  var items = [];

	  if (!this._disabled.php) {
	    items.push(this.__patterns.php._starting_pattern.source);
	  }
	  if (!this._disabled.handlebars) {
	    items.push(this.__patterns.handlebars._starting_pattern.source);
	  }
	  if (!this._disabled.angular) {
	    // Handlebars ('{{' and '}}') are also special tokens in Angular)
	    items.push(this.__patterns.handlebars._starting_pattern.source);
	  }
	  if (!this._disabled.erb) {
	    items.push(this.__patterns.erb._starting_pattern.source);
	  }
	  if (!this._disabled.django) {
	    items.push(this.__patterns.django._starting_pattern.source);
	    // The starting pattern for django is more complex because it has different
	    // patterns for value, comment, and other sections
	    items.push(this.__patterns.django_value._starting_pattern.source);
	    items.push(this.__patterns.django_comment._starting_pattern.source);
	  }
	  if (!this._disabled.smarty) {
	    items.push(this.__patterns.smarty._starting_pattern.source);
	  }

	  if (this._until_pattern) {
	    items.push(this._until_pattern.source);
	  }
	  this.__template_pattern = this._input.get_regexp('(?:' + items.join('|') + ')');
	};

	TemplatablePattern.prototype._read_template = function() {
	  var resulting_string = '';
	  var c = this._input.peek();
	  if (c === '<') {
	    var peek1 = this._input.peek(1);
	    //if we're in a comment, do something special
	    // We treat all comments as literals, even more than preformatted tags
	    // we just look for the appropriate close tag
	    if (!this._disabled.php && !this._excluded.php && peek1 === '?') {
	      resulting_string = resulting_string ||
	        this.__patterns.php.read();
	    }
	    if (!this._disabled.erb && !this._excluded.erb && peek1 === '%') {
	      resulting_string = resulting_string ||
	        this.__patterns.erb.read();
	    }
	  } else if (c === '{') {
	    if (!this._disabled.handlebars && !this._excluded.handlebars) {
	      resulting_string = resulting_string ||
	        this.__patterns.handlebars_comment.read();
	      resulting_string = resulting_string ||
	        this.__patterns.handlebars_unescaped.read();
	      resulting_string = resulting_string ||
	        this.__patterns.handlebars.read();
	    }
	    if (!this._disabled.django) {
	      // django coflicts with handlebars a bit.
	      if (!this._excluded.django && !this._excluded.handlebars) {
	        resulting_string = resulting_string ||
	          this.__patterns.django_value.read();
	      }
	      if (!this._excluded.django) {
	        resulting_string = resulting_string ||
	          this.__patterns.django_comment.read();
	        resulting_string = resulting_string ||
	          this.__patterns.django.read();
	      }
	    }
	    if (!this._disabled.smarty) {
	      // smarty cannot be enabled with django or handlebars enabled
	      if (this._disabled.django && this._disabled.handlebars) {
	        resulting_string = resulting_string ||
	          this.__patterns.smarty_comment.read();
	        resulting_string = resulting_string ||
	          this.__patterns.smarty_literal.read();
	        resulting_string = resulting_string ||
	          this.__patterns.smarty.read();
	      }
	    }
	  }
	  return resulting_string;
	};


	templatablepattern.TemplatablePattern = TemplatablePattern;
	return templatablepattern;
}

/*jshint node:true */

var hasRequiredTokenizer$1;

function requireTokenizer$1 () {
	if (hasRequiredTokenizer$1) return tokenizer$3;
	hasRequiredTokenizer$1 = 1;

	var InputScanner = requireInputscanner().InputScanner;
	var BaseTokenizer = requireTokenizer$2().Tokenizer;
	var BASETOKEN = requireTokenizer$2().TOKEN;
	var Directives = requireDirectives().Directives;
	var acorn = requireAcorn();
	var Pattern = requirePattern().Pattern;
	var TemplatablePattern = requireTemplatablepattern().TemplatablePattern;


	function in_array(what, arr) {
	  return arr.indexOf(what) !== -1;
	}


	var TOKEN = {
	  START_EXPR: 'TK_START_EXPR',
	  END_EXPR: 'TK_END_EXPR',
	  START_BLOCK: 'TK_START_BLOCK',
	  END_BLOCK: 'TK_END_BLOCK',
	  WORD: 'TK_WORD',
	  RESERVED: 'TK_RESERVED',
	  SEMICOLON: 'TK_SEMICOLON',
	  STRING: 'TK_STRING',
	  EQUALS: 'TK_EQUALS',
	  OPERATOR: 'TK_OPERATOR',
	  COMMA: 'TK_COMMA',
	  BLOCK_COMMENT: 'TK_BLOCK_COMMENT',
	  COMMENT: 'TK_COMMENT',
	  DOT: 'TK_DOT',
	  UNKNOWN: 'TK_UNKNOWN',
	  START: BASETOKEN.START,
	  RAW: BASETOKEN.RAW,
	  EOF: BASETOKEN.EOF
	};


	var directives_core = new Directives(/\/\*/, /\*\//);

	var number_pattern = /0[xX][0123456789abcdefABCDEF_]*n?|0[oO][01234567_]*n?|0[bB][01_]*n?|\d[\d_]*n|(?:\.\d[\d_]*|\d[\d_]*\.?[\d_]*)(?:[eE][+-]?[\d_]+)?/;

	var digit = /[0-9]/;

	// Dot "." must be distinguished from "..." and decimal
	var dot_pattern = /[^\d\.]/;

	var positionable_operators = (
	  ">>> === !== &&= ??= ||= " +
	  "<< && >= ** != == <= >> || ?? |> " +
	  "< / - + > : & % ? ^ | *").split(' ');

	// IMPORTANT: this must be sorted longest to shortest or tokenizing many not work.
	// Also, you must update possitionable operators separately from punct
	var punct =
	  ">>>= " +
	  "... >>= <<= === >>> !== **= &&= ??= ||= " +
	  "=> ^= :: /= << <= == && -= >= >> != -- += ** || ?? ++ %= &= *= |= |> " +
	  "= ! ? > < : / ^ - + * & % ~ |";

	punct = punct.replace(/[-[\]{}()*+?.,\\^$|#]/g, "\\$&");
	// ?. but not if followed by a number 
	punct = '\\?\\.(?!\\d) ' + punct;
	punct = punct.replace(/ /g, '|');

	var punct_pattern = new RegExp(punct);

	// words which should always start on new line.
	var line_starters = 'continue,try,throw,return,var,let,const,if,switch,case,default,for,while,break,function,import,export'.split(',');
	var reserved_words = line_starters.concat(['do', 'in', 'of', 'else', 'get', 'set', 'new', 'catch', 'finally', 'typeof', 'yield', 'async', 'await', 'from', 'as', 'class', 'extends']);
	var reserved_word_pattern = new RegExp('^(?:' + reserved_words.join('|') + ')$');

	// var template_pattern = /(?:(?:<\?php|<\?=)[\s\S]*?\?>)|(?:<%[\s\S]*?%>)/g;

	var in_html_comment;

	var Tokenizer = function(input_string, options) {
	  BaseTokenizer.call(this, input_string, options);

	  this._patterns.whitespace = this._patterns.whitespace.matching(
	    /\u00A0\u1680\u180e\u2000-\u200a\u202f\u205f\u3000\ufeff/.source,
	    /\u2028\u2029/.source);

	  var pattern_reader = new Pattern(this._input);
	  var templatable = new TemplatablePattern(this._input)
	    .read_options(this._options);

	  this.__patterns = {
	    template: templatable,
	    identifier: templatable.starting_with(acorn.identifier).matching(acorn.identifierMatch),
	    number: pattern_reader.matching(number_pattern),
	    punct: pattern_reader.matching(punct_pattern),
	    // comment ends just before nearest linefeed or end of file
	    comment: pattern_reader.starting_with(/\/\//).until(/[\n\r\u2028\u2029]/),
	    //  /* ... */ comment ends with nearest */ or end of file
	    block_comment: pattern_reader.starting_with(/\/\*/).until_after(/\*\//),
	    html_comment_start: pattern_reader.matching(/<!--/),
	    html_comment_end: pattern_reader.matching(/-->/),
	    include: pattern_reader.starting_with(/#include/).until_after(acorn.lineBreak),
	    shebang: pattern_reader.starting_with(/#!/).until_after(acorn.lineBreak),
	    xml: pattern_reader.matching(/[\s\S]*?<(\/?)([-a-zA-Z:0-9_.]+|{[^}]+?}|!\[CDATA\[[^\]]*?\]\]|)(\s*{[^}]+?}|\s+[-a-zA-Z:0-9_.]+|\s+[-a-zA-Z:0-9_.]+\s*=\s*('[^']*'|"[^"]*"|{([^{}]|{[^}]+?})+?}))*\s*(\/?)\s*>/),
	    single_quote: templatable.until(/['\\\n\r\u2028\u2029]/),
	    double_quote: templatable.until(/["\\\n\r\u2028\u2029]/),
	    template_text: templatable.until(/[`\\$]/),
	    template_expression: templatable.until(/[`}\\]/)
	  };

	};
	Tokenizer.prototype = new BaseTokenizer();

	Tokenizer.prototype._is_comment = function(current_token) {
	  return current_token.type === TOKEN.COMMENT || current_token.type === TOKEN.BLOCK_COMMENT || current_token.type === TOKEN.UNKNOWN;
	};

	Tokenizer.prototype._is_opening = function(current_token) {
	  return current_token.type === TOKEN.START_BLOCK || current_token.type === TOKEN.START_EXPR;
	};

	Tokenizer.prototype._is_closing = function(current_token, open_token) {
	  return (current_token.type === TOKEN.END_BLOCK || current_token.type === TOKEN.END_EXPR) &&
	    (open_token && (
	      (current_token.text === ']' && open_token.text === '[') ||
	      (current_token.text === ')' && open_token.text === '(') ||
	      (current_token.text === '}' && open_token.text === '{')));
	};

	Tokenizer.prototype._reset = function() {
	  in_html_comment = false;
	};

	Tokenizer.prototype._get_next_token = function(previous_token, open_token) { // jshint unused:false
	  var token = null;
	  this._readWhitespace();
	  var c = this._input.peek();

	  if (c === null) {
	    return this._create_token(TOKEN.EOF, '');
	  }

	  token = token || this._read_non_javascript(c);
	  token = token || this._read_string(c);
	  token = token || this._read_pair(c, this._input.peek(1)); // Issue #2062 hack for record type '#{'
	  token = token || this._read_word(previous_token);
	  token = token || this._read_singles(c);
	  token = token || this._read_comment(c);
	  token = token || this._read_regexp(c, previous_token);
	  token = token || this._read_xml(c, previous_token);
	  token = token || this._read_punctuation();
	  token = token || this._create_token(TOKEN.UNKNOWN, this._input.next());

	  return token;
	};

	Tokenizer.prototype._read_word = function(previous_token) {
	  var resulting_string;
	  resulting_string = this.__patterns.identifier.read();
	  if (resulting_string !== '') {
	    resulting_string = resulting_string.replace(acorn.allLineBreaks, '\n');
	    if (!(previous_token.type === TOKEN.DOT ||
	        (previous_token.type === TOKEN.RESERVED && (previous_token.text === 'set' || previous_token.text === 'get'))) &&
	      reserved_word_pattern.test(resulting_string)) {
	      if ((resulting_string === 'in' || resulting_string === 'of') &&
	        (previous_token.type === TOKEN.WORD || previous_token.type === TOKEN.STRING)) { // hack for 'in' and 'of' operators
	        return this._create_token(TOKEN.OPERATOR, resulting_string);
	      }
	      return this._create_token(TOKEN.RESERVED, resulting_string);
	    }
	    return this._create_token(TOKEN.WORD, resulting_string);
	  }

	  resulting_string = this.__patterns.number.read();
	  if (resulting_string !== '') {
	    return this._create_token(TOKEN.WORD, resulting_string);
	  }
	};

	Tokenizer.prototype._read_singles = function(c) {
	  var token = null;
	  if (c === '(' || c === '[') {
	    token = this._create_token(TOKEN.START_EXPR, c);
	  } else if (c === ')' || c === ']') {
	    token = this._create_token(TOKEN.END_EXPR, c);
	  } else if (c === '{') {
	    token = this._create_token(TOKEN.START_BLOCK, c);
	  } else if (c === '}') {
	    token = this._create_token(TOKEN.END_BLOCK, c);
	  } else if (c === ';') {
	    token = this._create_token(TOKEN.SEMICOLON, c);
	  } else if (c === '.' && dot_pattern.test(this._input.peek(1))) {
	    token = this._create_token(TOKEN.DOT, c);
	  } else if (c === ',') {
	    token = this._create_token(TOKEN.COMMA, c);
	  }

	  if (token) {
	    this._input.next();
	  }
	  return token;
	};

	Tokenizer.prototype._read_pair = function(c, d) {
	  var token = null;
	  if (c === '#' && d === '{') {
	    token = this._create_token(TOKEN.START_BLOCK, c + d);
	  }

	  if (token) {
	    this._input.next();
	    this._input.next();
	  }
	  return token;
	};

	Tokenizer.prototype._read_punctuation = function() {
	  var resulting_string = this.__patterns.punct.read();

	  if (resulting_string !== '') {
	    if (resulting_string === '=') {
	      return this._create_token(TOKEN.EQUALS, resulting_string);
	    } else if (resulting_string === '?.') {
	      return this._create_token(TOKEN.DOT, resulting_string);
	    } else {
	      return this._create_token(TOKEN.OPERATOR, resulting_string);
	    }
	  }
	};

	Tokenizer.prototype._read_non_javascript = function(c) {
	  var resulting_string = '';

	  if (c === '#') {
	    if (this._is_first_token()) {
	      resulting_string = this.__patterns.shebang.read();

	      if (resulting_string) {
	        return this._create_token(TOKEN.UNKNOWN, resulting_string.trim() + '\n');
	      }
	    }

	    // handles extendscript #includes
	    resulting_string = this.__patterns.include.read();

	    if (resulting_string) {
	      return this._create_token(TOKEN.UNKNOWN, resulting_string.trim() + '\n');
	    }

	    c = this._input.next();

	    // Spidermonkey-specific sharp variables for circular references. Considered obsolete.
	    var sharp = '#';
	    if (this._input.hasNext() && this._input.testChar(digit)) {
	      do {
	        c = this._input.next();
	        sharp += c;
	      } while (this._input.hasNext() && c !== '#' && c !== '=');
	      if (c === '#') ; else if (this._input.peek() === '[' && this._input.peek(1) === ']') {
	        sharp += '[]';
	        this._input.next();
	        this._input.next();
	      } else if (this._input.peek() === '{' && this._input.peek(1) === '}') {
	        sharp += '{}';
	        this._input.next();
	        this._input.next();
	      }
	      return this._create_token(TOKEN.WORD, sharp);
	    }

	    this._input.back();

	  } else if (c === '<' && this._is_first_token()) {
	    resulting_string = this.__patterns.html_comment_start.read();
	    if (resulting_string) {
	      while (this._input.hasNext() && !this._input.testChar(acorn.newline)) {
	        resulting_string += this._input.next();
	      }
	      in_html_comment = true;
	      return this._create_token(TOKEN.COMMENT, resulting_string);
	    }
	  } else if (in_html_comment && c === '-') {
	    resulting_string = this.__patterns.html_comment_end.read();
	    if (resulting_string) {
	      in_html_comment = false;
	      return this._create_token(TOKEN.COMMENT, resulting_string);
	    }
	  }

	  return null;
	};

	Tokenizer.prototype._read_comment = function(c) {
	  var token = null;
	  if (c === '/') {
	    var comment = '';
	    if (this._input.peek(1) === '*') {
	      // peek for comment /* ... */
	      comment = this.__patterns.block_comment.read();
	      var directives = directives_core.get_directives(comment);
	      if (directives && directives.ignore === 'start') {
	        comment += directives_core.readIgnored(this._input);
	      }
	      comment = comment.replace(acorn.allLineBreaks, '\n');
	      token = this._create_token(TOKEN.BLOCK_COMMENT, comment);
	      token.directives = directives;
	    } else if (this._input.peek(1) === '/') {
	      // peek for comment // ...
	      comment = this.__patterns.comment.read();
	      token = this._create_token(TOKEN.COMMENT, comment);
	    }
	  }
	  return token;
	};

	Tokenizer.prototype._read_string = function(c) {
	  if (c === '`' || c === "'" || c === '"') {
	    var resulting_string = this._input.next();
	    this.has_char_escapes = false;

	    if (c === '`') {
	      resulting_string += this._read_string_recursive('`', true, '${');
	    } else {
	      resulting_string += this._read_string_recursive(c);
	    }

	    if (this.has_char_escapes && this._options.unescape_strings) {
	      resulting_string = unescape_string(resulting_string);
	    }

	    if (this._input.peek() === c) {
	      resulting_string += this._input.next();
	    }

	    resulting_string = resulting_string.replace(acorn.allLineBreaks, '\n');

	    return this._create_token(TOKEN.STRING, resulting_string);
	  }

	  return null;
	};

	Tokenizer.prototype._allow_regexp_or_xml = function(previous_token) {
	  // regex and xml can only appear in specific locations during parsing
	  return (previous_token.type === TOKEN.RESERVED && in_array(previous_token.text, ['return', 'case', 'throw', 'else', 'do', 'typeof', 'yield'])) ||
	    (previous_token.type === TOKEN.END_EXPR && previous_token.text === ')' &&
	      previous_token.opened && previous_token.opened.previous.type === TOKEN.RESERVED && in_array(previous_token.opened.previous.text, ['if', 'while', 'for'])) ||
	    (in_array(previous_token.type, [TOKEN.COMMENT, TOKEN.START_EXPR, TOKEN.START_BLOCK, TOKEN.START,
	      TOKEN.END_BLOCK, TOKEN.OPERATOR, TOKEN.EQUALS, TOKEN.EOF, TOKEN.SEMICOLON, TOKEN.COMMA
	    ]));
	};

	Tokenizer.prototype._read_regexp = function(c, previous_token) {

	  if (c === '/' && this._allow_regexp_or_xml(previous_token)) {
	    // handle regexp
	    //
	    var resulting_string = this._input.next();
	    var esc = false;

	    var in_char_class = false;
	    while (this._input.hasNext() &&
	      ((esc || in_char_class || this._input.peek() !== c) &&
	        !this._input.testChar(acorn.newline))) {
	      resulting_string += this._input.peek();
	      if (!esc) {
	        esc = this._input.peek() === '\\';
	        if (this._input.peek() === '[') {
	          in_char_class = true;
	        } else if (this._input.peek() === ']') {
	          in_char_class = false;
	        }
	      } else {
	        esc = false;
	      }
	      this._input.next();
	    }

	    if (this._input.peek() === c) {
	      resulting_string += this._input.next();

	      // regexps may have modifiers /regexp/MOD , so fetch those, too
	      // Only [gim] are valid, but if the user puts in garbage, do what we can to take it.
	      resulting_string += this._input.read(acorn.identifier);
	    }
	    return this._create_token(TOKEN.STRING, resulting_string);
	  }
	  return null;
	};

	Tokenizer.prototype._read_xml = function(c, previous_token) {

	  if (this._options.e4x && c === "<" && this._allow_regexp_or_xml(previous_token)) {
	    var xmlStr = '';
	    var match = this.__patterns.xml.read_match();
	    // handle e4x xml literals
	    //
	    if (match) {
	      // Trim root tag to attempt to
	      var rootTag = match[2].replace(/^{\s+/, '{').replace(/\s+}$/, '}');
	      var isCurlyRoot = rootTag.indexOf('{') === 0;
	      var depth = 0;
	      while (match) {
	        var isEndTag = !!match[1];
	        var tagName = match[2];
	        var isSingletonTag = (!!match[match.length - 1]) || (tagName.slice(0, 8) === "![CDATA[");
	        if (!isSingletonTag &&
	          (tagName === rootTag || (isCurlyRoot && tagName.replace(/^{\s+/, '{').replace(/\s+}$/, '}')))) {
	          if (isEndTag) {
	            --depth;
	          } else {
	            ++depth;
	          }
	        }
	        xmlStr += match[0];
	        if (depth <= 0) {
	          break;
	        }
	        match = this.__patterns.xml.read_match();
	      }
	      // if we didn't close correctly, keep unformatted.
	      if (!match) {
	        xmlStr += this._input.match(/[\s\S]*/g)[0];
	      }
	      xmlStr = xmlStr.replace(acorn.allLineBreaks, '\n');
	      return this._create_token(TOKEN.STRING, xmlStr);
	    }
	  }

	  return null;
	};

	function unescape_string(s) {
	  // You think that a regex would work for this
	  // return s.replace(/\\x([0-9a-f]{2})/gi, function(match, val) {
	  //         return String.fromCharCode(parseInt(val, 16));
	  //     })
	  // However, dealing with '\xff', '\\xff', '\\\xff' makes this more fun.
	  var out = '',
	    escaped = 0;

	  var input_scan = new InputScanner(s);
	  var matched = null;

	  while (input_scan.hasNext()) {
	    // Keep any whitespace, non-slash characters
	    // also keep slash pairs.
	    matched = input_scan.match(/([\s]|[^\\]|\\\\)+/g);

	    if (matched) {
	      out += matched[0];
	    }

	    if (input_scan.peek() === '\\') {
	      input_scan.next();
	      if (input_scan.peek() === 'x') {
	        matched = input_scan.match(/x([0-9A-Fa-f]{2})/g);
	      } else if (input_scan.peek() === 'u') {
	        matched = input_scan.match(/u([0-9A-Fa-f]{4})/g);
	        if (!matched) {
	          matched = input_scan.match(/u\{([0-9A-Fa-f]+)\}/g);
	        }
	      } else {
	        out += '\\';
	        if (input_scan.hasNext()) {
	          out += input_scan.next();
	        }
	        continue;
	      }

	      // If there's some error decoding, return the original string
	      if (!matched) {
	        return s;
	      }

	      escaped = parseInt(matched[1], 16);

	      if (escaped > 0x7e && escaped <= 0xff && matched[0].indexOf('x') === 0) {
	        // we bail out on \x7f..\xff,
	        // leaving whole string escaped,
	        // as it's probably completely binary
	        return s;
	      } else if (escaped >= 0x00 && escaped < 0x20) {
	        // leave 0x00...0x1f escaped
	        out += '\\' + matched[0];
	      } else if (escaped > 0x10FFFF) {
	        // If the escape sequence is out of bounds, keep the original sequence and continue conversion
	        out += '\\' + matched[0];
	      } else if (escaped === 0x22 || escaped === 0x27 || escaped === 0x5c) {
	        // single-quote, apostrophe, backslash - escape these
	        out += '\\' + String.fromCharCode(escaped);
	      } else {
	        out += String.fromCharCode(escaped);
	      }
	    }
	  }

	  return out;
	}

	// handle string
	//
	Tokenizer.prototype._read_string_recursive = function(delimiter, allow_unescaped_newlines, start_sub) {
	  var current_char;
	  var pattern;
	  if (delimiter === '\'') {
	    pattern = this.__patterns.single_quote;
	  } else if (delimiter === '"') {
	    pattern = this.__patterns.double_quote;
	  } else if (delimiter === '`') {
	    pattern = this.__patterns.template_text;
	  } else if (delimiter === '}') {
	    pattern = this.__patterns.template_expression;
	  }

	  var resulting_string = pattern.read();
	  var next = '';
	  while (this._input.hasNext()) {
	    next = this._input.next();
	    if (next === delimiter ||
	      (!allow_unescaped_newlines && acorn.newline.test(next))) {
	      this._input.back();
	      break;
	    } else if (next === '\\' && this._input.hasNext()) {
	      current_char = this._input.peek();

	      if (current_char === 'x' || current_char === 'u') {
	        this.has_char_escapes = true;
	      } else if (current_char === '\r' && this._input.peek(1) === '\n') {
	        this._input.next();
	      }
	      next += this._input.next();
	    } else if (start_sub) {
	      if (start_sub === '${' && next === '$' && this._input.peek() === '{') {
	        next += this._input.next();
	      }

	      if (start_sub === next) {
	        if (delimiter === '`') {
	          next += this._read_string_recursive('}', allow_unescaped_newlines, '`');
	        } else {
	          next += this._read_string_recursive('`', allow_unescaped_newlines, '${');
	        }
	        if (this._input.hasNext()) {
	          next += this._input.next();
	        }
	      }
	    }
	    next += pattern.read();
	    resulting_string += next;
	  }

	  return resulting_string;
	};

	tokenizer$3.Tokenizer = Tokenizer;
	tokenizer$3.TOKEN = TOKEN;
	tokenizer$3.positionable_operators = positionable_operators.slice();
	tokenizer$3.line_starters = line_starters.slice();
	return tokenizer$3;
}

/*jshint node:true */

var hasRequiredBeautifier$2;

function requireBeautifier$2 () {
	if (hasRequiredBeautifier$2) return beautifier$2;
	hasRequiredBeautifier$2 = 1;

	var Output = requireOutput().Output;
	var Token = requireToken().Token;
	var acorn = requireAcorn();
	var Options = requireOptions$2().Options;
	var Tokenizer = requireTokenizer$1().Tokenizer;
	var line_starters = requireTokenizer$1().line_starters;
	var positionable_operators = requireTokenizer$1().positionable_operators;
	var TOKEN = requireTokenizer$1().TOKEN;


	function in_array(what, arr) {
	  return arr.indexOf(what) !== -1;
	}

	function ltrim(s) {
	  return s.replace(/^\s+/g, '');
	}

	function generateMapFromStrings(list) {
	  var result = {};
	  for (var x = 0; x < list.length; x++) {
	    // make the mapped names underscored instead of dash
	    result[list[x].replace(/-/g, '_')] = list[x];
	  }
	  return result;
	}

	function reserved_word(token, word) {
	  return token && token.type === TOKEN.RESERVED && token.text === word;
	}

	function reserved_array(token, words) {
	  return token && token.type === TOKEN.RESERVED && in_array(token.text, words);
	}
	// Unsure of what they mean, but they work. Worth cleaning up in future.
	var special_words = ['case', 'return', 'do', 'if', 'throw', 'else', 'await', 'break', 'continue', 'async'];

	var validPositionValues = ['before-newline', 'after-newline', 'preserve-newline'];

	// Generate map from array
	var OPERATOR_POSITION = generateMapFromStrings(validPositionValues);

	var OPERATOR_POSITION_BEFORE_OR_PRESERVE = [OPERATOR_POSITION.before_newline, OPERATOR_POSITION.preserve_newline];

	var MODE = {
	  BlockStatement: 'BlockStatement', // 'BLOCK'
	  Statement: 'Statement', // 'STATEMENT'
	  ObjectLiteral: 'ObjectLiteral', // 'OBJECT',
	  ArrayLiteral: 'ArrayLiteral', //'[EXPRESSION]',
	  ForInitializer: 'ForInitializer', //'(FOR-EXPRESSION)',
	  Conditional: 'Conditional', //'(COND-EXPRESSION)',
	  Expression: 'Expression' //'(EXPRESSION)'
	};

	function remove_redundant_indentation(output, frame) {
	  // This implementation is effective but has some issues:
	  //     - can cause line wrap to happen too soon due to indent removal
	  //           after wrap points are calculated
	  // These issues are minor compared to ugly indentation.

	  if (frame.multiline_frame ||
	    frame.mode === MODE.ForInitializer ||
	    frame.mode === MODE.Conditional) {
	    return;
	  }

	  // remove one indent from each line inside this section
	  output.remove_indent(frame.start_line_index);
	}

	// we could use just string.split, but
	// IE doesn't like returning empty strings
	function split_linebreaks(s) {
	  //return s.split(/\x0d\x0a|\x0a/);

	  s = s.replace(acorn.allLineBreaks, '\n');
	  var out = [];
	  var start = 0;
	  var idx = s.indexOf("\n", start);
	  while (idx !== -1) {
	    out.push(s.substring(start, idx));
	    start = idx + 1;
	    idx = s.indexOf("\n", start);
	  }
	  if (start < s.length) {
	    out.push(s.substring(start));
	  }
	  return out;
	}

	function is_array(mode) {
	  return mode === MODE.ArrayLiteral;
	}

	function is_expression(mode) {
	  return in_array(mode, [MODE.Expression, MODE.ForInitializer, MODE.Conditional]);
	}

	function all_lines_start_with(lines, c) {
	  for (var i = 0; i < lines.length; i++) {
	    var line = lines[i].trim();
	    if (line.charAt(0) !== c) {
	      return false;
	    }
	  }
	  return true;
	}

	function each_line_matches_indent(lines, indent) {
	  var i = 0,
	    len = lines.length,
	    line;
	  for (; i < len; i++) {
	    line = lines[i];
	    // allow empty lines to pass through
	    if (line && line.indexOf(indent) !== 0) {
	      return false;
	    }
	  }
	  return true;
	}


	function Beautifier(source_text, options) {
	  options = options || {};
	  this._source_text = source_text || '';

	  this._output = null;
	  this._tokens = null;
	  this._last_last_text = null;
	  this._flags = null;
	  this._previous_flags = null;

	  this._flag_store = null;
	  this._options = new Options(options);
	}

	Beautifier.prototype.create_flags = function(flags_base, mode) {
	  var next_indent_level = 0;
	  if (flags_base) {
	    next_indent_level = flags_base.indentation_level;
	    if (!this._output.just_added_newline() &&
	      flags_base.line_indent_level > next_indent_level) {
	      next_indent_level = flags_base.line_indent_level;
	    }
	  }

	  var next_flags = {
	    mode: mode,
	    parent: flags_base,
	    last_token: flags_base ? flags_base.last_token : new Token(TOKEN.START_BLOCK, ''), // last token text
	    last_word: flags_base ? flags_base.last_word : '', // last TOKEN.WORD passed
	    declaration_statement: false,
	    declaration_assignment: false,
	    multiline_frame: false,
	    inline_frame: false,
	    if_block: false,
	    else_block: false,
	    class_start_block: false, // class A { INSIDE HERE } or class B extends C { INSIDE HERE }
	    do_block: false,
	    do_while: false,
	    import_block: false,
	    in_case_statement: false, // switch(..){ INSIDE HERE }
	    in_case: false, // we're on the exact line with "case 0:"
	    case_body: false, // the indented case-action block
	    case_block: false, // the indented case-action block is wrapped with {}
	    indentation_level: next_indent_level,
	    alignment: 0,
	    line_indent_level: flags_base ? flags_base.line_indent_level : next_indent_level,
	    start_line_index: this._output.get_line_number(),
	    ternary_depth: 0
	  };
	  return next_flags;
	};

	Beautifier.prototype._reset = function(source_text) {
	  var baseIndentString = source_text.match(/^[\t ]*/)[0];

	  this._last_last_text = ''; // pre-last token text
	  this._output = new Output(this._options, baseIndentString);

	  // If testing the ignore directive, start with output disable set to true
	  this._output.raw = this._options.test_output_raw;


	  // Stack of parsing/formatting states, including MODE.
	  // We tokenize, parse, and output in an almost purely a forward-only stream of token input
	  // and formatted output.  This makes the beautifier less accurate than full parsers
	  // but also far more tolerant of syntax errors.
	  //
	  // For example, the default mode is MODE.BlockStatement. If we see a '{' we push a new frame of type
	  // MODE.BlockStatement on the the stack, even though it could be object literal.  If we later
	  // encounter a ":", we'll switch to to MODE.ObjectLiteral.  If we then see a ";",
	  // most full parsers would die, but the beautifier gracefully falls back to
	  // MODE.BlockStatement and continues on.
	  this._flag_store = [];
	  this.set_mode(MODE.BlockStatement);
	  var tokenizer = new Tokenizer(source_text, this._options);
	  this._tokens = tokenizer.tokenize();
	  return source_text;
	};

	Beautifier.prototype.beautify = function() {
	  // if disabled, return the input unchanged.
	  if (this._options.disabled) {
	    return this._source_text;
	  }

	  var sweet_code;
	  var source_text = this._reset(this._source_text);

	  var eol = this._options.eol;
	  if (this._options.eol === 'auto') {
	    eol = '\n';
	    if (source_text && acorn.lineBreak.test(source_text || '')) {
	      eol = source_text.match(acorn.lineBreak)[0];
	    }
	  }

	  var current_token = this._tokens.next();
	  while (current_token) {
	    this.handle_token(current_token);

	    this._last_last_text = this._flags.last_token.text;
	    this._flags.last_token = current_token;

	    current_token = this._tokens.next();
	  }

	  sweet_code = this._output.get_code(eol);

	  return sweet_code;
	};

	Beautifier.prototype.handle_token = function(current_token, preserve_statement_flags) {
	  if (current_token.type === TOKEN.START_EXPR) {
	    this.handle_start_expr(current_token);
	  } else if (current_token.type === TOKEN.END_EXPR) {
	    this.handle_end_expr(current_token);
	  } else if (current_token.type === TOKEN.START_BLOCK) {
	    this.handle_start_block(current_token);
	  } else if (current_token.type === TOKEN.END_BLOCK) {
	    this.handle_end_block(current_token);
	  } else if (current_token.type === TOKEN.WORD) {
	    this.handle_word(current_token);
	  } else if (current_token.type === TOKEN.RESERVED) {
	    this.handle_word(current_token);
	  } else if (current_token.type === TOKEN.SEMICOLON) {
	    this.handle_semicolon(current_token);
	  } else if (current_token.type === TOKEN.STRING) {
	    this.handle_string(current_token);
	  } else if (current_token.type === TOKEN.EQUALS) {
	    this.handle_equals(current_token);
	  } else if (current_token.type === TOKEN.OPERATOR) {
	    this.handle_operator(current_token);
	  } else if (current_token.type === TOKEN.COMMA) {
	    this.handle_comma(current_token);
	  } else if (current_token.type === TOKEN.BLOCK_COMMENT) {
	    this.handle_block_comment(current_token, preserve_statement_flags);
	  } else if (current_token.type === TOKEN.COMMENT) {
	    this.handle_comment(current_token, preserve_statement_flags);
	  } else if (current_token.type === TOKEN.DOT) {
	    this.handle_dot(current_token);
	  } else if (current_token.type === TOKEN.EOF) {
	    this.handle_eof(current_token);
	  } else if (current_token.type === TOKEN.UNKNOWN) {
	    this.handle_unknown(current_token, preserve_statement_flags);
	  } else {
	    this.handle_unknown(current_token, preserve_statement_flags);
	  }
	};

	Beautifier.prototype.handle_whitespace_and_comments = function(current_token, preserve_statement_flags) {
	  var newlines = current_token.newlines;
	  var keep_whitespace = this._options.keep_array_indentation && is_array(this._flags.mode);

	  if (current_token.comments_before) {
	    var comment_token = current_token.comments_before.next();
	    while (comment_token) {
	      // The cleanest handling of inline comments is to treat them as though they aren't there.
	      // Just continue formatting and the behavior should be logical.
	      // Also ignore unknown tokens.  Again, this should result in better behavior.
	      this.handle_whitespace_and_comments(comment_token, preserve_statement_flags);
	      this.handle_token(comment_token, preserve_statement_flags);
	      comment_token = current_token.comments_before.next();
	    }
	  }

	  if (keep_whitespace) {
	    for (var i = 0; i < newlines; i += 1) {
	      this.print_newline(i > 0, preserve_statement_flags);
	    }
	  } else {
	    if (this._options.max_preserve_newlines && newlines > this._options.max_preserve_newlines) {
	      newlines = this._options.max_preserve_newlines;
	    }

	    if (this._options.preserve_newlines) {
	      if (newlines > 1) {
	        this.print_newline(false, preserve_statement_flags);
	        for (var j = 1; j < newlines; j += 1) {
	          this.print_newline(true, preserve_statement_flags);
	        }
	      }
	    }
	  }

	};

	var newline_restricted_tokens = ['async', 'break', 'continue', 'return', 'throw', 'yield'];

	Beautifier.prototype.allow_wrap_or_preserved_newline = function(current_token, force_linewrap) {
	  force_linewrap = (force_linewrap === undefined) ? false : force_linewrap;

	  // Never wrap the first token on a line
	  if (this._output.just_added_newline()) {
	    return;
	  }

	  var shouldPreserveOrForce = (this._options.preserve_newlines && current_token.newlines) || force_linewrap;
	  var operatorLogicApplies = in_array(this._flags.last_token.text, positionable_operators) ||
	    in_array(current_token.text, positionable_operators);

	  if (operatorLogicApplies) {
	    var shouldPrintOperatorNewline = (
	        in_array(this._flags.last_token.text, positionable_operators) &&
	        in_array(this._options.operator_position, OPERATOR_POSITION_BEFORE_OR_PRESERVE)
	      ) ||
	      in_array(current_token.text, positionable_operators);
	    shouldPreserveOrForce = shouldPreserveOrForce && shouldPrintOperatorNewline;
	  }

	  if (shouldPreserveOrForce) {
	    this.print_newline(false, true);
	  } else if (this._options.wrap_line_length) {
	    if (reserved_array(this._flags.last_token, newline_restricted_tokens)) {
	      // These tokens should never have a newline inserted
	      // between them and the following expression.
	      return;
	    }
	    this._output.set_wrap_point();
	  }
	};

	Beautifier.prototype.print_newline = function(force_newline, preserve_statement_flags) {
	  if (!preserve_statement_flags) {
	    if (this._flags.last_token.text !== ';' && this._flags.last_token.text !== ',' && this._flags.last_token.text !== '=' && (this._flags.last_token.type !== TOKEN.OPERATOR || this._flags.last_token.text === '--' || this._flags.last_token.text === '++')) {
	      var next_token = this._tokens.peek();
	      while (this._flags.mode === MODE.Statement &&
	        !(this._flags.if_block && reserved_word(next_token, 'else')) &&
	        !this._flags.do_block) {
	        this.restore_mode();
	      }
	    }
	  }

	  if (this._output.add_new_line(force_newline)) {
	    this._flags.multiline_frame = true;
	  }
	};

	Beautifier.prototype.print_token_line_indentation = function(current_token) {
	  if (this._output.just_added_newline()) {
	    if (this._options.keep_array_indentation &&
	      current_token.newlines &&
	      (current_token.text === '[' || is_array(this._flags.mode))) {
	      this._output.current_line.set_indent(-1);
	      this._output.current_line.push(current_token.whitespace_before);
	      this._output.space_before_token = false;
	    } else if (this._output.set_indent(this._flags.indentation_level, this._flags.alignment)) {
	      this._flags.line_indent_level = this._flags.indentation_level;
	    }
	  }
	};

	Beautifier.prototype.print_token = function(current_token) {
	  if (this._output.raw) {
	    this._output.add_raw_token(current_token);
	    return;
	  }

	  if (this._options.comma_first && current_token.previous && current_token.previous.type === TOKEN.COMMA &&
	    this._output.just_added_newline()) {
	    if (this._output.previous_line.last() === ',') {
	      var popped = this._output.previous_line.pop();
	      // if the comma was already at the start of the line,
	      // pull back onto that line and reprint the indentation
	      if (this._output.previous_line.is_empty()) {
	        this._output.previous_line.push(popped);
	        this._output.trim(true);
	        this._output.current_line.pop();
	        this._output.trim();
	      }

	      // add the comma in front of the next token
	      this.print_token_line_indentation(current_token);
	      this._output.add_token(',');
	      this._output.space_before_token = true;
	    }
	  }

	  this.print_token_line_indentation(current_token);
	  this._output.non_breaking_space = true;
	  this._output.add_token(current_token.text);
	  if (this._output.previous_token_wrapped) {
	    this._flags.multiline_frame = true;
	  }
	};

	Beautifier.prototype.indent = function() {
	  this._flags.indentation_level += 1;
	  this._output.set_indent(this._flags.indentation_level, this._flags.alignment);
	};

	Beautifier.prototype.deindent = function() {
	  if (this._flags.indentation_level > 0 &&
	    ((!this._flags.parent) || this._flags.indentation_level > this._flags.parent.indentation_level)) {
	    this._flags.indentation_level -= 1;
	    this._output.set_indent(this._flags.indentation_level, this._flags.alignment);
	  }
	};

	Beautifier.prototype.set_mode = function(mode) {
	  if (this._flags) {
	    this._flag_store.push(this._flags);
	    this._previous_flags = this._flags;
	  } else {
	    this._previous_flags = this.create_flags(null, mode);
	  }

	  this._flags = this.create_flags(this._previous_flags, mode);
	  this._output.set_indent(this._flags.indentation_level, this._flags.alignment);
	};


	Beautifier.prototype.restore_mode = function() {
	  if (this._flag_store.length > 0) {
	    this._previous_flags = this._flags;
	    this._flags = this._flag_store.pop();
	    if (this._previous_flags.mode === MODE.Statement) {
	      remove_redundant_indentation(this._output, this._previous_flags);
	    }
	    this._output.set_indent(this._flags.indentation_level, this._flags.alignment);
	  }
	};

	Beautifier.prototype.start_of_object_property = function() {
	  return this._flags.parent.mode === MODE.ObjectLiteral && this._flags.mode === MODE.Statement && (
	    (this._flags.last_token.text === ':' && this._flags.ternary_depth === 0) || (reserved_array(this._flags.last_token, ['get', 'set'])));
	};

	Beautifier.prototype.start_of_statement = function(current_token) {
	  var start = false;
	  start = start || reserved_array(this._flags.last_token, ['var', 'let', 'const']) && current_token.type === TOKEN.WORD;
	  start = start || reserved_word(this._flags.last_token, 'do');
	  start = start || (!(this._flags.parent.mode === MODE.ObjectLiteral && this._flags.mode === MODE.Statement)) && reserved_array(this._flags.last_token, newline_restricted_tokens) && !current_token.newlines;
	  start = start || reserved_word(this._flags.last_token, 'else') &&
	    !(reserved_word(current_token, 'if') && !current_token.comments_before);
	  start = start || (this._flags.last_token.type === TOKEN.END_EXPR && (this._previous_flags.mode === MODE.ForInitializer || this._previous_flags.mode === MODE.Conditional));
	  start = start || (this._flags.last_token.type === TOKEN.WORD && this._flags.mode === MODE.BlockStatement &&
	    !this._flags.in_case &&
	    !(current_token.text === '--' || current_token.text === '++') &&
	    this._last_last_text !== 'function' &&
	    current_token.type !== TOKEN.WORD && current_token.type !== TOKEN.RESERVED);
	  start = start || (this._flags.mode === MODE.ObjectLiteral && (
	    (this._flags.last_token.text === ':' && this._flags.ternary_depth === 0) || reserved_array(this._flags.last_token, ['get', 'set'])));

	  if (start) {
	    this.set_mode(MODE.Statement);
	    this.indent();

	    this.handle_whitespace_and_comments(current_token, true);

	    // Issue #276:
	    // If starting a new statement with [if, for, while, do], push to a new line.
	    // if (a) if (b) if(c) d(); else e(); else f();
	    if (!this.start_of_object_property()) {
	      this.allow_wrap_or_preserved_newline(current_token,
	        reserved_array(current_token, ['do', 'for', 'if', 'while']));
	    }
	    return true;
	  }
	  return false;
	};

	Beautifier.prototype.handle_start_expr = function(current_token) {
	  // The conditional starts the statement if appropriate.
	  if (!this.start_of_statement(current_token)) {
	    this.handle_whitespace_and_comments(current_token);
	  }

	  var next_mode = MODE.Expression;
	  if (current_token.text === '[') {

	    if (this._flags.last_token.type === TOKEN.WORD || this._flags.last_token.text === ')') {
	      // this is array index specifier, break immediately
	      // a[x], fn()[x]
	      if (reserved_array(this._flags.last_token, line_starters)) {
	        this._output.space_before_token = true;
	      }
	      this.print_token(current_token);
	      this.set_mode(next_mode);
	      this.indent();
	      if (this._options.space_in_paren) {
	        this._output.space_before_token = true;
	      }
	      return;
	    }

	    next_mode = MODE.ArrayLiteral;
	    if (is_array(this._flags.mode)) {
	      if (this._flags.last_token.text === '[' ||
	        (this._flags.last_token.text === ',' && (this._last_last_text === ']' || this._last_last_text === '}'))) {
	        // ], [ goes to new line
	        // }, [ goes to new line
	        if (!this._options.keep_array_indentation) {
	          this.print_newline();
	        }
	      }
	    }

	    if (!in_array(this._flags.last_token.type, [TOKEN.START_EXPR, TOKEN.END_EXPR, TOKEN.WORD, TOKEN.OPERATOR, TOKEN.DOT])) {
	      this._output.space_before_token = true;
	    }
	  } else {
	    if (this._flags.last_token.type === TOKEN.RESERVED) {
	      if (this._flags.last_token.text === 'for') {
	        this._output.space_before_token = this._options.space_before_conditional;
	        next_mode = MODE.ForInitializer;
	      } else if (in_array(this._flags.last_token.text, ['if', 'while', 'switch'])) {
	        this._output.space_before_token = this._options.space_before_conditional;
	        next_mode = MODE.Conditional;
	      } else if (in_array(this._flags.last_word, ['await', 'async'])) {
	        // Should be a space between await and an IIFE, or async and an arrow function
	        this._output.space_before_token = true;
	      } else if (this._flags.last_token.text === 'import' && current_token.whitespace_before === '') {
	        this._output.space_before_token = false;
	      } else if (in_array(this._flags.last_token.text, line_starters) || this._flags.last_token.text === 'catch') {
	        this._output.space_before_token = true;
	      }
	    } else if (this._flags.last_token.type === TOKEN.EQUALS || this._flags.last_token.type === TOKEN.OPERATOR) {
	      // Support of this kind of newline preservation.
	      // a = (b &&
	      //     (c || d));
	      if (!this.start_of_object_property()) {
	        this.allow_wrap_or_preserved_newline(current_token);
	      }
	    } else if (this._flags.last_token.type === TOKEN.WORD) {
	      this._output.space_before_token = false;

	      // function name() vs function name ()
	      // function* name() vs function* name ()
	      // async name() vs async name ()
	      // In ES6, you can also define the method properties of an object
	      // var obj = {a: function() {}}
	      // It can be abbreviated
	      // var obj = {a() {}}
	      // var obj = { a() {}} vs var obj = { a () {}}
	      // var obj = { * a() {}} vs var obj = { * a () {}}
	      var peek_back_two = this._tokens.peek(-3);
	      if (this._options.space_after_named_function && peek_back_two) {
	        // peek starts at next character so -1 is current token
	        var peek_back_three = this._tokens.peek(-4);
	        if (reserved_array(peek_back_two, ['async', 'function']) ||
	          (peek_back_two.text === '*' && reserved_array(peek_back_three, ['async', 'function']))) {
	          this._output.space_before_token = true;
	        } else if (this._flags.mode === MODE.ObjectLiteral) {
	          if ((peek_back_two.text === '{' || peek_back_two.text === ',') ||
	            (peek_back_two.text === '*' && (peek_back_three.text === '{' || peek_back_three.text === ','))) {
	            this._output.space_before_token = true;
	          }
	        } else if (this._flags.parent && this._flags.parent.class_start_block) {
	          this._output.space_before_token = true;
	        }
	      }
	    } else {
	      // Support preserving wrapped arrow function expressions
	      // a.b('c',
	      //     () => d.e
	      // )
	      this.allow_wrap_or_preserved_newline(current_token);
	    }

	    // function() vs function ()
	    // yield*() vs yield* ()
	    // function*() vs function* ()
	    if ((this._flags.last_token.type === TOKEN.RESERVED && (this._flags.last_word === 'function' || this._flags.last_word === 'typeof')) ||
	      (this._flags.last_token.text === '*' &&
	        (in_array(this._last_last_text, ['function', 'yield']) ||
	          (this._flags.mode === MODE.ObjectLiteral && in_array(this._last_last_text, ['{', ',']))))) {
	      this._output.space_before_token = this._options.space_after_anon_function;
	    }
	  }

	  if (this._flags.last_token.text === ';' || this._flags.last_token.type === TOKEN.START_BLOCK) {
	    this.print_newline();
	  } else if (this._flags.last_token.type === TOKEN.END_EXPR || this._flags.last_token.type === TOKEN.START_EXPR || this._flags.last_token.type === TOKEN.END_BLOCK || this._flags.last_token.text === '.' || this._flags.last_token.type === TOKEN.COMMA) {
	    // do nothing on (( and )( and ][ and ]( and .(
	    // TODO: Consider whether forcing this is required.  Review failing tests when removed.
	    this.allow_wrap_or_preserved_newline(current_token, current_token.newlines);
	  }

	  this.print_token(current_token);
	  this.set_mode(next_mode);
	  if (this._options.space_in_paren) {
	    this._output.space_before_token = true;
	  }

	  // In all cases, if we newline while inside an expression it should be indented.
	  this.indent();
	};

	Beautifier.prototype.handle_end_expr = function(current_token) {
	  // statements inside expressions are not valid syntax, but...
	  // statements must all be closed when their container closes
	  while (this._flags.mode === MODE.Statement) {
	    this.restore_mode();
	  }

	  this.handle_whitespace_and_comments(current_token);

	  if (this._flags.multiline_frame) {
	    this.allow_wrap_or_preserved_newline(current_token,
	      current_token.text === ']' && is_array(this._flags.mode) && !this._options.keep_array_indentation);
	  }

	  if (this._options.space_in_paren) {
	    if (this._flags.last_token.type === TOKEN.START_EXPR && !this._options.space_in_empty_paren) {
	      // () [] no inner space in empty parens like these, ever, ref #320
	      this._output.trim();
	      this._output.space_before_token = false;
	    } else {
	      this._output.space_before_token = true;
	    }
	  }
	  this.deindent();
	  this.print_token(current_token);
	  this.restore_mode();

	  remove_redundant_indentation(this._output, this._previous_flags);

	  // do {} while () // no statement required after
	  if (this._flags.do_while && this._previous_flags.mode === MODE.Conditional) {
	    this._previous_flags.mode = MODE.Expression;
	    this._flags.do_block = false;
	    this._flags.do_while = false;

	  }
	};

	Beautifier.prototype.handle_start_block = function(current_token) {
	  this.handle_whitespace_and_comments(current_token);

	  // Check if this is should be treated as a ObjectLiteral
	  var next_token = this._tokens.peek();
	  var second_token = this._tokens.peek(1);
	  if (this._flags.last_word === 'switch' && this._flags.last_token.type === TOKEN.END_EXPR) {
	    this.set_mode(MODE.BlockStatement);
	    this._flags.in_case_statement = true;
	  } else if (this._flags.case_body) {
	    this.set_mode(MODE.BlockStatement);
	  } else if (second_token && (
	      (in_array(second_token.text, [':', ',']) && in_array(next_token.type, [TOKEN.STRING, TOKEN.WORD, TOKEN.RESERVED])) ||
	      (in_array(next_token.text, ['get', 'set', '...']) && in_array(second_token.type, [TOKEN.WORD, TOKEN.RESERVED]))
	    )) {
	    // We don't support TypeScript,but we didn't break it for a very long time.
	    // We'll try to keep not breaking it.
	    if (in_array(this._last_last_text, ['class', 'interface']) && !in_array(second_token.text, [':', ','])) {
	      this.set_mode(MODE.BlockStatement);
	    } else {
	      this.set_mode(MODE.ObjectLiteral);
	    }
	  } else if (this._flags.last_token.type === TOKEN.OPERATOR && this._flags.last_token.text === '=>') {
	    // arrow function: (param1, paramN) => { statements }
	    this.set_mode(MODE.BlockStatement);
	  } else if (in_array(this._flags.last_token.type, [TOKEN.EQUALS, TOKEN.START_EXPR, TOKEN.COMMA, TOKEN.OPERATOR]) ||
	    reserved_array(this._flags.last_token, ['return', 'throw', 'import', 'default'])
	  ) {
	    // Detecting shorthand function syntax is difficult by scanning forward,
	    //     so check the surrounding context.
	    // If the block is being returned, imported, export default, passed as arg,
	    //     assigned with = or assigned in a nested object, treat as an ObjectLiteral.
	    this.set_mode(MODE.ObjectLiteral);
	  } else {
	    this.set_mode(MODE.BlockStatement);
	  }

	  if (this._flags.last_token) {
	    if (reserved_array(this._flags.last_token.previous, ['class', 'extends'])) {
	      this._flags.class_start_block = true;
	    }
	  }

	  var empty_braces = !next_token.comments_before && next_token.text === '}';
	  var empty_anonymous_function = empty_braces && this._flags.last_word === 'function' &&
	    this._flags.last_token.type === TOKEN.END_EXPR;

	  if (this._options.brace_preserve_inline) // check for inline, set inline_frame if so
	  {
	    // search forward for a newline wanted inside this block
	    var index = 0;
	    var check_token = null;
	    this._flags.inline_frame = true;
	    do {
	      index += 1;
	      check_token = this._tokens.peek(index - 1);
	      if (check_token.newlines) {
	        this._flags.inline_frame = false;
	        break;
	      }
	    } while (check_token.type !== TOKEN.EOF &&
	      !(check_token.type === TOKEN.END_BLOCK && check_token.opened === current_token));
	  }

	  if ((this._options.brace_style === "expand" ||
	      (this._options.brace_style === "none" && current_token.newlines)) &&
	    !this._flags.inline_frame) {
	    if (this._flags.last_token.type !== TOKEN.OPERATOR &&
	      (empty_anonymous_function ||
	        this._flags.last_token.type === TOKEN.EQUALS ||
	        (reserved_array(this._flags.last_token, special_words) && this._flags.last_token.text !== 'else'))) {
	      this._output.space_before_token = true;
	    } else {
	      this.print_newline(false, true);
	    }
	  } else { // collapse || inline_frame
	    if (is_array(this._previous_flags.mode) && (this._flags.last_token.type === TOKEN.START_EXPR || this._flags.last_token.type === TOKEN.COMMA)) {
	      if (this._flags.last_token.type === TOKEN.COMMA || this._options.space_in_paren) {
	        this._output.space_before_token = true;
	      }

	      if (this._flags.last_token.type === TOKEN.COMMA || (this._flags.last_token.type === TOKEN.START_EXPR && this._flags.inline_frame)) {
	        this.allow_wrap_or_preserved_newline(current_token);
	        this._previous_flags.multiline_frame = this._previous_flags.multiline_frame || this._flags.multiline_frame;
	        this._flags.multiline_frame = false;
	      }
	    }
	    if (this._flags.last_token.type !== TOKEN.OPERATOR && this._flags.last_token.type !== TOKEN.START_EXPR) {
	      if (in_array(this._flags.last_token.type, [TOKEN.START_BLOCK, TOKEN.SEMICOLON]) && !this._flags.inline_frame) {
	        this.print_newline();
	      } else {
	        this._output.space_before_token = true;
	      }
	    }
	  }
	  this.print_token(current_token);
	  this.indent();

	  // Except for specific cases, open braces are followed by a new line.
	  if (!empty_braces && !(this._options.brace_preserve_inline && this._flags.inline_frame)) {
	    this.print_newline();
	  }
	};

	Beautifier.prototype.handle_end_block = function(current_token) {
	  // statements must all be closed when their container closes
	  this.handle_whitespace_and_comments(current_token);

	  while (this._flags.mode === MODE.Statement) {
	    this.restore_mode();
	  }

	  var empty_braces = this._flags.last_token.type === TOKEN.START_BLOCK;

	  if (this._flags.inline_frame && !empty_braces) { // try inline_frame (only set if this._options.braces-preserve-inline) first
	    this._output.space_before_token = true;
	  } else if (this._options.brace_style === "expand") {
	    if (!empty_braces) {
	      this.print_newline();
	    }
	  } else {
	    // skip {}
	    if (!empty_braces) {
	      if (is_array(this._flags.mode) && this._options.keep_array_indentation) {
	        // we REALLY need a newline here, but newliner would skip that
	        this._options.keep_array_indentation = false;
	        this.print_newline();
	        this._options.keep_array_indentation = true;

	      } else {
	        this.print_newline();
	      }
	    }
	  }
	  this.restore_mode();
	  this.print_token(current_token);
	};

	Beautifier.prototype.handle_word = function(current_token) {
	  if (current_token.type === TOKEN.RESERVED) {
	    if (in_array(current_token.text, ['set', 'get']) && this._flags.mode !== MODE.ObjectLiteral) {
	      current_token.type = TOKEN.WORD;
	    } else if (current_token.text === 'import' && in_array(this._tokens.peek().text, ['(', '.'])) {
	      current_token.type = TOKEN.WORD;
	    } else if (in_array(current_token.text, ['as', 'from']) && !this._flags.import_block) {
	      current_token.type = TOKEN.WORD;
	    } else if (this._flags.mode === MODE.ObjectLiteral) {
	      var next_token = this._tokens.peek();
	      if (next_token.text === ':') {
	        current_token.type = TOKEN.WORD;
	      }
	    }
	  }

	  if (this.start_of_statement(current_token)) {
	    // The conditional starts the statement if appropriate.
	    if (reserved_array(this._flags.last_token, ['var', 'let', 'const']) && current_token.type === TOKEN.WORD) {
	      this._flags.declaration_statement = true;
	    }
	  } else if (current_token.newlines && !is_expression(this._flags.mode) &&
	    (this._flags.last_token.type !== TOKEN.OPERATOR || (this._flags.last_token.text === '--' || this._flags.last_token.text === '++')) &&
	    this._flags.last_token.type !== TOKEN.EQUALS &&
	    (this._options.preserve_newlines || !reserved_array(this._flags.last_token, ['var', 'let', 'const', 'set', 'get']))) {
	    this.handle_whitespace_and_comments(current_token);
	    this.print_newline();
	  } else {
	    this.handle_whitespace_and_comments(current_token);
	  }

	  if (this._flags.do_block && !this._flags.do_while) {
	    if (reserved_word(current_token, 'while')) {
	      // do {} ## while ()
	      this._output.space_before_token = true;
	      this.print_token(current_token);
	      this._output.space_before_token = true;
	      this._flags.do_while = true;
	      return;
	    } else {
	      // do {} should always have while as the next word.
	      // if we don't see the expected while, recover
	      this.print_newline();
	      this._flags.do_block = false;
	    }
	  }

	  // if may be followed by else, or not
	  // Bare/inline ifs are tricky
	  // Need to unwind the modes correctly: if (a) if (b) c(); else d(); else e();
	  if (this._flags.if_block) {
	    if (!this._flags.else_block && reserved_word(current_token, 'else')) {
	      this._flags.else_block = true;
	    } else {
	      while (this._flags.mode === MODE.Statement) {
	        this.restore_mode();
	      }
	      this._flags.if_block = false;
	      this._flags.else_block = false;
	    }
	  }

	  if (this._flags.in_case_statement && reserved_array(current_token, ['case', 'default'])) {
	    this.print_newline();
	    if (!this._flags.case_block && (this._flags.case_body || this._options.jslint_happy)) {
	      // switch cases following one another
	      this.deindent();
	    }
	    this._flags.case_body = false;

	    this.print_token(current_token);
	    this._flags.in_case = true;
	    return;
	  }

	  if (this._flags.last_token.type === TOKEN.COMMA || this._flags.last_token.type === TOKEN.START_EXPR || this._flags.last_token.type === TOKEN.EQUALS || this._flags.last_token.type === TOKEN.OPERATOR) {
	    if (!this.start_of_object_property() && !(
	        // start of object property is different for numeric values with +/- prefix operators
	        in_array(this._flags.last_token.text, ['+', '-']) && this._last_last_text === ':' && this._flags.parent.mode === MODE.ObjectLiteral)) {
	      this.allow_wrap_or_preserved_newline(current_token);
	    }
	  }

	  if (reserved_word(current_token, 'function')) {
	    if (in_array(this._flags.last_token.text, ['}', ';']) ||
	      (this._output.just_added_newline() && !(in_array(this._flags.last_token.text, ['(', '[', '{', ':', '=', ',']) || this._flags.last_token.type === TOKEN.OPERATOR))) {
	      // make sure there is a nice clean space of at least one blank line
	      // before a new function definition
	      if (!this._output.just_added_blankline() && !current_token.comments_before) {
	        this.print_newline();
	        this.print_newline(true);
	      }
	    }
	    if (this._flags.last_token.type === TOKEN.RESERVED || this._flags.last_token.type === TOKEN.WORD) {
	      if (reserved_array(this._flags.last_token, ['get', 'set', 'new', 'export']) ||
	        reserved_array(this._flags.last_token, newline_restricted_tokens)) {
	        this._output.space_before_token = true;
	      } else if (reserved_word(this._flags.last_token, 'default') && this._last_last_text === 'export') {
	        this._output.space_before_token = true;
	      } else if (this._flags.last_token.text === 'declare') {
	        // accomodates Typescript declare function formatting
	        this._output.space_before_token = true;
	      } else {
	        this.print_newline();
	      }
	    } else if (this._flags.last_token.type === TOKEN.OPERATOR || this._flags.last_token.text === '=') {
	      // foo = function
	      this._output.space_before_token = true;
	    } else if (!this._flags.multiline_frame && (is_expression(this._flags.mode) || is_array(this._flags.mode))) ; else {
	      this.print_newline();
	    }

	    this.print_token(current_token);
	    this._flags.last_word = current_token.text;
	    return;
	  }

	  var prefix = 'NONE';

	  if (this._flags.last_token.type === TOKEN.END_BLOCK) {

	    if (this._previous_flags.inline_frame) {
	      prefix = 'SPACE';
	    } else if (!reserved_array(current_token, ['else', 'catch', 'finally', 'from'])) {
	      prefix = 'NEWLINE';
	    } else {
	      if (this._options.brace_style === "expand" ||
	        this._options.brace_style === "end-expand" ||
	        (this._options.brace_style === "none" && current_token.newlines)) {
	        prefix = 'NEWLINE';
	      } else {
	        prefix = 'SPACE';
	        this._output.space_before_token = true;
	      }
	    }
	  } else if (this._flags.last_token.type === TOKEN.SEMICOLON && this._flags.mode === MODE.BlockStatement) {
	    // TODO: Should this be for STATEMENT as well?
	    prefix = 'NEWLINE';
	  } else if (this._flags.last_token.type === TOKEN.SEMICOLON && is_expression(this._flags.mode)) {
	    prefix = 'SPACE';
	  } else if (this._flags.last_token.type === TOKEN.STRING) {
	    prefix = 'NEWLINE';
	  } else if (this._flags.last_token.type === TOKEN.RESERVED || this._flags.last_token.type === TOKEN.WORD ||
	    (this._flags.last_token.text === '*' &&
	      (in_array(this._last_last_text, ['function', 'yield']) ||
	        (this._flags.mode === MODE.ObjectLiteral && in_array(this._last_last_text, ['{', ',']))))) {
	    prefix = 'SPACE';
	  } else if (this._flags.last_token.type === TOKEN.START_BLOCK) {
	    if (this._flags.inline_frame) {
	      prefix = 'SPACE';
	    } else {
	      prefix = 'NEWLINE';
	    }
	  } else if (this._flags.last_token.type === TOKEN.END_EXPR) {
	    this._output.space_before_token = true;
	    prefix = 'NEWLINE';
	  }

	  if (reserved_array(current_token, line_starters) && this._flags.last_token.text !== ')') {
	    if (this._flags.inline_frame || this._flags.last_token.text === 'else' || this._flags.last_token.text === 'export') {
	      prefix = 'SPACE';
	    } else {
	      prefix = 'NEWLINE';
	    }

	  }

	  if (reserved_array(current_token, ['else', 'catch', 'finally'])) {
	    if ((!(this._flags.last_token.type === TOKEN.END_BLOCK && this._previous_flags.mode === MODE.BlockStatement) ||
	        this._options.brace_style === "expand" ||
	        this._options.brace_style === "end-expand" ||
	        (this._options.brace_style === "none" && current_token.newlines)) &&
	      !this._flags.inline_frame) {
	      this.print_newline();
	    } else {
	      this._output.trim(true);
	      var line = this._output.current_line;
	      // If we trimmed and there's something other than a close block before us
	      // put a newline back in.  Handles '} // comment' scenario.
	      if (line.last() !== '}') {
	        this.print_newline();
	      }
	      this._output.space_before_token = true;
	    }
	  } else if (prefix === 'NEWLINE') {
	    if (reserved_array(this._flags.last_token, special_words)) {
	      // no newline between 'return nnn'
	      this._output.space_before_token = true;
	    } else if (this._flags.last_token.text === 'declare' && reserved_array(current_token, ['var', 'let', 'const'])) {
	      // accomodates Typescript declare formatting
	      this._output.space_before_token = true;
	    } else if (this._flags.last_token.type !== TOKEN.END_EXPR) {
	      if ((this._flags.last_token.type !== TOKEN.START_EXPR || !reserved_array(current_token, ['var', 'let', 'const'])) && this._flags.last_token.text !== ':') {
	        // no need to force newline on 'var': for (var x = 0...)
	        if (reserved_word(current_token, 'if') && reserved_word(current_token.previous, 'else')) {
	          // no newline for } else if {
	          this._output.space_before_token = true;
	        } else {
	          this.print_newline();
	        }
	      }
	    } else if (reserved_array(current_token, line_starters) && this._flags.last_token.text !== ')') {
	      this.print_newline();
	    }
	  } else if (this._flags.multiline_frame && is_array(this._flags.mode) && this._flags.last_token.text === ',' && this._last_last_text === '}') {
	    this.print_newline(); // }, in lists get a newline treatment
	  } else if (prefix === 'SPACE') {
	    this._output.space_before_token = true;
	  }
	  if (current_token.previous && (current_token.previous.type === TOKEN.WORD || current_token.previous.type === TOKEN.RESERVED)) {
	    this._output.space_before_token = true;
	  }
	  this.print_token(current_token);
	  this._flags.last_word = current_token.text;

	  if (current_token.type === TOKEN.RESERVED) {
	    if (current_token.text === 'do') {
	      this._flags.do_block = true;
	    } else if (current_token.text === 'if') {
	      this._flags.if_block = true;
	    } else if (current_token.text === 'import') {
	      this._flags.import_block = true;
	    } else if (this._flags.import_block && reserved_word(current_token, 'from')) {
	      this._flags.import_block = false;
	    }
	  }
	};

	Beautifier.prototype.handle_semicolon = function(current_token) {
	  if (this.start_of_statement(current_token)) {
	    // The conditional starts the statement if appropriate.
	    // Semicolon can be the start (and end) of a statement
	    this._output.space_before_token = false;
	  } else {
	    this.handle_whitespace_and_comments(current_token);
	  }

	  var next_token = this._tokens.peek();
	  while (this._flags.mode === MODE.Statement &&
	    !(this._flags.if_block && reserved_word(next_token, 'else')) &&
	    !this._flags.do_block) {
	    this.restore_mode();
	  }

	  // hacky but effective for the moment
	  if (this._flags.import_block) {
	    this._flags.import_block = false;
	  }
	  this.print_token(current_token);
	};

	Beautifier.prototype.handle_string = function(current_token) {
	  if (current_token.text.startsWith("`") && current_token.newlines === 0 && current_token.whitespace_before === '' && (current_token.previous.text === ')' || this._flags.last_token.type === TOKEN.WORD)) ; else if (this.start_of_statement(current_token)) {
	    // The conditional starts the statement if appropriate.
	    // One difference - strings want at least a space before
	    this._output.space_before_token = true;
	  } else {
	    this.handle_whitespace_and_comments(current_token);
	    if (this._flags.last_token.type === TOKEN.RESERVED || this._flags.last_token.type === TOKEN.WORD || this._flags.inline_frame) {
	      this._output.space_before_token = true;
	    } else if (this._flags.last_token.type === TOKEN.COMMA || this._flags.last_token.type === TOKEN.START_EXPR || this._flags.last_token.type === TOKEN.EQUALS || this._flags.last_token.type === TOKEN.OPERATOR) {
	      if (!this.start_of_object_property()) {
	        this.allow_wrap_or_preserved_newline(current_token);
	      }
	    } else if ((current_token.text.startsWith("`") && this._flags.last_token.type === TOKEN.END_EXPR && (current_token.previous.text === ']' || current_token.previous.text === ')') && current_token.newlines === 0)) {
	      this._output.space_before_token = true;
	    } else {
	      this.print_newline();
	    }
	  }
	  this.print_token(current_token);
	};

	Beautifier.prototype.handle_equals = function(current_token) {
	  if (this.start_of_statement(current_token)) ; else {
	    this.handle_whitespace_and_comments(current_token);
	  }

	  if (this._flags.declaration_statement) {
	    // just got an '=' in a var-line, different formatting/line-breaking, etc will now be done
	    this._flags.declaration_assignment = true;
	  }
	  this._output.space_before_token = true;
	  this.print_token(current_token);
	  this._output.space_before_token = true;
	};

	Beautifier.prototype.handle_comma = function(current_token) {
	  this.handle_whitespace_and_comments(current_token, true);

	  this.print_token(current_token);
	  this._output.space_before_token = true;
	  if (this._flags.declaration_statement) {
	    if (is_expression(this._flags.parent.mode)) {
	      // do not break on comma, for(var a = 1, b = 2)
	      this._flags.declaration_assignment = false;
	    }

	    if (this._flags.declaration_assignment) {
	      this._flags.declaration_assignment = false;
	      this.print_newline(false, true);
	    } else if (this._options.comma_first) {
	      // for comma-first, we want to allow a newline before the comma
	      // to turn into a newline after the comma, which we will fixup later
	      this.allow_wrap_or_preserved_newline(current_token);
	    }
	  } else if (this._flags.mode === MODE.ObjectLiteral ||
	    (this._flags.mode === MODE.Statement && this._flags.parent.mode === MODE.ObjectLiteral)) {
	    if (this._flags.mode === MODE.Statement) {
	      this.restore_mode();
	    }

	    if (!this._flags.inline_frame) {
	      this.print_newline();
	    }
	  } else if (this._options.comma_first) {
	    // EXPR or DO_BLOCK
	    // for comma-first, we want to allow a newline before the comma
	    // to turn into a newline after the comma, which we will fixup later
	    this.allow_wrap_or_preserved_newline(current_token);
	  }
	};

	Beautifier.prototype.handle_operator = function(current_token) {
	  var isGeneratorAsterisk = current_token.text === '*' &&
	    (reserved_array(this._flags.last_token, ['function', 'yield']) ||
	      (in_array(this._flags.last_token.type, [TOKEN.START_BLOCK, TOKEN.COMMA, TOKEN.END_BLOCK, TOKEN.SEMICOLON]))
	    );
	  var isUnary = in_array(current_token.text, ['-', '+']) && (
	    in_array(this._flags.last_token.type, [TOKEN.START_BLOCK, TOKEN.START_EXPR, TOKEN.EQUALS, TOKEN.OPERATOR]) ||
	    in_array(this._flags.last_token.text, line_starters) ||
	    this._flags.last_token.text === ','
	  );

	  if (this.start_of_statement(current_token)) ; else {
	    var preserve_statement_flags = !isGeneratorAsterisk;
	    this.handle_whitespace_and_comments(current_token, preserve_statement_flags);
	  }

	  // hack for actionscript's import .*;
	  if (current_token.text === '*' && this._flags.last_token.type === TOKEN.DOT) {
	    this.print_token(current_token);
	    return;
	  }

	  if (current_token.text === '::') {
	    // no spaces around exotic namespacing syntax operator
	    this.print_token(current_token);
	    return;
	  }

	  if (in_array(current_token.text, ['-', '+']) && this.start_of_object_property()) {
	    // numeric value with +/- symbol in front as a property
	    this.print_token(current_token);
	    return;
	  }

	  // Allow line wrapping between operators when operator_position is
	  //   set to before or preserve
	  if (this._flags.last_token.type === TOKEN.OPERATOR && in_array(this._options.operator_position, OPERATOR_POSITION_BEFORE_OR_PRESERVE)) {
	    this.allow_wrap_or_preserved_newline(current_token);
	  }

	  if (current_token.text === ':' && this._flags.in_case) {
	    this.print_token(current_token);

	    this._flags.in_case = false;
	    this._flags.case_body = true;
	    if (this._tokens.peek().type !== TOKEN.START_BLOCK) {
	      this.indent();
	      this.print_newline();
	      this._flags.case_block = false;
	    } else {
	      this._flags.case_block = true;
	      this._output.space_before_token = true;
	    }
	    return;
	  }

	  var space_before = true;
	  var space_after = true;
	  var in_ternary = false;
	  if (current_token.text === ':') {
	    if (this._flags.ternary_depth === 0) {
	      // Colon is invalid javascript outside of ternary and object, but do our best to guess what was meant.
	      space_before = false;
	    } else {
	      this._flags.ternary_depth -= 1;
	      in_ternary = true;
	    }
	  } else if (current_token.text === '?') {
	    this._flags.ternary_depth += 1;
	  }

	  // let's handle the operator_position option prior to any conflicting logic
	  if (!isUnary && !isGeneratorAsterisk && this._options.preserve_newlines && in_array(current_token.text, positionable_operators)) {
	    var isColon = current_token.text === ':';
	    var isTernaryColon = (isColon && in_ternary);
	    var isOtherColon = (isColon && !in_ternary);

	    switch (this._options.operator_position) {
	      case OPERATOR_POSITION.before_newline:
	        // if the current token is : and it's not a ternary statement then we set space_before to false
	        this._output.space_before_token = !isOtherColon;

	        this.print_token(current_token);

	        if (!isColon || isTernaryColon) {
	          this.allow_wrap_or_preserved_newline(current_token);
	        }

	        this._output.space_before_token = true;
	        return;

	      case OPERATOR_POSITION.after_newline:
	        // if the current token is anything but colon, or (via deduction) it's a colon and in a ternary statement,
	        //   then print a newline.

	        this._output.space_before_token = true;

	        if (!isColon || isTernaryColon) {
	          if (this._tokens.peek().newlines) {
	            this.print_newline(false, true);
	          } else {
	            this.allow_wrap_or_preserved_newline(current_token);
	          }
	        } else {
	          this._output.space_before_token = false;
	        }

	        this.print_token(current_token);

	        this._output.space_before_token = true;
	        return;

	      case OPERATOR_POSITION.preserve_newline:
	        if (!isOtherColon) {
	          this.allow_wrap_or_preserved_newline(current_token);
	        }

	        // if we just added a newline, or the current token is : and it's not a ternary statement,
	        //   then we set space_before to false
	        space_before = !(this._output.just_added_newline() || isOtherColon);

	        this._output.space_before_token = space_before;
	        this.print_token(current_token);
	        this._output.space_before_token = true;
	        return;
	    }
	  }

	  if (isGeneratorAsterisk) {
	    this.allow_wrap_or_preserved_newline(current_token);
	    space_before = false;
	    var next_token = this._tokens.peek();
	    space_after = next_token && in_array(next_token.type, [TOKEN.WORD, TOKEN.RESERVED]);
	  } else if (current_token.text === '...') {
	    this.allow_wrap_or_preserved_newline(current_token);
	    space_before = this._flags.last_token.type === TOKEN.START_BLOCK;
	    space_after = false;
	  } else if (in_array(current_token.text, ['--', '++', '!', '~']) || isUnary) {
	    // unary operators (and binary +/- pretending to be unary) special cases
	    if (this._flags.last_token.type === TOKEN.COMMA || this._flags.last_token.type === TOKEN.START_EXPR) {
	      this.allow_wrap_or_preserved_newline(current_token);
	    }

	    space_before = false;
	    space_after = false;

	    // http://www.ecma-international.org/ecma-262/5.1/#sec-7.9.1
	    // if there is a newline between -- or ++ and anything else we should preserve it.
	    if (current_token.newlines && (current_token.text === '--' || current_token.text === '++' || current_token.text === '~')) {
	      var new_line_needed = reserved_array(this._flags.last_token, special_words) && current_token.newlines;
	      if (new_line_needed && (this._previous_flags.if_block || this._previous_flags.else_block)) {
	        this.restore_mode();
	      }
	      this.print_newline(new_line_needed, true);
	    }

	    if (this._flags.last_token.text === ';' && is_expression(this._flags.mode)) {
	      // for (;; ++i)
	      //        ^^^
	      space_before = true;
	    }

	    if (this._flags.last_token.type === TOKEN.RESERVED) {
	      space_before = true;
	    } else if (this._flags.last_token.type === TOKEN.END_EXPR) {
	      space_before = !(this._flags.last_token.text === ']' && (current_token.text === '--' || current_token.text === '++'));
	    } else if (this._flags.last_token.type === TOKEN.OPERATOR) {
	      // a++ + ++b;
	      // a - -b
	      space_before = in_array(current_token.text, ['--', '-', '++', '+']) && in_array(this._flags.last_token.text, ['--', '-', '++', '+']);
	      // + and - are not unary when preceded by -- or ++ operator
	      // a-- + b
	      // a * +b
	      // a - -b
	      if (in_array(current_token.text, ['+', '-']) && in_array(this._flags.last_token.text, ['--', '++'])) {
	        space_after = true;
	      }
	    }


	    if (((this._flags.mode === MODE.BlockStatement && !this._flags.inline_frame) || this._flags.mode === MODE.Statement) &&
	      (this._flags.last_token.text === '{' || this._flags.last_token.text === ';')) {
	      // { foo; --i }
	      // foo(); --bar;
	      this.print_newline();
	    }
	  }

	  this._output.space_before_token = this._output.space_before_token || space_before;
	  this.print_token(current_token);
	  this._output.space_before_token = space_after;
	};

	Beautifier.prototype.handle_block_comment = function(current_token, preserve_statement_flags) {
	  if (this._output.raw) {
	    this._output.add_raw_token(current_token);
	    if (current_token.directives && current_token.directives.preserve === 'end') {
	      // If we're testing the raw output behavior, do not allow a directive to turn it off.
	      this._output.raw = this._options.test_output_raw;
	    }
	    return;
	  }

	  if (current_token.directives) {
	    this.print_newline(false, preserve_statement_flags);
	    this.print_token(current_token);
	    if (current_token.directives.preserve === 'start') {
	      this._output.raw = true;
	    }
	    this.print_newline(false, true);
	    return;
	  }

	  // inline block
	  if (!acorn.newline.test(current_token.text) && !current_token.newlines) {
	    this._output.space_before_token = true;
	    this.print_token(current_token);
	    this._output.space_before_token = true;
	    return;
	  } else {
	    this.print_block_commment(current_token, preserve_statement_flags);
	  }
	};

	Beautifier.prototype.print_block_commment = function(current_token, preserve_statement_flags) {
	  var lines = split_linebreaks(current_token.text);
	  var j; // iterator for this case
	  var javadoc = false;
	  var starless = false;
	  var lastIndent = current_token.whitespace_before;
	  var lastIndentLength = lastIndent.length;

	  // block comment starts with a new line
	  this.print_newline(false, preserve_statement_flags);

	  // first line always indented
	  this.print_token_line_indentation(current_token);
	  this._output.add_token(lines[0]);
	  this.print_newline(false, preserve_statement_flags);


	  if (lines.length > 1) {
	    lines = lines.slice(1);
	    javadoc = all_lines_start_with(lines, '*');
	    starless = each_line_matches_indent(lines, lastIndent);

	    if (javadoc) {
	      this._flags.alignment = 1;
	    }

	    for (j = 0; j < lines.length; j++) {
	      if (javadoc) {
	        // javadoc: reformat and re-indent
	        this.print_token_line_indentation(current_token);
	        this._output.add_token(ltrim(lines[j]));
	      } else if (starless && lines[j]) {
	        // starless: re-indent non-empty content, avoiding trim
	        this.print_token_line_indentation(current_token);
	        this._output.add_token(lines[j].substring(lastIndentLength));
	      } else {
	        // normal comments output raw
	        this._output.current_line.set_indent(-1);
	        this._output.add_token(lines[j]);
	      }

	      // for comments on their own line or  more than one line, make sure there's a new line after
	      this.print_newline(false, preserve_statement_flags);
	    }

	    this._flags.alignment = 0;
	  }
	};


	Beautifier.prototype.handle_comment = function(current_token, preserve_statement_flags) {
	  if (current_token.newlines) {
	    this.print_newline(false, preserve_statement_flags);
	  } else {
	    this._output.trim(true);
	  }

	  this._output.space_before_token = true;
	  this.print_token(current_token);
	  this.print_newline(false, preserve_statement_flags);
	};

	Beautifier.prototype.handle_dot = function(current_token) {
	  if (this.start_of_statement(current_token)) ; else {
	    this.handle_whitespace_and_comments(current_token, true);
	  }

	  if (this._flags.last_token.text.match('^[0-9]+$')) {
	    this._output.space_before_token = true;
	  }

	  if (reserved_array(this._flags.last_token, special_words)) {
	    this._output.space_before_token = false;
	  } else {
	    // allow preserved newlines before dots in general
	    // force newlines on dots after close paren when break_chained - for bar().baz()
	    this.allow_wrap_or_preserved_newline(current_token,
	      this._flags.last_token.text === ')' && this._options.break_chained_methods);
	  }

	  // Only unindent chained method dot if this dot starts a new line.
	  // Otherwise the automatic extra indentation removal will handle the over indent
	  if (this._options.unindent_chained_methods && this._output.just_added_newline()) {
	    this.deindent();
	  }

	  this.print_token(current_token);
	};

	Beautifier.prototype.handle_unknown = function(current_token, preserve_statement_flags) {
	  this.print_token(current_token);

	  if (current_token.text[current_token.text.length - 1] === '\n') {
	    this.print_newline(false, preserve_statement_flags);
	  }
	};

	Beautifier.prototype.handle_eof = function(current_token) {
	  // Unwind any open statements
	  while (this._flags.mode === MODE.Statement) {
	    this.restore_mode();
	  }
	  this.handle_whitespace_and_comments(current_token);
	};

	beautifier$2.Beautifier = Beautifier;
	return beautifier$2;
}

/*jshint node:true */

var hasRequiredJavascript;

function requireJavascript () {
	if (hasRequiredJavascript) return javascript.exports;
	hasRequiredJavascript = 1;

	var Beautifier = requireBeautifier$2().Beautifier,
	  Options = requireOptions$2().Options;

	function js_beautify(js_source_text, options) {
	  var beautifier = new Beautifier(js_source_text, options);
	  return beautifier.beautify();
	}

	javascript.exports = js_beautify;
	javascript.exports.defaultOptions = function() {
	  return new Options();
	};
	return javascript.exports;
}

var css = {exports: {}};

var beautifier$1 = {};

var options$1 = {};

/*jshint node:true */

var hasRequiredOptions$1;

function requireOptions$1 () {
	if (hasRequiredOptions$1) return options$1;
	hasRequiredOptions$1 = 1;

	var BaseOptions = requireOptions$3().Options;

	function Options(options) {
	  BaseOptions.call(this, options, 'css');

	  this.selector_separator_newline = this._get_boolean('selector_separator_newline', true);
	  this.newline_between_rules = this._get_boolean('newline_between_rules', true);
	  var space_around_selector_separator = this._get_boolean('space_around_selector_separator');
	  this.space_around_combinator = this._get_boolean('space_around_combinator') || space_around_selector_separator;

	  var brace_style_split = this._get_selection_list('brace_style', ['collapse', 'expand', 'end-expand', 'none', 'preserve-inline']);
	  this.brace_style = 'collapse';
	  for (var bs = 0; bs < brace_style_split.length; bs++) {
	    if (brace_style_split[bs] !== 'expand') {
	      // default to collapse, as only collapse|expand is implemented for now
	      this.brace_style = 'collapse';
	    } else {
	      this.brace_style = brace_style_split[bs];
	    }
	  }
	}
	Options.prototype = new BaseOptions();



	options$1.Options = Options;
	return options$1;
}

/*jshint node:true */

var hasRequiredBeautifier$1;

function requireBeautifier$1 () {
	if (hasRequiredBeautifier$1) return beautifier$1;
	hasRequiredBeautifier$1 = 1;

	var Options = requireOptions$1().Options;
	var Output = requireOutput().Output;
	var InputScanner = requireInputscanner().InputScanner;
	var Directives = requireDirectives().Directives;

	var directives_core = new Directives(/\/\*/, /\*\//);

	var lineBreak = /\r\n|[\r\n]/;
	var allLineBreaks = /\r\n|[\r\n]/g;

	// tokenizer
	var whitespaceChar = /\s/;
	var whitespacePattern = /(?:\s|\n)+/g;
	var block_comment_pattern = /\/\*(?:[\s\S]*?)((?:\*\/)|$)/g;
	var comment_pattern = /\/\/(?:[^\n\r\u2028\u2029]*)/g;

	function Beautifier(source_text, options) {
	  this._source_text = source_text || '';
	  // Allow the setting of language/file-type specific options
	  // with inheritance of overall settings
	  this._options = new Options(options);
	  this._ch = null;
	  this._input = null;

	  // https://developer.mozilla.org/en-US/docs/Web/CSS/At-rule
	  this.NESTED_AT_RULE = {
	    "page": true,
	    "font-face": true,
	    "keyframes": true,
	    // also in CONDITIONAL_GROUP_RULE below
	    "media": true,
	    "supports": true,
	    "document": true
	  };
	  this.CONDITIONAL_GROUP_RULE = {
	    "media": true,
	    "supports": true,
	    "document": true
	  };
	  this.NON_SEMICOLON_NEWLINE_PROPERTY = [
	    "grid-template-areas",
	    "grid-template"
	  ];

	}

	Beautifier.prototype.eatString = function(endChars) {
	  var result = '';
	  this._ch = this._input.next();
	  while (this._ch) {
	    result += this._ch;
	    if (this._ch === "\\") {
	      result += this._input.next();
	    } else if (endChars.indexOf(this._ch) !== -1 || this._ch === "\n") {
	      break;
	    }
	    this._ch = this._input.next();
	  }
	  return result;
	};

	// Skips any white space in the source text from the current position.
	// When allowAtLeastOneNewLine is true, will output new lines for each
	// newline character found; if the user has preserve_newlines off, only
	// the first newline will be output
	Beautifier.prototype.eatWhitespace = function(allowAtLeastOneNewLine) {
	  var result = whitespaceChar.test(this._input.peek());
	  var newline_count = 0;
	  while (whitespaceChar.test(this._input.peek())) {
	    this._ch = this._input.next();
	    if (allowAtLeastOneNewLine && this._ch === '\n') {
	      if (newline_count === 0 || newline_count < this._options.max_preserve_newlines) {
	        newline_count++;
	        this._output.add_new_line(true);
	      }
	    }
	  }
	  return result;
	};

	// Nested pseudo-class if we are insideRule
	// and the next special character found opens
	// a new block
	Beautifier.prototype.foundNestedPseudoClass = function() {
	  var openParen = 0;
	  var i = 1;
	  var ch = this._input.peek(i);
	  while (ch) {
	    if (ch === "{") {
	      return true;
	    } else if (ch === '(') {
	      // pseudoclasses can contain ()
	      openParen += 1;
	    } else if (ch === ')') {
	      if (openParen === 0) {
	        return false;
	      }
	      openParen -= 1;
	    } else if (ch === ";" || ch === "}") {
	      return false;
	    }
	    i++;
	    ch = this._input.peek(i);
	  }
	  return false;
	};

	Beautifier.prototype.print_string = function(output_string) {
	  this._output.set_indent(this._indentLevel);
	  this._output.non_breaking_space = true;
	  this._output.add_token(output_string);
	};

	Beautifier.prototype.preserveSingleSpace = function(isAfterSpace) {
	  if (isAfterSpace) {
	    this._output.space_before_token = true;
	  }
	};

	Beautifier.prototype.indent = function() {
	  this._indentLevel++;
	};

	Beautifier.prototype.outdent = function() {
	  if (this._indentLevel > 0) {
	    this._indentLevel--;
	  }
	};

	/*_____________________--------------------_____________________*/

	Beautifier.prototype.beautify = function() {
	  if (this._options.disabled) {
	    return this._source_text;
	  }

	  var source_text = this._source_text;
	  var eol = this._options.eol;
	  if (eol === 'auto') {
	    eol = '\n';
	    if (source_text && lineBreak.test(source_text || '')) {
	      eol = source_text.match(lineBreak)[0];
	    }
	  }


	  // HACK: newline parsing inconsistent. This brute force normalizes the this._input.
	  source_text = source_text.replace(allLineBreaks, '\n');

	  // reset
	  var baseIndentString = source_text.match(/^[\t ]*/)[0];

	  this._output = new Output(this._options, baseIndentString);
	  this._input = new InputScanner(source_text);
	  this._indentLevel = 0;
	  this._nestedLevel = 0;

	  this._ch = null;
	  var parenLevel = 0;

	  var insideRule = false;
	  // This is the value side of a property value pair (blue in the following ex)
	  // label { content: blue }
	  var insidePropertyValue = false;
	  var enteringConditionalGroup = false;
	  var insideNonNestedAtRule = false;
	  var insideScssMap = false;
	  var topCharacter = this._ch;
	  var insideNonSemiColonValues = false;
	  var whitespace;
	  var isAfterSpace;
	  var previous_ch;

	  while (true) {
	    whitespace = this._input.read(whitespacePattern);
	    isAfterSpace = whitespace !== '';
	    previous_ch = topCharacter;
	    this._ch = this._input.next();
	    if (this._ch === '\\' && this._input.hasNext()) {
	      this._ch += this._input.next();
	    }
	    topCharacter = this._ch;

	    if (!this._ch) {
	      break;
	    } else if (this._ch === '/' && this._input.peek() === '*') {
	      // /* css comment */
	      // Always start block comments on a new line.
	      // This handles scenarios where a block comment immediately
	      // follows a property definition on the same line or where
	      // minified code is being beautified.
	      this._output.add_new_line();
	      this._input.back();

	      var comment = this._input.read(block_comment_pattern);

	      // Handle ignore directive
	      var directives = directives_core.get_directives(comment);
	      if (directives && directives.ignore === 'start') {
	        comment += directives_core.readIgnored(this._input);
	      }

	      this.print_string(comment);

	      // Ensures any new lines following the comment are preserved
	      this.eatWhitespace(true);

	      // Block comments are followed by a new line so they don't
	      // share a line with other properties
	      this._output.add_new_line();
	    } else if (this._ch === '/' && this._input.peek() === '/') {
	      // // single line comment
	      // Preserves the space before a comment
	      // on the same line as a rule
	      this._output.space_before_token = true;
	      this._input.back();
	      this.print_string(this._input.read(comment_pattern));

	      // Ensures any new lines following the comment are preserved
	      this.eatWhitespace(true);
	    } else if (this._ch === '$') {
	      this.preserveSingleSpace(isAfterSpace);

	      this.print_string(this._ch);

	      // strip trailing space, if present, for hash property checks
	      var variable = this._input.peekUntilAfter(/[: ,;{}()[\]\/='"]/g);

	      if (variable.match(/[ :]$/)) {
	        // we have a variable or pseudo-class, add it and insert one space before continuing
	        variable = this.eatString(": ").replace(/\s+$/, '');
	        this.print_string(variable);
	        this._output.space_before_token = true;
	      }

	      // might be sass variable
	      if (parenLevel === 0 && variable.indexOf(':') !== -1) {
	        insidePropertyValue = true;
	        this.indent();
	      }
	    } else if (this._ch === '@') {
	      this.preserveSingleSpace(isAfterSpace);

	      // deal with less property mixins @{...}
	      if (this._input.peek() === '{') {
	        this.print_string(this._ch + this.eatString('}'));
	      } else {
	        this.print_string(this._ch);

	        // strip trailing space, if present, for hash property checks
	        var variableOrRule = this._input.peekUntilAfter(/[: ,;{}()[\]\/='"]/g);

	        if (variableOrRule.match(/[ :]$/)) {
	          // we have a variable or pseudo-class, add it and insert one space before continuing
	          variableOrRule = this.eatString(": ").replace(/\s+$/, '');
	          this.print_string(variableOrRule);
	          this._output.space_before_token = true;
	        }

	        // might be less variable
	        if (parenLevel === 0 && variableOrRule.indexOf(':') !== -1) {
	          insidePropertyValue = true;
	          this.indent();

	          // might be a nesting at-rule
	        } else if (variableOrRule in this.NESTED_AT_RULE) {
	          this._nestedLevel += 1;
	          if (variableOrRule in this.CONDITIONAL_GROUP_RULE) {
	            enteringConditionalGroup = true;
	          }

	          // might be a non-nested at-rule
	        } else if (parenLevel === 0 && !insidePropertyValue) {
	          insideNonNestedAtRule = true;
	        }
	      }
	    } else if (this._ch === '#' && this._input.peek() === '{') {
	      this.preserveSingleSpace(isAfterSpace);
	      this.print_string(this._ch + this.eatString('}'));
	    } else if (this._ch === '{') {
	      if (insidePropertyValue) {
	        insidePropertyValue = false;
	        this.outdent();
	      }

	      // non nested at rule becomes nested
	      insideNonNestedAtRule = false;

	      // when entering conditional groups, only rulesets are allowed
	      if (enteringConditionalGroup) {
	        enteringConditionalGroup = false;
	        insideRule = (this._indentLevel >= this._nestedLevel);
	      } else {
	        // otherwise, declarations are also allowed
	        insideRule = (this._indentLevel >= this._nestedLevel - 1);
	      }
	      if (this._options.newline_between_rules && insideRule) {
	        if (this._output.previous_line && this._output.previous_line.item(-1) !== '{') {
	          this._output.ensure_empty_line_above('/', ',');
	        }
	      }

	      this._output.space_before_token = true;

	      // The difference in print_string and indent order is necessary to indent the '{' correctly
	      if (this._options.brace_style === 'expand') {
	        this._output.add_new_line();
	        this.print_string(this._ch);
	        this.indent();
	        this._output.set_indent(this._indentLevel);
	      } else {
	        // inside mixin and first param is object
	        if (previous_ch === '(') {
	          this._output.space_before_token = false;
	        } else if (previous_ch !== ',') {
	          this.indent();
	        }
	        this.print_string(this._ch);
	      }

	      this.eatWhitespace(true);
	      this._output.add_new_line();
	    } else if (this._ch === '}') {
	      this.outdent();
	      this._output.add_new_line();
	      if (previous_ch === '{') {
	        this._output.trim(true);
	      }

	      if (insidePropertyValue) {
	        this.outdent();
	        insidePropertyValue = false;
	      }
	      this.print_string(this._ch);
	      insideRule = false;
	      if (this._nestedLevel) {
	        this._nestedLevel--;
	      }

	      this.eatWhitespace(true);
	      this._output.add_new_line();

	      if (this._options.newline_between_rules && !this._output.just_added_blankline()) {
	        if (this._input.peek() !== '}') {
	          this._output.add_new_line(true);
	        }
	      }
	      if (this._input.peek() === ')') {
	        this._output.trim(true);
	        if (this._options.brace_style === "expand") {
	          this._output.add_new_line(true);
	        }
	      }
	    } else if (this._ch === ":") {

	      for (var i = 0; i < this.NON_SEMICOLON_NEWLINE_PROPERTY.length; i++) {
	        if (this._input.lookBack(this.NON_SEMICOLON_NEWLINE_PROPERTY[i])) {
	          insideNonSemiColonValues = true;
	          break;
	        }
	      }

	      if ((insideRule || enteringConditionalGroup) && !(this._input.lookBack("&") || this.foundNestedPseudoClass()) && !this._input.lookBack("(") && !insideNonNestedAtRule && parenLevel === 0) {
	        // 'property: value' delimiter
	        // which could be in a conditional group query

	        this.print_string(':');
	        if (!insidePropertyValue) {
	          insidePropertyValue = true;
	          this._output.space_before_token = true;
	          this.eatWhitespace(true);
	          this.indent();
	        }
	      } else {
	        // sass/less parent reference don't use a space
	        // sass nested pseudo-class don't use a space

	        // preserve space before pseudoclasses/pseudoelements, as it means "in any child"
	        if (this._input.lookBack(" ")) {
	          this._output.space_before_token = true;
	        }
	        if (this._input.peek() === ":") {
	          // pseudo-element
	          this._ch = this._input.next();
	          this.print_string("::");
	        } else {
	          // pseudo-class
	          this.print_string(':');
	        }
	      }
	    } else if (this._ch === '"' || this._ch === '\'') {
	      var preserveQuoteSpace = previous_ch === '"' || previous_ch === '\'';
	      this.preserveSingleSpace(preserveQuoteSpace || isAfterSpace);
	      this.print_string(this._ch + this.eatString(this._ch));
	      this.eatWhitespace(true);
	    } else if (this._ch === ';') {
	      insideNonSemiColonValues = false;
	      if (parenLevel === 0) {
	        if (insidePropertyValue) {
	          this.outdent();
	          insidePropertyValue = false;
	        }
	        insideNonNestedAtRule = false;
	        this.print_string(this._ch);
	        this.eatWhitespace(true);

	        // This maintains single line comments on the same
	        // line. Block comments are also affected, but
	        // a new line is always output before one inside
	        // that section
	        if (this._input.peek() !== '/') {
	          this._output.add_new_line();
	        }
	      } else {
	        this.print_string(this._ch);
	        this.eatWhitespace(true);
	        this._output.space_before_token = true;
	      }
	    } else if (this._ch === '(') { // may be a url
	      if (this._input.lookBack("url")) {
	        this.print_string(this._ch);
	        this.eatWhitespace();
	        parenLevel++;
	        this.indent();
	        this._ch = this._input.next();
	        if (this._ch === ')' || this._ch === '"' || this._ch === '\'') {
	          this._input.back();
	        } else if (this._ch) {
	          this.print_string(this._ch + this.eatString(')'));
	          if (parenLevel) {
	            parenLevel--;
	            this.outdent();
	          }
	        }
	      } else {
	        var space_needed = false;
	        if (this._input.lookBack("with")) {
	          // look back is not an accurate solution, we need tokens to confirm without whitespaces
	          space_needed = true;
	        }
	        this.preserveSingleSpace(isAfterSpace || space_needed);
	        this.print_string(this._ch);

	        // handle scss/sass map
	        if (insidePropertyValue && previous_ch === "$" && this._options.selector_separator_newline) {
	          this._output.add_new_line();
	          insideScssMap = true;
	        } else {
	          this.eatWhitespace();
	          parenLevel++;
	          this.indent();
	        }
	      }
	    } else if (this._ch === ')') {
	      if (parenLevel) {
	        parenLevel--;
	        this.outdent();
	      }
	      if (insideScssMap && this._input.peek() === ";" && this._options.selector_separator_newline) {
	        insideScssMap = false;
	        this.outdent();
	        this._output.add_new_line();
	      }
	      this.print_string(this._ch);
	    } else if (this._ch === ',') {
	      this.print_string(this._ch);
	      this.eatWhitespace(true);
	      if (this._options.selector_separator_newline && (!insidePropertyValue || insideScssMap) && parenLevel === 0 && !insideNonNestedAtRule) {
	        this._output.add_new_line();
	      } else {
	        this._output.space_before_token = true;
	      }
	    } else if ((this._ch === '>' || this._ch === '+' || this._ch === '~') && !insidePropertyValue && parenLevel === 0) {
	      //handle combinator spacing
	      if (this._options.space_around_combinator) {
	        this._output.space_before_token = true;
	        this.print_string(this._ch);
	        this._output.space_before_token = true;
	      } else {
	        this.print_string(this._ch);
	        this.eatWhitespace();
	        // squash extra whitespace
	        if (this._ch && whitespaceChar.test(this._ch)) {
	          this._ch = '';
	        }
	      }
	    } else if (this._ch === ']') {
	      this.print_string(this._ch);
	    } else if (this._ch === '[') {
	      this.preserveSingleSpace(isAfterSpace);
	      this.print_string(this._ch);
	    } else if (this._ch === '=') { // no whitespace before or after
	      this.eatWhitespace();
	      this.print_string('=');
	      if (whitespaceChar.test(this._ch)) {
	        this._ch = '';
	      }
	    } else if (this._ch === '!' && !this._input.lookBack("\\")) { // !important
	      this._output.space_before_token = true;
	      this.print_string(this._ch);
	    } else {
	      var preserveAfterSpace = previous_ch === '"' || previous_ch === '\'';
	      this.preserveSingleSpace(preserveAfterSpace || isAfterSpace);
	      this.print_string(this._ch);

	      if (!this._output.just_added_newline() && this._input.peek() === '\n' && insideNonSemiColonValues) {
	        this._output.add_new_line();
	      }
	    }
	  }

	  var sweetCode = this._output.get_code(eol);

	  return sweetCode;
	};

	beautifier$1.Beautifier = Beautifier;
	return beautifier$1;
}

/*jshint node:true */

var hasRequiredCss;

function requireCss () {
	if (hasRequiredCss) return css.exports;
	hasRequiredCss = 1;

	var Beautifier = requireBeautifier$1().Beautifier,
	  Options = requireOptions$1().Options;

	function css_beautify(source_text, options) {
	  var beautifier = new Beautifier(source_text, options);
	  return beautifier.beautify();
	}

	css.exports = css_beautify;
	css.exports.defaultOptions = function() {
	  return new Options();
	};
	return css.exports;
}

var html = {exports: {}};

var beautifier = {};

var options = {};

/*jshint node:true */

var hasRequiredOptions;

function requireOptions () {
	if (hasRequiredOptions) return options;
	hasRequiredOptions = 1;

	var BaseOptions = requireOptions$3().Options;

	function Options(options) {
	  BaseOptions.call(this, options, 'html');
	  if (this.templating.length === 1 && this.templating[0] === 'auto') {
	    this.templating = ['django', 'erb', 'handlebars', 'php'];
	  }

	  this.indent_inner_html = this._get_boolean('indent_inner_html');
	  this.indent_body_inner_html = this._get_boolean('indent_body_inner_html', true);
	  this.indent_head_inner_html = this._get_boolean('indent_head_inner_html', true);

	  this.indent_handlebars = this._get_boolean('indent_handlebars', true);
	  this.wrap_attributes = this._get_selection('wrap_attributes',
	    ['auto', 'force', 'force-aligned', 'force-expand-multiline', 'aligned-multiple', 'preserve', 'preserve-aligned']);
	  this.wrap_attributes_min_attrs = this._get_number('wrap_attributes_min_attrs', 2);
	  this.wrap_attributes_indent_size = this._get_number('wrap_attributes_indent_size', this.indent_size);
	  this.extra_liners = this._get_array('extra_liners', ['head', 'body', '/html']);

	  // Block vs inline elements
	  // https://developer.mozilla.org/en-US/docs/Web/HTML/Block-level_elements
	  // https://developer.mozilla.org/en-US/docs/Web/HTML/Inline_elements
	  // https://www.w3.org/TR/html5/dom.html#phrasing-content
	  this.inline = this._get_array('inline', [
	    'a', 'abbr', 'area', 'audio', 'b', 'bdi', 'bdo', 'br', 'button', 'canvas', 'cite',
	    'code', 'data', 'datalist', 'del', 'dfn', 'em', 'embed', 'i', 'iframe', 'img',
	    'input', 'ins', 'kbd', 'keygen', 'label', 'map', 'mark', 'math', 'meter', 'noscript',
	    'object', 'output', 'progress', 'q', 'ruby', 's', 'samp', /* 'script', */ 'select', 'small',
	    'span', 'strong', 'sub', 'sup', 'svg', 'template', 'textarea', 'time', 'u', 'var',
	    'video', 'wbr', 'text',
	    // obsolete inline tags
	    'acronym', 'big', 'strike', 'tt'
	  ]);
	  this.inline_custom_elements = this._get_boolean('inline_custom_elements', true);
	  this.void_elements = this._get_array('void_elements', [
	    // HTLM void elements - aka self-closing tags - aka singletons
	    // https://www.w3.org/html/wg/drafts/html/master/syntax.html#void-elements
	    'area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'keygen',
	    'link', 'menuitem', 'meta', 'param', 'source', 'track', 'wbr',
	    // NOTE: Optional tags are too complex for a simple list
	    // they are hard coded in _do_optional_end_element

	    // Doctype and xml elements
	    '!doctype', '?xml',

	    // obsolete tags
	    // basefont: https://www.computerhope.com/jargon/h/html-basefont-tag.htm
	    // isndex: https://developer.mozilla.org/en-US/docs/Web/HTML/Element/isindex
	    'basefont', 'isindex'
	  ]);
	  this.unformatted = this._get_array('unformatted', []);
	  this.content_unformatted = this._get_array('content_unformatted', [
	    'pre', 'textarea'
	  ]);
	  this.unformatted_content_delimiter = this._get_characters('unformatted_content_delimiter');
	  this.indent_scripts = this._get_selection('indent_scripts', ['normal', 'keep', 'separate']);

	}
	Options.prototype = new BaseOptions();



	options.Options = Options;
	return options;
}

var tokenizer$1 = {};

/*jshint node:true */

var hasRequiredTokenizer;

function requireTokenizer () {
	if (hasRequiredTokenizer) return tokenizer$1;
	hasRequiredTokenizer = 1;

	var BaseTokenizer = requireTokenizer$2().Tokenizer;
	var BASETOKEN = requireTokenizer$2().TOKEN;
	var Directives = requireDirectives().Directives;
	var TemplatablePattern = requireTemplatablepattern().TemplatablePattern;
	var Pattern = requirePattern().Pattern;

	var TOKEN = {
	  TAG_OPEN: 'TK_TAG_OPEN',
	  TAG_CLOSE: 'TK_TAG_CLOSE',
	  CONTROL_FLOW_OPEN: 'TK_CONTROL_FLOW_OPEN',
	  CONTROL_FLOW_CLOSE: 'TK_CONTROL_FLOW_CLOSE',
	  ATTRIBUTE: 'TK_ATTRIBUTE',
	  EQUALS: 'TK_EQUALS',
	  VALUE: 'TK_VALUE',
	  COMMENT: 'TK_COMMENT',
	  TEXT: 'TK_TEXT',
	  UNKNOWN: 'TK_UNKNOWN',
	  START: BASETOKEN.START,
	  RAW: BASETOKEN.RAW,
	  EOF: BASETOKEN.EOF
	};

	var directives_core = new Directives(/<\!--/, /-->/);

	var Tokenizer = function(input_string, options) {
	  BaseTokenizer.call(this, input_string, options);
	  this._current_tag_name = '';

	  // Words end at whitespace or when a tag starts
	  // if we are indenting handlebars, they are considered tags
	  var templatable_reader = new TemplatablePattern(this._input).read_options(this._options);
	  var pattern_reader = new Pattern(this._input);

	  this.__patterns = {
	    word: templatable_reader.until(/[\n\r\t <]/),
	    word_control_flow_close_excluded: templatable_reader.until(/[\n\r\t <}]/),
	    single_quote: templatable_reader.until_after(/'/),
	    double_quote: templatable_reader.until_after(/"/),
	    attribute: templatable_reader.until(/[\n\r\t =>]|\/>/),
	    element_name: templatable_reader.until(/[\n\r\t >\/]/),

	    angular_control_flow_start: pattern_reader.matching(/\@[a-zA-Z]+[^({]*[({]/),
	    handlebars_comment: pattern_reader.starting_with(/{{!--/).until_after(/--}}/),
	    handlebars: pattern_reader.starting_with(/{{/).until_after(/}}/),
	    handlebars_open: pattern_reader.until(/[\n\r\t }]/),
	    handlebars_raw_close: pattern_reader.until(/}}/),
	    comment: pattern_reader.starting_with(/<!--/).until_after(/-->/),
	    cdata: pattern_reader.starting_with(/<!\[CDATA\[/).until_after(/]]>/),
	    // https://en.wikipedia.org/wiki/Conditional_comment
	    conditional_comment: pattern_reader.starting_with(/<!\[/).until_after(/]>/),
	    processing: pattern_reader.starting_with(/<\?/).until_after(/\?>/)
	  };

	  if (this._options.indent_handlebars) {
	    this.__patterns.word = this.__patterns.word.exclude('handlebars');
	    this.__patterns.word_control_flow_close_excluded = this.__patterns.word_control_flow_close_excluded.exclude('handlebars');
	  }

	  this._unformatted_content_delimiter = null;

	  if (this._options.unformatted_content_delimiter) {
	    var literal_regexp = this._input.get_literal_regexp(this._options.unformatted_content_delimiter);
	    this.__patterns.unformatted_content_delimiter =
	      pattern_reader.matching(literal_regexp)
	      .until_after(literal_regexp);
	  }
	};
	Tokenizer.prototype = new BaseTokenizer();

	Tokenizer.prototype._is_comment = function(current_token) { // jshint unused:false
	  return false; //current_token.type === TOKEN.COMMENT || current_token.type === TOKEN.UNKNOWN;
	};

	Tokenizer.prototype._is_opening = function(current_token) {
	  return current_token.type === TOKEN.TAG_OPEN || current_token.type === TOKEN.CONTROL_FLOW_OPEN;
	};

	Tokenizer.prototype._is_closing = function(current_token, open_token) {
	  return (current_token.type === TOKEN.TAG_CLOSE &&
	    (open_token && (
	      ((current_token.text === '>' || current_token.text === '/>') && open_token.text[0] === '<') ||
	      (current_token.text === '}}' && open_token.text[0] === '{' && open_token.text[1] === '{')))
	  ) || (current_token.type === TOKEN.CONTROL_FLOW_CLOSE &&
	    (current_token.text === '}' && open_token.text.endsWith('{')));
	};

	Tokenizer.prototype._reset = function() {
	  this._current_tag_name = '';
	};

	Tokenizer.prototype._get_next_token = function(previous_token, open_token) { // jshint unused:false
	  var token = null;
	  this._readWhitespace();
	  var c = this._input.peek();

	  if (c === null) {
	    return this._create_token(TOKEN.EOF, '');
	  }

	  token = token || this._read_open_handlebars(c, open_token);
	  token = token || this._read_attribute(c, previous_token, open_token);
	  token = token || this._read_close(c, open_token);
	  token = token || this._read_script_and_style(c, previous_token);
	  token = token || this._read_control_flows(c, open_token);
	  token = token || this._read_raw_content(c, previous_token, open_token);
	  token = token || this._read_content_word(c, open_token);
	  token = token || this._read_comment_or_cdata(c);
	  token = token || this._read_processing(c);
	  token = token || this._read_open(c, open_token);
	  token = token || this._create_token(TOKEN.UNKNOWN, this._input.next());

	  return token;
	};

	Tokenizer.prototype._read_comment_or_cdata = function(c) { // jshint unused:false
	  var token = null;
	  var resulting_string = null;
	  var directives = null;

	  if (c === '<') {
	    var peek1 = this._input.peek(1);
	    // We treat all comments as literals, even more than preformatted tags
	    // we only look for the appropriate closing marker
	    if (peek1 === '!') {
	      resulting_string = this.__patterns.comment.read();

	      // only process directive on html comments
	      if (resulting_string) {
	        directives = directives_core.get_directives(resulting_string);
	        if (directives && directives.ignore === 'start') {
	          resulting_string += directives_core.readIgnored(this._input);
	        }
	      } else {
	        resulting_string = this.__patterns.cdata.read();
	      }
	    }

	    if (resulting_string) {
	      token = this._create_token(TOKEN.COMMENT, resulting_string);
	      token.directives = directives;
	    }
	  }

	  return token;
	};

	Tokenizer.prototype._read_processing = function(c) { // jshint unused:false
	  var token = null;
	  var resulting_string = null;
	  var directives = null;

	  if (c === '<') {
	    var peek1 = this._input.peek(1);
	    if (peek1 === '!' || peek1 === '?') {
	      resulting_string = this.__patterns.conditional_comment.read();
	      resulting_string = resulting_string || this.__patterns.processing.read();
	    }

	    if (resulting_string) {
	      token = this._create_token(TOKEN.COMMENT, resulting_string);
	      token.directives = directives;
	    }
	  }

	  return token;
	};

	Tokenizer.prototype._read_open = function(c, open_token) {
	  var resulting_string = null;
	  var token = null;
	  if (!open_token || open_token.type === TOKEN.CONTROL_FLOW_OPEN) {
	    if (c === '<') {

	      resulting_string = this._input.next();
	      if (this._input.peek() === '/') {
	        resulting_string += this._input.next();
	      }
	      resulting_string += this.__patterns.element_name.read();
	      token = this._create_token(TOKEN.TAG_OPEN, resulting_string);
	    }
	  }
	  return token;
	};

	Tokenizer.prototype._read_open_handlebars = function(c, open_token) {
	  var resulting_string = null;
	  var token = null;
	  if (!open_token || open_token.type === TOKEN.CONTROL_FLOW_OPEN) {
	    if ((this._options.templating.includes('angular') || this._options.indent_handlebars) && c === '{' && this._input.peek(1) === '{') {
	      if (this._options.indent_handlebars && this._input.peek(2) === '!') {
	        resulting_string = this.__patterns.handlebars_comment.read();
	        resulting_string = resulting_string || this.__patterns.handlebars.read();
	        token = this._create_token(TOKEN.COMMENT, resulting_string);
	      } else {
	        resulting_string = this.__patterns.handlebars_open.read();
	        token = this._create_token(TOKEN.TAG_OPEN, resulting_string);
	      }
	    }
	  }
	  return token;
	};

	Tokenizer.prototype._read_control_flows = function(c, open_token) {
	  var resulting_string = '';
	  var token = null;
	  // Only check for control flows if angular templating is set
	  if (!this._options.templating.includes('angular')) {
	    return token;
	  }

	  if (c === '@') {
	    resulting_string = this.__patterns.angular_control_flow_start.read();
	    if (resulting_string === '') {
	      return token;
	    }

	    var opening_parentheses_count = resulting_string.endsWith('(') ? 1 : 0;
	    var closing_parentheses_count = 0;
	    // The opening brace of the control flow is where the number of opening and closing parentheses equal
	    // e.g. @if({value: true} !== null) { 
	    while (!(resulting_string.endsWith('{') && opening_parentheses_count === closing_parentheses_count)) {
	      var next_char = this._input.next();
	      if (next_char === null) {
	        break;
	      } else if (next_char === '(') {
	        opening_parentheses_count++;
	      } else if (next_char === ')') {
	        closing_parentheses_count++;
	      }
	      resulting_string += next_char;
	    }
	    token = this._create_token(TOKEN.CONTROL_FLOW_OPEN, resulting_string);
	  } else if (c === '}' && open_token && open_token.type === TOKEN.CONTROL_FLOW_OPEN) {
	    resulting_string = this._input.next();
	    token = this._create_token(TOKEN.CONTROL_FLOW_CLOSE, resulting_string);
	  }
	  return token;
	};


	Tokenizer.prototype._read_close = function(c, open_token) {
	  var resulting_string = null;
	  var token = null;
	  if (open_token && open_token.type === TOKEN.TAG_OPEN) {
	    if (open_token.text[0] === '<' && (c === '>' || (c === '/' && this._input.peek(1) === '>'))) {
	      resulting_string = this._input.next();
	      if (c === '/') { //  for close tag "/>"
	        resulting_string += this._input.next();
	      }
	      token = this._create_token(TOKEN.TAG_CLOSE, resulting_string);
	    } else if (open_token.text[0] === '{' && c === '}' && this._input.peek(1) === '}') {
	      this._input.next();
	      this._input.next();
	      token = this._create_token(TOKEN.TAG_CLOSE, '}}');
	    }
	  }

	  return token;
	};

	Tokenizer.prototype._read_attribute = function(c, previous_token, open_token) {
	  var token = null;
	  var resulting_string = '';
	  if (open_token && open_token.text[0] === '<') {

	    if (c === '=') {
	      token = this._create_token(TOKEN.EQUALS, this._input.next());
	    } else if (c === '"' || c === "'") {
	      var content = this._input.next();
	      if (c === '"') {
	        content += this.__patterns.double_quote.read();
	      } else {
	        content += this.__patterns.single_quote.read();
	      }
	      token = this._create_token(TOKEN.VALUE, content);
	    } else {
	      resulting_string = this.__patterns.attribute.read();

	      if (resulting_string) {
	        if (previous_token.type === TOKEN.EQUALS) {
	          token = this._create_token(TOKEN.VALUE, resulting_string);
	        } else {
	          token = this._create_token(TOKEN.ATTRIBUTE, resulting_string);
	        }
	      }
	    }
	  }
	  return token;
	};

	Tokenizer.prototype._is_content_unformatted = function(tag_name) {
	  // void_elements have no content and so cannot have unformatted content
	  // script and style tags should always be read as unformatted content
	  // finally content_unformatted and unformatted element contents are unformatted
	  return this._options.void_elements.indexOf(tag_name) === -1 &&
	    (this._options.content_unformatted.indexOf(tag_name) !== -1 ||
	      this._options.unformatted.indexOf(tag_name) !== -1);
	};

	Tokenizer.prototype._read_raw_content = function(c, previous_token, open_token) { // jshint unused:false
	  var resulting_string = '';
	  if (open_token && open_token.text[0] === '{') {
	    resulting_string = this.__patterns.handlebars_raw_close.read();
	  } else if (previous_token.type === TOKEN.TAG_CLOSE &&
	    previous_token.opened.text[0] === '<' && previous_token.text[0] !== '/') {
	    // ^^ empty tag has no content 
	    var tag_name = previous_token.opened.text.substr(1).toLowerCase();
	    if (this._is_content_unformatted(tag_name)) {

	      resulting_string = this._input.readUntil(new RegExp('</' + tag_name + '[\\n\\r\\t ]*?>', 'ig'));
	    }
	  }

	  if (resulting_string) {
	    return this._create_token(TOKEN.TEXT, resulting_string);
	  }

	  return null;
	};

	Tokenizer.prototype._read_script_and_style = function(c, previous_token) { // jshint unused:false 
	  if (previous_token.type === TOKEN.TAG_CLOSE && previous_token.opened.text[0] === '<' && previous_token.text[0] !== '/') {
	    var tag_name = previous_token.opened.text.substr(1).toLowerCase();
	    if (tag_name === 'script' || tag_name === 'style') {
	      // Script and style tags are allowed to have comments wrapping their content
	      // or just have regular content.
	      var token = this._read_comment_or_cdata(c);
	      if (token) {
	        token.type = TOKEN.TEXT;
	        return token;
	      }
	      var resulting_string = this._input.readUntil(new RegExp('</' + tag_name + '[\\n\\r\\t ]*?>', 'ig'));
	      if (resulting_string) {
	        return this._create_token(TOKEN.TEXT, resulting_string);
	      }
	    }
	  }
	  return null;
	};

	Tokenizer.prototype._read_content_word = function(c, open_token) {
	  var resulting_string = '';
	  if (this._options.unformatted_content_delimiter) {
	    if (c === this._options.unformatted_content_delimiter[0]) {
	      resulting_string = this.__patterns.unformatted_content_delimiter.read();
	    }
	  }

	  if (!resulting_string) {
	    resulting_string = (open_token && open_token.type === TOKEN.CONTROL_FLOW_OPEN) ? this.__patterns.word_control_flow_close_excluded.read() : this.__patterns.word.read();
	  }
	  if (resulting_string) {
	    return this._create_token(TOKEN.TEXT, resulting_string);
	  }
	  return null;
	};

	tokenizer$1.Tokenizer = Tokenizer;
	tokenizer$1.TOKEN = TOKEN;
	return tokenizer$1;
}

/*jshint node:true */

var hasRequiredBeautifier;

function requireBeautifier () {
	if (hasRequiredBeautifier) return beautifier;
	hasRequiredBeautifier = 1;

	var Options = requireOptions().Options;
	var Output = requireOutput().Output;
	var Tokenizer = requireTokenizer().Tokenizer;
	var TOKEN = requireTokenizer().TOKEN;

	var lineBreak = /\r\n|[\r\n]/;
	var allLineBreaks = /\r\n|[\r\n]/g;

	var Printer = function(options, base_indent_string) { //handles input/output and some other printing functions

	  this.indent_level = 0;
	  this.alignment_size = 0;
	  this.max_preserve_newlines = options.max_preserve_newlines;
	  this.preserve_newlines = options.preserve_newlines;

	  this._output = new Output(options, base_indent_string);

	};

	Printer.prototype.current_line_has_match = function(pattern) {
	  return this._output.current_line.has_match(pattern);
	};

	Printer.prototype.set_space_before_token = function(value, non_breaking) {
	  this._output.space_before_token = value;
	  this._output.non_breaking_space = non_breaking;
	};

	Printer.prototype.set_wrap_point = function() {
	  this._output.set_indent(this.indent_level, this.alignment_size);
	  this._output.set_wrap_point();
	};


	Printer.prototype.add_raw_token = function(token) {
	  this._output.add_raw_token(token);
	};

	Printer.prototype.print_preserved_newlines = function(raw_token) {
	  var newlines = 0;
	  if (raw_token.type !== TOKEN.TEXT && raw_token.previous.type !== TOKEN.TEXT) {
	    newlines = raw_token.newlines ? 1 : 0;
	  }

	  if (this.preserve_newlines) {
	    newlines = raw_token.newlines < this.max_preserve_newlines + 1 ? raw_token.newlines : this.max_preserve_newlines + 1;
	  }
	  for (var n = 0; n < newlines; n++) {
	    this.print_newline(n > 0);
	  }

	  return newlines !== 0;
	};

	Printer.prototype.traverse_whitespace = function(raw_token) {
	  if (raw_token.whitespace_before || raw_token.newlines) {
	    if (!this.print_preserved_newlines(raw_token)) {
	      this._output.space_before_token = true;
	    }
	    return true;
	  }
	  return false;
	};

	Printer.prototype.previous_token_wrapped = function() {
	  return this._output.previous_token_wrapped;
	};

	Printer.prototype.print_newline = function(force) {
	  this._output.add_new_line(force);
	};

	Printer.prototype.print_token = function(token) {
	  if (token.text) {
	    this._output.set_indent(this.indent_level, this.alignment_size);
	    this._output.add_token(token.text);
	  }
	};

	Printer.prototype.indent = function() {
	  this.indent_level++;
	};

	Printer.prototype.deindent = function() {
	  if (this.indent_level > 0) {
	    this.indent_level--;
	    this._output.set_indent(this.indent_level, this.alignment_size);
	  }
	};

	Printer.prototype.get_full_indent = function(level) {
	  level = this.indent_level + (level || 0);
	  if (level < 1) {
	    return '';
	  }

	  return this._output.get_indent_string(level);
	};

	var get_type_attribute = function(start_token) {
	  var result = null;
	  var raw_token = start_token.next;

	  // Search attributes for a type attribute
	  while (raw_token.type !== TOKEN.EOF && start_token.closed !== raw_token) {
	    if (raw_token.type === TOKEN.ATTRIBUTE && raw_token.text === 'type') {
	      if (raw_token.next && raw_token.next.type === TOKEN.EQUALS &&
	        raw_token.next.next && raw_token.next.next.type === TOKEN.VALUE) {
	        result = raw_token.next.next.text;
	      }
	      break;
	    }
	    raw_token = raw_token.next;
	  }

	  return result;
	};

	var get_custom_beautifier_name = function(tag_check, raw_token) {
	  var typeAttribute = null;
	  var result = null;

	  if (!raw_token.closed) {
	    return null;
	  }

	  if (tag_check === 'script') {
	    typeAttribute = 'text/javascript';
	  } else if (tag_check === 'style') {
	    typeAttribute = 'text/css';
	  }

	  typeAttribute = get_type_attribute(raw_token) || typeAttribute;

	  // For script and style tags that have a type attribute, only enable custom beautifiers for matching values
	  // For those without a type attribute use default;
	  if (typeAttribute.search('text/css') > -1) {
	    result = 'css';
	  } else if (typeAttribute.search(/module|importmap|((text|application|dojo)\/(x-)?(javascript|ecmascript|jscript|livescript|(ld\+)?json|method|aspect))/) > -1) {
	    result = 'javascript';
	  } else if (typeAttribute.search(/(text|application|dojo)\/(x-)?(html)/) > -1) {
	    result = 'html';
	  } else if (typeAttribute.search(/test\/null/) > -1) {
	    // Test only mime-type for testing the beautifier when null is passed as beautifing function
	    result = 'null';
	  }

	  return result;
	};

	function in_array(what, arr) {
	  return arr.indexOf(what) !== -1;
	}

	function TagFrame(parent, parser_token, indent_level) {
	  this.parent = parent || null;
	  this.tag = parser_token ? parser_token.tag_name : '';
	  this.indent_level = indent_level || 0;
	  this.parser_token = parser_token || null;
	}

	function TagStack(printer) {
	  this._printer = printer;
	  this._current_frame = null;
	}

	TagStack.prototype.get_parser_token = function() {
	  return this._current_frame ? this._current_frame.parser_token : null;
	};

	TagStack.prototype.record_tag = function(parser_token) { //function to record a tag and its parent in this.tags Object
	  var new_frame = new TagFrame(this._current_frame, parser_token, this._printer.indent_level);
	  this._current_frame = new_frame;
	};

	TagStack.prototype._try_pop_frame = function(frame) { //function to retrieve the opening tag to the corresponding closer
	  var parser_token = null;

	  if (frame) {
	    parser_token = frame.parser_token;
	    this._printer.indent_level = frame.indent_level;
	    this._current_frame = frame.parent;
	  }

	  return parser_token;
	};

	TagStack.prototype._get_frame = function(tag_list, stop_list) { //function to retrieve the opening tag to the corresponding closer
	  var frame = this._current_frame;

	  while (frame) { //till we reach '' (the initial value);
	    if (tag_list.indexOf(frame.tag) !== -1) { //if this is it use it
	      break;
	    } else if (stop_list && stop_list.indexOf(frame.tag) !== -1) {
	      frame = null;
	      break;
	    }
	    frame = frame.parent;
	  }

	  return frame;
	};

	TagStack.prototype.try_pop = function(tag, stop_list) { //function to retrieve the opening tag to the corresponding closer
	  var frame = this._get_frame([tag], stop_list);
	  return this._try_pop_frame(frame);
	};

	TagStack.prototype.indent_to_tag = function(tag_list) {
	  var frame = this._get_frame(tag_list);
	  if (frame) {
	    this._printer.indent_level = frame.indent_level;
	  }
	};

	function Beautifier(source_text, options, js_beautify, css_beautify) {
	  //Wrapper function to invoke all the necessary constructors and deal with the output.
	  this._source_text = source_text || '';
	  options = options || {};
	  this._js_beautify = js_beautify;
	  this._css_beautify = css_beautify;
	  this._tag_stack = null;

	  // Allow the setting of language/file-type specific options
	  // with inheritance of overall settings
	  var optionHtml = new Options(options, 'html');

	  this._options = optionHtml;

	  this._is_wrap_attributes_force = this._options.wrap_attributes.substr(0, 'force'.length) === 'force';
	  this._is_wrap_attributes_force_expand_multiline = (this._options.wrap_attributes === 'force-expand-multiline');
	  this._is_wrap_attributes_force_aligned = (this._options.wrap_attributes === 'force-aligned');
	  this._is_wrap_attributes_aligned_multiple = (this._options.wrap_attributes === 'aligned-multiple');
	  this._is_wrap_attributes_preserve = this._options.wrap_attributes.substr(0, 'preserve'.length) === 'preserve';
	  this._is_wrap_attributes_preserve_aligned = (this._options.wrap_attributes === 'preserve-aligned');
	}

	Beautifier.prototype.beautify = function() {

	  // if disabled, return the input unchanged.
	  if (this._options.disabled) {
	    return this._source_text;
	  }

	  var source_text = this._source_text;
	  var eol = this._options.eol;
	  if (this._options.eol === 'auto') {
	    eol = '\n';
	    if (source_text && lineBreak.test(source_text)) {
	      eol = source_text.match(lineBreak)[0];
	    }
	  }

	  // HACK: newline parsing inconsistent. This brute force normalizes the input.
	  source_text = source_text.replace(allLineBreaks, '\n');

	  var baseIndentString = source_text.match(/^[\t ]*/)[0];

	  var last_token = {
	    text: '',
	    type: ''
	  };

	  var last_tag_token = new TagOpenParserToken(this._options);

	  var printer = new Printer(this._options, baseIndentString);
	  var tokens = new Tokenizer(source_text, this._options).tokenize();

	  this._tag_stack = new TagStack(printer);

	  var parser_token = null;
	  var raw_token = tokens.next();
	  while (raw_token.type !== TOKEN.EOF) {

	    if (raw_token.type === TOKEN.TAG_OPEN || raw_token.type === TOKEN.COMMENT) {
	      parser_token = this._handle_tag_open(printer, raw_token, last_tag_token, last_token, tokens);
	      last_tag_token = parser_token;
	    } else if ((raw_token.type === TOKEN.ATTRIBUTE || raw_token.type === TOKEN.EQUALS || raw_token.type === TOKEN.VALUE) ||
	      (raw_token.type === TOKEN.TEXT && !last_tag_token.tag_complete)) {
	      parser_token = this._handle_inside_tag(printer, raw_token, last_tag_token, last_token);
	    } else if (raw_token.type === TOKEN.TAG_CLOSE) {
	      parser_token = this._handle_tag_close(printer, raw_token, last_tag_token);
	    } else if (raw_token.type === TOKEN.TEXT) {
	      parser_token = this._handle_text(printer, raw_token, last_tag_token);
	    } else if (raw_token.type === TOKEN.CONTROL_FLOW_OPEN) {
	      parser_token = this._handle_control_flow_open(printer, raw_token);
	    } else if (raw_token.type === TOKEN.CONTROL_FLOW_CLOSE) {
	      parser_token = this._handle_control_flow_close(printer, raw_token);
	    } else {
	      // This should never happen, but if it does. Print the raw token
	      printer.add_raw_token(raw_token);
	    }

	    last_token = parser_token;

	    raw_token = tokens.next();
	  }
	  var sweet_code = printer._output.get_code(eol);

	  return sweet_code;
	};

	Beautifier.prototype._handle_control_flow_open = function(printer, raw_token) {
	  var parser_token = {
	    text: raw_token.text,
	    type: raw_token.type
	  };
	  printer.set_space_before_token(raw_token.newlines || raw_token.whitespace_before !== '', true);
	  if (raw_token.newlines) {
	    printer.print_preserved_newlines(raw_token);
	  } else {
	    printer.set_space_before_token(raw_token.newlines || raw_token.whitespace_before !== '', true);
	  }
	  printer.print_token(raw_token);
	  printer.indent();
	  return parser_token;
	};

	Beautifier.prototype._handle_control_flow_close = function(printer, raw_token) {
	  var parser_token = {
	    text: raw_token.text,
	    type: raw_token.type
	  };

	  printer.deindent();
	  if (raw_token.newlines) {
	    printer.print_preserved_newlines(raw_token);
	  } else {
	    printer.set_space_before_token(raw_token.newlines || raw_token.whitespace_before !== '', true);
	  }
	  printer.print_token(raw_token);
	  return parser_token;
	};

	Beautifier.prototype._handle_tag_close = function(printer, raw_token, last_tag_token) {
	  var parser_token = {
	    text: raw_token.text,
	    type: raw_token.type
	  };
	  printer.alignment_size = 0;
	  last_tag_token.tag_complete = true;

	  printer.set_space_before_token(raw_token.newlines || raw_token.whitespace_before !== '', true);
	  if (last_tag_token.is_unformatted) {
	    printer.add_raw_token(raw_token);
	  } else {
	    if (last_tag_token.tag_start_char === '<') {
	      printer.set_space_before_token(raw_token.text[0] === '/', true); // space before />, no space before >
	      if (this._is_wrap_attributes_force_expand_multiline && last_tag_token.has_wrapped_attrs) {
	        printer.print_newline(false);
	      }
	    }
	    printer.print_token(raw_token);

	  }

	  if (last_tag_token.indent_content &&
	    !(last_tag_token.is_unformatted || last_tag_token.is_content_unformatted)) {
	    printer.indent();

	    // only indent once per opened tag
	    last_tag_token.indent_content = false;
	  }

	  if (!last_tag_token.is_inline_element &&
	    !(last_tag_token.is_unformatted || last_tag_token.is_content_unformatted)) {
	    printer.set_wrap_point();
	  }

	  return parser_token;
	};

	Beautifier.prototype._handle_inside_tag = function(printer, raw_token, last_tag_token, last_token) {
	  var wrapped = last_tag_token.has_wrapped_attrs;
	  var parser_token = {
	    text: raw_token.text,
	    type: raw_token.type
	  };

	  printer.set_space_before_token(raw_token.newlines || raw_token.whitespace_before !== '', true);
	  if (last_tag_token.is_unformatted) {
	    printer.add_raw_token(raw_token);
	  } else if (last_tag_token.tag_start_char === '{' && raw_token.type === TOKEN.TEXT) {
	    // For the insides of handlebars allow newlines or a single space between open and contents
	    if (printer.print_preserved_newlines(raw_token)) {
	      raw_token.newlines = 0;
	      printer.add_raw_token(raw_token);
	    } else {
	      printer.print_token(raw_token);
	    }
	  } else {
	    if (raw_token.type === TOKEN.ATTRIBUTE) {
	      printer.set_space_before_token(true);
	    } else if (raw_token.type === TOKEN.EQUALS) { //no space before =
	      printer.set_space_before_token(false);
	    } else if (raw_token.type === TOKEN.VALUE && raw_token.previous.type === TOKEN.EQUALS) { //no space before value
	      printer.set_space_before_token(false);
	    }

	    if (raw_token.type === TOKEN.ATTRIBUTE && last_tag_token.tag_start_char === '<') {
	      if (this._is_wrap_attributes_preserve || this._is_wrap_attributes_preserve_aligned) {
	        printer.traverse_whitespace(raw_token);
	        wrapped = wrapped || raw_token.newlines !== 0;
	      }

	      // Wrap for 'force' options, and if the number of attributes is at least that specified in 'wrap_attributes_min_attrs':
	      // 1. always wrap the second and beyond attributes
	      // 2. wrap the first attribute only if 'force-expand-multiline' is specified
	      if (this._is_wrap_attributes_force &&
	        last_tag_token.attr_count >= this._options.wrap_attributes_min_attrs &&
	        (last_token.type !== TOKEN.TAG_OPEN || // ie. second attribute and beyond
	          this._is_wrap_attributes_force_expand_multiline)) {
	        printer.print_newline(false);
	        wrapped = true;
	      }
	    }
	    printer.print_token(raw_token);
	    wrapped = wrapped || printer.previous_token_wrapped();
	    last_tag_token.has_wrapped_attrs = wrapped;
	  }
	  return parser_token;
	};

	Beautifier.prototype._handle_text = function(printer, raw_token, last_tag_token) {
	  var parser_token = {
	    text: raw_token.text,
	    type: 'TK_CONTENT'
	  };
	  if (last_tag_token.custom_beautifier_name) { //check if we need to format javascript
	    this._print_custom_beatifier_text(printer, raw_token, last_tag_token);
	  } else if (last_tag_token.is_unformatted || last_tag_token.is_content_unformatted) {
	    printer.add_raw_token(raw_token);
	  } else {
	    printer.traverse_whitespace(raw_token);
	    printer.print_token(raw_token);
	  }
	  return parser_token;
	};

	Beautifier.prototype._print_custom_beatifier_text = function(printer, raw_token, last_tag_token) {
	  var local = this;
	  if (raw_token.text !== '') {

	    var text = raw_token.text,
	      _beautifier,
	      script_indent_level = 1,
	      pre = '',
	      post = '';
	    if (last_tag_token.custom_beautifier_name === 'javascript' && typeof this._js_beautify === 'function') {
	      _beautifier = this._js_beautify;
	    } else if (last_tag_token.custom_beautifier_name === 'css' && typeof this._css_beautify === 'function') {
	      _beautifier = this._css_beautify;
	    } else if (last_tag_token.custom_beautifier_name === 'html') {
	      _beautifier = function(html_source, options) {
	        var beautifier = new Beautifier(html_source, options, local._js_beautify, local._css_beautify);
	        return beautifier.beautify();
	      };
	    }

	    if (this._options.indent_scripts === "keep") {
	      script_indent_level = 0;
	    } else if (this._options.indent_scripts === "separate") {
	      script_indent_level = -printer.indent_level;
	    }

	    var indentation = printer.get_full_indent(script_indent_level);

	    // if there is at least one empty line at the end of this text, strip it
	    // we'll be adding one back after the text but before the containing tag.
	    text = text.replace(/\n[ \t]*$/, '');

	    // Handle the case where content is wrapped in a comment or cdata.
	    if (last_tag_token.custom_beautifier_name !== 'html' &&
	      text[0] === '<' && text.match(/^(<!--|<!\[CDATA\[)/)) {
	      var matched = /^(<!--[^\n]*|<!\[CDATA\[)(\n?)([ \t\n]*)([\s\S]*)(-->|]]>)$/.exec(text);

	      // if we start to wrap but don't finish, print raw
	      if (!matched) {
	        printer.add_raw_token(raw_token);
	        return;
	      }

	      pre = indentation + matched[1] + '\n';
	      text = matched[4];
	      if (matched[5]) {
	        post = indentation + matched[5];
	      }

	      // if there is at least one empty line at the end of this text, strip it
	      // we'll be adding one back after the text but before the containing tag.
	      text = text.replace(/\n[ \t]*$/, '');

	      if (matched[2] || matched[3].indexOf('\n') !== -1) {
	        // if the first line of the non-comment text has spaces
	        // use that as the basis for indenting in null case.
	        matched = matched[3].match(/[ \t]+$/);
	        if (matched) {
	          raw_token.whitespace_before = matched[0];
	        }
	      }
	    }

	    if (text) {
	      if (_beautifier) {

	        // call the Beautifier if avaliable
	        var Child_options = function() {
	          this.eol = '\n';
	        };
	        Child_options.prototype = this._options.raw_options;
	        var child_options = new Child_options();
	        text = _beautifier(indentation + text, child_options);
	      } else {
	        // simply indent the string otherwise
	        var white = raw_token.whitespace_before;
	        if (white) {
	          text = text.replace(new RegExp('\n(' + white + ')?', 'g'), '\n');
	        }

	        text = indentation + text.replace(/\n/g, '\n' + indentation);
	      }
	    }

	    if (pre) {
	      if (!text) {
	        text = pre + post;
	      } else {
	        text = pre + text + '\n' + post;
	      }
	    }

	    printer.print_newline(false);
	    if (text) {
	      raw_token.text = text;
	      raw_token.whitespace_before = '';
	      raw_token.newlines = 0;
	      printer.add_raw_token(raw_token);
	      printer.print_newline(true);
	    }
	  }
	};

	Beautifier.prototype._handle_tag_open = function(printer, raw_token, last_tag_token, last_token, tokens) {
	  var parser_token = this._get_tag_open_token(raw_token);

	  if ((last_tag_token.is_unformatted || last_tag_token.is_content_unformatted) &&
	    !last_tag_token.is_empty_element &&
	    raw_token.type === TOKEN.TAG_OPEN && !parser_token.is_start_tag) {
	    // End element tags for unformatted or content_unformatted elements
	    // are printed raw to keep any newlines inside them exactly the same.
	    printer.add_raw_token(raw_token);
	    parser_token.start_tag_token = this._tag_stack.try_pop(parser_token.tag_name);
	  } else {
	    printer.traverse_whitespace(raw_token);
	    this._set_tag_position(printer, raw_token, parser_token, last_tag_token, last_token);
	    if (!parser_token.is_inline_element) {
	      printer.set_wrap_point();
	    }
	    printer.print_token(raw_token);
	  }

	  // count the number of attributes
	  if (parser_token.is_start_tag && this._is_wrap_attributes_force) {
	    var peek_index = 0;
	    var peek_token;
	    do {
	      peek_token = tokens.peek(peek_index);
	      if (peek_token.type === TOKEN.ATTRIBUTE) {
	        parser_token.attr_count += 1;
	      }
	      peek_index += 1;
	    } while (peek_token.type !== TOKEN.EOF && peek_token.type !== TOKEN.TAG_CLOSE);
	  }

	  //indent attributes an auto, forced, aligned or forced-align line-wrap
	  if (this._is_wrap_attributes_force_aligned || this._is_wrap_attributes_aligned_multiple || this._is_wrap_attributes_preserve_aligned) {
	    parser_token.alignment_size = raw_token.text.length + 1;
	  }

	  if (!parser_token.tag_complete && !parser_token.is_unformatted) {
	    printer.alignment_size = parser_token.alignment_size;
	  }

	  return parser_token;
	};

	var TagOpenParserToken = function(options, parent, raw_token) {
	  this.parent = parent || null;
	  this.text = '';
	  this.type = 'TK_TAG_OPEN';
	  this.tag_name = '';
	  this.is_inline_element = false;
	  this.is_unformatted = false;
	  this.is_content_unformatted = false;
	  this.is_empty_element = false;
	  this.is_start_tag = false;
	  this.is_end_tag = false;
	  this.indent_content = false;
	  this.multiline_content = false;
	  this.custom_beautifier_name = null;
	  this.start_tag_token = null;
	  this.attr_count = 0;
	  this.has_wrapped_attrs = false;
	  this.alignment_size = 0;
	  this.tag_complete = false;
	  this.tag_start_char = '';
	  this.tag_check = '';

	  if (!raw_token) {
	    this.tag_complete = true;
	  } else {
	    var tag_check_match;

	    this.tag_start_char = raw_token.text[0];
	    this.text = raw_token.text;

	    if (this.tag_start_char === '<') {
	      tag_check_match = raw_token.text.match(/^<([^\s>]*)/);
	      this.tag_check = tag_check_match ? tag_check_match[1] : '';
	    } else {
	      tag_check_match = raw_token.text.match(/^{{~?(?:[\^]|#\*?)?([^\s}]+)/);
	      this.tag_check = tag_check_match ? tag_check_match[1] : '';

	      // handle "{{#> myPartial}}" or "{{~#> myPartial}}"
	      if ((raw_token.text.startsWith('{{#>') || raw_token.text.startsWith('{{~#>')) && this.tag_check[0] === '>') {
	        if (this.tag_check === '>' && raw_token.next !== null) {
	          this.tag_check = raw_token.next.text.split(' ')[0];
	        } else {
	          this.tag_check = raw_token.text.split('>')[1];
	        }
	      }
	    }

	    this.tag_check = this.tag_check.toLowerCase();

	    if (raw_token.type === TOKEN.COMMENT) {
	      this.tag_complete = true;
	    }

	    this.is_start_tag = this.tag_check.charAt(0) !== '/';
	    this.tag_name = !this.is_start_tag ? this.tag_check.substr(1) : this.tag_check;
	    this.is_end_tag = !this.is_start_tag ||
	      (raw_token.closed && raw_token.closed.text === '/>');

	    // if whitespace handler ~ included (i.e. {{~#if true}}), handlebars tags start at pos 3 not pos 2
	    var handlebar_starts = 2;
	    if (this.tag_start_char === '{' && this.text.length >= 3) {
	      if (this.text.charAt(2) === '~') {
	        handlebar_starts = 3;
	      }
	    }

	    // handlebars tags that don't start with # or ^ are single_tags, and so also start and end.
	    // if they start with # or ^, they are still considered single tags if indenting of handlebars is set to false
	    this.is_end_tag = this.is_end_tag ||
	      (this.tag_start_char === '{' && (!options.indent_handlebars || this.text.length < 3 || (/[^#\^]/.test(this.text.charAt(handlebar_starts)))));
	  }
	};

	Beautifier.prototype._get_tag_open_token = function(raw_token) { //function to get a full tag and parse its type
	  var parser_token = new TagOpenParserToken(this._options, this._tag_stack.get_parser_token(), raw_token);

	  parser_token.alignment_size = this._options.wrap_attributes_indent_size;

	  parser_token.is_end_tag = parser_token.is_end_tag ||
	    in_array(parser_token.tag_check, this._options.void_elements);

	  parser_token.is_empty_element = parser_token.tag_complete ||
	    (parser_token.is_start_tag && parser_token.is_end_tag);

	  parser_token.is_unformatted = !parser_token.tag_complete && in_array(parser_token.tag_check, this._options.unformatted);
	  parser_token.is_content_unformatted = !parser_token.is_empty_element && in_array(parser_token.tag_check, this._options.content_unformatted);
	  parser_token.is_inline_element = in_array(parser_token.tag_name, this._options.inline) || (this._options.inline_custom_elements && parser_token.tag_name.includes("-")) || parser_token.tag_start_char === '{';

	  return parser_token;
	};

	Beautifier.prototype._set_tag_position = function(printer, raw_token, parser_token, last_tag_token, last_token) {

	  if (!parser_token.is_empty_element) {
	    if (parser_token.is_end_tag) { //this tag is a double tag so check for tag-ending
	      parser_token.start_tag_token = this._tag_stack.try_pop(parser_token.tag_name); //remove it and all ancestors
	    } else { // it's a start-tag
	      // check if this tag is starting an element that has optional end element
	      // and do an ending needed
	      if (this._do_optional_end_element(parser_token)) {
	        if (!parser_token.is_inline_element) {
	          printer.print_newline(false);
	        }
	      }

	      this._tag_stack.record_tag(parser_token); //push it on the tag stack

	      if ((parser_token.tag_name === 'script' || parser_token.tag_name === 'style') &&
	        !(parser_token.is_unformatted || parser_token.is_content_unformatted)) {
	        parser_token.custom_beautifier_name = get_custom_beautifier_name(parser_token.tag_check, raw_token);
	      }
	    }
	  }

	  if (in_array(parser_token.tag_check, this._options.extra_liners)) { //check if this double needs an extra line
	    printer.print_newline(false);
	    if (!printer._output.just_added_blankline()) {
	      printer.print_newline(true);
	    }
	  }

	  if (parser_token.is_empty_element) { //if this tag name is a single tag type (either in the list or has a closing /)

	    // if you hit an else case, reset the indent level if you are inside an:
	    // 'if', 'unless', or 'each' block.
	    if (parser_token.tag_start_char === '{' && parser_token.tag_check === 'else') {
	      this._tag_stack.indent_to_tag(['if', 'unless', 'each']);
	      parser_token.indent_content = true;
	      // Don't add a newline if opening {{#if}} tag is on the current line
	      var foundIfOnCurrentLine = printer.current_line_has_match(/{{#if/);
	      if (!foundIfOnCurrentLine) {
	        printer.print_newline(false);
	      }
	    }

	    // Don't add a newline before elements that should remain where they are.
	    if (parser_token.tag_name === '!--' && last_token.type === TOKEN.TAG_CLOSE &&
	      last_tag_token.is_end_tag && parser_token.text.indexOf('\n') === -1) ; else {
	      if (!(parser_token.is_inline_element || parser_token.is_unformatted)) {
	        printer.print_newline(false);
	      }
	      this._calcluate_parent_multiline(printer, parser_token);
	    }
	  } else if (parser_token.is_end_tag) { //this tag is a double tag so check for tag-ending
	    var do_end_expand = false;

	    // deciding whether a block is multiline should not be this hard
	    do_end_expand = parser_token.start_tag_token && parser_token.start_tag_token.multiline_content;
	    do_end_expand = do_end_expand || (!parser_token.is_inline_element &&
	      !(last_tag_token.is_inline_element || last_tag_token.is_unformatted) &&
	      !(last_token.type === TOKEN.TAG_CLOSE && parser_token.start_tag_token === last_tag_token) &&
	      last_token.type !== 'TK_CONTENT'
	    );

	    if (parser_token.is_content_unformatted || parser_token.is_unformatted) {
	      do_end_expand = false;
	    }

	    if (do_end_expand) {
	      printer.print_newline(false);
	    }
	  } else { // it's a start-tag
	    parser_token.indent_content = !parser_token.custom_beautifier_name;

	    if (parser_token.tag_start_char === '<') {
	      if (parser_token.tag_name === 'html') {
	        parser_token.indent_content = this._options.indent_inner_html;
	      } else if (parser_token.tag_name === 'head') {
	        parser_token.indent_content = this._options.indent_head_inner_html;
	      } else if (parser_token.tag_name === 'body') {
	        parser_token.indent_content = this._options.indent_body_inner_html;
	      }
	    }

	    if (!(parser_token.is_inline_element || parser_token.is_unformatted) &&
	      (last_token.type !== 'TK_CONTENT' || parser_token.is_content_unformatted)) {
	      printer.print_newline(false);
	    }

	    this._calcluate_parent_multiline(printer, parser_token);
	  }
	};

	Beautifier.prototype._calcluate_parent_multiline = function(printer, parser_token) {
	  if (parser_token.parent && printer._output.just_added_newline() &&
	    !((parser_token.is_inline_element || parser_token.is_unformatted) && parser_token.parent.is_inline_element)) {
	    parser_token.parent.multiline_content = true;
	  }
	};

	//To be used for <p> tag special case:
	var p_closers = ['address', 'article', 'aside', 'blockquote', 'details', 'div', 'dl', 'fieldset', 'figcaption', 'figure', 'footer', 'form', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'header', 'hr', 'main', 'menu', 'nav', 'ol', 'p', 'pre', 'section', 'table', 'ul'];
	var p_parent_excludes = ['a', 'audio', 'del', 'ins', 'map', 'noscript', 'video'];

	Beautifier.prototype._do_optional_end_element = function(parser_token) {
	  var result = null;
	  // NOTE: cases of "if there is no more content in the parent element"
	  // are handled automatically by the beautifier.
	  // It assumes parent or ancestor close tag closes all children.
	  // https://www.w3.org/TR/html5/syntax.html#optional-tags
	  if (parser_token.is_empty_element || !parser_token.is_start_tag || !parser_token.parent) {
	    return;

	  }

	  if (parser_token.tag_name === 'body') {
	    // A head element’s end tag may be omitted if the head element is not immediately followed by a space character or a comment.
	    result = result || this._tag_stack.try_pop('head');

	    //} else if (parser_token.tag_name === 'body') {
	    // DONE: A body element’s end tag may be omitted if the body element is not immediately followed by a comment.

	  } else if (parser_token.tag_name === 'li') {
	    // An li element’s end tag may be omitted if the li element is immediately followed by another li element or if there is no more content in the parent element.
	    result = result || this._tag_stack.try_pop('li', ['ol', 'ul', 'menu']);

	  } else if (parser_token.tag_name === 'dd' || parser_token.tag_name === 'dt') {
	    // A dd element’s end tag may be omitted if the dd element is immediately followed by another dd element or a dt element, or if there is no more content in the parent element.
	    // A dt element’s end tag may be omitted if the dt element is immediately followed by another dt element or a dd element.
	    result = result || this._tag_stack.try_pop('dt', ['dl']);
	    result = result || this._tag_stack.try_pop('dd', ['dl']);


	  } else if (parser_token.parent.tag_name === 'p' && p_closers.indexOf(parser_token.tag_name) !== -1) {
	    // IMPORTANT: this else-if works because p_closers has no overlap with any other element we look for in this method
	    // check for the parent element is an HTML element that is not an <a>, <audio>, <del>, <ins>, <map>, <noscript>, or <video> element,  or an autonomous custom element.
	    // To do this right, this needs to be coded as an inclusion of the inverse of the exclusion above.
	    // But to start with (if we ignore "autonomous custom elements") the exclusion would be fine.
	    var p_parent = parser_token.parent.parent;
	    if (!p_parent || p_parent_excludes.indexOf(p_parent.tag_name) === -1) {
	      result = result || this._tag_stack.try_pop('p');
	    }
	  } else if (parser_token.tag_name === 'rp' || parser_token.tag_name === 'rt') {
	    // An rt element’s end tag may be omitted if the rt element is immediately followed by an rt or rp element, or if there is no more content in the parent element.
	    // An rp element’s end tag may be omitted if the rp element is immediately followed by an rt or rp element, or if there is no more content in the parent element.
	    result = result || this._tag_stack.try_pop('rt', ['ruby', 'rtc']);
	    result = result || this._tag_stack.try_pop('rp', ['ruby', 'rtc']);

	  } else if (parser_token.tag_name === 'optgroup') {
	    // An optgroup element’s end tag may be omitted if the optgroup element is immediately followed by another optgroup element, or if there is no more content in the parent element.
	    // An option element’s end tag may be omitted if the option element is immediately followed by another option element, or if it is immediately followed by an optgroup element, or if there is no more content in the parent element.
	    result = result || this._tag_stack.try_pop('optgroup', ['select']);
	    //result = result || this._tag_stack.try_pop('option', ['select']);

	  } else if (parser_token.tag_name === 'option') {
	    // An option element’s end tag may be omitted if the option element is immediately followed by another option element, or if it is immediately followed by an optgroup element, or if there is no more content in the parent element.
	    result = result || this._tag_stack.try_pop('option', ['select', 'datalist', 'optgroup']);

	  } else if (parser_token.tag_name === 'colgroup') {
	    // DONE: A colgroup element’s end tag may be omitted if the colgroup element is not immediately followed by a space character or a comment.
	    // A caption element's end tag may be ommitted if a colgroup, thead, tfoot, tbody, or tr element is started.
	    result = result || this._tag_stack.try_pop('caption', ['table']);

	  } else if (parser_token.tag_name === 'thead') {
	    // A colgroup element's end tag may be ommitted if a thead, tfoot, tbody, or tr element is started.
	    // A caption element's end tag may be ommitted if a colgroup, thead, tfoot, tbody, or tr element is started.
	    result = result || this._tag_stack.try_pop('caption', ['table']);
	    result = result || this._tag_stack.try_pop('colgroup', ['table']);

	    //} else if (parser_token.tag_name === 'caption') {
	    // DONE: A caption element’s end tag may be omitted if the caption element is not immediately followed by a space character or a comment.

	  } else if (parser_token.tag_name === 'tbody' || parser_token.tag_name === 'tfoot') {
	    // A thead element’s end tag may be omitted if the thead element is immediately followed by a tbody or tfoot element.
	    // A tbody element’s end tag may be omitted if the tbody element is immediately followed by a tbody or tfoot element, or if there is no more content in the parent element.
	    // A colgroup element's end tag may be ommitted if a thead, tfoot, tbody, or tr element is started.
	    // A caption element's end tag may be ommitted if a colgroup, thead, tfoot, tbody, or tr element is started.
	    result = result || this._tag_stack.try_pop('caption', ['table']);
	    result = result || this._tag_stack.try_pop('colgroup', ['table']);
	    result = result || this._tag_stack.try_pop('thead', ['table']);
	    result = result || this._tag_stack.try_pop('tbody', ['table']);

	    //} else if (parser_token.tag_name === 'tfoot') {
	    // DONE: A tfoot element’s end tag may be omitted if there is no more content in the parent element.

	  } else if (parser_token.tag_name === 'tr') {
	    // A tr element’s end tag may be omitted if the tr element is immediately followed by another tr element, or if there is no more content in the parent element.
	    // A colgroup element's end tag may be ommitted if a thead, tfoot, tbody, or tr element is started.
	    // A caption element's end tag may be ommitted if a colgroup, thead, tfoot, tbody, or tr element is started.
	    result = result || this._tag_stack.try_pop('caption', ['table']);
	    result = result || this._tag_stack.try_pop('colgroup', ['table']);
	    result = result || this._tag_stack.try_pop('tr', ['table', 'thead', 'tbody', 'tfoot']);

	  } else if (parser_token.tag_name === 'th' || parser_token.tag_name === 'td') {
	    // A td element’s end tag may be omitted if the td element is immediately followed by a td or th element, or if there is no more content in the parent element.
	    // A th element’s end tag may be omitted if the th element is immediately followed by a td or th element, or if there is no more content in the parent element.
	    result = result || this._tag_stack.try_pop('td', ['table', 'thead', 'tbody', 'tfoot', 'tr']);
	    result = result || this._tag_stack.try_pop('th', ['table', 'thead', 'tbody', 'tfoot', 'tr']);
	  }

	  // Start element omission not handled currently
	  // A head element’s start tag may be omitted if the element is empty, or if the first thing inside the head element is an element.
	  // A tbody element’s start tag may be omitted if the first thing inside the tbody element is a tr element, and if the element is not immediately preceded by a tbody, thead, or tfoot element whose end tag has been omitted. (It can’t be omitted if the element is empty.)
	  // A colgroup element’s start tag may be omitted if the first thing inside the colgroup element is a col element, and if the element is not immediately preceded by another colgroup element whose end tag has been omitted. (It can’t be omitted if the element is empty.)

	  // Fix up the parent of the parser token
	  parser_token.parent = this._tag_stack.get_parser_token();

	  return result;
	};

	beautifier.Beautifier = Beautifier;
	return beautifier;
}

/*jshint node:true */

var hasRequiredHtml;

function requireHtml () {
	if (hasRequiredHtml) return html.exports;
	hasRequiredHtml = 1;

	var Beautifier = requireBeautifier().Beautifier,
	  Options = requireOptions().Options;

	function style_html(html_source, options, js_beautify, css_beautify) {
	  var beautifier = new Beautifier(html_source, options, js_beautify, css_beautify);
	  return beautifier.beautify();
	}

	html.exports = style_html;
	html.exports.defaultOptions = function() {
	  return new Options();
	};
	return html.exports;
}

/*jshint node:true */

var hasRequiredSrc;

function requireSrc () {
	if (hasRequiredSrc) return src;
	hasRequiredSrc = 1;

	var js_beautify = requireJavascript();
	var css_beautify = requireCss();
	var html_beautify = requireHtml();

	function style_html(html_source, options, js, css) {
	  js = js || js_beautify;
	  css = css || css_beautify;
	  return html_beautify(html_source, options, js, css);
	}
	style_html.defaultOptions = html_beautify.defaultOptions;

	src.js = js_beautify;
	src.css = css_beautify;
	src.html = style_html;
	return src;
}

/*jshint node:true */

var hasRequiredJs;

function requireJs () {
	if (hasRequiredJs) return js.exports;
	hasRequiredJs = 1;
	(function (module) {

		/**
		The following batches are equivalent:

		var beautify_js = require('js-beautify');
		var beautify_js = require('js-beautify').js;
		var beautify_js = require('js-beautify').js_beautify;

		var beautify_css = require('js-beautify').css;
		var beautify_css = require('js-beautify').css_beautify;

		var beautify_html = require('js-beautify').html;
		var beautify_html = require('js-beautify').html_beautify;

		All methods returned accept two arguments, the source string and an options object.
		**/

		function get_beautify(js_beautify, css_beautify, html_beautify) {
		  // the default is js
		  var beautify = function(src, config) {
		    return js_beautify.js_beautify(src, config);
		  };

		  // short aliases
		  beautify.js = js_beautify.js_beautify;
		  beautify.css = css_beautify.css_beautify;
		  beautify.html = html_beautify.html_beautify;

		  // legacy aliases
		  beautify.js_beautify = js_beautify.js_beautify;
		  beautify.css_beautify = css_beautify.css_beautify;
		  beautify.html_beautify = html_beautify.html_beautify;

		  return beautify;
		}

		{
		  (function(mod) {
		    var beautifier = requireSrc();
		    beautifier.js_beautify = beautifier.js;
		    beautifier.css_beautify = beautifier.css;
		    beautifier.html_beautify = beautifier.html;

		    mod.exports = get_beautify(beautifier, beautifier, beautifier);

		  })(module);
		} 
	} (js));
	return js.exports;
}

var jsExports = requireJs();
var beautify = /*@__PURE__*/getDefaultExportFromCjs(jsExports);

class BaseWrapper {
    get element() {
        return this.wrapperElement;
    }
    constructor(element) {
        this.isDisabled = () => {
            const validTagsToBeDisabled = [
                'BUTTON',
                'COMMAND',
                'FIELDSET',
                'KEYGEN',
                'OPTGROUP',
                'OPTION',
                'SELECT',
                'TEXTAREA',
                'INPUT'
            ];
            const hasDisabledAttribute = this.attributes().disabled !== undefined;
            const elementCanBeDisabled = isElement(this.element) &&
                validTagsToBeDisabled.includes(this.element.tagName);
            return hasDisabledAttribute && elementCanBeDisabled;
        };
        this.wrapperElement = element;
    }
    findAllDOMElements(selector) {
        const elementRootNodes = this.getRootNodes().filter(isElement);
        if (elementRootNodes.length === 0)
            return [];
        const result = [
            ...elementRootNodes.filter(node => node.matches(selector))
        ];
        elementRootNodes.forEach(rootNode => {
            result.push(...Array.from(rootNode.querySelectorAll(selector)));
        });
        return result;
    }
    find(selector) {
        if (typeof selector === 'object' && 'ref' in selector) {
            const currentComponent = this.getCurrentComponent();
            if (!currentComponent) {
                return createWrapperError('DOMWrapper');
            }
            let result = currentComponent.refs[selector.ref];
            // When using ref inside v-for, then refs contains array of component instances and nodes
            if (Array.isArray(result)) {
                result = result.length ? result[0] : undefined;
            }
            if (result instanceof Node) {
                return createDOMWrapper(result);
            }
            else {
                return createWrapperError('DOMWrapper');
            }
        }
        const elements = this.findAll(selector);
        if (elements.length > 0) {
            return elements[0];
        }
        return createWrapperError('DOMWrapper');
    }
    findComponent(selector) {
        const currentComponent = this.getCurrentComponent();
        if (!currentComponent) {
            return createWrapperError('VueWrapper');
        }
        if (typeof selector === 'object' && 'ref' in selector) {
            let result = currentComponent.refs[selector.ref];
            // When using ref inside v-for, then refs contains array of component instances
            if (Array.isArray(result)) {
                result = result.length ? result[0] : undefined;
            }
            if (result && !(result instanceof HTMLElement)) {
                return createVueWrapper(null, result);
            }
            else {
                return createWrapperError('VueWrapper');
            }
        }
        if (matches(currentComponent.vnode, selector) &&
            this.element.contains(currentComponent.vnode.el)) {
            return createVueWrapper(null, currentComponent.subTree.component
                ? currentComponent.subTree.component.proxy
                : currentComponent.proxy);
        }
        const [result] = this.findAllComponents(selector);
        return result !== null && result !== void 0 ? result : createWrapperError('VueWrapper');
    }
    findAllComponents(selector) {
        const currentComponent = this.getCurrentComponent();
        if (!currentComponent) {
            return [];
        }
        const results = find(currentComponent.subTree, selector);
        return results.map(c => c.proxy
            ? createVueWrapper(null, c.proxy)
            : createDOMWrapper(c.vnode.el, c.subTree));
    }
    html(options) {
        const stringNodes = this.getRootNodes().map(node => stringifyNode(node));
        if (options === null || options === void 0 ? void 0 : options.raw)
            return stringNodes.join('');
        return stringNodes
            .map(node => beautify.html(node, {
            unformatted: ['code', 'pre', 'em', 'strong', 'span'],
            indent_inner_html: true,
            indent_size: 2,
            inline_custom_elements: false
            // TODO the cast can be removed when @types/js-beautify will be up-to-date
        }))
            .join('\n');
    }
    classes(className) {
        const classes = isElement(this.element)
            ? Array.from(this.element.classList)
            : [];
        if (className)
            return classes.includes(className);
        return classes;
    }
    attributes(key) {
        const attributeMap = {};
        if (isElement(this.element)) {
            const attributes = Array.from(this.element.attributes);
            for (const attribute of attributes) {
                attributeMap[attribute.localName] = attribute.value;
            }
        }
        return key ? attributeMap[key] : attributeMap;
    }
    text() {
        return this.getRootNodes().map(textContent).join('');
    }
    exists() {
        return true;
    }
    get(selector) {
        const result = this.find(selector);
        if (result.exists()) {
            return result;
        }
        throw new Error(`Unable to get ${selector} within: ${this.html()}`);
    }
    getComponent(selector) {
        const result = this.findComponent(selector);
        if (result.exists()) {
            return result;
        }
        let message = 'Unable to get ';
        if (typeof selector === 'string') {
            message += `component with selector ${selector}`;
        }
        else if ('name' in selector) {
            message += `component with name ${selector.name}`;
        }
        else if ('ref' in selector) {
            message += `component with ref ${selector.ref}`;
        }
        else {
            message += 'specified component';
        }
        message += ` within: ${this.html()}`;
        throw new Error(message);
    }
    isVisible() {
        return isElement(this.element) && isElementVisible(this.element);
    }
    trigger(eventString, options) {
        return __awaiter(this, void 0, void 0, function* () {
            if (options && options['target']) {
                throw Error(`[vue-test-utils]: you cannot set the target value of an event. See the notes section ` +
                    `of the docs for more details—` +
                    `https://vue-test-utils.vuejs.org/api/wrapper/trigger.html`);
            }
            if (this.element && !this.isDisabled()) {
                const event = createDOMEvent(eventString, options);
                // see https://github.com/vuejs/test-utils/issues/1854
                // fakeTimers provoke an issue as Date.now() always return the same value
                // and Vue relies on it to determine if the handler should be invoked
                // see https://github.com/vuejs/core/blob/5ee40532a63e0b792e0c1eccf3cf68546a4e23e9/packages/runtime-dom/src/modules/events.ts#L100-L104
                // we workaround this issue by manually setting _vts to Date.now() + 1
                // thus making sure the event handler is invoked
                event._vts = Date.now() + 1;
                this.element.dispatchEvent(event);
            }
            return nextTick$1();
        });
    }
}

class DOMWrapper extends BaseWrapper {
    constructor(element, subTree) {
        if (!element) {
            return createWrapperError('DOMWrapper');
        }
        super(element);
        this.subTree = null;
        this.subTree = subTree;
        // plugins hook
        config.plugins.DOMWrapper.extend(this);
    }
    getRootNodes() {
        var _a, _b;
        if (((_a = this.subTree) === null || _a === void 0 ? void 0 : _a.type) === Fragment$1 &&
            Array.isArray((_b = this.subTree) === null || _b === void 0 ? void 0 : _b.children)) {
            return this.subTree.children.map(node => node === null || node === void 0 ? void 0 : node.el);
        }
        return [this.wrapperElement];
    }
    getCurrentComponent() {
        var _a;
        let component = this.element.__vueParentComponent;
        while (((_a = component === null || component === void 0 ? void 0 : component.parent) === null || _a === void 0 ? void 0 : _a.vnode.el) === this.element) {
            component = component.parent;
        }
        return component;
    }
    find(selector) {
        const result = super.find(selector);
        if (result.exists() && isRefSelector(selector)) {
            return this.element.contains(result.element)
                ? result
                : createWrapperError('DOMWrapper');
        }
        return result;
    }
    findAll(selector) {
        if (!(this.wrapperElement instanceof Element)) {
            return [];
        }
        return Array.from(this.wrapperElement.querySelectorAll(selector), element => createDOMWrapper(element));
    }
    findAllComponents(selector) {
        const results = super.findAllComponents(selector);
        return results.filter((r) => this.element.contains(r.element));
    }
    setChecked() {
        return __awaiter(this, arguments, void 0, function* (checked = true) {
            // typecast so we get type safety
            const element = this.element;
            const type = this.attributes().type;
            if (type === 'radio' && !checked) {
                throw Error(`wrapper.setChecked() cannot be called with parameter false on a '<input type="radio" /> element.`);
            }
            // we do not want to trigger an event if the user
            // attempting set the same value twice
            // this is because in a browser setting checked = true when it is
            // already true is a no-op; no change event is triggered
            if (checked === element.checked) {
                return;
            }
            element.checked = checked;
            this.trigger('input');
            return this.trigger('change');
        });
    }
    setValue(value) {
        const element = this.element;
        const tagName = element.tagName;
        const type = this.attributes().type;
        if (tagName === 'OPTION') {
            this.setSelected();
            return Promise.resolve();
        }
        else if (tagName === 'INPUT' && type === 'checkbox') {
            return this.setChecked(value);
        }
        else if (tagName === 'INPUT' && type === 'radio') {
            return this.setChecked(value);
        }
        else if (tagName === 'SELECT') {
            if (Array.isArray(value)) {
                const selectElement = element;
                for (let i = 0; i < selectElement.options.length; i++) {
                    const option = selectElement.options[i];
                    option.selected = value.includes(option.value);
                }
            }
            else {
                element.value = value;
            }
            this.trigger('input');
            return this.trigger('change');
        }
        else if (tagName === 'INPUT' || tagName === 'TEXTAREA') {
            element.value = value;
            this.trigger('input');
            // trigger `change` for `v-model.lazy`
            return this.trigger('change');
        }
        else {
            throw Error(`wrapper.setValue() cannot be called on ${tagName}`);
        }
    }
    setSelected() {
        const element = this.element;
        if (element.selected) {
            return;
        }
        // todo - review all non-null assertion operators in project
        // search globally for `!.` and with regex `!$`
        element.selected = true;
        let parentElement = element.parentElement;
        if (parentElement.tagName === 'OPTGROUP') {
            parentElement = parentElement.parentElement;
        }
        const parentWrapper = new DOMWrapper(parentElement);
        parentWrapper.trigger('input');
        return parentWrapper.trigger('change');
    }
}
registerFactory(WrapperType.DOMWrapper, (element, subTree) => new DOMWrapper(element, subTree));

function getRootNodes(vnode) {
    if (vnode.shapeFlag & 1 /* ShapeFlags.ELEMENT */) {
        return [vnode.el];
    }
    else if (vnode.shapeFlag & 6 /* ShapeFlags.COMPONENT */) {
        const { subTree } = vnode.component;
        return getRootNodes(subTree);
    }
    else if (vnode.shapeFlag & 128 /* ShapeFlags.SUSPENSE */) {
        return getRootNodes(vnode.suspense.activeBranch);
    }
    else if (vnode.shapeFlag &
        (8 /* ShapeFlags.TEXT_CHILDREN */ | 64 /* ShapeFlags.TELEPORT */)) {
        // static node optimization, subTree.children will be static string and will not help us
        const result = [vnode.el];
        if (vnode.anchor) {
            let currentNode = result[0].nextSibling;
            while (currentNode && currentNode.previousSibling !== vnode.anchor) {
                result.push(currentNode);
                currentNode = currentNode.nextSibling;
            }
        }
        return result;
    }
    else if (vnode.shapeFlag & 16 /* ShapeFlags.ARRAY_CHILDREN */) {
        const children = vnode.children.flat();
        return children
            .flatMap(vnode => getRootNodes(vnode))
            .filter(isNotNullOrUndefined);
    }
    // Missing cases which do not need special handling:
    // ShapeFlags.SLOTS_CHILDREN comes with ShapeFlags.ELEMENT
    // Will hit this default when ShapeFlags is 0
    // This is the case for example for unresolved async component without loader
    return [];
}

const events = {};
const recordedUidsByRoot = new Map();
function emitted(vm, eventName) {
    const cid = vm.$.uid;
    const vmEvents = events[cid] || {};
    if (eventName) {
        return vmEvents ? vmEvents[eventName] : undefined;
    }
    return vmEvents;
}
const attachEmitListener = () => {
    const target = getGlobalThis$1();
    // override emit to capture events when devtools is defined
    if (target.__VUE_DEVTOOLS_GLOBAL_HOOK__) {
        const _emit = target.__VUE_DEVTOOLS_GLOBAL_HOOK__.emit;
        target.__VUE_DEVTOOLS_GLOBAL_HOOK__.emit = (eventType, ...payload) => {
            _emit.call(target.__VUE_DEVTOOLS_GLOBAL_HOOK__, eventType, ...payload);
            captureDevtoolsVueComponentEmitEvent(eventType, payload);
        };
    }
    else {
        // use devtools to capture this "emit"
        setDevtoolsHook(createDevTools(), {});
    }
};
function captureDevtoolsVueComponentEmitEvent(eventType, payload) {
    if (eventType === "component:emit" /* DevtoolsHooks.COMPONENT_EMIT */) {
        const [_, componentVM, event, eventArgs] = payload;
        recordEvent(componentVM, event, eventArgs);
    }
}
// devtools hook only catches Vue component custom events
function createDevTools() {
    return {
        emit(eventType, ...payload) {
            captureDevtoolsVueComponentEmitEvent(eventType, payload);
        }
    };
}
const recordEvent = (vm, event, args) => {
    // Functional component wrapper creates a parent component
    let wrapperVm = vm;
    while (typeof (wrapperVm === null || wrapperVm === void 0 ? void 0 : wrapperVm.type) === 'function')
        wrapperVm = wrapperVm.parent;
    const cid = wrapperVm.uid;
    const rootCid = wrapperVm.root.uid;
    if (!recordedUidsByRoot.has(rootCid)) {
        recordedUidsByRoot.set(rootCid, new Set());
    }
    recordedUidsByRoot.get(rootCid).add(cid);
    if (!(cid in events)) {
        events[cid] = {};
    }
    if (!(event in events[cid])) {
        events[cid][event] = [];
    }
    // Record the event message sent by the emit
    events[cid][event].push(args);
};
const removeEventHistory = (vm) => {
    const rootCid = vm.$.root.uid;
    const uids = recordedUidsByRoot.get(rootCid);
    if (!uids)
        return;
    for (const uid of uids) {
        delete events[uid];
    }
    recordedUidsByRoot.delete(rootCid);
};

/**
 * Creates a proxy around the VM instance.
 * This proxy returns the value from the setupState if there is one, or the one from the VM if not.
 * See https://github.com/vuejs/core/issues/7103
 */
function createVMProxy(vm, setupState) {
    return new Proxy(vm, {
        get(vm, key, receiver) {
            if (vm.$.exposeProxy && key in vm.$.exposeProxy) {
                // first if the key is exposed in exposeProxy
                return Reflect.get(vm.$.exposeProxy, key, receiver);
            }
            else if (vm.$.exposed && key in vm.$.exposed) {
                // Vue only creates exposeProxy lazily (template ref or directive),
                // so a component can expose an API while exposeProxy is still null.
                // See https://github.com/vuejs/test-utils/issues/2591
                return unref$1(Reflect.get(vm.$.exposed, key, receiver));
            }
            else if (key in setupState) {
                // third if the key is acccessible from the setupState
                return Reflect.get(setupState, key, receiver);
            }
            else if (key in vm.$.appContext.config.globalProperties) {
                // fourth if the key is a global property
                return Reflect.get(vm.$.appContext.config.globalProperties, key, receiver);
            }
            else if (key in vm) {
                return Reflect.get(vm, key);
            }
            else {
                // vm.$.ctx is the internal context of the vm
                // with all variables, methods and props
                return vm.$.ctx[key];
            }
        },
        set(vm, key, value, receiver) {
            if (key in setupState) {
                return Reflect.set(setupState, key, value, receiver);
            }
            else {
                return Reflect.set(vm, key, value, receiver);
            }
        },
        has(vm, property) {
            return Reflect.has(setupState, property) || Reflect.has(vm, property);
        },
        defineProperty(vm, key, attributes) {
            if (key in setupState) {
                return Reflect.defineProperty(setupState, key, attributes);
            }
            else {
                return Reflect.defineProperty(vm, key, attributes);
            }
        },
        getOwnPropertyDescriptor(vm, property) {
            if (property in setupState) {
                return Reflect.getOwnPropertyDescriptor(setupState, property);
            }
            else {
                return Reflect.getOwnPropertyDescriptor(vm, property);
            }
        },
        deleteProperty(vm, property) {
            if (property in setupState) {
                return Reflect.deleteProperty(setupState, property);
            }
            else {
                return Reflect.deleteProperty(vm, property);
            }
        }
    });
}
class VueWrapper extends BaseWrapper {
    constructor(app, vm, setProps) {
        var _a;
        super(vm === null || vm === void 0 ? void 0 : vm.$el);
        this.cleanUpCallbacks = [];
        this.__app = app;
        // root is null on functional components
        this.rootVM = vm === null || vm === void 0 ? void 0 : vm.$root;
        // `vm.$.setupState` is what the template has access to
        // so even if the component is closed (as they are by default for `script setup`)
        // a test will still be able to do something like
        // `expect(wrapper.vm.count).toBe(1)`
        // if we return it as `vm`
        // This does not work for functional components though (as they have no vm)
        // or for components with a setup that returns a render function (as they have an empty proxy)
        // in both cases, we return `vm` directly instead — unless the component
        // used expose()/defineExpose(), so findComponent() can still read those
        // properties when Vue has not created exposeProxy (issue #2591)
        if (hasSetupState(vm)) {
            this.componentVM = createVMProxy(vm, vm.$.setupState);
        }
        else if ((_a = vm === null || vm === void 0 ? void 0 : vm.$) === null || _a === void 0 ? void 0 : _a.exposed) {
            this.componentVM = createVMProxy(vm, {});
        }
        else {
            this.componentVM = vm;
        }
        this.__setProps = setProps;
        this.attachNativeEventListener();
        config.plugins.VueWrapper.extend(this);
    }
    get hasMultipleRoots() {
        // Recursive check subtree for nested root elements
        // <template>
        //   <WithMultipleRoots />
        // </template>
        const checkTree = (subTree) => {
            var _a;
            // if the subtree is an array of children, we have multiple root nodes
            if (subTree.shapeFlag === 16 /* ShapeFlags.ARRAY_CHILDREN */)
                return true;
            if (subTree.shapeFlag & 4 /* ShapeFlags.STATEFUL_COMPONENT */ ||
                subTree.shapeFlag & 2 /* ShapeFlags.FUNCTIONAL_COMPONENT */) {
                // We are rendering other component, check it's tree instead
                if ((_a = subTree.component) === null || _a === void 0 ? void 0 : _a.subTree) {
                    return checkTree(subTree.component.subTree);
                }
                // Component has multiple children
                if (subTree.shapeFlag & 16 /* ShapeFlags.ARRAY_CHILDREN */) {
                    return true;
                }
            }
            return false;
        };
        return checkTree(this.vm.$.subTree);
    }
    getRootNodes() {
        return getRootNodes(this.vm.$.vnode);
    }
    get parentElement() {
        return this.vm.$el.parentElement;
    }
    getCurrentComponent() {
        return this.vm.$;
    }
    exists() {
        return !this.getCurrentComponent().isUnmounted;
    }
    findAll(selector) {
        return this.findAllDOMElements(selector).map(e => createDOMWrapper(e));
    }
    attachNativeEventListener() {
        const vm = this.vm;
        if (!vm)
            return;
        const emits = vm.$options.emits
            ? // if emits is declared as an array
                Array.isArray(vm.$options.emits)
                    ? // use it
                        vm.$options.emits
                    : // otherwise it's declared as an object
                        // and we only need the keys
                        Object.keys(vm.$options.emits)
            : [];
        const elementRoots = this.getRootNodes().filter((node) => node instanceof Element);
        if (elementRoots.length !== 1) {
            return;
        }
        const [element] = elementRoots;
        for (const eventName of Object.keys(domEvents)) {
            // if a component includes events in 'emits' with the same name as native
            // events, the native events with that name should be ignored
            // @see https://github.com/vuejs/rfcs/blob/master/active-rfcs/0030-emits-option.md#fallthrough-control
            if (emits.includes(eventName))
                continue;
            const eventListener = (...args) => {
                recordEvent(vm.$, eventName, args);
            };
            element.addEventListener(eventName, eventListener);
            this.cleanUpCallbacks.push(() => {
                element.removeEventListener(eventName, eventListener);
            });
        }
    }
    get element() {
        // if the component has multiple root elements, we use the parent's element
        return this.hasMultipleRoots ? this.parentElement : this.vm.$el;
    }
    get vm() {
        return this.componentVM;
    }
    props(selector) {
        const props = this.componentVM.$props;
        return selector ? props[selector] : props;
    }
    emitted(eventName) {
        return emitted(this.vm, eventName);
    }
    isVisible() {
        const domWrapper = createDOMWrapper(this.element);
        return domWrapper.isVisible();
    }
    /*
     * Depending on how the component was defined, data can live in different places.
     * Vue sets some default placeholder in all the locations however, so we cannot
     * just check if the data object exists or not.
     *
     * - <script setup>: data lives in setupState, marked with __isScriptSetup
     * - setup() function: data lives in setupState, not marked with __isScriptSetup
     * - Options API data(): data lives in $data, proxied through $data; setupState exists but is frozen
     * - Mixed API (setup() + data()): setupState is unfrozen (has setup() returns) AND $data exists.
     *   Each key must be routed individually — keys present in $data go there, the rest go to setupState.
     */
    setData(data) {
        // @ts-expect-error
        if (this.componentVM.$.setupState.__isScriptSetup) {
            // data from <script setup>
            // @ts-expect-error
            mergeDeep(this.componentVM.$.setupState, data);
            // @ts-expect-error
        }
        else if (!Object.isFrozen(this.componentVM.$.setupState)) {
            // data from setup() function — may also have data() properties in mixed-API components,
            // so route each key to wherever it actually lives
            for (const [key, value] of Object.entries(data)) {
                if (key in this.componentVM.$data) {
                    mergeDeep(this.componentVM.$data, { [key]: value });
                }
                else {
                    // @ts-expect-error
                    mergeDeep(proxyRefs$1(this.componentVM.$.setupState), { [key]: value });
                }
            }
        }
        else {
            // data when using data: {...} in the object api
            mergeDeep(this.componentVM.$data, data);
        }
        return nextTick$1();
    }
    setProps(props) {
        // if this VM's parent is not the root or if setProps does not exist, error out
        if (this.vm.$parent !== this.rootVM || !this.__setProps) {
            throw Error('You can only use setProps on your mounted component');
        }
        this.__setProps(props);
        return nextTick$1();
    }
    setValue(value, prop) {
        const propEvent = prop || 'modelValue';
        this.vm.$emit(`update:${propEvent}`, value);
        return this.vm.$nextTick();
    }
    unmount() {
        // preventing dispose of child component
        if (!this.__app) {
            throw new Error(`wrapper.unmount() can only be called by the root wrapper`);
        }
        // Clear emitted events cache for this component instance
        removeEventHistory(this.vm);
        this.cleanUpCallbacks.forEach(cb => cb());
        this.cleanUpCallbacks = [];
        this.__app.unmount();
    }
}
registerFactory(WrapperType.VueWrapper, (app, vm, setProps) => new VueWrapper(app, vm, setProps));

/**
* @vue/shared v3.5.42
* (c) 2018-present Yuxi (Evan) You and Vue contributors
* @license MIT
**/
// @__NO_SIDE_EFFECTS__
function makeMap(str) {
  const map = /* @__PURE__ */ Object.create(null);
  for (const key of str.split(",")) map[key] = 1;
  return (val) => val in map;
}

const EMPTY_OBJ = Object.freeze({}) ;
const EMPTY_ARR = Object.freeze([]) ;
const NOOP = () => {
};
const NO = () => false;
const isOn = (key) => key.charCodeAt(0) === 111 && key.charCodeAt(1) === 110 && // uppercase letter
(key.charCodeAt(2) > 122 || key.charCodeAt(2) < 97);
const isModelListener = (key) => key.startsWith("onUpdate:");
const extend = Object.assign;
const remove = (arr, el) => {
  const i = arr.indexOf(el);
  if (i > -1) {
    arr.splice(i, 1);
  }
};
const hasOwnProperty$1 = Object.prototype.hasOwnProperty;
const hasOwn = (val, key) => hasOwnProperty$1.call(val, key);
const isArray = Array.isArray;
const isMap = (val) => toTypeString(val) === "[object Map]";
const isSet = (val) => toTypeString(val) === "[object Set]";
const isDate = (val) => toTypeString(val) === "[object Date]";
const isFunction = (val) => typeof val === "function";
const isString = (val) => typeof val === "string";
const isSymbol = (val) => typeof val === "symbol";
const isObject = (val) => val !== null && typeof val === "object";
const isPromise = (val) => {
  return (isObject(val) || isFunction(val)) && isFunction(val.then) && isFunction(val.catch);
};
const objectToString = Object.prototype.toString;
const toTypeString = (value) => objectToString.call(value);
const toRawType = (value) => {
  return toTypeString(value).slice(8, -1);
};
const isPlainObject = (val) => toTypeString(val) === "[object Object]";
const isIntegerKey = (key) => isString(key) && key !== "NaN" && key[0] !== "-" && "" + parseInt(key, 10) === key;
const isReservedProp = /* @__PURE__ */ makeMap(
  // the leading comma is intentional so empty string "" is also included
  ",key,ref,ref_for,ref_key,onVnodeBeforeMount,onVnodeMounted,onVnodeBeforeUpdate,onVnodeUpdated,onVnodeBeforeUnmount,onVnodeUnmounted"
);
const isBuiltInDirective = /* @__PURE__ */ makeMap(
  "bind,cloak,else-if,else,for,html,if,model,on,once,pre,show,slot,text,memo"
);
const cacheStringFunction = (fn) => {
  const cache = /* @__PURE__ */ Object.create(null);
  return ((str) => {
    const hit = cache[str];
    return hit || (cache[str] = fn(str));
  });
};
const camelizeRE = /-\w/g;
const camelize = cacheStringFunction(
  (str) => {
    return str.replace(camelizeRE, (c) => c.slice(1).toUpperCase());
  }
);
const hyphenateRE = /\B([A-Z])/g;
const hyphenate = cacheStringFunction(
  (str) => str.replace(hyphenateRE, "-$1").toLowerCase()
);
const capitalize = cacheStringFunction((str) => {
  return str.charAt(0).toUpperCase() + str.slice(1);
});
const toHandlerKey = cacheStringFunction(
  (str) => {
    const s = str ? `on${capitalize(str)}` : ``;
    return s;
  }
);
const hasChanged = (value, oldValue) => !Object.is(value, oldValue);
const invokeArrayFns = (fns, ...arg) => {
  for (let i = 0; i < fns.length; i++) {
    fns[i](...arg);
  }
};
const def = (obj, key, value, writable = false) => {
  Object.defineProperty(obj, key, {
    configurable: true,
    enumerable: false,
    writable,
    value
  });
};
const looseToNumber = (val) => {
  const n = parseFloat(val);
  return isNaN(n) ? val : n;
};
let _globalThis;
const getGlobalThis = () => {
  return _globalThis || (_globalThis = typeof globalThis !== "undefined" ? globalThis : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : typeof global !== "undefined" ? global : {});
};
const PatchFlagNames = {
  [1]: `TEXT`,
  [2]: `CLASS`,
  [4]: `STYLE`,
  [8]: `PROPS`,
  [16]: `FULL_PROPS`,
  [32]: `NEED_HYDRATION`,
  [64]: `STABLE_FRAGMENT`,
  [128]: `KEYED_FRAGMENT`,
  [256]: `UNKEYED_FRAGMENT`,
  [512]: `NEED_PATCH`,
  [1024]: `DYNAMIC_SLOTS`,
  [2048]: `DEV_ROOT_FRAGMENT`,
  [-1]: `CACHED`,
  [-2]: `BAIL`
};
const slotFlagsText = {
  [1]: "STABLE",
  [2]: "DYNAMIC",
  [3]: "FORWARDED"
};

function normalizeStyle(value) {
  if (isArray(value)) {
    const res = {};
    for (let i = 0; i < value.length; i++) {
      const item = value[i];
      const normalized = isString(item) ? parseStringStyle(item) : normalizeStyle(item);
      if (normalized) {
        for (const key in normalized) {
          res[key] = normalized[key];
        }
      }
    }
    return res;
  } else if (isString(value) || isObject(value)) {
    return value;
  }
}
const listDelimiterRE = /;(?![^(]*\))/g;
const propertyDelimiterRE = /:([^]+)/;
const styleCommentRE = /\/\*[^]*?\*\//g;
function parseStringStyle(cssText) {
  const ret = {};
  cssText.replace(styleCommentRE, "").split(listDelimiterRE).forEach((item) => {
    if (item) {
      const tmp = item.split(propertyDelimiterRE);
      tmp.length > 1 && (ret[tmp[0].trim()] = tmp[1].trim());
    }
  });
  return ret;
}
function stringifyStyle(styles) {
  if (!styles) return "";
  if (isString(styles)) return styles;
  let ret = "";
  for (const key in styles) {
    const value = styles[key];
    if (isString(value) || typeof value === "number") {
      const normalizedKey = key.startsWith(`--`) ? key : hyphenate(key);
      ret += `${normalizedKey}:${value};`;
    }
  }
  return ret;
}
function normalizeClass(value) {
  let res = "";
  if (isString(value)) {
    res = value;
  } else if (isArray(value)) {
    for (let i = 0; i < value.length; i++) {
      const normalized = normalizeClass(value[i]);
      if (normalized) {
        res += normalized + " ";
      }
    }
  } else if (isObject(value)) {
    for (const name in value) {
      if (value[name]) {
        res += name + " ";
      }
    }
  }
  return res.trim();
}

const HTML_TAGS = "html,body,base,head,link,meta,style,title,address,article,aside,footer,header,hgroup,h1,h2,h3,h4,h5,h6,nav,section,div,dd,dl,dt,figcaption,figure,picture,hr,img,li,main,ol,p,pre,ul,a,b,abbr,bdi,bdo,br,cite,code,data,dfn,em,i,kbd,mark,q,rp,rt,ruby,s,samp,small,span,strong,sub,sup,time,u,var,wbr,area,audio,map,track,video,embed,object,param,source,canvas,script,noscript,del,ins,caption,col,colgroup,table,thead,tbody,td,th,tr,button,datalist,fieldset,form,input,label,legend,meter,optgroup,option,output,progress,select,textarea,details,dialog,menu,summary,template,blockquote,iframe,tfoot";
const SVG_TAGS = "svg,animate,animateMotion,animateTransform,circle,clipPath,color-profile,defs,desc,discard,ellipse,feBlend,feColorMatrix,feComponentTransfer,feComposite,feConvolveMatrix,feDiffuseLighting,feDisplacementMap,feDistantLight,feDropShadow,feFlood,feFuncA,feFuncB,feFuncG,feFuncR,feGaussianBlur,feImage,feMerge,feMergeNode,feMorphology,feOffset,fePointLight,feSpecularLighting,feSpotLight,feTile,feTurbulence,filter,foreignObject,g,hatch,hatchpath,image,line,linearGradient,marker,mask,mesh,meshgradient,meshpatch,meshrow,metadata,mpath,path,pattern,polygon,polyline,radialGradient,rect,set,solidcolor,stop,switch,symbol,text,textPath,title,tspan,unknown,use,view";
const MATH_TAGS = "annotation,annotation-xml,maction,maligngroup,malignmark,math,menclose,merror,mfenced,mfrac,mfraction,mglyph,mi,mlabeledtr,mlongdiv,mmultiscripts,mn,mo,mover,mpadded,mphantom,mprescripts,mroot,mrow,ms,mscarries,mscarry,msgroup,msline,mspace,msqrt,msrow,mstack,mstyle,msub,msubsup,msup,mtable,mtd,mtext,mtr,munder,munderover,none,semantics";
const VOID_TAGS = "area,base,br,col,embed,hr,img,input,link,meta,param,source,track,wbr";
const isHTMLTag = /* @__PURE__ */ makeMap(HTML_TAGS);
const isSVGTag = /* @__PURE__ */ makeMap(SVG_TAGS);
const isMathMLTag = /* @__PURE__ */ makeMap(MATH_TAGS);
const isVoidTag = /* @__PURE__ */ makeMap(VOID_TAGS);

const specialBooleanAttrs = `itemscope,allowfullscreen,formnovalidate,ismap,nomodule,novalidate,readonly`;
const isSpecialBooleanAttr = /* @__PURE__ */ makeMap(specialBooleanAttrs);
const isBooleanAttr = /* @__PURE__ */ makeMap(
  specialBooleanAttrs + `,async,autofocus,autoplay,controls,default,defer,disabled,inert,loop,open,required,reversed,scoped,seamless,checked,muted,multiple,selected`
);
function includeBooleanAttr(value) {
  return !!value || value === "";
}
const unsafeAttrCharRE = /[>/="'\u0009\u000a\u000c\u000d\u0020]/;
const attrValidationCache = {};
function isSSRSafeAttrName(name) {
  if (attrValidationCache.hasOwnProperty(name)) {
    return attrValidationCache[name];
  }
  const isUnsafe = unsafeAttrCharRE.test(name);
  if (isUnsafe) {
    console.error(`unsafe attribute name: ${name}`);
  }
  return attrValidationCache[name] = !isUnsafe;
}
const propsToAttrMap = {
  acceptCharset: "accept-charset",
  className: "class",
  htmlFor: "for",
  httpEquiv: "http-equiv"
};
function isRenderableAttrValue(value) {
  if (value == null) {
    return false;
  }
  const type = typeof value;
  return type === "string" || type === "number" || type === "boolean";
}

const escapeRE = /["'&<>]/;
function escapeHtml(string) {
  const str = "" + string;
  const match = escapeRE.exec(str);
  if (!match) {
    return str;
  }
  let html = "";
  let escaped;
  let index;
  let lastIndex = 0;
  for (index = match.index; index < str.length; index++) {
    switch (str.charCodeAt(index)) {
      case 34:
        escaped = "&quot;";
        break;
      case 38:
        escaped = "&amp;";
        break;
      case 39:
        escaped = "&#39;";
        break;
      case 60:
        escaped = "&lt;";
        break;
      case 62:
        escaped = "&gt;";
        break;
      default:
        continue;
    }
    if (lastIndex !== index) {
      html += str.slice(lastIndex, index);
    }
    lastIndex = index + 1;
    html += escaped;
  }
  return lastIndex !== index ? html + str.slice(lastIndex, index) : html;
}
const commentStripRE = /^(?:-?>)+|<!--|-->|--!>|<!-$/g;
function escapeHtmlComment(src) {
  let prev;
  do {
    prev = src;
    src = src.replace(commentStripRE, "");
  } while (src !== prev);
  return src;
}

function looseCompareArrays(a, b) {
  if (a.length !== b.length) return false;
  let equal = true;
  for (let i = 0; equal && i < a.length; i++) {
    equal = looseEqual(a[i], b[i]);
  }
  return equal;
}
function looseCompareCollections(a, b) {
  if (a.size !== b.size) return false;
  const candidates = Array.from(b);
  const matched = new Uint8Array(candidates.length);
  for (const item of a) {
    let index = -1;
    for (let i = 0; i < candidates.length; i++) {
      if (!matched[i] && looseEqual(item, candidates[i])) {
        index = i;
        break;
      }
    }
    if (index < 0) return false;
    matched[index] = 1;
  }
  return true;
}
function looseEqual(a, b) {
  if (a === b) return true;
  let aValidType = isDate(a);
  let bValidType = isDate(b);
  if (aValidType || bValidType) {
    return aValidType && bValidType ? a.getTime() === b.getTime() : false;
  }
  aValidType = isSymbol(a);
  bValidType = isSymbol(b);
  if (aValidType || bValidType) {
    return a === b;
  }
  aValidType = isArray(a);
  bValidType = isArray(b);
  if (aValidType || bValidType) {
    return aValidType && bValidType ? looseCompareArrays(a, b) : false;
  }
  aValidType = isObject(a);
  bValidType = isObject(b);
  if (aValidType || bValidType) {
    if (!aValidType || !bValidType) {
      return false;
    }
    aValidType = isMap(a);
    bValidType = isMap(b);
    if (aValidType || bValidType) {
      return aValidType && bValidType ? looseCompareCollections(a, b) : false;
    }
    aValidType = isSet(a);
    bValidType = isSet(b);
    if (aValidType || bValidType) {
      return aValidType && bValidType ? looseCompareCollections(a, b) : false;
    }
    const aKeysCount = Object.keys(a).length;
    const bKeysCount = Object.keys(b).length;
    if (aKeysCount !== bKeysCount) {
      return false;
    }
    for (const key in a) {
      const aHasKey = a.hasOwnProperty(key);
      const bHasKey = b.hasOwnProperty(key);
      if (aHasKey && !bHasKey || !aHasKey && bHasKey || !looseEqual(a[key], b[key])) {
        return false;
      }
    }
  }
  return String(a) === String(b);
}
function looseIndexOf(arr, val) {
  return arr.findIndex((item) => looseEqual(item, val));
}

function normalizeCssVarValue(value) {
  if (value == null) {
    return "initial";
  }
  if (typeof value === "string") {
    return value === "" ? " " : value;
  }
  if (typeof value !== "number" || !Number.isFinite(value)) {
    {
      console.warn(
        "[Vue warn] Invalid value used for CSS binding. Expected a string or a finite number but received:",
        value
      );
    }
  }
  return String(value);
}

/**
* @vue/compiler-core v3.5.42
* (c) 2018-present Yuxi (Evan) You and Vue contributors
* @license MIT
**/

const FRAGMENT = /* @__PURE__ */ Symbol(`Fragment` );
const TELEPORT = /* @__PURE__ */ Symbol(`Teleport` );
const SUSPENSE = /* @__PURE__ */ Symbol(`Suspense` );
const KEEP_ALIVE = /* @__PURE__ */ Symbol(`KeepAlive` );
const BASE_TRANSITION = /* @__PURE__ */ Symbol(
  `BaseTransition` 
);
const OPEN_BLOCK = /* @__PURE__ */ Symbol(`openBlock` );
const CREATE_BLOCK = /* @__PURE__ */ Symbol(`createBlock` );
const CREATE_ELEMENT_BLOCK = /* @__PURE__ */ Symbol(
  `createElementBlock` 
);
const CREATE_VNODE = /* @__PURE__ */ Symbol(`createVNode` );
const CREATE_ELEMENT_VNODE = /* @__PURE__ */ Symbol(
  `createElementVNode` 
);
const CREATE_COMMENT = /* @__PURE__ */ Symbol(
  `createCommentVNode` 
);
const CREATE_TEXT = /* @__PURE__ */ Symbol(
  `createTextVNode` 
);
const CREATE_STATIC = /* @__PURE__ */ Symbol(
  `createStaticVNode` 
);
const RESOLVE_COMPONENT = /* @__PURE__ */ Symbol(
  `resolveComponent` 
);
const RESOLVE_DYNAMIC_COMPONENT = /* @__PURE__ */ Symbol(
  `resolveDynamicComponent` 
);
const RESOLVE_DIRECTIVE = /* @__PURE__ */ Symbol(
  `resolveDirective` 
);
const RESOLVE_FILTER = /* @__PURE__ */ Symbol(
  `resolveFilter` 
);
const WITH_DIRECTIVES = /* @__PURE__ */ Symbol(
  `withDirectives` 
);
const RENDER_LIST = /* @__PURE__ */ Symbol(`renderList` );
const RENDER_SLOT = /* @__PURE__ */ Symbol(`renderSlot` );
const CREATE_SLOTS = /* @__PURE__ */ Symbol(`createSlots` );
const TO_DISPLAY_STRING = /* @__PURE__ */ Symbol(
  `toDisplayString` 
);
const MERGE_PROPS = /* @__PURE__ */ Symbol(`mergeProps` );
const NORMALIZE_CLASS = /* @__PURE__ */ Symbol(
  `normalizeClass` 
);
const NORMALIZE_STYLE = /* @__PURE__ */ Symbol(
  `normalizeStyle` 
);
const NORMALIZE_PROPS = /* @__PURE__ */ Symbol(
  `normalizeProps` 
);
const GUARD_REACTIVE_PROPS = /* @__PURE__ */ Symbol(
  `guardReactiveProps` 
);
const TO_HANDLERS = /* @__PURE__ */ Symbol(`toHandlers` );
const CAMELIZE = /* @__PURE__ */ Symbol(`camelize` );
const CAPITALIZE = /* @__PURE__ */ Symbol(`capitalize` );
const TO_HANDLER_KEY = /* @__PURE__ */ Symbol(
  `toHandlerKey` 
);
const SET_BLOCK_TRACKING = /* @__PURE__ */ Symbol(
  `setBlockTracking` 
);
const PUSH_SCOPE_ID = /* @__PURE__ */ Symbol(`pushScopeId` );
const POP_SCOPE_ID = /* @__PURE__ */ Symbol(`popScopeId` );
const WITH_CTX = /* @__PURE__ */ Symbol(`withCtx` );
const UNREF = /* @__PURE__ */ Symbol(`unref` );
const IS_REF = /* @__PURE__ */ Symbol(`isRef` );
const WITH_MEMO = /* @__PURE__ */ Symbol(`withMemo` );
const IS_MEMO_SAME = /* @__PURE__ */ Symbol(`isMemoSame` );
const helperNameMap = {
  [FRAGMENT]: `Fragment`,
  [TELEPORT]: `Teleport`,
  [SUSPENSE]: `Suspense`,
  [KEEP_ALIVE]: `KeepAlive`,
  [BASE_TRANSITION]: `BaseTransition`,
  [OPEN_BLOCK]: `openBlock`,
  [CREATE_BLOCK]: `createBlock`,
  [CREATE_ELEMENT_BLOCK]: `createElementBlock`,
  [CREATE_VNODE]: `createVNode`,
  [CREATE_ELEMENT_VNODE]: `createElementVNode`,
  [CREATE_COMMENT]: `createCommentVNode`,
  [CREATE_TEXT]: `createTextVNode`,
  [CREATE_STATIC]: `createStaticVNode`,
  [RESOLVE_COMPONENT]: `resolveComponent`,
  [RESOLVE_DYNAMIC_COMPONENT]: `resolveDynamicComponent`,
  [RESOLVE_DIRECTIVE]: `resolveDirective`,
  [RESOLVE_FILTER]: `resolveFilter`,
  [WITH_DIRECTIVES]: `withDirectives`,
  [RENDER_LIST]: `renderList`,
  [RENDER_SLOT]: `renderSlot`,
  [CREATE_SLOTS]: `createSlots`,
  [TO_DISPLAY_STRING]: `toDisplayString`,
  [MERGE_PROPS]: `mergeProps`,
  [NORMALIZE_CLASS]: `normalizeClass`,
  [NORMALIZE_STYLE]: `normalizeStyle`,
  [NORMALIZE_PROPS]: `normalizeProps`,
  [GUARD_REACTIVE_PROPS]: `guardReactiveProps`,
  [TO_HANDLERS]: `toHandlers`,
  [CAMELIZE]: `camelize`,
  [CAPITALIZE]: `capitalize`,
  [TO_HANDLER_KEY]: `toHandlerKey`,
  [SET_BLOCK_TRACKING]: `setBlockTracking`,
  [PUSH_SCOPE_ID]: `pushScopeId`,
  [POP_SCOPE_ID]: `popScopeId`,
  [WITH_CTX]: `withCtx`,
  [UNREF]: `unref`,
  [IS_REF]: `isRef`,
  [WITH_MEMO]: `withMemo`,
  [IS_MEMO_SAME]: `isMemoSame`
};
function registerRuntimeHelpers(helpers) {
  Object.getOwnPropertySymbols(helpers).forEach((s) => {
    helperNameMap[s] = helpers[s];
  });
}
const locStub = {
  start: { line: 1, column: 1, offset: 0 },
  end: { line: 1, column: 1, offset: 0 },
  source: ""
};
function createRoot(children, source = "") {
  return {
    type: 0,
    source,
    children,
    helpers: /* @__PURE__ */ new Set(),
    components: [],
    directives: [],
    hoists: [],
    imports: [],
    cached: [],
    temps: 0,
    codegenNode: void 0,
    loc: locStub
  };
}
function createVNodeCall(context, tag, props, children, patchFlag, dynamicProps, directives, isBlock = false, disableTracking = false, isComponent = false, loc = locStub) {
  if (context) {
    if (isBlock) {
      context.helper(OPEN_BLOCK);
      context.helper(getVNodeBlockHelper(context.inSSR, isComponent));
    } else {
      context.helper(getVNodeHelper(context.inSSR, isComponent));
    }
    if (directives) {
      context.helper(WITH_DIRECTIVES);
    }
  }
  return {
    type: 13,
    tag,
    props,
    children,
    patchFlag,
    dynamicProps,
    directives,
    isBlock,
    disableTracking,
    isComponent,
    loc
  };
}
function createArrayExpression(elements, loc = locStub) {
  return {
    type: 17,
    loc,
    elements
  };
}
function createObjectExpression(properties, loc = locStub) {
  return {
    type: 15,
    loc,
    properties
  };
}
function createObjectProperty(key, value) {
  return {
    type: 16,
    loc: locStub,
    key: isString(key) ? createSimpleExpression(key, true) : key,
    value
  };
}
function createSimpleExpression(content, isStatic = false, loc = locStub, constType = 0) {
  return {
    type: 4,
    loc,
    content,
    isStatic,
    constType: isStatic ? 3 : constType
  };
}
function createCompoundExpression(children, loc = locStub) {
  return {
    type: 8,
    loc,
    children
  };
}
function createCallExpression(callee, args = [], loc = locStub) {
  return {
    type: 14,
    loc,
    callee,
    arguments: args
  };
}
function createFunctionExpression(params, returns = void 0, newline = false, isSlot = false, loc = locStub) {
  return {
    type: 18,
    params,
    returns,
    newline,
    isSlot,
    loc
  };
}
function createConditionalExpression(test, consequent, alternate, newline = true) {
  return {
    type: 19,
    test,
    consequent,
    alternate,
    newline,
    loc: locStub
  };
}
function createCacheExpression(index, value, needPauseTracking = false, inVOnce = false) {
  return {
    type: 20,
    index,
    value,
    needPauseTracking,
    inVOnce,
    needArraySpread: false,
    loc: locStub
  };
}
function createBlockStatement(body) {
  return {
    type: 21,
    body,
    loc: locStub
  };
}
function getVNodeHelper(ssr, isComponent) {
  return ssr || isComponent ? CREATE_VNODE : CREATE_ELEMENT_VNODE;
}
function getVNodeBlockHelper(ssr, isComponent) {
  return ssr || isComponent ? CREATE_BLOCK : CREATE_ELEMENT_BLOCK;
}
function convertToBlock(node, { helper, removeHelper, inSSR }) {
  if (!node.isBlock) {
    node.isBlock = true;
    removeHelper(getVNodeHelper(inSSR, node.isComponent));
    helper(OPEN_BLOCK);
    helper(getVNodeBlockHelper(inSSR, node.isComponent));
  }
}

const defaultDelimitersOpen = new Uint8Array([123, 123]);
const defaultDelimitersClose = new Uint8Array([125, 125]);
function isTagStartChar(c) {
  return c >= 97 && c <= 122 || c >= 65 && c <= 90;
}
function isWhitespace(c) {
  return c === 32 || c === 10 || c === 9 || c === 12 || c === 13;
}
function isEndOfTagSection(c) {
  return c === 47 || c === 62 || isWhitespace(c);
}
function toCharCodes(str) {
  const ret = new Uint8Array(str.length);
  for (let i = 0; i < str.length; i++) {
    ret[i] = str.charCodeAt(i);
  }
  return ret;
}
const Sequences = {
  Cdata: new Uint8Array([67, 68, 65, 84, 65, 91]),
  // CDATA[
  CdataEnd: new Uint8Array([93, 93, 62]),
  // ]]>
  CommentEnd: new Uint8Array([45, 45, 62]),
  // `-->`
  ScriptEnd: new Uint8Array([60, 47, 115, 99, 114, 105, 112, 116]),
  // `<\/script`
  StyleEnd: new Uint8Array([60, 47, 115, 116, 121, 108, 101]),
  // `</style`
  TitleEnd: new Uint8Array([60, 47, 116, 105, 116, 108, 101]),
  // `</title`
  TextareaEnd: new Uint8Array([
    60,
    47,
    116,
    101,
    120,
    116,
    97,
    114,
    101,
    97
  ])
  // `</textarea
};
class Tokenizer {
  constructor(stack, cbs) {
    this.stack = stack;
    this.cbs = cbs;
    /** The current state the tokenizer is in. */
    this.state = 1;
    /** The read buffer. */
    this.buffer = "";
    /** The beginning of the section that is currently being read. */
    this.sectionStart = 0;
    /** The index within the buffer that we are currently looking at. */
    this.index = 0;
    /** The start of the last entity. */
    this.entityStart = 0;
    /** Some behavior, eg. when decoding entities, is done while we are in another state. This keeps track of the other state type. */
    this.baseState = 1;
    /** For special parsing behavior inside of script and style tags. */
    this.inRCDATA = false;
    /** For disabling RCDATA tags handling */
    this.inXML = false;
    /** For disabling interpolation parsing in v-pre */
    this.inVPre = false;
    /** Record newline positions for fast line / column calculation */
    this.newlines = [];
    this.mode = 0;
    this.delimiterOpen = defaultDelimitersOpen;
    this.delimiterClose = defaultDelimitersClose;
    this.delimiterIndex = -1;
    this.currentSequence = void 0;
    this.sequenceIndex = 0;
  }
  get inSFCRoot() {
    return this.mode === 2 && this.stack.length === 0;
  }
  reset() {
    this.state = 1;
    this.mode = 0;
    this.buffer = "";
    this.sectionStart = 0;
    this.index = 0;
    this.baseState = 1;
    this.inRCDATA = false;
    this.currentSequence = void 0;
    this.newlines.length = 0;
    this.delimiterOpen = defaultDelimitersOpen;
    this.delimiterClose = defaultDelimitersClose;
  }
  /**
   * Generate Position object with line / column information using recorded
   * newline positions. We know the index is always going to be an already
   * processed index, so all the newlines up to this index should have been
   * recorded.
   */
  getPos(index) {
    let line = 1;
    let column = index + 1;
    const length = this.newlines.length;
    let j = -1;
    if (length > 100) {
      let l = -1;
      let r = length;
      while (l + 1 < r) {
        const m = l + r >>> 1;
        this.newlines[m] < index ? l = m : r = m;
      }
      j = l;
    } else {
      for (let i = length - 1; i >= 0; i--) {
        if (index > this.newlines[i]) {
          j = i;
          break;
        }
      }
    }
    if (j >= 0) {
      line = j + 2;
      column = index - this.newlines[j];
    }
    return {
      column,
      line,
      offset: index
    };
  }
  peek() {
    return this.buffer.charCodeAt(this.index + 1);
  }
  stateText(c) {
    if (c === 60) {
      if (this.index > this.sectionStart) {
        this.cbs.ontext(this.sectionStart, this.index);
      }
      this.state = 5;
      this.sectionStart = this.index;
    } else if (!this.inVPre && c === this.delimiterOpen[0]) {
      this.state = 2;
      this.delimiterIndex = 0;
      this.stateInterpolationOpen(c);
    }
  }
  stateInterpolationOpen(c) {
    if (c === this.delimiterOpen[this.delimiterIndex]) {
      if (this.delimiterIndex === this.delimiterOpen.length - 1) {
        const start = this.index + 1 - this.delimiterOpen.length;
        if (start > this.sectionStart) {
          this.cbs.ontext(this.sectionStart, start);
        }
        this.state = 3;
        this.sectionStart = start;
      } else {
        this.delimiterIndex++;
      }
    } else if (this.inRCDATA) {
      this.state = 32;
      this.stateInRCDATA(c);
    } else {
      this.state = 1;
      this.stateText(c);
    }
  }
  stateInterpolation(c) {
    if (c === this.delimiterClose[0]) {
      this.state = 4;
      this.delimiterIndex = 0;
      this.stateInterpolationClose(c);
    }
  }
  stateInterpolationClose(c) {
    if (c === this.delimiterClose[this.delimiterIndex]) {
      if (this.delimiterIndex === this.delimiterClose.length - 1) {
        this.cbs.oninterpolation(this.sectionStart, this.index + 1);
        if (this.inRCDATA) {
          this.state = 32;
        } else {
          this.state = 1;
        }
        this.sectionStart = this.index + 1;
      } else {
        this.delimiterIndex++;
      }
    } else {
      this.state = 3;
      this.stateInterpolation(c);
    }
  }
  stateSpecialStartSequence(c) {
    const isEnd = this.sequenceIndex === this.currentSequence.length;
    const isMatch = isEnd ? (
      // If we are at the end of the sequence, make sure the tag name has ended
      isEndOfTagSection(c)
    ) : (
      // Otherwise, do a case-insensitive comparison
      (c | 32) === this.currentSequence[this.sequenceIndex]
    );
    if (!isMatch) {
      this.inRCDATA = false;
    } else if (!isEnd) {
      this.sequenceIndex++;
      return;
    }
    this.sequenceIndex = 0;
    this.state = 6;
    this.stateInTagName(c);
  }
  /** Look for an end tag. For <title> and <textarea>, also decode entities. */
  stateInRCDATA(c) {
    if (this.sequenceIndex === this.currentSequence.length) {
      if (c === 62 || isWhitespace(c)) {
        const endOfText = this.index - this.currentSequence.length;
        if (this.sectionStart < endOfText) {
          const actualIndex = this.index;
          this.index = endOfText;
          this.cbs.ontext(this.sectionStart, endOfText);
          this.index = actualIndex;
        }
        this.sectionStart = endOfText + 2;
        this.stateInClosingTagName(c);
        this.inRCDATA = false;
        return;
      }
      this.sequenceIndex = 0;
    }
    if ((c | 32) === this.currentSequence[this.sequenceIndex]) {
      this.sequenceIndex += 1;
    } else if (this.sequenceIndex === 0) {
      if (this.currentSequence === Sequences.TitleEnd || this.currentSequence === Sequences.TextareaEnd && !this.inSFCRoot) {
        if (!this.inVPre && c === this.delimiterOpen[0]) {
          this.state = 2;
          this.delimiterIndex = 0;
          this.stateInterpolationOpen(c);
        }
      } else if (this.fastForwardTo(60)) {
        this.sequenceIndex = 1;
      }
    } else {
      this.sequenceIndex = Number(c === 60);
    }
  }
  stateCDATASequence(c) {
    if (c === Sequences.Cdata[this.sequenceIndex]) {
      if (++this.sequenceIndex === Sequences.Cdata.length) {
        this.state = 28;
        this.currentSequence = Sequences.CdataEnd;
        this.sequenceIndex = 0;
        this.sectionStart = this.index + 1;
      }
    } else {
      this.sequenceIndex = 0;
      this.state = 23;
      this.stateInDeclaration(c);
    }
  }
  /**
   * When we wait for one specific character, we can speed things up
   * by skipping through the buffer until we find it.
   *
   * @returns Whether the character was found.
   */
  fastForwardTo(c) {
    while (++this.index < this.buffer.length) {
      const cc = this.buffer.charCodeAt(this.index);
      if (cc === 10) {
        this.newlines.push(this.index);
      }
      if (cc === c) {
        return true;
      }
    }
    this.index = this.buffer.length - 1;
    return false;
  }
  /**
   * Comments and CDATA end with `-->` and `]]>`.
   *
   * Their common qualities are:
   * - Their end sequences have a distinct character they start with.
   * - That character is then repeated, so we have to check multiple repeats.
   * - All characters but the start character of the sequence can be skipped.
   */
  stateInCommentLike(c) {
    if (c === this.currentSequence[this.sequenceIndex]) {
      if (++this.sequenceIndex === this.currentSequence.length) {
        if (this.currentSequence === Sequences.CdataEnd) {
          this.cbs.oncdata(this.sectionStart, this.index - 2);
        } else {
          this.cbs.oncomment(this.sectionStart, this.index - 2);
        }
        this.sequenceIndex = 0;
        this.sectionStart = this.index + 1;
        this.state = 1;
      }
    } else if (this.sequenceIndex === 0) {
      if (this.fastForwardTo(this.currentSequence[0])) {
        this.sequenceIndex = 1;
      }
    } else if (c !== this.currentSequence[this.sequenceIndex - 1]) {
      this.sequenceIndex = 0;
    }
  }
  startSpecial(sequence, offset) {
    this.enterRCDATA(sequence, offset);
    this.state = 31;
  }
  enterRCDATA(sequence, offset) {
    this.inRCDATA = true;
    this.currentSequence = sequence;
    this.sequenceIndex = offset;
  }
  stateBeforeTagName(c) {
    if (c === 33) {
      this.state = 22;
      this.sectionStart = this.index + 1;
    } else if (c === 63) {
      this.state = 24;
      this.sectionStart = this.index + 1;
    } else if (isTagStartChar(c)) {
      this.sectionStart = this.index;
      if (this.mode === 0) {
        this.state = 6;
      } else if (this.inSFCRoot) {
        this.state = 34;
      } else if (!this.inXML) {
        if (c === 116) {
          this.state = 30;
        } else {
          this.state = c === 115 ? 29 : 6;
        }
      } else {
        this.state = 6;
      }
    } else if (c === 47) {
      this.state = 8;
    } else {
      this.state = 1;
      this.stateText(c);
    }
  }
  stateInTagName(c) {
    if (isEndOfTagSection(c)) {
      this.handleTagName(c);
    }
  }
  stateInSFCRootTagName(c) {
    if (isEndOfTagSection(c)) {
      const tag = this.buffer.slice(this.sectionStart, this.index);
      if (tag !== "template") {
        this.enterRCDATA(toCharCodes(`</` + tag), 0);
      }
      this.handleTagName(c);
    }
  }
  handleTagName(c) {
    this.cbs.onopentagname(this.sectionStart, this.index);
    this.sectionStart = -1;
    this.state = 11;
    this.stateBeforeAttrName(c);
  }
  stateBeforeClosingTagName(c) {
    if (isWhitespace(c)) ; else if (c === 62) {
      {
        this.cbs.onerr(14, this.index);
      }
      this.state = 1;
      this.sectionStart = this.index + 1;
    } else {
      this.state = isTagStartChar(c) ? 9 : 27;
      this.sectionStart = this.index;
    }
  }
  stateInClosingTagName(c) {
    if (c === 62 || isWhitespace(c)) {
      this.cbs.onclosetag(this.sectionStart, this.index);
      this.sectionStart = -1;
      this.state = 10;
      this.stateAfterClosingTagName(c);
    }
  }
  stateAfterClosingTagName(c) {
    if (c === 62) {
      this.state = 1;
      this.sectionStart = this.index + 1;
    }
  }
  stateBeforeAttrName(c) {
    if (c === 62) {
      this.cbs.onopentagend(this.index);
      if (this.inRCDATA) {
        this.state = 32;
      } else {
        this.state = 1;
      }
      this.sectionStart = this.index + 1;
    } else if (c === 47) {
      this.state = 7;
      if (this.peek() !== 62) {
        this.cbs.onerr(22, this.index);
      }
    } else if (c === 60 && this.peek() === 47) {
      this.cbs.onopentagend(this.index);
      this.state = 5;
      this.sectionStart = this.index;
    } else if (!isWhitespace(c)) {
      if (c === 61) {
        this.cbs.onerr(
          19,
          this.index
        );
      }
      this.handleAttrStart(c);
    }
  }
  handleAttrStart(c) {
    if (c === 118 && this.peek() === 45) {
      this.state = 13;
      this.sectionStart = this.index;
    } else if (c === 46 || c === 58 || c === 64 || c === 35) {
      this.cbs.ondirname(this.index, this.index + 1);
      this.state = 14;
      this.sectionStart = this.index + 1;
    } else {
      this.state = 12;
      this.sectionStart = this.index;
    }
  }
  stateInSelfClosingTag(c) {
    if (c === 62) {
      this.cbs.onselfclosingtag(this.index);
      this.state = 1;
      this.sectionStart = this.index + 1;
      this.inRCDATA = false;
    } else if (!isWhitespace(c)) {
      this.state = 11;
      this.stateBeforeAttrName(c);
    }
  }
  stateInAttrName(c) {
    if (c === 61 || isEndOfTagSection(c)) {
      this.cbs.onattribname(this.sectionStart, this.index);
      this.handleAttrNameEnd(c);
    } else if ((c === 34 || c === 39 || c === 60)) {
      this.cbs.onerr(
        17,
        this.index
      );
    }
  }
  stateInDirName(c) {
    if (c === 61 || isEndOfTagSection(c)) {
      this.cbs.ondirname(this.sectionStart, this.index);
      this.handleAttrNameEnd(c);
    } else if (c === 58) {
      this.cbs.ondirname(this.sectionStart, this.index);
      this.state = 14;
      this.sectionStart = this.index + 1;
    } else if (c === 46) {
      this.cbs.ondirname(this.sectionStart, this.index);
      this.state = 16;
      this.sectionStart = this.index + 1;
    }
  }
  stateInDirArg(c) {
    if (c === 61 || isEndOfTagSection(c)) {
      this.cbs.ondirarg(this.sectionStart, this.index);
      this.handleAttrNameEnd(c);
    } else if (c === 91) {
      this.state = 15;
    } else if (c === 46) {
      this.cbs.ondirarg(this.sectionStart, this.index);
      this.state = 16;
      this.sectionStart = this.index + 1;
    }
  }
  stateInDynamicDirArg(c) {
    if (c === 93) {
      this.state = 14;
    } else if (c === 61 || isEndOfTagSection(c)) {
      this.cbs.ondirarg(this.sectionStart, this.index + 1);
      this.handleAttrNameEnd(c);
      {
        this.cbs.onerr(
          27,
          this.index
        );
      }
    }
  }
  stateInDirModifier(c) {
    if (c === 61 || isEndOfTagSection(c)) {
      this.cbs.ondirmodifier(this.sectionStart, this.index);
      this.handleAttrNameEnd(c);
    } else if (c === 46) {
      this.cbs.ondirmodifier(this.sectionStart, this.index);
      this.sectionStart = this.index + 1;
    }
  }
  handleAttrNameEnd(c) {
    this.sectionStart = this.index;
    this.state = 17;
    this.cbs.onattribnameend(this.index);
    this.stateAfterAttrName(c);
  }
  stateAfterAttrName(c) {
    if (c === 61) {
      this.state = 18;
    } else if (c === 47 || c === 62) {
      this.cbs.onattribend(0, this.sectionStart);
      this.sectionStart = -1;
      this.state = 11;
      this.stateBeforeAttrName(c);
    } else if (!isWhitespace(c)) {
      this.cbs.onattribend(0, this.sectionStart);
      this.handleAttrStart(c);
    }
  }
  stateBeforeAttrValue(c) {
    if (c === 34) {
      this.state = 19;
      this.sectionStart = this.index + 1;
    } else if (c === 39) {
      this.state = 20;
      this.sectionStart = this.index + 1;
    } else if (!isWhitespace(c)) {
      this.sectionStart = this.index;
      this.state = 21;
      this.stateInAttrValueNoQuotes(c);
    }
  }
  handleInAttrValue(c, quote) {
    if (c === quote || this.fastForwardTo(quote)) {
      this.cbs.onattribdata(this.sectionStart, this.index);
      this.sectionStart = -1;
      this.cbs.onattribend(
        quote === 34 ? 3 : 2,
        this.index + 1
      );
      this.state = 11;
    }
  }
  stateInAttrValueDoubleQuotes(c) {
    this.handleInAttrValue(c, 34);
  }
  stateInAttrValueSingleQuotes(c) {
    this.handleInAttrValue(c, 39);
  }
  stateInAttrValueNoQuotes(c) {
    if (isWhitespace(c) || c === 62) {
      this.cbs.onattribdata(this.sectionStart, this.index);
      this.sectionStart = -1;
      this.cbs.onattribend(1, this.index);
      this.state = 11;
      this.stateBeforeAttrName(c);
    } else if (c === 34 || c === 39 || c === 60 || c === 61 || c === 96) {
      this.cbs.onerr(
        18,
        this.index
      );
    } else ;
  }
  stateBeforeDeclaration(c) {
    if (c === 91) {
      this.state = 26;
      this.sequenceIndex = 0;
    } else {
      this.state = c === 45 ? 25 : 23;
    }
  }
  stateInDeclaration(c) {
    if (c === 62 || this.fastForwardTo(62)) {
      this.state = 1;
      this.sectionStart = this.index + 1;
    }
  }
  stateInProcessingInstruction(c) {
    if (c === 62 || this.fastForwardTo(62)) {
      this.cbs.onprocessinginstruction(this.sectionStart, this.index);
      this.state = 1;
      this.sectionStart = this.index + 1;
    }
  }
  stateBeforeComment(c) {
    if (c === 45) {
      this.state = 28;
      this.currentSequence = Sequences.CommentEnd;
      this.sequenceIndex = 2;
      this.sectionStart = this.index + 1;
    } else {
      this.state = 23;
    }
  }
  stateInSpecialComment(c) {
    if (c === 62 || this.fastForwardTo(62)) {
      this.cbs.oncomment(this.sectionStart, this.index);
      this.state = 1;
      this.sectionStart = this.index + 1;
    }
  }
  stateBeforeSpecialS(c) {
    if (c === Sequences.ScriptEnd[3]) {
      this.startSpecial(Sequences.ScriptEnd, 4);
    } else if (c === Sequences.StyleEnd[3]) {
      this.startSpecial(Sequences.StyleEnd, 4);
    } else {
      this.state = 6;
      this.stateInTagName(c);
    }
  }
  stateBeforeSpecialT(c) {
    if (c === Sequences.TitleEnd[3]) {
      this.startSpecial(Sequences.TitleEnd, 4);
    } else if (c === Sequences.TextareaEnd[3]) {
      this.startSpecial(Sequences.TextareaEnd, 4);
    } else {
      this.state = 6;
      this.stateInTagName(c);
    }
  }
  startEntity() {
  }
  stateInEntity() {
  }
  /**
   * Iterates through the buffer, calling the function corresponding to the current state.
   *
   * States that are more likely to be hit are higher up, as a performance improvement.
   */
  parse(input) {
    this.buffer = input;
    while (this.index < this.buffer.length) {
      const c = this.buffer.charCodeAt(this.index);
      if (c === 10 && this.state !== 33) {
        this.newlines.push(this.index);
      }
      switch (this.state) {
        case 1: {
          this.stateText(c);
          break;
        }
        case 2: {
          this.stateInterpolationOpen(c);
          break;
        }
        case 3: {
          this.stateInterpolation(c);
          break;
        }
        case 4: {
          this.stateInterpolationClose(c);
          break;
        }
        case 31: {
          this.stateSpecialStartSequence(c);
          break;
        }
        case 32: {
          this.stateInRCDATA(c);
          break;
        }
        case 26: {
          this.stateCDATASequence(c);
          break;
        }
        case 19: {
          this.stateInAttrValueDoubleQuotes(c);
          break;
        }
        case 12: {
          this.stateInAttrName(c);
          break;
        }
        case 13: {
          this.stateInDirName(c);
          break;
        }
        case 14: {
          this.stateInDirArg(c);
          break;
        }
        case 15: {
          this.stateInDynamicDirArg(c);
          break;
        }
        case 16: {
          this.stateInDirModifier(c);
          break;
        }
        case 28: {
          this.stateInCommentLike(c);
          break;
        }
        case 27: {
          this.stateInSpecialComment(c);
          break;
        }
        case 11: {
          this.stateBeforeAttrName(c);
          break;
        }
        case 6: {
          this.stateInTagName(c);
          break;
        }
        case 34: {
          this.stateInSFCRootTagName(c);
          break;
        }
        case 9: {
          this.stateInClosingTagName(c);
          break;
        }
        case 5: {
          this.stateBeforeTagName(c);
          break;
        }
        case 17: {
          this.stateAfterAttrName(c);
          break;
        }
        case 20: {
          this.stateInAttrValueSingleQuotes(c);
          break;
        }
        case 18: {
          this.stateBeforeAttrValue(c);
          break;
        }
        case 8: {
          this.stateBeforeClosingTagName(c);
          break;
        }
        case 10: {
          this.stateAfterClosingTagName(c);
          break;
        }
        case 29: {
          this.stateBeforeSpecialS(c);
          break;
        }
        case 30: {
          this.stateBeforeSpecialT(c);
          break;
        }
        case 21: {
          this.stateInAttrValueNoQuotes(c);
          break;
        }
        case 7: {
          this.stateInSelfClosingTag(c);
          break;
        }
        case 23: {
          this.stateInDeclaration(c);
          break;
        }
        case 22: {
          this.stateBeforeDeclaration(c);
          break;
        }
        case 25: {
          this.stateBeforeComment(c);
          break;
        }
        case 24: {
          this.stateInProcessingInstruction(c);
          break;
        }
        case 33: {
          this.stateInEntity();
          break;
        }
      }
      this.index++;
    }
    this.cleanup();
    this.finish();
  }
  /**
   * Remove data that has already been consumed from the buffer.
   */
  cleanup() {
    if (this.sectionStart !== this.index) {
      if (this.state === 1 || this.state === 32 && this.sequenceIndex === 0) {
        this.cbs.ontext(this.sectionStart, this.index);
        this.sectionStart = this.index;
      } else if (this.state === 19 || this.state === 20 || this.state === 21) {
        this.cbs.onattribdata(this.sectionStart, this.index);
        this.sectionStart = this.index;
      }
    }
  }
  finish() {
    this.handleTrailingData();
    this.cbs.onend();
  }
  /** Handle any trailing data. */
  handleTrailingData() {
    const endIndex = this.buffer.length;
    if (this.sectionStart >= endIndex) {
      return;
    }
    if (this.state === 28) {
      if (this.currentSequence === Sequences.CdataEnd) {
        this.cbs.oncdata(this.sectionStart, endIndex);
      } else {
        this.cbs.oncomment(this.sectionStart, endIndex);
      }
    } else if (this.state === 6 || this.state === 11 || this.state === 18 || this.state === 17 || this.state === 12 || this.state === 13 || this.state === 14 || this.state === 15 || this.state === 16 || this.state === 20 || this.state === 19 || this.state === 21 || this.state === 9) ; else {
      this.cbs.ontext(this.sectionStart, endIndex);
    }
  }
  emitCodePoint(cp, consumed) {
  }
}
const deprecationData = {
  ["COMPILER_IS_ON_ELEMENT"]: {
    message: `Platform-native elements with "is" prop will no longer be treated as components in Vue 3 unless the "is" value is explicitly prefixed with "vue:".`,
    link: `https://v3-migration.vuejs.org/breaking-changes/custom-elements-interop.html`
  },
  ["COMPILER_V_BIND_SYNC"]: {
    message: (key) => `.sync modifier for v-bind has been removed. Use v-model with argument instead. \`v-bind:${key}.sync\` should be changed to \`v-model:${key}\`.`,
    link: `https://v3-migration.vuejs.org/breaking-changes/v-model.html`
  },
  ["COMPILER_V_BIND_OBJECT_ORDER"]: {
    message: `v-bind="obj" usage is now order sensitive and behaves like JavaScript object spread: it will now overwrite an existing non-mergeable attribute that appears before v-bind in the case of conflict. To retain 2.x behavior, move v-bind to make it the first attribute. You can also suppress this warning if the usage is intended.`,
    link: `https://v3-migration.vuejs.org/breaking-changes/v-bind.html`
  },
  ["COMPILER_V_ON_NATIVE"]: {
    message: `.native modifier for v-on has been removed as is no longer necessary.`,
    link: `https://v3-migration.vuejs.org/breaking-changes/v-on-native-modifier-removed.html`
  },
  ["COMPILER_V_IF_V_FOR_PRECEDENCE"]: {
    message: `v-if / v-for precedence when used on the same element has changed in Vue 3: v-if now takes higher precedence and will no longer have access to v-for scope variables. It is best to avoid the ambiguity with <template> tags or use a computed property that filters v-for data source.`,
    link: `https://v3-migration.vuejs.org/breaking-changes/v-if-v-for.html`
  },
  ["COMPILER_NATIVE_TEMPLATE"]: {
    message: `<template> with no special directives will render as a native template element instead of its inner content in Vue 3.`
  },
  ["COMPILER_INLINE_TEMPLATE"]: {
    message: `"inline-template" has been removed in Vue 3.`,
    link: `https://v3-migration.vuejs.org/breaking-changes/inline-template-attribute.html`
  },
  ["COMPILER_FILTERS"]: {
    message: `filters have been removed in Vue 3. The "|" symbol will be treated as native JavaScript bitwise OR operator. Use method calls or computed properties instead.`,
    link: `https://v3-migration.vuejs.org/breaking-changes/filters.html`
  }
};
function getCompatValue(key, { compatConfig }) {
  const value = compatConfig && compatConfig[key];
  if (key === "MODE") {
    return value || 3;
  } else {
    return value;
  }
}
function isCompatEnabled(key, context) {
  const mode = getCompatValue("MODE", context);
  const value = getCompatValue(key, context);
  return mode === 3 ? value === true : value !== false;
}
function checkCompatEnabled(key, context, loc, ...args) {
  const enabled = isCompatEnabled(key, context);
  if (enabled) {
    warnDeprecation(key, context, loc, ...args);
  }
  return enabled;
}
function warnDeprecation(key, context, loc, ...args) {
  const val = getCompatValue(key, context);
  if (val === "suppress-warning") {
    return;
  }
  const { message, link } = deprecationData[key];
  const msg = `(deprecation ${key}) ${typeof message === "function" ? message(...args) : message}${link ? `
  Details: ${link}` : ``}`;
  const err = new SyntaxError(msg);
  err.code = key;
  if (loc) err.loc = loc;
  context.onWarn(err);
}

function defaultOnError(error) {
  throw error;
}
function defaultOnWarn(msg) {
  console.warn(`[Vue warn] ${msg.message}`);
}
function createCompilerError(code, loc, messages, additionalMessage) {
  const msg = (messages || errorMessages)[code] + (additionalMessage || ``) ;
  const error = new SyntaxError(String(msg));
  error.code = code;
  error.loc = loc;
  return error;
}
const errorMessages = {
  // parse errors
  [0]: "Illegal comment.",
  [1]: "CDATA section is allowed only in XML context.",
  [2]: "Duplicate attribute.",
  [3]: "End tag cannot have attributes.",
  [4]: "Illegal '/' in tags.",
  [5]: "Unexpected EOF in tag.",
  [6]: "Unexpected EOF in CDATA section.",
  [7]: "Unexpected EOF in comment.",
  [8]: "Unexpected EOF in script.",
  [9]: "Unexpected EOF in tag.",
  [10]: "Incorrectly closed comment.",
  [11]: "Incorrectly opened comment.",
  [12]: "Illegal tag name. Use '&lt;' to print '<'.",
  [13]: "Attribute value was expected.",
  [14]: "End tag name was expected.",
  [15]: "Whitespace was expected.",
  [16]: "Unexpected '<!--' in comment.",
  [17]: `Attribute name cannot contain U+0022 ("), U+0027 ('), and U+003C (<).`,
  [18]: "Unquoted attribute value cannot contain U+0022 (\"), U+0027 ('), U+003C (<), U+003D (=), and U+0060 (`).",
  [19]: "Attribute name cannot start with '='.",
  [21]: "'<?' is allowed only in XML context.",
  [20]: `Unexpected null character.`,
  [22]: "Illegal '/' in tags.",
  // Vue-specific parse errors
  [23]: "Invalid end tag.",
  [24]: "Element is missing end tag.",
  [25]: "Interpolation end sign was not found.",
  [27]: "End bracket for dynamic directive argument was not found. Note that dynamic directive argument cannot contain spaces.",
  [26]: "Legal directive name was expected.",
  // transform errors
  [28]: `v-if/v-else-if is missing expression.`,
  [29]: `v-if/else branches must use unique keys.`,
  [30]: `v-else/v-else-if has no adjacent v-if or v-else-if.`,
  [31]: `v-for is missing expression.`,
  [32]: `v-for has invalid expression.`,
  [33]: `<template v-for> key should be placed on the <template> tag.`,
  [34]: `v-bind is missing expression.`,
  [53]: `v-bind with same-name shorthand only allows static argument.`,
  [35]: `v-on is missing expression.`,
  [36]: `Unexpected custom directive on <slot> outlet.`,
  [37]: `Mixed v-slot usage on both the component and nested <template>. When there are multiple named slots, all slots should use <template> syntax to avoid scope ambiguity.`,
  [38]: `Duplicate slot names found. `,
  [39]: `Extraneous children found when component already has explicitly named default slot. These children will be ignored.`,
  [40]: `v-slot can only be used on components or <template> tags.`,
  [41]: `v-model is missing expression.`,
  [42]: `v-model value must be a valid JavaScript member expression.`,
  [43]: `v-model cannot be used on v-for or v-slot scope variables because they are not writable.`,
  [44]: `v-model cannot be used on a prop, because local prop bindings are not writable.
Use a v-bind binding combined with a v-on listener that emits update:x event instead.`,
  [45]: `v-model cannot be used on a const binding because it is not writable.`,
  [46]: `Error parsing JavaScript expression: `,
  [47]: `<KeepAlive> expects exactly one child component.`,
  [52]: `@vnode-* hooks in templates are no longer supported. Use the vue: prefix instead. For example, @vnode-mounted should be changed to @vue:mounted. @vnode-* hooks support has been removed in 3.4.`,
  // generic errors
  [48]: `"prefixIdentifiers" option is not supported in this build of compiler.`,
  [49]: `ES module mode is not supported in this build of compiler.`,
  [50]: `"cacheHandlers" option is only supported when the "prefixIdentifiers" option is enabled.`,
  [51]: `"scopeId" option is only supported in module mode.`,
  // just to fulfill types
  [54]: ``
};

const isStaticExp = (p) => p.type === 4 && p.isStatic;
function isCoreComponent(tag) {
  switch (tag) {
    case "Teleport":
    case "teleport":
      return TELEPORT;
    case "Suspense":
    case "suspense":
      return SUSPENSE;
    case "KeepAlive":
    case "keep-alive":
      return KEEP_ALIVE;
    case "BaseTransition":
    case "base-transition":
      return BASE_TRANSITION;
  }
}
const nonIdentifierRE = /^$|^\d|[^\$\w\xA0-\uFFFF]/;
const isSimpleIdentifier = (name) => !nonIdentifierRE.test(name);
const validFirstIdentCharRE = /[A-Za-z_$\xA0-\uFFFF]/;
const validIdentCharRE = /[\.\?\w$\xA0-\uFFFF]/;
const whitespaceRE = /\s+[.[]\s*|\s*[.[]\s+/g;
const getExpSource = (exp) => exp.type === 4 ? exp.content : exp.loc.source;
const isMemberExpressionBrowser = (exp) => {
  const path = getExpSource(exp).trim().replace(whitespaceRE, (s) => s.trim());
  let state = 0 /* inMemberExp */;
  let stateStack = [];
  let currentOpenBracketCount = 0;
  let currentOpenParensCount = 0;
  let currentStringType = null;
  for (let i = 0; i < path.length; i++) {
    const char = path.charAt(i);
    switch (state) {
      case 0 /* inMemberExp */:
        if (char === "[") {
          stateStack.push(state);
          state = 1 /* inBrackets */;
          currentOpenBracketCount++;
        } else if (char === "(") {
          stateStack.push(state);
          state = 2 /* inParens */;
          currentOpenParensCount++;
        } else if (!(i === 0 ? validFirstIdentCharRE : validIdentCharRE).test(char)) {
          return false;
        }
        break;
      case 1 /* inBrackets */:
        if (char === `'` || char === `"` || char === "`") {
          stateStack.push(state);
          state = 3 /* inString */;
          currentStringType = char;
        } else if (char === `[`) {
          currentOpenBracketCount++;
        } else if (char === `]`) {
          if (!--currentOpenBracketCount) {
            state = stateStack.pop();
          }
        }
        break;
      case 2 /* inParens */:
        if (char === `'` || char === `"` || char === "`") {
          stateStack.push(state);
          state = 3 /* inString */;
          currentStringType = char;
        } else if (char === `(`) {
          currentOpenParensCount++;
        } else if (char === `)`) {
          if (i === path.length - 1) {
            return false;
          }
          if (!--currentOpenParensCount) {
            state = stateStack.pop();
          }
        }
        break;
      case 3 /* inString */:
        if (char === currentStringType) {
          state = stateStack.pop();
          currentStringType = null;
        }
        break;
    }
  }
  return !currentOpenBracketCount && !currentOpenParensCount;
};
const isMemberExpression = isMemberExpressionBrowser ;
const fnExpRE = /^\s*(?:async\s*)?(?:\([^)]*?\)|[\w$_]+)\s*(?::[^=]+)?=>|^\s*(?:async\s+)?function(?:\s+[\w$]+)?\s*\(/;
const isFnExpressionBrowser = (exp) => fnExpRE.test(getExpSource(exp));
const isFnExpression = isFnExpressionBrowser ;
function assert(condition, msg) {
  if (!condition) {
    throw new Error(msg || `unexpected compiler condition`);
  }
}
function findDir(node, name, allowEmpty = false) {
  for (let i = 0; i < node.props.length; i++) {
    const p = node.props[i];
    if (p.type === 7 && (allowEmpty || p.exp) && (isString(name) ? p.name === name : name.test(p.name))) {
      return p;
    }
  }
}
function findProp(node, name, dynamicOnly = false, allowEmpty = false) {
  for (let i = 0; i < node.props.length; i++) {
    const p = node.props[i];
    if (p.type === 6) {
      if (dynamicOnly) continue;
      if (p.name === name && (p.value || allowEmpty)) {
        return p;
      }
    } else if (p.name === "bind" && (p.exp || allowEmpty) && isStaticArgOf(p.arg, name)) {
      return p;
    }
  }
}
function isStaticArgOf(arg, name) {
  return !!(arg && isStaticExp(arg) && arg.content === name);
}
function hasDynamicKeyVBind(node) {
  return node.props.some(
    (p) => p.type === 7 && p.name === "bind" && (!p.arg || // v-bind="obj"
    p.arg.type !== 4 || // v-bind:[_ctx.foo]
    !p.arg.isStatic)
    // v-bind:[foo]
  );
}
function isText$1(node) {
  return node.type === 5 || node.type === 2;
}
function isVPre(p) {
  return p.type === 7 && p.name === "pre";
}
function isVSlot(p) {
  return p.type === 7 && p.name === "slot";
}
function isTemplateNode(node) {
  return node.type === 1 && node.tagType === 3;
}
function isSlotOutlet(node) {
  return node.type === 1 && node.tagType === 2;
}
const propsHelperSet = /* @__PURE__ */ new Set([NORMALIZE_PROPS, GUARD_REACTIVE_PROPS]);
function getUnnormalizedProps(props, callPath = []) {
  if (props && !isString(props) && props.type === 14) {
    const callee = props.callee;
    if (!isString(callee) && propsHelperSet.has(callee)) {
      return getUnnormalizedProps(
        props.arguments[0],
        callPath.concat(props)
      );
    }
  }
  return [props, callPath];
}
function injectProp(node, prop, context) {
  if (node.type !== 13 && injectSlotKey(node, prop)) {
    return;
  }
  let propsWithInjection;
  let props = node.type === 13 ? node.props : node.arguments[2];
  let callPath = [];
  let parentCall;
  if (props && !isString(props) && props.type === 14) {
    const ret = getUnnormalizedProps(props);
    props = ret[0];
    callPath = ret[1];
    parentCall = callPath[callPath.length - 1];
  }
  if (props == null || isString(props)) {
    propsWithInjection = createObjectExpression([prop]);
  } else if (props.type === 14) {
    const first = props.arguments[0];
    if (!isString(first) && first.type === 15) {
      if (!hasProp(prop, first)) {
        first.properties.unshift(prop);
      }
    } else {
      if (props.callee === TO_HANDLERS) {
        propsWithInjection = createCallExpression(context.helper(MERGE_PROPS), [
          createObjectExpression([prop]),
          props
        ]);
      } else {
        props.arguments.unshift(createObjectExpression([prop]));
      }
    }
    !propsWithInjection && (propsWithInjection = props);
  } else if (props.type === 15) {
    if (!hasProp(prop, props)) {
      props.properties.unshift(prop);
    }
    propsWithInjection = props;
  } else {
    propsWithInjection = createCallExpression(context.helper(MERGE_PROPS), [
      createObjectExpression([prop]),
      props
    ]);
    if (parentCall && parentCall.callee === GUARD_REACTIVE_PROPS) {
      parentCall = callPath[callPath.length - 2];
    }
  }
  if (node.type === 13) {
    if (parentCall) {
      parentCall.arguments[0] = propsWithInjection;
    } else {
      node.props = propsWithInjection;
    }
  } else {
    if (parentCall) {
      parentCall.arguments[0] = propsWithInjection;
    } else {
      node.arguments[2] = propsWithInjection;
    }
  }
}
function injectSlotKey(node, prop) {
  var _a, _b, _c;
  if (prop.key.type !== 4 || prop.key.content !== "key") {
    return false;
  }
  const props = node.arguments[2];
  if (props && !isString(props)) {
    const [unnormalizedProps] = getUnnormalizedProps(props);
    if (unnormalizedProps && !isString(unnormalizedProps) && unnormalizedProps.type === 15 && hasProp(prop, unnormalizedProps)) {
      return true;
    }
  }
  (_a = node.arguments)[2] || (_a[2] = "{}");
  (_b = node.arguments)[3] || (_b[3] = "undefined");
  (_c = node.arguments)[4] || (_c[4] = "undefined");
  node.arguments[5] = prop.value;
  return true;
}
function hasProp(prop, props) {
  let result = false;
  if (prop.key.type === 4) {
    const propKeyName = prop.key.content;
    result = props.properties.some(
      (p) => p.key.type === 4 && p.key.content === propKeyName
    );
  }
  return result;
}
function toValidAssetId(name, type) {
  return `_${type}_${name.replace(/[^\w]/g, (searchValue, replaceValue) => {
    return searchValue === "-" ? "_" : name.charCodeAt(replaceValue).toString();
  })}`;
}
function getMemoedVNodeCall(node) {
  if (node.type === 14 && node.callee === WITH_MEMO) {
    return node.arguments[1].returns;
  } else {
    return node;
  }
}
const forAliasRE = /([\s\S]*?)\s+(?:in|of)\s+(\S[\s\S]*)/;
function isAllWhitespace(str) {
  for (let i = 0; i < str.length; i++) {
    if (!isWhitespace(str.charCodeAt(i))) {
      return false;
    }
  }
  return true;
}
function isWhitespaceText(node) {
  return node.type === 2 && isAllWhitespace(node.content) || node.type === 12 && isWhitespaceText(node.content);
}
function isCommentOrWhitespace(node) {
  return node.type === 3 || isWhitespaceText(node);
}

const defaultParserOptions = {
  parseMode: "base",
  ns: 0,
  delimiters: [`{{`, `}}`],
  getNamespace: () => 0,
  isVoidTag: NO,
  isPreTag: NO,
  isIgnoreNewlineTag: NO,
  isCustomElement: NO,
  onError: defaultOnError,
  onWarn: defaultOnWarn,
  comments: true,
  prefixIdentifiers: false
};
let currentOptions = defaultParserOptions;
let currentRoot = null;
let currentInput = "";
let currentOpenTag = null;
let currentProp = null;
let currentAttrValue = "";
let currentAttrStartIndex = -1;
let currentAttrEndIndex = -1;
let inPre = 0;
let inVPre = false;
let currentVPreBoundary = null;
const stack$1 = [];
const tokenizer = new Tokenizer(stack$1, {
  onerr: emitError,
  ontext(start, end) {
    onText(getSlice(start, end), start, end);
  },
  ontextentity(char, start, end) {
    onText(char, start, end);
  },
  oninterpolation(start, end) {
    if (inVPre) {
      return onText(getSlice(start, end), start, end);
    }
    let innerStart = start + tokenizer.delimiterOpen.length;
    let innerEnd = end - tokenizer.delimiterClose.length;
    while (isWhitespace(currentInput.charCodeAt(innerStart))) {
      innerStart++;
    }
    while (isWhitespace(currentInput.charCodeAt(innerEnd - 1))) {
      innerEnd--;
    }
    let exp = getSlice(innerStart, innerEnd);
    if (exp.includes("&")) {
      {
        exp = currentOptions.decodeEntities(exp, false);
      }
    }
    addNode({
      type: 5,
      content: createExp(exp, false, getLoc(innerStart, innerEnd)),
      loc: getLoc(start, end)
    });
  },
  onopentagname(start, end) {
    const name = getSlice(start, end);
    currentOpenTag = {
      type: 1,
      tag: name,
      ns: currentOptions.getNamespace(name, stack$1[0], currentOptions.ns),
      tagType: 0,
      // will be refined on tag close
      props: [],
      children: [],
      loc: getLoc(start - 1, end),
      codegenNode: void 0
    };
  },
  onopentagend(end) {
    endOpenTag(end);
  },
  onclosetag(start, end) {
    const name = getSlice(start, end);
    if (!currentOptions.isVoidTag(name)) {
      let found = false;
      for (let i = 0; i < stack$1.length; i++) {
        const e = stack$1[i];
        if (e.tag.toLowerCase() === name.toLowerCase()) {
          found = true;
          if (i > 0) {
            emitError(24, stack$1[0].loc.start.offset);
          }
          for (let j = 0; j <= i; j++) {
            const el = stack$1.shift();
            onCloseTag(el, end, j < i);
          }
          break;
        }
      }
      if (!found) {
        emitError(23, backTrack(start, 60));
      }
    }
  },
  onselfclosingtag(end) {
    const name = currentOpenTag.tag;
    currentOpenTag.isSelfClosing = true;
    endOpenTag(end);
    if (stack$1[0] && stack$1[0].tag === name) {
      onCloseTag(stack$1.shift(), end);
    }
  },
  onattribname(start, end) {
    currentProp = {
      type: 6,
      name: getSlice(start, end),
      nameLoc: getLoc(start, end),
      value: void 0,
      loc: getLoc(start)
    };
  },
  ondirname(start, end) {
    const raw = getSlice(start, end);
    const name = raw === "." || raw === ":" ? "bind" : raw === "@" ? "on" : raw === "#" ? "slot" : raw.slice(2);
    if (!inVPre && name === "") {
      emitError(26, start);
    }
    if (inVPre || name === "") {
      currentProp = {
        type: 6,
        name: raw,
        nameLoc: getLoc(start, end),
        value: void 0,
        loc: getLoc(start)
      };
    } else {
      currentProp = {
        type: 7,
        name,
        rawName: raw,
        exp: void 0,
        arg: void 0,
        modifiers: raw === "." ? [createSimpleExpression("prop")] : [],
        loc: getLoc(start)
      };
      if (name === "pre") {
        inVPre = tokenizer.inVPre = true;
        currentVPreBoundary = currentOpenTag;
        const props = currentOpenTag.props;
        for (let i = 0; i < props.length; i++) {
          if (props[i].type === 7) {
            props[i] = dirToAttr(props[i]);
          }
        }
      }
    }
  },
  ondirarg(start, end) {
    if (start === end) return;
    const arg = getSlice(start, end);
    if (inVPre && !isVPre(currentProp)) {
      currentProp.name += arg;
      setLocEnd(currentProp.nameLoc, end);
    } else {
      const isStatic = arg[0] !== `[`;
      currentProp.arg = createExp(
        isStatic ? arg : arg.slice(1, -1),
        isStatic,
        getLoc(start, end),
        isStatic ? 3 : 0
      );
    }
  },
  ondirmodifier(start, end) {
    const mod = getSlice(start, end);
    if (inVPre && !isVPre(currentProp)) {
      currentProp.name += "." + mod;
      setLocEnd(currentProp.nameLoc, end);
    } else if (currentProp.name === "slot") {
      const arg = currentProp.arg;
      if (arg) {
        arg.content += "." + mod;
        setLocEnd(arg.loc, end);
      }
    } else {
      const exp = createSimpleExpression(mod, true, getLoc(start, end));
      currentProp.modifiers.push(exp);
    }
  },
  onattribdata(start, end) {
    currentAttrValue += getSlice(start, end);
    if (currentAttrStartIndex < 0) currentAttrStartIndex = start;
    currentAttrEndIndex = end;
  },
  onattribentity(char, start, end) {
    currentAttrValue += char;
    if (currentAttrStartIndex < 0) currentAttrStartIndex = start;
    currentAttrEndIndex = end;
  },
  onattribnameend(end) {
    const start = currentProp.loc.start.offset;
    const name = getSlice(start, end);
    if (currentProp.type === 7) {
      currentProp.rawName = name;
    }
    if (currentOpenTag.props.some(
      (p) => (p.type === 7 ? p.rawName : p.name) === name
    )) {
      emitError(2, start);
    }
  },
  onattribend(quote, end) {
    if (currentOpenTag && currentProp) {
      setLocEnd(currentProp.loc, end);
      if (quote !== 0) {
        if (currentAttrValue.includes("&")) {
          currentAttrValue = currentOptions.decodeEntities(
            currentAttrValue,
            true
          );
        }
        if (currentProp.type === 6) {
          if (currentProp.name === "class") {
            currentAttrValue = condense(currentAttrValue).trim();
          }
          if (quote === 1 && !currentAttrValue) {
            emitError(13, end);
          }
          currentProp.value = {
            type: 2,
            content: currentAttrValue,
            loc: quote === 1 ? getLoc(currentAttrStartIndex, currentAttrEndIndex) : getLoc(currentAttrStartIndex - 1, currentAttrEndIndex + 1)
          };
          if (tokenizer.inSFCRoot && currentOpenTag.tag === "template" && currentProp.name === "lang" && currentAttrValue && currentAttrValue !== "html") {
            tokenizer.enterRCDATA(toCharCodes(`</template`), 0);
          }
        } else {
          let expParseMode = 0 /* Normal */;
          currentProp.exp = createExp(
            currentAttrValue,
            false,
            getLoc(currentAttrStartIndex, currentAttrEndIndex),
            0,
            expParseMode
          );
          if (currentProp.name === "for") {
            currentProp.forParseResult = parseForExpression(currentProp.exp);
          }
          let syncIndex = -1;
          if (currentProp.name === "bind" && (syncIndex = currentProp.modifiers.findIndex(
            (mod) => mod.content === "sync"
          )) > -1 && checkCompatEnabled(
            "COMPILER_V_BIND_SYNC",
            currentOptions,
            currentProp.loc,
            currentProp.arg.loc.source
          )) {
            currentProp.name = "model";
            currentProp.modifiers.splice(syncIndex, 1);
          }
        }
      }
      if (currentProp.type !== 7 || currentProp.name !== "pre") {
        currentOpenTag.props.push(currentProp);
      }
    }
    currentAttrValue = "";
    currentAttrStartIndex = currentAttrEndIndex = -1;
  },
  oncomment(start, end) {
    if (currentOptions.comments) {
      addNode({
        type: 3,
        content: getSlice(start, end),
        loc: getLoc(start - 4, end + 3)
      });
    }
  },
  onend() {
    const end = currentInput.length;
    if (tokenizer.state !== 1) {
      switch (tokenizer.state) {
        case 5:
        case 8:
          emitError(5, end);
          break;
        case 3:
        case 4:
          emitError(
            25,
            tokenizer.sectionStart
          );
          break;
        case 28:
          if (tokenizer.currentSequence === Sequences.CdataEnd) {
            emitError(6, end);
          } else {
            emitError(7, end);
          }
          break;
        case 6:
        case 7:
        case 9:
        case 11:
        case 12:
        case 13:
        case 14:
        case 15:
        case 16:
        case 17:
        case 18:
        case 19:
        // "
        case 20:
        // '
        case 21:
          emitError(9, end);
          break;
      }
    }
    for (let index = 0; index < stack$1.length; index++) {
      onCloseTag(stack$1[index], end - 1);
      emitError(24, stack$1[index].loc.start.offset);
    }
  },
  oncdata(start, end) {
    if ((stack$1[0] ? stack$1[0].ns : currentOptions.ns) !== 0) {
      onText(getSlice(start, end), start, end);
    } else {
      emitError(1, start - 9);
    }
  },
  onprocessinginstruction(start) {
    if ((stack$1[0] ? stack$1[0].ns : currentOptions.ns) === 0) {
      emitError(
        21,
        start - 1
      );
    }
  }
});
const forIteratorRE = /,([^,\}\]]*)(?:,([^,\}\]]*))?$/;
const stripParensRE = /^\(|\)$/g;
function parseForExpression(input) {
  const loc = input.loc;
  const exp = input.content;
  const inMatch = exp.match(forAliasRE);
  if (!inMatch) return;
  const [, LHS, RHS] = inMatch;
  const createAliasExpression = (content, offset, asParam = false) => {
    const start = loc.start.offset + offset;
    const end = start + content.length;
    return createExp(
      content,
      false,
      getLoc(start, end),
      0,
      asParam ? 1 /* Params */ : 0 /* Normal */
    );
  };
  const result = {
    source: createAliasExpression(RHS.trim(), exp.indexOf(RHS, LHS.length)),
    value: void 0,
    key: void 0,
    index: void 0,
    finalized: false
  };
  let valueContent = LHS.trim().replace(stripParensRE, "").trim();
  const trimmedOffset = LHS.indexOf(valueContent);
  const iteratorMatch = valueContent.match(forIteratorRE);
  if (iteratorMatch) {
    valueContent = valueContent.replace(forIteratorRE, "").trim();
    const keyContent = iteratorMatch[1].trim();
    let keyOffset;
    if (keyContent) {
      keyOffset = exp.indexOf(keyContent, trimmedOffset + valueContent.length);
      result.key = createAliasExpression(keyContent, keyOffset, true);
    }
    if (iteratorMatch[2]) {
      const indexContent = iteratorMatch[2].trim();
      if (indexContent) {
        result.index = createAliasExpression(
          indexContent,
          exp.indexOf(
            indexContent,
            result.key ? keyOffset + keyContent.length : trimmedOffset + valueContent.length
          ),
          true
        );
      }
    }
  }
  if (valueContent) {
    result.value = createAliasExpression(valueContent, trimmedOffset, true);
  }
  return result;
}
function getSlice(start, end) {
  return currentInput.slice(start, end);
}
function endOpenTag(end) {
  if (tokenizer.inSFCRoot) {
    currentOpenTag.innerLoc = getLoc(end + 1, end + 1);
  }
  addNode(currentOpenTag);
  const { tag, ns } = currentOpenTag;
  if (ns === 0 && currentOptions.isPreTag(tag)) {
    inPre++;
  }
  if (currentOptions.isVoidTag(tag)) {
    onCloseTag(currentOpenTag, end);
  } else {
    stack$1.unshift(currentOpenTag);
    if (ns === 1 || ns === 2) {
      tokenizer.inXML = true;
    }
  }
  currentOpenTag = null;
}
function onText(content, start, end) {
  {
    const tag = stack$1[0] && stack$1[0].tag;
    if (tag !== "script" && tag !== "style" && content.includes("&")) {
      content = currentOptions.decodeEntities(content, false);
    }
  }
  const parent = stack$1[0] || currentRoot;
  const lastNode = parent.children[parent.children.length - 1];
  if (lastNode && lastNode.type === 2) {
    lastNode.content += content;
    setLocEnd(lastNode.loc, end);
  } else {
    parent.children.push({
      type: 2,
      content,
      loc: getLoc(start, end)
    });
  }
}
function onCloseTag(el, end, isImplied = false) {
  if (isImplied) {
    setLocEnd(el.loc, backTrack(end, 60));
  } else {
    setLocEnd(el.loc, lookAhead(end, 62) + 1);
  }
  if (tokenizer.inSFCRoot) {
    if (el.children.length) {
      el.innerLoc.end = extend({}, el.children[el.children.length - 1].loc.end);
    } else {
      el.innerLoc.end = extend({}, el.innerLoc.start);
    }
    el.innerLoc.source = getSlice(
      el.innerLoc.start.offset,
      el.innerLoc.end.offset
    );
  }
  const { tag, ns, children } = el;
  if (!inVPre) {
    if (tag === "slot") {
      el.tagType = 2;
    } else if (isFragmentTemplate(el)) {
      el.tagType = 3;
    } else if (isComponent(el)) {
      el.tagType = 1;
    }
  }
  if (!tokenizer.inRCDATA) {
    el.children = condenseWhitespace(children);
  }
  if (ns === 0 && currentOptions.isIgnoreNewlineTag(tag)) {
    const first = children[0];
    if (first && first.type === 2) {
      first.content = first.content.replace(/^\r?\n/, "");
    }
  }
  if (ns === 0 && currentOptions.isPreTag(tag)) {
    inPre--;
  }
  if (currentVPreBoundary === el) {
    inVPre = tokenizer.inVPre = false;
    currentVPreBoundary = null;
  }
  if (tokenizer.inXML && (stack$1[0] ? stack$1[0].ns : currentOptions.ns) === 0) {
    tokenizer.inXML = false;
  }
  {
    const props = el.props;
    if (isCompatEnabled(
      "COMPILER_V_IF_V_FOR_PRECEDENCE",
      currentOptions
    )) {
      let hasIf = false;
      let hasFor = false;
      for (let i = 0; i < props.length; i++) {
        const p = props[i];
        if (p.type === 7) {
          if (p.name === "if") {
            hasIf = true;
          } else if (p.name === "for") {
            hasFor = true;
          }
        }
        if (hasIf && hasFor) {
          warnDeprecation(
            "COMPILER_V_IF_V_FOR_PRECEDENCE",
            currentOptions,
            el.loc
          );
          break;
        }
      }
    }
    if (!tokenizer.inSFCRoot && isCompatEnabled(
      "COMPILER_NATIVE_TEMPLATE",
      currentOptions
    ) && el.tag === "template" && !isFragmentTemplate(el)) {
      warnDeprecation(
        "COMPILER_NATIVE_TEMPLATE",
        currentOptions,
        el.loc
      );
      const parent = stack$1[0] || currentRoot;
      const index = parent.children.indexOf(el);
      parent.children.splice(index, 1, ...el.children);
    }
    const inlineTemplateProp = props.find(
      (p) => p.type === 6 && p.name === "inline-template"
    );
    if (inlineTemplateProp && checkCompatEnabled(
      "COMPILER_INLINE_TEMPLATE",
      currentOptions,
      inlineTemplateProp.loc
    ) && el.children.length) {
      inlineTemplateProp.value = {
        type: 2,
        content: getSlice(
          el.children[0].loc.start.offset,
          el.children[el.children.length - 1].loc.end.offset
        ),
        loc: inlineTemplateProp.loc
      };
    }
  }
}
function lookAhead(index, c) {
  let i = index;
  while (currentInput.charCodeAt(i) !== c && i < currentInput.length - 1) i++;
  return i;
}
function backTrack(index, c) {
  let i = index;
  while (currentInput.charCodeAt(i) !== c && i >= 0) i--;
  return i;
}
const specialTemplateDir = /* @__PURE__ */ new Set(["if", "else", "else-if", "for", "slot"]);
function isFragmentTemplate({ tag, props }) {
  if (tag === "template") {
    for (let i = 0; i < props.length; i++) {
      if (props[i].type === 7 && specialTemplateDir.has(props[i].name)) {
        return true;
      }
    }
  }
  return false;
}
function isComponent({ tag, props }) {
  if (currentOptions.isCustomElement(tag)) {
    return false;
  }
  if (tag === "component" || isUpperCase(tag.charCodeAt(0)) || isCoreComponent(tag) || currentOptions.isBuiltInComponent && currentOptions.isBuiltInComponent(tag) || currentOptions.isNativeTag && !currentOptions.isNativeTag(tag)) {
    return true;
  }
  for (let i = 0; i < props.length; i++) {
    const p = props[i];
    if (p.type === 6) {
      if (p.name === "is" && p.value) {
        if (p.value.content.startsWith("vue:")) {
          return true;
        } else if (checkCompatEnabled(
          "COMPILER_IS_ON_ELEMENT",
          currentOptions,
          p.loc
        )) {
          return true;
        }
      }
    } else if (// :is on plain element - only treat as component in compat mode
    p.name === "bind" && isStaticArgOf(p.arg, "is") && checkCompatEnabled(
      "COMPILER_IS_ON_ELEMENT",
      currentOptions,
      p.loc
    )) {
      return true;
    }
  }
  return false;
}
function isUpperCase(c) {
  return c > 64 && c < 91;
}
const windowsNewlineRE = /\r\n/g;
function condenseWhitespace(nodes) {
  const shouldCondense = currentOptions.whitespace !== "preserve";
  let removedWhitespace = false;
  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i];
    if (node.type === 2) {
      if (!inPre) {
        if (isAllWhitespace(node.content)) {
          const prev = nodes[i - 1] && nodes[i - 1].type;
          const next = nodes[i + 1] && nodes[i + 1].type;
          if (!prev || !next || shouldCondense && (prev === 3 && (next === 3 || next === 1) || prev === 1 && (next === 3 || next === 1 && hasNewlineChar(node.content)))) {
            removedWhitespace = true;
            nodes[i] = null;
          } else {
            node.content = " ";
          }
        } else if (shouldCondense) {
          node.content = condense(node.content);
        }
      } else {
        node.content = node.content.replace(windowsNewlineRE, "\n");
      }
    }
  }
  return removedWhitespace ? nodes.filter(Boolean) : nodes;
}
function hasNewlineChar(str) {
  for (let i = 0; i < str.length; i++) {
    const c = str.charCodeAt(i);
    if (c === 10 || c === 13) {
      return true;
    }
  }
  return false;
}
function condense(str) {
  let ret = "";
  let prevCharIsWhitespace = false;
  for (let i = 0; i < str.length; i++) {
    if (isWhitespace(str.charCodeAt(i))) {
      if (!prevCharIsWhitespace) {
        ret += " ";
        prevCharIsWhitespace = true;
      }
    } else {
      ret += str[i];
      prevCharIsWhitespace = false;
    }
  }
  return ret;
}
function addNode(node) {
  (stack$1[0] || currentRoot).children.push(node);
}
function getLoc(start, end) {
  return {
    start: tokenizer.getPos(start),
    // @ts-expect-error allow late attachment
    end: end == null ? end : tokenizer.getPos(end),
    // @ts-expect-error allow late attachment
    source: end == null ? end : getSlice(start, end)
  };
}
function cloneLoc(loc) {
  return getLoc(loc.start.offset, loc.end.offset);
}
function setLocEnd(loc, end) {
  loc.end = tokenizer.getPos(end);
  loc.source = getSlice(loc.start.offset, end);
}
function dirToAttr(dir) {
  const attr = {
    type: 6,
    name: dir.rawName,
    nameLoc: getLoc(
      dir.loc.start.offset,
      dir.loc.start.offset + dir.rawName.length
    ),
    value: void 0,
    loc: dir.loc
  };
  if (dir.exp) {
    const loc = dir.exp.loc;
    if (loc.end.offset < dir.loc.end.offset) {
      loc.start.offset--;
      loc.start.column--;
      loc.end.offset++;
      loc.end.column++;
    }
    attr.value = {
      type: 2,
      content: dir.exp.content,
      loc
    };
  }
  return attr;
}
function createExp(content, isStatic = false, loc, constType = 0, parseMode = 0 /* Normal */) {
  const exp = createSimpleExpression(content, isStatic, loc, constType);
  return exp;
}
function emitError(code, index, message) {
  currentOptions.onError(
    createCompilerError(code, getLoc(index, index), void 0, message)
  );
}
function reset() {
  tokenizer.reset();
  currentOpenTag = null;
  currentProp = null;
  currentAttrValue = "";
  currentAttrStartIndex = -1;
  currentAttrEndIndex = -1;
  stack$1.length = 0;
}
function baseParse(input, options) {
  reset();
  currentInput = input;
  currentOptions = extend({}, defaultParserOptions);
  if (options) {
    let key;
    for (key in options) {
      if (options[key] != null) {
        currentOptions[key] = options[key];
      }
    }
  }
  {
    if (!currentOptions.decodeEntities) {
      throw new Error(
        `[@vue/compiler-core] decodeEntities option is required in browser builds.`
      );
    }
  }
  tokenizer.mode = currentOptions.parseMode === "html" ? 1 : currentOptions.parseMode === "sfc" ? 2 : 0;
  tokenizer.inXML = currentOptions.ns === 1 || currentOptions.ns === 2;
  const delimiters = options && options.delimiters;
  if (delimiters) {
    tokenizer.delimiterOpen = toCharCodes(delimiters[0]);
    tokenizer.delimiterClose = toCharCodes(delimiters[1]);
  }
  const root = currentRoot = createRoot([], input);
  tokenizer.parse(currentInput);
  root.loc = getLoc(0, input.length);
  root.children = condenseWhitespace(root.children);
  currentRoot = null;
  return root;
}

function cacheStatic(root, context) {
  walk(
    root,
    void 0,
    context,
    // Root node is unfortunately non-hoistable due to potential parent
    // fallthrough attributes.
    !!getSingleElementRoot(root)
  );
}
function getSingleElementRoot(root) {
  const children = root.children.filter((x) => x.type !== 3);
  return children.length === 1 && children[0].type === 1 && !isSlotOutlet(children[0]) ? children[0] : null;
}
function walk(node, parent, context, doNotHoistNode = false, inFor = false) {
  const { children } = node;
  const toCache = [];
  for (let i = 0; i < children.length; i++) {
    const child = children[i];
    if (child.type === 1 && child.tagType === 0) {
      const constantType = doNotHoistNode ? 0 : getConstantType(child, context);
      if (constantType > 0) {
        if (constantType >= 2) {
          child.codegenNode.patchFlag = -1;
          toCache.push(child);
          continue;
        }
      } else {
        const codegenNode = child.codegenNode;
        if (codegenNode.type === 13) {
          const flag = codegenNode.patchFlag;
          if ((flag === void 0 || flag === 512 || flag === 1) && getGeneratedPropsConstantType(child, context) >= 2) {
            const props = getNodeProps(child);
            if (props) {
              codegenNode.props = context.hoist(props);
            }
          }
          if (codegenNode.dynamicProps) {
            codegenNode.dynamicProps = context.hoist(codegenNode.dynamicProps);
          }
        }
      }
    } else if (child.type === 12) {
      const constantType = doNotHoistNode ? 0 : getConstantType(child, context);
      if (constantType >= 2) {
        if (child.codegenNode.type === 14 && child.codegenNode.arguments.length > 0) {
          child.codegenNode.arguments.push(
            -1 + (` /* ${PatchFlagNames[-1]} */` )
          );
        }
        toCache.push(child);
        continue;
      }
    }
    if (child.type === 1) {
      const isComponent = child.tagType === 1;
      if (isComponent) {
        context.scopes.vSlot++;
      }
      walk(child, node, context, false, inFor);
      if (isComponent) {
        context.scopes.vSlot--;
      }
    } else if (child.type === 11) {
      walk(child, node, context, child.children.length === 1, true);
    } else if (child.type === 9) {
      for (let i2 = 0; i2 < child.branches.length; i2++) {
        walk(
          child.branches[i2],
          node,
          context,
          child.branches[i2].children.length === 1,
          inFor
        );
      }
    }
  }
  let cachedAsArray = false;
  if (toCache.length === children.length && node.type === 1) {
    if (node.tagType === 0 && node.codegenNode && node.codegenNode.type === 13 && isArray(node.codegenNode.children)) {
      node.codegenNode.children = getCacheExpression(
        createArrayExpression(node.codegenNode.children)
      );
      cachedAsArray = true;
    } else if (node.tagType === 1 && node.codegenNode && node.codegenNode.type === 13 && node.codegenNode.children && !isArray(node.codegenNode.children) && node.codegenNode.children.type === 15) {
      const slot = getSlotNode(node.codegenNode, "default");
      if (slot) {
        slot.returns = getCacheExpression(
          createArrayExpression(slot.returns)
        );
        cachedAsArray = true;
      }
    } else if (node.tagType === 3 && parent && parent.type === 1 && parent.tagType === 1 && parent.codegenNode && parent.codegenNode.type === 13 && parent.codegenNode.children && !isArray(parent.codegenNode.children) && parent.codegenNode.children.type === 15) {
      const slotName = findDir(node, "slot", true);
      const slot = slotName && slotName.arg && getSlotNode(parent.codegenNode, slotName.arg);
      if (slot) {
        slot.returns = getCacheExpression(
          createArrayExpression(slot.returns)
        );
        cachedAsArray = true;
      }
    }
  }
  if (!cachedAsArray) {
    for (const child of toCache) {
      child.codegenNode = context.cache(child.codegenNode);
    }
  }
  function getCacheExpression(value) {
    const exp = context.cache(value);
    exp.needArraySpread = true;
    return exp;
  }
  function getSlotNode(node2, name) {
    if (node2.children && !isArray(node2.children) && node2.children.type === 15) {
      const slot = node2.children.properties.find(
        (p) => p.key === name || p.key.content === name
      );
      return slot && slot.value;
    }
  }
  if (toCache.length && context.transformHoist) {
    context.transformHoist(children, context, node);
  }
}
function getConstantType(node, context) {
  const { constantCache } = context;
  switch (node.type) {
    case 1:
      if (node.tagType !== 0) {
        return 0;
      }
      const cached = constantCache.get(node);
      if (cached !== void 0) {
        return cached;
      }
      const codegenNode = node.codegenNode;
      if (codegenNode.type !== 13) {
        return 0;
      }
      if (codegenNode.isBlock && node.tag !== "svg" && node.tag !== "foreignObject" && node.tag !== "math") {
        return 0;
      }
      if (codegenNode.patchFlag === void 0) {
        let returnType2 = 3;
        const generatedPropsType = getGeneratedPropsConstantType(node, context);
        if (generatedPropsType === 0) {
          constantCache.set(node, 0);
          return 0;
        }
        if (generatedPropsType < returnType2) {
          returnType2 = generatedPropsType;
        }
        for (let i = 0; i < node.children.length; i++) {
          const childType = getConstantType(node.children[i], context);
          if (childType === 0) {
            constantCache.set(node, 0);
            return 0;
          }
          if (childType < returnType2) {
            returnType2 = childType;
          }
        }
        if (returnType2 > 1) {
          for (let i = 0; i < node.props.length; i++) {
            const p = node.props[i];
            if (p.type === 7 && p.name === "bind" && p.exp) {
              const expType = getConstantType(p.exp, context);
              if (expType === 0) {
                constantCache.set(node, 0);
                return 0;
              }
              if (expType < returnType2) {
                returnType2 = expType;
              }
            }
          }
        }
        if (codegenNode.isBlock) {
          for (let i = 0; i < node.props.length; i++) {
            const p = node.props[i];
            if (p.type === 7) {
              constantCache.set(node, 0);
              return 0;
            }
          }
          context.removeHelper(OPEN_BLOCK);
          context.removeHelper(
            getVNodeBlockHelper(context.inSSR, codegenNode.isComponent)
          );
          codegenNode.isBlock = false;
          context.helper(getVNodeHelper(context.inSSR, codegenNode.isComponent));
        }
        constantCache.set(node, returnType2);
        return returnType2;
      } else {
        constantCache.set(node, 0);
        return 0;
      }
    case 2:
    case 3:
      return 3;
    case 9:
    case 11:
    case 10:
      return 0;
    case 5:
    case 12:
      return getConstantType(node.content, context);
    case 4:
      return node.constType;
    case 8:
      let returnType = 3;
      for (let i = 0; i < node.children.length; i++) {
        const child = node.children[i];
        if (isString(child) || isSymbol(child)) {
          continue;
        }
        const childType = getConstantType(child, context);
        if (childType === 0) {
          return 0;
        } else if (childType < returnType) {
          returnType = childType;
        }
      }
      return returnType;
    case 20:
      return 2;
    default:
      return 0;
  }
}
const allowHoistedHelperSet = /* @__PURE__ */ new Set([
  NORMALIZE_CLASS,
  NORMALIZE_STYLE,
  NORMALIZE_PROPS,
  GUARD_REACTIVE_PROPS
]);
function getConstantTypeOfHelperCall(value, context) {
  if (value.type === 14 && !isString(value.callee) && allowHoistedHelperSet.has(value.callee)) {
    const arg = value.arguments[0];
    if (arg.type === 4) {
      return getConstantType(arg, context);
    } else if (arg.type === 14) {
      return getConstantTypeOfHelperCall(arg, context);
    }
  }
  return 0;
}
function getGeneratedPropsConstantType(node, context) {
  let returnType = 3;
  const props = getNodeProps(node);
  if (props && props.type === 15) {
    const { properties } = props;
    for (let i = 0; i < properties.length; i++) {
      const { key, value } = properties[i];
      const keyType = getConstantType(key, context);
      if (keyType === 0) {
        return keyType;
      }
      if (keyType < returnType) {
        returnType = keyType;
      }
      let valueType;
      if (value.type === 4) {
        valueType = getConstantType(value, context);
      } else if (value.type === 14) {
        valueType = getConstantTypeOfHelperCall(value, context);
      } else {
        valueType = 0;
      }
      if (valueType === 0) {
        return valueType;
      }
      if (valueType < returnType) {
        returnType = valueType;
      }
    }
  }
  return returnType;
}
function getNodeProps(node) {
  const codegenNode = node.codegenNode;
  if (codegenNode.type === 13) {
    return codegenNode.props;
  }
}

function createTransformContext(root, {
  filename = "",
  prefixIdentifiers = false,
  hoistStatic = false,
  hmr = false,
  cacheHandlers = false,
  nodeTransforms = [],
  directiveTransforms = {},
  transformHoist = null,
  isBuiltInComponent = NOOP,
  isCustomElement = NOOP,
  expressionPlugins = [],
  scopeId = null,
  slotted = true,
  ssr = false,
  inSSR = false,
  ssrCssVars = ``,
  bindingMetadata = EMPTY_OBJ,
  inline = false,
  isTS = false,
  onError = defaultOnError,
  onWarn = defaultOnWarn,
  compatConfig
}) {
  const nameMatch = filename.replace(/\?.*$/, "").match(/([^/\\]+)\.\w+$/);
  const context = {
    // options
    filename,
    selfName: nameMatch && capitalize(camelize(nameMatch[1])),
    prefixIdentifiers,
    hoistStatic,
    hmr,
    cacheHandlers,
    nodeTransforms,
    directiveTransforms,
    transformHoist,
    isBuiltInComponent,
    isCustomElement,
    expressionPlugins,
    scopeId,
    slotted,
    ssr,
    inSSR,
    ssrCssVars,
    bindingMetadata,
    inline,
    isTS,
    onError,
    onWarn,
    compatConfig,
    // state
    root,
    helpers: /* @__PURE__ */ new Map(),
    components: /* @__PURE__ */ new Set(),
    directives: /* @__PURE__ */ new Set(),
    hoists: [],
    imports: [],
    cached: [],
    constantCache: /* @__PURE__ */ new WeakMap(),
    vForMemoKeyedNodes: /* @__PURE__ */ new WeakSet(),
    temps: 0,
    identifiers: /* @__PURE__ */ Object.create(null),
    scopes: {
      vFor: 0,
      vSlot: 0,
      vPre: 0,
      vOnce: 0
    },
    parent: null,
    grandParent: null,
    currentNode: root,
    childIndex: 0,
    inVOnce: false,
    // methods
    helper(name) {
      const count = context.helpers.get(name) || 0;
      context.helpers.set(name, count + 1);
      return name;
    },
    removeHelper(name) {
      const count = context.helpers.get(name);
      if (count) {
        const currentCount = count - 1;
        if (!currentCount) {
          context.helpers.delete(name);
        } else {
          context.helpers.set(name, currentCount);
        }
      }
    },
    helperString(name) {
      return `_${helperNameMap[context.helper(name)]}`;
    },
    replaceNode(node) {
      {
        if (!context.currentNode) {
          throw new Error(`Node being replaced is already removed.`);
        }
        if (!context.parent) {
          throw new Error(`Cannot replace root node.`);
        }
      }
      context.parent.children[context.childIndex] = context.currentNode = node;
    },
    removeNode(node) {
      if (!context.parent) {
        throw new Error(`Cannot remove root node.`);
      }
      const list = context.parent.children;
      const removalIndex = node ? list.indexOf(node) : context.currentNode ? context.childIndex : -1;
      if (removalIndex < 0) {
        throw new Error(`node being removed is not a child of current parent`);
      }
      if (!node || node === context.currentNode) {
        context.currentNode = null;
        context.onNodeRemoved();
      } else {
        if (context.childIndex > removalIndex) {
          context.childIndex--;
          context.onNodeRemoved();
        }
      }
      context.parent.children.splice(removalIndex, 1);
    },
    onNodeRemoved: NOOP,
    addIdentifiers(exp) {
    },
    removeIdentifiers(exp) {
    },
    hoist(exp) {
      if (isString(exp)) exp = createSimpleExpression(exp);
      context.hoists.push(exp);
      const identifier = createSimpleExpression(
        `_hoisted_${context.hoists.length}`,
        false,
        exp.loc,
        2
      );
      identifier.hoisted = exp;
      return identifier;
    },
    cache(exp, isVNode = false, inVOnce = false) {
      const cacheExp = createCacheExpression(
        context.cached.length,
        exp,
        isVNode,
        inVOnce
      );
      context.cached.push(cacheExp);
      return cacheExp;
    }
  };
  {
    context.filters = /* @__PURE__ */ new Set();
  }
  return context;
}
function transform(root, options) {
  const context = createTransformContext(root, options);
  traverseNode(root, context);
  if (options.hoistStatic) {
    cacheStatic(root, context);
  }
  if (!options.ssr) {
    createRootCodegen(root, context);
  }
  root.helpers = /* @__PURE__ */ new Set([...context.helpers.keys()]);
  root.components = [...context.components];
  root.directives = [...context.directives];
  root.imports = context.imports;
  root.hoists = context.hoists;
  root.temps = context.temps;
  root.cached = context.cached;
  root.transformed = true;
  {
    root.filters = [...context.filters];
  }
}
function createRootCodegen(root, context) {
  const { helper } = context;
  const { children } = root;
  if (children.length === 1) {
    const singleElementRootChild = getSingleElementRoot(root);
    if (singleElementRootChild && singleElementRootChild.codegenNode) {
      const codegenNode = singleElementRootChild.codegenNode;
      if (codegenNode.type === 13) {
        convertToBlock(codegenNode, context);
      }
      root.codegenNode = codegenNode;
    } else {
      root.codegenNode = children[0];
    }
  } else if (children.length > 1) {
    let patchFlag = 64;
    if (children.filter((c) => c.type !== 3).length === 1) {
      patchFlag |= 2048;
    }
    root.codegenNode = createVNodeCall(
      context,
      helper(FRAGMENT),
      void 0,
      root.children,
      patchFlag,
      void 0,
      void 0,
      true,
      void 0,
      false
    );
  } else ;
}
function traverseChildren(parent, context) {
  let i = 0;
  const nodeRemoved = () => {
    i--;
  };
  for (; i < parent.children.length; i++) {
    const child = parent.children[i];
    if (isString(child)) continue;
    context.grandParent = context.parent;
    context.parent = parent;
    context.childIndex = i;
    context.onNodeRemoved = nodeRemoved;
    traverseNode(child, context);
  }
}
function traverseNode(node, context) {
  context.currentNode = node;
  const { nodeTransforms } = context;
  const exitFns = [];
  for (let i2 = 0; i2 < nodeTransforms.length; i2++) {
    const onExit = nodeTransforms[i2](node, context);
    if (onExit) {
      if (isArray(onExit)) {
        exitFns.push(...onExit);
      } else {
        exitFns.push(onExit);
      }
    }
    if (!context.currentNode) {
      return;
    } else {
      node = context.currentNode;
    }
  }
  switch (node.type) {
    case 3:
      if (!context.ssr) {
        context.helper(CREATE_COMMENT);
      }
      break;
    case 5:
      if (!context.ssr) {
        context.helper(TO_DISPLAY_STRING);
      }
      break;
    // for container types, further traverse downwards
    case 9:
      for (let i2 = 0; i2 < node.branches.length; i2++) {
        traverseNode(node.branches[i2], context);
      }
      break;
    case 10:
    case 11:
    case 1:
    case 0:
      traverseChildren(node, context);
      break;
  }
  context.currentNode = node;
  let i = exitFns.length;
  while (i--) {
    exitFns[i]();
  }
}
function createStructuralDirectiveTransform(name, fn) {
  const matches = isString(name) ? (n) => n === name : (n) => name.test(n);
  return (node, context) => {
    if (node.type === 1) {
      const { props } = node;
      if (node.tagType === 3 && props.some(isVSlot)) {
        return;
      }
      const exitFns = [];
      for (let i = 0; i < props.length; i++) {
        const prop = props[i];
        if (prop.type === 7 && matches(prop.name)) {
          props.splice(i, 1);
          i--;
          const onExit = fn(node, prop, context);
          if (onExit) exitFns.push(onExit);
        }
      }
      return exitFns;
    }
  };
}

const PURE_ANNOTATION = `/*@__PURE__*/`;
const aliasHelper = (s) => `${helperNameMap[s]}: _${helperNameMap[s]}`;
function createCodegenContext(ast, {
  mode = "function",
  prefixIdentifiers = mode === "module",
  sourceMap = false,
  filename = `template.vue.html`,
  scopeId = null,
  optimizeImports = false,
  runtimeGlobalName = `Vue`,
  runtimeModuleName = `vue`,
  ssrRuntimeModuleName = "vue/server-renderer",
  ssr = false,
  isTS = false,
  inSSR = false
}) {
  const context = {
    mode,
    prefixIdentifiers,
    sourceMap,
    filename,
    scopeId,
    optimizeImports,
    runtimeGlobalName,
    runtimeModuleName,
    ssrRuntimeModuleName,
    ssr,
    isTS,
    inSSR,
    source: ast.source,
    code: ``,
    column: 1,
    line: 1,
    offset: 0,
    indentLevel: 0,
    pure: false,
    map: void 0,
    helper(key) {
      return `_${helperNameMap[key]}`;
    },
    push(code, newlineIndex = -2 /* None */, node) {
      context.code += code;
    },
    indent() {
      newline(++context.indentLevel);
    },
    deindent(withoutNewLine = false) {
      if (withoutNewLine) {
        --context.indentLevel;
      } else {
        newline(--context.indentLevel);
      }
    },
    newline() {
      newline(context.indentLevel);
    }
  };
  function newline(n) {
    context.push("\n" + `  `.repeat(n), 0 /* Start */);
  }
  return context;
}
function generate(ast, options = {}) {
  const context = createCodegenContext(ast, options);
  if (options.onContextCreated) options.onContextCreated(context);
  const {
    mode,
    push,
    prefixIdentifiers,
    indent,
    deindent,
    newline,
    scopeId,
    ssr
  } = context;
  const helpers = Array.from(ast.helpers);
  const hasHelpers = helpers.length > 0;
  const useWithBlock = !prefixIdentifiers && mode !== "module";
  const preambleContext = context;
  {
    genFunctionPreamble(ast, preambleContext);
  }
  const functionName = ssr ? `ssrRender` : `render`;
  const args = ssr ? ["_ctx", "_push", "_parent", "_attrs"] : ["_ctx", "_cache"];
  const signature = args.join(", ");
  {
    push(`function ${functionName}(${signature}) {`);
  }
  indent();
  if (useWithBlock) {
    push(`with (_ctx) {`);
    indent();
    if (hasHelpers) {
      push(
        `const { ${helpers.map(aliasHelper).join(", ")} } = _Vue
`,
        -1 /* End */
      );
      newline();
    }
  }
  if (ast.components.length) {
    genAssets(ast.components, "component", context);
    if (ast.directives.length || ast.temps > 0) {
      newline();
    }
  }
  if (ast.directives.length) {
    genAssets(ast.directives, "directive", context);
    if (ast.temps > 0) {
      newline();
    }
  }
  if (ast.filters && ast.filters.length) {
    newline();
    genAssets(ast.filters, "filter", context);
    newline();
  }
  if (ast.temps > 0) {
    push(`let `);
    for (let i = 0; i < ast.temps; i++) {
      push(`${i > 0 ? `, ` : ``}_temp${i}`);
    }
  }
  if (ast.components.length || ast.directives.length || ast.temps) {
    push(`
`, 0 /* Start */);
    newline();
  }
  if (!ssr) {
    push(`return `);
  }
  if (ast.codegenNode) {
    genNode(ast.codegenNode, context);
  } else {
    push(`null`);
  }
  if (useWithBlock) {
    deindent();
    push(`}`);
  }
  deindent();
  push(`}`);
  return {
    ast,
    code: context.code,
    preamble: ``,
    map: context.map ? context.map.toJSON() : void 0
  };
}
function genFunctionPreamble(ast, context) {
  const {
    ssr,
    prefixIdentifiers,
    push,
    newline,
    runtimeModuleName,
    runtimeGlobalName,
    ssrRuntimeModuleName
  } = context;
  const VueBinding = runtimeGlobalName;
  const helpers = Array.from(ast.helpers);
  if (helpers.length > 0) {
    {
      push(`const _Vue = ${VueBinding}
`, -1 /* End */);
      if (ast.hoists.length) {
        const staticHelpers = [
          CREATE_VNODE,
          CREATE_ELEMENT_VNODE,
          CREATE_COMMENT,
          CREATE_TEXT,
          CREATE_STATIC
        ].filter((helper) => helpers.includes(helper)).map(aliasHelper).join(", ");
        push(`const { ${staticHelpers} } = _Vue
`, -1 /* End */);
      }
    }
  }
  genHoists(ast.hoists, context);
  newline();
  push(`return `);
}
function genAssets(assets, type, { helper, push, newline, isTS }) {
  const resolver = helper(
    type === "filter" ? RESOLVE_FILTER : type === "component" ? RESOLVE_COMPONENT : RESOLVE_DIRECTIVE
  );
  for (let i = 0; i < assets.length; i++) {
    let id = assets[i];
    const maybeSelfReference = id.endsWith("__self");
    if (maybeSelfReference) {
      id = id.slice(0, -6);
    }
    push(
      `const ${toValidAssetId(id, type)} = ${resolver}(${JSON.stringify(id)}${maybeSelfReference ? `, true` : ``})${isTS ? `!` : ``}`
    );
    if (i < assets.length - 1) {
      newline();
    }
  }
}
function genHoists(hoists, context) {
  if (!hoists.length) {
    return;
  }
  context.pure = true;
  const { push, newline } = context;
  newline();
  for (let i = 0; i < hoists.length; i++) {
    const exp = hoists[i];
    if (exp) {
      push(`const _hoisted_${i + 1} = `);
      genNode(exp, context);
      newline();
    }
  }
  context.pure = false;
}
function isText(n) {
  return isString(n) || n.type === 4 || n.type === 2 || n.type === 5 || n.type === 8;
}
function genNodeListAsArray(nodes, context) {
  const multilines = nodes.length > 3 || nodes.some((n) => isArray(n) || !isText(n));
  context.push(`[`);
  multilines && context.indent();
  genNodeList(nodes, context, multilines);
  multilines && context.deindent();
  context.push(`]`);
}
function genNodeList(nodes, context, multilines = false, comma = true) {
  const { push, newline } = context;
  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i];
    if (isString(node)) {
      push(node, -3 /* Unknown */);
    } else if (isArray(node)) {
      genNodeListAsArray(node, context);
    } else {
      genNode(node, context);
    }
    if (i < nodes.length - 1) {
      if (multilines) {
        comma && push(",");
        newline();
      } else {
        comma && push(", ");
      }
    }
  }
}
function genNode(node, context) {
  if (isString(node)) {
    context.push(node, -3 /* Unknown */);
    return;
  }
  if (isSymbol(node)) {
    context.push(context.helper(node));
    return;
  }
  switch (node.type) {
    case 1:
    case 9:
    case 11:
      assert(
        node.codegenNode != null,
        `Codegen node is missing for element/if/for node. Apply appropriate transforms first.`
      );
      genNode(node.codegenNode, context);
      break;
    case 2:
      genText(node, context);
      break;
    case 4:
      genExpression(node, context);
      break;
    case 5:
      genInterpolation(node, context);
      break;
    case 12:
      genNode(node.codegenNode, context);
      break;
    case 8:
      genCompoundExpression(node, context);
      break;
    case 3:
      genComment(node, context);
      break;
    case 13:
      genVNodeCall(node, context);
      break;
    case 14:
      genCallExpression(node, context);
      break;
    case 15:
      genObjectExpression(node, context);
      break;
    case 17:
      genArrayExpression(node, context);
      break;
    case 18:
      genFunctionExpression(node, context);
      break;
    case 19:
      genConditionalExpression(node, context);
      break;
    case 20:
      genCacheExpression(node, context);
      break;
    case 21:
      genNodeList(node.body, context, true, false);
      break;
    // SSR only types
    case 22:
      break;
    case 23:
      break;
    case 24:
      break;
    case 25:
      break;
    case 26:
      break;
    /* v8 ignore start */
    case 10:
      break;
    default:
      {
        assert(false, `unhandled codegen node type: ${node.type}`);
        const exhaustiveCheck = node;
        return exhaustiveCheck;
      }
  }
}
function genText(node, context) {
  context.push(JSON.stringify(node.content), -3 /* Unknown */, node);
}
function genExpression(node, context) {
  const { content, isStatic } = node;
  context.push(
    isStatic ? JSON.stringify(content) : content,
    -3 /* Unknown */,
    node
  );
}
function genInterpolation(node, context) {
  const { push, helper, pure } = context;
  if (pure) push(PURE_ANNOTATION);
  push(`${helper(TO_DISPLAY_STRING)}(`);
  genNode(node.content, context);
  push(`)`);
}
function genCompoundExpression(node, context) {
  for (let i = 0; i < node.children.length; i++) {
    const child = node.children[i];
    if (isString(child)) {
      context.push(child, -3 /* Unknown */);
    } else {
      genNode(child, context);
    }
  }
}
function genExpressionAsPropertyKey(node, context) {
  const { push } = context;
  if (node.type === 8) {
    push(`[`);
    genCompoundExpression(node, context);
    push(`]`);
  } else if (node.isStatic) {
    const text = isSimpleIdentifier(node.content) ? node.content : JSON.stringify(node.content);
    push(text, -2 /* None */, node);
  } else {
    push(`[${node.content}]`, -3 /* Unknown */, node);
  }
}
function genComment(node, context) {
  const { push, helper, pure } = context;
  if (pure) {
    push(PURE_ANNOTATION);
  }
  push(
    `${helper(CREATE_COMMENT)}(${JSON.stringify(node.content)})`,
    -3 /* Unknown */,
    node
  );
}
function genVNodeCall(node, context) {
  const { push, helper, pure } = context;
  const {
    tag,
    props,
    children,
    patchFlag,
    dynamicProps,
    directives,
    isBlock,
    disableTracking,
    isComponent
  } = node;
  let patchFlagString;
  if (patchFlag) {
    {
      if (patchFlag < 0) {
        patchFlagString = patchFlag + ` /* ${PatchFlagNames[patchFlag]} */`;
      } else {
        const flagNames = Object.keys(PatchFlagNames).map(Number).filter((n) => n > 0 && patchFlag & n).map((n) => PatchFlagNames[n]).join(`, `);
        patchFlagString = patchFlag + ` /* ${flagNames} */`;
      }
    }
  }
  if (directives) {
    push(helper(WITH_DIRECTIVES) + `(`);
  }
  if (isBlock) {
    push(`(${helper(OPEN_BLOCK)}(${disableTracking ? `true` : ``}), `);
  }
  if (pure) {
    push(PURE_ANNOTATION);
  }
  const callHelper = isBlock ? getVNodeBlockHelper(context.inSSR, isComponent) : getVNodeHelper(context.inSSR, isComponent);
  push(helper(callHelper) + `(`, -2 /* None */, node);
  genNodeList(
    genNullableArgs([tag, props, children, patchFlagString, dynamicProps]),
    context
  );
  push(`)`);
  if (isBlock) {
    push(`)`);
  }
  if (directives) {
    push(`, `);
    genNode(directives, context);
    push(`)`);
  }
}
function genNullableArgs(args) {
  let i = args.length;
  while (i--) {
    if (args[i] != null) break;
  }
  return args.slice(0, i + 1).map((arg) => arg || `null`);
}
function genCallExpression(node, context) {
  const { push, helper, pure } = context;
  const callee = isString(node.callee) ? node.callee : helper(node.callee);
  if (pure) {
    push(PURE_ANNOTATION);
  }
  push(callee + `(`, -2 /* None */, node);
  genNodeList(node.arguments, context);
  push(`)`);
}
function genObjectExpression(node, context) {
  const { push, indent, deindent, newline } = context;
  const { properties } = node;
  if (!properties.length) {
    push(`{}`, -2 /* None */, node);
    return;
  }
  const multilines = properties.length > 1 || properties.some((p) => p.value.type !== 4);
  push(multilines ? `{` : `{ `);
  multilines && indent();
  for (let i = 0; i < properties.length; i++) {
    const { key, value } = properties[i];
    genExpressionAsPropertyKey(key, context);
    push(`: `);
    genNode(value, context);
    if (i < properties.length - 1) {
      push(`,`);
      newline();
    }
  }
  multilines && deindent();
  push(multilines ? `}` : ` }`);
}
function genArrayExpression(node, context) {
  genNodeListAsArray(node.elements, context);
}
function genFunctionExpression(node, context) {
  const { push, indent, deindent } = context;
  const { params, returns, body, newline, isSlot } = node;
  if (isSlot) {
    push(`_${helperNameMap[WITH_CTX]}(`);
  }
  push(`(`, -2 /* None */, node);
  if (isArray(params)) {
    genNodeList(params, context);
  } else if (params) {
    genNode(params, context);
  }
  push(`) => `);
  if (newline || body) {
    push(`{`);
    indent();
  }
  if (returns) {
    if (newline) {
      push(`return `);
    }
    if (isArray(returns)) {
      genNodeListAsArray(returns, context);
    } else {
      genNode(returns, context);
    }
  } else if (body) {
    genNode(body, context);
  }
  if (newline || body) {
    deindent();
    push(`}`);
  }
  if (isSlot) {
    if (node.isNonScopedSlot) {
      push(`, undefined, true`);
    }
    push(`)`);
  }
}
function genConditionalExpression(node, context) {
  const { test, consequent, alternate, newline: needNewline } = node;
  const { push, indent, deindent, newline } = context;
  if (test.type === 4) {
    const needsParens = !isSimpleIdentifier(test.content);
    needsParens && push(`(`);
    genExpression(test, context);
    needsParens && push(`)`);
  } else {
    push(`(`);
    genNode(test, context);
    push(`)`);
  }
  needNewline && indent();
  context.indentLevel++;
  needNewline || push(` `);
  push(`? `);
  genNode(consequent, context);
  context.indentLevel--;
  needNewline && newline();
  needNewline || push(` `);
  push(`: `);
  const isNested = alternate.type === 19;
  if (!isNested) {
    context.indentLevel++;
  }
  genNode(alternate, context);
  if (!isNested) {
    context.indentLevel--;
  }
  needNewline && deindent(
    true
    /* without newline */
  );
}
function genCacheExpression(node, context) {
  const { push, helper, indent, deindent, newline } = context;
  const { needPauseTracking, needArraySpread } = node;
  if (needArraySpread) {
    push(`[...(`);
  }
  push(`_cache[${node.index}] || (`);
  if (needPauseTracking) {
    indent();
    push(`${helper(SET_BLOCK_TRACKING)}(-1`);
    if (node.inVOnce) push(`, true`);
    push(`),`);
    newline();
    push(`(`);
  }
  push(`_cache[${node.index}] = `);
  genNode(node.value, context);
  if (needPauseTracking) {
    push(`).cacheIndex = ${node.index},`);
    newline();
    push(`${helper(SET_BLOCK_TRACKING)}(1),`);
    newline();
    push(`_cache[${node.index}]`);
    deindent();
  }
  push(`)`);
  if (needArraySpread) {
    push(`)]`);
  }
}

const prohibitedKeywordRE = new RegExp(
  "\\b" + "arguments,await,break,case,catch,class,const,continue,debugger,default,delete,do,else,export,extends,finally,for,function,if,import,let,new,return,super,switch,throw,try,var,void,while,with,yield".split(",").join("\\b|\\b") + "\\b"
);
const stripStringRE = /'(?:[^'\\]|\\.)*'|"(?:[^"\\]|\\.)*"|`(?:[^`\\]|\\.)*\$\{|\}(?:[^`\\]|\\.)*`|`(?:[^`\\]|\\.)*`/g;
function validateBrowserExpression(node, context, asParams = false, asRawStatements = false) {
  const exp = node.content;
  if (!exp.trim()) {
    return;
  }
  try {
    new Function(
      asRawStatements ? ` ${exp} ` : `return ${asParams ? `(${exp}) => {}` : `(${exp})`}`
    );
  } catch (e) {
    let message = e.message;
    const keywordMatch = exp.replace(stripStringRE, "").match(prohibitedKeywordRE);
    if (keywordMatch) {
      message = `avoid using JavaScript keyword as property name: "${keywordMatch[0]}"`;
    }
    context.onError(
      createCompilerError(
        46,
        node.loc,
        void 0,
        message
      )
    );
  }
}

const transformExpression = (node, context) => {
  if (node.type === 5) {
    node.content = processExpression(
      node.content,
      context
    );
  } else if (node.type === 1) {
    const memo = findDir(node, "memo");
    for (let i = 0; i < node.props.length; i++) {
      const dir = node.props[i];
      if (dir.type === 7 && dir.name !== "for") {
        const exp = dir.exp;
        const arg = dir.arg;
        if (exp && exp.type === 4 && !(dir.name === "on" && arg) && // key has been processed in transformFor(vMemo + vFor)
        !(memo && context.vForMemoKeyedNodes.has(node) && arg && arg.type === 4 && arg.content === "key")) {
          dir.exp = processExpression(
            exp,
            context,
            // slot args must be processed as function params
            dir.name === "slot"
          );
        }
        if (arg && arg.type === 4 && !arg.isStatic) {
          dir.arg = processExpression(arg, context);
        }
      }
    }
  }
};
function processExpression(node, context, asParams = false, asRawStatements = false, localVars = Object.create(context.identifiers)) {
  {
    {
      validateBrowserExpression(node, context, asParams, asRawStatements);
    }
    return node;
  }
}

const transformIf = createStructuralDirectiveTransform(
  /^(?:if|else|else-if)$/,
  (node, dir, context) => {
    return processIf(node, dir, context, (ifNode, branch, isRoot) => {
      const siblings = context.parent.children;
      let i = siblings.indexOf(ifNode);
      let key = 0;
      while (i-- >= 0) {
        const sibling = siblings[i];
        if (sibling && sibling.type === 9) {
          key += sibling.branches.length;
        }
      }
      return () => {
        if (isRoot) {
          ifNode.codegenNode = createCodegenNodeForBranch(
            branch,
            key,
            context
          );
        } else {
          const parentCondition = getParentCondition(ifNode.codegenNode);
          parentCondition.alternate = createCodegenNodeForBranch(
            branch,
            key + ifNode.branches.length - 1,
            context
          );
        }
      };
    });
  }
);
function processIf(node, dir, context, processCodegen) {
  if (dir.name !== "else" && (!dir.exp || !dir.exp.content.trim())) {
    const loc = dir.exp ? dir.exp.loc : node.loc;
    context.onError(
      createCompilerError(28, dir.loc)
    );
    dir.exp = createSimpleExpression(`true`, false, loc);
  }
  if (dir.exp) {
    validateBrowserExpression(dir.exp, context);
  }
  if (dir.name === "if") {
    const branch = createIfBranch(node, dir);
    const ifNode = {
      type: 9,
      loc: cloneLoc(node.loc),
      branches: [branch]
    };
    context.replaceNode(ifNode);
    if (processCodegen) {
      return processCodegen(ifNode, branch, true);
    }
  } else {
    const siblings = context.parent.children;
    const comments = [];
    let i = siblings.indexOf(node);
    while (i-- >= -1) {
      const sibling = siblings[i];
      if (sibling && isCommentOrWhitespace(sibling)) {
        context.removeNode(sibling);
        if (sibling.type === 3) {
          comments.unshift(sibling);
        }
        continue;
      }
      if (sibling && sibling.type === 9) {
        if ((dir.name === "else-if" || dir.name === "else") && sibling.branches[sibling.branches.length - 1].condition === void 0) {
          context.onError(
            createCompilerError(30, node.loc)
          );
        }
        context.removeNode();
        const branch = createIfBranch(node, dir);
        if (comments.length && // #3619 ignore comments if the v-if is direct child of <transition>
        !(context.parent && context.parent.type === 1 && (context.parent.tag === "transition" || context.parent.tag === "Transition"))) {
          branch.children = [...comments, ...branch.children];
        }
        {
          const key = branch.userKey;
          if (key) {
            sibling.branches.forEach(({ userKey }) => {
              if (isSameKey(userKey, key)) {
                context.onError(
                  createCompilerError(
                    29,
                    branch.userKey.loc
                  )
                );
              }
            });
          }
        }
        sibling.branches.push(branch);
        const onExit = processCodegen && processCodegen(sibling, branch, false);
        traverseNode(branch, context);
        if (onExit) onExit();
        context.currentNode = null;
      } else {
        context.onError(
          createCompilerError(30, node.loc)
        );
      }
      break;
    }
  }
}
function createIfBranch(node, dir) {
  const isTemplateIf = node.tagType === 3;
  return {
    type: 10,
    loc: node.loc,
    condition: dir.name === "else" ? void 0 : dir.exp,
    children: isTemplateIf && !findDir(node, "for") ? node.children : [node],
    userKey: findProp(node, `key`),
    isTemplateIf
  };
}
function createCodegenNodeForBranch(branch, keyIndex, context) {
  if (branch.condition) {
    return createConditionalExpression(
      branch.condition,
      createChildrenCodegenNode(branch, keyIndex, context),
      // make sure to pass in asBlock: true so that the comment node call
      // closes the current block.
      createCallExpression(context.helper(CREATE_COMMENT), [
        '"v-if"' ,
        "true"
      ])
    );
  } else {
    return createChildrenCodegenNode(branch, keyIndex, context);
  }
}
function createChildrenCodegenNode(branch, keyIndex, context) {
  const { helper } = context;
  const keyProperty = createObjectProperty(
    `key`,
    createSimpleExpression(
      `${keyIndex}`,
      false,
      locStub,
      2
    )
  );
  const { children } = branch;
  const firstChild = children[0];
  const needFragmentWrapper = children.length !== 1 || firstChild.type !== 1;
  if (needFragmentWrapper) {
    if (children.length === 1 && firstChild.type === 11) {
      const vnodeCall = firstChild.codegenNode;
      injectProp(vnodeCall, keyProperty, context);
      return vnodeCall;
    } else {
      let patchFlag = 64;
      if (!branch.isTemplateIf && children.filter((c) => c.type !== 3).length === 1) {
        patchFlag |= 2048;
      }
      return createVNodeCall(
        context,
        helper(FRAGMENT),
        createObjectExpression([keyProperty]),
        children,
        patchFlag,
        void 0,
        void 0,
        true,
        false,
        false,
        branch.loc
      );
    }
  } else {
    const ret = firstChild.codegenNode;
    const vnodeCall = getMemoedVNodeCall(ret);
    if (vnodeCall.type === 13) {
      convertToBlock(vnodeCall, context);
    }
    injectProp(vnodeCall, keyProperty, context);
    return ret;
  }
}
function isSameKey(a, b) {
  if (!a || a.type !== b.type) {
    return false;
  }
  if (a.type === 6) {
    if (a.value.content !== b.value.content) {
      return false;
    }
  } else {
    const exp = a.exp;
    const branchExp = b.exp;
    if (exp.type !== branchExp.type) {
      return false;
    }
    if (exp.type !== 4 || exp.isStatic !== branchExp.isStatic || exp.content !== branchExp.content) {
      return false;
    }
  }
  return true;
}
function getParentCondition(node) {
  while (true) {
    if (node.type === 19) {
      if (node.alternate.type === 19) {
        node = node.alternate;
      } else {
        return node;
      }
    } else if (node.type === 20) {
      node = node.value;
    }
  }
}

const transformFor = createStructuralDirectiveTransform(
  "for",
  (node, dir, context) => {
    const { helper, removeHelper } = context;
    return processFor(node, dir, context, (forNode) => {
      const renderExp = createCallExpression(helper(RENDER_LIST), [
        forNode.source
      ]);
      const isTemplate = isTemplateNode(node);
      const memo = findDir(node, "memo");
      const keyProp = findProp(node, `key`, false, true);
      keyProp && keyProp.type === 7;
      let keyExp = keyProp && (keyProp.type === 6 ? keyProp.value ? createSimpleExpression(keyProp.value.content, true) : void 0 : keyProp.exp);
      const keyProperty = keyExp ? createObjectProperty(`key`, keyExp) : null;
      const isStableFragment = forNode.source.type === 4 && forNode.source.constType > 0;
      const fragmentFlag = isStableFragment ? 64 : keyProp ? 128 : 256;
      forNode.codegenNode = createVNodeCall(
        context,
        helper(FRAGMENT),
        void 0,
        renderExp,
        fragmentFlag,
        void 0,
        void 0,
        true,
        !isStableFragment,
        false,
        node.loc
      );
      return () => {
        var _a;
        let childBlock;
        const { children } = forNode;
        if (isTemplate) {
          node.children.some((c) => {
            if (c.type === 1) {
              const key = findProp(c, "key");
              if (key) {
                context.onError(
                  createCompilerError(
                    33,
                    key.loc
                  )
                );
                return true;
              }
            }
          });
        }
        const needFragmentWrapper = children.length !== 1 || children[0].type !== 1;
        const slotOutlet = isSlotOutlet(node) ? node : isTemplate && node.children.length === 1 && isSlotOutlet(node.children[0]) ? node.children[0] : null;
        if (slotOutlet) {
          childBlock = slotOutlet.codegenNode;
          if (isTemplate && keyProperty) {
            injectProp(childBlock, keyProperty, context);
          }
        } else if (needFragmentWrapper) {
          childBlock = createVNodeCall(
            context,
            helper(FRAGMENT),
            keyProperty ? createObjectExpression([keyProperty]) : void 0,
            node.children,
            64,
            void 0,
            void 0,
            true,
            void 0,
            false
          );
        } else {
          childBlock = children[0].codegenNode;
          if (isTemplate && keyProperty) {
            injectProp(childBlock, keyProperty, context);
          }
          const shouldUseBlock = !isStableFragment || childBlock.isBlockRequired === true;
          if (childBlock.isBlock !== shouldUseBlock) {
            if (childBlock.isBlock) {
              removeHelper(OPEN_BLOCK);
              removeHelper(
                getVNodeBlockHelper(context.inSSR, childBlock.isComponent)
              );
            } else {
              removeHelper(
                getVNodeHelper(context.inSSR, childBlock.isComponent)
              );
            }
          }
          childBlock.isBlock = shouldUseBlock;
          if (childBlock.isBlock) {
            helper(OPEN_BLOCK);
            helper(getVNodeBlockHelper(context.inSSR, childBlock.isComponent));
          } else {
            helper(getVNodeHelper(context.inSSR, childBlock.isComponent));
            if (childBlock.needsPatch) {
              childBlock.patchFlag = ((_a = childBlock.patchFlag) != null ? _a : 0) | 512;
            }
          }
        }
        if (memo) {
          const loop = createFunctionExpression(
            createForLoopParams(forNode.parseResult, [
              createSimpleExpression(`_cached`)
            ])
          );
          loop.body = createBlockStatement([
            createCompoundExpression([`const _memo = (`, memo.exp, `)`]),
            createCompoundExpression([
              `if (_cached && _cached.el`,
              ...keyExp ? [` && _cached.key === `, keyExp] : [],
              ` && ${context.helperString(
                IS_MEMO_SAME
              )}(_cached, _memo)) return _cached`
            ]),
            createCompoundExpression([`const _item = `, childBlock]),
            createSimpleExpression(`_item.memo = _memo`),
            createSimpleExpression(`return _item`)
          ]);
          renderExp.arguments.push(
            loop,
            createSimpleExpression(`_cache`),
            createSimpleExpression(String(context.cached.length))
          );
          context.cached.push(null);
        } else {
          renderExp.arguments.push(
            createFunctionExpression(
              createForLoopParams(forNode.parseResult),
              childBlock,
              true
            )
          );
        }
      };
    });
  }
);
function processFor(node, dir, context, processCodegen) {
  if (!dir.exp) {
    context.onError(
      createCompilerError(31, dir.loc)
    );
    return;
  }
  const parseResult = dir.forParseResult;
  if (!parseResult) {
    context.onError(
      createCompilerError(32, dir.loc)
    );
    return;
  }
  finalizeForParseResult(parseResult, context);
  const { addIdentifiers, removeIdentifiers, scopes } = context;
  const { source, value, key, index } = parseResult;
  const forNode = {
    type: 11,
    loc: dir.loc,
    source,
    valueAlias: value,
    keyAlias: key,
    objectIndexAlias: index,
    parseResult,
    children: isTemplateNode(node) ? node.children : [node]
  };
  context.replaceNode(forNode);
  scopes.vFor++;
  const onExit = processCodegen && processCodegen(forNode);
  return () => {
    scopes.vFor--;
    if (onExit) onExit();
  };
}
function finalizeForParseResult(result, context) {
  if (result.finalized) return;
  {
    validateBrowserExpression(result.source, context);
    if (result.key) {
      validateBrowserExpression(
        result.key,
        context,
        true
      );
    }
    if (result.index) {
      validateBrowserExpression(
        result.index,
        context,
        true
      );
    }
    if (result.value) {
      validateBrowserExpression(
        result.value,
        context,
        true
      );
    }
  }
  result.finalized = true;
}
function createForLoopParams({ value, key, index }, memoArgs = []) {
  return createParamsList([value, key, index, ...memoArgs]);
}
function createParamsList(args) {
  let i = args.length;
  while (i--) {
    if (args[i]) break;
  }
  return args.slice(0, i + 1).map((arg, i2) => arg || createSimpleExpression(`_`.repeat(i2 + 1), false));
}

const defaultFallback = createSimpleExpression(`undefined`, false);
const trackSlotScopes = (node, context) => {
  if (node.type === 1 && (node.tagType === 1 || node.tagType === 3)) {
    const vSlot = findDir(node, "slot");
    if (vSlot) {
      vSlot.exp;
      context.scopes.vSlot++;
      return () => {
        context.scopes.vSlot--;
      };
    }
  }
};
const buildClientSlotFn = (props, _vForExp, children, loc) => createFunctionExpression(
  props,
  children,
  false,
  true,
  children.length ? children[0].loc : loc
);
function buildSlots(node, context, buildSlotFn = buildClientSlotFn) {
  context.helper(WITH_CTX);
  const { children, loc } = node;
  const slotsProperties = [];
  const dynamicSlots = [];
  let hasDynamicSlots = context.scopes.vSlot > 0 || context.scopes.vFor > 0;
  const onComponentSlot = findDir(node, "slot", true);
  if (onComponentSlot) {
    const { arg, exp } = onComponentSlot;
    if (arg && !isStaticExp(arg)) {
      hasDynamicSlots = true;
    }
    slotsProperties.push(
      createObjectProperty(
        arg || createSimpleExpression("default", true),
        buildSlotFn(exp, void 0, children, loc)
      )
    );
  }
  let hasTemplateSlots = false;
  let hasNamedDefaultSlot = false;
  const implicitDefaultChildren = [];
  const seenSlotNames = /* @__PURE__ */ new Set();
  let conditionalBranchIndex = 0;
  for (let i = 0; i < children.length; i++) {
    const slotElement = children[i];
    let slotDir;
    if (!isTemplateNode(slotElement) || !(slotDir = findDir(slotElement, "slot", true))) {
      if (slotElement.type !== 3) {
        implicitDefaultChildren.push(slotElement);
      }
      continue;
    }
    if (onComponentSlot) {
      context.onError(
        createCompilerError(37, slotDir.loc)
      );
      break;
    }
    hasTemplateSlots = true;
    const { children: slotChildren, loc: slotLoc } = slotElement;
    const {
      arg: slotName = createSimpleExpression(`default`, true),
      exp: slotProps,
      loc: dirLoc
    } = slotDir;
    let staticSlotName;
    if (isStaticExp(slotName)) {
      staticSlotName = slotName ? slotName.content : `default`;
    } else {
      hasDynamicSlots = true;
    }
    const vFor = findDir(slotElement, "for");
    const slotFunction = buildSlotFn(slotProps, vFor, slotChildren, slotLoc);
    let vIf;
    let vElse;
    if (vIf = findDir(slotElement, "if")) {
      hasDynamicSlots = true;
      dynamicSlots.push(
        createConditionalExpression(
          vIf.exp,
          buildDynamicSlot(slotName, slotFunction, conditionalBranchIndex++),
          defaultFallback
        )
      );
    } else if (vElse = findDir(
      slotElement,
      /^else(?:-if)?$/,
      true
      /* allowEmpty */
    )) {
      let j = i;
      let prev;
      while (j--) {
        prev = children[j];
        if (!isCommentOrWhitespace(prev)) {
          break;
        }
      }
      if (prev && isTemplateNode(prev) && findDir(prev, /^(?:else-)?if$/)) {
        let conditional = dynamicSlots[dynamicSlots.length - 1];
        while (conditional.alternate.type === 19) {
          conditional = conditional.alternate;
        }
        conditional.alternate = vElse.exp ? createConditionalExpression(
          vElse.exp,
          buildDynamicSlot(
            slotName,
            slotFunction,
            conditionalBranchIndex++
          ),
          defaultFallback
        ) : buildDynamicSlot(slotName, slotFunction, conditionalBranchIndex++);
      } else {
        context.onError(
          createCompilerError(30, vElse.loc)
        );
      }
    } else if (vFor) {
      hasDynamicSlots = true;
      const parseResult = vFor.forParseResult;
      if (parseResult) {
        finalizeForParseResult(parseResult, context);
        dynamicSlots.push(
          createCallExpression(context.helper(RENDER_LIST), [
            parseResult.source,
            createFunctionExpression(
              createForLoopParams(parseResult),
              buildDynamicSlot(slotName, slotFunction),
              true
            )
          ])
        );
      } else {
        context.onError(
          createCompilerError(
            32,
            vFor.loc
          )
        );
      }
    } else {
      if (staticSlotName) {
        if (seenSlotNames.has(staticSlotName)) {
          context.onError(
            createCompilerError(
              38,
              dirLoc
            )
          );
          continue;
        }
        seenSlotNames.add(staticSlotName);
        if (staticSlotName === "default") {
          hasNamedDefaultSlot = true;
        }
      }
      slotsProperties.push(createObjectProperty(slotName, slotFunction));
    }
  }
  if (!onComponentSlot) {
    const buildDefaultSlotProperty = (props, children2) => {
      const fn = buildSlotFn(props, void 0, children2, loc);
      if (context.compatConfig) {
        fn.isNonScopedSlot = true;
      }
      return createObjectProperty(`default`, fn);
    };
    if (!hasTemplateSlots) {
      slotsProperties.push(buildDefaultSlotProperty(void 0, children));
    } else if (implicitDefaultChildren.length && // #3766
    // with whitespace: 'preserve', whitespaces between slots will end up in
    // implicitDefaultChildren. Ignore if all implicit children are whitespaces.
    !implicitDefaultChildren.every(isWhitespaceText)) {
      if (hasNamedDefaultSlot) {
        context.onError(
          createCompilerError(
            39,
            implicitDefaultChildren[0].loc
          )
        );
      } else {
        slotsProperties.push(
          buildDefaultSlotProperty(void 0, implicitDefaultChildren)
        );
      }
    }
  }
  const slotFlag = hasDynamicSlots ? 2 : hasForwardedSlots(node.children) ? 3 : 1;
  let slots = createObjectExpression(
    slotsProperties.concat(
      createObjectProperty(
        `_`,
        // 2 = compiled but dynamic = can skip normalization, but must run diff
        // 1 = compiled and static = can skip normalization AND diff as optimized
        createSimpleExpression(
          slotFlag + (` /* ${slotFlagsText[slotFlag]} */` ),
          false
        )
      )
    ),
    loc
  );
  if (dynamicSlots.length) {
    slots = createCallExpression(context.helper(CREATE_SLOTS), [
      slots,
      createArrayExpression(dynamicSlots)
    ]);
  }
  return {
    slots,
    hasDynamicSlots
  };
}
function buildDynamicSlot(name, fn, index) {
  const props = [
    createObjectProperty(`name`, name),
    createObjectProperty(`fn`, fn)
  ];
  if (index != null) {
    props.push(
      createObjectProperty(`key`, createSimpleExpression(String(index), true))
    );
  }
  return createObjectExpression(props);
}
function hasForwardedSlots(children) {
  for (let i = 0; i < children.length; i++) {
    const child = children[i];
    switch (child.type) {
      case 1:
        if (child.tagType === 2 || hasForwardedSlots(child.children)) {
          return true;
        }
        break;
      case 9:
        if (hasForwardedSlots(child.branches)) return true;
        break;
      case 10:
      case 11:
        if (hasForwardedSlots(child.children)) return true;
        break;
    }
  }
  return false;
}

const directiveImportMap = /* @__PURE__ */ new WeakMap();
const transformElement = (node, context) => {
  return function postTransformElement() {
    node = context.currentNode;
    if (!(node.type === 1 && (node.tagType === 0 || node.tagType === 1))) {
      return;
    }
    const { tag, props } = node;
    const isComponent = node.tagType === 1;
    let vnodeTag = isComponent ? resolveComponentType(node, context) : `"${tag}"`;
    const isDynamicComponent = isObject(vnodeTag) && vnodeTag.callee === RESOLVE_DYNAMIC_COMPONENT;
    let vnodeProps;
    let vnodeChildren;
    let patchFlag = 0;
    let vnodeDynamicProps;
    let dynamicPropNames;
    let vnodeDirectives;
    let needsPatch = false;
    let isBlockRequired = false;
    let shouldUseBlock = (
      // dynamic component may resolve to plain elements
      isDynamicComponent || vnodeTag === TELEPORT || vnodeTag === SUSPENSE || !isComponent && // <svg> and <foreignObject> must be forced into blocks so that block
      // updates inside get proper isSVG flag at runtime. (#639, #643)
      // This is technically web-specific, but splitting the logic out of core
      // leads to too much unnecessary complexity.
      (tag === "svg" || tag === "foreignObject" || tag === "math")
    );
    if (props.length > 0) {
      const propsBuildResult = buildProps(
        node,
        context,
        void 0,
        isComponent,
        isDynamicComponent
      );
      vnodeProps = propsBuildResult.props;
      patchFlag = propsBuildResult.patchFlag;
      dynamicPropNames = propsBuildResult.dynamicPropNames;
      needsPatch = propsBuildResult.needsPatch;
      isBlockRequired = propsBuildResult.isBlockRequired;
      const directives = propsBuildResult.directives;
      vnodeDirectives = directives && directives.length ? createArrayExpression(
        directives.map((dir) => buildDirectiveArgs(dir, context))
      ) : void 0;
      if (propsBuildResult.shouldUseBlock) {
        shouldUseBlock = true;
      }
    }
    if (node.children.length > 0) {
      if (vnodeTag === KEEP_ALIVE) {
        shouldUseBlock = true;
        patchFlag |= 1024;
        if (node.children.length > 1) {
          context.onError(
            createCompilerError(47, {
              start: node.children[0].loc.start,
              end: node.children[node.children.length - 1].loc.end,
              source: ""
            })
          );
        }
      }
      const shouldBuildAsSlots = isComponent && // Teleport is not a real component and has dedicated runtime handling
      vnodeTag !== TELEPORT && // explained above.
      vnodeTag !== KEEP_ALIVE;
      if (shouldBuildAsSlots) {
        const { slots, hasDynamicSlots } = buildSlots(node, context);
        vnodeChildren = slots;
        if (hasDynamicSlots) {
          patchFlag |= 1024;
        }
      } else if (node.children.length === 1 && vnodeTag !== TELEPORT) {
        const child = node.children[0];
        const type = child.type;
        const hasDynamicTextChild = type === 5 || type === 8;
        if (hasDynamicTextChild && getConstantType(child, context) === 0) {
          patchFlag |= 1;
        }
        if (hasDynamicTextChild || type === 2) {
          vnodeChildren = child;
        } else {
          vnodeChildren = node.children;
        }
      } else {
        vnodeChildren = node.children;
      }
    }
    if (dynamicPropNames && dynamicPropNames.length) {
      vnodeDynamicProps = stringifyDynamicPropNames(dynamicPropNames);
    }
    const vnodeCall = node.codegenNode = createVNodeCall(
      context,
      vnodeTag,
      vnodeProps,
      vnodeChildren,
      patchFlag === 0 ? void 0 : patchFlag,
      vnodeDynamicProps,
      vnodeDirectives,
      !!shouldUseBlock,
      false,
      isComponent,
      node.loc
    );
    needsPatch = needsPatch && (patchFlag === 0 || patchFlag === 32);
    if (needsPatch) {
      vnodeCall.needsPatch = true;
    }
    if (isBlockRequired) {
      vnodeCall.isBlockRequired = true;
    }
  };
};
function resolveComponentType(node, context, ssr = false) {
  let { tag } = node;
  const isExplicitDynamic = isComponentTag(tag);
  const isProp = findProp(
    node,
    "is",
    false,
    true
    /* allow empty */
  );
  if (isProp) {
    if (isExplicitDynamic || isCompatEnabled(
      "COMPILER_IS_ON_ELEMENT",
      context
    )) {
      let exp;
      if (isProp.type === 6) {
        exp = isProp.value && createSimpleExpression(isProp.value.content, true);
      } else {
        exp = isProp.exp;
        if (!exp) {
          exp = createSimpleExpression(`is`, false, isProp.arg.loc);
        }
      }
      if (exp) {
        return createCallExpression(context.helper(RESOLVE_DYNAMIC_COMPONENT), [
          exp
        ]);
      }
    } else if (isProp.type === 6 && isProp.value.content.startsWith("vue:")) {
      tag = isProp.value.content.slice(4);
    }
  }
  const builtIn = isCoreComponent(tag) || context.isBuiltInComponent(tag);
  if (builtIn) {
    if (!ssr) context.helper(builtIn);
    return builtIn;
  }
  context.helper(RESOLVE_COMPONENT);
  context.components.add(tag);
  return toValidAssetId(tag, `component`);
}
function buildProps(node, context, props = node.props, isComponent, isDynamicComponent, ssr = false) {
  const { tag, loc: elementLoc, children } = node;
  let properties = [];
  const mergeArgs = [];
  const runtimeDirectives = [];
  const hasChildren = children.length > 0;
  let shouldUseBlock = false;
  let isBlockRequired = false;
  let patchFlag = 0;
  let hasRef = false;
  let hasClassBinding = false;
  let hasStyleBinding = false;
  let hasHydrationEventBinding = false;
  let hasDynamicKeys = false;
  let hasVnodeHook = false;
  const dynamicPropNames = [];
  const pushMergeArg = (arg) => {
    if (properties.length) {
      mergeArgs.push(
        createObjectExpression(dedupeProperties(properties), elementLoc)
      );
      properties = [];
    }
    if (arg) mergeArgs.push(arg);
  };
  const pushRefVForMarker = () => {
    if (context.scopes.vFor > 0) {
      properties.push(
        createObjectProperty(
          createSimpleExpression("ref_for", true),
          createSimpleExpression("true")
        )
      );
    }
  };
  const analyzePatchFlag = ({ key, value }) => {
    if (isStaticExp(key)) {
      const name = key.content;
      const isEventHandler = isOn(name);
      if (isEventHandler && (!isComponent || isDynamicComponent) && // omit the flag for click handlers because hydration gives click
      // dedicated fast path.
      name.toLowerCase() !== "onclick" && // omit v-model handlers
      name !== "onUpdate:modelValue" && // omit onVnodeXXX hooks
      !isReservedProp(name)) {
        hasHydrationEventBinding = true;
      }
      if (isEventHandler && isReservedProp(name)) {
        hasVnodeHook = true;
      }
      if (name === "ref") {
        hasRef = true;
      }
      if (isEventHandler && value.type === 14) {
        value = value.arguments[0];
      }
      if (value.type === 20 || (value.type === 4 || value.type === 8) && getConstantType(value, context) > 0) {
        return;
      }
      if (name === "class") {
        hasClassBinding = true;
      } else if (name === "style") {
        hasStyleBinding = true;
      } else if (name !== "ref" && name !== "key" && !dynamicPropNames.includes(name)) {
        dynamicPropNames.push(name);
      }
      if (isComponent && (name === "class" || name === "style") && !dynamicPropNames.includes(name)) {
        dynamicPropNames.push(name);
      }
    } else {
      hasDynamicKeys = true;
    }
  };
  for (let i = 0; i < props.length; i++) {
    const prop = props[i];
    if (prop.type === 6) {
      const { loc, name, nameLoc, value } = prop;
      let isStatic = true;
      if (name === "ref") {
        hasRef = true;
        pushRefVForMarker();
      }
      if (name === "is" && (isComponentTag(tag) || value && value.content.startsWith("vue:") || isCompatEnabled(
        "COMPILER_IS_ON_ELEMENT",
        context
      ))) {
        continue;
      }
      properties.push(
        createObjectProperty(
          createSimpleExpression(name, true, nameLoc),
          createSimpleExpression(
            value ? value.content : "",
            isStatic,
            value ? value.loc : loc
          )
        )
      );
    } else {
      const { name, arg, exp, loc, modifiers } = prop;
      const isVBind = name === "bind";
      const isVOn = name === "on";
      if (name === "slot") {
        if (!isComponent) {
          context.onError(
            createCompilerError(40, loc)
          );
        }
        continue;
      }
      if (name === "once" || name === "memo") {
        continue;
      }
      if (name === "is" || isVBind && isStaticArgOf(arg, "is") && (isComponentTag(tag) || isCompatEnabled(
        "COMPILER_IS_ON_ELEMENT",
        context
      ))) {
        continue;
      }
      if (isVOn && ssr) {
        continue;
      }
      if (isVBind && isStaticArgOf(arg, "key")) {
        shouldUseBlock = true;
      }
      if (isVOn && hasChildren && arg && isStaticExp(arg) && camelize(arg.content) === "vue:beforeUpdate") {
        shouldUseBlock = true;
        isBlockRequired = true;
      }
      if (isVBind && isStaticArgOf(arg, "ref")) {
        pushRefVForMarker();
      }
      if (!arg && (isVBind || isVOn)) {
        hasDynamicKeys = true;
        if (exp) {
          if (isVBind) {
            {
              pushMergeArg();
              {
                const hasOverridableKeys = mergeArgs.some((arg2) => {
                  if (arg2.type === 15) {
                    return arg2.properties.some(({ key }) => {
                      if (key.type !== 4 || !key.isStatic) {
                        return true;
                      }
                      return key.content !== "class" && key.content !== "style" && !isOn(key.content);
                    });
                  } else {
                    return true;
                  }
                });
                if (hasOverridableKeys) {
                  checkCompatEnabled(
                    "COMPILER_V_BIND_OBJECT_ORDER",
                    context,
                    loc
                  );
                }
              }
              if (isCompatEnabled(
                "COMPILER_V_BIND_OBJECT_ORDER",
                context
              )) {
                mergeArgs.unshift(exp);
                continue;
              }
            }
            pushRefVForMarker();
            pushMergeArg();
            mergeArgs.push(exp);
          } else {
            pushMergeArg({
              type: 14,
              loc,
              callee: context.helper(TO_HANDLERS),
              arguments: isComponent ? [exp] : [exp, `true`]
            });
          }
        } else {
          context.onError(
            createCompilerError(
              isVBind ? 34 : 35,
              loc
            )
          );
        }
        continue;
      }
      if (isVBind && modifiers.some((mod) => mod.content === "prop")) {
        patchFlag |= 32;
      }
      const directiveTransform = context.directiveTransforms[name];
      if (directiveTransform) {
        const { props: props2, needRuntime } = directiveTransform(prop, node, context);
        !ssr && props2.forEach(analyzePatchFlag);
        if (isVOn && arg && !isStaticExp(arg)) {
          pushMergeArg(createObjectExpression(props2, elementLoc));
        } else {
          properties.push(...props2);
        }
        if (needRuntime) {
          runtimeDirectives.push(prop);
          if (isSymbol(needRuntime)) {
            directiveImportMap.set(prop, needRuntime);
          }
        }
      } else if (!isBuiltInDirective(name)) {
        runtimeDirectives.push(prop);
        if (hasChildren) {
          shouldUseBlock = true;
          isBlockRequired = true;
        }
      }
    }
  }
  let propsExpression = void 0;
  if (mergeArgs.length) {
    pushMergeArg();
    if (mergeArgs.length > 1) {
      propsExpression = createCallExpression(
        context.helper(MERGE_PROPS),
        mergeArgs,
        elementLoc
      );
    } else {
      propsExpression = mergeArgs[0];
    }
  } else if (properties.length) {
    propsExpression = createObjectExpression(
      dedupeProperties(properties),
      elementLoc
    );
  }
  if (hasDynamicKeys) {
    patchFlag |= 16;
  } else {
    if (hasClassBinding && !isComponent) {
      patchFlag |= 2;
    }
    if (hasStyleBinding && !isComponent) {
      patchFlag |= 4;
    }
    if (dynamicPropNames.length) {
      patchFlag |= 8;
    }
    if (hasHydrationEventBinding) {
      patchFlag |= 32;
    }
  }
  const needsPatch = (patchFlag === 0 || patchFlag === 32) && (hasRef || hasVnodeHook || runtimeDirectives.length > 0);
  if (!shouldUseBlock && needsPatch) {
    patchFlag |= 512;
  }
  if (!context.inSSR && propsExpression) {
    switch (propsExpression.type) {
      case 15:
        let classKeyIndex = -1;
        let styleKeyIndex = -1;
        let hasDynamicKey = false;
        for (let i = 0; i < propsExpression.properties.length; i++) {
          const key = propsExpression.properties[i].key;
          if (isStaticExp(key)) {
            if (key.content === "class") {
              classKeyIndex = i;
            } else if (key.content === "style") {
              styleKeyIndex = i;
            }
          } else if (!key.isHandlerKey) {
            hasDynamicKey = true;
          }
        }
        const classProp = propsExpression.properties[classKeyIndex];
        const styleProp = propsExpression.properties[styleKeyIndex];
        if (!hasDynamicKey) {
          if (classProp && !isStaticExp(classProp.value)) {
            classProp.value = createCallExpression(
              context.helper(NORMALIZE_CLASS),
              [classProp.value]
            );
          }
          if (styleProp && // the static style is compiled into an object,
          // so use `hasStyleBinding` to ensure that it is a dynamic style binding
          (hasStyleBinding || styleProp.value.type === 4 && styleProp.value.content.trim()[0] === `[` || // v-bind:style and style both exist,
          // v-bind:style with static literal object
          styleProp.value.type === 17)) {
            styleProp.value = createCallExpression(
              context.helper(NORMALIZE_STYLE),
              [styleProp.value]
            );
          }
        } else {
          propsExpression = createCallExpression(
            context.helper(NORMALIZE_PROPS),
            [propsExpression]
          );
        }
        break;
      case 14:
        break;
      default:
        propsExpression = createCallExpression(
          context.helper(NORMALIZE_PROPS),
          [
            createCallExpression(context.helper(GUARD_REACTIVE_PROPS), [
              propsExpression
            ])
          ]
        );
        break;
    }
  }
  return {
    props: propsExpression,
    directives: runtimeDirectives,
    patchFlag,
    dynamicPropNames,
    shouldUseBlock,
    needsPatch,
    isBlockRequired
  };
}
function dedupeProperties(properties) {
  const knownProps = /* @__PURE__ */ new Map();
  const deduped = [];
  for (let i = 0; i < properties.length; i++) {
    const prop = properties[i];
    if (prop.key.type === 8 || !prop.key.isStatic) {
      deduped.push(prop);
      continue;
    }
    const name = prop.key.content;
    const existing = knownProps.get(name);
    if (existing) {
      if (name === "style" || name === "class" || isOn(name)) {
        mergeAsArray$1(existing, prop);
      }
    } else {
      knownProps.set(name, prop);
      deduped.push(prop);
    }
  }
  return deduped;
}
function mergeAsArray$1(existing, incoming) {
  if (existing.value.type === 17) {
    existing.value.elements.push(incoming.value);
  } else {
    existing.value = createArrayExpression(
      [existing.value, incoming.value],
      existing.loc
    );
  }
}
function buildDirectiveArgs(dir, context) {
  const dirArgs = [];
  const runtime = directiveImportMap.get(dir);
  if (runtime) {
    dirArgs.push(context.helperString(runtime));
  } else {
    {
      context.helper(RESOLVE_DIRECTIVE);
      context.directives.add(dir.name);
      dirArgs.push(toValidAssetId(dir.name, `directive`));
    }
  }
  const { loc } = dir;
  if (dir.exp) dirArgs.push(dir.exp);
  if (dir.arg) {
    if (!dir.exp) {
      dirArgs.push(`void 0`);
    }
    dirArgs.push(dir.arg);
  }
  if (Object.keys(dir.modifiers).length) {
    if (!dir.arg) {
      if (!dir.exp) {
        dirArgs.push(`void 0`);
      }
      dirArgs.push(`void 0`);
    }
    const trueExpression = createSimpleExpression(`true`, false, loc);
    dirArgs.push(
      createObjectExpression(
        dir.modifiers.map(
          (modifier) => createObjectProperty(modifier, trueExpression)
        ),
        loc
      )
    );
  }
  return createArrayExpression(dirArgs, dir.loc);
}
function stringifyDynamicPropNames(props) {
  let propsNamesString = `[`;
  for (let i = 0, l = props.length; i < l; i++) {
    propsNamesString += JSON.stringify(props[i]);
    if (i < l - 1) propsNamesString += ", ";
  }
  return propsNamesString + `]`;
}
function isComponentTag(tag) {
  return tag === "component" || tag === "Component";
}

const transformSlotOutlet = (node, context) => {
  if (isSlotOutlet(node)) {
    const { children, loc } = node;
    const { slotName, slotProps } = processSlotOutlet(node, context);
    const slotArgs = [
      context.prefixIdentifiers ? `_ctx.$slots` : `$slots`,
      slotName,
      "{}",
      "undefined",
      "true"
    ];
    let expectedLen = 2;
    if (slotProps) {
      slotArgs[2] = slotProps;
      expectedLen = 3;
    }
    if (children.length) {
      slotArgs[3] = createFunctionExpression([], children, false, false, loc);
      expectedLen = 4;
    }
    if (context.scopeId && !context.slotted) {
      expectedLen = 5;
    }
    slotArgs.splice(expectedLen);
    node.codegenNode = createCallExpression(
      context.helper(RENDER_SLOT),
      slotArgs,
      loc
    );
  }
};
function processSlotOutlet(node, context) {
  let slotName = `"default"`;
  let slotProps = void 0;
  const nonNameProps = [];
  for (let i = 0; i < node.props.length; i++) {
    const p = node.props[i];
    if (p.type === 6) {
      if (p.value) {
        if (p.name === "name") {
          slotName = JSON.stringify(p.value.content);
        } else {
          p.name = camelize(p.name);
          nonNameProps.push(p);
        }
      }
    } else {
      if (p.name === "bind" && isStaticArgOf(p.arg, "name")) {
        if (p.exp) {
          slotName = p.exp;
        } else if (p.arg && p.arg.type === 4) {
          const name = camelize(p.arg.content);
          slotName = p.exp = createSimpleExpression(name, false, p.arg.loc);
        }
      } else {
        if (p.name === "bind" && p.arg && isStaticExp(p.arg)) {
          p.arg.content = camelize(p.arg.content);
        }
        nonNameProps.push(p);
      }
    }
  }
  if (nonNameProps.length > 0) {
    const { props, directives } = buildProps(
      node,
      context,
      nonNameProps,
      false,
      false
    );
    slotProps = props;
    if (directives.length) {
      context.onError(
        createCompilerError(
          36,
          directives[0].loc
        )
      );
    }
  }
  return {
    slotName,
    slotProps
  };
}

const transformOn$1 = (dir, node, context, augmentor) => {
  const { loc, modifiers, arg } = dir;
  if (!dir.exp && !modifiers.length) {
    context.onError(createCompilerError(35, loc));
  }
  let eventName;
  if (arg.type === 4) {
    if (arg.isStatic) {
      let rawName = arg.content;
      if (rawName.startsWith("vnode")) {
        context.onError(createCompilerError(52, arg.loc));
      }
      if (rawName.startsWith("vue:")) {
        rawName = `vnode-${rawName.slice(4)}`;
      }
      const eventString = node.tagType !== 0 || rawName.startsWith("vnode") || !/[A-Z]/.test(rawName) ? (
        // for non-element and vnode lifecycle event listeners, auto convert
        // it to camelCase. See issue #2249
        toHandlerKey(camelize(rawName))
      ) : (
        // preserve case for plain element listeners that have uppercase
        // letters, as these may be custom elements' custom events
        `on:${rawName}`
      );
      eventName = createSimpleExpression(eventString, true, arg.loc);
    } else {
      eventName = createCompoundExpression([
        `${context.helperString(TO_HANDLER_KEY)}(`,
        arg,
        `)`
      ]);
    }
  } else {
    eventName = arg;
    eventName.children.unshift(`${context.helperString(TO_HANDLER_KEY)}(`);
    eventName.children.push(`)`);
  }
  let exp = dir.exp;
  if (exp && !exp.content.trim()) {
    exp = void 0;
  }
  let shouldCache = context.cacheHandlers && !exp && !context.inVOnce;
  if (exp) {
    const isMemberExp = isMemberExpression(exp);
    const isInlineStatement = !(isMemberExp || isFnExpression(exp));
    const hasMultipleStatements = exp.content.includes(`;`);
    {
      validateBrowserExpression(
        exp,
        context,
        false,
        hasMultipleStatements
      );
    }
    if (isInlineStatement || shouldCache && isMemberExp) {
      exp = createCompoundExpression([
        `${isInlineStatement ? `$event` : `${``}(...args)`} => ${hasMultipleStatements ? `{` : `(`}`,
        exp,
        hasMultipleStatements ? `}` : `)`
      ]);
    }
  }
  let ret = {
    props: [
      createObjectProperty(
        eventName,
        exp || createSimpleExpression(`() => {}`, false, loc)
      )
    ]
  };
  if (augmentor) {
    ret = augmentor(ret);
  }
  if (shouldCache) {
    ret.props[0].value = context.cache(ret.props[0].value);
  }
  ret.props.forEach((p) => p.key.isHandlerKey = true);
  return ret;
};

const transformBind = (dir, _node, context) => {
  const { modifiers, loc } = dir;
  const arg = dir.arg;
  let { exp } = dir;
  if (exp && exp.type === 4 && !exp.content.trim()) {
    {
      exp = void 0;
    }
  }
  if (arg.type !== 4) {
    arg.children.unshift(`(`);
    arg.children.push(`) || ""`);
  } else if (!arg.isStatic) {
    arg.content = arg.content ? `${arg.content} || ""` : `""`;
  }
  if (modifiers.some((mod) => mod.content === "camel")) {
    if (arg.type === 4) {
      if (arg.isStatic) {
        arg.content = camelize(arg.content);
      } else {
        arg.content = `${context.helperString(CAMELIZE)}(${arg.content})`;
      }
    } else {
      arg.children.unshift(`${context.helperString(CAMELIZE)}(`);
      arg.children.push(`)`);
    }
  }
  if (!context.inSSR) {
    if (modifiers.some((mod) => mod.content === "prop")) {
      injectPrefix(arg, ".");
    }
    if (modifiers.some((mod) => mod.content === "attr")) {
      injectPrefix(arg, "^");
    }
  }
  return {
    props: [createObjectProperty(arg, exp)]
  };
};
const injectPrefix = (arg, prefix) => {
  if (arg.type === 4) {
    if (arg.isStatic) {
      arg.content = prefix + arg.content;
    } else {
      arg.content = `\`${prefix}\${${arg.content}}\``;
    }
  } else {
    arg.children.unshift(`'${prefix}' + (`);
    arg.children.push(`)`);
  }
};

const transformText = (node, context) => {
  if (node.type === 0 || node.type === 1 || node.type === 11 || node.type === 10) {
    return () => {
      const children = node.children;
      let currentContainer = void 0;
      let hasText = false;
      for (let i = 0; i < children.length; i++) {
        const child = children[i];
        if (isText$1(child)) {
          hasText = true;
          for (let j = i + 1; j < children.length; j++) {
            const next = children[j];
            if (isText$1(next)) {
              if (!currentContainer) {
                currentContainer = children[i] = createCompoundExpression(
                  [child],
                  child.loc
                );
              }
              currentContainer.children.push(` + `, next);
              children.splice(j, 1);
              j--;
            } else {
              currentContainer = void 0;
              break;
            }
          }
        }
      }
      if (!hasText || // if this is a plain element with a single text child, leave it
      // as-is since the runtime has dedicated fast path for this by directly
      // setting textContent of the element.
      // for component root it's always normalized anyway.
      children.length === 1 && (node.type === 0 || node.type === 1 && node.tagType === 0 && // #3756
      // custom directives can potentially add DOM elements arbitrarily,
      // we need to avoid setting textContent of the element at runtime
      // to avoid accidentally overwriting the DOM elements added
      // by the user through custom directives.
      !node.props.find(
        (p) => p.type === 7 && !context.directiveTransforms[p.name]
      ) && // in compat mode, <template> tags with no special directives
      // will be rendered as a fragment so its children must be
      // converted into vnodes.
      !(node.tag === "template"))) {
        return;
      }
      for (let i = 0; i < children.length; i++) {
        const child = children[i];
        if (isText$1(child) || child.type === 8) {
          const callArgs = [];
          if (child.type !== 2 || child.content !== " ") {
            callArgs.push(child);
          }
          if (!context.ssr && getConstantType(child, context) === 0) {
            callArgs.push(
              1 + (` /* ${PatchFlagNames[1]} */` )
            );
          }
          children[i] = {
            type: 12,
            content: child,
            loc: child.loc,
            codegenNode: createCallExpression(
              context.helper(CREATE_TEXT),
              callArgs
            )
          };
        }
      }
    };
  }
};

const seen$1 = /* @__PURE__ */ new WeakSet();
const transformOnce = (node, context) => {
  if (node.type === 1 && findDir(node, "once", true)) {
    if (seen$1.has(node) || context.inVOnce || context.inSSR) {
      return;
    }
    seen$1.add(node);
    context.inVOnce = true;
    context.helper(SET_BLOCK_TRACKING);
    return () => {
      context.inVOnce = false;
      const cur = context.currentNode;
      if (cur.codegenNode) {
        cur.codegenNode = context.cache(
          cur.codegenNode,
          true,
          true
        );
      }
    };
  }
};

const transformModel$1 = (dir, node, context) => {
  const { exp, arg } = dir;
  if (!exp) {
    context.onError(
      createCompilerError(41, dir.loc)
    );
    return createTransformProps();
  }
  const rawExp = exp.loc.source.trim();
  const expString = exp.type === 4 ? exp.content : rawExp;
  const bindingType = context.bindingMetadata[rawExp];
  if (bindingType === "props" || bindingType === "props-aliased") {
    context.onError(createCompilerError(44, exp.loc));
    return createTransformProps();
  }
  if (bindingType === "literal-const" || bindingType === "setup-const") {
    context.onError(createCompilerError(45, exp.loc));
    return createTransformProps();
  }
  if (!expString.trim() || !isMemberExpression(exp) && true) {
    context.onError(
      createCompilerError(42, exp.loc)
    );
    return createTransformProps();
  }
  const propName = arg ? arg : createSimpleExpression("modelValue", true);
  const eventName = arg ? isStaticExp(arg) ? `onUpdate:${camelize(arg.content)}` : createCompoundExpression(['"onUpdate:" + ', arg]) : `onUpdate:modelValue`;
  let assignmentExp;
  const eventArg = context.isTS ? `($event: any)` : `$event`;
  {
    assignmentExp = createCompoundExpression([
      `${eventArg} => ((`,
      exp,
      `) = $event)`
    ]);
  }
  const props = [
    // modelValue: foo
    createObjectProperty(propName, dir.exp),
    // "onUpdate:modelValue": $event => (foo = $event)
    createObjectProperty(eventName, assignmentExp)
  ];
  if (dir.modifiers.length && node.tagType === 1) {
    const modifiers = dir.modifiers.map((m) => m.content).map((m) => (isSimpleIdentifier(m) ? m : JSON.stringify(m)) + `: true`).join(`, `);
    const modifiersKey = arg ? isStaticExp(arg) ? `${arg.content}Modifiers` : createCompoundExpression([arg, ' + "Modifiers"']) : `modelModifiers`;
    props.push(
      createObjectProperty(
        modifiersKey,
        createSimpleExpression(
          `{ ${modifiers} }`,
          false,
          dir.loc,
          2
        )
      )
    );
  }
  return createTransformProps(props);
};
function createTransformProps(props = []) {
  return { props };
}

const validDivisionCharRE = /[\w).+\-_$\]]/;
const transformFilter = (node, context) => {
  if (!isCompatEnabled("COMPILER_FILTERS", context)) {
    return;
  }
  if (node.type === 5) {
    rewriteFilter(node.content, context);
  } else if (node.type === 1) {
    node.props.forEach((prop) => {
      if (prop.type === 7 && prop.name !== "for" && prop.exp) {
        rewriteFilter(prop.exp, context);
      }
    });
  }
};
function rewriteFilter(node, context) {
  if (node.type === 4) {
    parseFilter(node, context);
  } else {
    for (let i = 0; i < node.children.length; i++) {
      const child = node.children[i];
      if (typeof child !== "object") continue;
      if (child.type === 4) {
        parseFilter(child, context);
      } else if (child.type === 8) {
        rewriteFilter(child, context);
      } else if (child.type === 5) {
        rewriteFilter(child.content, context);
      }
    }
  }
}
function parseFilter(node, context) {
  const exp = node.content;
  let inSingle = false;
  let inDouble = false;
  let inTemplateString = false;
  let inRegex = false;
  let curly = 0;
  let square = 0;
  let paren = 0;
  let lastFilterIndex = 0;
  let c, prev, i, expression, filters = [];
  for (i = 0; i < exp.length; i++) {
    prev = c;
    c = exp.charCodeAt(i);
    if (inSingle) {
      if (c === 39 && prev !== 92) inSingle = false;
    } else if (inDouble) {
      if (c === 34 && prev !== 92) inDouble = false;
    } else if (inTemplateString) {
      if (c === 96 && prev !== 92) inTemplateString = false;
    } else if (inRegex) {
      if (c === 47 && prev !== 92) inRegex = false;
    } else if (c === 124 && // pipe
    exp.charCodeAt(i + 1) !== 124 && exp.charCodeAt(i - 1) !== 124 && !curly && !square && !paren) {
      if (expression === void 0) {
        lastFilterIndex = i + 1;
        expression = exp.slice(0, i).trim();
      } else {
        pushFilter();
      }
    } else {
      switch (c) {
        case 34:
          inDouble = true;
          break;
        // "
        case 39:
          inSingle = true;
          break;
        // '
        case 96:
          inTemplateString = true;
          break;
        // `
        case 40:
          paren++;
          break;
        // (
        case 41:
          paren--;
          break;
        // )
        case 91:
          square++;
          break;
        // [
        case 93:
          square--;
          break;
        // ]
        case 123:
          curly++;
          break;
        // {
        case 125:
          curly--;
          break;
      }
      if (c === 47) {
        let j = i - 1;
        let p;
        for (; j >= 0; j--) {
          p = exp.charAt(j);
          if (p !== " ") break;
        }
        if (!p || !validDivisionCharRE.test(p)) {
          inRegex = true;
        }
      }
    }
  }
  if (expression === void 0) {
    expression = exp.slice(0, i).trim();
  } else if (lastFilterIndex !== 0) {
    pushFilter();
  }
  function pushFilter() {
    filters.push(exp.slice(lastFilterIndex, i).trim());
    lastFilterIndex = i + 1;
  }
  if (filters.length) {
    warnDeprecation(
      "COMPILER_FILTERS",
      context,
      node.loc
    );
    for (i = 0; i < filters.length; i++) {
      expression = wrapFilter(expression, filters[i], context);
    }
    node.content = expression;
    node.ast = void 0;
  }
}
function wrapFilter(exp, filter, context) {
  context.helper(RESOLVE_FILTER);
  const i = filter.indexOf("(");
  if (i < 0) {
    context.filters.add(filter);
    return `${toValidAssetId(filter, "filter")}(${exp})`;
  } else {
    const name = filter.slice(0, i);
    const args = filter.slice(i + 1);
    context.filters.add(name);
    return `${toValidAssetId(name, "filter")}(${exp}${args !== ")" ? "," + args : args}`;
  }
}

const seen = /* @__PURE__ */ new WeakSet();
const transformMemo = (node, context) => {
  if (node.type === 1) {
    const dir = findDir(node, "memo");
    if (!dir || seen.has(node) || context.inSSR) {
      return;
    }
    seen.add(node);
    return () => {
      const codegenNode = node.codegenNode || context.currentNode.codegenNode;
      if (codegenNode && codegenNode.type === 13) {
        if (node.tagType !== 1) {
          convertToBlock(codegenNode, context);
        }
        node.codegenNode = createCallExpression(context.helper(WITH_MEMO), [
          dir.exp,
          createFunctionExpression(void 0, codegenNode),
          `_cache`,
          String(context.cached.length)
        ]);
        context.cached.push(null);
      }
    };
  }
};

const transformVBindShorthand = (node, context) => {
  if (node.type === 1) {
    for (const prop of node.props) {
      if (prop.type === 7 && prop.name === "bind" && (!prop.exp || // #13930 :foo in in-DOM templates will be parsed into :foo="" by browser
      prop.exp.type === 4 && !prop.exp.content.trim()) && prop.arg) {
        const arg = prop.arg;
        if (arg.type !== 4 || !arg.isStatic) {
          context.onError(
            createCompilerError(
              53,
              arg.loc
            )
          );
          prop.exp = createSimpleExpression("", true, arg.loc);
        } else {
          const propName = camelize(arg.content);
          if (validFirstIdentCharRE.test(propName[0]) || // allow hyphen first char for https://github.com/vuejs/language-tools/pull/3424
          propName[0] === "-") {
            prop.exp = createSimpleExpression(propName, false, arg.loc);
          }
        }
      }
    }
  }
};

function getBaseTransformPreset(prefixIdentifiers) {
  return [
    [
      transformVBindShorthand,
      transformOnce,
      transformIf,
      transformMemo,
      transformFor,
      ...[transformFilter] ,
      ...[transformExpression] ,
      transformSlotOutlet,
      transformElement,
      trackSlotScopes,
      transformText
    ],
    {
      on: transformOn$1,
      bind: transformBind,
      model: transformModel$1
    }
  ];
}
function baseCompile(source, options = {}) {
  const onError = options.onError || defaultOnError;
  const isModuleMode = options.mode === "module";
  {
    if (options.prefixIdentifiers === true) {
      onError(createCompilerError(48));
    } else if (isModuleMode) {
      onError(createCompilerError(49));
    }
  }
  const prefixIdentifiers = false;
  if (options.cacheHandlers) {
    onError(createCompilerError(50));
  }
  if (options.scopeId && !isModuleMode) {
    onError(createCompilerError(51));
  }
  const resolvedOptions = extend({}, options, {
    prefixIdentifiers
  });
  const ast = isString(source) ? baseParse(source, resolvedOptions) : source;
  const [nodeTransforms, directiveTransforms] = getBaseTransformPreset();
  transform(
    ast,
    extend({}, resolvedOptions, {
      nodeTransforms: [
        ...nodeTransforms,
        ...options.nodeTransforms || []
        // user transforms
      ],
      directiveTransforms: extend(
        {},
        directiveTransforms,
        options.directiveTransforms || {}
        // user transforms
      )
    })
  );
  return generate(ast, resolvedOptions);
}

const noopDirectiveTransform = () => ({ props: [] });

/**
* @vue/compiler-dom v3.5.42
* (c) 2018-present Yuxi (Evan) You and Vue contributors
* @license MIT
**/

const V_MODEL_RADIO = /* @__PURE__ */ Symbol(`vModelRadio` );
const V_MODEL_CHECKBOX = /* @__PURE__ */ Symbol(
  `vModelCheckbox` 
);
const V_MODEL_TEXT = /* @__PURE__ */ Symbol(`vModelText` );
const V_MODEL_SELECT = /* @__PURE__ */ Symbol(
  `vModelSelect` 
);
const V_MODEL_DYNAMIC = /* @__PURE__ */ Symbol(
  `vModelDynamic` 
);
const V_ON_WITH_MODIFIERS = /* @__PURE__ */ Symbol(
  `vOnModifiersGuard` 
);
const V_ON_WITH_KEYS = /* @__PURE__ */ Symbol(
  `vOnKeysGuard` 
);
const V_SHOW = /* @__PURE__ */ Symbol(`vShow` );
const TRANSITION = /* @__PURE__ */ Symbol(`Transition` );
const TRANSITION_GROUP = /* @__PURE__ */ Symbol(
  `TransitionGroup` 
);
registerRuntimeHelpers({
  [V_MODEL_RADIO]: `vModelRadio`,
  [V_MODEL_CHECKBOX]: `vModelCheckbox`,
  [V_MODEL_TEXT]: `vModelText`,
  [V_MODEL_SELECT]: `vModelSelect`,
  [V_MODEL_DYNAMIC]: `vModelDynamic`,
  [V_ON_WITH_MODIFIERS]: `withModifiers`,
  [V_ON_WITH_KEYS]: `withKeys`,
  [V_SHOW]: `vShow`,
  [TRANSITION]: `Transition`,
  [TRANSITION_GROUP]: `TransitionGroup`
});

let decoder;
function decodeHtmlBrowser(raw, asAttr = false) {
  if (!decoder) {
    decoder = document.createElement("div");
  }
  if (asAttr) {
    decoder.innerHTML = `<div foo="${raw.replace(/"/g, "&quot;")}">`;
    return decoder.children[0].getAttribute("foo");
  } else {
    decoder.innerHTML = raw;
    return decoder.textContent;
  }
}

const parserOptions = {
  parseMode: "html",
  isVoidTag,
  isNativeTag: (tag) => isHTMLTag(tag) || isSVGTag(tag) || isMathMLTag(tag),
  isPreTag: (tag) => tag === "pre",
  isIgnoreNewlineTag: (tag) => tag === "pre" || tag === "textarea",
  decodeEntities: decodeHtmlBrowser ,
  isBuiltInComponent: (tag) => {
    if (tag === "Transition" || tag === "transition") {
      return TRANSITION;
    } else if (tag === "TransitionGroup" || tag === "transition-group") {
      return TRANSITION_GROUP;
    }
  },
  // https://html.spec.whatwg.org/multipage/parsing.html#tree-construction-dispatcher
  getNamespace(tag, parent, rootNamespace) {
    let ns = parent ? parent.ns : rootNamespace;
    if (parent && ns === 2) {
      if (parent.tag === "annotation-xml") {
        if (tag === "svg") {
          return 1;
        }
        if (parent.props.some(
          (a) => a.type === 6 && a.name === "encoding" && a.value != null && (a.value.content === "text/html" || a.value.content === "application/xhtml+xml")
        )) {
          ns = 0;
        }
      } else if (/^m(?:[ions]|text)$/.test(parent.tag) && tag !== "mglyph" && tag !== "malignmark") {
        ns = 0;
      }
    } else if (parent && ns === 1) {
      if (parent.tag === "foreignObject" || parent.tag === "desc" || parent.tag === "title") {
        ns = 0;
      }
    }
    if (ns === 0) {
      if (tag === "svg") {
        return 1;
      }
      if (tag === "math") {
        return 2;
      }
    }
    return ns;
  }
};

const transformStyle = (node) => {
  if (node.type === 1) {
    node.props.forEach((p, i) => {
      if (p.type === 6 && p.name === "style" && p.value) {
        node.props[i] = {
          type: 7,
          name: `bind`,
          arg: createSimpleExpression(`style`, true, p.loc),
          exp: parseInlineCSS(p.value.content, p.loc),
          modifiers: [],
          loc: p.loc
        };
      }
    });
  }
};
const parseInlineCSS = (cssText, loc) => {
  const normalized = parseStringStyle(cssText);
  return createSimpleExpression(
    JSON.stringify(normalized),
    false,
    loc,
    3
  );
};

function createDOMCompilerError(code, loc) {
  return createCompilerError(
    code,
    loc,
    DOMErrorMessages 
  );
}
const DOMErrorMessages = {
  [54]: `v-html is missing expression.`,
  [55]: `v-html will override element children.`,
  [56]: `v-text is missing expression.`,
  [57]: `v-text will override element children.`,
  [58]: `v-model can only be used on <input>, <textarea> and <select> elements.`,
  [59]: `v-model argument is not supported on plain elements.`,
  [60]: `v-model cannot be used on file inputs since they are read-only. Use a v-on:change listener instead.`,
  [61]: `Unnecessary value binding used alongside v-model. It will interfere with v-model's behavior.`,
  [62]: `v-show is missing expression.`,
  [63]: `<Transition> expects exactly one child element or component.`,
  [64]: `Tags with side effect (<script> and <style>) are ignored in client component templates.`
};

const transformVHtml = (dir, node, context) => {
  const { exp, loc } = dir;
  if (!exp) {
    context.onError(
      createDOMCompilerError(54, loc)
    );
  }
  if (node.children.length) {
    context.onError(
      createDOMCompilerError(55, loc)
    );
    node.children.length = 0;
  }
  return {
    props: [
      createObjectProperty(
        createSimpleExpression(`innerHTML`, true, loc),
        exp || createSimpleExpression("", true)
      )
    ]
  };
};

const transformVText = (dir, node, context) => {
  const { exp, loc } = dir;
  if (!exp) {
    context.onError(
      createDOMCompilerError(56, loc)
    );
  }
  if (node.children.length) {
    context.onError(
      createDOMCompilerError(57, loc)
    );
    node.children.length = 0;
  }
  return {
    props: [
      createObjectProperty(
        createSimpleExpression(`textContent`, true),
        exp ? getConstantType(exp, context) > 0 ? exp : createCallExpression(
          context.helperString(TO_DISPLAY_STRING),
          [exp],
          loc
        ) : createSimpleExpression("", true)
      )
    ]
  };
};

const transformModel = (dir, node, context) => {
  const baseResult = transformModel$1(dir, node, context);
  if (!baseResult.props.length || node.tagType === 1) {
    return baseResult;
  }
  if (dir.arg) {
    context.onError(
      createDOMCompilerError(
        59,
        dir.arg.loc
      )
    );
  }
  function checkDuplicatedValue() {
    const value = findDir(node, "bind");
    if (value && isStaticArgOf(value.arg, "value")) {
      context.onError(
        createDOMCompilerError(
          61,
          value.loc
        )
      );
    }
  }
  const { tag } = node;
  const isCustomElement = context.isCustomElement(tag);
  if (tag === "input" || tag === "textarea" || tag === "select" || isCustomElement) {
    let directiveToUse = V_MODEL_TEXT;
    let isInvalidType = false;
    if (tag === "input" || isCustomElement) {
      const type = findProp(node, `type`);
      if (type) {
        if (type.type === 7) {
          directiveToUse = V_MODEL_DYNAMIC;
        } else if (type.value) {
          switch (type.value.content) {
            case "radio":
              directiveToUse = V_MODEL_RADIO;
              break;
            case "checkbox":
              directiveToUse = V_MODEL_CHECKBOX;
              break;
            case "file":
              isInvalidType = true;
              context.onError(
                createDOMCompilerError(
                  60,
                  dir.loc
                )
              );
              break;
            default:
              checkDuplicatedValue();
              break;
          }
        }
      } else if (hasDynamicKeyVBind(node)) {
        directiveToUse = V_MODEL_DYNAMIC;
      } else {
        checkDuplicatedValue();
      }
    } else if (tag === "select") {
      directiveToUse = V_MODEL_SELECT;
    } else {
      checkDuplicatedValue();
    }
    if (!isInvalidType) {
      baseResult.needRuntime = context.helper(directiveToUse);
    }
  } else {
    context.onError(
      createDOMCompilerError(
        58,
        dir.loc
      )
    );
  }
  baseResult.props = baseResult.props.filter(
    (p) => !(p.key.type === 4 && p.key.content === "modelValue")
  );
  return baseResult;
};

const isEventOptionModifier = /* @__PURE__ */ makeMap(`passive,once,capture`);
const isNonKeyModifier = /* @__PURE__ */ makeMap(
  // event propagation management
  `stop,prevent,self,ctrl,shift,alt,meta,exact,middle`
);
const maybeKeyModifier = /* @__PURE__ */ makeMap("left,right");
const isKeyboardEvent = /* @__PURE__ */ makeMap(`onkeyup,onkeydown,onkeypress`);
const resolveModifiers = (key, modifiers, context, loc) => {
  const keyModifiers = [];
  const nonKeyModifiers = [];
  const eventOptionModifiers = [];
  for (let i = 0; i < modifiers.length; i++) {
    const modifier = modifiers[i].content;
    if (modifier === "native" && checkCompatEnabled(
      "COMPILER_V_ON_NATIVE",
      context,
      loc
    )) {
      eventOptionModifiers.push(modifier);
    } else if (isEventOptionModifier(modifier)) {
      eventOptionModifiers.push(modifier);
    } else {
      if (maybeKeyModifier(modifier)) {
        if (isStaticExp(key)) {
          if (isKeyboardEvent(key.content.toLowerCase())) {
            keyModifiers.push(modifier);
          } else {
            nonKeyModifiers.push(modifier);
          }
        } else {
          keyModifiers.push(modifier);
          nonKeyModifiers.push(modifier);
        }
      } else {
        if (isNonKeyModifier(modifier)) {
          nonKeyModifiers.push(modifier);
        } else {
          keyModifiers.push(modifier);
        }
      }
    }
  }
  return {
    keyModifiers,
    nonKeyModifiers,
    eventOptionModifiers
  };
};
const transformClick = (key, event) => {
  const isStaticClick = isStaticExp(key) && key.content.toLowerCase() === "onclick";
  return isStaticClick ? createSimpleExpression(event, true) : key.type !== 4 ? createCompoundExpression([
    `(`,
    key,
    `) === "onClick" ? "${event}" : (`,
    key,
    `)`
  ]) : key;
};
const transformOn = (dir, node, context) => {
  return transformOn$1(dir, node, context, (baseResult) => {
    const { modifiers } = dir;
    if (!modifiers.length) return baseResult;
    let { key, value: handlerExp } = baseResult.props[0];
    const { keyModifiers, nonKeyModifiers, eventOptionModifiers } = resolveModifiers(key, modifiers, context, dir.loc);
    if (nonKeyModifiers.includes("right")) {
      key = transformClick(key, `onContextmenu`);
    }
    if (nonKeyModifiers.includes("middle")) {
      key = transformClick(key, `onMouseup`);
    }
    if (nonKeyModifiers.length) {
      handlerExp = createCallExpression(context.helper(V_ON_WITH_MODIFIERS), [
        handlerExp,
        JSON.stringify(nonKeyModifiers)
      ]);
    }
    if (keyModifiers.length && // if event name is dynamic, always wrap with keys guard
    (!isStaticExp(key) || isKeyboardEvent(key.content.toLowerCase()))) {
      handlerExp = createCallExpression(context.helper(V_ON_WITH_KEYS), [
        handlerExp,
        JSON.stringify(keyModifiers)
      ]);
    }
    if (eventOptionModifiers.length) {
      const modifierPostfix = eventOptionModifiers.map(capitalize).join("");
      key = isStaticExp(key) ? createSimpleExpression(`${key.content}${modifierPostfix}`, true) : createCompoundExpression([`(`, key, `) + "${modifierPostfix}"`]);
    }
    return {
      props: [createObjectProperty(key, handlerExp)]
    };
  });
};

const transformShow = (dir, node, context) => {
  const { exp, loc } = dir;
  if (!exp) {
    context.onError(
      createDOMCompilerError(62, loc)
    );
  }
  return {
    props: [],
    needRuntime: context.helper(V_SHOW)
  };
};

const transformTransition = (node, context) => {
  if (node.type === 1 && node.tagType === 1) {
    const component = context.isBuiltInComponent(node.tag);
    if (component === TRANSITION) {
      return () => {
        if (!node.children.length) {
          return;
        }
        if (hasMultipleChildren(node)) {
          context.onError(
            createDOMCompilerError(
              63,
              {
                start: node.children[0].loc.start,
                end: node.children[node.children.length - 1].loc.end,
                source: ""
              }
            )
          );
        }
        const child = node.children[0];
        if (child.type === 1) {
          for (const p of child.props) {
            if (p.type === 7 && p.name === "show") {
              node.props.push({
                type: 6,
                name: "persisted",
                nameLoc: node.loc,
                value: void 0,
                loc: node.loc
              });
            }
          }
        }
      };
    }
  }
};
function hasMultipleChildren(node) {
  const children = node.children = node.children.filter(
    (c) => !isCommentOrWhitespace(c)
  );
  const child = children[0];
  return children.length !== 1 || child.type === 11 || child.type === 9 && child.branches.some(hasMultipleChildren);
}

const ignoreSideEffectTags = (node, context) => {
  if (node.type === 1 && node.tagType === 0 && (node.tag === "script" || node.tag === "style")) {
    context.onError(
      createDOMCompilerError(
        64,
        node.loc
      )
    );
    context.removeNode();
  }
};

function isValidHTMLNesting(parent, child) {
  if (parent === "template") {
    return true;
  }
  if (parent in onlyValidChildren) {
    return onlyValidChildren[parent].has(child);
  }
  if (child in onlyValidParents) {
    return onlyValidParents[child].has(parent);
  }
  if (parent in knownInvalidChildren) {
    if (knownInvalidChildren[parent].has(child)) return false;
  }
  if (child in knownInvalidParents) {
    if (knownInvalidParents[child].has(parent)) return false;
  }
  return true;
}
const headings = /* @__PURE__ */ new Set(["h1", "h2", "h3", "h4", "h5", "h6"]);
const emptySet = /* @__PURE__ */ new Set([]);
const onlyValidChildren = {
  head: /* @__PURE__ */ new Set([
    "base",
    "basefront",
    "bgsound",
    "link",
    "meta",
    "title",
    "noscript",
    "noframes",
    "style",
    "script",
    "template"
  ]),
  optgroup: /* @__PURE__ */ new Set(["option"]),
  select: /* @__PURE__ */ new Set(["optgroup", "option", "hr"]),
  // table
  table: /* @__PURE__ */ new Set(["caption", "colgroup", "tbody", "tfoot", "thead"]),
  tr: /* @__PURE__ */ new Set(["td", "th"]),
  colgroup: /* @__PURE__ */ new Set(["col"]),
  tbody: /* @__PURE__ */ new Set(["tr"]),
  thead: /* @__PURE__ */ new Set(["tr"]),
  tfoot: /* @__PURE__ */ new Set(["tr"]),
  // these elements can not have any children elements
  script: emptySet,
  iframe: emptySet,
  option: emptySet,
  textarea: emptySet,
  style: emptySet,
  title: emptySet
};
const onlyValidParents = {
  // sections
  html: emptySet,
  body: /* @__PURE__ */ new Set(["html"]),
  head: /* @__PURE__ */ new Set(["html"]),
  // table
  td: /* @__PURE__ */ new Set(["tr"]),
  colgroup: /* @__PURE__ */ new Set(["table"]),
  caption: /* @__PURE__ */ new Set(["table"]),
  tbody: /* @__PURE__ */ new Set(["table"]),
  tfoot: /* @__PURE__ */ new Set(["table"]),
  col: /* @__PURE__ */ new Set(["colgroup"]),
  th: /* @__PURE__ */ new Set(["tr"]),
  thead: /* @__PURE__ */ new Set(["table"]),
  tr: /* @__PURE__ */ new Set(["tbody", "thead", "tfoot"]),
  // data list
  dd: /* @__PURE__ */ new Set(["dl", "div"]),
  dt: /* @__PURE__ */ new Set(["dl", "div"]),
  // other
  figcaption: /* @__PURE__ */ new Set(["figure"]),
  // li: new Set(["ul", "ol"]),
  summary: /* @__PURE__ */ new Set(["details"]),
  area: /* @__PURE__ */ new Set(["map"])
};
const knownInvalidChildren = {
  p: /* @__PURE__ */ new Set([
    "address",
    "article",
    "aside",
    "blockquote",
    "center",
    "details",
    "dialog",
    "dir",
    "div",
    "dl",
    "fieldset",
    "figure",
    "footer",
    "form",
    "h1",
    "h2",
    "h3",
    "h4",
    "h5",
    "h6",
    "header",
    "hgroup",
    "hr",
    "li",
    "main",
    "nav",
    "menu",
    "ol",
    "p",
    "pre",
    "section",
    "table",
    "ul"
  ]),
  svg: /* @__PURE__ */ new Set([
    "b",
    "blockquote",
    "br",
    "code",
    "dd",
    "div",
    "dl",
    "dt",
    "em",
    "embed",
    "h1",
    "h2",
    "h3",
    "h4",
    "h5",
    "h6",
    "hr",
    "i",
    "img",
    "li",
    "menu",
    "meta",
    "ol",
    "p",
    "pre",
    "ruby",
    "s",
    "small",
    "span",
    "strong",
    "sub",
    "sup",
    "table",
    "u",
    "ul",
    "var"
  ])
};
const knownInvalidParents = {
  a: /* @__PURE__ */ new Set(["a"]),
  button: /* @__PURE__ */ new Set(["button"]),
  dd: /* @__PURE__ */ new Set(["dd", "dt"]),
  dt: /* @__PURE__ */ new Set(["dd", "dt"]),
  form: /* @__PURE__ */ new Set(["form"]),
  li: /* @__PURE__ */ new Set(["li"]),
  h1: headings,
  h2: headings,
  h3: headings,
  h4: headings,
  h5: headings,
  h6: headings
};

const validateHtmlNesting = (node, context) => {
  if (node.type === 1 && node.tagType === 0 && context.parent && context.parent.type === 1 && context.parent.tagType === 0 && !isValidHTMLNesting(context.parent.tag, node.tag)) {
    const error = new SyntaxError(
      `<${node.tag}> cannot be child of <${context.parent.tag}>, according to HTML specifications. This can cause hydration errors or potentially disrupt future functionality.`
    );
    error.loc = node.loc;
    context.onWarn(error);
  }
};

const DOMNodeTransforms = [
  transformStyle,
  ...[transformTransition, validateHtmlNesting] 
];
const DOMDirectiveTransforms = {
  cloak: noopDirectiveTransform,
  html: transformVHtml,
  text: transformVText,
  model: transformModel,
  // override compiler-core
  on: transformOn,
  // override compiler-core
  show: transformShow
};
function compile(src, options = {}) {
  return baseCompile(
    src,
    extend({}, parserOptions, options, {
      nodeTransforms: [
        // ignore <script> and <tag>
        // this is not put inside DOMNodeTransforms because that list is used
        // by compiler-ssr to generate vnode fallback branches
        ignoreSideEffectTags,
        ...DOMNodeTransforms,
        ...options.nodeTransforms || []
      ],
      directiveTransforms: extend(
        {},
        DOMDirectiveTransforms,
        options.directiveTransforms || {}
      ),
      transformHoist: null 
    })
  );
}

function processSlot(source = '', Vue$1 = Vue) {
    let template = source.trim();
    const hasWrappingTemplate = template && template.startsWith('<template');
    // allow content without `template` tag, for easier testing
    if (!hasWrappingTemplate) {
        template = `<template #default="params">${template}</template>`;
    }
    // Vue does not provide an easy way to compile template in "slot" mode
    // Since we do not want to rely on compiler internals and specify
    // transforms manually we create fake component invocation with the slot we
    // need and pick slots param from render function later. Fake component will
    // never be instantiated but it requires to be a component so compile
    // properly generate invocation. Since we do not want to monkey-patch
    // `resolveComponent` function we are just using one of built-in components:
    // transition
    const { code } = compile(`<transition>${template}</transition>`, {
        mode: 'function',
        prefixIdentifiers: true
    });
    const createRenderFunction = new Function('Vue', `'use strict';\n${code}` );
    const renderFn = createRenderFunction(Vue$1);
    return (ctx = {}) => {
        const result = renderFn(ctx);
        const slotName = Object.keys(result.children)[0];
        return result.children[slotName](ctx);
    };
}

const isTeleport$1 = (type) => type.__isTeleport;
const isKeepAlive$1 = (type) => type.__isKeepAlive;
// `transformVNodeArgs` is a global, last-call-wins Vue API, so when several
// wrappers are mounted the active transformer only knows about the most
// recently mounted root component. Track every mounted root component globally
// so that re-rendering an earlier wrapper (e.g. via `setProps`) doesn't stub
// its root just because another wrapper was mounted afterwards.
// See https://github.com/vuejs/test-utils/issues/2675
const mountedRootComponents = new WeakSet();
const registerRootComponent = (type) => {
    // WeakSet keys must be objects/functions; component definitions always are,
    // but `Component` also allows a string name which we simply ignore.
    if (type && typeof type !== 'string') {
        mountedRootComponents.add(type);
    }
};
const isRootComponent = (rootComponents, type, instance) => !!(!instance ||
    // Don't stub mounted component on root level
    ((rootComponents.component === type ||
        mountedRootComponents.has(type)) &&
        !(instance === null || instance === void 0 ? void 0 : instance.parent)) ||
    // Don't stub component with compat wrapper
    (rootComponents.functional && rootComponents.functional === type));
const createVNodeTransformer = ({ rootComponents, transformers }) => {
    const transformationCache = new WeakMap();
    registerRootComponent(rootComponents.component);
    registerRootComponent(rootComponents.functional);
    return (args, instance) => {
        const [originalType, props, children, ...restVNodeArgs] = args;
        if (!isComponent$1(originalType)) {
            return [originalType, props, children, ...restVNodeArgs];
        }
        const componentType = originalType;
        const cachedTransformation = transformationCache.get(originalType);
        if (cachedTransformation &&
            // Don't use cache for root component, as it could use stubbed recursive component
            !isRootComponent(rootComponents, componentType, instance) &&
            !isTeleport$1(originalType) &&
            !isKeepAlive$1(originalType)) {
            return [cachedTransformation, props, children, ...restVNodeArgs];
        }
        const transformedType = transformers.reduce((type, transformer) => transformer(type, instance), componentType);
        if (originalType !== transformedType) {
            transformationCache.set(originalType, transformedType);
            registerStub({ source: originalType, stub: transformedType });
            // https://github.com/vuejs/test-utils/issues/1829 & https://github.com/vuejs/test-utils/issues/1888
            // Teleport/KeepAlive should return child nodes as a function
            if (isTeleport$1(originalType) || isKeepAlive$1(originalType)) {
                return [transformedType, props, () => children, ...restVNodeArgs];
            }
        }
        return [transformedType, props, children, ...restVNodeArgs];
    };
};

const normalizeStubProps = (props) => {
    // props are always normalized to object syntax
    const $props = props;
    return Object.keys($props).reduce((acc, key) => {
        const value = $props[key];
        if (typeof value === 'symbol') {
            return Object.assign(Object.assign({}, acc), { [key]: [value === null || value === void 0 ? void 0 : value.toString()] });
        }
        if (typeof value === 'function') {
            return Object.assign(Object.assign({}, acc), { [key]: ['[Function]'] });
        }
        return Object.assign(Object.assign({}, acc), { [key]: value });
    }, {});
};
const clearAndUpper = (text) => text.replace(/-/, '').toUpperCase();
const kebabToPascalCase = (tag) => tag.replace(/(^\w|-\w)/g, clearAndUpper);
const DEFAULT_STUBS = {
    teleport: isTeleport$1,
    'keep-alive': isKeepAlive$1,
    transition: (type) => type === Transition || type === BaseTransition,
    'transition-group': (type) => type === TransitionGroup
};
const createDefaultStub = (kebabTag, predicate, type, stubs) => {
    const pascalTag = kebabToPascalCase(kebabTag);
    if (predicate(type) && (pascalTag in stubs || kebabTag in stubs)) {
        if (kebabTag in stubs && stubs[kebabTag] === false)
            return type;
        if (pascalTag in stubs && stubs[pascalTag] === false)
            return type;
        if (stubs[kebabTag] === true || stubs[pascalTag] === true) {
            return createStub({
                name: kebabTag,
                type,
                renderStubDefaultSlot: true
            });
        }
    }
};
const createStub = ({ name, type, renderStubDefaultSlot }) => {
    const anonName = 'anonymous-stub';
    const tag = name ? `${hyphenate$1(name)}-stub` : anonName;
    const componentOptions = type
        ? unwrapLegacyVueExtendComponent(type) || {}
        : {};
    const stub = defineComponent({
        name: name || anonName,
        props: componentOptions.props || {},
        // fix #1550 - respect old-style v-model for shallow mounted components with @vue/compat
        // @ts-expect-error
        model: componentOptions.model,
        setup(props, { slots }) {
            return () => {
                // https://github.com/vuejs/test-utils/issues/1076
                // Passing a symbol as a static prop is not legal, since Vue will try to do
                // something like `el.setAttribute('val', Symbol())` which is not valid and
                // causes an error.
                // Only a problem when shallow mounting. For this reason we iterate of the
                // props that will be passed and stringify any that are symbols.
                // Also having function text as attribute is useless and annoying so
                // we replace it with "[Function]""
                const stubProps = normalizeStubProps(props);
                // if renderStubDefaultSlot is true, we render the default slot
                if (renderStubDefaultSlot && slots.default) {
                    // we explicitly call the default slot with an empty object
                    // so scope slots destructuring works
                    return h(tag, stubProps, slots.default({}));
                }
                return h(tag, stubProps);
            };
        }
    });
    const { __asyncLoader: asyncLoader } = type;
    if (asyncLoader) {
        asyncLoader().then(() => {
            registerStub({
                source: type.__asyncResolved,
                stub
            });
        });
    }
    return stub;
};
const resolveComponentStubByName = (componentName, stubs) => {
    for (const [stubKey, value] of Object.entries(stubs)) {
        if (matchName(componentName, stubKey)) {
            return value;
        }
    }
};
function createStubComponentsTransformer({ rootComponents, stubs = {}, shallow = false, renderStubDefaultSlot = false }) {
    return function componentsTransformer(type, instance) {
        var _a, _b, _c;
        for (const tag in DEFAULT_STUBS) {
            const predicate = DEFAULT_STUBS[tag];
            const defaultStub = createDefaultStub(tag, predicate, type, stubs);
            if (defaultStub)
                return defaultStub;
        }
        // Don't stub root components
        if (isRootComponent(rootComponents, type, instance)) {
            return type;
        }
        const registeredName = getComponentRegisteredName(instance, type);
        const componentName = getComponentName$1(instance, type);
        let stub = null;
        let name = null;
        // Prio 1 using the key in locally registered components in the parent
        if (registeredName) {
            stub = resolveComponentStubByName(registeredName, stubs);
            if (stub) {
                name = registeredName;
            }
        }
        // Prio 2 using the name attribute in the component
        if (!stub && componentName) {
            stub = resolveComponentStubByName(componentName, stubs);
            if (stub) {
                name = componentName;
            }
        }
        // case 2: custom implementation
        if (isComponent$1(stub)) {
            const unwrappedStub = unwrapLegacyVueExtendComponent(stub);
            const stubFn = isFunctionalComponent(unwrappedStub) ? unwrappedStub : null;
            // Edge case: stub is component, we will not render stub but instead will create
            // a new "copy" of stub component definition, but we want user still to be able
            // to find our component by stub definition, so we register it manually
            registerStub({ source: type, stub });
            const specializedStubComponent = stubFn
                ? (...args) => stubFn(...args)
                : Object.assign({}, unwrappedStub);
            specializedStubComponent.props = unwrappedStub.props;
            return specializedStubComponent;
        }
        if (stub === false) {
            // we explicitly opt out of stubbing this component
            return type;
        }
        // we return a stub by matching Vue's `h` function
        // where the signature is h(Component, props, slots)
        // case 1: default stub
        if (stub === true || shallow) {
            // Set name when using shallow without stub
            const stubName = name || registeredName || componentName;
            return ((_c = (_b = (_a = config.plugins).createStubs) === null || _b === void 0 ? void 0 : _b.call(_a, {
                name: stubName,
                component: type,
                registerStub
            })) !== null && _c !== void 0 ? _c : createStub({
                name: stubName,
                type,
                renderStubDefaultSlot
            }));
        }
        return type;
    };
}

const noop = () => { };
function createStubDirectivesTransformer({ directives = {} }) {
    if (Object.keys(directives).length === 0) {
        return type => type;
    }
    return function directivesTransformer(type) {
        if (isObjectComponent(type) && type.directives) {
            // We want to change component types as rarely as possible
            // So first we check if there are any directives we should stub
            const directivesToPatch = Object.keys(type.directives).filter(key => key in directives);
            if (!directivesToPatch.length) {
                return type;
            }
            const replacementDirectives = Object.fromEntries(directivesToPatch.map(name => {
                const directive = directives[name];
                return [name, typeof directive === 'boolean' ? noop : directive];
            }));
            return Object.assign(Object.assign({}, type), { directives: Object.assign(Object.assign({}, type.directives), replacementDirectives) });
        }
        return type;
    };
}

/**
 * Implementation details of isDeepRef to avoid circular dependencies.
 * It keeps track of visited objects to avoid infinite recursion.
 *
 * @param r The value to check for a Ref.
 * @param visitedObjects a weak map to keep track of visited objects and avoid infinite recursion
 * @returns returns true if the value is a Ref, false otherwise
 */
const deeplyCheckForRef = (r, visitedObjects) => {
    if (isRef$1(r))
        return true;
    if (!isObject$1(r))
        return false;
    if (visitedObjects.has(r))
        return false;
    visitedObjects.set(r, true);
    return Object.values(r).some(val => deeplyCheckForRef(val, visitedObjects));
};
/**
 * Checks if the given value is a DeepRef.
 *
 * For both arrays and objects, it will recursively check
 * if any of their values is a Ref.
 *
 * @param {DeepRef<T> | unknown} r - The value to check.
 * @returns {boolean} Returns true if the value is a DeepRef, false otherwise.
 */
const isDeepRef = (r) => {
    const visitedObjects = new WeakMap();
    return deeplyCheckForRef(r, visitedObjects);
};

const MOUNT_OPTIONS = [
    'attachTo',
    'attrs',
    'data',
    'props',
    'slots',
    'global',
    'shallow'
];
function getInstanceOptions(options) {
    if (options.methods) {
        console.warn("Passing a `methods` option to mount was deprecated on Vue Test Utils v1, and it won't have any effect on v2. For additional info: https://vue-test-utils.vuejs.org/upgrading-to-v1/#setmethods-and-mountingoptions-methods");
        delete options.methods;
    }
    const resultOptions = Object.assign({}, options);
    for (const key of Object.keys(options)) {
        if (MOUNT_OPTIONS.includes(key)) {
            delete resultOptions[key];
        }
    }
    return resultOptions;
}
// implementation
function createInstance(
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
inputComponent, options) {
    // normalize the incoming component
    const originalComponent = unwrapLegacyVueExtendComponent(inputComponent);
    let component;
    const instanceOptions = getInstanceOptions(options !== null && options !== void 0 ? options : {});
    const rootComponents = {};
    if (isFunctionalComponent(originalComponent) ||
        isLegacyFunctionalComponent(originalComponent)) {
        component = defineComponent(Object.assign({ compatConfig: {
                MODE: 3,
                INSTANCE_LISTENERS: false,
                INSTANCE_ATTRS_CLASS_STYLE: false,
                COMPONENT_FUNCTIONAL: isLegacyFunctionalComponent(originalComponent)
                    ? 'suppress-warning'
                    : false
            }, props: originalComponent.props || {}, setup: (props, { attrs, slots }) => () => h(originalComponent, Object.assign(Object.assign({}, props), attrs), slots) }, instanceOptions));
        rootComponents.functional = originalComponent;
    }
    else if (isObjectComponent(originalComponent)) {
        component = Object.assign(Object.assign({}, originalComponent), instanceOptions);
    }
    else {
        component = originalComponent;
    }
    rootComponents.component = component;
    // We've just replaced our component with its copy
    // Let's register it as a stub so user can find it
    registerStub({ source: originalComponent, stub: component });
    function slotToFunction(slot) {
        switch (typeof slot) {
            case 'function':
                return slot;
            case 'object':
                return () => h(slot);
            case 'string':
                return processSlot(slot);
            default:
                throw Error(`Invalid slot received.`);
        }
    }
    // handle any slots passed via mounting options
    const slots = (options === null || options === void 0 ? void 0 : options.slots) &&
        Object.entries(options.slots).reduce((
        // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
        acc, [name, slot]
        // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
        ) => {
            if (Array.isArray(slot)) {
                const normalized = slot.map(slotToFunction);
                acc[name] = (args) => normalized.map(f => f(args));
                return acc;
            }
            acc[name] = slotToFunction(slot);
            return acc;
        }, {});
    // override component data with mounting options data
    if (options === null || options === void 0 ? void 0 : options.data) {
        const providedData = options.data();
        if (isObjectComponent(originalComponent)) {
            // component is guaranteed to be the same type as originalComponent
            const objectComponent = component;
            if (originalComponent.data) {
                const originalDataFn = originalComponent.data;
                objectComponent.data = vm => (Object.assign(Object.assign({}, originalDataFn.call(vm, vm)), providedData));
            }
            else if (objectComponent.setup) {
                const originalSetupFn = objectComponent.setup;
                objectComponent.setup = function (a, b) {
                    const data = originalSetupFn(a, b);
                    mergeDeep(proxyRefs$1(data), providedData);
                    return data;
                };
            }
            else {
                objectComponent.data = () => (Object.assign({}, providedData));
            }
        }
        else {
            throw new Error('data() option is not supported on functional components');
        }
    }
    const MOUNT_COMPONENT_REF = 'VTU_COMPONENT';
    // we define props as reactive so that way when we update them with `setProps`
    // Vue's reactivity system will cause a rerender.
    const refs = shallowReactive$1({});
    const props = reactive$1({});
    Object.entries(Object.assign(Object.assign(Object.assign(Object.assign({}, options === null || options === void 0 ? void 0 : options.attrs), options === null || options === void 0 ? void 0 : options.propsData), options === null || options === void 0 ? void 0 : options.props), { ref: MOUNT_COMPONENT_REF })).forEach(([k, v]) => {
        if (isDeepRef(v)) {
            refs[k] = v;
        }
        else {
            props[k] = v;
        }
    });
    const global = mergeGlobalProperties(options === null || options === void 0 ? void 0 : options.global);
    if (isObjectComponent(component)) {
        component.components = Object.assign(Object.assign({}, component.components), global.components);
    }
    const componentRef = ref(null);
    // create the wrapper component
    const Parent = defineComponent({
        name: 'VTU_ROOT',
        setup() {
            return {
                [MOUNT_COMPONENT_REF]: componentRef
            };
        },
        render() {
            return h(component, Object.assign(Object.assign({}, props), refs), slots);
        }
    });
    // create the app
    const app = createApp$1(Parent);
    // add tracking for emitted events
    // this must be done after `createApp`: https://github.com/vuejs/test-utils/issues/436
    attachEmitListener();
    // global mocks mixin
    if (global === null || global === void 0 ? void 0 : global.mocks) {
        const mixin = {
            beforeCreate() {
                // we need to differentiate components that are or not not `script setup`
                // otherwise we run into a proxy set error
                // due to https://github.com/vuejs/core/commit/f73925d76a76ee259749b8b48cb68895f539a00f#diff-ea4d1ddabb7e22e17e80ada458eef70679af4005df2a1a6b73418fec897603ceR404
                // introduced in Vue v3.2.45
                // Also ensures not to include option API components in this block
                // since they can also have setup state but need to be patched using
                // the regular method.
                if (isScriptSetup(this)) {
                    // add the mocks to setupState
                    for (const [k, v] of Object.entries(global.mocks)) {
                        // we do this in a try/catch, as some properties might be read-only
                        try {
                            this.$.setupState[k] = v;
                            // eslint-disable-next-line no-empty
                        }
                        catch (e) { }
                    }
                    this.$.proxy = new Proxy(this.$.proxy, {
                        get(target, key) {
                            if (key in global.mocks) {
                                return global.mocks[key];
                            }
                            return target[key];
                        }
                    });
                }
                else {
                    for (const [k, v] of Object.entries(global.mocks)) {
                        this[k] = v;
                    }
                }
            }
        };
        app.mixin(mixin);
    }
    // AppConfig
    if (global.config) {
        for (const [k, v] of Object.entries(global.config)) {
            // TODO should be switched to a ts-expect-error once Vue 3.5 is used
            // @ts-expect-error https://github.com/vuejs/test-utils/issues/2483
            app.config[k] = isObject$1(app.config[k])
                ? Object.assign(app.config[k], v)
                : v;
        }
    }
    // provide any values passed via provides mounting option
    if (global.provide) {
        for (const key of Reflect.ownKeys(global.provide)) {
            // TODO should be switched to a ts-expect-error
            // @ts-expect-error: https://github.com/microsoft/TypeScript/issues/1863
            app.provide(key, global.provide[key]);
        }
    }
    // use and plugins from mounting options
    if (global.plugins) {
        for (const plugin of global.plugins) {
            if (Array.isArray(plugin)) {
                app.use(plugin[0], ...plugin.slice(1));
                continue;
            }
            app.use(plugin);
        }
    }
    // use any mixins from mounting options
    if (global.mixins) {
        for (const mixin of global.mixins)
            app.mixin(mixin);
    }
    if (global.components) {
        for (const key of Object.keys(global.components)) {
            // avoid registering components that are stubbed twice
            if (!(key in global.stubs)) {
                app.component(key, global.components[key]);
            }
        }
    }
    if (global.directives) {
        for (const key of Object.keys(global.directives))
            app.directive(key, global.directives[key]);
    }
    // stubs
    // even if we are using `mount`, we will still
    // stub out Transition and Transition Group by default.
    transformVNodeArgs(createVNodeTransformer({
        rootComponents,
        transformers: [
            createStubComponentsTransformer({
                rootComponents,
                stubs: getComponentsFromStubs(global.stubs),
                shallow: options === null || options === void 0 ? void 0 : options.shallow,
                renderStubDefaultSlot: global.renderStubDefaultSlot
            }),
            createStubDirectivesTransformer({
                directives: getDirectivesFromStubs(global.stubs)
            })
        ]
    }));
    // users expect stubs to work with globally registered
    // components so we register stubs as global components to avoid
    // warning about not being able to resolve component
    //
    // component implementation provided here will never be called
    // but we need name to make sure that stubComponents will
    // properly stub this later by matching stub name
    //
    // ref: https://github.com/vuejs/test-utils/issues/249
    // ref: https://github.com/vuejs/test-utils/issues/425
    if (global === null || global === void 0 ? void 0 : global.stubs) {
        for (const name of Object.keys(getComponentsFromStubs(global.stubs))) {
            if (!app.component(name)) {
                app.component(name, { name });
            }
        }
    }
    return {
        app,
        props,
        componentRef
    };
}

let isEnabled = false;
const wrapperInstances = [];
function disableAutoUnmount() {
    isEnabled = false;
    wrapperInstances.length = 0;
}
function enableAutoUnmount(hook) {
    if (isEnabled) {
        throw new Error('enableAutoUnmount cannot be called more than once');
    }
    isEnabled = true;
    hook(() => {
        wrapperInstances.forEach((wrapper) => {
            wrapper.unmount();
        });
        wrapperInstances.length = 0;
    });
}
function trackInstance(wrapper) {
    if (!isEnabled)
        return;
    wrapperInstances.push(wrapper);
}

// implementation
function mount(inputComponent, options) {
    const { app, props, componentRef } = createInstance(inputComponent, options);
    const setProps = (newProps) => {
        for (const [k, v] of Object.entries(newProps)) {
            props[k] = v;
        }
        return vm.$nextTick();
    };
    // Workaround for https://github.com/vuejs/core/issues/7020
    const originalErrorHandler = app.config.errorHandler;
    const errorsOnMount = [];
    app.config.errorHandler = (err, instance, info) => {
        errorsOnMount.push(err);
        return originalErrorHandler === null || originalErrorHandler === void 0 ? void 0 : originalErrorHandler(err, instance, info);
    };
    // mount the app!
    const el = document.createElement('div');
    if (options === null || options === void 0 ? void 0 : options.attachTo) {
        let to;
        if (typeof options.attachTo === 'string') {
            to = document.querySelector(options.attachTo);
            if (!to) {
                throw new Error(`Unable to find the element matching the selector ${options.attachTo} given as the \`attachTo\` option`);
            }
        }
        else {
            to = options.attachTo;
        }
        to.appendChild(el);
        app.onUnmount(() => {
            // The wrapper may already have been manually unmounted before auto-unmount
            // runs, so the container can already be removed from its parent.
            if (el.parentNode === to) {
                to.removeChild(el);
            }
        });
    }
    const vm = app.mount(el);
    if (errorsOnMount.length) {
        // If several errors are thrown during mount, then throw the first one
        throw errorsOnMount[0];
    }
    app.config.errorHandler = originalErrorHandler;
    const appRef = componentRef.value;
    // we add `hasOwnProperty` so Jest can spy on the proxied vm without throwing
    // note that this is not necessary with Jest v27+ or Vitest, but is kept for compatibility with older Jest versions
    if (!app.hasOwnProperty) {
        appRef.hasOwnProperty = property => {
            return Reflect.has(appRef, property);
        };
    }
    const wrapper = createVueWrapper(app, appRef, setProps);
    trackInstance(wrapper);
    return wrapper;
}
const shallowMount = (component, options) => {
    return mount(component, Object.assign(Object.assign({}, options), { shallow: true }));
};

/**
* @vue/reactivity v3.5.42
* (c) 2018-present Yuxi (Evan) You and Vue contributors
* @license MIT
**/

function warn$2(msg, ...args) {
  console.warn(`[Vue warn] ${msg}`, ...args);
}

let activeEffectScope;
class EffectScope {
  // TODO isolatedDeclarations "__v_skip"
  constructor(detached = false) {
    this.detached = detached;
    /**
     * @internal
     */
    this._active = true;
    /**
     * @internal track `on` calls, allow `on` call multiple times
     */
    this._on = 0;
    /**
     * @internal
     */
    this.effects = [];
    /**
     * @internal
     */
    this.cleanups = [];
    this._isPaused = false;
    this._warnOnRun = true;
    this.__v_skip = true;
    if (!detached && activeEffectScope) {
      if (activeEffectScope.active) {
        this.parent = activeEffectScope;
        this.index = (activeEffectScope.scopes || (activeEffectScope.scopes = [])).push(
          this
        ) - 1;
      } else {
        this._active = false;
        this._warnOnRun = false;
      }
    }
  }
  get active() {
    return this._active;
  }
  pause() {
    if (this._active) {
      this._isPaused = true;
      let i, l;
      if (this.scopes) {
        const scopes = this.scopes.slice();
        for (i = 0, l = scopes.length; i < l; i++) {
          scopes[i].pause();
        }
      }
      for (i = 0, l = this.effects.length; i < l; i++) {
        this.effects[i].pause();
      }
    }
  }
  /**
   * Resumes the effect scope, including all child scopes and effects.
   */
  resume() {
    if (this._active) {
      if (this._isPaused) {
        this._isPaused = false;
        let i, l;
        if (this.scopes) {
          const scopes = this.scopes.slice();
          for (i = 0, l = scopes.length; i < l; i++) {
            scopes[i].resume();
          }
        }
        const effects = this.effects.slice();
        for (i = 0, l = effects.length; i < l; i++) {
          effects[i].resume();
        }
      }
    }
  }
  run(fn) {
    if (this._active) {
      const currentEffectScope = activeEffectScope;
      try {
        activeEffectScope = this;
        return fn();
      } finally {
        activeEffectScope = currentEffectScope;
      }
    } else if (this._warnOnRun) {
      warn$2(`cannot run an inactive effect scope.`);
    }
  }
  /**
   * This should only be called on non-detached scopes
   * @internal
   */
  on() {
    if (++this._on === 1) {
      this.prevScope = activeEffectScope;
      activeEffectScope = this;
    }
  }
  /**
   * This should only be called on non-detached scopes
   * @internal
   */
  off() {
    if (this._on > 0 && --this._on === 0) {
      if (activeEffectScope === this) {
        activeEffectScope = this.prevScope;
      } else {
        let current = activeEffectScope;
        while (current) {
          if (current.prevScope === this) {
            current.prevScope = this.prevScope;
            break;
          }
          current = current.prevScope;
        }
      }
      this.prevScope = void 0;
    }
  }
  stop(fromParent) {
    if (this._active) {
      this._active = false;
      let i, l;
      for (i = 0, l = this.effects.length; i < l; i++) {
        this.effects[i].stop();
      }
      this.effects.length = 0;
      for (i = 0, l = this.cleanups.length; i < l; i++) {
        this.cleanups[i]();
      }
      this.cleanups.length = 0;
      if (this.scopes) {
        const scopes = this.scopes.slice();
        for (i = 0, l = scopes.length; i < l; i++) {
          scopes[i].stop(true);
        }
        this.scopes.length = 0;
      }
      if (!this.detached && this.parent && !fromParent) {
        const last = this.parent.scopes.pop();
        if (last && last !== this) {
          this.parent.scopes[this.index] = last;
          last.index = this.index;
        }
      }
      this.parent = void 0;
    }
  }
}
function getCurrentScope() {
  return activeEffectScope;
}

let activeSub;
const pausedQueueEffects = /* @__PURE__ */ new WeakSet();
class ReactiveEffect {
  constructor(fn) {
    this.fn = fn;
    /**
     * @internal
     */
    this.deps = void 0;
    /**
     * @internal
     */
    this.depsTail = void 0;
    /**
     * @internal
     */
    this.flags = 1 | 4;
    /**
     * @internal
     */
    this.next = void 0;
    /**
     * @internal
     */
    this.cleanup = void 0;
    this.scheduler = void 0;
    if (activeEffectScope) {
      if (activeEffectScope.active) {
        activeEffectScope.effects.push(this);
      } else {
        this.flags &= -2;
      }
    }
  }
  pause() {
    this.flags |= 64;
  }
  resume() {
    if (this.flags & 64) {
      this.flags &= -65;
      if (pausedQueueEffects.has(this)) {
        pausedQueueEffects.delete(this);
        this.trigger();
      }
    }
  }
  /**
   * @internal
   */
  notify() {
    if (this.flags & 2 && !(this.flags & 32)) {
      return;
    }
    if (!(this.flags & 8)) {
      batch(this);
    }
  }
  run() {
    if (!(this.flags & 1)) {
      return this.fn();
    }
    this.flags |= 2;
    cleanupEffect(this);
    prepareDeps(this);
    const prevEffect = activeSub;
    const prevShouldTrack = shouldTrack;
    activeSub = this;
    shouldTrack = true;
    try {
      return this.fn();
    } finally {
      if (activeSub !== this) {
        warn$2(
          "Active effect was not restored correctly - this is likely a Vue internal bug."
        );
      }
      cleanupDeps(this);
      activeSub = prevEffect;
      shouldTrack = prevShouldTrack;
      this.flags &= -3;
    }
  }
  stop() {
    if (this.flags & 1) {
      for (let link = this.deps; link; link = link.nextDep) {
        removeSub(link);
      }
      this.deps = this.depsTail = void 0;
      cleanupEffect(this);
      this.onStop && this.onStop();
      this.flags &= -2;
    }
  }
  trigger() {
    if (this.flags & 64) {
      pausedQueueEffects.add(this);
    } else if (this.scheduler) {
      this.scheduler();
    } else {
      this.runIfDirty();
    }
  }
  /**
   * @internal
   */
  runIfDirty() {
    if (isDirty(this)) {
      this.run();
    }
  }
  get dirty() {
    return isDirty(this);
  }
}
let batchDepth = 0;
let batchedSub;
let batchedComputed;
function batch(sub, isComputed = false) {
  sub.flags |= 8;
  if (isComputed) {
    sub.next = batchedComputed;
    batchedComputed = sub;
    return;
  }
  sub.next = batchedSub;
  batchedSub = sub;
}
function startBatch() {
  batchDepth++;
}
function endBatch() {
  if (--batchDepth > 0) {
    return;
  }
  if (batchedComputed) {
    let e = batchedComputed;
    batchedComputed = void 0;
    while (e) {
      const next = e.next;
      e.next = void 0;
      e.flags &= -9;
      e = next;
    }
  }
  let error;
  while (batchedSub) {
    let e = batchedSub;
    batchedSub = void 0;
    while (e) {
      const next = e.next;
      e.next = void 0;
      e.flags &= -9;
      if (e.flags & 1) {
        try {
          ;
          e.trigger();
        } catch (err) {
          if (!error) error = err;
        }
      }
      e = next;
    }
  }
  if (error) throw error;
}
function prepareDeps(sub) {
  for (let link = sub.deps; link; link = link.nextDep) {
    link.version = -1;
    link.prevActiveLink = link.dep.activeLink;
    link.dep.activeLink = link;
  }
}
function cleanupDeps(sub) {
  let head;
  let tail = sub.depsTail;
  let link = tail;
  while (link) {
    const prev = link.prevDep;
    if (link.version === -1) {
      if (link === tail) tail = prev;
      removeSub(link);
      removeDep(link);
    } else {
      head = link;
    }
    link.dep.activeLink = link.prevActiveLink;
    link.prevActiveLink = void 0;
    link = prev;
  }
  sub.deps = head;
  sub.depsTail = tail;
}
function isDirty(sub) {
  for (let link = sub.deps; link; link = link.nextDep) {
    if (link.dep.version !== link.version || link.dep.computed && (refreshComputed(link.dep.computed) || link.dep.version !== link.version)) {
      return true;
    }
  }
  if (sub._dirty) {
    return true;
  }
  return false;
}
function refreshComputed(computed) {
  if (computed.flags & 4 && !(computed.flags & 16)) {
    return;
  }
  computed.flags &= -17;
  if (computed.globalVersion === globalVersion) {
    return;
  }
  computed.globalVersion = globalVersion;
  if (!computed.isSSR && computed.flags & 128 && (!computed.deps && !computed._dirty || !isDirty(computed))) {
    return;
  }
  computed.flags |= 2;
  const dep = computed.dep;
  const prevSub = activeSub;
  const prevShouldTrack = shouldTrack;
  activeSub = computed;
  shouldTrack = true;
  try {
    prepareDeps(computed);
    const value = computed.fn(computed._value);
    if (dep.version === 0 || hasChanged(value, computed._value)) {
      computed.flags |= 128;
      computed._value = value;
      dep.version++;
    }
  } catch (err) {
    dep.version++;
    throw err;
  } finally {
    activeSub = prevSub;
    shouldTrack = prevShouldTrack;
    cleanupDeps(computed);
    computed.flags &= -3;
  }
}
function removeSub(link, soft = false) {
  const { dep, prevSub, nextSub } = link;
  if (prevSub) {
    prevSub.nextSub = nextSub;
    link.prevSub = void 0;
  }
  if (nextSub) {
    nextSub.prevSub = prevSub;
    link.nextSub = void 0;
  }
  if (dep.subsHead === link) {
    dep.subsHead = nextSub;
  }
  if (dep.subs === link) {
    dep.subs = prevSub;
    if (!prevSub && dep.computed) {
      dep.computed.flags &= -5;
      for (let l = dep.computed.deps; l; l = l.nextDep) {
        removeSub(l, true);
      }
    }
  }
  if (!soft && !--dep.sc && dep.map) {
    dep.map.delete(dep.key);
  }
}
function removeDep(link) {
  const { prevDep, nextDep } = link;
  if (prevDep) {
    prevDep.nextDep = nextDep;
    link.prevDep = void 0;
  }
  if (nextDep) {
    nextDep.prevDep = prevDep;
    link.nextDep = void 0;
  }
}
let shouldTrack = true;
const trackStack = [];
function pauseTracking() {
  trackStack.push(shouldTrack);
  shouldTrack = false;
}
function resetTracking() {
  const last = trackStack.pop();
  shouldTrack = last === void 0 ? true : last;
}
function cleanupEffect(e) {
  const { cleanup } = e;
  e.cleanup = void 0;
  if (cleanup) {
    const prevSub = activeSub;
    activeSub = void 0;
    try {
      cleanup();
    } finally {
      activeSub = prevSub;
    }
  }
}

let globalVersion = 0;
class Link {
  constructor(sub, dep) {
    this.sub = sub;
    this.dep = dep;
    this.version = dep.version;
    this.nextDep = this.prevDep = this.nextSub = this.prevSub = this.prevActiveLink = void 0;
  }
}
class Dep {
  // TODO isolatedDeclarations "__v_skip"
  constructor(computed) {
    this.computed = computed;
    this.version = 0;
    /**
     * Link between this dep and the current active effect
     */
    this.activeLink = void 0;
    /**
     * Doubly linked list representing the subscribing effects (tail)
     */
    this.subs = void 0;
    /**
     * For object property deps cleanup
     */
    this.map = void 0;
    this.key = void 0;
    /**
     * Subscriber counter
     */
    this.sc = 0;
    /**
     * @internal
     */
    this.__v_skip = true;
    {
      this.subsHead = void 0;
    }
  }
  track(debugInfo) {
    if (!activeSub || !shouldTrack || activeSub === this.computed) {
      return;
    }
    let link = this.activeLink;
    if (link === void 0 || link.sub !== activeSub) {
      link = this.activeLink = new Link(activeSub, this);
      if (!activeSub.deps) {
        activeSub.deps = activeSub.depsTail = link;
      } else {
        link.prevDep = activeSub.depsTail;
        activeSub.depsTail.nextDep = link;
        activeSub.depsTail = link;
      }
      addSub(link);
    } else if (link.version === -1) {
      link.version = this.version;
      if (link.nextDep) {
        const next = link.nextDep;
        next.prevDep = link.prevDep;
        if (link.prevDep) {
          link.prevDep.nextDep = next;
        }
        link.prevDep = activeSub.depsTail;
        link.nextDep = void 0;
        activeSub.depsTail.nextDep = link;
        activeSub.depsTail = link;
        if (activeSub.deps === link) {
          activeSub.deps = next;
        }
      }
    }
    if (activeSub.onTrack) {
      activeSub.onTrack(
        extend(
          {
            effect: activeSub
          },
          debugInfo
        )
      );
    }
    return link;
  }
  trigger(debugInfo) {
    this.version++;
    globalVersion++;
    this.notify(debugInfo);
  }
  notify(debugInfo) {
    startBatch();
    try {
      if (!!(true !== "production")) {
        for (let head = this.subsHead; head; head = head.nextSub) {
          if (head.sub.onTrigger && !(head.sub.flags & 8)) {
            head.sub.onTrigger(
              extend(
                {
                  effect: head.sub
                },
                debugInfo
              )
            );
          }
        }
      }
      for (let link = this.subs; link; link = link.prevSub) {
        if (link.sub.notify()) {
          ;
          link.sub.dep.notify();
        }
      }
    } finally {
      endBatch();
    }
  }
}
function addSub(link) {
  link.dep.sc++;
  if (link.sub.flags & 4) {
    const computed = link.dep.computed;
    if (computed && !link.dep.subs) {
      computed.flags |= 4 | 16;
      for (let l = computed.deps; l; l = l.nextDep) {
        addSub(l);
      }
    }
    const currentTail = link.dep.subs;
    if (currentTail !== link) {
      link.prevSub = currentTail;
      if (currentTail) currentTail.nextSub = link;
    }
    if (link.dep.subsHead === void 0) {
      link.dep.subsHead = link;
    }
    link.dep.subs = link;
  }
}
const targetMap = /* @__PURE__ */ new WeakMap();
const ITERATE_KEY = /* @__PURE__ */ Symbol(
  "Object iterate" 
);
const MAP_KEY_ITERATE_KEY = /* @__PURE__ */ Symbol(
  "Map keys iterate" 
);
const ARRAY_ITERATE_KEY = /* @__PURE__ */ Symbol(
  "Array iterate" 
);
function track(target, type, key) {
  if (shouldTrack && activeSub) {
    let depsMap = targetMap.get(target);
    if (!depsMap) {
      targetMap.set(target, depsMap = /* @__PURE__ */ new Map());
    }
    let dep = depsMap.get(key);
    if (!dep) {
      depsMap.set(key, dep = new Dep());
      dep.map = depsMap;
      dep.key = key;
    }
    {
      dep.track({
        target,
        type,
        key
      });
    }
  }
}
function trigger(target, type, key, newValue, oldValue, oldTarget) {
  const depsMap = targetMap.get(target);
  if (!depsMap) {
    globalVersion++;
    return;
  }
  const run = (dep) => {
    if (dep) {
      {
        dep.trigger({
          target,
          type,
          key,
          newValue,
          oldValue,
          oldTarget
        });
      }
    }
  };
  startBatch();
  if (type === "clear") {
    depsMap.forEach(run);
  } else {
    const targetIsArray = isArray(target);
    const isArrayIndex = targetIsArray && isIntegerKey(key);
    if (targetIsArray && key === "length") {
      const newLength = Number(newValue);
      depsMap.forEach((dep, key2) => {
        if (key2 === "length" || key2 === ARRAY_ITERATE_KEY || !isSymbol(key2) && key2 >= newLength) {
          run(dep);
        }
      });
    } else {
      if (key !== void 0 || depsMap.has(void 0)) {
        run(depsMap.get(key));
      }
      if (isArrayIndex) {
        run(depsMap.get(ARRAY_ITERATE_KEY));
      }
      switch (type) {
        case "add":
          if (!targetIsArray) {
            run(depsMap.get(ITERATE_KEY));
            if (isMap(target)) {
              run(depsMap.get(MAP_KEY_ITERATE_KEY));
            }
          } else if (isArrayIndex) {
            run(depsMap.get("length"));
          }
          break;
        case "delete":
          if (!targetIsArray) {
            run(depsMap.get(ITERATE_KEY));
            if (isMap(target)) {
              run(depsMap.get(MAP_KEY_ITERATE_KEY));
            }
          }
          break;
        case "set":
          if (isMap(target)) {
            run(depsMap.get(ITERATE_KEY));
          }
          break;
      }
    }
  }
  endBatch();
}

function reactiveReadArray(array) {
  const raw = toRaw(array);
  if (raw === array) return raw;
  track(raw, "iterate", ARRAY_ITERATE_KEY);
  return isShallow(array) ? raw : raw.map(toReactive);
}
function shallowReadArray(arr) {
  track(arr = toRaw(arr), "iterate", ARRAY_ITERATE_KEY);
  return arr;
}
function toWrapped(target, item) {
  if (isReadonly(target)) {
    return isReactive(target) ? toReadonly(toReactive(item)) : toReadonly(item);
  }
  return toReactive(item);
}
const arrayInstrumentations = {
  __proto__: null,
  [Symbol.iterator]() {
    return iterator(this, Symbol.iterator, (item) => toWrapped(this, item));
  },
  concat(...args) {
    return reactiveReadArray(this).concat(
      ...args.map((x) => isArray(x) ? reactiveReadArray(x) : x)
    );
  },
  entries() {
    return iterator(this, "entries", (value) => {
      value[1] = toWrapped(this, value[1]);
      return value;
    });
  },
  every(fn, thisArg) {
    return apply(this, "every", fn, thisArg, void 0, arguments);
  },
  filter(fn, thisArg) {
    return apply(
      this,
      "filter",
      fn,
      thisArg,
      (v) => v.map((item) => toWrapped(this, item)),
      arguments
    );
  },
  find(fn, thisArg) {
    return apply(
      this,
      "find",
      fn,
      thisArg,
      (item) => toWrapped(this, item),
      arguments
    );
  },
  findIndex(fn, thisArg) {
    return apply(this, "findIndex", fn, thisArg, void 0, arguments);
  },
  findLast(fn, thisArg) {
    return apply(
      this,
      "findLast",
      fn,
      thisArg,
      (item) => toWrapped(this, item),
      arguments
    );
  },
  findLastIndex(fn, thisArg) {
    return apply(this, "findLastIndex", fn, thisArg, void 0, arguments);
  },
  // flat, flatMap could benefit from ARRAY_ITERATE but are not straight-forward to implement
  forEach(fn, thisArg) {
    return apply(this, "forEach", fn, thisArg, void 0, arguments);
  },
  includes(...args) {
    return searchProxy(this, "includes", args);
  },
  indexOf(...args) {
    return searchProxy(this, "indexOf", args);
  },
  join(separator) {
    return reactiveReadArray(this).join(separator);
  },
  // keys() iterator only reads `length`, no optimization required
  lastIndexOf(...args) {
    return searchProxy(this, "lastIndexOf", args);
  },
  map(fn, thisArg) {
    return apply(this, "map", fn, thisArg, void 0, arguments);
  },
  pop() {
    return noTracking(this, "pop");
  },
  push(...args) {
    return noTracking(this, "push", args);
  },
  reduce(fn, ...args) {
    return reduce(this, "reduce", fn, args);
  },
  reduceRight(fn, ...args) {
    return reduce(this, "reduceRight", fn, args);
  },
  shift() {
    return noTracking(this, "shift");
  },
  // slice could use ARRAY_ITERATE but also seems to beg for range tracking
  some(fn, thisArg) {
    return apply(this, "some", fn, thisArg, void 0, arguments);
  },
  splice(...args) {
    return noTracking(this, "splice", args);
  },
  toReversed() {
    return reactiveReadArray(this).toReversed();
  },
  toSorted(comparer) {
    return reactiveReadArray(this).toSorted(comparer);
  },
  toSpliced(...args) {
    return reactiveReadArray(this).toSpliced(...args);
  },
  unshift(...args) {
    return noTracking(this, "unshift", args);
  },
  values() {
    return iterator(this, "values", (item) => toWrapped(this, item));
  }
};
function iterator(self, method, wrapValue) {
  const arr = shallowReadArray(self);
  const iter = arr[method]();
  if (arr !== self && !isShallow(self)) {
    iter._next = iter.next;
    iter.next = () => {
      const result = iter._next();
      if (!result.done) {
        result.value = wrapValue(result.value);
      }
      return result;
    };
  }
  return iter;
}
const arrayProto = Array.prototype;
function apply(self, method, fn, thisArg, wrappedRetFn, args) {
  const arr = shallowReadArray(self);
  const needsWrap = arr !== self && !isShallow(self);
  const methodFn = arr[method];
  if (methodFn !== arrayProto[method]) {
    const result2 = methodFn.apply(self, args);
    return needsWrap ? toReactive(result2) : result2;
  }
  let wrappedFn = fn;
  if (arr !== self) {
    if (needsWrap) {
      wrappedFn = function(item, index) {
        return fn.call(this, toWrapped(self, item), index, self);
      };
    } else if (fn.length > 2) {
      wrappedFn = function(item, index) {
        return fn.call(this, item, index, self);
      };
    }
  }
  const result = methodFn.call(arr, wrappedFn, thisArg);
  return needsWrap && wrappedRetFn ? wrappedRetFn(result) : result;
}
function reduce(self, method, fn, args) {
  const arr = shallowReadArray(self);
  const needsWrap = arr !== self && !isShallow(self);
  let wrappedFn = fn;
  let wrapInitialAccumulator = false;
  if (arr !== self) {
    if (needsWrap) {
      wrapInitialAccumulator = args.length === 0;
      wrappedFn = function(acc, item, index) {
        if (wrapInitialAccumulator) {
          wrapInitialAccumulator = false;
          acc = toWrapped(self, acc);
        }
        return fn.call(this, acc, toWrapped(self, item), index, self);
      };
    } else if (fn.length > 3) {
      wrappedFn = function(acc, item, index) {
        return fn.call(this, acc, item, index, self);
      };
    }
  }
  const result = arr[method](wrappedFn, ...args);
  return wrapInitialAccumulator ? toWrapped(self, result) : result;
}
function searchProxy(self, method, args) {
  const arr = toRaw(self);
  track(arr, "iterate", ARRAY_ITERATE_KEY);
  const res = arr[method](...args);
  if ((res === -1 || res === false) && isProxy(args[0])) {
    args[0] = toRaw(args[0]);
    return arr[method](...args);
  }
  return res;
}
function noTracking(self, method, args = []) {
  pauseTracking();
  startBatch();
  const res = toRaw(self)[method].apply(self, args);
  endBatch();
  resetTracking();
  return res;
}

const isNonTrackableKeys = /* @__PURE__ */ makeMap(`__proto__,__v_isRef,__isVue`);
const builtInSymbols = new Set(
  /* @__PURE__ */ Object.getOwnPropertyNames(Symbol).filter((key) => key !== "arguments" && key !== "caller").map((key) => Symbol[key]).filter(isSymbol)
);
function hasOwnProperty(key) {
  if (!isSymbol(key)) key = String(key);
  const obj = toRaw(this);
  track(obj, "has", key);
  return obj.hasOwnProperty(key);
}
class BaseReactiveHandler {
  constructor(_isReadonly = false, _isShallow = false) {
    this._isReadonly = _isReadonly;
    this._isShallow = _isShallow;
  }
  get(target, key, receiver) {
    if (key === "__v_skip") return target["__v_skip"];
    const isReadonly2 = this._isReadonly, isShallow2 = this._isShallow;
    if (key === "__v_isReactive") {
      return !isReadonly2;
    } else if (key === "__v_isReadonly") {
      return isReadonly2;
    } else if (key === "__v_isShallow") {
      return isShallow2;
    } else if (key === "__v_raw") {
      if (receiver === (isReadonly2 ? isShallow2 ? shallowReadonlyMap : readonlyMap : isShallow2 ? shallowReactiveMap : reactiveMap).get(target) || // receiver is not the reactive proxy, but has the same prototype
      // this means the receiver is a user proxy of the reactive proxy
      Object.getPrototypeOf(target) === Object.getPrototypeOf(receiver)) {
        return target;
      }
      return;
    }
    const targetIsArray = isArray(target);
    if (!isReadonly2) {
      let fn;
      if (targetIsArray && (fn = arrayInstrumentations[key])) {
        return fn;
      }
      if (key === "hasOwnProperty") {
        return hasOwnProperty;
      }
    }
    const res = Reflect.get(
      target,
      key,
      // if this is a proxy wrapping a ref, return methods using the raw ref
      // as receiver so that we don't have to call `toRaw` on the ref in all
      // its class methods
      isRef(target) ? target : receiver
    );
    if (isSymbol(key) ? builtInSymbols.has(key) : isNonTrackableKeys(key)) {
      return res;
    }
    if (!isReadonly2) {
      track(target, "get", key);
    }
    if (isShallow2) {
      return res;
    }
    if (isRef(res)) {
      const value = targetIsArray && isIntegerKey(key) ? res : res.value;
      return isReadonly2 && isObject(value) ? readonly(value) : value;
    }
    if (isObject(res)) {
      return isReadonly2 ? readonly(res) : reactive(res);
    }
    return res;
  }
}
class MutableReactiveHandler extends BaseReactiveHandler {
  constructor(isShallow2 = false) {
    super(false, isShallow2);
  }
  set(target, key, value, receiver) {
    let oldValue = target[key];
    const isArrayWithIntegerKey = isArray(target) && isIntegerKey(key);
    if (!this._isShallow) {
      const isOldValueReadonly = isReadonly(oldValue);
      if (!isShallow(value) && !isReadonly(value)) {
        oldValue = toRaw(oldValue);
        value = toRaw(value);
      }
      if (!isArrayWithIntegerKey && isRef(oldValue) && !isRef(value)) {
        if (isOldValueReadonly) {
          {
            warn$2(
              `Set operation on key "${String(key)}" failed: target is readonly.`,
              target[key]
            );
          }
          return true;
        } else {
          oldValue.value = value;
          return true;
        }
      }
    }
    const hadKey = isArrayWithIntegerKey ? Number(key) < target.length : hasOwn(target, key);
    const result = Reflect.set(
      target,
      key,
      value,
      isRef(target) ? target : receiver
    );
    if (target === toRaw(receiver) && result) {
      if (!hadKey) {
        trigger(target, "add", key, value);
      } else if (hasChanged(value, oldValue)) {
        trigger(target, "set", key, value, oldValue);
      }
    }
    return result;
  }
  deleteProperty(target, key) {
    const hadKey = hasOwn(target, key);
    const oldValue = target[key];
    const result = Reflect.deleteProperty(target, key);
    if (result && hadKey) {
      trigger(target, "delete", key, void 0, oldValue);
    }
    return result;
  }
  has(target, key) {
    const result = Reflect.has(target, key);
    if (!isSymbol(key) || !builtInSymbols.has(key)) {
      track(target, "has", key);
    }
    return result;
  }
  ownKeys(target) {
    track(
      target,
      "iterate",
      isArray(target) ? "length" : ITERATE_KEY
    );
    return Reflect.ownKeys(target);
  }
}
class ReadonlyReactiveHandler extends BaseReactiveHandler {
  constructor(isShallow2 = false) {
    super(true, isShallow2);
  }
  set(target, key) {
    {
      warn$2(
        `Set operation on key "${String(key)}" failed: target is readonly.`,
        target
      );
    }
    return true;
  }
  deleteProperty(target, key) {
    {
      warn$2(
        `Delete operation on key "${String(key)}" failed: target is readonly.`,
        target
      );
    }
    return true;
  }
}
const mutableHandlers = /* @__PURE__ */ new MutableReactiveHandler();
const readonlyHandlers = /* @__PURE__ */ new ReadonlyReactiveHandler();
const shallowReactiveHandlers = /* @__PURE__ */ new MutableReactiveHandler(true);
const shallowReadonlyHandlers = /* @__PURE__ */ new ReadonlyReactiveHandler(true);

const toShallow = (value) => value;
const getProto = (v) => Reflect.getPrototypeOf(v);
function createIterableMethod(method, isReadonly2, isShallow2) {
  return function(...args) {
    const target = this["__v_raw"];
    const rawTarget = toRaw(target);
    const targetIsMap = isMap(rawTarget);
    const isPair = method === "entries" || method === Symbol.iterator && targetIsMap;
    const isKeyOnly = method === "keys" && targetIsMap;
    const innerIterator = target[method](...args);
    const wrap = isShallow2 ? toShallow : isReadonly2 ? toReadonly : toReactive;
    !isReadonly2 && track(
      rawTarget,
      "iterate",
      isKeyOnly ? MAP_KEY_ITERATE_KEY : ITERATE_KEY
    );
    return extend(
      // inheriting all iterator properties
      Object.create(innerIterator),
      {
        // iterator protocol
        next() {
          const { value, done } = innerIterator.next();
          return done ? { value, done } : {
            value: isPair ? [wrap(value[0]), wrap(value[1])] : wrap(value),
            done
          };
        }
      }
    );
  };
}
function createReadonlyMethod(type) {
  return function(...args) {
    {
      const key = args[0] ? `on key "${args[0]}" ` : ``;
      warn$2(
        `${capitalize(type)} operation ${key}failed: target is readonly.`,
        toRaw(this)
      );
    }
    return type === "delete" ? false : type === "clear" ? void 0 : this;
  };
}
function createInstrumentations(readonly, shallow) {
  const instrumentations = {
    get(key) {
      const target = this["__v_raw"];
      const rawTarget = toRaw(target);
      const rawKey = toRaw(key);
      if (!readonly) {
        if (hasChanged(key, rawKey)) {
          track(rawTarget, "get", key);
        }
        track(rawTarget, "get", rawKey);
      }
      const { has } = getProto(rawTarget);
      const wrap = shallow ? toShallow : readonly ? toReadonly : toReactive;
      if (has.call(rawTarget, key)) {
        return wrap(target.get(key));
      } else if (has.call(rawTarget, rawKey)) {
        return wrap(target.get(rawKey));
      } else if (target !== rawTarget) {
        target.get(key);
      }
    },
    get size() {
      const target = this["__v_raw"];
      !readonly && track(toRaw(target), "iterate", ITERATE_KEY);
      return target.size;
    },
    has(key) {
      const target = this["__v_raw"];
      const rawTarget = toRaw(target);
      const rawKey = toRaw(key);
      if (!readonly) {
        if (hasChanged(key, rawKey)) {
          track(rawTarget, "has", key);
        }
        track(rawTarget, "has", rawKey);
      }
      return key === rawKey ? target.has(key) : target.has(key) || target.has(rawKey);
    },
    forEach(callback, thisArg) {
      const observed = this;
      const target = observed["__v_raw"];
      const rawTarget = toRaw(target);
      const wrap = shallow ? toShallow : readonly ? toReadonly : toReactive;
      !readonly && track(rawTarget, "iterate", ITERATE_KEY);
      return target.forEach((value, key) => {
        return callback.call(thisArg, wrap(value), wrap(key), observed);
      });
    }
  };
  extend(
    instrumentations,
    readonly ? {
      add: createReadonlyMethod("add"),
      set: createReadonlyMethod("set"),
      delete: createReadonlyMethod("delete"),
      clear: createReadonlyMethod("clear")
    } : {
      add(value) {
        const target = toRaw(this);
        const proto = getProto(target);
        const rawValue = toRaw(value);
        const valueToAdd = !shallow && !isShallow(value) && !isReadonly(value) ? rawValue : value;
        const hadKey = proto.has.call(target, valueToAdd) || hasChanged(value, valueToAdd) && proto.has.call(target, value) || hasChanged(rawValue, valueToAdd) && proto.has.call(target, rawValue);
        if (!hadKey) {
          target.add(valueToAdd);
          trigger(target, "add", valueToAdd, valueToAdd);
        }
        return this;
      },
      set(key, value) {
        if (!shallow && !isShallow(value) && !isReadonly(value)) {
          value = toRaw(value);
        }
        const target = toRaw(this);
        const { has, get } = getProto(target);
        let hadKey = has.call(target, key);
        if (!hadKey) {
          key = toRaw(key);
          hadKey = has.call(target, key);
        } else {
          checkIdentityKeys(target, has, key);
        }
        const oldValue = get.call(target, key);
        target.set(key, value);
        if (!hadKey) {
          trigger(target, "add", key, value);
        } else if (hasChanged(value, oldValue)) {
          trigger(target, "set", key, value, oldValue);
        }
        return this;
      },
      delete(key) {
        const target = toRaw(this);
        const { has, get } = getProto(target);
        let hadKey = has.call(target, key);
        if (!hadKey) {
          key = toRaw(key);
          hadKey = has.call(target, key);
        } else {
          checkIdentityKeys(target, has, key);
        }
        const oldValue = get ? get.call(target, key) : void 0;
        const result = target.delete(key);
        if (hadKey) {
          trigger(target, "delete", key, void 0, oldValue);
        }
        return result;
      },
      clear() {
        const target = toRaw(this);
        const hadItems = target.size !== 0;
        const oldTarget = isMap(target) ? new Map(target) : new Set(target) ;
        const result = target.clear();
        if (hadItems) {
          trigger(
            target,
            "clear",
            void 0,
            void 0,
            oldTarget
          );
        }
        return result;
      }
    }
  );
  const iteratorMethods = [
    "keys",
    "values",
    "entries",
    Symbol.iterator
  ];
  iteratorMethods.forEach((method) => {
    instrumentations[method] = createIterableMethod(method, readonly, shallow);
  });
  return instrumentations;
}
function createInstrumentationGetter(isReadonly2, shallow) {
  const instrumentations = createInstrumentations(isReadonly2, shallow);
  return (target, key, receiver) => {
    if (key === "__v_isReactive") {
      return !isReadonly2;
    } else if (key === "__v_isReadonly") {
      return isReadonly2;
    } else if (key === "__v_raw") {
      return target;
    }
    return Reflect.get(
      hasOwn(instrumentations, key) && key in target ? instrumentations : target,
      key,
      receiver
    );
  };
}
const mutableCollectionHandlers = {
  get: /* @__PURE__ */ createInstrumentationGetter(false, false)
};
const shallowCollectionHandlers = {
  get: /* @__PURE__ */ createInstrumentationGetter(false, true)
};
const readonlyCollectionHandlers = {
  get: /* @__PURE__ */ createInstrumentationGetter(true, false)
};
const shallowReadonlyCollectionHandlers = {
  get: /* @__PURE__ */ createInstrumentationGetter(true, true)
};
function checkIdentityKeys(target, has, key) {
  const rawKey = toRaw(key);
  if (rawKey !== key && has.call(target, rawKey)) {
    const type = toRawType(target);
    warn$2(
      `Reactive ${type} contains both the raw and reactive versions of the same object${type === `Map` ? ` as keys` : ``}, which can lead to inconsistencies. Avoid differentiating between the raw and reactive versions of an object and only use the reactive version if possible.`
    );
  }
}

const reactiveMap = /* @__PURE__ */ new WeakMap();
const shallowReactiveMap = /* @__PURE__ */ new WeakMap();
const readonlyMap = /* @__PURE__ */ new WeakMap();
const shallowReadonlyMap = /* @__PURE__ */ new WeakMap();
function targetTypeMap(rawType) {
  switch (rawType) {
    case "Object":
    case "Array":
      return 1 /* COMMON */;
    case "Map":
    case "Set":
    case "WeakMap":
    case "WeakSet":
      return 2 /* COLLECTION */;
    default:
      return 0 /* INVALID */;
  }
}
// @__NO_SIDE_EFFECTS__
function reactive(target) {
  if (/* @__PURE__ */ isReadonly(target)) {
    return target;
  }
  return createReactiveObject(
    target,
    false,
    mutableHandlers,
    mutableCollectionHandlers,
    reactiveMap
  );
}
// @__NO_SIDE_EFFECTS__
function shallowReactive(target) {
  return createReactiveObject(
    target,
    false,
    shallowReactiveHandlers,
    shallowCollectionHandlers,
    shallowReactiveMap
  );
}
// @__NO_SIDE_EFFECTS__
function readonly(target) {
  return createReactiveObject(
    target,
    true,
    readonlyHandlers,
    readonlyCollectionHandlers,
    readonlyMap
  );
}
// @__NO_SIDE_EFFECTS__
function shallowReadonly(target) {
  return createReactiveObject(
    target,
    true,
    shallowReadonlyHandlers,
    shallowReadonlyCollectionHandlers,
    shallowReadonlyMap
  );
}
function createReactiveObject(target, isReadonly2, baseHandlers, collectionHandlers, proxyMap) {
  if (!isObject(target)) {
    {
      warn$2(
        `value cannot be made ${isReadonly2 ? "readonly" : "reactive"}: ${String(
          target
        )}`
      );
    }
    return target;
  }
  if (target["__v_raw"] && !(isReadonly2 && target["__v_isReactive"])) {
    return target;
  }
  if (target["__v_skip"] || !Object.isExtensible(target)) {
    return target;
  }
  const existingProxy = proxyMap.get(target);
  if (existingProxy) {
    return existingProxy;
  }
  const targetType = targetTypeMap(toRawType(target));
  if (targetType === 0 /* INVALID */) {
    return target;
  }
  const proxy = new Proxy(
    target,
    targetType === 2 /* COLLECTION */ ? collectionHandlers : baseHandlers
  );
  proxyMap.set(target, proxy);
  return proxy;
}
// @__NO_SIDE_EFFECTS__
function isReactive(value) {
  if (/* @__PURE__ */ isReadonly(value)) {
    return /* @__PURE__ */ isReactive(value["__v_raw"]);
  }
  return !!(value && value["__v_isReactive"]);
}
// @__NO_SIDE_EFFECTS__
function isReadonly(value) {
  return !!(value && value["__v_isReadonly"]);
}
// @__NO_SIDE_EFFECTS__
function isShallow(value) {
  return !!(value && value["__v_isShallow"]);
}
// @__NO_SIDE_EFFECTS__
function isProxy(value) {
  return value ? !!value["__v_raw"] : false;
}
// @__NO_SIDE_EFFECTS__
function toRaw(observed) {
  const raw = observed && observed["__v_raw"];
  return raw ? /* @__PURE__ */ toRaw(raw) : observed;
}
function markRaw(value) {
  if (!hasOwn(value, "__v_skip") && Object.isExtensible(value)) {
    def(value, "__v_skip", true);
  }
  return value;
}
const toReactive = (value) => isObject(value) ? /* @__PURE__ */ reactive(value) : value;
const toReadonly = (value) => isObject(value) ? /* @__PURE__ */ readonly(value) : value;

// @__NO_SIDE_EFFECTS__
function isRef(r) {
  return r ? r["__v_isRef"] === true : false;
}
function unref(ref2) {
  return /* @__PURE__ */ isRef(ref2) ? ref2.value : ref2;
}
const shallowUnwrapHandlers = {
  get: (target, key, receiver) => key === "__v_raw" ? target : unref(Reflect.get(target, key, receiver)),
  set: (target, key, value, receiver) => {
    const oldValue = target[key];
    if (/* @__PURE__ */ isRef(oldValue) && !/* @__PURE__ */ isRef(value)) {
      oldValue.value = value;
      return true;
    } else {
      return Reflect.set(target, key, value, receiver);
    }
  }
};
function proxyRefs(objectWithRefs) {
  return isReactive(objectWithRefs) ? objectWithRefs : new Proxy(objectWithRefs, shallowUnwrapHandlers);
}

class ComputedRefImpl {
  constructor(fn, setter, isSSR) {
    this.fn = fn;
    this.setter = setter;
    /**
     * @internal
     */
    this._value = void 0;
    /**
     * @internal
     */
    this.dep = new Dep(this);
    /**
     * @internal
     */
    this.__v_isRef = true;
    // TODO isolatedDeclarations "__v_isReadonly"
    // A computed is also a subscriber that tracks other deps
    /**
     * @internal
     */
    this.deps = void 0;
    /**
     * @internal
     */
    this.depsTail = void 0;
    /**
     * @internal
     */
    this.flags = 16;
    /**
     * @internal
     */
    this.globalVersion = globalVersion - 1;
    /**
     * @internal
     */
    this.next = void 0;
    // for backwards compat
    this.effect = this;
    this["__v_isReadonly"] = !setter;
    this.isSSR = isSSR;
  }
  /**
   * @internal
   */
  notify() {
    this.flags |= 16;
    if (!(this.flags & 8) && // avoid infinite self recursion
    activeSub !== this) {
      batch(this, true);
      return true;
    }
  }
  get value() {
    const link = this.dep.track({
      target: this,
      type: "get",
      key: "value"
    }) ;
    refreshComputed(this);
    if (link) {
      link.version = this.dep.version;
    }
    return this._value;
  }
  set value(newValue) {
    if (this.setter) {
      this.setter(newValue);
    } else {
      warn$2("Write operation failed: computed value is readonly");
    }
  }
}
// @__NO_SIDE_EFFECTS__
function computed$1(getterOrOptions, debugOptions, isSSR = false) {
  let getter;
  let setter;
  if (isFunction(getterOrOptions)) {
    getter = getterOrOptions;
  } else {
    getter = getterOrOptions.get;
    setter = getterOrOptions.set;
  }
  const cRef = new ComputedRefImpl(getter, setter, isSSR);
  return cRef;
}
const INITIAL_WATCHER_VALUE = {};
const cleanupMap = /* @__PURE__ */ new WeakMap();
let activeWatcher = void 0;
function onWatcherCleanup(cleanupFn, failSilently = false, owner = activeWatcher) {
  if (owner) {
    let cleanups = cleanupMap.get(owner);
    if (!cleanups) cleanupMap.set(owner, cleanups = []);
    cleanups.push(cleanupFn);
  } else if (!failSilently) {
    warn$2(
      `onWatcherCleanup() was called when there was no active watcher to associate with.`
    );
  }
}
function watch$1(source, cb, options = EMPTY_OBJ) {
  const { immediate, deep, once, scheduler, augmentJob, call } = options;
  const warnInvalidSource = (s) => {
    (options.onWarn || warn$2)(
      `Invalid watch source: `,
      s,
      `A watch source can only be a getter/effect function, a ref, a reactive object, or an array of these types.`
    );
  };
  const reactiveGetter = (source2) => {
    if (deep) return source2;
    if (isShallow(source2) || deep === false || deep === 0)
      return traverse(source2, 1);
    return traverse(source2);
  };
  let effect;
  let getter;
  let cleanup;
  let boundCleanup;
  let forceTrigger = false;
  let isMultiSource = false;
  if (isRef(source)) {
    getter = () => source.value;
    forceTrigger = isShallow(source);
  } else if (isReactive(source)) {
    getter = () => reactiveGetter(source);
    forceTrigger = true;
  } else if (isArray(source)) {
    isMultiSource = true;
    forceTrigger = source.some((s) => isReactive(s) || isShallow(s));
    getter = () => source.map((s) => {
      if (isRef(s)) {
        return s.value;
      } else if (isReactive(s)) {
        return reactiveGetter(s);
      } else if (isFunction(s)) {
        return call ? call(s, 2) : s();
      } else {
        warnInvalidSource(s);
      }
    });
  } else if (isFunction(source)) {
    if (cb) {
      getter = call ? () => call(source, 2) : source;
    } else {
      getter = () => {
        if (cleanup) {
          pauseTracking();
          try {
            cleanup();
          } finally {
            resetTracking();
          }
        }
        const currentEffect = activeWatcher;
        activeWatcher = effect;
        try {
          return call ? call(source, 3, [boundCleanup]) : source(boundCleanup);
        } finally {
          activeWatcher = currentEffect;
        }
      };
    }
  } else {
    getter = NOOP;
    warnInvalidSource(source);
  }
  if (cb && deep) {
    const baseGetter = getter;
    const depth = deep === true ? Infinity : deep;
    getter = () => traverse(baseGetter(), depth);
  }
  const scope = getCurrentScope();
  const watchHandle = () => {
    effect.stop();
    if (scope && scope.active) {
      remove(scope.effects, effect);
    }
  };
  if (once && cb) {
    const _cb = cb;
    cb = (...args) => {
      const res = _cb(...args);
      watchHandle();
      return res;
    };
  }
  let oldValue = isMultiSource ? new Array(source.length).fill(INITIAL_WATCHER_VALUE) : INITIAL_WATCHER_VALUE;
  const job = (immediateFirstRun) => {
    if (!(effect.flags & 1) || !effect.dirty && !immediateFirstRun) {
      return;
    }
    if (cb) {
      const newValue = effect.run();
      if (immediateFirstRun || deep || forceTrigger || (isMultiSource ? newValue.some((v, i) => hasChanged(v, oldValue[i])) : hasChanged(newValue, oldValue))) {
        if (cleanup) {
          cleanup();
        }
        const currentWatcher = activeWatcher;
        activeWatcher = effect;
        try {
          const args = [
            newValue,
            // pass undefined as the old value when it's changed for the first time
            oldValue === INITIAL_WATCHER_VALUE ? void 0 : isMultiSource && oldValue[0] === INITIAL_WATCHER_VALUE ? [] : oldValue,
            boundCleanup
          ];
          oldValue = newValue;
          call ? call(cb, 3, args) : (
            // @ts-expect-error
            cb(...args)
          );
        } finally {
          activeWatcher = currentWatcher;
        }
      }
    } else {
      effect.run();
    }
  };
  if (augmentJob) {
    augmentJob(job);
  }
  effect = new ReactiveEffect(getter);
  effect.scheduler = scheduler ? () => scheduler(job, false) : job;
  boundCleanup = (fn) => onWatcherCleanup(fn, false, effect);
  cleanup = effect.onStop = () => {
    const cleanups = cleanupMap.get(effect);
    if (cleanups) {
      if (call) {
        call(cleanups, 4);
      } else {
        for (const cleanup2 of cleanups) cleanup2();
      }
      cleanupMap.delete(effect);
    }
  };
  {
    effect.onTrack = options.onTrack;
    effect.onTrigger = options.onTrigger;
  }
  if (cb) {
    if (immediate) {
      job(true);
    } else {
      oldValue = effect.run();
    }
  } else if (scheduler) {
    scheduler(job.bind(null, true), true);
  } else {
    effect.run();
  }
  watchHandle.pause = effect.pause.bind(effect);
  watchHandle.resume = effect.resume.bind(effect);
  watchHandle.stop = watchHandle;
  return watchHandle;
}
function traverse(value, depth = Infinity, seen) {
  if (depth <= 0 || !isObject(value) || value["__v_skip"]) {
    return value;
  }
  seen = seen || /* @__PURE__ */ new Map();
  if ((seen.get(value) || 0) >= depth) {
    return value;
  }
  seen.set(value, depth);
  depth--;
  if (isRef(value)) {
    traverse(value.value, depth, seen);
  } else if (isArray(value)) {
    for (let i = 0; i < value.length; i++) {
      traverse(value[i], depth, seen);
    }
  } else if (isSet(value) || isMap(value)) {
    value.forEach((v) => {
      traverse(v, depth, seen);
    });
  } else if (isPlainObject(value)) {
    for (const key in value) {
      traverse(value[key], depth, seen);
    }
    for (const key of Object.getOwnPropertySymbols(value)) {
      if (Object.prototype.propertyIsEnumerable.call(value, key)) {
        traverse(value[key], depth, seen);
      }
    }
  }
  return value;
}

/**
* @vue/runtime-core v3.5.42
* (c) 2018-present Yuxi (Evan) You and Vue contributors
* @license MIT
**/

const stack = [];
function pushWarningContext$1(vnode) {
  stack.push(vnode);
}
function popWarningContext$1() {
  stack.pop();
}
let isWarning = false;
function warn$1(msg, ...args) {
  if (isWarning) return;
  isWarning = true;
  pauseTracking();
  const instance = stack.length ? stack[stack.length - 1].component : null;
  const appWarnHandler = instance && instance.appContext.config.warnHandler;
  const trace = getComponentTrace();
  if (appWarnHandler) {
    callWithErrorHandling(
      appWarnHandler,
      instance,
      11,
      [
        // eslint-disable-next-line no-restricted-syntax
        msg + args.map((a) => {
          var _a, _b;
          return (_b = (_a = a.toString) == null ? void 0 : _a.call(a)) != null ? _b : JSON.stringify(a);
        }).join(""),
        instance && instance.proxy,
        trace.map(
          ({ vnode }) => `at <${formatComponentName(instance, vnode.type)}>`
        ).join("\n"),
        trace
      ]
    );
  } else {
    const warnArgs = [`[Vue warn]: ${msg}`, ...args];
    if (trace.length && // avoid spamming console during tests
    true) {
      warnArgs.push(`
`, ...formatTrace(trace));
    }
    console.warn(...warnArgs);
  }
  resetTracking();
  isWarning = false;
}
function getComponentTrace() {
  let currentVNode = stack[stack.length - 1];
  if (!currentVNode) {
    return [];
  }
  const normalizedStack = [];
  while (currentVNode) {
    const last = normalizedStack[0];
    if (last && last.vnode === currentVNode) {
      last.recurseCount++;
    } else {
      normalizedStack.push({
        vnode: currentVNode,
        recurseCount: 0
      });
    }
    const parentInstance = currentVNode.component && currentVNode.component.parent;
    currentVNode = parentInstance && parentInstance.vnode;
  }
  return normalizedStack;
}
function formatTrace(trace) {
  const logs = [];
  trace.forEach((entry, i) => {
    logs.push(...i === 0 ? [] : [`
`], ...formatTraceEntry(entry));
  });
  return logs;
}
function formatTraceEntry({ vnode, recurseCount }) {
  const postfix = recurseCount > 0 ? `... (${recurseCount} recursive calls)` : ``;
  const isRoot = vnode.component ? vnode.component.parent == null : false;
  const open = ` at <${formatComponentName(
    vnode.component,
    vnode.type,
    isRoot
  )}`;
  const close = `>` + postfix;
  return vnode.props ? [open, ...formatProps(vnode.props), close] : [open + close];
}
function formatProps(props) {
  const res = [];
  const keys = Object.keys(props);
  keys.slice(0, 3).forEach((key) => {
    res.push(...formatProp(key, props[key]));
  });
  if (keys.length > 3) {
    res.push(` ...`);
  }
  return res;
}
function formatProp(key, value, raw) {
  if (isString(value)) {
    value = JSON.stringify(value);
    return raw ? value : [`${key}=${value}`];
  } else if (typeof value === "number" || typeof value === "boolean" || value == null) {
    return raw ? value : [`${key}=${value}`];
  } else if (isRef(value)) {
    value = formatProp(key, toRaw(value.value), true);
    return raw ? value : [`${key}=Ref<`, value, `>`];
  } else if (isFunction(value)) {
    return [`${key}=fn${value.name ? `<${value.name}>` : ``}`];
  } else {
    value = toRaw(value);
    return raw ? value : [`${key}=`, value];
  }
}
const ErrorTypeStrings$1 = {
  ["sp"]: "serverPrefetch hook",
  ["bc"]: "beforeCreate hook",
  ["c"]: "created hook",
  ["bm"]: "beforeMount hook",
  ["m"]: "mounted hook",
  ["bu"]: "beforeUpdate hook",
  ["u"]: "updated",
  ["bum"]: "beforeUnmount hook",
  ["um"]: "unmounted hook",
  ["a"]: "activated hook",
  ["da"]: "deactivated hook",
  ["ec"]: "errorCaptured hook",
  ["rtc"]: "renderTracked hook",
  ["rtg"]: "renderTriggered hook",
  [0]: "setup function",
  [1]: "render function",
  [2]: "watcher getter",
  [3]: "watcher callback",
  [4]: "watcher cleanup function",
  [5]: "native event handler",
  [6]: "component event handler",
  [7]: "vnode hook",
  [8]: "directive hook",
  [9]: "transition hook",
  [10]: "app errorHandler",
  [11]: "app warnHandler",
  [12]: "ref function",
  [13]: "async component loader",
  [14]: "scheduler flush",
  [15]: "component update",
  [16]: "app unmount cleanup function"
};
function callWithErrorHandling(fn, instance, type, args) {
  try {
    return args ? fn(...args) : fn();
  } catch (err) {
    handleError(err, instance, type);
  }
}
function callWithAsyncErrorHandling(fn, instance, type, args) {
  if (isFunction(fn)) {
    const res = callWithErrorHandling(fn, instance, type, args);
    if (res && isPromise(res)) {
      res.catch((err) => {
        handleError(err, instance, type);
      });
    }
    return res;
  }
  if (isArray(fn)) {
    const values = [];
    for (let i = 0; i < fn.length; i++) {
      values.push(callWithAsyncErrorHandling(fn[i], instance, type, args));
    }
    return values;
  } else {
    warn$1(
      `Invalid value type passed to callWithAsyncErrorHandling(): ${typeof fn}`
    );
  }
}
function handleError(err, instance, type, throwInDev = true) {
  const contextVNode = instance ? instance.vnode : null;
  const { errorHandler, throwUnhandledErrorInProduction } = instance && instance.appContext.config || EMPTY_OBJ;
  if (instance) {
    let cur = instance.parent;
    const exposedInstance = instance.proxy;
    const errorInfo = ErrorTypeStrings$1[type] ;
    while (cur) {
      const errorCapturedHooks = cur.ec;
      if (errorCapturedHooks) {
        for (let i = 0; i < errorCapturedHooks.length; i++) {
          if (errorCapturedHooks[i](err, exposedInstance, errorInfo) === false) {
            return;
          }
        }
      }
      cur = cur.parent;
    }
    if (errorHandler) {
      pauseTracking();
      callWithErrorHandling(errorHandler, null, 10, [
        err,
        exposedInstance,
        errorInfo
      ]);
      resetTracking();
      return;
    }
  }
  logError(err, type, contextVNode, throwInDev, throwUnhandledErrorInProduction);
}
function logError(err, type, contextVNode, throwInDev = true, throwInProd = false) {
  {
    const info = ErrorTypeStrings$1[type];
    if (contextVNode) {
      pushWarningContext$1(contextVNode);
    }
    warn$1(`Unhandled error${info ? ` during execution of ${info}` : ``}`);
    if (contextVNode) {
      popWarningContext$1();
    }
    if (throwInDev) {
      throw err;
    } else {
      console.error(err);
    }
  }
}

const queue = [];
let flushIndex = -1;
const pendingPostFlushCbs = [];
let activePostFlushCbs = null;
let postFlushIndex = 0;
const resolvedPromise = /* @__PURE__ */ Promise.resolve();
let currentFlushPromise = null;
const RECURSION_LIMIT = 100;
function nextTick(fn) {
  const p = currentFlushPromise || resolvedPromise;
  return fn ? p.then(this ? fn.bind(this) : fn) : p;
}
function findInsertionIndex(id) {
  let start = flushIndex + 1;
  let end = queue.length;
  while (start < end) {
    const middle = start + end >>> 1;
    const middleJob = queue[middle];
    const middleJobId = getId(middleJob);
    if (middleJobId < id || middleJobId === id && middleJob.flags & 2) {
      start = middle + 1;
    } else {
      end = middle;
    }
  }
  return start;
}
function queueJob(job) {
  if (!(job.flags & 1)) {
    const jobId = getId(job);
    const lastJob = queue[queue.length - 1];
    if (!lastJob || // fast path when the job id is larger than the tail
    !(job.flags & 2) && jobId >= getId(lastJob)) {
      queue.push(job);
    } else {
      queue.splice(findInsertionIndex(jobId), 0, job);
    }
    job.flags |= 1;
    queueFlush();
  }
}
function queueFlush() {
  if (!currentFlushPromise) {
    currentFlushPromise = resolvedPromise.then(flushJobs);
  }
}
function queuePostFlushCb(cb) {
  if (!isArray(cb)) {
    if (activePostFlushCbs && cb.id === -1) {
      activePostFlushCbs.splice(postFlushIndex + 1, 0, cb);
    } else if (!(cb.flags & 1)) {
      pendingPostFlushCbs.push(cb);
      cb.flags |= 1;
    }
  } else {
    for (let i = 0; i < cb.length; i++) {
      pendingPostFlushCbs.push(cb[i]);
    }
  }
  queueFlush();
}
function flushPreFlushCbs(instance, seen, i = flushIndex + 1) {
  {
    seen = seen || /* @__PURE__ */ new Map();
  }
  for (; i < queue.length; i++) {
    const cb = queue[i];
    if (cb && cb.flags & 2) {
      if (instance && cb.id !== instance.uid) {
        continue;
      }
      if (checkRecursiveUpdates(seen, cb)) {
        continue;
      }
      queue.splice(i, 1);
      i--;
      if (cb.flags & 4) {
        cb.flags &= -2;
      }
      cb();
      if (!(cb.flags & 4)) {
        cb.flags &= -2;
      }
    }
  }
}
function flushPostFlushCbs(seen) {
  if (pendingPostFlushCbs.length) {
    const deduped = [...new Set(pendingPostFlushCbs)].sort(
      (a, b) => getId(a) - getId(b)
    );
    pendingPostFlushCbs.length = 0;
    if (activePostFlushCbs) {
      for (let i = 0; i < deduped.length; i++) {
        activePostFlushCbs.push(deduped[i]);
      }
      return;
    }
    activePostFlushCbs = deduped;
    {
      seen = seen || /* @__PURE__ */ new Map();
    }
    for (postFlushIndex = 0; postFlushIndex < activePostFlushCbs.length; postFlushIndex++) {
      const cb = activePostFlushCbs[postFlushIndex];
      if (checkRecursiveUpdates(seen, cb)) {
        continue;
      }
      if (cb.flags & 4) {
        cb.flags &= -2;
      }
      if (!(cb.flags & 8)) cb();
      cb.flags &= -2;
    }
    activePostFlushCbs = null;
    postFlushIndex = 0;
  }
}
const getId = (job) => job.id == null ? job.flags & 2 ? -1 : Infinity : job.id;
function flushJobs(seen) {
  {
    seen = seen || /* @__PURE__ */ new Map();
  }
  const check = (job) => checkRecursiveUpdates(seen, job) ;
  try {
    for (flushIndex = 0; flushIndex < queue.length; flushIndex++) {
      const job = queue[flushIndex];
      if (job && !(job.flags & 8)) {
        if (!!(true !== "production") && check(job)) {
          continue;
        }
        if (job.flags & 4) {
          job.flags &= ~1;
        }
        callWithErrorHandling(
          job,
          job.i,
          job.i ? 15 : 14
        );
        if (!(job.flags & 4)) {
          job.flags &= ~1;
        }
      }
    }
  } finally {
    for (; flushIndex < queue.length; flushIndex++) {
      const job = queue[flushIndex];
      if (job) {
        job.flags &= -2;
      }
    }
    flushIndex = -1;
    queue.length = 0;
    flushPostFlushCbs(seen);
    currentFlushPromise = null;
    if (queue.length || pendingPostFlushCbs.length) {
      flushJobs(seen);
    }
  }
}
function checkRecursiveUpdates(seen, fn) {
  const count = seen.get(fn) || 0;
  if (count > RECURSION_LIMIT) {
    const instance = fn.i;
    const componentName = instance && getComponentName(instance.type);
    handleError(
      `Maximum recursive updates exceeded${componentName ? ` in component <${componentName}>` : ``}. This means you have a reactive effect that is mutating its own dependencies and thus recursively triggering itself. Possible sources include component template, render function, updated hook or watcher source function.`,
      null,
      10
    );
    return true;
  }
  seen.set(fn, count + 1);
  return false;
}

let isHmrUpdating = false;
const setHmrUpdating = (v) => {
  try {
    return isHmrUpdating;
  } finally {
    isHmrUpdating = v;
  }
};
const hmrDirtyComponents = /* @__PURE__ */ new Map();
{
  getGlobalThis().__VUE_HMR_RUNTIME__ = {
    createRecord: tryWrap(createRecord),
    rerender: tryWrap(rerender),
    reload: tryWrap(reload)
  };
}
const map = /* @__PURE__ */ new Map();
function registerHMR(instance) {
  const id = instance.type.__hmrId;
  let record = map.get(id);
  if (!record) {
    createRecord(id, instance.type);
    record = map.get(id);
  }
  record.instances.add(instance);
}
function unregisterHMR(instance) {
  map.get(instance.type.__hmrId).instances.delete(instance);
}
function createRecord(id, initialDef) {
  if (map.has(id)) {
    return false;
  }
  map.set(id, {
    initialDef: normalizeClassComponent(initialDef),
    instances: /* @__PURE__ */ new Set()
  });
  return true;
}
function normalizeClassComponent(component) {
  return isClassComponent(component) ? component.__vccOpts : component;
}
function rerender(id, newRender) {
  const record = map.get(id);
  if (!record) {
    return;
  }
  record.initialDef.render = newRender;
  [...record.instances].forEach((instance) => {
    if (newRender) {
      instance.render = newRender;
      normalizeClassComponent(instance.type).render = newRender;
    }
    instance.renderCache = [];
    isHmrUpdating = true;
    if (!(instance.job.flags & 8)) {
      instance.update();
    }
    isHmrUpdating = false;
  });
}
function reload(id, newComp) {
  const record = map.get(id);
  if (!record) return;
  newComp = normalizeClassComponent(newComp);
  updateComponentDef(record.initialDef, newComp);
  const instances = [...record.instances];
  for (let i = 0; i < instances.length; i++) {
    const instance = instances[i];
    const oldComp = normalizeClassComponent(instance.type);
    let dirtyInstances = hmrDirtyComponents.get(oldComp);
    if (!dirtyInstances) {
      if (oldComp !== record.initialDef) {
        updateComponentDef(oldComp, newComp);
      }
      hmrDirtyComponents.set(oldComp, dirtyInstances = /* @__PURE__ */ new Set());
    }
    dirtyInstances.add(instance);
    instance.appContext.propsCache.delete(instance.type);
    instance.appContext.emitsCache.delete(instance.type);
    instance.appContext.optionsCache.delete(instance.type);
    if (instance.ceReload) {
      dirtyInstances.add(instance);
      instance.ceReload(newComp.styles);
      dirtyInstances.delete(instance);
    } else if (instance.parent) {
      queueJob(() => {
        if (!(instance.job.flags & 8)) {
          isHmrUpdating = true;
          instance.parent.update();
          isHmrUpdating = false;
          dirtyInstances.delete(instance);
        }
      });
    } else if (instance.appContext.reload) {
      instance.appContext.reload();
    } else if (typeof window !== "undefined") {
      window.location.reload();
    } else {
      console.warn(
        "[HMR] Root or manually mounted instance modified. Full reload required."
      );
    }
    if (instance.root.ce && instance !== instance.root) {
      instance.root.ce._removeChildStyle(oldComp);
    }
  }
  queuePostFlushCb(() => {
    hmrDirtyComponents.clear();
  });
}
function updateComponentDef(oldComp, newComp) {
  extend(oldComp, newComp);
  for (const key in oldComp) {
    if (key !== "__file" && !(key in newComp)) {
      delete oldComp[key];
    }
  }
}
function tryWrap(fn) {
  return (id, arg) => {
    try {
      return fn(id, arg);
    } catch (e) {
      console.error(e);
      console.warn(
        `[HMR] Something went wrong during Vue component hot-reload. Full reload required.`
      );
    }
  };
}

let devtools$1;
let buffer = [];
let devtoolsNotInstalled = false;
function emit$1(event, ...args) {
  if (devtools$1) {
    devtools$1.emit(event, ...args);
  } else if (!devtoolsNotInstalled) {
    buffer.push({ event, args });
  }
}
function setDevtoolsHook$1(hook, target) {
  var _a, _b;
  devtools$1 = hook;
  if (devtools$1) {
    devtools$1.enabled = true;
    buffer.forEach(({ event, args }) => devtools$1.emit(event, ...args));
    buffer = [];
  } else if (
    // handle late devtools injection - only do this if we are in an actual
    // browser environment to avoid the timer handle stalling test runner exit
    // (#4815)
    typeof window !== "undefined" && // some envs mock window but not fully
    window.HTMLElement && // also exclude jsdom
    // eslint-disable-next-line no-restricted-syntax
    !((_b = (_a = window.navigator) == null ? void 0 : _a.userAgent) == null ? void 0 : _b.includes("jsdom"))
  ) {
    const replay = target.__VUE_DEVTOOLS_HOOK_REPLAY__ = target.__VUE_DEVTOOLS_HOOK_REPLAY__ || [];
    replay.push((newHook) => {
      setDevtoolsHook$1(newHook, target);
    });
    setTimeout(() => {
      if (!devtools$1) {
        target.__VUE_DEVTOOLS_HOOK_REPLAY__ = null;
        devtoolsNotInstalled = true;
        buffer = [];
      }
    }, 3e3);
  } else {
    devtoolsNotInstalled = true;
    buffer = [];
  }
}
function devtoolsInitApp(app, version) {
  emit$1("app:init" /* APP_INIT */, app, version, {
    Fragment,
    Text,
    Comment,
    Static
  });
}
function devtoolsUnmountApp(app) {
  emit$1("app:unmount" /* APP_UNMOUNT */, app);
}
const devtoolsComponentAdded = /* @__PURE__ */ createDevtoolsComponentHook("component:added" /* COMPONENT_ADDED */);
const devtoolsComponentUpdated = /* @__PURE__ */ createDevtoolsComponentHook("component:updated" /* COMPONENT_UPDATED */);
const _devtoolsComponentRemoved = /* @__PURE__ */ createDevtoolsComponentHook(
  "component:removed" /* COMPONENT_REMOVED */
);
const devtoolsComponentRemoved = (component) => {
  if (devtools$1 && typeof devtools$1.cleanupBuffer === "function" && // remove the component if it wasn't buffered
  !devtools$1.cleanupBuffer(component)) {
    _devtoolsComponentRemoved(component);
  }
};
// @__NO_SIDE_EFFECTS__
function createDevtoolsComponentHook(hook) {
  return (component) => {
    emit$1(
      hook,
      component.appContext.app,
      component.uid,
      component.parent ? component.parent.uid : void 0,
      component
    );
  };
}
const devtoolsPerfStart = /* @__PURE__ */ createDevtoolsPerformanceHook("perf:start" /* PERFORMANCE_START */);
const devtoolsPerfEnd = /* @__PURE__ */ createDevtoolsPerformanceHook("perf:end" /* PERFORMANCE_END */);
function createDevtoolsPerformanceHook(hook) {
  return (component, type, time) => {
    emit$1(hook, component.appContext.app, component.uid, component, type, time);
  };
}
function devtoolsComponentEmit(component, event, params) {
  emit$1(
    "component:emit" /* COMPONENT_EMIT */,
    component.appContext.app,
    component,
    event,
    params
  );
}

let currentRenderingInstance = null;
let currentScopeId = null;
function setCurrentRenderingInstance$1(instance) {
  const prev = currentRenderingInstance;
  currentRenderingInstance = instance;
  currentScopeId = instance && instance.type.__scopeId || null;
  return prev;
}
function withCtx(fn, ctx = currentRenderingInstance, isNonScopedSlot) {
  if (!ctx) return fn;
  if (fn._n) {
    return fn;
  }
  const renderFnWithContext = (...args) => {
    if (renderFnWithContext._d) {
      setBlockTracking(-1);
    }
    const prevInstance = setCurrentRenderingInstance$1(ctx);
    const prevStackSize = blockStack.length;
    let res;
    try {
      res = fn(...args);
    } finally {
      for (let i = blockStack.length; i > prevStackSize; i--) closeBlock();
      setCurrentRenderingInstance$1(prevInstance);
      if (renderFnWithContext._d) {
        setBlockTracking(1);
      }
    }
    {
      devtoolsComponentUpdated(ctx);
    }
    return res;
  };
  renderFnWithContext._n = true;
  renderFnWithContext._c = true;
  renderFnWithContext._d = true;
  return renderFnWithContext;
}

function validateDirectiveName(name) {
  if (isBuiltInDirective(name)) {
    warn$1("Do not use built-in directive ids as custom directive id: " + name);
  }
}
function invokeDirectiveHook(vnode, prevVNode, instance, name) {
  const bindings = vnode.dirs;
  const oldBindings = prevVNode && prevVNode.dirs;
  for (let i = 0; i < bindings.length; i++) {
    const binding = bindings[i];
    if (oldBindings) {
      binding.oldValue = oldBindings[i].value;
    }
    let hook = binding.dir[name];
    if (hook) {
      pauseTracking();
      callWithAsyncErrorHandling(hook, instance, 8, [
        vnode.el,
        binding,
        vnode,
        prevVNode
      ]);
      resetTracking();
    }
  }
}

function provide(key, value) {
  {
    if (!currentInstance || currentInstance.isMounted) {
      warn$1(`provide() can only be used inside setup().`);
    }
  }
  if (currentInstance) {
    let provides = currentInstance.provides;
    const parentProvides = currentInstance.parent && currentInstance.parent.provides;
    if (parentProvides === provides) {
      provides = currentInstance.provides = Object.create(parentProvides);
    }
    provides[key] = value;
  }
}
function inject(key, defaultValue, treatDefaultAsFactory = false) {
  const instance = getCurrentInstance();
  if (instance || currentApp) {
    let provides = currentApp ? currentApp._context.provides : instance ? instance.parent == null || instance.ce ? instance.vnode.appContext && instance.vnode.appContext.provides : instance.parent.provides : void 0;
    if (provides && key in provides) {
      return provides[key];
    } else if (arguments.length > 1) {
      return treatDefaultAsFactory && isFunction(defaultValue) ? defaultValue.call(instance && instance.proxy) : defaultValue;
    } else {
      warn$1(`injection "${String(key)}" not found.`);
    }
  } else {
    warn$1(`inject() can only be used inside setup() or functional components.`);
  }
}

const ssrContextKey = /* @__PURE__ */ Symbol.for("v-scx");
const useSSRContext = () => {
  {
    const ctx = inject(ssrContextKey);
    if (!ctx) {
      warn$1(
        `Server rendering context not provided. Make sure to only call useSSRContext() conditionally in the server build.`
      );
    }
    return ctx;
  }
};
function watch(source, cb, options) {
  if (!isFunction(cb)) {
    warn$1(
      `\`watch(fn, options?)\` signature has been moved to a separate API. Use \`watchEffect(fn, options?)\` instead. \`watch\` now only supports \`watch(source, cb, options?) signature.`
    );
  }
  return doWatch(source, cb, options);
}
function doWatch(source, cb, options = EMPTY_OBJ) {
  const { immediate, deep, flush, once } = options;
  if (!cb) {
    if (immediate !== void 0) {
      warn$1(
        `watch() "immediate" option is only respected when using the watch(source, callback, options?) signature.`
      );
    }
    if (deep !== void 0) {
      warn$1(
        `watch() "deep" option is only respected when using the watch(source, callback, options?) signature.`
      );
    }
    if (once !== void 0) {
      warn$1(
        `watch() "once" option is only respected when using the watch(source, callback, options?) signature.`
      );
    }
  }
  const baseWatchOptions = extend({}, options);
  baseWatchOptions.onWarn = warn$1;
  const runsImmediately = cb && immediate || !cb && flush !== "post";
  let ssrCleanup;
  if (isInSSRComponentSetup) {
    if (flush === "sync") {
      const ctx = useSSRContext();
      ssrCleanup = ctx.__watcherHandles || (ctx.__watcherHandles = []);
    } else if (!runsImmediately) {
      const watchStopHandle = () => {
      };
      watchStopHandle.stop = NOOP;
      watchStopHandle.resume = NOOP;
      watchStopHandle.pause = NOOP;
      return watchStopHandle;
    }
  }
  const instance = currentInstance;
  baseWatchOptions.call = (fn, type, args) => callWithAsyncErrorHandling(fn, instance, type, args);
  let isPre = false;
  if (flush === "post") {
    baseWatchOptions.scheduler = (job) => {
      queuePostRenderEffect(job, instance && instance.suspense);
    };
  } else if (flush !== "sync") {
    isPre = true;
    baseWatchOptions.scheduler = (job, isFirstRun) => {
      if (isFirstRun) {
        job();
      } else {
        queueJob(job);
      }
    };
  }
  baseWatchOptions.augmentJob = (job) => {
    if (cb) {
      job.flags |= 4;
    }
    if (isPre) {
      job.flags |= 2;
      if (instance) {
        job.id = instance.uid;
        job.i = instance;
      }
    }
  };
  const watchHandle = watch$1(source, cb, baseWatchOptions);
  if (isInSSRComponentSetup) {
    if (ssrCleanup) {
      ssrCleanup.push(watchHandle);
    } else if (runsImmediately) {
      watchHandle();
    }
  }
  return watchHandle;
}
function instanceWatch(source, value, options) {
  const publicThis = this.proxy;
  const getter = isString(source) ? source.includes(".") ? createPathGetter(publicThis, source) : () => publicThis[source] : source.bind(publicThis, publicThis);
  let cb;
  if (isFunction(value)) {
    cb = value;
  } else {
    cb = value.handler;
    options = value;
  }
  const reset = setCurrentInstance(this);
  const res = doWatch(getter, cb.bind(publicThis), options);
  reset();
  return res;
}
function createPathGetter(ctx, path) {
  const segments = path.split(".");
  return () => {
    let cur = ctx;
    for (let i = 0; i < segments.length && cur; i++) {
      cur = cur[segments[i]];
    }
    return cur;
  };
}
const TeleportEndKey = /* @__PURE__ */ Symbol("_vte");
const isTeleport = (type) => type.__isTeleport;

const leaveCbKey = /* @__PURE__ */ Symbol("_leaveCb");
function findNonCommentChild(children) {
  let child = children[0];
  if (children.length > 1) {
    let hasFound = false;
    for (const c of children) {
      if (c.type !== Comment) {
        if (hasFound) {
          warn$1(
            "<transition> can only be used on a single element or component. Use <transition-group> for lists."
          );
          break;
        }
        child = c;
        hasFound = true;
      }
    }
  }
  return child;
}
function getInnerChild$1(vnode) {
  if (!isKeepAlive(vnode)) {
    if (isTeleport(vnode.type) && vnode.children) {
      return findNonCommentChild(vnode.children);
    }
    return vnode;
  }
  if (vnode.component) {
    return vnode.component.subTree;
  }
  const { shapeFlag, children } = vnode;
  if (children) {
    if (shapeFlag & 16) {
      return children[0];
    }
    if (shapeFlag & 32 && isFunction(children.default)) {
      return children.default();
    }
  }
}
function setTransitionHooks(vnode, hooks) {
  if (vnode.shapeFlag & 6 && vnode.component) {
    vnode.transition = hooks;
    const subTree = vnode.component.subTree;
    setTransitionHooks(
      isTeleport(subTree.type) ? getInnerChild$1(subTree) || subTree : subTree,
      hooks
    );
  } else if (vnode.shapeFlag & 128) {
    vnode.ssContent.transition = hooks.clone(vnode.ssContent);
    vnode.ssFallback.transition = hooks.clone(vnode.ssFallback);
  } else {
    vnode.transition = hooks;
  }
}
function markAsyncBoundary(instance) {
  instance.ids = [instance.ids[0] + instance.ids[2]++ + "-", 0, 0];
}

const knownTemplateRefs = /* @__PURE__ */ new WeakSet();
function isTemplateRefKey(refs, key) {
  let desc;
  return !!((desc = Object.getOwnPropertyDescriptor(refs, key)) && !desc.configurable);
}

const pendingSetRefMap = /* @__PURE__ */ new WeakMap();
function setRef(rawRef, oldRawRef, parentSuspense, vnode, isUnmount = false) {
  if (isArray(rawRef)) {
    rawRef.forEach(
      (r, i) => setRef(
        r,
        oldRawRef && (isArray(oldRawRef) ? oldRawRef[i] : oldRawRef),
        parentSuspense,
        vnode,
        isUnmount
      )
    );
    return;
  }
  if (isAsyncWrapper(vnode) && !isUnmount) {
    if (vnode.shapeFlag & 512 && vnode.type.__asyncResolved && vnode.component.subTree.component) {
      setRef(rawRef, oldRawRef, parentSuspense, vnode.component.subTree);
    }
    return;
  }
  const refValue = vnode.shapeFlag & 4 ? getComponentPublicInstance(vnode.component) : vnode.el;
  const value = isUnmount ? null : refValue;
  const { i: owner, r: ref } = rawRef;
  if (!owner) {
    warn$1(
      `Missing ref owner context. ref cannot be used on hoisted vnodes. A vnode with ref must be created inside the render function.`
    );
    return;
  }
  const oldRef = oldRawRef && oldRawRef.r;
  const refs = owner.refs === EMPTY_OBJ ? owner.refs = {} : owner.refs;
  const setupState = owner.setupState;
  const rawSetupState = toRaw(setupState);
  const canSetSetupRef = setupState === EMPTY_OBJ ? NO : (key) => {
    {
      if (hasOwn(rawSetupState, key) && !isRef(rawSetupState[key])) {
        warn$1(
          `Template ref "${key}" used on a non-ref value. It will not work in the production build.`
        );
      }
      if (knownTemplateRefs.has(rawSetupState[key])) {
        return false;
      }
    }
    if (isTemplateRefKey(refs, key)) {
      return false;
    }
    return hasOwn(rawSetupState, key);
  };
  const canSetRef = (ref2, key) => {
    if (knownTemplateRefs.has(ref2)) {
      return false;
    }
    if (key && isTemplateRefKey(refs, key)) {
      return false;
    }
    return true;
  };
  if (oldRef != null && oldRef !== ref) {
    invalidatePendingSetRef(oldRawRef);
    if (isString(oldRef)) {
      refs[oldRef] = null;
      if (canSetSetupRef(oldRef)) {
        setupState[oldRef] = null;
      }
    } else if (isRef(oldRef)) {
      const oldRawRefAtom = oldRawRef;
      if (canSetRef(oldRef, oldRawRefAtom.k)) {
        oldRef.value = null;
      }
      if (oldRawRefAtom.k) refs[oldRawRefAtom.k] = null;
    }
  }
  if (isFunction(ref)) {
    callWithErrorHandling(ref, owner, 12, [value, refs]);
  } else {
    const _isString = isString(ref);
    const _isRef = isRef(ref);
    if (_isString || _isRef) {
      const doSet = () => {
        if (rawRef.f) {
          const existing = _isString ? canSetSetupRef(ref) ? setupState[ref] : refs[ref] : canSetRef(ref) || !rawRef.k ? ref.value : refs[rawRef.k];
          if (isUnmount) {
            isArray(existing) && remove(existing, refValue);
          } else {
            if (!isArray(existing)) {
              if (_isString) {
                refs[ref] = [refValue];
                if (canSetSetupRef(ref)) {
                  setupState[ref] = refs[ref];
                }
              } else {
                const newVal = [refValue];
                if (canSetRef(ref, rawRef.k)) {
                  ref.value = newVal;
                }
                if (rawRef.k) refs[rawRef.k] = newVal;
              }
            } else if (!existing.includes(refValue)) {
              existing.push(refValue);
            }
          }
        } else if (_isString) {
          refs[ref] = value;
          if (canSetSetupRef(ref)) {
            setupState[ref] = value;
          }
        } else if (_isRef) {
          if (canSetRef(ref, rawRef.k)) {
            ref.value = value;
          }
          if (rawRef.k) refs[rawRef.k] = value;
        } else {
          warn$1("Invalid template ref type:", ref, `(${typeof ref})`);
        }
      };
      if (value) {
        const job = () => {
          doSet();
          pendingSetRefMap.delete(rawRef);
        };
        job.id = -1;
        pendingSetRefMap.set(rawRef, job);
        queuePostRenderEffect(job, parentSuspense);
      } else {
        invalidatePendingSetRef(rawRef);
        doSet();
      }
    } else {
      warn$1("Invalid template ref type:", ref, `(${typeof ref})`);
    }
  }
}
function invalidatePendingSetRef(rawRef) {
  const pendingSetRef = pendingSetRefMap.get(rawRef);
  if (pendingSetRef) {
    pendingSetRef.flags |= 8;
    pendingSetRefMap.delete(rawRef);
  }
}

getGlobalThis().requestIdleCallback || ((cb) => setTimeout(cb, 1));
getGlobalThis().cancelIdleCallback || ((id) => clearTimeout(id));

const isAsyncWrapper = (i) => !!i.type.__asyncLoader;

const isKeepAlive = (vnode) => vnode.type.__isKeepAlive;
function onActivated(hook, target) {
  registerKeepAliveHook(hook, "a", target);
}
function onDeactivated(hook, target) {
  registerKeepAliveHook(hook, "da", target);
}
function registerKeepAliveHook(hook, type, target = currentInstance) {
  const wrappedHook = hook.__wdc || (hook.__wdc = () => {
    let current = target;
    while (current) {
      if (current.isDeactivated) {
        return;
      }
      current = current.parent;
    }
    return hook();
  });
  injectHook(type, wrappedHook, target);
  if (target) {
    let current = target.parent;
    while (current && current.parent) {
      if (isKeepAlive(current.parent.vnode)) {
        injectToKeepAliveRoot(wrappedHook, type, target, current);
      }
      current = current.parent;
    }
  }
}
function injectToKeepAliveRoot(hook, type, target, keepAliveRoot) {
  const injected = injectHook(
    type,
    hook,
    keepAliveRoot,
    true
    /* prepend */
  );
  onUnmounted(() => {
    remove(keepAliveRoot[type], injected);
  }, target);
}

function injectHook(type, hook, target = currentInstance, prepend = false) {
  if (target) {
    const hooks = target[type] || (target[type] = []);
    const wrappedHook = hook.__weh || (hook.__weh = (...args) => {
      pauseTracking();
      const reset = setCurrentInstance(target);
      const res = callWithAsyncErrorHandling(hook, target, type, args);
      reset();
      resetTracking();
      return res;
    });
    if (prepend) {
      hooks.unshift(wrappedHook);
    } else {
      hooks.push(wrappedHook);
    }
    return wrappedHook;
  } else {
    const apiName = toHandlerKey(ErrorTypeStrings$1[type].replace(/ hook$/, ""));
    warn$1(
      `${apiName} is called when there is no active component instance to be associated with. Lifecycle injection APIs can only be used during execution of setup().` + (` If you are using async setup(), make sure to register lifecycle hooks before the first await statement.` )
    );
  }
}
const createHook = (lifecycle) => (hook, target = currentInstance) => {
  if (!isInSSRComponentSetup || lifecycle === "sp") {
    injectHook(lifecycle, (...args) => hook(...args), target);
  }
};
const onBeforeMount = createHook("bm");
const onMounted = createHook("m");
const onBeforeUpdate = createHook(
  "bu"
);
const onUpdated = createHook("u");
const onBeforeUnmount = createHook(
  "bum"
);
const onUnmounted = createHook("um");
const onServerPrefetch = createHook(
  "sp"
);
const onRenderTriggered = createHook("rtg");
const onRenderTracked = createHook("rtc");
function onErrorCaptured(hook, target = currentInstance) {
  injectHook("ec", hook, target);
}
const NULL_DYNAMIC_COMPONENT = /* @__PURE__ */ Symbol.for("v-ndc");

const getPublicInstance = (i) => {
  if (!i) return null;
  if (isStatefulComponent(i)) return getComponentPublicInstance(i);
  return getPublicInstance(i.parent);
};
const resolveDevRootEl = (vnode) => {
  let found = false;
  while (true) {
    if (vnode.patchFlag > 0 && vnode.patchFlag & 2048) {
      const root = filterSingleRoot(vnode.children);
      if (!root) {
        return;
      }
      vnode = root;
      found = true;
      continue;
    }
    const component = vnode.component;
    if (component && component.subTree) {
      vnode = component.subTree;
      continue;
    }
    const suspense = vnode.suspense;
    if (suspense && suspense.activeBranch) {
      vnode = suspense.activeBranch;
      continue;
    }
    return found ? vnode.el : void 0;
  }
};
const getDevRootFragmentEl = (i) => {
  const el = i.subTree && resolveDevRootEl(i.subTree);
  return el === void 0 ? i.vnode.el : el;
};
const publicPropertiesMap = (
  // Move PURE marker to new line to workaround compiler discarding it
  // due to type annotation
  /* @__PURE__ */ extend(/* @__PURE__ */ Object.create(null), {
    $: (i) => i,
    $el: (i) => getDevRootFragmentEl(i) ,
    $data: (i) => i.data,
    $props: (i) => shallowReadonly(i.props) ,
    $attrs: (i) => shallowReadonly(i.attrs) ,
    $slots: (i) => shallowReadonly(i.slots) ,
    $refs: (i) => shallowReadonly(i.refs) ,
    $parent: (i) => getPublicInstance(i.parent),
    $root: (i) => getPublicInstance(i.root),
    $host: (i) => i.ce,
    $emit: (i) => i.emit,
    $options: (i) => __VUE_OPTIONS_API__ ? resolveMergedOptions(i) : i.type,
    $forceUpdate: (i) => i.f || (i.f = () => {
      queueJob(i.update);
    }),
    $nextTick: (i) => i.n || (i.n = nextTick.bind(i.proxy)),
    $watch: (i) => __VUE_OPTIONS_API__ ? instanceWatch.bind(i) : NOOP
  })
);
const isReservedPrefix = (key) => key === "_" || key === "$";
const hasSetupBinding = (state, key) => state !== EMPTY_OBJ && !state.__isScriptSetup && hasOwn(state, key);
const PublicInstanceProxyHandlers = {
  get({ _: instance }, key) {
    if (key === "__v_skip") {
      return true;
    }
    const { ctx, setupState, data, props, accessCache, type, appContext } = instance;
    if (key === "__isVue") {
      return true;
    }
    if (key[0] !== "$") {
      const n = accessCache[key];
      if (n !== void 0) {
        switch (n) {
          case 1 /* SETUP */:
            return setupState[key];
          case 2 /* DATA */:
            return data[key];
          case 4 /* CONTEXT */:
            return ctx[key];
          case 3 /* PROPS */:
            return props[key];
        }
      } else if (hasSetupBinding(setupState, key)) {
        accessCache[key] = 1 /* SETUP */;
        return setupState[key];
      } else if (__VUE_OPTIONS_API__ && data !== EMPTY_OBJ && hasOwn(data, key)) {
        accessCache[key] = 2 /* DATA */;
        return data[key];
      } else if (hasOwn(props, key)) {
        accessCache[key] = 3 /* PROPS */;
        return props[key];
      } else if (ctx !== EMPTY_OBJ && hasOwn(ctx, key)) {
        accessCache[key] = 4 /* CONTEXT */;
        return ctx[key];
      } else if (!__VUE_OPTIONS_API__ || shouldCacheAccess) {
        accessCache[key] = 0 /* OTHER */;
      }
    }
    const publicGetter = publicPropertiesMap[key];
    let cssModule, globalProperties;
    if (publicGetter) {
      if (key === "$attrs") {
        track(instance.attrs, "get", "");
        markAttrsAccessed();
      } else if (key === "$slots") {
        track(instance, "get", key);
      }
      return publicGetter(instance);
    } else if (
      // css module (injected by vue-loader)
      (cssModule = type.__cssModules) && (cssModule = cssModule[key])
    ) {
      return cssModule;
    } else if (ctx !== EMPTY_OBJ && hasOwn(ctx, key)) {
      accessCache[key] = 4 /* CONTEXT */;
      return ctx[key];
    } else if (
      // global properties
      globalProperties = appContext.config.globalProperties, hasOwn(globalProperties, key)
    ) {
      {
        return globalProperties[key];
      }
    } else if (currentRenderingInstance && (!isString(key) || // #1091 avoid internal isRef/isVNode checks on component instance leading
    // to infinite warning loop
    key.indexOf("__v") !== 0)) {
      if (data !== EMPTY_OBJ && isReservedPrefix(key[0]) && hasOwn(data, key)) {
        warn$1(
          `Property ${JSON.stringify(
            key
          )} must be accessed via $data because it starts with a reserved character ("$" or "_") and is not proxied on the render context.`
        );
      } else if (instance === currentRenderingInstance) {
        warn$1(
          `Property ${JSON.stringify(key)} was accessed during render but is not defined on instance.`
        );
      }
    }
  },
  set({ _: instance }, key, value) {
    const { data, setupState, ctx } = instance;
    if (hasSetupBinding(setupState, key)) {
      setupState[key] = value;
      return true;
    } else if (setupState.__isScriptSetup && hasOwn(setupState, key)) {
      warn$1(`Cannot mutate <script setup> binding "${key}" from Options API.`);
      return false;
    } else if (__VUE_OPTIONS_API__ && data !== EMPTY_OBJ && hasOwn(data, key)) {
      data[key] = value;
      return true;
    } else if (hasOwn(instance.props, key)) {
      warn$1(`Attempting to mutate prop "${key}". Props are readonly.`);
      return false;
    }
    if (key[0] === "$" && key.slice(1) in instance) {
      warn$1(
        `Attempting to mutate public property "${key}". Properties starting with $ are reserved and readonly.`
      );
      return false;
    } else {
      if (key in instance.appContext.config.globalProperties) {
        Object.defineProperty(ctx, key, {
          enumerable: true,
          configurable: true,
          value
        });
      } else {
        ctx[key] = value;
      }
    }
    return true;
  },
  has({
    _: { data, setupState, accessCache, ctx, appContext, props, type }
  }, key) {
    let cssModules;
    return !!(accessCache[key] || __VUE_OPTIONS_API__ && data !== EMPTY_OBJ && key[0] !== "$" && hasOwn(data, key) || hasSetupBinding(setupState, key) || hasOwn(props, key) || hasOwn(ctx, key) || hasOwn(publicPropertiesMap, key) || hasOwn(appContext.config.globalProperties, key) || (cssModules = type.__cssModules) && cssModules[key]);
  },
  defineProperty(target, key, descriptor) {
    if (descriptor.get != null) {
      target._.accessCache[key] = 0;
    } else if (hasOwn(descriptor, "value")) {
      this.set(target, key, descriptor.value, null);
    }
    return Reflect.defineProperty(target, key, descriptor);
  }
};
{
  PublicInstanceProxyHandlers.ownKeys = (target) => {
    warn$1(
      `Avoid app logic that relies on enumerating keys on a component instance. The keys will be empty in production mode to avoid performance overhead.`
    );
    return Reflect.ownKeys(target);
  };
}
function createDevRenderContext(instance) {
  const target = {};
  Object.defineProperty(target, `_`, {
    configurable: true,
    enumerable: false,
    get: () => instance
  });
  Object.keys(publicPropertiesMap).forEach((key) => {
    Object.defineProperty(target, key, {
      configurable: true,
      enumerable: false,
      get: () => publicPropertiesMap[key](instance),
      // intercepted by the proxy so no need for implementation,
      // but needed to prevent set errors
      set: NOOP
    });
  });
  return target;
}
function exposePropsOnRenderContext(instance) {
  const {
    ctx,
    propsOptions: [propsOptions]
  } = instance;
  if (propsOptions) {
    Object.keys(propsOptions).forEach((key) => {
      Object.defineProperty(ctx, key, {
        enumerable: true,
        configurable: true,
        get: () => instance.props[key],
        set: NOOP
      });
    });
  }
}
function exposeSetupStateOnRenderContext(instance) {
  const { ctx, setupState } = instance;
  Object.keys(toRaw(setupState)).forEach((key) => {
    if (!setupState.__isScriptSetup) {
      if (isReservedPrefix(key[0])) {
        warn$1(
          `setup() return property ${JSON.stringify(
            key
          )} should not start with "$" or "_" which are reserved prefixes for Vue internals.`
        );
        return;
      }
      Object.defineProperty(ctx, key, {
        enumerable: true,
        configurable: true,
        get: () => setupState[key],
        set: NOOP
      });
    }
  });
}
function normalizePropsOrEmits(props) {
  return isArray(props) ? props.reduce(
    (normalized, p) => (normalized[p] = null, normalized),
    {}
  ) : props;
}

function createDuplicateChecker() {
  const cache = /* @__PURE__ */ Object.create(null);
  return (type, key) => {
    if (cache[key]) {
      warn$1(`${type} property "${key}" is already defined in ${cache[key]}.`);
    } else {
      cache[key] = type;
    }
  };
}
let shouldCacheAccess = true;
function applyOptions(instance) {
  const options = resolveMergedOptions(instance);
  const publicThis = instance.proxy;
  const ctx = instance.ctx;
  shouldCacheAccess = false;
  if (options.beforeCreate) {
    callHook(options.beforeCreate, instance, "bc");
  }
  const {
    // state
    data: dataOptions,
    computed: computedOptions,
    methods,
    watch: watchOptions,
    provide: provideOptions,
    inject: injectOptions,
    // lifecycle
    created,
    beforeMount,
    mounted,
    beforeUpdate,
    updated,
    activated,
    deactivated,
    beforeDestroy,
    beforeUnmount,
    destroyed,
    unmounted,
    render,
    renderTracked,
    renderTriggered,
    errorCaptured,
    serverPrefetch,
    // public API
    expose,
    inheritAttrs,
    // assets
    components,
    directives,
    filters
  } = options;
  const checkDuplicateProperties = createDuplicateChecker() ;
  {
    const [propsOptions] = instance.propsOptions;
    if (propsOptions) {
      for (const key in propsOptions) {
        checkDuplicateProperties("Props" /* PROPS */, key);
      }
    }
  }
  if (injectOptions) {
    resolveInjections(injectOptions, ctx, checkDuplicateProperties);
  }
  if (methods) {
    for (const key in methods) {
      const methodHandler = methods[key];
      if (isFunction(methodHandler)) {
        {
          Object.defineProperty(ctx, key, {
            value: methodHandler.bind(publicThis),
            configurable: true,
            enumerable: true,
            writable: true
          });
        }
        {
          checkDuplicateProperties("Methods" /* METHODS */, key);
        }
      } else {
        warn$1(
          `Method "${key}" has type "${typeof methodHandler}" in the component definition. Did you reference the function correctly?`
        );
      }
    }
  }
  if (dataOptions) {
    if (!isFunction(dataOptions)) {
      warn$1(
        `The data option must be a function. Plain object usage is no longer supported.`
      );
    }
    const data = dataOptions.call(publicThis, publicThis);
    if (isPromise(data)) {
      warn$1(
        `data() returned a Promise - note data() cannot be async; If you intend to perform data fetching before component renders, use async setup() + <Suspense>.`
      );
    }
    if (!isObject(data)) {
      warn$1(`data() should return an object.`);
    } else {
      instance.data = reactive(data);
      {
        for (const key in data) {
          checkDuplicateProperties("Data" /* DATA */, key);
          if (!isReservedPrefix(key[0])) {
            Object.defineProperty(ctx, key, {
              configurable: true,
              enumerable: true,
              get: () => data[key],
              set: NOOP
            });
          }
        }
      }
    }
  }
  shouldCacheAccess = true;
  if (computedOptions) {
    for (const key in computedOptions) {
      const opt = computedOptions[key];
      const get = isFunction(opt) ? opt.bind(publicThis, publicThis) : isFunction(opt.get) ? opt.get.bind(publicThis, publicThis) : NOOP;
      if (get === NOOP) {
        warn$1(`Computed property "${key}" has no getter.`);
      }
      const set = !isFunction(opt) && isFunction(opt.set) ? opt.set.bind(publicThis) : () => {
        warn$1(
          `Write operation failed: computed property "${key}" is readonly.`
        );
      } ;
      const c = computed({
        get,
        set
      });
      Object.defineProperty(ctx, key, {
        enumerable: true,
        configurable: true,
        get: () => c.value,
        set: (v) => c.value = v
      });
      {
        checkDuplicateProperties("Computed" /* COMPUTED */, key);
      }
    }
  }
  if (watchOptions) {
    for (const key in watchOptions) {
      createWatcher(watchOptions[key], ctx, publicThis, key);
    }
  }
  if (provideOptions) {
    const provides = isFunction(provideOptions) ? provideOptions.call(publicThis) : provideOptions;
    Reflect.ownKeys(provides).forEach((key) => {
      provide(key, provides[key]);
    });
  }
  if (created) {
    callHook(created, instance, "c");
  }
  function registerLifecycleHook(register, hook) {
    if (isArray(hook)) {
      hook.forEach((_hook) => register(_hook.bind(publicThis)));
    } else if (hook) {
      register(hook.bind(publicThis));
    }
  }
  registerLifecycleHook(onBeforeMount, beforeMount);
  registerLifecycleHook(onMounted, mounted);
  registerLifecycleHook(onBeforeUpdate, beforeUpdate);
  registerLifecycleHook(onUpdated, updated);
  registerLifecycleHook(onActivated, activated);
  registerLifecycleHook(onDeactivated, deactivated);
  registerLifecycleHook(onErrorCaptured, errorCaptured);
  registerLifecycleHook(onRenderTracked, renderTracked);
  registerLifecycleHook(onRenderTriggered, renderTriggered);
  registerLifecycleHook(onBeforeUnmount, beforeUnmount);
  registerLifecycleHook(onUnmounted, unmounted);
  registerLifecycleHook(onServerPrefetch, serverPrefetch);
  if (isArray(expose)) {
    if (expose.length) {
      const exposed = instance.exposed || (instance.exposed = {});
      expose.forEach((key) => {
        Object.defineProperty(exposed, key, {
          get: () => publicThis[key],
          set: (val) => publicThis[key] = val,
          enumerable: true
        });
      });
    } else if (!instance.exposed) {
      instance.exposed = {};
    }
  }
  if (render && instance.render === NOOP) {
    instance.render = render;
  }
  if (inheritAttrs != null) {
    instance.inheritAttrs = inheritAttrs;
  }
  if (components) instance.components = components;
  if (directives) instance.directives = directives;
  if (serverPrefetch) {
    markAsyncBoundary(instance);
  }
}
function resolveInjections(injectOptions, ctx, checkDuplicateProperties = NOOP) {
  if (isArray(injectOptions)) {
    injectOptions = normalizeInject(injectOptions);
  }
  for (const key in injectOptions) {
    const opt = injectOptions[key];
    let injected;
    if (isObject(opt)) {
      if ("default" in opt) {
        injected = inject(
          opt.from || key,
          opt.default,
          true
        );
      } else {
        injected = inject(opt.from || key);
      }
    } else {
      injected = inject(opt);
    }
    if (isRef(injected)) {
      Object.defineProperty(ctx, key, {
        enumerable: true,
        configurable: true,
        get: () => injected.value,
        set: (v) => injected.value = v
      });
    } else {
      ctx[key] = injected;
    }
    {
      checkDuplicateProperties("Inject" /* INJECT */, key);
    }
  }
}
function callHook(hook, instance, type) {
  callWithAsyncErrorHandling(
    isArray(hook) ? hook.map((h) => h.bind(instance.proxy)) : hook.bind(instance.proxy),
    instance,
    type
  );
}
function createWatcher(raw, ctx, publicThis, key) {
  let getter = key.includes(".") ? createPathGetter(publicThis, key) : () => publicThis[key];
  if (isString(raw)) {
    const handler = ctx[raw];
    if (isFunction(handler)) {
      {
        watch(getter, handler);
      }
    } else {
      warn$1(`Invalid watch handler specified by key "${raw}"`, handler);
    }
  } else if (isFunction(raw)) {
    {
      watch(getter, raw.bind(publicThis));
    }
  } else if (isObject(raw)) {
    if (isArray(raw)) {
      raw.forEach((r) => createWatcher(r, ctx, publicThis, key));
    } else {
      const handler = isFunction(raw.handler) ? raw.handler.bind(publicThis) : ctx[raw.handler];
      if (isFunction(handler)) {
        watch(getter, handler, raw);
      } else {
        warn$1(`Invalid watch handler specified by key "${raw.handler}"`, handler);
      }
    }
  } else {
    warn$1(`Invalid watch option: "${key}"`, raw);
  }
}
function resolveMergedOptions(instance) {
  const base = instance.type;
  const { mixins, extends: extendsOptions } = base;
  const {
    mixins: globalMixins,
    optionsCache: cache,
    config: { optionMergeStrategies }
  } = instance.appContext;
  const cached = cache.get(base);
  let resolved;
  if (cached) {
    resolved = cached;
  } else if (!globalMixins.length && !mixins && !extendsOptions) {
    {
      resolved = base;
    }
  } else {
    resolved = {};
    if (globalMixins.length) {
      globalMixins.forEach(
        (m) => mergeOptions(resolved, m, optionMergeStrategies, true)
      );
    }
    mergeOptions(resolved, base, optionMergeStrategies);
  }
  if (isObject(base)) {
    cache.set(base, resolved);
  }
  return resolved;
}
function mergeOptions(to, from, strats, asMixin = false) {
  const { mixins, extends: extendsOptions } = from;
  if (extendsOptions) {
    mergeOptions(to, extendsOptions, strats, true);
  }
  if (mixins) {
    mixins.forEach(
      (m) => mergeOptions(to, m, strats, true)
    );
  }
  for (const key in from) {
    if (asMixin && key === "expose") {
      warn$1(
        `"expose" option is ignored when declared in mixins or extends. It should only be declared in the base component itself.`
      );
    } else {
      const strat = internalOptionMergeStrats[key] || strats && strats[key];
      to[key] = strat ? strat(to[key], from[key]) : from[key];
    }
  }
  return to;
}
const internalOptionMergeStrats = {
  data: mergeDataFn,
  props: mergeEmitsOrPropsOptions,
  emits: mergeEmitsOrPropsOptions,
  // objects
  methods: mergeObjectOptions,
  computed: mergeObjectOptions,
  // lifecycle
  beforeCreate: mergeAsArray,
  created: mergeAsArray,
  beforeMount: mergeAsArray,
  mounted: mergeAsArray,
  beforeUpdate: mergeAsArray,
  updated: mergeAsArray,
  beforeDestroy: mergeAsArray,
  beforeUnmount: mergeAsArray,
  destroyed: mergeAsArray,
  unmounted: mergeAsArray,
  activated: mergeAsArray,
  deactivated: mergeAsArray,
  errorCaptured: mergeAsArray,
  serverPrefetch: mergeAsArray,
  // assets
  components: mergeObjectOptions,
  directives: mergeObjectOptions,
  // watch
  watch: mergeWatchOptions,
  // provide / inject
  provide: mergeDataFn,
  inject: mergeInject
};
function mergeDataFn(to, from) {
  if (!from) {
    return to;
  }
  if (!to) {
    return from;
  }
  return function mergedDataFn() {
    return (extend)(
      isFunction(to) ? to.call(this, this) : to,
      isFunction(from) ? from.call(this, this) : from
    );
  };
}
function mergeInject(to, from) {
  return mergeObjectOptions(normalizeInject(to), normalizeInject(from));
}
function normalizeInject(raw) {
  if (isArray(raw)) {
    const res = {};
    for (let i = 0; i < raw.length; i++) {
      res[raw[i]] = raw[i];
    }
    return res;
  }
  return raw;
}
function mergeAsArray(to, from) {
  return to ? [...new Set([].concat(to, from))] : from;
}
function mergeObjectOptions(to, from) {
  return to ? extend(/* @__PURE__ */ Object.create(null), to, from) : from;
}
function mergeEmitsOrPropsOptions(to, from) {
  if (to) {
    if (isArray(to) && isArray(from)) {
      return [.../* @__PURE__ */ new Set([...to, ...from])];
    }
    return extend(
      /* @__PURE__ */ Object.create(null),
      normalizePropsOrEmits(to),
      normalizePropsOrEmits(from != null ? from : {})
    );
  } else {
    return from;
  }
}
function mergeWatchOptions(to, from) {
  if (!to) return from;
  if (!from) return to;
  const merged = extend(/* @__PURE__ */ Object.create(null), to);
  for (const key in from) {
    merged[key] = mergeAsArray(to[key], from[key]);
  }
  return merged;
}

function createAppContext() {
  return {
    app: null,
    config: {
      isNativeTag: NO,
      performance: false,
      globalProperties: {},
      optionMergeStrategies: {},
      errorHandler: void 0,
      warnHandler: void 0,
      compilerOptions: {}
    },
    mixins: [],
    components: {},
    directives: {},
    provides: /* @__PURE__ */ Object.create(null),
    optionsCache: /* @__PURE__ */ new WeakMap(),
    propsCache: /* @__PURE__ */ new WeakMap(),
    emitsCache: /* @__PURE__ */ new WeakMap()
  };
}
let uid$1 = 0;
function createAppAPI(render, hydrate) {
  return function createApp(rootComponent, rootProps = null) {
    if (!isFunction(rootComponent)) {
      rootComponent = extend({}, rootComponent);
    }
    if (rootProps != null && !isObject(rootProps)) {
      warn$1(`root props passed to app.mount() must be an object.`);
      rootProps = null;
    }
    const context = createAppContext();
    const installedPlugins = /* @__PURE__ */ new WeakSet();
    const pluginCleanupFns = [];
    let isMounted = false;
    const app = context.app = {
      _uid: uid$1++,
      _component: rootComponent,
      _props: rootProps,
      _container: null,
      _context: context,
      _instance: null,
      version,
      get config() {
        return context.config;
      },
      set config(v) {
        {
          warn$1(
            `app.config cannot be replaced. Modify individual options instead.`
          );
        }
      },
      use(plugin, ...options) {
        if (installedPlugins.has(plugin)) {
          warn$1(`Plugin has already been applied to target app.`);
        } else if (plugin && isFunction(plugin.install)) {
          installedPlugins.add(plugin);
          plugin.install(app, ...options);
        } else if (isFunction(plugin)) {
          installedPlugins.add(plugin);
          plugin(app, ...options);
        } else {
          warn$1(
            `A plugin must either be a function or an object with an "install" function.`
          );
        }
        return app;
      },
      mixin(mixin) {
        if (__VUE_OPTIONS_API__) {
          if (!context.mixins.includes(mixin)) {
            context.mixins.push(mixin);
          } else {
            warn$1(
              "Mixin has already been applied to target app" + (mixin.name ? `: ${mixin.name}` : "")
            );
          }
        } else {
          warn$1("Mixins are only available in builds supporting Options API");
        }
        return app;
      },
      component(name, component) {
        {
          validateComponentName(name, context.config);
        }
        if (!component) {
          return context.components[name];
        }
        if (context.components[name]) {
          warn$1(`Component "${name}" has already been registered in target app.`);
        }
        context.components[name] = component;
        return app;
      },
      directive(name, directive) {
        {
          validateDirectiveName(name);
        }
        if (!directive) {
          return context.directives[name];
        }
        if (context.directives[name]) {
          warn$1(`Directive "${name}" has already been registered in target app.`);
        }
        context.directives[name] = directive;
        return app;
      },
      mount(rootContainer, isHydrate, namespace) {
        if (!isMounted) {
          if (rootContainer.__vue_app__) {
            warn$1(
              `There is already an app instance mounted on the host container.
 If you want to mount another app on the same host container, you need to unmount the previous app by calling \`app.unmount()\` first.`
            );
          }
          const vnode = app._ceVNode || createVNode(rootComponent, rootProps);
          vnode.appContext = context;
          if (namespace === true) {
            namespace = "svg";
          } else if (namespace === false) {
            namespace = void 0;
          }
          {
            context.reload = () => {
              const cloned = cloneVNode(vnode);
              cloned.el = null;
              render(cloned, rootContainer, namespace);
            };
          }
          {
            render(vnode, rootContainer, namespace);
          }
          isMounted = true;
          app._container = rootContainer;
          rootContainer.__vue_app__ = app;
          {
            app._instance = vnode.component;
            devtoolsInitApp(app, version);
          }
          return getComponentPublicInstance(vnode.component);
        } else {
          warn$1(
            `App has already been mounted.
If you want to remount the same app, move your app creation logic into a factory function and create fresh app instances for each mount - e.g. \`const createMyApp = () => createApp(App)\``
          );
        }
      },
      onUnmount(cleanupFn) {
        if (typeof cleanupFn !== "function") {
          warn$1(
            `Expected function as first argument to app.onUnmount(), but got ${typeof cleanupFn}`
          );
        }
        pluginCleanupFns.push(cleanupFn);
      },
      unmount() {
        if (isMounted) {
          callWithAsyncErrorHandling(
            pluginCleanupFns,
            app._instance,
            16
          );
          render(null, app._container);
          {
            app._instance = null;
            devtoolsUnmountApp(app);
          }
          delete app._container.__vue_app__;
        } else {
          warn$1(`Cannot unmount an app that is not mounted.`);
        }
      },
      provide(key, value) {
        if (key in context.provides) {
          if (hasOwn(context.provides, key)) {
            warn$1(
              `App already provides property with key "${String(key)}". It will be overwritten with the new value.`
            );
          } else {
            warn$1(
              `App already provides property with key "${String(key)}" inherited from its parent element. It will be overwritten with the new value.`
            );
          }
        }
        context.provides[key] = value;
        return app;
      },
      runWithContext(fn) {
        const lastApp = currentApp;
        currentApp = app;
        try {
          return fn();
        } finally {
          currentApp = lastApp;
        }
      }
    };
    return app;
  };
}
let currentApp = null;
const getModelModifiers = (props, modelName) => {
  return modelName === "modelValue" || modelName === "model-value" ? props.modelModifiers : props[`${modelName}Modifiers`] || props[`${camelize(modelName)}Modifiers`] || props[`${hyphenate(modelName)}Modifiers`];
};

function emit(instance, event, ...rawArgs) {
  if (instance.isUnmounted) return;
  const props = instance.vnode.props || EMPTY_OBJ;
  {
    const {
      emitsOptions,
      propsOptions: [propsOptions]
    } = instance;
    if (emitsOptions) {
      if (!(event in emitsOptions) && true) {
        if (!propsOptions || !(toHandlerKey(camelize(event)) in propsOptions)) {
          warn$1(
            `Component emitted event "${event}" but it is neither declared in the emits option nor as an "${toHandlerKey(camelize(event))}" prop.`
          );
        }
      } else {
        const validator = emitsOptions[event];
        if (isFunction(validator)) {
          const isValid = validator(...rawArgs);
          if (!isValid) {
            warn$1(
              `Invalid event arguments: event validation failed for event "${event}".`
            );
          }
        }
      }
    }
  }
  let args = rawArgs;
  const isModelListener = event.startsWith("update:");
  const modifiers = isModelListener && getModelModifiers(props, event.slice(7));
  if (modifiers) {
    if (modifiers.trim) {
      args = rawArgs.map((a) => isString(a) ? a.trim() : a);
    }
    if (modifiers.number) {
      args = args.map(looseToNumber);
    }
  }
  {
    devtoolsComponentEmit(instance, event, args);
  }
  {
    const lowerCaseEvent = event.toLowerCase();
    if (lowerCaseEvent !== event && props[toHandlerKey(lowerCaseEvent)]) {
      warn$1(
        `Event "${lowerCaseEvent}" is emitted in component ${formatComponentName(
          instance,
          instance.type
        )} but the handler is registered for "${event}". Note that HTML attributes are case-insensitive and you cannot use v-on to listen to camelCase events when using in-DOM templates. You should probably use "${hyphenate(
          event
        )}" instead of "${event}".`
      );
    }
  }
  let handlerName;
  let handler = props[handlerName = toHandlerKey(event)] || // also try camelCase event handler (#2249)
  props[handlerName = toHandlerKey(camelize(event))];
  if (!handler && isModelListener) {
    handler = props[handlerName = toHandlerKey(hyphenate(event))];
  }
  if (handler) {
    callWithAsyncErrorHandling(
      handler,
      instance,
      6,
      args
    );
  }
  const onceHandler = props[handlerName + `Once`];
  if (onceHandler) {
    if (!instance.emitted) {
      instance.emitted = {};
    } else if (instance.emitted[handlerName]) {
      return;
    }
    instance.emitted[handlerName] = true;
    callWithAsyncErrorHandling(
      onceHandler,
      instance,
      6,
      args
    );
  }
}
const mixinEmitsCache = /* @__PURE__ */ new WeakMap();
function normalizeEmitsOptions(comp, appContext, asMixin = false) {
  const cache = __VUE_OPTIONS_API__ && asMixin ? mixinEmitsCache : appContext.emitsCache;
  const cached = cache.get(comp);
  if (cached !== void 0) {
    return cached;
  }
  const raw = comp.emits;
  let normalized = {};
  let hasExtends = false;
  if (__VUE_OPTIONS_API__ && !isFunction(comp)) {
    const extendEmits = (raw2) => {
      const normalizedFromExtend = normalizeEmitsOptions(raw2, appContext, true);
      if (normalizedFromExtend) {
        hasExtends = true;
        extend(normalized, normalizedFromExtend);
      }
    };
    if (!asMixin && appContext.mixins.length) {
      appContext.mixins.forEach(extendEmits);
    }
    if (comp.extends) {
      extendEmits(comp.extends);
    }
    if (comp.mixins) {
      comp.mixins.forEach(extendEmits);
    }
  }
  if (!raw && !hasExtends) {
    if (isObject(comp)) {
      cache.set(comp, null);
    }
    return null;
  }
  if (isArray(raw)) {
    raw.forEach((key) => normalized[key] = null);
  } else {
    extend(normalized, raw);
  }
  if (isObject(comp)) {
    cache.set(comp, normalized);
  }
  return normalized;
}
function isEmitListener(options, key) {
  if (!options || !isOn(key)) {
    return false;
  }
  key = key.slice(2);
  key = key === "Once" ? key : key.replace(/Once$/, "");
  return hasOwn(options, key[0].toLowerCase() + key.slice(1)) || hasOwn(options, hyphenate(key)) || hasOwn(options, key);
}

let accessedAttrs = false;
function markAttrsAccessed() {
  accessedAttrs = true;
}
function renderComponentRoot$1(instance) {
  const {
    type: Component,
    vnode,
    proxy,
    withProxy,
    propsOptions: [propsOptions],
    slots,
    attrs,
    emit,
    render,
    renderCache,
    props,
    data,
    setupState,
    ctx,
    inheritAttrs
  } = instance;
  const prev = setCurrentRenderingInstance$1(instance);
  let result;
  let fallthroughAttrs;
  {
    accessedAttrs = false;
  }
  try {
    if (vnode.shapeFlag & 4) {
      const proxyToUse = withProxy || proxy;
      const thisProxy = !!(true !== "production") && setupState.__isScriptSetup ? new Proxy(proxyToUse, {
        get(target, key, receiver) {
          warn$1(
            `Property '${String(
              key
            )}' was accessed via 'this'. Avoid using 'this' in templates.`
          );
          return Reflect.get(target, key, receiver);
        }
      }) : proxyToUse;
      result = normalizeVNode$1(
        render.call(
          thisProxy,
          proxyToUse,
          renderCache,
          !!(true !== "production") ? shallowReadonly(props) : props,
          setupState,
          data,
          ctx
        )
      );
      fallthroughAttrs = attrs;
    } else {
      const render2 = Component;
      if (!!(true !== "production") && attrs === props) {
        markAttrsAccessed();
      }
      result = normalizeVNode$1(
        render2.length > 1 ? render2(
          !!(true !== "production") ? shallowReadonly(props) : props,
          !!(true !== "production") ? {
            get attrs() {
              markAttrsAccessed();
              return shallowReadonly(attrs);
            },
            slots,
            emit
          } : { attrs, slots, emit }
        ) : render2(
          !!(true !== "production") ? shallowReadonly(props) : props,
          null
        )
      );
      fallthroughAttrs = Component.props ? attrs : getFunctionalFallthrough(attrs);
    }
  } catch (err) {
    blockStack.length = 0;
    handleError(err, instance, 1);
    result = createVNode(Comment);
  }
  let root = result;
  let setRoot = void 0;
  if (result.patchFlag > 0 && result.patchFlag & 2048) {
    [root, setRoot] = getChildRoot(result);
  }
  if (fallthroughAttrs && inheritAttrs !== false) {
    const keys = Object.keys(fallthroughAttrs);
    const { shapeFlag } = root;
    if (keys.length) {
      if (shapeFlag & (1 | 6)) {
        if (propsOptions && keys.some(isModelListener)) {
          fallthroughAttrs = filterModelListeners(
            fallthroughAttrs,
            propsOptions
          );
        }
        root = cloneVNode(root, fallthroughAttrs, false, true);
      } else if (!accessedAttrs && root.type !== Comment) {
        const allAttrs = Object.keys(attrs);
        const eventAttrs = [];
        const extraAttrs = [];
        for (let i = 0, l = allAttrs.length; i < l; i++) {
          const key = allAttrs[i];
          if (isOn(key)) {
            if (!isModelListener(key)) {
              eventAttrs.push(key[2].toLowerCase() + key.slice(3));
            }
          } else {
            extraAttrs.push(key);
          }
        }
        if (extraAttrs.length) {
          warn$1(
            `Extraneous non-props attributes (${extraAttrs.join(", ")}) were passed to component but could not be automatically inherited because component renders fragment or text or teleport root nodes.`
          );
        }
        if (eventAttrs.length) {
          warn$1(
            `Extraneous non-emits event listeners (${eventAttrs.join(", ")}) were passed to component but could not be automatically inherited because component renders fragment or text root nodes. If the listener is intended to be a component custom event listener only, declare it using the "emits" option.`
          );
        }
      }
    }
  }
  if (vnode.dirs) {
    if (!isElementRoot(root)) {
      warn$1(
        `Runtime directive used on component with non-element root node. The directives will not function as intended.`
      );
    }
    root = cloneVNode(root, null, false, true);
    root.dirs = root.dirs ? root.dirs.concat(vnode.dirs) : vnode.dirs;
  }
  if (vnode.transition) {
    const child = isTeleport(root.type) ? getInnerChild$1(root) || root : root;
    if (!isElementRoot(child)) {
      warn$1(
        `Component inside <Transition> renders non-element root node that cannot be animated.`
      );
    }
    setTransitionHooks(child, vnode.transition);
  }
  if (setRoot) {
    setRoot(root);
  } else {
    result = root;
  }
  setCurrentRenderingInstance$1(prev);
  return result;
}
const getChildRoot = (vnode) => {
  const rawChildren = vnode.children;
  const dynamicChildren = vnode.dynamicChildren;
  const childRoot = filterSingleRoot(rawChildren, false);
  if (!childRoot) {
    return [vnode, void 0];
  } else if (childRoot.patchFlag > 0 && childRoot.patchFlag & 2048) {
    return getChildRoot(childRoot);
  }
  const index = rawChildren.indexOf(childRoot);
  const dynamicIndex = dynamicChildren ? dynamicChildren.indexOf(childRoot) : -1;
  const setRoot = (updatedRoot) => {
    rawChildren[index] = updatedRoot;
    if (dynamicChildren) {
      if (dynamicIndex > -1) {
        dynamicChildren[dynamicIndex] = updatedRoot;
      } else if (updatedRoot.patchFlag > 0) {
        vnode.dynamicChildren = [...dynamicChildren, updatedRoot];
      }
    }
  };
  return [normalizeVNode$1(childRoot), setRoot];
};
function filterSingleRoot(children, recurse = true) {
  let singleRoot;
  for (let i = 0; i < children.length; i++) {
    const child = children[i];
    if (isVNode(child)) {
      if (child.type !== Comment || child.children === "v-if") {
        if (singleRoot) {
          return;
        } else {
          singleRoot = child;
          if (recurse && singleRoot.patchFlag > 0 && singleRoot.patchFlag & 2048) {
            return filterSingleRoot(singleRoot.children);
          }
        }
      }
    } else {
      return;
    }
  }
  return singleRoot;
}
const getFunctionalFallthrough = (attrs) => {
  let res;
  for (const key in attrs) {
    if (key === "class" || key === "style" || isOn(key)) {
      (res || (res = {}))[key] = attrs[key];
    }
  }
  return res;
};
const filterModelListeners = (attrs, props) => {
  const res = {};
  for (const key in attrs) {
    if (!isModelListener(key) || !(key.slice(9) in props)) {
      res[key] = attrs[key];
    }
  }
  return res;
};
const isElementRoot = (vnode) => {
  return vnode.shapeFlag & (6 | 1) || vnode.type === Comment;
};
function shouldUpdateComponent(prevVNode, nextVNode, optimized) {
  const { props: prevProps, children: prevChildren, component } = prevVNode;
  const { props: nextProps, children: nextChildren, patchFlag } = nextVNode;
  const emits = component.emitsOptions;
  if ((prevChildren || nextChildren) && isHmrUpdating) {
    return true;
  }
  if (nextVNode.dirs || nextVNode.transition) {
    return true;
  }
  if (optimized && patchFlag >= 0) {
    if (patchFlag & 1024) {
      return true;
    }
    if (patchFlag & 16) {
      if (!prevProps) {
        return !!nextProps;
      }
      return hasPropsChanged(prevProps, nextProps, emits);
    } else if (patchFlag & 8) {
      const dynamicProps = nextVNode.dynamicProps;
      for (let i = 0; i < dynamicProps.length; i++) {
        const key = dynamicProps[i];
        if (hasPropValueChanged(nextProps, prevProps, key) && !isEmitListener(emits, key)) {
          return true;
        }
      }
    }
  } else {
    if (prevChildren || nextChildren) {
      if (!nextChildren || !nextChildren.$stable) {
        return true;
      }
    }
    if (prevProps === nextProps) {
      return false;
    }
    if (!prevProps) {
      return !!nextProps;
    }
    if (!nextProps) {
      return true;
    }
    return hasPropsChanged(prevProps, nextProps, emits);
  }
  return false;
}
function hasPropsChanged(prevProps, nextProps, emitsOptions) {
  const nextKeys = Object.keys(nextProps);
  if (nextKeys.length !== Object.keys(prevProps).length) {
    return true;
  }
  for (let i = 0; i < nextKeys.length; i++) {
    const key = nextKeys[i];
    if (hasPropValueChanged(nextProps, prevProps, key) && !isEmitListener(emitsOptions, key)) {
      return true;
    }
  }
  return false;
}
function hasPropValueChanged(nextProps, prevProps, key) {
  const nextProp = nextProps[key];
  const prevProp = prevProps[key];
  if (key === "style" && isObject(nextProp) && isObject(prevProp)) {
    return !looseEqual(nextProp, prevProp);
  }
  return nextProp !== prevProp;
}
function updateHOCHostEl({ vnode, parent, suspense }, el) {
  while (parent) {
    const root = parent.subTree;
    if (root.suspense && root.suspense.activeBranch === vnode) {
      root.suspense.vnode.el = root.el = el;
      vnode = root;
    }
    if (root === vnode) {
      (vnode = parent.vnode).el = el;
      parent = parent.parent;
    } else {
      break;
    }
  }
  if (suspense && suspense.activeBranch === vnode) {
    suspense.vnode.el = el;
  }
}

const internalObjectProto = {};
const createInternalObject = () => Object.create(internalObjectProto);
const isInternalObject = (obj) => Object.getPrototypeOf(obj) === internalObjectProto;

function initProps(instance, rawProps, isStateful, isSSR = false) {
  const props = {};
  const attrs = createInternalObject();
  instance.propsDefaults = /* @__PURE__ */ Object.create(null);
  setFullProps(instance, rawProps, props, attrs);
  for (const key in instance.propsOptions[0]) {
    if (!(key in props)) {
      props[key] = void 0;
    }
  }
  {
    validateProps(rawProps || {}, props, instance);
  }
  if (isStateful) {
    instance.props = isSSR ? props : shallowReactive(props);
  } else {
    if (!instance.type.props) {
      instance.props = attrs;
    } else {
      instance.props = props;
    }
  }
  instance.attrs = attrs;
}
function isInHmrContext(instance) {
  while (instance) {
    if (instance.type.__hmrId) return true;
    instance = instance.parent;
  }
}
function updateProps(instance, rawProps, rawPrevProps, optimized) {
  const {
    props,
    attrs,
    vnode: { patchFlag }
  } = instance;
  const rawCurrentProps = toRaw(props);
  const [options] = instance.propsOptions;
  let hasAttrsChanged = false;
  if (
    // always force full diff in dev
    // - #1942 if hmr is enabled with sfc component
    // - vite#872 non-sfc component used by sfc component
    !(isInHmrContext(instance)) && (optimized || patchFlag > 0) && !(patchFlag & 16)
  ) {
    if (patchFlag & 8) {
      const propsToUpdate = instance.vnode.dynamicProps;
      for (let i = 0; i < propsToUpdate.length; i++) {
        let key = propsToUpdate[i];
        if (isEmitListener(instance.emitsOptions, key)) {
          continue;
        }
        const value = rawProps[key];
        if (options) {
          if (hasOwn(attrs, key)) {
            if (value !== attrs[key]) {
              attrs[key] = value;
              hasAttrsChanged = true;
            }
          } else {
            const camelizedKey = camelize(key);
            props[camelizedKey] = resolvePropValue(
              options,
              rawCurrentProps,
              camelizedKey,
              value,
              instance,
              false
            );
          }
        } else {
          if (value !== attrs[key]) {
            attrs[key] = value;
            hasAttrsChanged = true;
          }
        }
      }
    }
  } else {
    if (setFullProps(instance, rawProps, props, attrs)) {
      hasAttrsChanged = true;
    }
    let kebabKey;
    for (const key in rawCurrentProps) {
      if (!rawProps || // for camelCase
      !hasOwn(rawProps, key) && // it's possible the original props was passed in as kebab-case
      // and converted to camelCase (#955)
      ((kebabKey = hyphenate(key)) === key || !hasOwn(rawProps, kebabKey))) {
        if (options) {
          if (rawPrevProps && // for camelCase
          (rawPrevProps[key] !== void 0 || // for kebab-case
          rawPrevProps[kebabKey] !== void 0)) {
            props[key] = resolvePropValue(
              options,
              rawCurrentProps,
              key,
              void 0,
              instance,
              true
            );
          }
        } else {
          delete props[key];
        }
      }
    }
    if (attrs !== rawCurrentProps) {
      for (const key in attrs) {
        if (!rawProps || !hasOwn(rawProps, key) && true) {
          delete attrs[key];
          hasAttrsChanged = true;
        }
      }
    }
  }
  if (hasAttrsChanged) {
    trigger(instance.attrs, "set", "");
  }
  {
    validateProps(rawProps || {}, props, instance);
  }
}
function setFullProps(instance, rawProps, props, attrs) {
  const [options, needCastKeys] = instance.propsOptions;
  let hasAttrsChanged = false;
  let rawCastValues;
  if (rawProps) {
    for (let key in rawProps) {
      if (isReservedProp(key)) {
        continue;
      }
      const value = rawProps[key];
      let camelKey;
      if (options && hasOwn(options, camelKey = camelize(key))) {
        if (!needCastKeys || !needCastKeys.includes(camelKey)) {
          props[camelKey] = value;
        } else {
          (rawCastValues || (rawCastValues = {}))[camelKey] = value;
        }
      } else if (!isEmitListener(instance.emitsOptions, key)) {
        if (!(key in attrs) || value !== attrs[key]) {
          attrs[key] = value;
          hasAttrsChanged = true;
        }
      }
    }
  }
  if (needCastKeys) {
    const rawCurrentProps = toRaw(props);
    const castValues = rawCastValues || EMPTY_OBJ;
    for (let i = 0; i < needCastKeys.length; i++) {
      const key = needCastKeys[i];
      props[key] = resolvePropValue(
        options,
        rawCurrentProps,
        key,
        castValues[key],
        instance,
        !hasOwn(castValues, key)
      );
    }
  }
  return hasAttrsChanged;
}
function resolvePropValue(options, props, key, value, instance, isAbsent) {
  const opt = options[key];
  if (opt != null) {
    const hasDefault = hasOwn(opt, "default");
    if (hasDefault && value === void 0) {
      const defaultValue = opt.default;
      if (opt.type !== Function && !opt.skipFactory && isFunction(defaultValue)) {
        const { propsDefaults } = instance;
        if (key in propsDefaults) {
          value = propsDefaults[key];
        } else {
          const reset = setCurrentInstance(instance);
          value = propsDefaults[key] = defaultValue.call(
            null,
            props
          );
          reset();
        }
      } else {
        value = defaultValue;
      }
      if (instance.ce) {
        instance.ce._setProp(key, value);
      }
    }
    if (opt[0 /* shouldCast */]) {
      if (isAbsent && !hasDefault) {
        value = false;
      } else if (opt[1 /* shouldCastTrue */] && (value === "" || value === hyphenate(key))) {
        value = true;
      }
    }
  }
  return value;
}
const mixinPropsCache = /* @__PURE__ */ new WeakMap();
function normalizePropsOptions(comp, appContext, asMixin = false) {
  const cache = __VUE_OPTIONS_API__ && asMixin ? mixinPropsCache : appContext.propsCache;
  const cached = cache.get(comp);
  if (cached) {
    return cached;
  }
  const raw = comp.props;
  const normalized = {};
  const needCastKeys = [];
  let hasExtends = false;
  if (__VUE_OPTIONS_API__ && !isFunction(comp)) {
    const extendProps = (raw2) => {
      hasExtends = true;
      const [props, keys] = normalizePropsOptions(raw2, appContext, true);
      extend(normalized, props);
      if (keys) needCastKeys.push(...keys);
    };
    if (!asMixin && appContext.mixins.length) {
      appContext.mixins.forEach(extendProps);
    }
    if (comp.extends) {
      extendProps(comp.extends);
    }
    if (comp.mixins) {
      comp.mixins.forEach(extendProps);
    }
  }
  if (!raw && !hasExtends) {
    if (isObject(comp)) {
      cache.set(comp, EMPTY_ARR);
    }
    return EMPTY_ARR;
  }
  if (isArray(raw)) {
    for (let i = 0; i < raw.length; i++) {
      if (!isString(raw[i])) {
        warn$1(`props must be strings when using array syntax.`, raw[i]);
      }
      const normalizedKey = camelize(raw[i]);
      if (validatePropName(normalizedKey)) {
        normalized[normalizedKey] = EMPTY_OBJ;
      }
    }
  } else if (raw) {
    if (!isObject(raw)) {
      warn$1(`invalid props options`, raw);
    }
    for (const key in raw) {
      const normalizedKey = camelize(key);
      if (validatePropName(normalizedKey)) {
        const opt = raw[key];
        const prop = normalized[normalizedKey] = isArray(opt) || isFunction(opt) ? { type: opt } : extend({}, opt);
        const propType = prop.type;
        let shouldCast = false;
        let shouldCastTrue = true;
        if (isArray(propType)) {
          for (let index = 0; index < propType.length; ++index) {
            const type = propType[index];
            const typeName = isFunction(type) && type.name;
            if (typeName === "Boolean") {
              shouldCast = true;
              break;
            } else if (typeName === "String") {
              shouldCastTrue = false;
            }
          }
        } else {
          shouldCast = isFunction(propType) && propType.name === "Boolean";
        }
        prop[0 /* shouldCast */] = shouldCast;
        prop[1 /* shouldCastTrue */] = shouldCastTrue;
        if (shouldCast || hasOwn(prop, "default")) {
          needCastKeys.push(normalizedKey);
        }
      }
    }
  }
  const res = [normalized, needCastKeys];
  if (isObject(comp)) {
    cache.set(comp, res);
  }
  return res;
}
function validatePropName(key) {
  if (key[0] !== "$" && !isReservedProp(key)) {
    return true;
  } else {
    warn$1(`Invalid prop name: "${key}" is a reserved property.`);
  }
  return false;
}
function getType(ctor) {
  if (ctor === null) {
    return "null";
  }
  if (typeof ctor === "function") {
    return ctor.name || "";
  } else if (typeof ctor === "object") {
    const name = ctor.constructor && ctor.constructor.name;
    return name || "";
  }
  return "";
}
function validateProps(rawProps, props, instance) {
  const resolvedValues = toRaw(props);
  const options = instance.propsOptions[0];
  const camelizePropsKey = Object.keys(rawProps).map((key) => camelize(key));
  for (const key in options) {
    let opt = options[key];
    if (opt == null) continue;
    validateProp(
      key,
      resolvedValues[key],
      opt,
      shallowReadonly(resolvedValues) ,
      !camelizePropsKey.includes(key)
    );
  }
}
function validateProp(name, value, prop, props, isAbsent) {
  const { type, required, validator, skipCheck } = prop;
  if (required && isAbsent) {
    warn$1('Missing required prop: "' + name + '"');
    return;
  }
  if (value == null && !required) {
    return;
  }
  if (type != null && type !== true && !skipCheck) {
    let isValid = false;
    const types = isArray(type) ? type : [type];
    const expectedTypes = [];
    for (let i = 0; i < types.length && !isValid; i++) {
      const { valid, expectedType } = assertType(value, types[i]);
      expectedTypes.push(expectedType || "");
      isValid = valid;
    }
    if (!isValid) {
      warn$1(getInvalidTypeMessage(name, value, expectedTypes));
      return;
    }
  }
  if (validator && !validator(value, props)) {
    warn$1('Invalid prop: custom validator check failed for prop "' + name + '".');
  }
}
const isSimpleType = /* @__PURE__ */ makeMap(
  "String,Number,Boolean,Function,Symbol,BigInt"
);
function assertType(value, type) {
  let valid;
  const expectedType = getType(type);
  if (expectedType === "null") {
    valid = value === null;
  } else if (isSimpleType(expectedType)) {
    const t = typeof value;
    valid = t === expectedType.toLowerCase();
    if (!valid && t === "object") {
      valid = value instanceof type;
    }
  } else if (expectedType === "Object") {
    valid = isObject(value);
  } else if (expectedType === "Array") {
    valid = isArray(value);
  } else {
    valid = value instanceof type;
  }
  return {
    valid,
    expectedType
  };
}
function getInvalidTypeMessage(name, value, expectedTypes) {
  if (expectedTypes.length === 0) {
    return `Prop type [] for prop "${name}" won't match anything. Did you mean to use type Array instead?`;
  }
  let message = `Invalid prop: type check failed for prop "${name}". Expected ${expectedTypes.map(capitalize).join(" | ")}`;
  const expectedType = expectedTypes[0];
  const receivedType = toRawType(value);
  const expectedValue = styleValue(value, expectedType);
  const receivedValue = styleValue(value, receivedType);
  if (expectedTypes.length === 1 && isExplicable(expectedType) && isCoercible(expectedType, receivedType)) {
    message += ` with value ${expectedValue}`;
  }
  message += `, got ${receivedType} `;
  if (isExplicable(receivedType)) {
    message += `with value ${receivedValue}.`;
  }
  return message;
}
function styleValue(value, type) {
  if (isSymbol(value)) {
    return value.toString();
  } else if (type === "String") {
    return `"${value}"`;
  } else if (type === "Number") {
    return `${Number(value)}`;
  } else {
    return `${value}`;
  }
}
function isExplicable(type) {
  const explicitTypes = ["string", "number", "boolean"];
  return explicitTypes.some((elem) => type.toLowerCase() === elem);
}
function isCoercible(...args) {
  return args.every((elem) => {
    const value = elem.toLowerCase();
    return value !== "boolean" && value !== "symbol";
  });
}

const isInternalKey = (key) => key === "_" || key === "_ctx" || key === "$stable";
const normalizeSlotValue = (value) => isArray(value) ? value.map(normalizeVNode$1) : [normalizeVNode$1(value)];
const normalizeSlot = (key, rawSlot, ctx) => {
  if (rawSlot._n) {
    return rawSlot;
  }
  const normalized = withCtx((...args) => {
    if (!!(true !== "production") && currentInstance && !(ctx === null && currentRenderingInstance) && !(ctx && ctx.root !== currentInstance.root)) {
      warn$1(
        `Slot "${key}" invoked outside of the render function: this will not track dependencies used in the slot. Invoke the slot function inside the render function instead.`
      );
    }
    return normalizeSlotValue(rawSlot(...args));
  }, ctx);
  normalized._c = false;
  return normalized;
};
const normalizeObjectSlots = (rawSlots, slots, instance) => {
  const ctx = rawSlots._ctx;
  for (const key in rawSlots) {
    if (isInternalKey(key)) continue;
    const value = rawSlots[key];
    if (isFunction(value)) {
      slots[key] = normalizeSlot(key, value, ctx);
    } else if (value != null) {
      {
        warn$1(
          `Non-function value encountered for slot "${key}". Prefer function slots for better performance.`
        );
      }
      const normalized = normalizeSlotValue(value);
      slots[key] = () => normalized;
    }
  }
};
const normalizeVNodeSlots = (instance, children) => {
  if (!isKeepAlive(instance.vnode) && true) {
    warn$1(
      `Non-function value encountered for default slot. Prefer function slots for better performance.`
    );
  }
  const normalized = normalizeSlotValue(children);
  instance.slots.default = () => normalized;
};
const assignSlots = (slots, children, optimized) => {
  for (const key in children) {
    if (optimized || !isInternalKey(key)) {
      slots[key] = children[key];
    }
  }
};
const initSlots = (instance, children, optimized) => {
  const slots = instance.slots = createInternalObject();
  if (instance.vnode.shapeFlag & 32) {
    const type = children._;
    if (type) {
      assignSlots(slots, children, optimized);
      if (optimized) {
        def(slots, "_", type, true);
      }
    } else {
      normalizeObjectSlots(children, slots);
    }
  } else if (children) {
    normalizeVNodeSlots(instance, children);
  }
};
const updateSlots = (instance, children, optimized) => {
  const { vnode, slots } = instance;
  let needDeletionCheck = true;
  let deletionComparisonTarget = EMPTY_OBJ;
  if (vnode.shapeFlag & 32) {
    const type = children._;
    if (type) {
      if (isHmrUpdating) {
        assignSlots(slots, children, optimized);
        trigger(instance, "set", "$slots");
      } else if (optimized && type === 1) {
        needDeletionCheck = false;
      } else {
        assignSlots(slots, children, optimized);
      }
    } else {
      needDeletionCheck = !children.$stable;
      normalizeObjectSlots(children, slots);
    }
    deletionComparisonTarget = children;
  } else if (children) {
    normalizeVNodeSlots(instance, children);
    deletionComparisonTarget = { default: 1 };
  }
  if (needDeletionCheck) {
    for (const key in slots) {
      if (!isInternalKey(key) && deletionComparisonTarget[key] == null) {
        delete slots[key];
      }
    }
  }
};

let supported;
let perf;
function startMeasure(instance, type) {
  if (instance.appContext.config.performance && isSupported()) {
    perf.mark(`vue-${type}-${instance.uid}`);
  }
  {
    devtoolsPerfStart(instance, type, isSupported() ? perf.now() : Date.now());
  }
}
function endMeasure(instance, type) {
  if (instance.appContext.config.performance && isSupported()) {
    const startTag = `vue-${type}-${instance.uid}`;
    const endTag = startTag + `:end`;
    const measureName = `<${formatComponentName(instance, instance.type)}> ${type}`;
    perf.mark(endTag);
    perf.measure(measureName, startTag, endTag);
    perf.clearMeasures(measureName);
    perf.clearMarks(startTag);
    perf.clearMarks(endTag);
  }
  {
    devtoolsPerfEnd(instance, type, isSupported() ? perf.now() : Date.now());
  }
}
function isSupported() {
  if (supported !== void 0) {
    return supported;
  }
  if (typeof window !== "undefined" && window.performance) {
    supported = true;
    perf = window.performance;
  } else {
    supported = false;
  }
  return supported;
}

function initFeatureFlags() {
  const needWarn = [];
  if (typeof __VUE_OPTIONS_API__ !== "boolean") {
    needWarn.push(`__VUE_OPTIONS_API__`);
    getGlobalThis().__VUE_OPTIONS_API__ = true;
  }
  if (typeof __VUE_PROD_DEVTOOLS__ !== "boolean") {
    needWarn.push(`__VUE_PROD_DEVTOOLS__`);
    getGlobalThis().__VUE_PROD_DEVTOOLS__ = false;
  }
  if (typeof __VUE_PROD_HYDRATION_MISMATCH_DETAILS__ !== "boolean") {
    needWarn.push(`__VUE_PROD_HYDRATION_MISMATCH_DETAILS__`);
    getGlobalThis().__VUE_PROD_HYDRATION_MISMATCH_DETAILS__ = false;
  }
  if (needWarn.length) {
    const multi = needWarn.length > 1;
    console.warn(
      `Feature flag${multi ? `s` : ``} ${needWarn.join(", ")} ${multi ? `are` : `is`} not explicitly defined. You are running the esm-bundler build of Vue, which expects these compile-time feature flags to be globally injected via the bundler config in order to get better tree-shaking in the production bundle.

For more details, see https://link.vuejs.org/feature-flags.`
    );
  }
}

const queuePostRenderEffect = queueEffectWithSuspense ;
function createRenderer(options) {
  return baseCreateRenderer(options);
}
function baseCreateRenderer(options, createHydrationFns) {
  {
    initFeatureFlags();
  }
  const target = getGlobalThis();
  target.__VUE__ = true;
  {
    setDevtoolsHook$1(target.__VUE_DEVTOOLS_GLOBAL_HOOK__, target);
  }
  const {
    insert: hostInsert,
    remove: hostRemove,
    patchProp: hostPatchProp,
    createElement: hostCreateElement,
    createText: hostCreateText,
    createComment: hostCreateComment,
    setText: hostSetText,
    setElementText: hostSetElementText,
    parentNode: hostParentNode,
    nextSibling: hostNextSibling,
    setScopeId: hostSetScopeId = NOOP,
    insertStaticContent: hostInsertStaticContent
  } = options;
  const patch = (n1, n2, container, anchor = null, parentComponent = null, parentSuspense = null, namespace = void 0, slotScopeIds = null, optimized = isHmrUpdating ? false : !!n2.dynamicChildren) => {
    if (n1 === n2) {
      return;
    }
    if (n1 && !isSameVNodeType(n1, n2)) {
      anchor = getNextHostNode(n1);
      unmount(n1, parentComponent, parentSuspense, true);
      n1 = null;
    }
    if (n2.patchFlag === -2) {
      optimized = false;
      n2.dynamicChildren = null;
    }
    const { type, ref, shapeFlag } = n2;
    switch (type) {
      case Text:
        processText(n1, n2, container, anchor);
        break;
      case Comment:
        processCommentNode(n1, n2, container, anchor);
        break;
      case Static:
        if (n1 == null) {
          mountStaticNode(n2, container, anchor, namespace);
        } else {
          patchStaticNode(n1, n2, container, namespace);
        }
        break;
      case Fragment:
        processFragment(
          n1,
          n2,
          container,
          anchor,
          parentComponent,
          parentSuspense,
          namespace,
          slotScopeIds,
          optimized
        );
        break;
      default:
        if (shapeFlag & 1) {
          processElement(
            n1,
            n2,
            container,
            anchor,
            parentComponent,
            parentSuspense,
            namespace,
            slotScopeIds,
            optimized
          );
        } else if (shapeFlag & 6) {
          processComponent(
            n1,
            n2,
            container,
            anchor,
            parentComponent,
            parentSuspense,
            namespace,
            slotScopeIds,
            optimized
          );
        } else if (shapeFlag & 64) {
          type.process(
            n1,
            n2,
            container,
            anchor,
            parentComponent,
            parentSuspense,
            namespace,
            slotScopeIds,
            optimized,
            internals
          );
        } else if (shapeFlag & 128) {
          type.process(
            n1,
            n2,
            container,
            anchor,
            parentComponent,
            parentSuspense,
            namespace,
            slotScopeIds,
            optimized,
            internals
          );
        } else {
          warn$1("Invalid VNode type:", type, `(${typeof type})`);
        }
    }
    if (ref != null && parentComponent) {
      setRef(ref, n1 && n1.ref, parentSuspense, n2 || n1, !n2);
    } else if (ref == null && n1 && n1.ref != null) {
      setRef(n1.ref, null, parentSuspense, n1, true);
    }
  };
  const processText = (n1, n2, container, anchor) => {
    if (n1 == null) {
      hostInsert(
        n2.el = hostCreateText(n2.children),
        container,
        anchor
      );
    } else {
      const el = n2.el = n1.el;
      if (n2.children !== n1.children) {
        hostSetText(el, n2.children);
      }
    }
  };
  const processCommentNode = (n1, n2, container, anchor) => {
    if (n1 == null) {
      hostInsert(
        n2.el = hostCreateComment(n2.children || ""),
        container,
        anchor
      );
    } else {
      n2.el = n1.el;
    }
  };
  const mountStaticNode = (n2, container, anchor, namespace) => {
    [n2.el, n2.anchor] = hostInsertStaticContent(
      n2.children,
      container,
      anchor,
      namespace,
      n2.el,
      n2.anchor
    );
  };
  const patchStaticNode = (n1, n2, container, namespace) => {
    if (n2.children !== n1.children) {
      const anchor = hostNextSibling(n1.anchor);
      removeStaticNode(n1);
      [n2.el, n2.anchor] = hostInsertStaticContent(
        n2.children,
        container,
        anchor,
        namespace
      );
    } else {
      n2.el = n1.el;
      n2.anchor = n1.anchor;
    }
  };
  const moveStaticNode = ({ el, anchor }, container, nextSibling) => {
    let next;
    while (el && el !== anchor) {
      next = hostNextSibling(el);
      hostInsert(el, container, nextSibling);
      el = next;
    }
    hostInsert(anchor, container, nextSibling);
  };
  const removeStaticNode = ({ el, anchor }) => {
    let next;
    while (el && el !== anchor) {
      next = hostNextSibling(el);
      hostRemove(el);
      el = next;
    }
    hostRemove(anchor);
  };
  const processElement = (n1, n2, container, anchor, parentComponent, parentSuspense, namespace, slotScopeIds, optimized) => {
    if (n2.type === "svg") {
      namespace = "svg";
    } else if (n2.type === "math") {
      namespace = "mathml";
    }
    if (n1 == null) {
      mountElement(
        n2,
        container,
        anchor,
        parentComponent,
        parentSuspense,
        namespace,
        slotScopeIds,
        optimized
      );
    } else {
      const customElement = n1.el && n1.el._isVueCE ? n1.el : null;
      try {
        if (customElement) {
          customElement._beginPatch();
        }
        patchElement(
          n1,
          n2,
          parentComponent,
          parentSuspense,
          namespace,
          slotScopeIds,
          optimized
        );
      } finally {
        if (customElement) {
          customElement._endPatch();
        }
      }
    }
  };
  const mountElement = (vnode, container, anchor, parentComponent, parentSuspense, namespace, slotScopeIds, optimized) => {
    let el;
    let vnodeHook;
    const { props, shapeFlag, transition, dirs } = vnode;
    el = vnode.el = hostCreateElement(
      vnode.type,
      namespace,
      props && props.is,
      props
    );
    if (shapeFlag & 8) {
      hostSetElementText(el, vnode.children);
    } else if (shapeFlag & 16) {
      mountChildren(
        vnode.children,
        el,
        null,
        parentComponent,
        parentSuspense,
        resolveChildrenNamespace(vnode, namespace),
        slotScopeIds,
        optimized
      );
    }
    if (dirs) {
      invokeDirectiveHook(vnode, null, parentComponent, "created");
    }
    setScopeId(el, vnode, vnode.scopeId, slotScopeIds, parentComponent);
    if (props) {
      for (const key in props) {
        if (key !== "value" && !isReservedProp(key)) {
          hostPatchProp(el, key, null, props[key], namespace, parentComponent);
        }
      }
      if ("value" in props) {
        hostPatchProp(el, "value", null, props.value, namespace);
      }
      if (vnodeHook = props.onVnodeBeforeMount) {
        invokeVNodeHook(vnodeHook, parentComponent, vnode);
      }
    }
    {
      def(el, "__vnode", vnode, true);
      def(el, "__vueParentComponent", parentComponent, true);
    }
    if (dirs) {
      invokeDirectiveHook(vnode, null, parentComponent, "beforeMount");
    }
    const needCallTransitionHooks = needTransition(parentSuspense, transition);
    if (needCallTransitionHooks) {
      transition.beforeEnter(el);
    }
    hostInsert(el, container, anchor);
    if ((vnodeHook = props && props.onVnodeMounted) || needCallTransitionHooks || dirs) {
      const isHmr = isHmrUpdating;
      queuePostRenderEffect(() => {
        let prev;
        prev = setHmrUpdating(isHmr);
        try {
          vnodeHook && invokeVNodeHook(vnodeHook, parentComponent, vnode);
          needCallTransitionHooks && transition.enter(el);
          dirs && invokeDirectiveHook(vnode, null, parentComponent, "mounted");
        } finally {
          setHmrUpdating(prev);
        }
      }, parentSuspense);
    }
  };
  const setScopeId = (el, vnode, scopeId, slotScopeIds, parentComponent) => {
    if (scopeId) {
      hostSetScopeId(el, scopeId);
    }
    if (slotScopeIds) {
      for (let i = 0; i < slotScopeIds.length; i++) {
        hostSetScopeId(el, slotScopeIds[i]);
      }
    }
    if (parentComponent) {
      let subTree = parentComponent.subTree;
      if (subTree.patchFlag > 0 && subTree.patchFlag & 2048) {
        subTree = filterSingleRoot(subTree.children) || subTree;
      }
      if (vnode === subTree || isSuspense(subTree.type) && (subTree.ssContent === vnode || subTree.ssFallback === vnode)) {
        const parentVNode = parentComponent.vnode;
        setScopeId(
          el,
          parentVNode,
          parentVNode.scopeId,
          parentVNode.slotScopeIds,
          parentComponent.parent
        );
      }
    }
  };
  const mountChildren = (children, container, anchor, parentComponent, parentSuspense, namespace, slotScopeIds, optimized, start = 0) => {
    for (let i = start; i < children.length; i++) {
      const child = children[i] = optimized ? cloneIfMounted(children[i]) : normalizeVNode$1(children[i]);
      patch(
        null,
        child,
        container,
        anchor,
        parentComponent,
        parentSuspense,
        namespace,
        slotScopeIds,
        optimized
      );
    }
  };
  const patchElement = (n1, n2, parentComponent, parentSuspense, namespace, slotScopeIds, optimized) => {
    const el = n2.el = n1.el;
    {
      el.__vnode = n2;
    }
    let { patchFlag, dynamicChildren, dirs } = n2;
    patchFlag |= n1.patchFlag & 16;
    const oldProps = n1.props || EMPTY_OBJ;
    const newProps = n2.props || EMPTY_OBJ;
    let vnodeHook;
    parentComponent && toggleRecurse(parentComponent, false);
    if (vnodeHook = newProps.onVnodeBeforeUpdate) {
      invokeVNodeHook(vnodeHook, parentComponent, n2, n1);
    }
    if (dirs) {
      invokeDirectiveHook(n2, n1, parentComponent, "beforeUpdate");
    }
    parentComponent && toggleRecurse(parentComponent, true);
    if (
      // HMR updated, force full diff
      isHmrUpdating || // #6385 the old vnode may be a user-wrapped non-isomorphic block
      // Force full diff when block metadata is unstable.
      dynamicChildren && (!n1.dynamicChildren || n1.dynamicChildren.length !== dynamicChildren.length)
    ) {
      patchFlag = 0;
      optimized = false;
      dynamicChildren = null;
    }
    if (oldProps.innerHTML && newProps.innerHTML == null || oldProps.textContent && newProps.textContent == null) {
      hostSetElementText(el, "");
    }
    if (dynamicChildren) {
      patchBlockChildren(
        n1.dynamicChildren,
        dynamicChildren,
        el,
        parentComponent,
        parentSuspense,
        resolveChildrenNamespace(n2, namespace),
        slotScopeIds
      );
      {
        traverseStaticChildren(n1, n2);
      }
    } else if (!optimized) {
      patchChildren(
        n1,
        n2,
        el,
        null,
        parentComponent,
        parentSuspense,
        resolveChildrenNamespace(n2, namespace),
        slotScopeIds,
        false
      );
    }
    if (patchFlag > 0) {
      if (patchFlag & 16) {
        patchProps(el, oldProps, newProps, parentComponent, namespace);
      } else {
        if (patchFlag & 2) {
          if (oldProps.class !== newProps.class) {
            hostPatchProp(el, "class", null, newProps.class, namespace);
          }
        }
        if (patchFlag & 4) {
          hostPatchProp(el, "style", oldProps.style, newProps.style, namespace);
        }
        if (patchFlag & 8) {
          const propsToUpdate = n2.dynamicProps;
          for (let i = 0; i < propsToUpdate.length; i++) {
            const key = propsToUpdate[i];
            const prev = oldProps[key];
            const next = newProps[key];
            if (next !== prev || key === "value") {
              hostPatchProp(el, key, prev, next, namespace, parentComponent);
            }
          }
        }
      }
      if (patchFlag & 1) {
        if (n1.children !== n2.children) {
          hostSetElementText(el, n2.children);
        }
      }
    } else if (!optimized && dynamicChildren == null) {
      patchProps(el, oldProps, newProps, parentComponent, namespace);
    }
    if ((vnodeHook = newProps.onVnodeUpdated) || dirs) {
      queuePostRenderEffect(() => {
        vnodeHook && invokeVNodeHook(vnodeHook, parentComponent, n2, n1);
        dirs && invokeDirectiveHook(n2, n1, parentComponent, "updated");
      }, parentSuspense);
    }
  };
  const patchBlockChildren = (oldChildren, newChildren, fallbackContainer, parentComponent, parentSuspense, namespace, slotScopeIds) => {
    for (let i = 0; i < newChildren.length; i++) {
      const oldVNode = oldChildren[i];
      const newVNode = newChildren[i];
      const container = (
        // oldVNode may be an errored async setup() component inside Suspense
        // which will not have a mounted element
        oldVNode.el && // - In the case of a Fragment, we need to provide the actual parent
        // of the Fragment itself so it can move its children.
        (oldVNode.type === Fragment || // - In the case of different nodes, there is going to be a replacement
        // which also requires the correct parent container
        !isSameVNodeType(oldVNode, newVNode) || // - In the case of a component, it could contain anything.
        oldVNode.shapeFlag & (6 | 64 | 128)) ? hostParentNode(oldVNode.el) : (
          // In other cases, the parent container is not actually used so we
          // just pass the block element here to avoid a DOM parentNode call.
          fallbackContainer
        )
      );
      patch(
        oldVNode,
        newVNode,
        container,
        null,
        parentComponent,
        parentSuspense,
        namespace,
        slotScopeIds,
        true
      );
    }
  };
  const patchProps = (el, oldProps, newProps, parentComponent, namespace) => {
    if (oldProps !== newProps) {
      if (oldProps !== EMPTY_OBJ) {
        for (const key in oldProps) {
          if (!isReservedProp(key) && !(key in newProps)) {
            hostPatchProp(
              el,
              key,
              oldProps[key],
              null,
              namespace,
              parentComponent
            );
          }
        }
      }
      for (const key in newProps) {
        if (isReservedProp(key)) continue;
        const next = newProps[key];
        const prev = oldProps[key];
        if (next !== prev && key !== "value") {
          hostPatchProp(el, key, prev, next, namespace, parentComponent);
        }
      }
      if ("value" in newProps) {
        hostPatchProp(el, "value", oldProps.value, newProps.value, namespace);
      }
    }
  };
  const processFragment = (n1, n2, container, anchor, parentComponent, parentSuspense, namespace, slotScopeIds, optimized) => {
    const fragmentStartAnchor = n2.el = n1 ? n1.el : hostCreateText("");
    const fragmentEndAnchor = n2.anchor = n1 ? n1.anchor : hostCreateText("");
    let { patchFlag, dynamicChildren, slotScopeIds: fragmentSlotScopeIds } = n2;
    if (// #5523 dev root fragment may inherit directives
    (isHmrUpdating || patchFlag & 2048)) {
      patchFlag = 0;
      optimized = false;
      dynamicChildren = null;
    }
    if (fragmentSlotScopeIds) {
      slotScopeIds = slotScopeIds ? slotScopeIds.concat(fragmentSlotScopeIds) : fragmentSlotScopeIds;
    }
    if (n1 == null) {
      hostInsert(fragmentStartAnchor, container, anchor);
      hostInsert(fragmentEndAnchor, container, anchor);
      mountChildren(
        // #10007
        // such fragment like `<></>` will be compiled into
        // a fragment which doesn't have a children.
        // In this case fallback to an empty array
        n2.children || [],
        container,
        fragmentEndAnchor,
        parentComponent,
        parentSuspense,
        namespace,
        slotScopeIds,
        optimized
      );
    } else {
      if (patchFlag > 0 && patchFlag & 64 && dynamicChildren && // #2715 the previous fragment could've been a BAILed one as a result
      // of renderSlot() with no valid children
      n1.dynamicChildren && n1.dynamicChildren.length === dynamicChildren.length) {
        patchBlockChildren(
          n1.dynamicChildren,
          dynamicChildren,
          container,
          parentComponent,
          parentSuspense,
          namespace,
          slotScopeIds
        );
        {
          traverseStaticChildren(n1, n2);
        }
      } else {
        patchChildren(
          n1,
          n2,
          container,
          fragmentEndAnchor,
          parentComponent,
          parentSuspense,
          namespace,
          slotScopeIds,
          optimized
        );
      }
    }
  };
  const processComponent = (n1, n2, container, anchor, parentComponent, parentSuspense, namespace, slotScopeIds, optimized) => {
    n2.slotScopeIds = slotScopeIds;
    if (n1 == null) {
      if (n2.shapeFlag & 512) {
        parentComponent.ctx.activate(
          n2,
          container,
          anchor,
          namespace,
          optimized
        );
      } else {
        mountComponent(
          n2,
          container,
          anchor,
          parentComponent,
          parentSuspense,
          namespace,
          optimized
        );
      }
    } else {
      updateComponent(n1, n2, optimized);
    }
  };
  const mountComponent = (initialVNode, container, anchor, parentComponent, parentSuspense, namespace, optimized) => {
    const instance = (initialVNode.component = createComponentInstance$1(
      initialVNode,
      parentComponent,
      parentSuspense
    ));
    if (instance.type.__hmrId) {
      registerHMR(instance);
    }
    {
      pushWarningContext$1(initialVNode);
      startMeasure(instance, `mount`);
    }
    if (isKeepAlive(initialVNode)) {
      instance.ctx.renderer = internals;
    }
    {
      {
        startMeasure(instance, `init`);
      }
      setupComponent$1(instance, false, optimized);
      {
        endMeasure(instance, `init`);
      }
    }
    if (isHmrUpdating) initialVNode.el = null;
    if (instance.asyncDep) {
      parentSuspense && parentSuspense.registerDep(instance, setupRenderEffect, optimized);
      if (!initialVNode.el) {
        const placeholder = instance.subTree = createVNode(Comment);
        processCommentNode(null, placeholder, container, anchor);
        initialVNode.placeholder = placeholder.el;
      }
    } else {
      setupRenderEffect(
        instance,
        initialVNode,
        container,
        anchor,
        parentSuspense,
        namespace,
        optimized
      );
    }
    {
      popWarningContext$1();
      endMeasure(instance, `mount`);
    }
  };
  const updateComponent = (n1, n2, optimized) => {
    const instance = n2.component = n1.component;
    if (shouldUpdateComponent(n1, n2, optimized)) {
      if (instance.asyncDep && !instance.asyncResolved) {
        {
          pushWarningContext$1(n2);
        }
        updateComponentPreRender(instance, n2, optimized);
        {
          popWarningContext$1();
        }
        return;
      } else {
        instance.next = n2;
        instance.update();
      }
    } else {
      n2.el = n1.el;
      instance.vnode = n2;
    }
  };
  const setupRenderEffect = (instance, initialVNode, container, anchor, parentSuspense, namespace, optimized) => {
    const componentUpdateFn = () => {
      if (!instance.isMounted) {
        let vnodeHook;
        const { el, props } = initialVNode;
        const { bm, m, parent, root, type } = instance;
        const isAsyncWrapperVNode = isAsyncWrapper(initialVNode);
        toggleRecurse(instance, false);
        if (bm) {
          invokeArrayFns(bm);
        }
        if (!isAsyncWrapperVNode && (vnodeHook = props && props.onVnodeBeforeMount)) {
          invokeVNodeHook(vnodeHook, parent, initialVNode);
        }
        toggleRecurse(instance, true);
        {
          if (root.ce && root.ce._hasShadowRoot()) {
            root.ce._injectChildStyle(
              type,
              instance.parent ? instance.parent.type : void 0
            );
          }
          {
            startMeasure(instance, `render`);
          }
          const subTree = instance.subTree = renderComponentRoot$1(instance);
          {
            endMeasure(instance, `render`);
          }
          {
            startMeasure(instance, `patch`);
          }
          patch(
            null,
            subTree,
            container,
            anchor,
            instance,
            parentSuspense,
            namespace
          );
          {
            endMeasure(instance, `patch`);
          }
          initialVNode.el = subTree.el;
        }
        if (m) {
          queuePostRenderEffect(m, parentSuspense);
        }
        if (!isAsyncWrapperVNode && (vnodeHook = props && props.onVnodeMounted)) {
          const scopedInitialVNode = initialVNode;
          queuePostRenderEffect(
            () => invokeVNodeHook(vnodeHook, parent, scopedInitialVNode),
            parentSuspense
          );
        }
        if (initialVNode.shapeFlag & 256 || parent && isAsyncWrapper(parent.vnode) && parent.vnode.shapeFlag & 256) {
          instance.a && queuePostRenderEffect(instance.a, parentSuspense);
        }
        instance.isMounted = true;
        {
          devtoolsComponentAdded(instance);
        }
        initialVNode = container = anchor = null;
      } else {
        let { next, bu, u, parent, vnode } = instance;
        {
          const nonHydratedAsyncRoot = locateNonHydratedAsyncRoot(instance);
          if (nonHydratedAsyncRoot) {
            if (next) {
              next.el = vnode.el;
              updateComponentPreRender(instance, next, optimized);
            }
            nonHydratedAsyncRoot.asyncDep.then(() => {
              queuePostRenderEffect(() => {
                if (!instance.isUnmounted) update();
              }, parentSuspense);
            });
            return;
          }
        }
        let originNext = next;
        let vnodeHook;
        {
          pushWarningContext$1(next || instance.vnode);
        }
        toggleRecurse(instance, false);
        if (next) {
          next.el = vnode.el;
          updateComponentPreRender(instance, next, optimized);
        } else {
          next = vnode;
        }
        if (bu) {
          invokeArrayFns(bu);
        }
        if (vnodeHook = next.props && next.props.onVnodeBeforeUpdate) {
          invokeVNodeHook(vnodeHook, parent, next, vnode);
        }
        toggleRecurse(instance, true);
        {
          startMeasure(instance, `render`);
        }
        const nextTree = renderComponentRoot$1(instance);
        {
          endMeasure(instance, `render`);
        }
        const prevTree = instance.subTree;
        instance.subTree = nextTree;
        {
          startMeasure(instance, `patch`);
        }
        patch(
          prevTree,
          nextTree,
          // parent may have changed if it's in a teleport
          hostParentNode(prevTree.el),
          // anchor may have changed if it's in a fragment
          getNextHostNode(prevTree),
          instance,
          parentSuspense,
          namespace
        );
        {
          endMeasure(instance, `patch`);
        }
        next.el = nextTree.el;
        if (originNext === null) {
          updateHOCHostEl(instance, nextTree.el);
        }
        if (u) {
          queuePostRenderEffect(u, parentSuspense);
        }
        if (vnodeHook = next.props && next.props.onVnodeUpdated) {
          queuePostRenderEffect(
            () => invokeVNodeHook(vnodeHook, parent, next, vnode),
            parentSuspense
          );
        }
        {
          devtoolsComponentUpdated(instance);
        }
        {
          popWarningContext$1();
        }
      }
    };
    instance.scope.on();
    const effect = instance.effect = new ReactiveEffect(componentUpdateFn);
    instance.scope.off();
    const update = instance.update = effect.run.bind(effect);
    const job = instance.job = effect.runIfDirty.bind(effect);
    job.i = instance;
    job.id = instance.uid;
    effect.scheduler = () => queueJob(job);
    toggleRecurse(instance, true);
    {
      effect.onTrack = instance.rtc ? (e) => invokeArrayFns(instance.rtc, e) : void 0;
      effect.onTrigger = instance.rtg ? (e) => invokeArrayFns(instance.rtg, e) : void 0;
    }
    update();
  };
  const updateComponentPreRender = (instance, nextVNode, optimized) => {
    nextVNode.component = instance;
    const prevProps = instance.vnode.props;
    instance.vnode = nextVNode;
    instance.next = null;
    updateProps(instance, nextVNode.props, prevProps, optimized);
    updateSlots(instance, nextVNode.children, optimized);
    pauseTracking();
    flushPreFlushCbs(instance);
    resetTracking();
  };
  const patchChildren = (n1, n2, container, anchor, parentComponent, parentSuspense, namespace, slotScopeIds, optimized = false) => {
    const c1 = n1 && n1.children;
    const prevShapeFlag = n1 ? n1.shapeFlag : 0;
    const c2 = n2.children;
    const { patchFlag, shapeFlag } = n2;
    if (patchFlag > 0) {
      if (patchFlag & 128) {
        patchKeyedChildren(
          c1,
          c2,
          container,
          anchor,
          parentComponent,
          parentSuspense,
          namespace,
          slotScopeIds,
          optimized
        );
        return;
      } else if (patchFlag & 256) {
        patchUnkeyedChildren(
          c1,
          c2,
          container,
          anchor,
          parentComponent,
          parentSuspense,
          namespace,
          slotScopeIds,
          optimized
        );
        return;
      }
    }
    if (shapeFlag & 8) {
      if (prevShapeFlag & 16) {
        unmountChildren(c1, parentComponent, parentSuspense);
      }
      if (c2 !== c1) {
        hostSetElementText(container, c2);
      }
    } else {
      if (prevShapeFlag & 16) {
        if (shapeFlag & 16) {
          patchKeyedChildren(
            c1,
            c2,
            container,
            anchor,
            parentComponent,
            parentSuspense,
            namespace,
            slotScopeIds,
            optimized
          );
        } else {
          unmountChildren(c1, parentComponent, parentSuspense, true);
        }
      } else {
        if (prevShapeFlag & 8) {
          hostSetElementText(container, "");
        }
        if (shapeFlag & 16) {
          mountChildren(
            c2,
            container,
            anchor,
            parentComponent,
            parentSuspense,
            namespace,
            slotScopeIds,
            optimized
          );
        }
      }
    }
  };
  const patchUnkeyedChildren = (c1, c2, container, anchor, parentComponent, parentSuspense, namespace, slotScopeIds, optimized) => {
    c1 = c1 || EMPTY_ARR;
    c2 = c2 || EMPTY_ARR;
    const oldLength = c1.length;
    const newLength = c2.length;
    const commonLength = Math.min(oldLength, newLength);
    let i;
    for (i = 0; i < commonLength; i++) {
      const nextChild = c2[i] = optimized ? cloneIfMounted(c2[i]) : normalizeVNode$1(c2[i]);
      patch(
        c1[i],
        nextChild,
        container,
        null,
        parentComponent,
        parentSuspense,
        namespace,
        slotScopeIds,
        optimized
      );
    }
    if (oldLength > newLength) {
      unmountChildren(
        c1,
        parentComponent,
        parentSuspense,
        true,
        false,
        commonLength
      );
    } else {
      mountChildren(
        c2,
        container,
        anchor,
        parentComponent,
        parentSuspense,
        namespace,
        slotScopeIds,
        optimized,
        commonLength
      );
    }
  };
  const patchKeyedChildren = (c1, c2, container, parentAnchor, parentComponent, parentSuspense, namespace, slotScopeIds, optimized) => {
    let i = 0;
    const l2 = c2.length;
    let e1 = c1.length - 1;
    let e2 = l2 - 1;
    while (i <= e1 && i <= e2) {
      const n1 = c1[i];
      const n2 = c2[i] = optimized ? cloneIfMounted(c2[i]) : normalizeVNode$1(c2[i]);
      if (isSameVNodeType(n1, n2)) {
        patch(
          n1,
          n2,
          container,
          null,
          parentComponent,
          parentSuspense,
          namespace,
          slotScopeIds,
          optimized
        );
      } else {
        break;
      }
      i++;
    }
    while (i <= e1 && i <= e2) {
      const n1 = c1[e1];
      const n2 = c2[e2] = optimized ? cloneIfMounted(c2[e2]) : normalizeVNode$1(c2[e2]);
      if (isSameVNodeType(n1, n2)) {
        patch(
          n1,
          n2,
          container,
          null,
          parentComponent,
          parentSuspense,
          namespace,
          slotScopeIds,
          optimized
        );
      } else {
        break;
      }
      e1--;
      e2--;
    }
    if (i > e1) {
      if (i <= e2) {
        const nextPos = e2 + 1;
        const anchor = nextPos < l2 ? c2[nextPos].el : parentAnchor;
        while (i <= e2) {
          patch(
            null,
            c2[i] = optimized ? cloneIfMounted(c2[i]) : normalizeVNode$1(c2[i]),
            container,
            anchor,
            parentComponent,
            parentSuspense,
            namespace,
            slotScopeIds,
            optimized
          );
          i++;
        }
      }
    } else if (i > e2) {
      while (i <= e1) {
        unmount(c1[i], parentComponent, parentSuspense, true);
        i++;
      }
    } else {
      const s1 = i;
      const s2 = i;
      const keyToNewIndexMap = /* @__PURE__ */ new Map();
      for (i = s2; i <= e2; i++) {
        const nextChild = c2[i] = optimized ? cloneIfMounted(c2[i]) : normalizeVNode$1(c2[i]);
        if (nextChild.key != null) {
          if (keyToNewIndexMap.has(nextChild.key)) {
            warn$1(
              `Duplicate keys found during update:`,
              JSON.stringify(nextChild.key),
              `Make sure keys are unique.`
            );
          }
          keyToNewIndexMap.set(nextChild.key, i);
        }
      }
      let j;
      let patched = 0;
      const toBePatched = e2 - s2 + 1;
      let moved = false;
      let maxNewIndexSoFar = 0;
      const newIndexToOldIndexMap = new Array(toBePatched);
      for (i = 0; i < toBePatched; i++) newIndexToOldIndexMap[i] = 0;
      for (i = s1; i <= e1; i++) {
        const prevChild = c1[i];
        if (patched >= toBePatched) {
          unmount(prevChild, parentComponent, parentSuspense, true);
          continue;
        }
        let newIndex;
        if (prevChild.key != null) {
          newIndex = keyToNewIndexMap.get(prevChild.key);
        } else {
          for (j = s2; j <= e2; j++) {
            if (newIndexToOldIndexMap[j - s2] === 0 && isSameVNodeType(prevChild, c2[j])) {
              newIndex = j;
              break;
            }
          }
        }
        if (newIndex === void 0) {
          unmount(prevChild, parentComponent, parentSuspense, true);
        } else {
          newIndexToOldIndexMap[newIndex - s2] = i + 1;
          if (newIndex >= maxNewIndexSoFar) {
            maxNewIndexSoFar = newIndex;
          } else {
            moved = true;
          }
          patch(
            prevChild,
            c2[newIndex],
            container,
            null,
            parentComponent,
            parentSuspense,
            namespace,
            slotScopeIds,
            optimized
          );
          patched++;
        }
      }
      const increasingNewIndexSequence = moved ? getSequence(newIndexToOldIndexMap) : EMPTY_ARR;
      j = increasingNewIndexSequence.length - 1;
      for (i = toBePatched - 1; i >= 0; i--) {
        const nextIndex = s2 + i;
        const nextChild = c2[nextIndex];
        const anchorVNode = c2[nextIndex + 1];
        const anchor = nextIndex + 1 < l2 ? (
          // #13559, #14173 fallback to el placeholder for unresolved async component
          anchorVNode.el || resolveAsyncComponentPlaceholder(anchorVNode)
        ) : parentAnchor;
        if (newIndexToOldIndexMap[i] === 0) {
          patch(
            null,
            nextChild,
            container,
            anchor,
            parentComponent,
            parentSuspense,
            namespace,
            slotScopeIds,
            optimized
          );
        } else if (moved) {
          if (j < 0 || i !== increasingNewIndexSequence[j]) {
            move(nextChild, container, anchor, 2);
          } else {
            j--;
          }
        }
      }
    }
  };
  const move = (vnode, container, anchor, moveType, parentSuspense = null) => {
    const { el, type, transition, children, shapeFlag } = vnode;
    if (shapeFlag & 6) {
      move(vnode.component.subTree, container, anchor, moveType);
      return;
    }
    if (shapeFlag & 128) {
      vnode.suspense.move(container, anchor, moveType);
      return;
    }
    if (shapeFlag & 64) {
      type.move(vnode, container, anchor, internals);
      return;
    }
    if (type === Fragment) {
      hostInsert(el, container, anchor);
      for (let i = 0; i < children.length; i++) {
        move(children[i], container, anchor, moveType);
      }
      hostInsert(vnode.anchor, container, anchor);
      return;
    }
    if (type === Static) {
      moveStaticNode(vnode, container, anchor);
      return;
    }
    const needTransition2 = moveType !== 2 && shapeFlag & 1 && transition;
    if (needTransition2) {
      if (moveType === 0) {
        if (transition.persisted && !el[leaveCbKey]) {
          hostInsert(el, container, anchor);
        } else {
          transition.beforeEnter(el);
          hostInsert(el, container, anchor);
          queuePostRenderEffect(() => transition.enter(el), parentSuspense);
        }
      } else {
        const { leave, delayLeave, afterLeave } = transition;
        const remove2 = () => {
          if (vnode.ctx.isUnmounted) {
            hostRemove(el);
          } else {
            hostInsert(el, container, anchor);
          }
        };
        const performLeave = () => {
          const wasLeaving = el._isLeaving || !!el[leaveCbKey];
          if (el._isLeaving) {
            el[leaveCbKey](
              true
              /* cancelled */
            );
          }
          if (transition.persisted && !wasLeaving) {
            remove2();
          } else {
            leave(el, () => {
              remove2();
              afterLeave && afterLeave();
            });
          }
        };
        if (delayLeave) {
          delayLeave(el, remove2, performLeave);
        } else {
          performLeave();
        }
      }
    } else {
      hostInsert(el, container, anchor);
    }
  };
  const unmount = (vnode, parentComponent, parentSuspense, doRemove = false, optimized = false) => {
    const {
      type,
      props,
      ref,
      children,
      dynamicChildren,
      shapeFlag,
      patchFlag,
      dirs,
      cacheIndex,
      memo
    } = vnode;
    if (patchFlag === -2) {
      optimized = false;
    }
    if (ref != null) {
      pauseTracking();
      setRef(ref, null, parentSuspense, vnode, true);
      resetTracking();
    }
    if (cacheIndex != null) {
      parentComponent.renderCache[cacheIndex] = void 0;
    }
    if (shapeFlag & 256) {
      parentComponent.ctx.deactivate(vnode);
      return;
    }
    const shouldInvokeDirs = shapeFlag & 1 && dirs;
    const shouldInvokeVnodeHook = !isAsyncWrapper(vnode);
    let vnodeHook;
    if (shouldInvokeVnodeHook && (vnodeHook = props && props.onVnodeBeforeUnmount)) {
      invokeVNodeHook(vnodeHook, parentComponent, vnode);
    }
    if (shapeFlag & 6) {
      unmountComponent(vnode.component, parentSuspense, doRemove);
    } else {
      if (shapeFlag & 128) {
        vnode.suspense.unmount(parentSuspense, doRemove);
        return;
      }
      if (shouldInvokeDirs) {
        invokeDirectiveHook(vnode, null, parentComponent, "beforeUnmount");
      }
      if (shapeFlag & 64) {
        vnode.type.remove(
          vnode,
          parentComponent,
          parentSuspense,
          internals,
          doRemove
        );
      } else if (dynamicChildren && // #5154
      // when v-once is used inside a block, setBlockTracking(-1) marks the
      // parent block with hasOnce: true
      // so that it doesn't take the fast path during unmount - otherwise
      // components nested in v-once are never unmounted.
      !dynamicChildren.hasOnce && // #1153: fast path should not be taken for non-stable (v-for) fragments
      (type !== Fragment || patchFlag > 0 && patchFlag & 64)) {
        unmountChildren(
          dynamicChildren,
          parentComponent,
          parentSuspense,
          false,
          true
        );
      } else if (type === Fragment && patchFlag & (128 | 256) || !optimized && shapeFlag & 16) {
        unmountChildren(children, parentComponent, parentSuspense);
      }
      if (doRemove) {
        remove(vnode);
      }
    }
    const shouldInvalidateMemo = memo != null && cacheIndex == null;
    if (shouldInvokeVnodeHook && (vnodeHook = props && props.onVnodeUnmounted) || shouldInvokeDirs || shouldInvalidateMemo) {
      queuePostRenderEffect(() => {
        vnodeHook && invokeVNodeHook(vnodeHook, parentComponent, vnode);
        shouldInvokeDirs && invokeDirectiveHook(vnode, null, parentComponent, "unmounted");
        if (shouldInvalidateMemo) {
          vnode.el = null;
        }
      }, parentSuspense);
    }
  };
  const remove = (vnode) => {
    const { type, el, anchor, transition } = vnode;
    if (type === Fragment) {
      if (vnode.patchFlag > 0 && vnode.patchFlag & 2048 && transition && !transition.persisted) {
        vnode.children.forEach((child) => {
          if (child.type === Comment) {
            hostRemove(child.el);
          } else {
            remove(child);
          }
        });
      } else {
        removeFragment(el, anchor);
      }
      return;
    }
    if (type === Static) {
      removeStaticNode(vnode);
      return;
    }
    const performRemove = () => {
      hostRemove(el);
      if (transition && !transition.persisted && transition.afterLeave) {
        transition.afterLeave();
      }
    };
    if (vnode.shapeFlag & 1 && transition && !transition.persisted) {
      const { leave, delayLeave } = transition;
      const performLeave = () => leave(el, performRemove);
      if (delayLeave) {
        delayLeave(vnode.el, performRemove, performLeave);
      } else {
        performLeave();
      }
    } else {
      performRemove();
    }
  };
  const removeFragment = (cur, end) => {
    let next;
    while (cur !== end) {
      next = hostNextSibling(cur);
      hostRemove(cur);
      cur = next;
    }
    hostRemove(end);
  };
  const unmountComponent = (instance, parentSuspense, doRemove) => {
    if (instance.type.__hmrId) {
      unregisterHMR(instance);
    }
    const { bum, scope, job, subTree, um, m, a } = instance;
    invalidateMount(m);
    invalidateMount(a);
    if (bum) {
      invokeArrayFns(bum);
    }
    scope.stop();
    if (job) {
      job.flags |= 8;
      unmount(subTree, instance, parentSuspense, doRemove);
    }
    if (um) {
      queuePostRenderEffect(um, parentSuspense);
    }
    queuePostRenderEffect(() => {
      instance.isUnmounted = true;
    }, parentSuspense);
    {
      devtoolsComponentRemoved(instance);
    }
  };
  const unmountChildren = (children, parentComponent, parentSuspense, doRemove = false, optimized = false, start = 0) => {
    for (let i = start; i < children.length; i++) {
      unmount(children[i], parentComponent, parentSuspense, doRemove, optimized);
    }
  };
  const getNextHostNode = (vnode) => {
    if (vnode.shapeFlag & 6) {
      return getNextHostNode(vnode.component.subTree);
    }
    if (vnode.shapeFlag & 128) {
      return vnode.suspense.next();
    }
    const el = hostNextSibling(vnode.anchor || vnode.el);
    const teleportEnd = el && el[TeleportEndKey];
    return teleportEnd ? hostNextSibling(teleportEnd) : el;
  };
  let isFlushing = false;
  const render = (vnode, container, namespace) => {
    let instance;
    if (vnode == null) {
      if (container._vnode) {
        unmount(container._vnode, null, null, true);
        instance = container._vnode.component;
      }
    } else {
      patch(
        container._vnode || null,
        vnode,
        container,
        null,
        null,
        null,
        namespace
      );
    }
    container._vnode = vnode;
    if (!isFlushing) {
      isFlushing = true;
      flushPreFlushCbs(instance);
      flushPostFlushCbs();
      isFlushing = false;
    }
  };
  const internals = {
    p: patch,
    um: unmount,
    m: move,
    r: remove,
    mt: mountComponent,
    mc: mountChildren,
    pc: patchChildren,
    pbc: patchBlockChildren,
    n: getNextHostNode,
    o: options
  };
  let hydrate;
  return {
    render,
    hydrate,
    createApp: createAppAPI(render)
  };
}
function resolveChildrenNamespace({ type, props }, currentNamespace) {
  return currentNamespace === "svg" && type === "foreignObject" || currentNamespace === "mathml" && type === "annotation-xml" && props && props.encoding && props.encoding.includes("html") ? void 0 : currentNamespace;
}
function toggleRecurse({ effect, job }, allowed) {
  if (allowed) {
    effect.flags |= 32;
    job.flags |= 4;
  } else {
    effect.flags &= -33;
    job.flags &= -5;
  }
}
function needTransition(parentSuspense, transition) {
  return (!parentSuspense || parentSuspense && !parentSuspense.pendingBranch) && transition && !transition.persisted;
}
function traverseStaticChildren(n1, n2, shallow = false) {
  const ch1 = n1.children;
  const ch2 = n2.children;
  if (isArray(ch1) && isArray(ch2)) {
    for (let i = 0; i < ch1.length; i++) {
      const c1 = ch1[i];
      let c2 = ch2[i];
      if (c2.shapeFlag & 1 && !c2.dynamicChildren) {
        if (c2.patchFlag <= 0 || c2.patchFlag === 32) {
          c2 = ch2[i] = cloneIfMounted(ch2[i]);
          c2.el = c1.el;
        }
        if (!shallow && c2.patchFlag !== -2)
          traverseStaticChildren(c1, c2);
      }
      if (c2.type === Text) {
        if (c2.patchFlag === -1) {
          c2 = ch2[i] = cloneIfMounted(c2);
        }
        c2.el = c1.el;
      }
      if (c2.type === Comment && !c2.el) {
        c2.el = c1.el;
      }
      {
        c2.el && (c2.el.__vnode = c2);
      }
    }
  }
}
function getSequence(arr) {
  const p = arr.slice();
  const result = [0];
  let i, j, u, v, c;
  const len = arr.length;
  for (i = 0; i < len; i++) {
    const arrI = arr[i];
    if (arrI !== 0) {
      j = result[result.length - 1];
      if (arr[j] < arrI) {
        p[i] = j;
        result.push(i);
        continue;
      }
      u = 0;
      v = result.length - 1;
      while (u < v) {
        c = u + v >> 1;
        if (arr[result[c]] < arrI) {
          u = c + 1;
        } else {
          v = c;
        }
      }
      if (arrI < arr[result[u]]) {
        if (u > 0) {
          p[i] = result[u - 1];
        }
        result[u] = i;
      }
    }
  }
  u = result.length;
  v = result[u - 1];
  while (u-- > 0) {
    result[u] = v;
    v = p[v];
  }
  return result;
}
function locateNonHydratedAsyncRoot(instance) {
  const subComponent = instance.subTree.component;
  if (subComponent) {
    if (subComponent.asyncDep && !subComponent.asyncResolved) {
      return subComponent;
    } else {
      return locateNonHydratedAsyncRoot(subComponent);
    }
  }
}
function invalidateMount(hooks) {
  if (hooks) {
    for (let i = 0; i < hooks.length; i++)
      hooks[i].flags |= 8;
  }
}
function resolveAsyncComponentPlaceholder(anchorVnode) {
  if (anchorVnode.placeholder) {
    return anchorVnode.placeholder;
  }
  const instance = anchorVnode.component;
  if (instance) {
    return resolveAsyncComponentPlaceholder(instance.subTree);
  }
  return null;
}

const isSuspense = (type) => type.__isSuspense;
function queueEffectWithSuspense(fn, suspense) {
  if (suspense && suspense.pendingBranch) {
    if (isArray(fn)) {
      suspense.effects.push(...fn);
    } else {
      suspense.effects.push(fn);
    }
  } else {
    queuePostFlushCb(fn);
  }
}

const Fragment = /* @__PURE__ */ Symbol.for("v-fgt");
const Text = /* @__PURE__ */ Symbol.for("v-txt");
const Comment = /* @__PURE__ */ Symbol.for("v-cmt");
const Static = /* @__PURE__ */ Symbol.for("v-stc");
const blockStack = [];
let currentBlock = null;
function closeBlock() {
  blockStack.pop();
  currentBlock = blockStack[blockStack.length - 1] || null;
}
let isBlockTreeEnabled = 1;
function setBlockTracking(value, inVOnce = false) {
  isBlockTreeEnabled += value;
  if (value < 0 && currentBlock && inVOnce) {
    currentBlock.hasOnce = true;
  }
}
function isVNode(value) {
  return value ? value.__v_isVNode === true : false;
}
function isSameVNodeType(n1, n2) {
  if (n2.shapeFlag & 6 && n1.component) {
    const dirtyInstances = hmrDirtyComponents.get(n2.type);
    if (dirtyInstances && dirtyInstances.has(n1.component)) {
      n1.shapeFlag &= -257;
      n2.shapeFlag &= -513;
      return false;
    }
  }
  return n1.type === n2.type && n1.key === n2.key;
}
const createVNodeWithArgsTransform = (...args) => {
  return _createVNode(
    ...args
  );
};
const normalizeKey = ({ key }) => key != null ? key : null;
const normalizeRef = ({
  ref,
  ref_key,
  ref_for
}) => {
  if (typeof ref === "number") {
    ref = "" + ref;
  }
  return ref != null ? isString(ref) || isRef(ref) || isFunction(ref) ? { i: currentRenderingInstance, r: ref, k: ref_key, f: !!ref_for } : ref : null;
};
function createBaseVNode(type, props = null, children = null, patchFlag = 0, dynamicProps = null, shapeFlag = type === Fragment ? 0 : 1, isBlockNode = false, needFullChildrenNormalization = false) {
  const vnode = {
    __v_isVNode: true,
    __v_skip: true,
    type,
    props,
    key: props && normalizeKey(props),
    ref: props && normalizeRef(props),
    scopeId: currentScopeId,
    slotScopeIds: null,
    children,
    component: null,
    suspense: null,
    ssContent: null,
    ssFallback: null,
    dirs: null,
    transition: null,
    el: null,
    anchor: null,
    target: null,
    targetStart: null,
    targetAnchor: null,
    staticCount: 0,
    shapeFlag,
    patchFlag,
    dynamicProps,
    dynamicChildren: null,
    appContext: null,
    ctx: currentRenderingInstance
  };
  if (needFullChildrenNormalization) {
    normalizeChildren(vnode, children);
    if (shapeFlag & 128) {
      type.normalize(vnode);
    }
  } else if (children) {
    vnode.shapeFlag |= isString(children) ? 8 : 16;
  }
  if (vnode.key !== vnode.key) {
    warn$1(`VNode created with invalid key (NaN). VNode type:`, vnode.type);
  }
  if (props && vnode.shapeFlag & 1) {
    const overwritingProp = props.innerHTML != null ? "innerHTML" : props.textContent != null ? "textContent" : null;
    if (overwritingProp && hasContentChildren(vnode.children)) {
      warn$1(
        `The \`${overwritingProp}\` prop on <${vnode.type}> will override its children. Remove either the \`${overwritingProp}\` prop or the children.`
      );
    }
  }
  if (isBlockTreeEnabled > 0 && // avoid a block node from tracking itself
  !isBlockNode && // has current parent block
  currentBlock && // presence of a patch flag indicates this node needs patching on updates.
  // component nodes also should always be patched, because even if the
  // component doesn't need to update, it needs to persist the instance on to
  // the next vnode so that it can be properly unmounted later.
  (vnode.patchFlag > 0 || shapeFlag & 6) && // the EVENTS flag is only for hydration and if it is the only flag, the
  // vnode should not be considered dynamic due to handler caching.
  vnode.patchFlag !== 32) {
    currentBlock.push(vnode);
  }
  return vnode;
}
function hasContentChildren(children) {
  if (isString(children)) return children !== "";
  if (isArray(children)) return children.length > 0;
  return false;
}
const createVNode = createVNodeWithArgsTransform ;
function _createVNode(type, props = null, children = null, patchFlag = 0, dynamicProps = null, isBlockNode = false) {
  if (!type || type === NULL_DYNAMIC_COMPONENT) {
    if (!type) {
      warn$1(`Invalid vnode type when creating vnode: ${type}.`);
    }
    type = Comment;
  }
  if (isVNode(type)) {
    const cloned = cloneVNode(
      type,
      props,
      true
      /* mergeRef: true */
    );
    if (children) {
      normalizeChildren(cloned, children);
    }
    if (isBlockTreeEnabled > 0 && !isBlockNode && currentBlock) {
      if (cloned.shapeFlag & 6) {
        currentBlock[currentBlock.indexOf(type)] = cloned;
      } else {
        currentBlock.push(cloned);
      }
    }
    cloned.patchFlag = -2;
    return cloned;
  }
  if (isClassComponent(type)) {
    type = type.__vccOpts;
  }
  if (props) {
    props = guardReactiveProps(props);
    let { class: klass, style } = props;
    if (klass && !isString(klass)) {
      props.class = normalizeClass(klass);
    }
    if (isObject(style)) {
      if (isProxy(style) && !isArray(style)) {
        style = extend({}, style);
      }
      props.style = normalizeStyle(style);
    }
  }
  const shapeFlag = isString(type) ? 1 : isSuspense(type) ? 128 : isTeleport(type) ? 64 : isObject(type) ? 4 : isFunction(type) ? 2 : 0;
  if (shapeFlag & 4 && isProxy(type)) {
    type = toRaw(type);
    warn$1(
      `Vue received a Component that was made a reactive object. This can lead to unnecessary performance overhead and should be avoided by marking the component with \`markRaw\` or using \`shallowRef\` instead of \`ref\`.`,
      `
Component that was made reactive: `,
      type
    );
  }
  return createBaseVNode(
    type,
    props,
    children,
    patchFlag,
    dynamicProps,
    shapeFlag,
    isBlockNode,
    true
  );
}
function guardReactiveProps(props) {
  if (!props) return null;
  return isProxy(props) || isInternalObject(props) ? extend({}, props) : props;
}
function cloneVNode(vnode, extraProps, mergeRef = false, cloneTransition = false) {
  const { props, ref, patchFlag, children, transition } = vnode;
  const mergedProps = extraProps ? mergeProps(props || {}, extraProps) : props;
  const cloned = {
    __v_isVNode: true,
    __v_skip: true,
    type: vnode.type,
    props: mergedProps,
    key: mergedProps && normalizeKey(mergedProps),
    ref: extraProps && extraProps.ref ? (
      // #2078 in the case of <component :is="vnode" ref="extra"/>
      // if the vnode itself already has a ref, cloneVNode will need to merge
      // the refs so the single vnode can be set on multiple refs
      mergeRef && ref ? isArray(ref) ? ref.concat(normalizeRef(extraProps)) : [ref, normalizeRef(extraProps)] : normalizeRef(extraProps)
    ) : ref,
    scopeId: vnode.scopeId,
    slotScopeIds: vnode.slotScopeIds,
    children: patchFlag === -1 && isArray(children) ? children.map(deepCloneVNode) : children,
    target: vnode.target,
    targetStart: vnode.targetStart,
    targetAnchor: vnode.targetAnchor,
    staticCount: vnode.staticCount,
    shapeFlag: vnode.shapeFlag,
    // if the vnode is cloned with extra props, we can no longer assume its
    // existing patch flag to be reliable and need to add the FULL_PROPS flag.
    // note: preserve flag for fragments since they use the flag for children
    // fast paths only.
    patchFlag: extraProps && vnode.type !== Fragment ? patchFlag === -1 ? 16 : patchFlag | 16 : patchFlag,
    dynamicProps: vnode.dynamicProps,
    dynamicChildren: vnode.dynamicChildren,
    appContext: vnode.appContext,
    dirs: vnode.dirs,
    transition,
    // These should technically only be non-null on mounted VNodes. However,
    // they *should* be copied for kept-alive vnodes. So we just always copy
    // them since them being non-null during a mount doesn't affect the logic as
    // they will simply be overwritten.
    component: vnode.component,
    suspense: vnode.suspense,
    ssContent: vnode.ssContent && cloneVNode(vnode.ssContent),
    ssFallback: vnode.ssFallback && cloneVNode(vnode.ssFallback),
    placeholder: vnode.placeholder,
    el: vnode.el,
    anchor: vnode.anchor,
    ctx: vnode.ctx,
    ce: vnode.ce
  };
  if (transition && cloneTransition) {
    setTransitionHooks(
      cloned,
      transition.clone(cloned)
    );
  }
  return cloned;
}
function deepCloneVNode(vnode) {
  const cloned = cloneVNode(vnode);
  if (isArray(vnode.children)) {
    cloned.children = vnode.children.map(deepCloneVNode);
  }
  return cloned;
}
function createTextVNode(text = " ", flag = 0) {
  return createVNode(Text, null, text, flag);
}
function normalizeVNode$1(child) {
  if (child == null || typeof child === "boolean") {
    return createVNode(Comment);
  } else if (isArray(child)) {
    return createVNode(
      Fragment,
      null,
      // #3666, avoid reference pollution when reusing vnode
      child.slice()
    );
  } else if (isVNode(child)) {
    return cloneIfMounted(child);
  } else {
    return createVNode(Text, null, String(child));
  }
}
function cloneIfMounted(child) {
  return child.el === null && child.patchFlag !== -1 || child.memo ? child : cloneVNode(child);
}
function normalizeChildren(vnode, children) {
  let type = 0;
  const { shapeFlag } = vnode;
  if (children == null) {
    children = null;
  } else if (isArray(children)) {
    type = 16;
  } else if (typeof children === "object") {
    if (shapeFlag & (1 | 64)) {
      const slot = children.default;
      if (slot) {
        slot._c && (slot._d = false);
        normalizeChildren(vnode, slot());
        slot._c && (slot._d = true);
      }
      return;
    } else {
      type = 32;
      const slotFlag = children._;
      if (!slotFlag && !isInternalObject(children)) {
        children._ctx = currentRenderingInstance;
      } else if (slotFlag === 3 && currentRenderingInstance) {
        if (currentRenderingInstance.slots._ === 1) {
          children._ = 1;
        } else {
          children._ = 2;
          vnode.patchFlag |= 1024;
        }
      }
    }
  } else if (isFunction(children)) {
    if (shapeFlag & (1 | 64)) {
      normalizeChildren(vnode, { default: children });
      return;
    }
    children = { default: children, _ctx: currentRenderingInstance };
    type = 32;
  } else {
    children = String(children);
    if (shapeFlag & 64) {
      type = 16;
      children = [createTextVNode(children)];
    } else {
      type = 8;
    }
  }
  vnode.children = children;
  vnode.shapeFlag |= type;
}
function mergeProps(...args) {
  const ret = {};
  for (let i = 0; i < args.length; i++) {
    const toMerge = args[i];
    for (const key in toMerge) {
      if (key === "class") {
        if (ret.class !== toMerge.class) {
          ret.class = normalizeClass([ret.class, toMerge.class]);
        }
      } else if (key === "style") {
        ret.style = normalizeStyle([ret.style, toMerge.style]);
      } else if (isOn(key)) {
        const existing = ret[key];
        const incoming = toMerge[key];
        if (incoming && existing !== incoming && !(isArray(existing) && existing.includes(incoming))) {
          ret[key] = existing ? [].concat(existing, incoming) : incoming;
        } else if (incoming == null && existing == null && // mergeProps({ 'onUpdate:modelValue': undefined }) should not retain
        // the model listener.
        !isModelListener(key)) {
          ret[key] = incoming;
        }
      } else if (key !== "") {
        ret[key] = toMerge[key];
      }
    }
  }
  return ret;
}
function invokeVNodeHook(hook, instance, vnode, prevVNode = null) {
  callWithAsyncErrorHandling(hook, instance, 7, [
    vnode,
    prevVNode
  ]);
}

const emptyAppContext = createAppContext();
let uid = 0;
function createComponentInstance$1(vnode, parent, suspense) {
  const type = vnode.type;
  const appContext = (parent ? parent.appContext : vnode.appContext) || emptyAppContext;
  const instance = {
    uid: uid++,
    vnode,
    type,
    parent,
    appContext,
    root: null,
    // to be immediately set
    next: null,
    subTree: null,
    // will be set synchronously right after creation
    effect: null,
    update: null,
    // will be set synchronously right after creation
    job: null,
    scope: new EffectScope(
      true
      /* detached */
    ),
    render: null,
    proxy: null,
    exposed: null,
    exposeProxy: null,
    withProxy: null,
    provides: parent ? parent.provides : Object.create(appContext.provides),
    ids: parent ? parent.ids : ["", 0, 0],
    accessCache: null,
    renderCache: [],
    // local resolved assets
    components: null,
    directives: null,
    // resolved props and emits options
    propsOptions: normalizePropsOptions(type, appContext),
    emitsOptions: normalizeEmitsOptions(type, appContext),
    // emit
    emit: null,
    // to be set immediately
    emitted: null,
    // props default value
    propsDefaults: EMPTY_OBJ,
    // inheritAttrs
    inheritAttrs: type.inheritAttrs,
    // state
    ctx: EMPTY_OBJ,
    data: EMPTY_OBJ,
    props: EMPTY_OBJ,
    attrs: EMPTY_OBJ,
    slots: EMPTY_OBJ,
    refs: EMPTY_OBJ,
    setupState: EMPTY_OBJ,
    setupContext: null,
    // suspense related
    suspense,
    suspenseId: suspense ? suspense.pendingId : 0,
    asyncDep: null,
    asyncResolved: false,
    // lifecycle hooks
    // not using enums here because it results in computed properties
    isMounted: false,
    isUnmounted: false,
    isDeactivated: false,
    bc: null,
    c: null,
    bm: null,
    m: null,
    bu: null,
    u: null,
    um: null,
    bum: null,
    da: null,
    a: null,
    rtg: null,
    rtc: null,
    ec: null,
    sp: null
  };
  {
    instance.ctx = createDevRenderContext(instance);
  }
  instance.root = parent ? parent.root : instance;
  instance.emit = emit.bind(null, instance);
  if (vnode.ce) {
    vnode.ce(instance);
  }
  return instance;
}
let currentInstance = null;
const getCurrentInstance = () => currentInstance || currentRenderingInstance;
let internalSetCurrentInstance;
let setInSSRSetupState;
{
  const g = getGlobalThis();
  const registerGlobalSetter = (key, setter) => {
    let setters;
    if (!(setters = g[key])) setters = g[key] = [];
    setters.push(setter);
    return (v) => {
      if (setters.length > 1) setters.forEach((set) => set(v));
      else setters[0](v);
    };
  };
  internalSetCurrentInstance = registerGlobalSetter(
    `__VUE_INSTANCE_SETTERS__`,
    (v) => currentInstance = v
  );
  setInSSRSetupState = registerGlobalSetter(
    `__VUE_SSR_SETTERS__`,
    (v) => isInSSRComponentSetup = v
  );
}
const setCurrentInstance = (instance) => {
  const prev = currentInstance;
  internalSetCurrentInstance(instance);
  instance.scope.on();
  return () => {
    instance.scope.off();
    internalSetCurrentInstance(prev);
  };
};
const unsetCurrentInstance = () => {
  currentInstance && currentInstance.scope.off();
  internalSetCurrentInstance(null);
};
const isBuiltInTag = /* @__PURE__ */ makeMap("slot,component");
function validateComponentName(name, { isNativeTag }) {
  if (isBuiltInTag(name) || isNativeTag(name)) {
    warn$1(
      "Do not use built-in or reserved HTML elements as component id: " + name
    );
  }
}
function isStatefulComponent(instance) {
  return instance.vnode.shapeFlag & 4;
}
let isInSSRComponentSetup = false;
function setupComponent$1(instance, isSSR = false, optimized = false) {
  isSSR && setInSSRSetupState(isSSR);
  const { props, children } = instance.vnode;
  const isStateful = isStatefulComponent(instance);
  initProps(instance, props, isStateful, isSSR);
  initSlots(instance, children, optimized || isSSR);
  const setupResult = isStateful ? setupStatefulComponent(instance, isSSR) : void 0;
  isSSR && setInSSRSetupState(false);
  return setupResult;
}
function setupStatefulComponent(instance, isSSR) {
  const Component = instance.type;
  {
    if (Component.name) {
      validateComponentName(Component.name, instance.appContext.config);
    }
    if (Component.components) {
      const names = Object.keys(Component.components);
      for (let i = 0; i < names.length; i++) {
        validateComponentName(names[i], instance.appContext.config);
      }
    }
    if (Component.directives) {
      const names = Object.keys(Component.directives);
      for (let i = 0; i < names.length; i++) {
        validateDirectiveName(names[i]);
      }
    }
    if (Component.compilerOptions && isRuntimeOnly()) {
      warn$1(
        `"compilerOptions" is only supported when using a build of Vue that includes the runtime compiler. Since you are using a runtime-only build, the options should be passed via your build tool config instead.`
      );
    }
  }
  instance.accessCache = /* @__PURE__ */ Object.create(null);
  instance.proxy = new Proxy(instance.ctx, PublicInstanceProxyHandlers);
  {
    exposePropsOnRenderContext(instance);
  }
  const { setup } = Component;
  if (setup) {
    pauseTracking();
    const setupContext = instance.setupContext = setup.length > 1 ? createSetupContext(instance) : null;
    const reset = setCurrentInstance(instance);
    const setupResult = callWithErrorHandling(
      setup,
      instance,
      0,
      [
        shallowReadonly(instance.props) ,
        setupContext
      ]
    );
    const isAsyncSetup = isPromise(setupResult);
    resetTracking();
    reset();
    if ((isAsyncSetup || instance.sp) && !isAsyncWrapper(instance)) {
      markAsyncBoundary(instance);
    }
    if (isAsyncSetup) {
      setupResult.then(unsetCurrentInstance, unsetCurrentInstance);
      if (isSSR) {
        return setupResult.then((resolvedResult) => {
          setInSSRSetupState(true);
          try {
            handleSetupResult(instance, resolvedResult, isSSR);
          } finally {
            setInSSRSetupState(false);
          }
        }).catch((e) => {
          handleError(e, instance, 0);
        });
      } else {
        instance.asyncDep = setupResult;
        if (!instance.suspense) {
          const name = formatComponentName(instance, Component);
          warn$1(
            `Component <${name}>: setup function returned a promise, but no <Suspense> boundary was found in the parent component tree. A component with async setup() must be nested in a <Suspense> in order to be rendered.`
          );
        }
      }
    } else {
      handleSetupResult(instance, setupResult, isSSR);
    }
  } else {
    finishComponentSetup(instance, isSSR);
  }
}
function handleSetupResult(instance, setupResult, isSSR) {
  if (isFunction(setupResult)) {
    if (instance.type.__ssrInlineRender) {
      instance.ssrRender = setupResult;
    } else {
      instance.render = setupResult;
    }
  } else if (isObject(setupResult)) {
    if (isVNode(setupResult)) {
      warn$1(
        `setup() should not return VNodes directly - return a render function instead.`
      );
    }
    {
      instance.devtoolsRawSetupState = setupResult;
    }
    instance.setupState = proxyRefs(setupResult);
    {
      exposeSetupStateOnRenderContext(instance);
    }
  } else if (setupResult !== void 0) {
    warn$1(
      `setup() should return an object. Received: ${setupResult === null ? "null" : typeof setupResult}`
    );
  }
  finishComponentSetup(instance, isSSR);
}
const isRuntimeOnly = () => true;
function finishComponentSetup(instance, isSSR, skipOptions) {
  const Component = instance.type;
  if (!instance.render) {
    instance.render = Component.render || NOOP;
  }
  if (__VUE_OPTIONS_API__ && true) {
    const reset = setCurrentInstance(instance);
    pauseTracking();
    try {
      applyOptions(instance);
    } finally {
      resetTracking();
      reset();
    }
  }
  if (!Component.render && instance.render === NOOP && !isSSR) {
    if (Component.template) {
      warn$1(
        `Component provided template option but runtime compilation is not supported in this build of Vue.` + (` Configure your bundler to alias "vue" to "vue/dist/vue.esm-bundler.js".` )
      );
    } else {
      warn$1(`Component is missing template or render function: `, Component);
    }
  }
}
const attrsProxyHandlers = {
  get(target, key) {
    markAttrsAccessed();
    track(target, "get", "");
    return target[key];
  },
  set() {
    warn$1(`setupContext.attrs is readonly.`);
    return false;
  },
  deleteProperty() {
    warn$1(`setupContext.attrs is readonly.`);
    return false;
  }
} ;
function getSlotsProxy(instance) {
  return new Proxy(instance.slots, {
    get(target, key) {
      track(instance, "get", "$slots");
      return target[key];
    }
  });
}
function createSetupContext(instance) {
  const expose = (exposed) => {
    {
      if (instance.exposed) {
        warn$1(`expose() should be called only once per setup().`);
      }
      if (exposed != null) {
        let exposedType = typeof exposed;
        if (exposedType === "object") {
          if (isArray(exposed)) {
            exposedType = "array";
          } else if (isRef(exposed)) {
            exposedType = "ref";
          }
        }
        if (exposedType !== "object") {
          warn$1(
            `expose() should be passed a plain object, received ${exposedType}.`
          );
        }
      }
    }
    instance.exposed = exposed || {};
  };
  {
    let attrsProxy;
    let slotsProxy;
    return Object.freeze({
      get attrs() {
        return attrsProxy || (attrsProxy = new Proxy(instance.attrs, attrsProxyHandlers));
      },
      get slots() {
        return slotsProxy || (slotsProxy = getSlotsProxy(instance));
      },
      get emit() {
        return (event, ...args) => instance.emit(event, ...args);
      },
      expose
    });
  }
}
function getComponentPublicInstance(instance) {
  if (instance.exposed) {
    return instance.exposeProxy || (instance.exposeProxy = new Proxy(proxyRefs(markRaw(instance.exposed)), {
      get(target, key) {
        if (key in target) {
          return target[key];
        } else if (key in publicPropertiesMap) {
          return publicPropertiesMap[key](instance);
        }
      },
      has(target, key) {
        return key in target || key in publicPropertiesMap;
      }
    }));
  } else {
    return instance.proxy;
  }
}
const classifyRE = /(?:^|[-_])\w/g;
const classify = (str) => str.replace(classifyRE, (c) => c.toUpperCase()).replace(/[-_]/g, "");
function getComponentName(Component, includeInferred = true) {
  return isFunction(Component) ? Component.displayName || Component.name : Component.name || includeInferred && Component.__name;
}
function formatComponentName(instance, Component, isRoot = false) {
  let name = getComponentName(Component);
  if (!name && Component.__file) {
    const match = Component.__file.match(/([^/\\]+)\.\w+$/);
    if (match) {
      name = match[1];
    }
  }
  if (!name && instance) {
    const inferFromRegistry = (registry) => {
      for (const key in registry) {
        if (registry[key] === Component) {
          return key;
        }
      }
    };
    name = inferFromRegistry(instance.components) || instance.parent && inferFromRegistry(
      instance.parent.type.components
    ) || inferFromRegistry(instance.appContext.components);
  }
  return name ? classify(name) : isRoot ? `App` : `Anonymous`;
}
function isClassComponent(value) {
  return isFunction(value) && "__vccOpts" in value;
}

const computed = (getterOrOptions, debugOptions) => {
  const c = computed$1(getterOrOptions, debugOptions, isInSSRComponentSetup);
  {
    const i = getCurrentInstance();
    if (i && i.appContext.config.warnRecursiveComputed) {
      c._warnRecursive = true;
    }
  }
  return c;
};

const version = "3.5.42";
const warn = warn$1 ;
const _ssrUtils = {
  createComponentInstance: createComponentInstance$1,
  setupComponent: setupComponent$1,
  renderComponentRoot: renderComponentRoot$1,
  setCurrentRenderingInstance: setCurrentRenderingInstance$1,
  isVNode: isVNode,
  normalizeVNode: normalizeVNode$1,
  pushWarningContext: pushWarningContext$1,
  popWarningContext: popWarningContext$1
};
const ssrUtils = _ssrUtils ;

/**
* @vue/runtime-dom v3.5.42
* (c) 2018-present Yuxi (Evan) You and Vue contributors
* @license MIT
**/

let policy = void 0;
const tt = typeof window !== "undefined" && window.trustedTypes;
if (tt) {
  try {
    policy = /* @__PURE__ */ tt.createPolicy("vue", {
      createHTML: (val) => val
    });
  } catch (e) {
    warn(`Error creating trusted types policy: ${e}`);
  }
}
const unsafeToTrustedHTML = policy ? (val) => policy.createHTML(val) : (val) => val;
const svgNS = "http://www.w3.org/2000/svg";
const mathmlNS = "http://www.w3.org/1998/Math/MathML";
const doc = typeof document !== "undefined" ? document : null;
const templateContainer = doc && /* @__PURE__ */ doc.createElement("template");
const nodeOps = {
  insert: (child, parent, anchor) => {
    parent.insertBefore(child, anchor || null);
  },
  remove: (child) => {
    const parent = child.parentNode;
    if (parent) {
      parent.removeChild(child);
    }
  },
  createElement: (tag, namespace, is, props) => {
    const el = namespace === "svg" ? doc.createElementNS(svgNS, tag) : namespace === "mathml" ? doc.createElementNS(mathmlNS, tag) : is ? doc.createElement(tag, { is }) : doc.createElement(tag);
    if (tag === "select" && props && props.multiple != null) {
      el.setAttribute("multiple", props.multiple);
    }
    return el;
  },
  createText: (text) => doc.createTextNode(text),
  createComment: (text) => doc.createComment(text),
  setText: (node, text) => {
    node.nodeValue = text;
  },
  setElementText: (el, text) => {
    el.textContent = text;
  },
  parentNode: (node) => node.parentNode,
  nextSibling: (node) => node.nextSibling,
  querySelector: (selector) => doc.querySelector(selector),
  setScopeId(el, id) {
    el.setAttribute(id, "");
  },
  // __UNSAFE__
  // Reason: innerHTML.
  // Static content here can only come from compiled templates.
  // As long as the user only uses trusted templates, this is safe.
  insertStaticContent(content, parent, anchor, namespace, start, end) {
    const before = anchor ? anchor.previousSibling : parent.lastChild;
    if (start && (start === end || start.nextSibling)) {
      while (true) {
        parent.insertBefore(start.cloneNode(true), anchor);
        if (start === end || !(start = start.nextSibling)) break;
      }
    } else {
      templateContainer.innerHTML = unsafeToTrustedHTML(
        namespace === "svg" ? `<svg>${content}</svg>` : namespace === "mathml" ? `<math>${content}</math>` : content
      );
      const template = templateContainer.content;
      if (namespace === "svg" || namespace === "mathml") {
        const wrapper = template.firstChild;
        while (wrapper.firstChild) {
          template.appendChild(wrapper.firstChild);
        }
        template.removeChild(wrapper);
      }
      parent.insertBefore(template, anchor);
    }
    return [
      // first
      before ? before.nextSibling : parent.firstChild,
      // last
      anchor ? anchor.previousSibling : parent.lastChild
    ];
  }
};
const vtcKey = /* @__PURE__ */ Symbol("_vtc");

function patchClass(el, value, isSVG) {
  const transitionClasses = el[vtcKey];
  if (transitionClasses) {
    value = (value ? [value, ...transitionClasses] : [...transitionClasses]).join(" ");
  }
  if (value == null) {
    el.removeAttribute("class");
  } else if (isSVG) {
    el.setAttribute("class", value);
  } else {
    el.className = value;
  }
}

const vShowOriginalDisplay = /* @__PURE__ */ Symbol("_vod");
const vShowHidden = /* @__PURE__ */ Symbol("_vsh");

const CSS_VAR_TEXT = /* @__PURE__ */ Symbol("CSS_VAR_TEXT" );

const displayRE = /(?:^|;)\s*display\s*:/;
function patchStyle(el, prev, next) {
  const style = el.style;
  const isCssString = isString(next);
  let hasControlledDisplay = false;
  if (next && !isCssString) {
    if (prev) {
      if (!isString(prev)) {
        for (const key in prev) {
          if (next[key] == null) {
            setStyle(style, key, "");
          }
        }
      } else {
        for (const prevStyle of prev.split(";")) {
          const key = prevStyle.slice(0, prevStyle.indexOf(":")).trim();
          if (next[key] == null) {
            setStyle(style, key, "");
          }
        }
      }
    }
    for (const key in next) {
      if (key === "display") {
        hasControlledDisplay = true;
      }
      const value = next[key];
      if (value != null) {
        if (!shouldPreserveTextareaResizeStyle(
          el,
          key,
          !isString(prev) && prev ? prev[key] : void 0,
          value
        )) {
          setStyle(style, key, value);
        }
      } else {
        setStyle(style, key, "");
      }
    }
  } else {
    if (isCssString) {
      if (prev !== next) {
        const cssVarText = style[CSS_VAR_TEXT];
        if (cssVarText) {
          next += ";" + cssVarText;
        }
        style.cssText = next;
        hasControlledDisplay = displayRE.test(next);
      }
    } else if (prev) {
      el.removeAttribute("style");
    }
  }
  if (vShowOriginalDisplay in el) {
    el[vShowOriginalDisplay] = hasControlledDisplay ? style.display : "";
    if (el[vShowHidden]) {
      style.display = "none";
    }
  }
}
const semicolonRE = /[^\\];\s*$/;
const importantRE = /\s*!important$/;
function setStyle(style, name, val) {
  if (isArray(val)) {
    val.forEach((v) => setStyle(style, name, v));
  } else {
    if (val == null) val = "";
    {
      if (semicolonRE.test(val)) {
        warn(
          `Unexpected semicolon at the end of '${name}' style value: '${val}'`
        );
      }
    }
    if (name.startsWith("--")) {
      if (importantRE.test(val)) {
        style.setProperty(name, val.replace(importantRE, ""), "important");
      } else {
        style.setProperty(name, val);
      }
    } else {
      const prefixed = autoPrefix(style, name);
      if (importantRE.test(val)) {
        style.setProperty(
          hyphenate(prefixed),
          val.replace(importantRE, ""),
          "important"
        );
      } else {
        style[prefixed] = val;
      }
    }
  }
}
const prefixes = ["Webkit", "Moz", "ms"];
const prefixCache = {};
function autoPrefix(style, rawName) {
  const cached = prefixCache[rawName];
  if (cached) {
    return cached;
  }
  let name = camelize(rawName);
  if (name !== "filter" && name in style) {
    return prefixCache[rawName] = name;
  }
  name = capitalize(name);
  for (let i = 0; i < prefixes.length; i++) {
    const prefixed = prefixes[i] + name;
    if (prefixed in style) {
      return prefixCache[rawName] = prefixed;
    }
  }
  return rawName;
}
function shouldPreserveTextareaResizeStyle(el, key, prev, next) {
  return el.tagName === "TEXTAREA" && (key === "width" || key === "height") && isString(next) && prev === next;
}

const xlinkNS = "http://www.w3.org/1999/xlink";
function patchAttr(el, key, value, isSVG, instance, isBoolean = isSpecialBooleanAttr(key)) {
  if (isSVG && key.startsWith("xlink:")) {
    if (value == null) {
      el.removeAttributeNS(xlinkNS, key.slice(6, key.length));
    } else {
      el.setAttributeNS(xlinkNS, key, value);
    }
  } else {
    if (value == null || isBoolean && !includeBooleanAttr(value)) {
      el.removeAttribute(key);
    } else {
      el.setAttribute(
        key,
        isBoolean ? "" : isSymbol(value) ? String(value) : value
      );
    }
  }
}

function patchDOMProp(el, key, value, parentComponent, attrName) {
  if (key === "innerHTML" || key === "textContent") {
    if (value != null) {
      el[key] = key === "innerHTML" ? unsafeToTrustedHTML(value) : value;
    }
    return;
  }
  const tag = el.tagName;
  if (key === "value" && tag !== "PROGRESS" && // custom elements may use _value internally
  !tag.includes("-")) {
    const oldValue = tag === "OPTION" ? el.getAttribute("value") || "" : el.value;
    const newValue = value == null ? (
      // #11647: value should be set as empty string for null and undefined,
      // but <input type="checkbox"> should be set as 'on'.
      el.type === "checkbox" ? "on" : ""
    ) : String(value);
    if (oldValue !== newValue || !("_value" in el)) {
      el.value = newValue;
    }
    if (value == null) {
      el.removeAttribute(key);
    }
    el._value = value;
    return;
  }
  let needRemove = false;
  if (value === "" || value == null) {
    const type = typeof el[key];
    if (type === "boolean") {
      value = includeBooleanAttr(value);
    } else if (value == null && type === "string") {
      value = "";
      needRemove = true;
    } else if (type === "number") {
      value = 0;
      needRemove = true;
    }
  }
  try {
    el[key] = value;
  } catch (e) {
    if (!needRemove) {
      warn(
        `Failed setting prop "${key}" on <${tag.toLowerCase()}>: value ${value} is invalid.`,
        e
      );
    }
  }
  needRemove && el.removeAttribute(attrName || key);
}

function addEventListener(el, event, handler, options) {
  el.addEventListener(event, handler, options);
}
function removeEventListener(el, event, handler, options) {
  el.removeEventListener(event, handler, options);
}
const veiKey = /* @__PURE__ */ Symbol("_vei");
function patchEvent(el, rawName, prevValue, nextValue, instance = null) {
  const invokers = el[veiKey] || (el[veiKey] = {});
  const existingInvoker = invokers[rawName];
  if (nextValue && existingInvoker) {
    existingInvoker.value = sanitizeEventValue(nextValue, rawName) ;
  } else {
    const [name, options] = parseName(rawName);
    if (nextValue) {
      const invoker = invokers[rawName] = createInvoker(
        sanitizeEventValue(nextValue, rawName) ,
        instance
      );
      addEventListener(el, name, invoker, options);
    } else if (existingInvoker) {
      removeEventListener(el, name, existingInvoker, options);
      invokers[rawName] = void 0;
    }
  }
}
const optionsModifierRE = /(Once|Passive|Capture)$/;
const optionsModifierEventRE = /^on:?(?:Once|Passive|Capture)$/;
function parseName(name) {
  let options;
  let m;
  while ((m = name.match(optionsModifierRE)) && !optionsModifierEventRE.test(name)) {
    if (!options) options = {};
    name = name.slice(0, name.length - m[1].length);
    options[m[1].toLowerCase()] = true;
  }
  const event = name[2] === ":" ? name.slice(3) : hyphenate(name.slice(2));
  return [event, options];
}
let cachedNow = 0;
const p = /* @__PURE__ */ Promise.resolve();
const getNow = () => cachedNow || (p.then(() => cachedNow = 0), cachedNow = Date.now());
function createInvoker(initialValue, instance) {
  const invoker = (e) => {
    if (!e._vts) {
      e._vts = Date.now();
    } else if (e._vts <= invoker.attached) {
      return;
    }
    const value = invoker.value;
    if (isArray(value)) {
      const originalStop = e.stopImmediatePropagation;
      e.stopImmediatePropagation = () => {
        originalStop.call(e);
        e._stopped = true;
      };
      const handlers = value.slice();
      const args = [e];
      for (let i = 0; i < handlers.length; i++) {
        if (e._stopped) {
          break;
        }
        const handler = handlers[i];
        if (handler) {
          callWithAsyncErrorHandling(
            handler,
            instance,
            5,
            args
          );
        }
      }
    } else {
      callWithAsyncErrorHandling(
        value,
        instance,
        5,
        [e]
      );
    }
  };
  invoker.value = initialValue;
  invoker.attached = getNow();
  return invoker;
}
function sanitizeEventValue(value, propName) {
  if (isFunction(value) || isArray(value)) {
    return value;
  }
  warn(
    `Wrong type passed as event handler to ${propName} - did you forget @ or : in front of your prop?
Expected function or array of functions, received type ${typeof value}.`
  );
  return NOOP;
}

const isNativeOn = (key) => key.charCodeAt(0) === 111 && key.charCodeAt(1) === 110 && // lowercase letter
key.charCodeAt(2) > 96 && key.charCodeAt(2) < 123;
const patchProp = (el, key, prevValue, nextValue, namespace, parentComponent) => {
  const isSVG = namespace === "svg";
  if (key === "class") {
    patchClass(el, nextValue, isSVG);
  } else if (key === "style") {
    patchStyle(el, prevValue, nextValue);
  } else if (isOn(key)) {
    if (!isModelListener(key)) {
      patchEvent(el, key, prevValue, nextValue, parentComponent);
    }
  } else if (key[0] === "." ? (key = key.slice(1), true) : key[0] === "^" ? (key = key.slice(1), false) : shouldSetAsProp(el, key, nextValue, isSVG)) {
    patchDOMProp(el, key, nextValue);
    if (!el.tagName.includes("-") && (key === "value" || key === "checked" || key === "selected")) {
      patchAttr(el, key, nextValue, isSVG, parentComponent, key !== "value");
    }
  } else if (
    // #11081 force set props for possible async custom element
    el._isVueCE && // #12408 check if it's declared prop or it's async custom element
    (shouldSetAsPropForVueCE(el, key) || // @ts-expect-error _def is private
    el._def.__asyncLoader && (/[A-Z]/.test(key) || !isString(nextValue)))
  ) {
    patchDOMProp(el, camelize(key), nextValue, parentComponent, key);
  } else {
    if (key === "true-value") {
      el._trueValue = nextValue;
    } else if (key === "false-value") {
      el._falseValue = nextValue;
    }
    patchAttr(el, key, nextValue, isSVG);
  }
};
function shouldSetAsProp(el, key, value, isSVG) {
  if (isSVG) {
    if (key === "innerHTML" || key === "textContent") {
      return true;
    }
    if (key in el && isNativeOn(key) && isFunction(value)) {
      return true;
    }
    return false;
  }
  if (key === "spellcheck" || key === "draggable" || key === "translate" || key === "autocorrect") {
    return false;
  }
  if (key === "sandbox" && el.tagName === "IFRAME") {
    return false;
  }
  if (key === "form") {
    return false;
  }
  if (key === "list" && el.tagName === "INPUT") {
    return false;
  }
  if (key === "type" && el.tagName === "TEXTAREA") {
    return false;
  }
  if (key === "width" || key === "height") {
    const tag = el.tagName;
    if (tag === "IMG" || tag === "VIDEO" || tag === "CANVAS" || tag === "SOURCE") {
      return false;
    }
  }
  if (isNativeOn(key) && isString(value)) {
    return false;
  }
  return key in el;
}
function shouldSetAsPropForVueCE(el, key) {
  const props = (
    // @ts-expect-error _def is private
    el._def.props
  );
  if (!props) {
    return false;
  }
  const camelKey = camelize(key);
  return Array.isArray(props) ? props.some((prop) => camelize(prop) === camelKey) : Object.keys(props).some((prop) => camelize(prop) === camelKey);
}
const vModelText = {
  };
const vModelCheckbox = {
  };
const vModelRadio = {
  };
function initVModelForSSR() {
  vModelText.getSSRProps = ({ value }) => ({ value });
  vModelRadio.getSSRProps = ({ value }, vnode) => {
    if (vnode.props && looseEqual(vnode.props.value, value)) {
      return { checked: true };
    }
  };
  vModelCheckbox.getSSRProps = ({ value }, vnode) => {
    if (isArray(value)) {
      if (vnode.props && looseIndexOf(value, vnode.props.value) > -1) {
        return { checked: true };
      }
    } else if (isSet(value)) {
      if (vnode.props && value.has(vnode.props.value)) {
        return { checked: true };
      }
    } else if (value) {
      return { checked: true };
    }
  };
}

const rendererOptions = /* @__PURE__ */ extend({ patchProp }, nodeOps);
let renderer;
function ensureRenderer() {
  return renderer || (renderer = createRenderer(rendererOptions));
}
const createApp = ((...args) => {
  const app = ensureRenderer().createApp(...args);
  {
    injectNativeTagCheck(app);
    injectCompilerOptionsCheck(app);
  }
  const { mount } = app;
  app.mount = (containerOrSelector) => {
    const container = normalizeContainer(containerOrSelector);
    if (!container) return;
    const component = app._component;
    if (!isFunction(component) && !component.render && !component.template) {
      component.template = container.innerHTML;
    }
    if (container.nodeType === 1) {
      container.textContent = "";
    }
    const proxy = mount(container, false, resolveRootNamespace(container));
    if (container instanceof Element) {
      container.removeAttribute("v-cloak");
      container.setAttribute("data-v-app", "");
    }
    return proxy;
  };
  return app;
});
function resolveRootNamespace(container) {
  if (container instanceof SVGElement) {
    return "svg";
  }
  if (typeof MathMLElement === "function" && container instanceof MathMLElement) {
    return "mathml";
  }
}
function injectNativeTagCheck(app) {
  Object.defineProperty(app.config, "isNativeTag", {
    value: (tag) => isHTMLTag(tag) || isSVGTag(tag) || isMathMLTag(tag),
    writable: false
  });
}
function injectCompilerOptionsCheck(app) {
  {
    const isCustomElement = app.config.isCustomElement;
    Object.defineProperty(app.config, "isCustomElement", {
      get() {
        return isCustomElement;
      },
      set() {
        warn(
          `The \`isCustomElement\` config option is deprecated. Use \`compilerOptions.isCustomElement\` instead.`
        );
      }
    });
    const compilerOptions = app.config.compilerOptions;
    const msg = `The \`compilerOptions\` config option is only respected when using a build of Vue.js that includes the runtime compiler (aka "full build"). Since you are using the runtime-only build, \`compilerOptions\` must be passed to \`@vue/compiler-dom\` in the build setup instead.
- For vue-loader: pass it via vue-loader's \`compilerOptions\` loader option.
- For vue-cli: see https://cli.vuejs.org/guide/webpack.html#modifying-options-of-a-loader
- For vite: pass it via @vitejs/plugin-vue options. See https://github.com/vitejs/vite-plugin-vue/tree/main/packages/plugin-vue#example-for-passing-options-to-vuecompiler-sfc`;
    Object.defineProperty(app.config, "compilerOptions", {
      get() {
        warn(msg);
        return compilerOptions;
      },
      set() {
        warn(msg);
      }
    });
  }
}
function normalizeContainer(container) {
  if (isString(container)) {
    const res = document.querySelector(container);
    if (!res) {
      warn(
        `Failed to mount app: mount target selector "${container}" returned null.`
      );
    }
    return res;
  }
  if (window.ShadowRoot && container instanceof window.ShadowRoot && container.mode === "closed") {
    warn(
      `mounting on a ShadowRoot with \`{mode: "closed"}\` may lead to unpredictable bugs`
    );
  }
  return container;
}
let ssrDirectiveInitialized = false;
const initDirectivesForSSR = () => {
  if (!ssrDirectiveInitialized) {
    ssrDirectiveInitialized = true;
    initVModelForSSR();
  }
} ;

/**
* @vue/server-renderer v3.5.42
* (c) 2018-present Yuxi (Evan) You and Vue contributors
* @license MIT
**/

const shouldIgnoreProp = /* @__PURE__ */ makeMap(
  `,key,ref,innerHTML,textContent,ref_key,ref_for`
);
function ssrRenderAttrs(props, tag) {
  let ret = "";
  for (let key in props) {
    if (shouldIgnoreProp(key) || isOn(key) || tag === "textarea" && key === "value" || // force as property (not rendered in SSR)
    key.startsWith(".")) {
      continue;
    }
    const value = props[key];
    if (key.startsWith("^")) key = key.slice(1);
    if (key === "class") {
      ret += ` class="${ssrRenderClass(value)}"`;
    } else if (key === "style") {
      ret += ` style="${ssrRenderStyle(value)}"`;
    } else if (key === "className") {
      if (value != null) {
        ret += ` class="${escapeHtml(String(value))}"`;
      }
    } else {
      ret += ssrRenderDynamicAttr(key, value, tag);
    }
  }
  return ret;
}
function ssrRenderDynamicAttr(key, value, tag) {
  if (!isRenderableAttrValue(value)) {
    return ``;
  }
  const attrKey = tag && (tag.indexOf("-") > 0 || isSVGTag(tag)) ? key : propsToAttrMap[key] || key.toLowerCase();
  if (isBooleanAttr(attrKey) || attrKey === "hidden" && (typeof value === "boolean" || typeof value === "number")) {
    return includeBooleanAttr(value) ? ` ${attrKey}` : ``;
  } else if (isSSRSafeAttrName(attrKey)) {
    return value === "" ? ` ${attrKey}` : ` ${attrKey}="${escapeHtml(value)}"`;
  } else {
    console.warn(
      `[@vue/server-renderer] Skipped rendering unsafe attribute name: ${attrKey}`
    );
    return ``;
  }
}
function ssrRenderClass(raw) {
  return escapeHtml(normalizeClass(raw));
}
function ssrRenderStyle(raw) {
  if (!raw) {
    return "";
  }
  if (isString(raw)) {
    return escapeHtml(raw);
  }
  const styles = normalizeStyle(ssrResetCssVars(raw));
  return escapeHtml(stringifyStyle(styles));
}
function ssrResetCssVars(raw) {
  if (!isArray(raw) && isObject(raw)) {
    const res = {};
    for (const key in raw) {
      if (key.startsWith(":--")) {
        res[key.slice(1)] = normalizeCssVarValue(raw[key]);
      } else {
        res[key] = raw[key];
      }
    }
    return res;
  }
  return raw;
}

function ssrRenderTeleport(parentPush, contentRenderFn, target, disabled, parentComponent) {
  parentPush("<!--teleport start-->");
  const context = parentComponent.appContext.provides[ssrContextKey];
  const teleportBuffers = context.__teleportBuffers || (context.__teleportBuffers = {});
  const targetBuffer = teleportBuffers[target] || (teleportBuffers[target] = []);
  const bufferIndex = targetBuffer.length;
  let teleportContent;
  if (disabled) {
    contentRenderFn(parentPush);
    teleportContent = `<!--teleport start anchor--><!--teleport anchor-->`;
  } else {
    const { getBuffer, push } = createBuffer();
    push(`<!--teleport start anchor-->`);
    contentRenderFn(push);
    push(`<!--teleport anchor-->`);
    teleportContent = getBuffer();
  }
  targetBuffer.splice(bufferIndex, 0, teleportContent);
  if (isPromise(teleportContent) || isArray(teleportContent) && teleportContent.hasAsync) {
    targetBuffer.hasAsync = true;
  }
  parentPush("<!--teleport end-->");
}

function ssrCompile(template, instance) {
  {
    throw new Error(
      `On-the-fly template compilation is not supported in the ESM build of @vue/server-renderer. All templates must be pre-compiled into render functions.`
    );
  }
}

const {
  createComponentInstance,
  setCurrentRenderingInstance,
  setupComponent,
  renderComponentRoot,
  normalizeVNode,
  pushWarningContext,
  popWarningContext
} = ssrUtils;
function createBuffer() {
  let appendable = false;
  const buffer = [];
  return {
    getBuffer() {
      return buffer;
    },
    push(item) {
      const isStringItem = isString(item);
      if (appendable && isStringItem) {
        buffer[buffer.length - 1] += item;
        return;
      }
      buffer.push(item);
      appendable = isStringItem;
      if (isPromise(item) || isArray(item) && item.hasAsync) {
        buffer.hasAsync = true;
      }
    }
  };
}
function renderComponentVNode(vnode, parentComponent = null, slotScopeId) {
  const instance = vnode.component = createComponentInstance(
    vnode,
    parentComponent,
    null
  );
  pushWarningContext(vnode);
  const res = setupComponent(
    instance,
    true
    /* isSSR */
  );
  popWarningContext();
  const hasAsyncSetup = isPromise(res);
  let prefetches = instance.sp;
  if (hasAsyncSetup || prefetches) {
    const p = Promise.resolve(res).then(() => {
      if (hasAsyncSetup) prefetches = instance.sp;
      if (prefetches) {
        return Promise.all(
          prefetches.map((prefetch) => prefetch.call(instance.proxy))
        );
      }
    }).catch(NOOP);
    return p.then(() => renderComponentSubTree(instance, slotScopeId));
  } else {
    try {
      return renderComponentSubTree(instance, slotScopeId);
    } catch (err) {
      return Promise.reject(err);
    }
  }
}
function renderComponentSubTree(instance, slotScopeId) {
  pushWarningContext(instance.vnode);
  const comp = instance.type;
  const { getBuffer, push } = createBuffer();
  if (isFunction(comp)) {
    let root = renderComponentRoot(instance);
    if (!comp.props) {
      for (const key in instance.attrs) {
        if (key.startsWith(`data-v-`)) {
          (root.props || (root.props = {}))[key] = ``;
        }
      }
    }
    renderVNode(push, instance.subTree = root, instance, slotScopeId);
  } else {
    if ((!instance.render || instance.render === NOOP) && !instance.ssrRender && !comp.ssrRender && isString(comp.template)) {
      comp.ssrRender = ssrCompile(comp.template);
    }
    const ssrRender = instance.ssrRender || comp.ssrRender;
    if (ssrRender) {
      let attrs = instance.inheritAttrs !== false ? instance.attrs : void 0;
      let hasCloned = false;
      let cur = instance;
      while (true) {
        const scopeId = cur.vnode.scopeId;
        if (scopeId) {
          if (!hasCloned) {
            attrs = { ...attrs };
            hasCloned = true;
          }
          attrs[scopeId] = "";
        }
        const parent = cur.parent;
        if (parent && parent.subTree && parent.subTree === cur.vnode) {
          cur = parent;
        } else {
          break;
        }
      }
      if (slotScopeId) {
        if (!hasCloned) attrs = { ...attrs };
        const slotScopeIdList = slotScopeId.trim().split(" ");
        for (let i = 0; i < slotScopeIdList.length; i++) {
          attrs[slotScopeIdList[i]] = "";
        }
      }
      const prev = setCurrentRenderingInstance(instance);
      try {
        ssrRender(
          instance.proxy,
          push,
          instance,
          attrs,
          // compiler-optimized bindings
          instance.props,
          instance.setupState,
          instance.data,
          instance.ctx
        );
      } catch (err) {
        handleError(err, instance, 1);
      } finally {
        setCurrentRenderingInstance(prev);
      }
    } else if (instance.render && instance.render !== NOOP) {
      renderVNode(
        push,
        instance.subTree = renderComponentRoot(instance),
        instance,
        slotScopeId
      );
    } else {
      const componentName = comp.name || comp.__file || `<Anonymous>`;
      warn(`Component ${componentName} is missing template or render function.`);
      push(`<!---->`);
    }
  }
  popWarningContext();
  return getBuffer();
}
function renderVNode(push, vnode, parentComponent, slotScopeId) {
  const { type, shapeFlag, children, dirs, props } = vnode;
  if (dirs) {
    vnode.props = applySSRDirectives(vnode, props, dirs);
  }
  switch (type) {
    case Text:
      push(escapeHtml(children));
      break;
    case Comment:
      push(
        children ? `<!--${escapeHtmlComment(children)}-->` : `<!---->`
      );
      break;
    case Static:
      push(children);
      break;
    case Fragment:
      if (vnode.slotScopeIds) {
        slotScopeId = (slotScopeId ? slotScopeId + " " : "") + vnode.slotScopeIds.join(" ");
      }
      push(`<!--[-->`);
      renderVNodeChildren(
        push,
        children,
        parentComponent,
        slotScopeId
      );
      push(`<!--]-->`);
      break;
    default:
      if (shapeFlag & 1) {
        renderElementVNode(push, vnode, parentComponent, slotScopeId);
      } else if (shapeFlag & 6) {
        push(renderComponentVNode(vnode, parentComponent, slotScopeId));
      } else if (shapeFlag & 64) {
        renderTeleportVNode(push, vnode, parentComponent, slotScopeId);
      } else if (shapeFlag & 128) {
        renderVNode(push, vnode.ssContent, parentComponent, slotScopeId);
      } else {
        warn(
          "[@vue/server-renderer] Invalid VNode type:",
          type,
          `(${typeof type})`
        );
      }
  }
}
function renderVNodeChildren(push, children, parentComponent, slotScopeId) {
  for (let i = 0; i < children.length; i++) {
    renderVNode(push, normalizeVNode(children[i]), parentComponent, slotScopeId);
  }
}
function renderElementVNode(push, vnode, parentComponent, slotScopeId) {
  const tag = vnode.type;
  let { props, children, shapeFlag, scopeId } = vnode;
  let openTag = `<${tag}`;
  if (props) {
    openTag += ssrRenderAttrs(props, tag);
  }
  const renderedScopeIds = [];
  const appendScopeId = (id) => {
    if (id && (!props || !hasOwn(props, id)) && !renderedScopeIds.includes(id)) {
      openTag += ` ${id}`;
      renderedScopeIds.push(id);
    }
  };
  if (scopeId) {
    appendScopeId(scopeId);
  }
  let curParent = parentComponent;
  let curVnode = vnode;
  while (curParent && curVnode === curParent.subTree) {
    curVnode = curParent.vnode;
    if (curVnode.scopeId) {
      appendScopeId(curVnode.scopeId);
    }
    curParent = curParent.parent;
  }
  if (slotScopeId) {
    const slotScopeIdList = slotScopeId.trim().split(" ");
    for (let i = 0; i < slotScopeIdList.length; i++) {
      appendScopeId(slotScopeIdList[i]);
    }
  }
  push(openTag + `>`);
  if (!isVoidTag(tag)) {
    let hasChildrenOverride = false;
    if (props) {
      if (props.innerHTML) {
        hasChildrenOverride = true;
        push(props.innerHTML);
      } else if (props.textContent) {
        hasChildrenOverride = true;
        push(escapeHtml(props.textContent));
      } else if (tag === "textarea" && props.value) {
        hasChildrenOverride = true;
        push(escapeHtml(props.value));
      }
    }
    if (!hasChildrenOverride) {
      if (shapeFlag & 8) {
        push(escapeHtml(children));
      } else if (shapeFlag & 16) {
        renderVNodeChildren(
          push,
          children,
          parentComponent,
          slotScopeId
        );
      }
    }
    push(`</${tag}>`);
  }
}
function applySSRDirectives(vnode, rawProps, dirs) {
  const toMerge = [];
  for (let i = 0; i < dirs.length; i++) {
    const binding = dirs[i];
    const {
      dir: { getSSRProps }
    } = binding;
    if (getSSRProps) {
      const props = getSSRProps(binding, vnode);
      if (props) toMerge.push(props);
    }
  }
  return mergeProps(rawProps || {}, ...toMerge);
}
function renderTeleportVNode(push, vnode, parentComponent, slotScopeId) {
  const target = vnode.props && vnode.props.to;
  const disabled = vnode.props && vnode.props.disabled;
  if (!target) {
    if (!disabled) {
      warn(`[@vue/server-renderer] Teleport is missing target prop.`);
    }
    return [];
  }
  if (!isString(target)) {
    warn(
      `[@vue/server-renderer] Teleport target must be a query selector string.`
    );
    return [];
  }
  ssrRenderTeleport(
    push,
    (push2) => {
      renderVNodeChildren(
        push2,
        vnode.children,
        parentComponent,
        slotScopeId
      );
    },
    target,
    disabled || disabled === "",
    parentComponent
  );
}

const { isVNode: isVNode$1 } = ssrUtils;
function nestedUnrollBuffer(buffer, parentRet, startIndex) {
  if (!buffer.hasAsync) {
    return parentRet + unrollBufferSync$1(buffer);
  }
  let ret = parentRet;
  for (let i = startIndex; i < buffer.length; i += 1) {
    const item = buffer[i];
    if (isString(item)) {
      ret += item;
      continue;
    }
    if (isPromise(item)) {
      return item.then((nestedItem) => {
        buffer[i] = nestedItem;
        return nestedUnrollBuffer(buffer, ret, i);
      });
    }
    const result = nestedUnrollBuffer(item, ret, 0);
    if (isPromise(result)) {
      return result.then((nestedItem) => {
        buffer[i] = nestedItem;
        return nestedUnrollBuffer(buffer, "", i);
      });
    }
    ret = result;
  }
  return ret;
}
function unrollBuffer$1(buffer) {
  return nestedUnrollBuffer(buffer, "", 0);
}
function unrollBufferSync$1(buffer) {
  let ret = "";
  for (let i = 0; i < buffer.length; i++) {
    let item = buffer[i];
    if (isString(item)) {
      ret += item;
    } else {
      ret += unrollBufferSync$1(item);
    }
  }
  return ret;
}
async function renderToString$1(input, context = {}) {
  if (isVNode$1(input)) {
    return renderToString$1(createApp({ render: () => input }), context);
  }
  const vnode = createVNode(input._component, input._props);
  vnode.appContext = input._context;
  input.provide(ssrContextKey, context);
  const buffer = await renderComponentVNode(vnode);
  const result = await unrollBuffer$1(buffer);
  await resolveTeleports(context);
  if (context.__watcherHandles) {
    for (const unwatch of context.__watcherHandles) {
      unwatch();
    }
  }
  return result;
}
async function resolveTeleports(context) {
  if (context.__teleportBuffers) {
    context.teleports = context.teleports || {};
    for (const key in context.__teleportBuffers) {
      context.teleports[key] = await unrollBuffer$1(
        context.__teleportBuffers[key]
      );
    }
  }
}

initDirectivesForSSR();

function renderToString(component, options) {
    if (options === null || options === void 0 ? void 0 : options.attachTo) {
        console.warn('attachTo option is not available for renderToString');
    }
    const { app } = createInstance(component, options);
    return renderToString$1(app);
}

// match return type of router.resolve: RouteLocation & { href: string }
const defaultRoute = {
    path: '/',
    name: undefined,
    redirectedFrom: undefined,
    params: {},
    query: {},
    hash: '',
    fullPath: '/',
    matched: [],
    meta: {},
    href: '/'
};
// TODO: Borrow typings from vue-router-next
const RouterLinkStub = defineComponent({
    name: 'RouterLinkStub',
    compatConfig: { MODE: 3 },
    props: {
        to: {
            type: [String, Object],
            required: true
        },
        custom: {
            type: Boolean,
            default: false
        }
    },
    render() {
        var _a, _b;
        const route = computed$2(() => defaultRoute);
        // mock reasonable return values to mimic vue-router's useLink
        const children = (_b = (_a = this.$slots) === null || _a === void 0 ? void 0 : _a.default) === null || _b === void 0 ? void 0 : _b.call(_a, {
            route,
            href: computed$2(() => route.value.href),
            isActive: computed$2(() => false),
            isExactActive: computed$2(() => false),
            navigate: () => __awaiter(this, void 0, void 0, function* () { })
        });
        return this.custom ? children : h('a', undefined, children);
    }
});

const scheduler = typeof setImmediate === 'function' ? setImmediate : setTimeout;
// Credit to: https://github.com/kentor/flush-promises
function flushPromises() {
    return new Promise(resolve => {
        scheduler(resolve, 0);
    });
}

export { BaseWrapper, DOMWrapper, RouterLinkStub, VueWrapper, config, createWrapperError, disableAutoUnmount, enableAutoUnmount, flushPromises, mount, renderToString, shallowMount };
