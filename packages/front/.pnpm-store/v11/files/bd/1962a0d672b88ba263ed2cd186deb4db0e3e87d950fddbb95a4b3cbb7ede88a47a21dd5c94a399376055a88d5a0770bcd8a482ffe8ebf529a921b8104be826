/**
 * Fingerprint BotD v2.0.0 - Copyright (c) FingerprintJS, Inc, 2025 (https://fingerprint.com)
 * Licensed under the MIT (http://www.opensource.org/licenses/mit-license.php) license.
 */

declare function getAppVersion(): string;

declare function getDocumentElementKeys(): string[];

declare function getErrorTrace(): string;

declare function getEvalLength(): number;

declare function getFunctionBind(): string;

declare function getLanguages(): string[][];

declare function areMimeTypesConsistent(): boolean;

declare function getNotificationPermissions(): Promise<boolean>;

declare function getPluginsArray(): boolean;

declare function getPluginsLength(): number;

interface ProcessPayload {
    type?: string;
    versions?: {
        electron?: string;
    };
}
declare function getProcess(): ProcessPayload;

declare function getProductSub(): string;

declare function getRTT(): number;

declare function getUserAgent(): string;

declare function getWebDriver(): boolean;

interface WebGLPayload {
    vendor: string;
    renderer: string;
}
declare function getWebGL(): WebGLPayload;

declare function getWindowExternal(): string;

interface WindowSizePayload {
    outerWidth: number;
    outerHeight: number;
    innerWidth: number;
    innerHeight: number;
}
declare function getWindowSize(): WindowSizePayload;

declare function detectAppVersion({ appVersion }: ComponentDict): DetectorResponse;

declare function detectDocumentAttributes({ documentElementKeys }: ComponentDict): DetectorResponse;

declare function detectErrorTrace({ errorTrace }: ComponentDict): DetectorResponse;

declare function detectEvalLengthInconsistency({ evalLength, browserKind, browserEngineKind, }: ComponentDict): DetectorResponse;

declare function detectFunctionBind({ functionBind }: ComponentDict): DetectorResponse;

declare function detectLanguagesLengthInconsistency({ languages }: ComponentDict): DetectorResponse;

declare function detectMimeTypesConsistent({ mimeTypesConsistent }: ComponentDict): DetectorResponse;

declare function detectNotificationPermissions({ notificationPermissions, browserKind, }: ComponentDict): DetectorResponse;

declare function detectPluginsArray({ pluginsArray }: ComponentDict): DetectorResponse;

declare function detectPluginsLengthInconsistency({ pluginsLength, android, browserKind, browserEngineKind, }: ComponentDict): DetectorResponse;

declare function detectProcess({ process }: ComponentDict): DetectorResponse;

declare function detectProductSub({ productSub, browserKind }: ComponentDict): DetectorResponse;

declare function detectUserAgent({ userAgent }: ComponentDict): DetectorResponse;

declare function detectWebDriver({ webDriver }: ComponentDict): DetectorResponse;

declare function detectWebGL({ webGL }: ComponentDict): DetectorResponse;

declare function detectWindowExternal({ windowExternal }: ComponentDict): DetectorResponse;

declare function detectWindowSize({ windowSize, documentFocus }: ComponentDict): DetectorResponse;

declare function detectDistinctiveProperties({ distinctiveProps }: ComponentDict): DetectorResponse;

declare const detectors: {
    detectAppVersion: typeof detectAppVersion;
    detectDocumentAttributes: typeof detectDocumentAttributes;
    detectErrorTrace: typeof detectErrorTrace;
    detectEvalLengthInconsistency: typeof detectEvalLengthInconsistency;
    detectFunctionBind: typeof detectFunctionBind;
    detectLanguagesLengthInconsistency: typeof detectLanguagesLengthInconsistency;
    detectNotificationPermissions: typeof detectNotificationPermissions;
    detectPluginsArray: typeof detectPluginsArray;
    detectPluginsLengthInconsistency: typeof detectPluginsLengthInconsistency;
    detectProcess: typeof detectProcess;
    detectUserAgent: typeof detectUserAgent;
    detectWebDriver: typeof detectWebDriver;
    detectWebGL: typeof detectWebGL;
    detectWindowExternal: typeof detectWindowExternal;
    detectWindowSize: typeof detectWindowSize;
    detectMimeTypesConsistent: typeof detectMimeTypesConsistent;
    detectProductSub: typeof detectProductSub;
    detectDistinctiveProperties: typeof detectDistinctiveProperties;
};

type BotDetectionResult = {
    bot: true;
    botKind: BotKind;
} | {
    bot: false;
};
/**
 * Enum for the source state.
 *
 * @readonly
 * @enum {number}
 */
declare const enum State {
    Success = 0,
    Undefined = -1,
    NotFunction = -2,
    UnexpectedBehaviour = -3,
    Null = -4
}
/**
 * Enum for types of bots.
 * Specific types of bots come first, followed by automation technologies.
 *
 * @readonly
 * @enum {string}
 */
