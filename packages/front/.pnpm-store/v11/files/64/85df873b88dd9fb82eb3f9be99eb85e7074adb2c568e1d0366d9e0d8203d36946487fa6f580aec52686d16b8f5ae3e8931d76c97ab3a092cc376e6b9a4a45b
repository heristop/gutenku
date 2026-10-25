import { OpenAIError } from "../error.mjs";
import type { RunnerDiagnosticObserver } from "../internal/runner-diagnostics.mjs";
import type { FunctionTool, ResponseFunctionToolCall, ResponseInputImageContent, ResponseInputItem } from "../resources/responses/responses.mjs";
export type { RunnerDiagnostic, RunnerDiagnosticObserver } from "../internal/runner-diagnostics.mjs";
declare const fields: {
    readonly text: {
        readonly type: "string";
    };
    readonly optionalText: {
        readonly type: readonly ["string", "null"];
    };
    readonly strings: {
        readonly type: "array";
        readonly items: {
            readonly type: "string";
        };
    };
    readonly filter: {
        readonly type: "string";
        readonly enum: readonly ["all", "interactive"];
    };
    readonly direction: {
        readonly type: "string";
        readonly enum: readonly ["up", "down", "left", "right"];
    };
    readonly amount: {
        readonly type: "integer";
        readonly minimum: 0;
        readonly maximum: number;
    };
    readonly timeout: {
        readonly type: "integer";
        readonly minimum: 1;
        readonly maximum: 30000;
    };
    readonly region: {
        readonly type: "array";
        readonly items: {
            readonly type: "integer";
            readonly minimum: 0;
            readonly maximum: number;
        };
        readonly minItems: 4;
        readonly maxItems: 4;
    };
    readonly coordinate: {
        readonly type: "integer";
        readonly minimum: 0;
        readonly maximum: number;
    };
    readonly checked: {
        readonly type: "boolean";
    };
    readonly button: {
        readonly type: "string";
        readonly enum: readonly ["left", "right", "middle"];
    };
    readonly clickCount: {
        readonly type: "integer";
        readonly enum: readonly [1, 2, 3];
    };
    readonly modifiers: {
        readonly type: "array";
        readonly items: {
            readonly type: "string";
            readonly enum: readonly ["Control", "Alt", "Meta", "Shift"];
        };
        readonly minItems: 0;
        readonly maxItems: 4;
        readonly description: "Unique modifier keys held for this operation.";
    };
    readonly path: {
        readonly type: "array";
        readonly items: {
            readonly type: "object";
            readonly properties: {
                readonly x: {
                    readonly type: "integer";
                    readonly minimum: 0;
                    readonly maximum: number;
                };
                readonly y: {
                    readonly type: "integer";
                    readonly minimum: 0;
                    readonly maximum: number;
                };
            };
            readonly required: readonly ["x", "y"];
            readonly additionalProperties: false;
        };
        readonly minItems: 2;
        readonly maxItems: 100;
    };
    readonly heldKeys: {
        readonly type: "array";
        readonly items: {
            readonly type: "string";
            readonly description: "Nonempty driver-supported key, at most 64 UTF-8 bytes.";
        };
        readonly minItems: 1;
        readonly maxItems: 8;
        readonly description: "Unique driver-supported keys held for this operation.";
    };
    readonly holdDuration: {
        readonly type: "integer";
        readonly minimum: 1;
        readonly maximum: 3000;
    };
    readonly scope: {
        readonly type: readonly ["string", "null"];
        readonly description: "Null or a nonempty driver-issued scope ref, at most 256 UTF-8 bytes. Never a selector.";
    };
    readonly depth: {
        readonly type: "integer";
        readonly minimum: 1;
        readonly maximum: 32;
    };
    readonly diagnosticSource: {
        readonly type: "string";
        readonly enum: readonly ["console", "network"];
    };
    readonly diagnosticLimit: {
        readonly type: "integer";
        readonly minimum: 1;
        readonly maximum: 100;
    };
    readonly script: {
        readonly type: "string";
        readonly description: "Nonempty page script containing valid Unicode.";
    };
    readonly fileGrant: {
        readonly type: "string";
        readonly description: "Nonempty caller-issued file grant, at most 256 UTF-8 bytes.";
    };
    readonly visibleText: {
        readonly type: "string";
        readonly description: "Nonempty visible text, at most 256 UTF-8 bytes after whitespace normalization.";
    };
};
type Field = keyof typeof fields;
type FieldValue<F extends Field> = {
    text: string;
    optionalText: string | null;
    strings: string[];
    filter: 'all' | 'interactive';
    direction: 'up' | 'down' | 'left' | 'right';
    amount: number;
    timeout: number;
    region: [number, number, number, number];
    visibleText: string;
    coordinate: number;
    checked: boolean;
    button: 'left' | 'right' | 'middle';
    clickCount: 1 | 2 | 3;
    modifiers: ('Control' | 'Alt' | 'Meta' | 'Shift')[];
    path: {
        x: number;
        y: number;
    }[];
    heldKeys: string[];
    holdDuration: number;
    scope: string | null;
    depth: number;
    diagnosticSource: 'console' | 'network';
    diagnosticLimit: number;
    script: string;
    fileGrant: string;
}[F];
declare const members: {
    readonly navigate: {
        readonly description: "Navigate a tab to a URL.";
        readonly changes: true;
        readonly args: {
            readonly url: "text";
            readonly tab_id: "optionalText";
        };
    };
    readonly read_page: {
        readonly description: "Read page structure and opaque interactive element refs.";
        readonly changes: false;
        readonly args: {
            readonly tab_id: "optionalText";
            readonly filter: "filter";
        };
    };
    readonly read_page_scoped: {
        readonly description: "Read within an observed section, or discover sections with a null root. Depth counts DOM levels.";
        readonly changes: false;
        readonly optIn: true;
        readonly args: {
            readonly tab_id: "optionalText";
            readonly root: "scope";
            readonly depth: "depth";
            readonly filter: "filter";
        };
    };
    readonly read_diagnostics: {
        readonly description: "Read a bounded, driver-filtered console or network summary. Requires approval.";
        readonly changes: false;
        readonly sensitive: true;
        readonly optIn: true;
        readonly args: {
            readonly tab_id: "optionalText";
            readonly source: "diagnosticSource";
            readonly limit: "diagnosticLimit";
        };
    };
    readonly run_script: {
        readonly description: "Run an approved script in an explicitly allowed page. Returns text.";
        readonly changes: true;
        readonly optIn: true;
        readonly args: {
            readonly tab_id: "optionalText";
            readonly source: "script";
            readonly timeout_ms: "timeout";
        };
    };
    readonly upload_file: {
        readonly description: "Upload a caller-approved file using its task-scoped grant. Requires separate file approval.";
        readonly changes: true;
        readonly optIn: true;
        readonly args: {
            readonly grant_id: "fileGrant";
        };
    };
    readonly download_file: {
        readonly description: "Retrieve a caller-approved file using its task-scoped grant. Requires separate file approval.";
        readonly changes: true;
        readonly optIn: true;
        readonly args: {
            readonly grant_id: "fileGrant";
        };
    };
    readonly get_page_text: {
        readonly description: "Read visible page text.";
        readonly changes: false;
        readonly args: {
            readonly tab_id: "optionalText";
        };
    };
    readonly find: {
        readonly description: "Find page elements by text or description.";
        readonly changes: false;
        readonly args: {
            readonly query: "text";
            readonly tab_id: "optionalText";
        };
    };
    readonly click: {
        readonly description: "Click an element by its opaque ref.";
        readonly changes: true;
        readonly args: {
            readonly target: "text";
            readonly tab_id: "optionalText";
        };
    };
    readonly click_at: {
        readonly description: "Click full-viewport CSS coordinates with a button, click count, and held modifiers.";
        readonly changes: true;
        readonly optIn: true;
        readonly args: {
            readonly tab_id: "optionalText";
            readonly x: "coordinate";
            readonly y: "coordinate";
            readonly button: "button";
            readonly click_count: "clickCount";
            readonly keys: "modifiers";
        };
    };
    readonly drag_path: {
        readonly description: "Drag the left button through 2 to 100 full-viewport CSS points with held modifiers.";
        readonly changes: true;
        readonly optIn: true;
        readonly args: {
            readonly tab_id: "optionalText";
            readonly path: "path";
            readonly keys: "modifiers";
        };
    };
    readonly hold_keys: {
        readonly description: "Hold driver-supported keys for at most 3000 milliseconds, then release them.";
        readonly changes: true;
        readonly optIn: true;
        readonly args: {
            readonly tab_id: "optionalText";
            readonly keys: "heldKeys";
            readonly duration_ms: "holdDuration";
        };
    };
    readonly type: {
        readonly description: "Fill a referenced control or type at the current focus.";
        readonly changes: true;
        readonly args: {
            readonly text: "text";
            readonly target: "optionalText";
            readonly tab_id: "optionalText";
        };
    };
    readonly key: {
        readonly description: "Press a key combination.";
        readonly changes: true;
        readonly args: {
            readonly keys: "strings";
            readonly tab_id: "optionalText";
        };
    };
    readonly scroll: {
        readonly description: "Scroll the page in the given direction.";
        readonly changes: true;
        readonly args: {
            readonly direction: "direction";
            readonly amount: "amount";
            readonly tab_id: "optionalText";
        };
    };
    readonly scroll_to: {
        readonly description: "Scroll an already observed target into view. Read again before acting.";
        readonly changes: true;
        readonly args: {
            readonly target: "text";
            readonly tab_id: "optionalText";
        };
    };
    readonly wait_for: {
        readonly description: "Wait for reported visible text, within a bounded timeout in milliseconds.";
        readonly changes: false;
        readonly args: {
            readonly text: "visibleText";
            readonly timeout_ms: "timeout";
            readonly tab_id: "optionalText";
        };
    };
    readonly select_option: {
        readonly description: "Select values in a referenced select control.";
        readonly changes: true;
        readonly args: {
            readonly target: "text";
            readonly values: "strings";
            readonly tab_id: "optionalText";
        };
    };
    readonly hover: {
        readonly description: "Hover over a referenced element.";
        readonly changes: true;
        readonly args: {
            readonly target: "text";
            readonly tab_id: "optionalText";
        };
    };
    readonly hover_at: {
        readonly description: "Move the pointer to full-viewport CSS coordinates without pressing a button.";
        readonly changes: true;
        readonly optIn: true;
        readonly args: {
            readonly tab_id: "optionalText";
            readonly x: "coordinate";
            readonly y: "coordinate";
        };
    };
    readonly set_checked: {
        readonly description: "Set an observed checkbox to the requested state. Repeating the same value does not toggle it.";
        readonly changes: true;
        readonly optIn: true;
        readonly args: {
            readonly tab_id: "optionalText";
            readonly target: "text";
            readonly checked: "checked";
        };
    };
    readonly screenshot: {
        readonly description: "Capture the visible tab as an image.";
        readonly changes: false;
        readonly args: {
            readonly tab_id: "optionalText";
        };
    };
    readonly zoom: {
        readonly description: "Capture a region [x0,y0,x1,y1]. Subsequent coordinates stay in the full viewport.";
        readonly changes: false;
        readonly args: {
            readonly tab_id: "optionalText";
            readonly region: "region";
        };
    };
    readonly new_tab: {
        readonly description: "Open a tab, optionally at a URL.";
        readonly changes: true;
        readonly args: {
            readonly url: "optionalText";
        };
    };
    readonly list_tabs: {
        readonly description: "List tabs, titles, URLs and active tab.";
        readonly changes: false;
        readonly args: {};
    };
    readonly switch_tab: {
        readonly description: "Activate a tab.";
        readonly changes: true;
        readonly args: {
            readonly tab_id: "text";
        };
    };
    readonly close_tab: {
        readonly description: "Close a tab.";
        readonly changes: true;
        readonly args: {
            readonly tab_id: "text";
        };
    };
};
/** Fixed browser method names. Only methods implemented by the driver are advertised. */
export type BrowserMember = keyof typeof members;
/** Fixed member names, including opt-ins. This list never reads a driver. */
export declare const BROWSER_MEMBERS: readonly BrowserMember[];
/** Standard members. A partial driver advertises only the members it implements. */
export declare const DEFAULT_BROWSER_MEMBERS: readonly BrowserMember[];
/** Validated wire arguments for a browser member. Optional IDs use explicit null. */
export type BrowserArguments<M extends BrowserMember> = {
    [K in keyof (typeof members)[M]['args']]: FieldValue<Extract<(typeof members)[M]['args'][K], Field>>;
};
/** Current tabs as observed by the driver after each operation. */
export interface BrowserState {
    /** Stable driver-owned IDs and an accurate indication of the active tab. */
    tabs: {
        /** Opaque ID accepted by tab operations. */
        id: string;
        /** Page title, with browser-owned credentials excluded. */
        title: string;
        /** Current page URL, with browser-owned credentials excluded. */
        url: string;
        /** True only for the active tab. */
        active: boolean;
    }[];
    /** Optional bounded observation. Drivers own event history and title filtering. */
    observation?: BrowserObservationV1 | undefined;
}
/** Driver-owned, non-consuming bounded observation. URL displays contain origins only. */
export interface BrowserObservationV1 {
    version: 1;
    sequence: number;
    dropped_changes: number;
    title_truncated: boolean;
    changes: BrowserStateChange[];
}
/** Notices never contain raw URLs, dialog text, download names, or private metadata. */
export type BrowserStateChange = {
    type: 'tab_opened' | 'tab_closed' | 'tab_switched' | 'navigation';
    sequence: number;
    tab_id: string;
} | {
    type: 'navigation_refused';
    sequence: number;
    tab_id: string | null;
    reason: 'policy' | 'unsupported';
} | {
    type: 'dialog_dismissed';
    sequence: number;
    tab_id: string;
    kind: 'alert' | 'confirm' | 'prompt' | 'beforeunload' | 'other';
} | {
    type: 'download';
    sequence: number;
    tab_id: string | null;
    status: 'blocked' | 'started' | 'completed' | 'failed';
};
declare const readOmissions: readonly ["report_limit", "text_limit", "target_limit", "work_limit", "frame_limit", "unsupported_root", "unsupported_control", "remote_action", "private", "value", "name_limit"];
/** Public, driver-approved option text and value, never raw element metadata. */
export interface BrowserReadOption {
    label: string;
    value: string;
    /** Only published for listbox choices when the driver authorizes reading the current selection. */
    selected?: boolean | undefined;
}
/** A driver-owned actionable reference to a bounded, privacy-filtered control. */
export interface BrowserReadElement {
    ref: string;
    role: 'button' | 'textbox' | 'combobox' | 'checkbox' | 'radio' | 'slider' | 'listbox';
    label: string;
    value?: string | undefined;
    options?: BrowserReadOption[] | undefined;
    /** Only published for checkbox/radio controls when the driver authorizes reading their state. */
    checked?: boolean | undefined;
}
/** Optional bounded result for read_page, find, and get_page_text.
 * Drivers own DOM visibility, field privacy, and reference validity.
 * get_page_text must return no elements.
 */
