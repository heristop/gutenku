"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BrowserToolset = exports.BrowserError = exports.DEFAULT_BROWSER_MEMBERS = exports.BROWSER_MEMBERS = void 0;
// BrowserError belongs beside the single public helper that consumes it.
// oxlint-disable max-classes-per-file
const error_1 = require("../error.js");
const values_1 = require("../internal/utils/values.js");
const runner_diagnostics_1 = require("../internal/runner-diagnostics.js");
const runner_lifecycle_1 = require("../internal/runner-lifecycle.js");
const ResponseInputItems_1 = require("../lib/responses/ResponseInputItems.js");
const fields = {
    text: { type: 'string' },
    optionalText: { type: ['string', 'null'] },
    strings: { type: 'array', items: { type: 'string' } },
    filter: { type: 'string', enum: ['all', 'interactive'] },
    direction: { type: 'string', enum: ['up', 'down', 'left', 'right'] },
    amount: { type: 'integer', minimum: 0, maximum: Number.MAX_SAFE_INTEGER },
    timeout: { type: 'integer', minimum: 1, maximum: 30000 },
    region: {
        type: 'array',
        items: { type: 'integer', minimum: 0, maximum: Number.MAX_SAFE_INTEGER },
        minItems: 4,
        maxItems: 4,
    },
    coordinate: { type: 'integer', minimum: 0, maximum: Number.MAX_SAFE_INTEGER },
    checked: { type: 'boolean' },
    button: { type: 'string', enum: ['left', 'right', 'middle'] },
    clickCount: { type: 'integer', enum: [1, 2, 3] },
    modifiers: {
        type: 'array',
        items: { type: 'string', enum: ['Control', 'Alt', 'Meta', 'Shift'] },
        minItems: 0,
        maxItems: 4,
        description: 'Unique modifier keys held for this operation.',
    },
    path: {
        type: 'array',
        items: {
            type: 'object',
            properties: {
                x: { type: 'integer', minimum: 0, maximum: Number.MAX_SAFE_INTEGER },
                y: { type: 'integer', minimum: 0, maximum: Number.MAX_SAFE_INTEGER },
            },
            required: ['x', 'y'],
            additionalProperties: false,
        },
        minItems: 2,
        maxItems: 100,
    },
    heldKeys: {
        type: 'array',
        items: { type: 'string', description: 'Nonempty driver-supported key, at most 64 UTF-8 bytes.' },
        minItems: 1,
        maxItems: 8,
        description: 'Unique driver-supported keys held for this operation.',
    },
    holdDuration: { type: 'integer', minimum: 1, maximum: 3000 },
    scope: {
        type: ['string', 'null'],
        description: 'Null or a nonempty driver-issued scope ref, at most 256 UTF-8 bytes. Never a selector.',
    },
    depth: { type: 'integer', minimum: 1, maximum: 32 },
    diagnosticSource: { type: 'string', enum: ['console', 'network'] },
    diagnosticLimit: { type: 'integer', minimum: 1, maximum: 100 },
    script: { type: 'string', description: 'Nonempty page script containing valid Unicode.' },
    fileGrant: { type: 'string', description: 'Nonempty caller-issued file grant, at most 256 UTF-8 bytes.' },
    visibleText: {
        type: 'string',
        description: 'Nonempty visible text, at most 256 UTF-8 bytes after whitespace normalization.',
    },
};
const members = {
    navigate: {
        description: 'Navigate a tab to a URL.',
        changes: true,
        args: { url: 'text', tab_id: 'optionalText' },
    },
    read_page: {
        description: 'Read page structure and opaque interactive element refs.',
        changes: false,
        args: { tab_id: 'optionalText', filter: 'filter' },
    },
    read_page_scoped: {
        description: 'Read within an observed section, or discover sections with a null root. Depth counts DOM levels.',
        changes: false,
        optIn: true,
        args: { tab_id: 'optionalText', root: 'scope', depth: 'depth', filter: 'filter' },
    },
    read_diagnostics: {
        description: 'Read a bounded, driver-filtered console or network summary. Requires approval.',
        changes: false,
        sensitive: true,
        optIn: true,
        args: { tab_id: 'optionalText', source: 'diagnosticSource', limit: 'diagnosticLimit' },
    },
    run_script: {
        description: 'Run an approved script in an explicitly allowed page. Returns text.',
        changes: true,
        optIn: true,
        args: { tab_id: 'optionalText', source: 'script', timeout_ms: 'timeout' },
    },
    upload_file: {
        description: 'Upload a caller-approved file using its task-scoped grant. Requires separate file approval.',
        changes: true,
        optIn: true,
        args: { grant_id: 'fileGrant' },
    },
    download_file: {
        description: 'Retrieve a caller-approved file using its task-scoped grant. Requires separate file approval.',
        changes: true,
        optIn: true,
        args: { grant_id: 'fileGrant' },
    },
    get_page_text: { description: 'Read visible page text.', changes: false, args: { tab_id: 'optionalText' } },
    find: {
        description: 'Find page elements by text or description.',
        changes: false,
        args: { query: 'text', tab_id: 'optionalText' },
    },
    click: {
        description: 'Click an element by its opaque ref.',
        changes: true,
        args: { target: 'text', tab_id: 'optionalText' },
    },
    click_at: {
        description: 'Click full-viewport CSS coordinates with a button, click count, and held modifiers.',
        changes: true,
        optIn: true,
        args: {
            tab_id: 'optionalText',
            x: 'coordinate',
            y: 'coordinate',
            button: 'button',
            click_count: 'clickCount',
            keys: 'modifiers',
        },
    },
    drag_path: {
        description: 'Drag the left button through 2 to 100 full-viewport CSS points with held modifiers.',
        changes: true,
        optIn: true,
        args: { tab_id: 'optionalText', path: 'path', keys: 'modifiers' },
    },
    hold_keys: {
        description: 'Hold driver-supported keys for at most 3000 milliseconds, then release them.',
        changes: true,
        optIn: true,
        args: { tab_id: 'optionalText', keys: 'heldKeys', duration_ms: 'holdDuration' },
    },
    type: {
        description: 'Fill a referenced control or type at the current focus.',
        changes: true,
        args: { text: 'text', target: 'optionalText', tab_id: 'optionalText' },
    },
    key: {
        description: 'Press a key combination.',
        changes: true,
        args: { keys: 'strings', tab_id: 'optionalText' },
    },
    scroll: {
        description: 'Scroll the page in the given direction.',
        changes: true,
        args: { direction: 'direction', amount: 'amount', tab_id: 'optionalText' },
    },
    scroll_to: {
        description: 'Scroll an already observed target into view. Read again before acting.',
        changes: true,
        args: { target: 'text', tab_id: 'optionalText' },
    },
    wait_for: {
        description: 'Wait for reported visible text, within a bounded timeout in milliseconds.',
        changes: false,
        args: { text: 'visibleText', timeout_ms: 'timeout', tab_id: 'optionalText' },
    },
    select_option: {
        description: 'Select values in a referenced select control.',
        changes: true,
        args: { target: 'text', values: 'strings', tab_id: 'optionalText' },
    },
    hover: {
        description: 'Hover over a referenced element.',
        changes: true,
        args: { target: 'text', tab_id: 'optionalText' },
    },
    hover_at: {
        description: 'Move the pointer to full-viewport CSS coordinates without pressing a button.',
        changes: true,
        optIn: true,
        args: { tab_id: 'optionalText', x: 'coordinate', y: 'coordinate' },
    },
    set_checked: {
        description: 'Set an observed checkbox to the requested state. Repeating the same value does not toggle it.',
        changes: true,
        optIn: true,
        args: { tab_id: 'optionalText', target: 'text', checked: 'checked' },
    },
    screenshot: {
        description: 'Capture the visible tab as an image.',
        changes: false,
        args: { tab_id: 'optionalText' },
    },
    zoom: {
        description: 'Capture a region [x0,y0,x1,y1]. Subsequent coordinates stay in the full viewport.',
        changes: false,
        args: { tab_id: 'optionalText', region: 'region' },
    },
    new_tab: { description: 'Open a tab, optionally at a URL.', changes: true, args: { url: 'optionalText' } },
    list_tabs: { description: 'List tabs, titles, URLs and active tab.', changes: false, args: {} },
    switch_tab: { description: 'Activate a tab.', changes: true, args: { tab_id: 'text' } },
    close_tab: { description: 'Close a tab.', changes: true, args: { tab_id: 'text' } },
};
/** Fixed member names, including opt-ins. This list never reads a driver. */
exports.BROWSER_MEMBERS = Object.freeze(
// SAFETY: Keys come from the fixed schema table rather than driver or model data.
Object.keys(members));
/** Standard members. A partial driver advertises only the members it implements. */
exports.DEFAULT_BROWSER_MEMBERS = Object.freeze(exports.BROWSER_MEMBERS.filter((member) => !(0, values_1.hasOwn)(members[member], 'optIn')));
const readOmissions = [
    'report_limit',
    'text_limit',
    'target_limit',
    'work_limit',
    'frame_limit',
    'unsupported_root',
    'unsupported_control',
    'remote_action',
    'private',
    'value',
    'name_limit',
];
/** An intentional, user-safe driver error. Only this message may be sent back to the model. */
class BrowserError extends error_1.OpenAIError {
    constructor() {
        super(...arguments);
        /** Stable error type for controlled driver failures. */
        this.name = 'BrowserError';
    }
}
exports.BrowserError = BrowserError;
function boundedStateText(value, limit, allowEmpty) {
    return ((allowEmpty || value.length > 0) &&
        !/[\uD800-\uDFFF]/u.test(value) &&
        (limit === Number.POSITIVE_INFINITY || new TextEncoder().encode(value).length <= limit));
}
function stateCounter(value) {
    return typeof value === 'number' && Number.isSafeInteger(value) && value >= 0;
}
const valid = {
    text: (value) => typeof value === 'string',
    optionalText: (value) => value === null || typeof value === 'string',
    strings: (value) => Array.isArray(value) && value.every((part) => typeof part === 'string'),
    filter: (value) => value === 'all' || value === 'interactive',
    direction: (value) => typeof value === 'string' && ['up', 'down', 'left', 'right'].includes(value),
    amount: (value) => typeof value === 'number' && Number.isSafeInteger(value) && value >= 0,
    timeout: (value) => typeof value === 'number' && Number.isSafeInteger(value) && value >= 1 && value <= 30000,
    region: (value) => Array.isArray(value) &&
        value.length === 4 &&
        value.every((point) => typeof point === 'number' && Number.isSafeInteger(point) && point >= 0) &&
        value[0] < value[2] &&
        value[1] < value[3],
    visibleText: (value) => 
    // oxlint-disable-next-line unicorn/prefer-string-replace-all -- Public SDK source targets ES2020.
    typeof value === 'string' && boundedStateText(value.replace(/\s+/gu, ' ').trim(), 256, false),
    coordinate: stateCounter,
    checked: (value) => typeof value === 'boolean',
    button: (value) => value === 'left' || value === 'right' || value === 'middle',
    clickCount: (value) => value === 1 || value === 2 || value === 3,
    modifiers: (value) => Array.isArray(value) &&
        value.length <= 4 &&
        new Set(value).size === value.length &&
        value.every((key) => ['Control', 'Alt', 'Meta', 'Shift'].includes(key)),
    path: (value) => Array.isArray(value) &&
        value.length >= 2 &&
        value.length <= 100 &&
        value.every((point) => (0, values_1.isObj)(point) &&
            Object.keys(point).length === 2 &&
            (0, values_1.hasOwn)(point, 'x') &&
            (0, values_1.hasOwn)(point, 'y') &&
            stateCounter(point['x']) &&
            stateCounter(point['y'])),
    heldKeys: (value) => Array.isArray(value) &&
        value.length >= 1 &&
        value.length <= 8 &&
        new Set(value).size === value.length &&
        value.every((key) => typeof key === 'string' && boundedStateText(key, 64, false)),
    holdDuration: (value) => stateCounter(value) && value >= 1 && value <= 3000,
    scope: (value) => value === null || (typeof value === 'string' && boundedStateText(value, 256, false)),
    depth: (value) => stateCounter(value) && value >= 1 && value <= 32,
    diagnosticSource: (value) => value === 'console' || value === 'network',
    diagnosticLimit: (value) => stateCounter(value) && value >= 1 && value <= 100,
    script: (value) => typeof value === 'string' && boundedStateText(value, Number.POSITIVE_INFINITY, false),
    fileGrant: (value) => typeof value === 'string' && boundedStateText(value, 256, false),
};
function validateArguments(member, value) {
    const spec = members[member].args;
    if (typeof value !== 'object' || value === null || Array.isArray(value)) {
        throw new BrowserError('Browser arguments must be an object.');
    }
    const supplied = Object.entries(value);
    const expected = Object.keys(spec);
    if (supplied.length !== expected.length || supplied.some(([key]) => !expected.includes(key))) {
        throw new BrowserError('Browser arguments contain missing or unknown fields.');
    }
    for (const [key, val] of supplied) {
        const field = spec[key];
        if (!field || !valid[field](val)) {
            throw new BrowserError('Invalid browser argument value.');
        }
    }
}
function readText(value, limit, allowEmpty) {
    if (typeof value !== 'string' || value.length > limit || !boundedStateText(value, limit, allowEmpty)) {
        throw new TypeError('Invalid browser read text.');
    }
    return value;
}
function validImageBreakpoint(value) {
    return (value === undefined ||
        value === null ||
        ((0, values_1.isObj)(value) &&
            (0, runner_lifecycle_1.configuredOption)(value, 'mode') === 'explicit' &&
            Object.keys(value).every((key) => key === 'mode')));
}
function validImageSource(value) {
    return value === undefined || value === null || (typeof value === 'string' && !!value.trim());
}
function validImageDetail(value) {
    return (value === undefined ||
        value === null ||
        value === 'auto' ||
        value === 'low' ||
        value === 'high' ||
        value === 'original');
}
function snapshotImage(value, member) {
    try {
        if (!(0, values_1.isObj)(value)) {
            throw new TypeError('Invalid browser image.');
        }
        const keys = Object.keys(value);
        if (keys.some((key) => !['type', 'detail', 'image_url', 'file_id', 'prompt_cache_breakpoint'].includes(key))) {
            throw new TypeError('Invalid browser image.');
        }
        const type = (0, runner_lifecycle_1.configuredOption)(value, 'type');
        const detail = (0, runner_lifecycle_1.configuredOption)(value, 'detail');
        const image_url = (0, runner_lifecycle_1.configuredOption)(value, 'image_url');
        const file_id = (0, runner_lifecycle_1.configuredOption)(value, 'file_id');
        const prompt_cache_breakpoint = (0, runner_lifecycle_1.configuredOption)(value, 'prompt_cache_breakpoint');
        if (type !== 'input_image' ||
            !validImageDetail(detail) ||
            !validImageSource(image_url) ||
            !validImageSource(file_id) ||
            (typeof image_url !== 'string' && typeof file_id !== 'string') ||
            !validImageBreakpoint(prompt_cache_breakpoint)) {
            throw new TypeError('Invalid browser image.');
        }
        return {
            type,
            ...(detail === undefined ? {} : { detail }),
            ...(image_url === undefined ? {} : { image_url }),
            ...(file_id === undefined ? {} : { file_id }),
            ...(prompt_cache_breakpoint === undefined
                ? {}
                : { prompt_cache_breakpoint: prompt_cache_breakpoint === null ? null : { mode: 'explicit' } }),
        };
    }
    catch {
        throw new error_1.OpenAIError(`Browser ${member} must return an input_image with at least one valid image_url or file_id.`);
    }
}
function requireOwnArrayEntry(array, index) {
    if (!(0, values_1.hasOwn)(array, index)) {
        throw new TypeError('Invalid browser array entry.');
    }
}
function optionalReadBoolean(source, key) {
    const value = (0, runner_lifecycle_1.configuredOption)(source, key);
    if (value === undefined || typeof value === 'boolean') {
        return value;
    }
    throw new TypeError('Invalid browser read boolean.');
}
function browserRead(value, textOnly) {
    try {
        if (!(0, values_1.isObj)(value)) {
            throw new TypeError('Invalid browser read.');
        }
        const version = (0, runner_lifecycle_1.configuredOption)(value, 'version');
        const text = (0, runner_lifecycle_1.configuredOption)(value, 'text');
        const elements = (0, runner_lifecycle_1.configuredOption)(value, 'elements');
        const omitted = (0, runner_lifecycle_1.configuredOption)(value, 'omitted');
        if (version !== 1 || !Array.isArray(elements) || !Array.isArray(omitted)) {
            throw new TypeError('Invalid browser read.');
        }
        // Fix each V1 array's bounds once. Driver iterators and getters must not
        // add targets or private metadata after their declared limits were checked.
        const elementCount = elements.length;
        const omittedCount = omitted.length;
        if (!stateCounter(elementCount) ||
            (textOnly && elementCount !== 0) ||
            !stateCounter(omittedCount) ||
            omittedCount > readOmissions.length) {
            throw new TypeError('Invalid browser read.');
        }
        const projected = {
            version: 1,
            text: readText(text, Number.POSITIVE_INFINITY, true),
            elements: Array.from({ length: elementCount }, (_, index) => {
                requireOwnArrayEntry(elements, index);
                const item = elements[index];
                if (!(0, values_1.isObj)(item)) {
                    throw new TypeError('Invalid browser read element.');
                }
                const role = (0, runner_lifecycle_1.configuredOption)(item, 'role');
                if (role !== 'button' &&
                    role !== 'textbox' &&
                    role !== 'combobox' &&
                    role !== 'checkbox' &&
                    role !== 'radio' &&
                    role !== 'slider' &&
                    role !== 'listbox') {
                    throw new TypeError('Invalid browser read role.');
                }
                const entry = {
                    ref: readText((0, runner_lifecycle_1.configuredOption)(item, 'ref'), 256, false),
                    role,
                    label: readText((0, runner_lifecycle_1.configuredOption)(item, 'label'), 256, false),
                };
                const fieldValue = (0, runner_lifecycle_1.configuredOption)(item, 'value');
                if (fieldValue !== undefined) {
                    entry.value = readText(fieldValue, 512, true);
                }
                if (role === 'checkbox' || role === 'radio') {
                    const checked = optionalReadBoolean(item, 'checked');
                    if (checked !== undefined) {
                        entry.checked = checked;
                    }
                }
                const options = (0, runner_lifecycle_1.configuredOption)(item, 'options');
                if (options !== undefined) {
                    if (!Array.isArray(options)) {
                        throw new TypeError('Invalid browser read options.');
                    }
                    const optionCount = options.length;
                    if (!stateCounter(optionCount)) {
                        throw new TypeError('Invalid browser read options.');
                    }
                    entry.options = Array.from({ length: optionCount }, (_option, optionIndex) => {
                        requireOwnArrayEntry(options, optionIndex);
                        const option = options[optionIndex];
                        if (!(0, values_1.isObj)(option)) {
                            throw new TypeError('Invalid browser read option.');
                        }
                        const choice = {
                            label: readText((0, runner_lifecycle_1.configuredOption)(option, 'label'), 256, false),
                            value: readText((0, runner_lifecycle_1.configuredOption)(option, 'value'), 512, true),
                        };
                        if (role === 'listbox') {
                            const selected = optionalReadBoolean(option, 'selected');
                            if (selected !== undefined) {
                                choice.selected = selected;
                            }
                        }
                        return choice;
                    });
                }
                return entry;
            }),
            omitted: Array.from({ length: omittedCount }, (_, index) => {
                requireOwnArrayEntry(omitted, index);
                const code = omitted[index];
                const matched = readOmissions.find((known) => known === code);
                if (matched === undefined) {
                    throw new TypeError('Invalid browser read omission.');
                }
                return matched;
            }),
        };
        if (new Set(projected.elements.map((entry) => entry.ref)).size !== projected.elements.length ||
            new Set(projected.omitted).size !== projected.omitted.length) {
            throw new TypeError('Invalid browser read.');
        }
        return projected;
    }
    catch {
        throw new error_1.OpenAIError('Browser read report failed.');
    }
}
function scopedRead(value) {
    try {
        if (!(0, values_1.isObj)(value)) {
            throw new TypeError('Invalid browser scopes.');
        }
        const source = (0, runner_lifecycle_1.configuredOption)(value, 'scopes');
        if (!Array.isArray(source)) {
            throw new TypeError('Invalid browser scopes.');
        }
        const count = source.length;
        if (!stateCounter(count)) {
            throw new TypeError('Invalid browser scopes.');
        }
        const report = browserRead(value, false);
        const scopes = Array.from({ length: count }, (_, index) => {
            requireOwnArrayEntry(source, index);
            const scope = source[index];
            if (!(0, values_1.isObj)(scope)) {
                throw new TypeError('Invalid browser scope.');
            }
            return {
                ref: readText((0, runner_lifecycle_1.configuredOption)(scope, 'ref'), 256, false),
                label: readText((0, runner_lifecycle_1.configuredOption)(scope, 'label'), 256, false),
            };
        });
        const refs = [...report.elements.map((element) => element.ref), ...scopes.map((scope) => scope.ref)];
        const projected = { ...report, scopes };
        if (new Set(refs).size !== refs.length) {
            throw new TypeError('Invalid browser scopes.');
        }
        return projected;
    }
    catch {
        throw new error_1.OpenAIError('Browser scoped read report failed.');
    }
}
function fileOutcome(value) {
    try {
        if (!(0, values_1.isObj)(value) ||
            Object.keys(value).some((key) => !['version', 'status', 'effect', 'cleanup'].includes(key))) {
            throw new TypeError('Invalid browser file outcome.');
        }
        const version = (0, runner_lifecycle_1.configuredOption)(value, 'version');
        const status = (0, runner_lifecycle_1.configuredOption)(value, 'status');
        const effect = (0, runner_lifecycle_1.configuredOption)(value, 'effect');
        const cleanup = (0, runner_lifecycle_1.configuredOption)(value, 'cleanup');
        if (version !== 1 || (cleanup !== 'not_started' && cleanup !== 'pending' && cleanup !== 'completed')) {
            throw new TypeError('Invalid browser file outcome.');
        }
        if (status === 'completed' && effect === 'completed') {
            return { version, status, effect, cleanup };
        }
        if (status === 'refused' && effect === 'none') {
            return { version, status, effect, cleanup };
        }
        if (status === 'unknown' && effect === 'unknown') {
            return { version, status, effect, cleanup };
        }
        if (status === 'interrupted' && (effect === 'none' || effect === 'unknown')) {
            return { version, status, effect, cleanup };
        }
        throw new TypeError('Invalid browser file outcome.');
    }
    catch {
        throw new error_1.OpenAIError('Browser file result failed.');
    }
}
function snapshotResult(member, result) {
    if (member === 'zoom' || member === 'screenshot') {
        return snapshotImage(result, member);
    }
    if (member === 'read_page_scoped') {
        return scopedRead(result);
    }
    if (member === 'read_diagnostics') {
        return browserRead(result, true);
    }
    if (member === 'upload_file' || member === 'download_file') {
        return fileOutcome(result);
    }
    if (member === 'run_script') {
        try {
            return readText(result, Number.POSITIVE_INFINITY, true);
        }
        catch {
            throw new error_1.OpenAIError('Browser script result failed.');
        }
    }
    if (member === 'list_tabs' || result === null || result === undefined || typeof result === 'string') {
        return result;
    }
    if (member === 'read_page' || member === 'find' || member === 'get_page_text') {
        return browserRead(result, member === 'get_page_text');
    }
    throw new error_1.OpenAIError('Browser actions must return a string, null, or undefined.');
}
function resultCompleted(member, result) {
    if (member === 'upload_file' || member === 'download_file') {
        return (0, values_1.isObj)(result) && result['status'] === 'completed';
    }
    return true;
}
function nullableStateNotice(change, type, sequence, tab_id) {
    if (type === 'navigation_refused') {
        const reason = (0, runner_lifecycle_1.configuredOption)(change, 'reason');
        if (reason !== 'policy' && reason !== 'unsupported') {
            throw new TypeError('Invalid browser change.');
        }
        return { type, sequence, tab_id, reason };
    }
    const status = (0, runner_lifecycle_1.configuredOption)(change, 'status');
    if (status !== 'blocked' && status !== 'started' && status !== 'completed' && status !== 'failed') {
        throw new TypeError('Invalid browser change.');
    }
    return { type, sequence, tab_id, status };
}
function observedState(value) {
    if (!(0, values_1.isObj)(value)) {
        throw new TypeError('Invalid browser observation.');
    }
    const version = (0, runner_lifecycle_1.configuredOption)(value, 'version');
    const sequence = (0, runner_lifecycle_1.configuredOption)(value, 'sequence');
    const dropped_changes = (0, runner_lifecycle_1.configuredOption)(value, 'dropped_changes');
    const title_truncated = (0, runner_lifecycle_1.configuredOption)(value, 'title_truncated');
    const changes = (0, runner_lifecycle_1.configuredOption)(value, 'changes');
    if (version !== 1 ||
        !stateCounter(sequence) ||
        !stateCounter(dropped_changes) ||
        typeof title_truncated !== 'boolean' ||
        !Array.isArray(changes)) {
        throw new TypeError('Invalid browser observation.');
    }
    const { length } = changes;
    if (!stateCounter(length) || sequence !== dropped_changes + length) {
        throw new TypeError('Invalid browser observation.');
    }
    const projected = Array.from({ length }, (_, index) => {
        requireOwnArrayEntry(changes, index);
        const change = changes[index];
        if (!(0, values_1.isObj)(change)) {
            throw new TypeError('Invalid browser change.');
        }
        const type = (0, runner_lifecycle_1.configuredOption)(change, 'type');
        const tab_id = (0, runner_lifecycle_1.configuredOption)(change, 'tab_id');
        const position = dropped_changes + index + 1;
        if ((0, runner_lifecycle_1.configuredOption)(change, 'sequence') !== position) {
            throw new TypeError('Invalid browser change.');
        }
        if (type === 'navigation_refused' || type === 'download') {
            if (tab_id !== null && (typeof tab_id !== 'string' || !boundedStateText(tab_id, 128, false))) {
                throw new TypeError('Invalid browser change.');
            }
            return nullableStateNotice(change, type, position, tab_id);
        }
        if (typeof tab_id !== 'string' || !boundedStateText(tab_id, 128, false)) {
            throw new TypeError('Invalid browser change.');
        }
        if (type === 'dialog_dismissed') {
            const kind = (0, runner_lifecycle_1.configuredOption)(change, 'kind');
            if (kind !== 'alert' &&
                kind !== 'confirm' &&
                kind !== 'prompt' &&
                kind !== 'beforeunload' &&
                kind !== 'other') {
                throw new TypeError('Invalid browser change.');
            }
            return { type, sequence: position, tab_id, kind };
        }
        if (type !== 'tab_opened' && type !== 'tab_closed' && type !== 'tab_switched' && type !== 'navigation') {
            throw new TypeError('Invalid browser change.');
        }
        return { type, sequence: position, tab_id };
    });
    return { version: 1, sequence, dropped_changes, title_truncated, changes: projected };
}
function stateOrigin(url) {
    if (!boundedStateText(url, Number.POSITIVE_INFINITY, false)) {
        throw new TypeError('Invalid browser URL.');
    }
    if (url === 'about:blank') {
        return url;
    }
    const scheme = /^https?:\/\//iu.exec(url)?.[0];
    const authority = scheme ? url.slice(scheme.length).split(/[/?#]/u, 1)[0] : undefined;
    if (!scheme ||
        !authority ||
        [...authority].some((char) => char <= ' ' || char === '\u007F' || char === '\\')) {
        throw new TypeError('Invalid browser URL.');
    }
    // V1 accepts no escaped host/port bytes or scoped IP addresses. Userinfo
    // may still be escaped; it is never included in the projected origin.
    const hostPort = authority.slice(authority.lastIndexOf('@') + 1);
    if (hostPort.includes('%')) {
        throw new TypeError('Invalid browser URL.');
    }
    const value = new URL(scheme + hostPort);
    const host = value.hostname;
    if (!host.startsWith('[')) {
        const labels = host.replace(/\.$/u, '').split('.');
        if (labels.some((label) => !/^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/u.test(label))) {
            throw new TypeError('Invalid browser URL.');
        }
        // WHATWG expands abbreviated, octal, hex and integer IPv4. The shared
        // observation subset allows only the explicit canonical four-octet form.
        if (/^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/u.test(host) && hostPort.split(':')[0] !== host) {
            throw new TypeError('Invalid browser URL.');
        }
    }
    if (!boundedStateText(value.origin, 2048, false)) {
        throw new TypeError('Invalid browser URL.');
    }
    return value.origin;
}
function legacyStateURL(url) {
    const parsed = new URL(url);
    let projected = parsed.protocol;
    if (parsed.protocol === 'http:' || parsed.protocol === 'https:') {
        projected = parsed.origin;
    }
    else if (url === 'about:blank') {
        projected = url;
    }
    if (!boundedStateText(projected, 2048, false)) {
        throw new TypeError('Invalid browser URL.');
    }
    return projected;
}
async function readState(report, signal, previous) {
    try {
        const value = await report({ signal });
        signal?.throwIfAborted();
        if (!(0, values_1.isObj)(value)) {
            throw new TypeError('Invalid browser state.');
        }
        const rawTabs = (0, runner_lifecycle_1.configuredOption)(value, 'tabs');
        if (!Array.isArray(rawTabs)) {
            throw new TypeError('Invalid browser state.');
        }
        const { length } = rawTabs;
        const suppliedObservation = (0, runner_lifecycle_1.configuredOption)(value, 'observation');
        const observation = suppliedObservation === undefined ? undefined : observedState(suppliedObservation);
        if (previous &&
            (!observation ||
                observation.sequence < previous.sequence ||
                observation.dropped_changes < previous.dropped_changes)) {
            throw new TypeError('Invalid browser state.');
        }
        if (previous && observation) {
            const offset = observation.dropped_changes - previous.dropped_changes;
            for (let index = 0; index < previous.sequence - observation.dropped_changes; index += 1) {
                if (JSON.stringify(observation.changes[index]) !== JSON.stringify(previous.changes[offset + index])) {
                    throw new TypeError('Invalid browser state.');
                }
            }
        }
        const tabs = Array.from({ length }, (_, index) => {
            requireOwnArrayEntry(rawTabs, index);
            const tab = rawTabs[index];
            if (!(0, values_1.isObj)(tab)) {
                throw new TypeError('Invalid browser state.');
            }
            const id = (0, runner_lifecycle_1.configuredOption)(tab, 'id');
            const title = (0, runner_lifecycle_1.configuredOption)(tab, 'title');
            const url = (0, runner_lifecycle_1.configuredOption)(tab, 'url');
            const active = (0, runner_lifecycle_1.configuredOption)(tab, 'active');
            if (typeof id !== 'string' ||
                typeof title !== 'string' ||
                typeof url !== 'string' ||
                typeof active !== 'boolean') {
                throw new TypeError('Invalid browser state.');
            }
            if (observation &&
                (!boundedStateText(id, 128, false) || !boundedStateText(title, Number.POSITIVE_INFINITY, true))) {
                throw new TypeError('Invalid browser state.');
            }
            let projectedTitle = title;
            if (observation) {
                // SAFETY: The native encoder reports how many complete UTF-16 units it read.
                const { read } = new TextEncoder().encodeInto(title, new Uint8Array(1024));
                if (read < title.length) {
                    projectedTitle = title.slice(0, read);
                    observation.title_truncated = true;
                }
            }
            return { id, title: projectedTitle, url: observation ? stateOrigin(url) : legacyStateURL(url), active };
        });
        if (new Set(tabs.map((tab) => tab.id)).size !== tabs.length ||
            (tabs.length > 0 && tabs.filter((tab) => tab.active).length !== 1)) {
            throw new TypeError('Invalid browser state.');
        }
        return observation ? { tabs, observation } : { tabs };
    }
    catch {
        signal?.throwIfAborted();
        throw new error_1.OpenAIError('Browser state report failed.');
    }
}
function selectedBrowserMembers(selection) {
    if (selection === undefined) {
        return undefined;
    }
    if (!Array.isArray(selection)) {
        throw new TypeError('Browser members must be an array of unique fixed member names.');
    }
    const requested = new Set();
    const { length } = selection;
    for (let index = 0; index < length; index += 1) {
        const name = (0, values_1.hasOwn)(selection, index) ? selection[index] : undefined;
        if (typeof name !== 'string' || !(0, values_1.hasOwn)(members, name) || requested.has(name)) {
            throw new TypeError('Browser members must be an array of unique fixed member names.');
        }
        requested.add(name);
    }
    return requested;
}
function requiresConsent(member) {
    const spec = members[member];
    return spec.changes || ('sensitive' in spec && (0, values_1.hasOwn)(spec, 'sensitive') && spec.sensitive);
}
// Only fresh helper-owned declarations, consent snapshots, state, and result projections reach this walk.
// oxlint-disable-next-line anti-slop/no-object-parameters -- The private walk handles heterogeneous projected records and arrays, never caller-owned objects.
function protectBrowserOutput(value) {
    const pending = [value];
    for (const record of pending) {
        Object.defineProperty(record, 'toJSON', { value: undefined, writable: true, configurable: true });
        const entries = Object.values(record);
        for (const entry of entries) {
            if (entry !== null && typeof entry === 'object') {
                pending.push(entry);
            }
        }
    }
    return value;
}
// oxlint-disable-next-line anti-slop/no-object-parameters -- Serialize the same helper-owned projections protected by the private walk.
function serializeBrowserOutput(value) {
    protectBrowserOutput(value);
    return JSON.stringify(value);
}
/** Dispatches a fixed set of structured browser functions against a caller-owned driver. */
class BrowserToolset {
    constructor(driver, options = {}) {
        this.lifecycle = new runner_lifecycle_1.RunnerLifecycle();
        this.enabled = new Map();
        this.driver = driver;
        this.options = options;
        const reads = 'confirmReads' in options
            ? selectedBrowserMembers((0, runner_lifecycle_1.configuredOption)(options, 'confirmReads'))
            : undefined;
        if (reads &&
            ([...reads].some((name) => members[name].changes) ||
                typeof (0, runner_lifecycle_1.configuredOption)(options, 'confirm') !== 'function')) {
            throw new TypeError('confirmReads requires read-only members and a confirm callback.');
        }
        this.confirmReads = reads ?? new Set();
        this.registerDriver(driver, options);
        for (const member of this.confirmReads) {
            if (!this.enabled.has(`browser_${member}`)) {
                throw new TypeError('confirmReads must name an enabled browser read.');
            }
        }
    }
    registerDriver(driver, options) {
        const selected = selectedBrowserMembers((0, runner_lifecycle_1.configuredOption)(options, 'members'));
        const additional = selectedBrowserMembers((0, runner_lifecycle_1.configuredOption)(options, 'additionalMembers'));
        if (selected !== undefined && additional !== undefined) {
            throw new TypeError('Use either members or additionalMembers, not both.');
        }
        for (const name of exports.BROWSER_MEMBERS) {
            const spec = members[name];
            if (selected ? !selected.has(name) : (0, values_1.hasOwn)(spec, 'optIn') && !additional?.has(name)) {
                continue;
            }
            const handler = name === 'list_tabs' ? undefined : (0, runner_lifecycle_1.configuredOption)(driver, name);
            if (name === 'list_tabs' || typeof handler === 'function') {
                BrowserToolset.requirePolicy(name, options);
                // SAFETY: Fixed inventory name selects the handler; execution validates its matching argument schema.
                const bound = handler?.bind(driver);
                this.enabled.set(`browser_${name}`, { member: name, handler: bound });
            }
            else if (selected || additional?.has(name)) {
                throw new TypeError('A selected browser member is not implemented by the driver.');
            }
        }
    }
    static requirePolicy(name, options) {
        if (requiresConsent(name) && !(0, runner_lifecycle_1.configuredOption)(options, 'confirm')) {
            throw new TypeError('BrowserToolset requires confirm for state-changing members or sensitive reads.');
        }
        if ((name === 'navigate' || name === 'new_tab') && !(0, runner_lifecycle_1.configuredOption)(options, 'urlPolicy')) {
            throw new TypeError('BrowserToolset requires urlPolicy for navigation.');
        }
    }
    /** Function declarations for the enabled members. A partial driver omits unsupported capabilities. */
    tools() {
        const tools = Array.from(this.enabled, ([name, { member }]) => {
            const spec = members[member];
            const properties = Object.fromEntries(Object.entries(spec.args).map(([key, field]) => [key, structuredClone(fields[field])]));
            return {
                type: 'function',
                name,
                description: spec.description,
                strict: true,
                parameters: {
                    type: 'object',
                    properties,
                    required: Object.keys(properties),
                    additionalProperties: false,
                },
            };
        });
        protectBrowserOutput(tools);
        return tools;
    }
    /** Stop new work. If draining, await the current execute before closing your driver. */
    close() {
        return this.lifecycle.close();
    }
    /** Execute one completed browser function for a caller-managed loop.
     * Accepts generated API call types and checks status before any driver work.
     */
    async execute(call, options = {}) {
        const result = await this.executeWithStatus(call, (0, runner_lifecycle_1.configuredOption)(options, 'signal'));
        return result.output;
    }
    /** Executes or skips a registered call and reports failure without parsing its public output.
     * @internal
     */
    async executeWithStatus(call, signal, skip = false, onDiagnostic) {
        this.lifecycle.enter();
        try {
            const result = await this.executeOwned(call, signal, skip, onDiagnostic);
            protectBrowserOutput(result.output);
            return result;
        }
        finally {
            this.lifecycle.leave();
        }
    }
    async approveRead(snapshot, member, skip, observer, signal) {
        let stage = 'arguments';
        let started = performance.now();
        try {
            if (skip || !('confirmReads' in this.options)) {
                throw new BrowserError('Read declined.');
            }
            const args = JSON.parse(snapshot.arguments);
            validateArguments(member, args);
            // SAFETY: confirmReads contains only fixed read members and the arguments were validated above.
            const context = {
                phase: 'before_read',
                member,
                arguments: args,
                call_id: snapshot.call_id,
                state: null,
            };
            stage = 'approval';
            started = performance.now();
            const approved = await (0, runner_lifecycle_1.configuredOption)(this.options, 'confirm')?.call(this.options, protectBrowserOutput(structuredClone(context)), { signal });
            signal?.throwIfAborted();
            if (approved !== true) {
                throw new BrowserError('Read declined.');
            }
            (0, runner_diagnostics_1.reportDiagnostic)(observer, { api: 'browser', stage, reason: 'completed', call_id: snapshot.call_id, member }, started);
        }
        catch {
            (0, runner_diagnostics_1.reportDiagnostic)(observer, {
                api: 'browser',
                stage,
                reason: (0, runner_diagnostics_1.diagnosticFailure)(stage, signal),
                call_id: snapshot.call_id,
                member,
            }, started);
            signal?.throwIfAborted();
            return {
                type: 'function_call_output',
                call_id: snapshot.call_id,
                output: [
                    { type: 'input_text', text: serializeBrowserOutput({ ok: false, error: 'Read declined.' }) },
                ],
            };
        }
        return undefined;
    }
    // oxlint-disable-next-line eslint/complexity -- TS4.9 needs explicit record checks here to retain the native call type.
    async executeOwned(call, signal, skip = false, onDiagnostic) {
        const snapshot = structuredClone(call);
        if (snapshot === null ||
            typeof snapshot !== 'object' ||
            Array.isArray(snapshot) ||
            !['name', 'type', 'call_id', 'status', 'arguments'].every((field) => (0, values_1.hasOwn)(snapshot, field))) {
            throw new error_1.OpenAIError('BrowserToolset requires a completed registered call.');
        }
        const selected = this.enabled.get(snapshot.name);
        if (!selected ||
            snapshot.type !== 'function_call' ||
            typeof snapshot.call_id !== 'string' ||
            snapshot.status !== 'completed') {
            throw new error_1.OpenAIError('BrowserToolset requires a completed registered call.');
        }
        const replay = (0, ResponseInputItems_1.toResponseInputItems)([snapshot]);
        (0, runner_lifecycle_1.protectRunnerJSON)(replay);
        JSON.stringify(replay);
        signal?.throwIfAborted();
        const { member, handler } = selected;
        // These may change between executions; an active call keeps its selected consent and state callbacks.
        const policy = this.policyFor(member, skip);
        const observer = onDiagnostic ?? (0, runner_lifecycle_1.configuredOption)(this.options, 'onDiagnostic')?.bind(this.options);
        const privateRead = this.confirmReads.has(member);
        if (privateRead) {
            const declined = await this.approveRead(snapshot, member, skip, observer, signal);
            if (declined) {
                return { ok: false, output: declined };
            }
        }
        let report;
        try {
            const reporter = (0, runner_lifecycle_1.configuredOption)(this.driver, 'state');
            if (typeof reporter !== 'function') {
                throw new TypeError('Browser state requires a reporter.');
            }
            report = reporter.bind(this.driver);
        }
        catch {
            throw new error_1.OpenAIError('Browser state report failed.');
        }
        const before = await readState(report, signal);
        signal?.throwIfAborted();
        const { ok, result, failure } = await BrowserToolset.perform(snapshot, member, handler, before, policy, privateRead, skip, observer, signal);
        signal?.throwIfAborted();
        // State failures stop; an uncertain state must never be presented as success or retried.
        const state = await readState(report, signal, (0, values_1.hasOwn)(before, 'observation') ? before.observation : undefined);
        signal?.throwIfAborted();
        return BrowserToolset.output(snapshot.call_id, member, state, ok, result, failure);
    }
    static async perform(snapshot, member, handler, before, policy, privateRead, skip, observer, signal) {
        let stage = 'arguments';
        let started = performance.now();
        let ok = false;
        let result;
        let failure;
        try {
            if (skip) {
                throw new BrowserError('Skipped because an earlier browser call failed. Observe current state and replan.');
            }
            const args = JSON.parse(snapshot.arguments);
            validateArguments(member, args);
            if (member === 'list_tabs') {
                result = before;
            }
            else if (handler) {
                stage = 'approval';
                started = performance.now();
                await BrowserToolset.authorize(member, args, before, snapshot.call_id, policy, signal, privateRead);
                if (!privateRead && (requiresConsent(member) || member === 'navigate' || member === 'new_tab')) {
                    (0, runner_diagnostics_1.reportDiagnostic)(observer, { api: 'browser', stage, reason: 'completed', call_id: snapshot.call_id, member }, started);
                }
                signal?.throwIfAborted();
                stage = 'action';
                started = performance.now();
                result = await handler(args, { signal });
                signal?.throwIfAborted();
            }
            ok = true;
        }
        catch (error) {
            (0, runner_diagnostics_1.reportDiagnostic)(observer, {
                api: 'browser',
                stage,
                call_id: snapshot.call_id,
                member,
                reason: (0, runner_diagnostics_1.diagnosticFailure)(stage, signal),
            }, started);
            signal?.throwIfAborted();
            const message = error instanceof BrowserError ? error.message : undefined;
            failure = typeof message === 'string' ? message : 'Browser operation failed.';
        }
        // Snapshot successful opt-ins before any later callback or await. Contract
        // errors stop the run rather than becoming ordinary driver refusals.
        if (ok) {
            try {
                result = snapshotResult(member, result);
            }
            catch (error) {
                (0, runner_diagnostics_1.reportDiagnostic)(observer, { api: 'browser', stage: 'output', reason: 'invalid_output', call_id: snapshot.call_id, member }, started);
                throw error;
            }
            if (handler && member !== 'list_tabs') {
                (0, runner_diagnostics_1.reportDiagnostic)(observer, { api: 'browser', stage: 'action', reason: 'completed', call_id: snapshot.call_id, member }, started);
            }
            ok = resultCompleted(member, result);
        }
        signal?.throwIfAborted();
        return { ok, result, failure };
    }
    policyFor(member, skip) {
        try {
            return {
                confirm: !skip && requiresConsent(member)
                    ? (0, runner_lifecycle_1.configuredOption)(this.options, 'confirm')?.bind(this.options)
                    : undefined,
                urlPolicy: !skip && (member === 'navigate' || member === 'new_tab')
                    ? (0, runner_lifecycle_1.configuredOption)(this.options, 'urlPolicy')?.bind(this.options)
                    : undefined,
            };
        }
        catch {
            throw new error_1.OpenAIError('Browser operation failed.');
        }
    }
    static output(callId, member, state, ok, result, failure) {
        const content = [
            {
                type: 'input_text',
                text: serializeBrowserOutput({
                    ok,
                    result: member === 'screenshot' || member === 'zoom' ? undefined : result,
                    error: failure,
                    state,
                }),
            },
        ];
        if (ok && (member === 'screenshot' || member === 'zoom')) {
            // SAFETY: snapshotResult validated and detached the selected image before the final state callback.
            const image = result;
            content.push(image);
        }
        return {
            ok,
            output: { type: 'function_call_output', call_id: callId, output: content },
        };
    }
    static async authorize(member, args, state, callId, policy, signal, readApproved = false) {
        // SAFETY: validateArguments matched the captured member against its fixed schema before authorization.
        const context = {
            member,
            arguments: args,
            // Keep absent observations captured for consent without adding them to driver or wire state.
            state: { ...state, observation: (0, values_1.hasOwn)(state, 'observation') ? state.observation : undefined },
            call_id: callId,
        };
        if (member === 'navigate' || member === 'new_tab') {
            const { url } = args;
            if (url !== null &&
                typeof url === 'string' &&
                (await policy.urlPolicy?.(protectBrowserOutput(structuredClone(context)), url, { signal })) !== true) {
                throw new BrowserError('URL policy declined navigation.');
            }
        }
        signal?.throwIfAborted();
        if (!readApproved &&
            requiresConsent(member) &&
            (await policy.confirm?.(protectBrowserOutput(structuredClone(context)), { signal })) !== true) {
            throw new BrowserError('Action declined.');
        }
        signal?.throwIfAborted();
    }
}
exports.BrowserToolset = BrowserToolset;
//# sourceMappingURL=browser.js.map