declare const BotKind: {
    readonly Awesomium: "awesomium";
    readonly Cef: "cef";
    readonly CefSharp: "cefsharp";
    readonly CoachJS: "coachjs";
    readonly Electron: "electron";
    readonly FMiner: "fminer";
    readonly Geb: "geb";
    readonly NightmareJS: "nightmarejs";
    readonly Phantomas: "phantomas";
    readonly PhantomJS: "phantomjs";
    readonly Rhino: "rhino";
    readonly Selenium: "selenium";
    readonly Sequentum: "sequentum";
    readonly SlimerJS: "slimerjs";
    readonly WebDriverIO: "webdriverio";
    readonly WebDriver: "webdriver";
    readonly HeadlessChrome: "headless_chrome";
    readonly Unknown: "unknown";
};
type BotKind = typeof BotKind[keyof typeof BotKind];
type DetectorResponse = boolean | BotKind | undefined;
/**
 * Represents a component with state and value.
 */
type Component<T> = {
    state: State.Success;
    value: T;
} | {
    state: Exclude<State, State.Success>;
    error: string;
};
/**
 * Dictionary of default sources and their respective return types.
 */
type DefaultSourceDict = typeof sources;
/**
 * Dictionary of default detectors and their respective types.
 */
type DefaultDetectorDict = typeof detectors;
/**
 * Represents a single source response type.
 */
type SourceResponse<T> = T extends (...args: any[]) => any ? Awaited<ReturnType<T>> : T;
type AbstractDetector<T> = (components: T) => DetectorResponse;
type AbstractSourceDict = Record<string, SourceResponse<any>>;
type AbstractDetectorDict<T> = Record<string, AbstractDetector<T>>;
type AbstractComponentDict = Record<string, Component<any>>;
type AbstractDetectionsDict = Record<string, BotDetectionResult>;
/**
 * Represents a dictionary of detectors detection.
 */
type DetectionDict<T extends AbstractDetectorDict<any> = DefaultDetectorDict> = Record<keyof T, BotDetectionResult>;
/**
 * Dictionary of components.
 */
type ComponentDict<T extends AbstractSourceDict = DefaultSourceDict> = {
    [K in keyof T]: Component<SourceResponse<T[K]>>;
};
/**
 * Interface for classes that represent a bot detector.
 *
 * @interface BotDetectorInterface
 */
interface BotDetectorInterface {
    /**
     * Performs bot detection. Should be called after `collect()`.
     */
    detect(): BotDetectionResult;
    /**
     * Collects data from sources. You can retrieve the data using `getComponents()`.
     */
    collect(): Promise<AbstractComponentDict>;
    /**
     * Returns the collected data. Should be called after `collect()`.
     */
    getComponents(): AbstractComponentDict | undefined;
    /**
     * Returns detection result for each detector. Should be called after `detect()`.
     */
    getDetections(): AbstractDetectionsDict | undefined;
}
/**
 * Bot detection error.
 */
declare class BotdError extends Error {
    state: Exclude<State, State.Success>;
    /**
     * Creates a new BotdError.
     *
     * @class
     */
    constructor(state: Exclude<State, State.Success>, message: string);
}
declare const enum BrowserEngineKind {
    Unknown = "unknown",
    Chromium = "chromium",
    Gecko = "gecko",
    Webkit = "webkit"
}
declare const enum BrowserKind {
    Unknown = "unknown",
    Chrome = "chrome",
    Firefox = "firefox",
    Opera = "opera",
    Safari = "safari",
    IE = "internet_explorer",
    WeChat = "wechat",
    Edge = "edge"
}

type DistinctivePropertiesPayload = Partial<Record<BotKind, boolean>>;
declare function checkDistinctiveProperties(): DistinctivePropertiesPayload;

declare function getBrowserEngineKind(): BrowserEngineKind;
declare function getBrowserKind(): BrowserKind;
declare function isAndroid(): boolean;
declare function getDocumentFocus(): boolean;

declare const sources: {
    android: typeof isAndroid;
    browserKind: typeof getBrowserKind;
    browserEngineKind: typeof getBrowserEngineKind;
    documentFocus: typeof getDocumentFocus;
    userAgent: typeof getUserAgent;
    appVersion: typeof getAppVersion;
    rtt: typeof getRTT;
    windowSize: typeof getWindowSize;
    pluginsLength: typeof getPluginsLength;
    pluginsArray: typeof getPluginsArray;
    errorTrace: typeof getErrorTrace;
    productSub: typeof getProductSub;
    windowExternal: typeof getWindowExternal;
    mimeTypesConsistent: typeof areMimeTypesConsistent;
    evalLength: typeof getEvalLength;
    webGL: typeof getWebGL;
    webDriver: typeof getWebDriver;
    languages: typeof getLanguages;
    notificationPermissions: typeof getNotificationPermissions;
    documentElementKeys: typeof getDocumentElementKeys;
    functionBind: typeof getFunctionBind;
    process: typeof getProcess;
    distinctiveProps: typeof checkDistinctiveProperties;
};

declare function detect<T extends ComponentDict, K extends AbstractDetectorDict<T>>(components: T, detectors: K): [DetectionDict<K>, BotDetectionResult];
declare function collect<T extends AbstractSourceDict>(sources: T): Promise<ComponentDict<T>>;

/**
 * Options for BotD loading
 */
interface LoadOptions {
    /**
     * Set `false` to disable the unpersonalized AJAX request that the agent sends to collect installation statistics.
     * It's always disabled in the version published to the FingerprintJS CDN.
     */
    monitoring?: boolean;
}
declare function load({ monitoring }?: Readonly<LoadOptions>): Promise<BotDetectorInterface>;
declare const _default: {
    load: typeof load;
};

export { BotDetectionResult, BotKind, BotdError, DistinctivePropertiesPayload, LoadOptions, ProcessPayload, WindowSizePayload, collect, _default as default, detect, detectors, load, sources };
