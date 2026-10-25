'use strict';

var core = require('@capacitor/core');

/// <reference types="@capacitor/cli" />
exports.SystemBarsStyle = void 0;
(function (SystemBarsStyle) {
    /**
     * Light system bar content on a dark background.
     */
    SystemBarsStyle["Dark"] = "DARK";
    /**
     * For dark system bar content on a light background.
     */
    SystemBarsStyle["Light"] = "LIGHT";
    /**
     * The style is based on the device appearance or the underlying content.
     * If the device is using dark mode, the system bars content will be light.
     * If the device is using light mode, the system bars content will be dark.
     */
    SystemBarsStyle["Default"] = "DEFAULT";
})(exports.SystemBarsStyle || (exports.SystemBarsStyle = {}));
exports.SystemBarsType = void 0;
(function (SystemBarsType) {
    /**
     * The top status bar on both Android and iOS.
     */
    SystemBarsType["StatusBar"] = "STATUS_BAR";
    /**
     * The navigation bar on both Android and iOS.
     *
     * On iOS this is the "home indicator".
     *
     * On Android this is either the "navigation bar" or the "gesture bar".
     */
    SystemBarsType["NavigationBar"] = "NAVIGATION_BAR";
})(exports.SystemBarsType || (exports.SystemBarsType = {}));

const SafeArea = core.registerPlugin('SafeArea', {
    web: () => Promise.resolve().then(function () { return web; }).then((m) => new m.SafeAreaWeb()),
});

class SafeAreaWeb extends core.WebPlugin {
    async setSystemBarsStyle() {
        this.unavailable('not available for web');
    }
    async showSystemBars() {
        this.unavailable('not available for web');
    }
    async hideSystemBars() {
        this.unavailable('not available for web');
    }
}

var web = /*#__PURE__*/Object.freeze({
    __proto__: null,
    SafeAreaWeb: SafeAreaWeb
});

exports.SafeArea = SafeArea;
//# sourceMappingURL=plugin.cjs.js.map