export interface BrowserReadV1 {
    version: 1;
    text: string;
    elements: BrowserReadElement[];
    omitted: (typeof readOmissions)[number][];
}
/** A diagnostic report contains text and omissions, without actionable elements. */
export interface BrowserTextReadV1 extends BrowserReadV1 {
    elements: never[];
}
/** A bounded section read. Scope refs select subsequent reads and cannot authorize element actions. */
export interface BrowserScopedReadV1 extends BrowserReadV1 {
    scopes: {
        ref: string;
        label: string;
    }[];
}
/** A terminal file result for this call. It does not confirm a later business action. */
export type BrowserFileOutcome = {
    version: 1;
    cleanup: 'not_started' | 'pending' | 'completed';
} & ({
    status: 'completed';
    effect: 'completed';
} | {
    status: 'refused';
    effect: 'none';
} | {
    status: 'unknown';
    effect: 'unknown';
} | {
    status: 'interrupted';
    effect: 'none' | 'unknown';
});
/** A run_script result must be a string containing valid Unicode. */
export type BrowserResult<M extends BrowserMember> = M extends 'screenshot' | 'zoom' ? ResponseInputImageContent : M extends 'list_tabs' ? BrowserState : M extends 'read_page_scoped' ? BrowserScopedReadV1 : M extends 'read_diagnostics' ? BrowserTextReadV1 : M extends 'run_script' ? string : M extends 'upload_file' | 'download_file' ? BrowserFileOutcome : M extends 'read_page' | 'get_page_text' | 'find' ? string | BrowserReadV1 | null | void : string | void;
/** An isolated, caller-owned browser. Implement only the capabilities you want exposed. */
export type BrowserDriver = {
    /** Report current browser state, including after a refused or failed call. Failure stops the runner. */
    state: (options?: {
        signal: AbortSignal | undefined;
    }) => BrowserState | Promise<BrowserState>;
} & {
    [M in Exclude<BrowserMember, 'list_tabs'>]?: (args: BrowserArguments<M>, options: {
        signal: AbortSignal | undefined;
    }) => BrowserResult<M> | Promise<BrowserResult<M>>;
};
/** State and validated action passed to consent callbacks, detached from execution. */
export type BrowserConfirmContext = {
    [M in BrowserMember]: {
        /** Selected fixed browser member. */
        readonly member: M;
        /** Fields validated against the advertised function schema. */
        readonly arguments: Readonly<BrowserArguments<M>> & Readonly<Record<string, unknown>>;
        /**
         * Prior observation, not a lock on the document or focused control.
         * Document-specific consent requires the driver to bind and check the original target at execution.
         * Contains no caller-owned browser credentials.
         */
        readonly state: BrowserState;
        /** Identity of this proposed call, for local consent records. */
        readonly call_id: string;
    };
}[BrowserMember];
/** Read members that an application can require consent for before any driver state is observed. */
export type BrowserReadMember = {
    [M in BrowserMember]: (typeof members)[M]['changes'] extends false ? M : never;
}[BrowserMember];
/** No state has been read yet. An application can consult its own policy using the call and tab IDs. */
export type BrowserReadConfirmContext = {
    [M in BrowserReadMember]: {
        readonly phase: 'before_read';
        readonly member: M;
        readonly arguments: Readonly<BrowserArguments<M>> & Readonly<Record<string, unknown>>;
        readonly call_id: string;
        readonly state: null;
    };
}[BrowserReadMember];
/** Browser consent and navigation policy. Callbacks receive detached validated arguments. */
export interface BrowserOptions {
    /** Fixed member allowlist. Omit to expose implemented standard members and list_tabs, without opt-ins. */
    members?: readonly BrowserMember[];
    /** Enable additional members without reconstructing defaults. Cannot be combined with members. */
    additionalMembers?: readonly BrowserMember[];
    /** Required for state changes and selected sensitive reads. Only exactly true authorizes a call. */
    confirm?: (context: BrowserConfirmContext, execution: {
        signal: AbortSignal | undefined;
    }) => boolean | Promise<boolean>;
    /** Required for navigation and new tabs. This does not replace browser-level request interception. */
    urlPolicy?: (context: BrowserConfirmContext, url: string, execution: {
        signal: AbortSignal | undefined;
    }) => boolean | Promise<boolean>;
    /** Local timings and reason codes. No page content or error messages are included. */
    onDiagnostic?: RunnerDiagnosticObserver;
}
/** Explicitly gated reads use the existing confirm callback before the first driver state read. */
export interface BrowserReadOptions extends Omit<BrowserOptions, 'confirm'> {
    confirmReads: readonly BrowserReadMember[];
    confirm: (context: BrowserConfirmContext | BrowserReadConfirmContext, execution: {
        signal: AbortSignal | undefined;
    }) => boolean | Promise<boolean>;
}
/** An intentional, user-safe driver error. Only this message may be sent back to the model. */
export declare class BrowserError extends OpenAIError {
    /** Stable error type for controlled driver failures. */
    name: string;
}
/** Dispatches a fixed set of structured browser functions against a caller-owned driver. */
export declare class BrowserToolset {
    private readonly lifecycle;
    private readonly enabled;
    private readonly driver;
    private readonly options;
    private readonly confirmReads;
    /** A mutating driver requires confirm. A navigable driver also requires urlPolicy. */
    constructor(driver: BrowserDriver, options?: BrowserOptions);
    constructor(driver: BrowserDriver, options: BrowserReadOptions);
    private registerDriver;
    private static requirePolicy;
    /** Function declarations for the enabled members. A partial driver omits unsupported capabilities. */
    tools(): FunctionTool[];
    /** Stop new work. If draining, await the current execute before closing your driver. */
    close(): {
        status: 'closed' | 'draining';
    };
    /** Execute one completed browser function for a caller-managed loop.
     * Accepts generated API call types and checks status before any driver work.
     */
    execute(call: ResponseFunctionToolCall, options?: {
        signal?: AbortSignal;
    }): Promise<ResponseInputItem.FunctionCallOutput>;
    /** Executes or skips a registered call and reports failure without parsing its public output.
     * @internal
     */
    executeWithStatus(call: ResponseFunctionToolCall, signal?: AbortSignal, skip?: boolean, onDiagnostic?: RunnerDiagnosticObserver): Promise<{
        output: ResponseInputItem.FunctionCallOutput;
        ok: boolean;
    }>;
    private approveRead;
    private executeOwned;
    private static perform;
    private policyFor;
    private static output;
    private static authorize;
}
//# sourceMappingURL=browser.d.mts.map