import { OpenAIError } from "../error.mjs";
import { toResponseInputItems } from "../lib/responses/ResponseInputItems.mjs";
import { reportDiagnostic } from "../internal/runner-diagnostics.mjs";
import { RunnerLifecycle, configuredOption, continuationRequestOptions, isObjectPrototype, overlayRequestOptions, protectRunnerJSON, } from "../internal/runner-lifecycle.mjs";
import { isNativeResponseMessage, isNativeResponseReasoning } from "../internal/native-response-message.mjs";
import { hasOwn, isObj } from "../internal/utils/values.mjs";
// Modern actions calls may omit the checklist. Legacy single actions still require it.
function validateComputerSafetyChecks(call) {
    const checks = configuredOption(call, 'pending_safety_checks');
    if (!configuredOption(call, 'actions') || checks !== undefined) {
        if (!Array.isArray(checks)) {
            throw new OpenAIError('ComputerToolset requires valid pending safety checks before execution.');
        }
        // oxlint-disable-next-line typescript/prefer-for-of -- Validate each JSON slot, including holes that must become invalid nulls.
        for (let index = 0; index < checks.length; index += 1) {
            const check = hasOwn(checks, index) ? checks[index] : undefined;
            const code = check ? configuredOption(check, 'code') : undefined;
            const message = check ? configuredOption(check, 'message') : undefined;
            if (!check ||
                !hasOwn(check, 'id') ||
                typeof check.id !== 'string' ||
                (code !== undefined && code !== null && typeof code !== 'string') ||
                (message !== undefined && message !== null && typeof message !== 'string')) {
                throw new OpenAIError('ComputerToolset requires valid pending safety checks before execution.');
            }
        }
    }
}
function validComputerPoint(point) {
    return (isObj(point) &&
        hasOwn(point, 'x') &&
        hasOwn(point, 'y') &&
        Number.isInteger(point.x) &&
        Number.isInteger(point.y));
}
function isDenseArray(values) {
    if (!Array.isArray(values)) {
        return false;
    }
    // oxlint-disable-next-line typescript/prefer-for-of -- Iteration alone cannot distinguish an inherited entry from an owned slot.
    for (let index = 0; index < values.length; index += 1) {
        if (!hasOwn(values, index)) {
            return false;
        }
    }
    return true;
}
function validComputerKeys(keys) {
    return isDenseArray(keys) && keys.every((key) => typeof key === 'string');
}
function validComputerAction(action) {
    if (!action || !hasOwn(action, 'type')) {
        return false;
    }
    const keys = 'keys' in action ? configuredOption(action, 'keys') : undefined;
    if (keys !== null && keys !== undefined && !validComputerKeys(keys)) {
        return false;
    }
    switch (action.type) {
        case 'click': {
            const button = configuredOption(action, 'button');
            return (validComputerPoint(action) &&
                ['left', 'right', 'wheel', 'back', 'forward'].some((value) => value === button));
        }
        case 'double_click':
        case 'move': {
            return validComputerPoint(action);
        }
        case 'scroll': {
            return (validComputerPoint(action) &&
                Number.isInteger(configuredOption(action, 'scroll_x')) &&
                Number.isInteger(configuredOption(action, 'scroll_y')));
        }
        case 'drag': {
            const path = configuredOption(action, 'path');
            return isDenseArray(path) && path.every(validComputerPoint);
        }
        case 'keypress': {
            return validComputerKeys(configuredOption(action, 'keys'));
        }
        case 'type': {
            return typeof configuredOption(action, 'text') === 'string';
        }
        case 'screenshot':
        case 'wait': {
            return true;
        }
        default: {
            return false;
        }
    }
}
function computerActions(call) {
    const singleAction = configuredOption(call, 'action');
    const batch = configuredOption(call, 'actions');
    if (!hasOwn(call, 'type') ||
        !hasOwn(call, 'status') ||
        !hasOwn(call, 'id') ||
        !hasOwn(call, 'call_id') ||
        call.type !== 'computer_call' ||
        call.status !== 'completed' ||
        typeof call.id !== 'string' ||
        typeof call.call_id !== 'string' ||
        singleAction === null ||
        batch === null ||
        (singleAction !== undefined) === (batch !== undefined)) {
        throw new OpenAIError('ComputerToolset requires a completed call with exactly one of action or actions.');
    }
    validateComputerSafetyChecks(call);
    // SAFETY: The guard above established exactly one of action/actions is present.
    const actions = batch ?? [singleAction];
    if (!Array.isArray(actions) || actions.length === 0) {
        throw new OpenAIError('ComputerToolset requires at least one computer action.');
    }
    if (!isDenseArray(actions)) {
        throw new OpenAIError('ComputerToolset received an invalid computer action.');
    }
    for (const action of actions) {
        if (Array.isArray(action) || !validComputerAction(action)) {
            throw new OpenAIError('ComputerToolset received an invalid computer action.');
        }
    }
    return actions;
}
function snapshotComputerPolicy(options) {
    return {
        signal: configuredOption(options, 'signal'),
        approveSafetyChecks: configuredOption(options, 'approveSafetyChecks')?.bind(options),
        beforeAction: configuredOption(options, 'beforeAction')?.bind(options),
        onDiagnostic: configuredOption(options, 'onDiagnostic')?.bind(options),
    };
}
function computerRunTools(params, maxSteps) {
    if (!Number.isSafeInteger(maxSteps) || maxSteps < 1) {
        throw new TypeError('ComputerToolset maxSteps must be a positive safe integer.');
    }
    const suppliedTools = configuredOption(params, 'tools');
    const tools = suppliedTools === undefined ? [{ type: 'computer' }] : suppliedTools;
    const conversation = configuredOption(params, 'conversation');
    const previousResponse = configuredOption(params, 'previous_response_id');
    if (configuredOption(params, 'stream') ||
        configuredOption(params, 'background') ||
        (conversation !== undefined && conversation !== null) ||
        (previousResponse !== undefined && previousResponse !== null) ||
        !Array.isArray(tools) ||
        tools.length !== 1 ||
        tools.some((tool) => {
            const type = tool && configuredOption(tool, 'type');
            return type !== 'computer' && type !== 'computer_use_preview';
        })) {
        throw new TypeError('ComputerToolset.run requires non-streaming, foreground, one computer tool and explicit input history.');
    }
    return tools;
}
function releaseForcedComputerChoice(choice) {
    if (choice === 'required' ||
        (typeof choice === 'object' &&
            hasOwn(choice, 'type') &&
            ['computer', 'computer_use_preview', 'computer_use'].includes(choice.type))) {
        return 'auto';
    }
    if (typeof choice === 'object' &&
        hasOwn(choice, 'type') &&
        choice.type === 'allowed_tools' &&
        hasOwn(choice, 'mode') &&
        choice.mode === 'required') {
        return { ...choice, mode: 'auto' };
    }
    return choice;
}
function validateComputerChecklistOwner(call) {
    // Match configured options' owner boundary without invoking a checklist getter.
    let owner = call;
    while (owner !== null && !isObjectPrototype(owner)) {
        const descriptor = Object.getOwnPropertyDescriptor(owner, 'pending_safety_checks');
        if (descriptor) {
            if (owner !== call || !descriptor.enumerable || !('value' in descriptor)) {
                throw new OpenAIError('ComputerToolset requires own enumerable data for safety checks.');
            }
            break;
        }
        // SAFETY: Object.getPrototypeOf returns the object's prototype or null.
        owner = Object.getPrototypeOf(owner);
    }
}
function snapshotComputerCall(call) {
    if (Array.isArray(call)) {
        throw new OpenAIError('ComputerToolset requires a call object.');
    }
    validateComputerChecklistOwner(call);
    const snapshot = structuredClone(call);
    for (const action of computerActions(snapshot)) {
        if (action.type === 'double_click' && configuredOption(action, 'keys') === undefined) {
            action.keys = null;
        }
    }
    return snapshot;
}
function actionApprovalCall(call) {
    const checks = configuredOption(call, 'pending_safety_checks') ?? [];
    const actions = configuredOption(call, 'actions');
    if (!Array.isArray(actions)) {
        const view = structuredClone({ ...call, pending_safety_checks: checks });
        protectRunnerJSON(view);
        return view;
    }
    const sources = { actions, pending_safety_checks: checks };
    const view = structuredClone({
        ...call,
        actions: [],
        pending_safety_checks: [],
    });
    // Protect the base before installing accessors so unused batch views stay lazy.
    protectRunnerJSON(view);
    for (const key of ['actions', 'pending_safety_checks']) {
        const source = sources[key];
        let materialized = false;
        let value;
        const save = (replacement) => {
            value = replacement;
            materialized = true;
            if (Object.getOwnPropertyDescriptor(view, key)?.configurable) {
                Object.defineProperty(view, key, {
                    value,
                    writable: true,
                    enumerable: true,
                    configurable: true,
                });
            }
            return value;
        };
        Object.defineProperty(view, key, {
            configurable: true,
            enumerable: true,
            get() {
                if (materialized) {
                    return value;
                }
                const captured = structuredClone(source);
                protectRunnerJSON(captured);
                return save(captured);
            },
            set(replacement) {
                if (Object.isFrozen(view)) {
                    throw new TypeError('Cannot assign to frozen computer approval call.');
                }
                save(replacement);
            },
        });
    }
    return view;
}
// oxlint-disable-next-line complexity -- Validate every supported native output before any computer effect.
function computerCalls(response, earlierIdentities, earlierCallIds) {
    if (configuredOption(response, 'status') !== 'completed') {
        throw new OpenAIError('ComputerToolset.run received a response that is not completed.');
    }
    // Preflight the entire response before any effects, even when unsupported items follow a valid call.
    const calls = [];
    const output = [];
    const source = configuredOption(response, 'output');
    if (!Array.isArray(source)) {
        throw new OpenAIError('ComputerToolset.run received an invalid output array.');
    }
    const { length } = source;
    if (!Number.isSafeInteger(length) || length < 0) {
        throw new OpenAIError('ComputerToolset.run received an invalid output array.');
    }
    let hasFinalMessage = false;
    const identities = new Set();
    const callIds = new Set();
    for (let index = 0; index < length; index += 1) {
        const raw = hasOwn(source, index) ? source[index] : undefined;
        if (!raw) {
            throw new OpenAIError('ComputerToolset.run received an absent output item.');
        }
        const descriptors = Object.getOwnPropertyDescriptors(raw);
        for (const [name, descriptor] of Object.entries(descriptors)) {
            if (descriptor.get) {
                if (name === 'type') {
                    descriptors.type = {
                        value: descriptor.get.call(raw),
                        enumerable: Boolean(descriptor.enumerable),
                        configurable: Boolean(descriptor.configurable),
                    };
                }
                else {
                    descriptor.get = descriptor.get.bind(raw);
                }
            }
        }
        // SAFETY: This shadow has exactly the provider's own descriptors and prototype, with type captured once.
        const captured = Object.create(Object.getPrototypeOf(raw), descriptors);
        const item = hasOwn(captured, 'type') && captured.type === 'computer_call'
            ? snapshotComputerCall(captured)
            : structuredClone(captured);
        if (!hasOwn(item, 'type') || !hasOwn(item, 'id') || typeof item.id !== 'string') {
            throw new OpenAIError('ComputerToolset.run requires emitted output type and id fields.');
        }
        if (item.type === 'computer_call') {
            if (callIds.has(item.call_id) || earlierCallIds.has(item.call_id)) {
                throw new OpenAIError('ComputerToolset.run received a duplicate computer call identity.');
            }
            callIds.add(item.call_id);
            calls.push(item);
        }
        else if (item.type === 'message') {
            if (!isNativeResponseMessage(item)) {
                throw new OpenAIError('ComputerToolset.run requires native assistant content before replay.');
            }
            hasFinalMessage || (hasFinalMessage = item.status === 'completed' && (!hasOwn(item, 'phase') || item.phase !== 'commentary'));
        }
        else if (item.type === 'reasoning') {
            if (!isNativeResponseReasoning(item)) {
                throw new OpenAIError('ComputerToolset.run requires native reasoning content before replay.');
            }
        }
        else if (item.type === 'compaction') {
            if (!hasOwn(item, 'encrypted_content') || typeof item.encrypted_content !== 'string') {
                throw new OpenAIError('ComputerToolset.run requires native compaction content before replay.');
            }
        }
        else {
            throw new OpenAIError('ComputerToolset.run cannot handle a non-computer output item.');
        }
        output.push(item);
        if (identities.has(item.id) || (item.id !== '' && earlierIdentities.has(item.id))) {
            throw new OpenAIError('ComputerToolset.run received a duplicate output item identity.');
        }
        identities.add(item.id);
    }
    if (calls.length === 0 && !hasFinalMessage) {
        throw new OpenAIError('ComputerToolset.run received no completed final message.');
    }
    for (const id of identities) {
        if (id !== '') {
            earlierIdentities.add(id);
        }
    }
    for (const id of callIds) {
        earlierCallIds.add(id);
    }
    return { calls, output };
}
function computerDriverMethod(driver, name) {
    const method = configuredOption(driver, name);
    if (typeof method !== 'function') {
        throw new OpenAIError('ComputerToolset requires callable computer driver methods.');
    }
    return method;
}
/**
 * Dispatches existing computer actions for a caller-owned browser or computer.
 * run() handles computer-only conversations; execute() supports caller-managed loops.
 */
export class ComputerToolset {
    /** The environment remains owned by the caller and is never opened or closed by the helper. */
    constructor(driver) {
        this.lifecycle = new RunnerLifecycle();
        const methods = {
            click: computerDriverMethod(driver, 'click'),
            double_click: computerDriverMethod(driver, 'double_click'),
            drag: computerDriverMethod(driver, 'drag'),
            keypress: computerDriverMethod(driver, 'keypress'),
            move: computerDriverMethod(driver, 'move'),
            screenshot: computerDriverMethod(driver, 'screenshot'),
            scroll: computerDriverMethod(driver, 'scroll'),
            type: computerDriverMethod(driver, 'type'),
            wait: computerDriverMethod(driver, 'wait'),
        };
        this.driver = {
            click: methods.click.bind(driver),
            double_click: methods.double_click.bind(driver),
            drag: methods.drag.bind(driver),
            keypress: methods.keypress.bind(driver),
            move: methods.move.bind(driver),
            screenshot: methods.screenshot.bind(driver),
            scroll: methods.scroll.bind(driver),
            type: methods.type.bind(driver),
            wait: methods.wait.bind(driver),
        };
    }
    /** Stop new work. If draining, await the current operation before closing your driver. */
    close() {
        return this.lifecycle.close();
    }
    /** Snapshot and check a complete call before a runner dispatches any effects from its response.
     * @internal
     */
    static validate(call) {
        return snapshotComputerCall(call);
    }
    /**
     * Run until a completed response contains no computer calls.
     * Defaults to the computer tool when tools is omitted. Other tools, streams,
     * background work, conversation, and previous_response_id are rejected.
     * Replays history (including encrypted reasoning for store:false).
     *
     * @throws {OpenAIError} If a response is incomplete, unsupported, declined, or exceeds maxSteps.
     */
    async run(client, params, options = {}) {
        this.lifecycle.enter();
        try {
            return await this.runOwned(client, params, options);
        }
        finally {
            this.lifecycle.leave();
        }
    }
    // oxlint-disable-next-line complexity -- Ordered requests share cancellation and continuation policy.
    async runOwned(client, params, options) {
        const suppliedMaxSteps = configuredOption(options, 'maxSteps');
        const maxSteps = suppliedMaxSteps === undefined ? 20 : suppliedMaxSteps;
        // Match the ordinary SDK JSON encoder once, then validate and reuse the resulting body.
        const encoded = JSON.stringify(params);
        const decoded = JSON.parse(encoded);
        if (!isObj(decoded)) {
            throw new TypeError('ComputerToolset request must be an object.');
        }
        // SAFETY: computerRunTools validates the serialized modes/tools before the request can reach the API.
        const request = decoded;
        const tools = computerRunTools(request, maxSteps);
        const suppliedInput = configuredOption(request, 'input');
        const input = typeof suppliedInput === 'string'
            ? [{ role: 'user', content: suppliedInput }]
            : [...(suppliedInput === undefined ? [] : suppliedInput)];
        const include = [...(configuredOption(request, 'include') ?? [])];
        if (!include.includes('reasoning.encrypted_content')) {
            include.push('reasoning.encrypted_content');
        }
        const body = { ...request, tools, include, input };
        protectRunnerJSON(body);
        const policy = snapshotComputerPolicy(options);
        let supplied = configuredOption(options, 'requestOptions');
        const ownSignal = supplied && Object.getOwnPropertyDescriptor(supplied, 'signal');
        const signal = policy.signal ?? (supplied && configuredOption(supplied, 'signal')) ?? undefined;
        if (policy.signal || (ownSignal && !('value' in ownSignal)) || (signal && !ownSignal?.enumerable)) {
            // Capture accessors once and expose hidden signals to the native request spread.
            supplied = overlayRequestOptions(supplied, { signal });
        }
        const executionOptions = { ...policy, signal };
        const earlierIdentities = new Set();
        const earlierCallIds = new Set();
        for (const item of input) {
            if (!isObj(item)) {
                continue;
            }
            const id = hasOwn(item, 'id') ? item['id'] : undefined;
            const callId = hasOwn(item, 'call_id') ? item['call_id'] : undefined;
            if (typeof id === 'string' && id !== '') {
                earlierIdentities.add(id);
            }
            if (typeof callId === 'string') {
                earlierCallIds.add(callId);
            }
        }
        for (let step = 0;; step += 1) {
            signal?.throwIfAborted();
            const nextOptions = step === 0 ? supplied : continuationRequestOptions(client, supplied, signal);
            if (nextOptions && Object.getOwnPropertyDescriptor(nextOptions, 'body')?.enumerable) {
                throw new TypeError('ComputerToolset.run requestOptions.body is not supported.');
            }
            let response;
            try {
                // Each response depends on observations from the preceding one.
                // oxlint-disable-next-line no-await-in-loop
                response = await client.responses.create(body, nextOptions);
            }
            catch (error) {
                signal?.throwIfAborted();
                throw error;
            }
            signal?.throwIfAborted();
            const { calls, output } = computerCalls(response, earlierIdentities, earlierCallIds);
            if (calls.length === 0) {
                return response;
            }
            if (step >= maxSteps - 1) {
                throw new OpenAIError('ComputerToolset.run reached maxSteps before executing another computer call.');
            }
            // Capture the native replay as it will be sent, before an action can change the environment.
            const projected = toResponseInputItems(output);
            protectRunnerJSON(projected);
            // SAFETY: computerCalls validated every supported item; toResponseInputItems strips output-only fields.
            // oxlint-disable-next-line unicorn/prefer-structured-clone -- Replay must satisfy the native JSON encoder, not just be cloneable.
            const replay = JSON.parse(JSON.stringify(projected));
            protectRunnerJSON(replay);
            for (const item of replay) {
                body.input.push(item);
            }
            for (const call of calls) {
                // Calls share one environment and must run in server order.
                // oxlint-disable-next-line no-await-in-loop
                const observation = await this.executeOwned(call, executionOptions);
                body.input.push(observation);
            }
            const choice = configuredOption(body, 'tool_choice');
            if (choice !== undefined && choice !== null) {
                body.tool_choice = releaseForcedComputerChoice(choice);
                if (typeof body.tool_choice === 'object') {
                    protectRunnerJSON(body.tool_choice);
                }
            }
        }
    }
    /**
     * Execute one completed call for a caller-managed Responses loop.
     * Returns exactly one observation captured after all actions in the call.
     * Screenshot actions still pass through beforeAction; intermediate captures
     * are omitted because Responses accepts only the final observation.
     * Approval, policy rejection, abort, and driver failures stop immediately.
     */
    async execute(call, options = {}) {
        this.lifecycle.enter();
        try {
            return await this.executeOwned(call, snapshotComputerPolicy(options));
        }
        finally {
            this.lifecycle.leave();
        }
    }
    // oxlint-disable-next-line eslint/complexity -- Keep the execution snapshot shared by safety approval, action approval and dispatch.
    async executeOwned(call, policy) {
        const snapshot = ComputerToolset.validate(call);
        // Use the same native projection as run(), before any callback or effect.
        // SAFETY: Validation permits modern calls to omit only the legacy checklist required by the output type.
        const projected = toResponseInputItems([snapshot]);
        protectRunnerJSON(projected);
        // SAFETY: The validated single computer call retains its native fields after projection.
        // oxlint-disable-next-line unicorn/prefer-structured-clone -- Direct replay must satisfy the native JSON encoder too.
        const replay = JSON.parse(JSON.stringify(projected));
        const actions = computerActions(snapshot);
        for (const action of actions) {
            if ((action.type === 'click' ||
                action.type === 'drag' ||
                action.type === 'move' ||
                action.type === 'scroll') &&
                configuredOption(action, 'keys') === undefined) {
                // Shadow omitted modifiers only in execution copies; wire snapshots must remain JSON values.
                Object.defineProperty(action, 'keys', {
                    value: undefined,
                    enumerable: true,
                    writable: true,
                    configurable: true,
                });
            }
        }
        // The final capture still requires approval when a driver mutates its action.
        // The SDK compiles against ES2020, which does not include Array.at.
        // oxlint-disable-next-line prefer-at
        const needsScreenshot = actions[actions.length - 1]?.type !== 'screenshot';
        policy.signal?.throwIfAborted();
        const checks = configuredOption(snapshot, 'pending_safety_checks') ?? [];
        const nativeChecks = checks.map((check) => ({
            id: check.id,
            code: hasOwn(check, 'code') ? check.code : undefined,
            message: hasOwn(check, 'message') ? check.message : undefined,
        }));
        // Native fields in the captured replay must still describe the same checks.
        const captured = replay[0]?.pending_safety_checks ?? [];
        if (!Array.isArray(captured) ||
            captured.length !== nativeChecks.length ||
            !captured.every((value, index) => isObj(value) &&
                hasOwn(value, 'id') &&
                value['id'] === nativeChecks[index]?.id &&
                (hasOwn(value, 'code') ? value['code'] : undefined) === nativeChecks[index]?.code &&
                (hasOwn(value, 'message') ? value['message'] : undefined) === nativeChecks[index]?.message)) {
            throw new OpenAIError('ComputerToolset serialization changed the pending safety checks.');
        }
        // SAFETY: Every captured native field matches its already validated check; optional extensions are JSON values.
        const acknowledged = captured;
        if (checks.length > 0) {
            // Preserve omissions in replay/acknowledgement; callbacks own absent fields in execution copies.
            for (const check of checks) {
                for (const key of ['code', 'message']) {
                    if (!hasOwn(check, key)) {
                        Object.defineProperty(check, key, {
                            value: undefined,
                            enumerable: true,
                            writable: true,
                            configurable: true,
                        });
                    }
                }
            }
            const started = performance.now();
            try {
                const view = structuredClone({ ...snapshot, pending_safety_checks: checks });
                protectRunnerJSON(view);
                const approved = await policy.approveSafetyChecks?.(view, { signal: policy.signal });
                policy.signal?.throwIfAborted();
                if (approved !== true) {
                    throw new OpenAIError('ComputerToolset requires explicit approval of pending safety checks.');
                }
                reportDiagnostic(policy.onDiagnostic, { api: 'computer', stage: 'approval', reason: 'completed', call_id: snapshot.call_id }, started);
            }
            catch (error) {
                reportDiagnostic(policy.onDiagnostic, {
                    api: 'computer',
                    stage: 'approval',
                    reason: policy.signal?.aborted ? 'cancelled' : 'policy_failed',
                    call_id: snapshot.call_id,
                }, started);
                policy.signal?.throwIfAborted();
                throw error;
            }
        }
        for (const action of actions) {
            // Computer effects are ordered and must never execute concurrently.
            // oxlint-disable-next-line no-await-in-loop
            await this.perform(action, snapshot, policy);
        }
        if (needsScreenshot) {
            await this.perform({ type: 'screenshot' }, snapshot, policy);
        }
        policy.signal?.throwIfAborted();
        const output = await this.captureScreenshot(snapshot, policy);
        const observation = {
            type: 'computer_call_output',
            call_id: snapshot.call_id,
            output,
            ...(checks.length > 0 ? { acknowledged_safety_checks: acknowledged } : {}),
        };
        protectRunnerJSON(observation);
        return observation;
    }
    async captureScreenshot(snapshot, policy) {
        const started = performance.now();
        let output;
        try {
            const supplied = await this.driver.screenshot({ signal: policy.signal });
            policy.signal?.throwIfAborted();
            if (!isObj(supplied)) {
                throw new OpenAIError('ComputerToolset screenshot must return a computer_screenshot with image_url or file_id.');
            }
            const type = configuredOption(supplied, 'type');
            const image_url = configuredOption(supplied, 'image_url');
            const file_id = configuredOption(supplied, 'file_id');
            if (type !== 'computer_screenshot' ||
                (image_url !== undefined && (typeof image_url !== 'string' || !image_url.trim())) ||
                (file_id !== undefined && (typeof file_id !== 'string' || !file_id.trim())) ||
                (image_url === undefined && file_id === undefined)) {
                throw new OpenAIError('ComputerToolset screenshot must return a computer_screenshot with image_url or file_id.');
            }
            output = {
                type,
                ...(image_url === undefined ? {} : { image_url }),
                ...(file_id === undefined ? {} : { file_id }),
            };
            reportDiagnostic(policy.onDiagnostic, {
                api: 'computer',
                stage: 'action',
                reason: 'completed',
                call_id: snapshot.call_id,
                member: 'screenshot',
            }, started);
        }
        catch (error) {
            reportDiagnostic(policy.onDiagnostic, {
                api: 'computer',
                stage: 'action',
                reason: policy.signal?.aborted ? 'cancelled' : 'driver_failed',
                call_id: snapshot.call_id,
                member: 'screenshot',
            }, started);
            policy.signal?.throwIfAborted();
            throw error;
        }
        policy.signal?.throwIfAborted();
        return output;
    }
    async perform(action, call, options) {
        options.signal?.throwIfAborted();
        if (options.beforeAction) {
            await ComputerToolset.approveAction(action, call, options.beforeAction, options);
        }
        options.signal?.throwIfAborted();
        const started = performance.now();
        try {
            const dispatched = structuredClone(action);
            switch (dispatched.type) {
                case 'click': {
                    await this.driver.click(dispatched, { signal: options.signal });
                    break;
                }
                case 'double_click': {
                    await this.driver.double_click(dispatched, { signal: options.signal });
                    break;
                }
                case 'drag': {
                    await this.driver.drag(dispatched, { signal: options.signal });
                    break;
                }
                case 'keypress': {
                    await this.driver.keypress(dispatched, { signal: options.signal });
                    break;
                }
                case 'move': {
                    await this.driver.move(dispatched, { signal: options.signal });
                    break;
                }
                case 'screenshot': {
                    break;
                }
                case 'scroll': {
                    await this.driver.scroll(dispatched, { signal: options.signal });
                    break;
                }
                case 'type': {
                    await this.driver.type(dispatched, { signal: options.signal });
                    break;
                }
                case 'wait': {
                    await this.driver.wait(dispatched, { signal: options.signal });
                    break;
                }
                default: {
                    throw new OpenAIError('ComputerToolset received an unsupported computer action.');
                }
            }
            options.signal?.throwIfAborted();
            if (action.type !== 'screenshot') {
                reportDiagnostic(options.onDiagnostic, {
                    api: 'computer',
                    stage: 'action',
                    reason: 'completed',
                    call_id: call.call_id,
                    member: action.type,
                }, started);
            }
        }
        catch (error) {
            reportDiagnostic(options.onDiagnostic, {
                api: 'computer',
                stage: 'action',
                reason: options.signal?.aborted ? 'cancelled' : 'driver_failed',
                call_id: call.call_id,
                member: action.type,
            }, started);
            options.signal?.throwIfAborted();
            throw error;
        }
        options.signal?.throwIfAborted();
    }
    static async approveAction(action, call, beforeAction, options) {
        const started = performance.now();
        try {
            const view = structuredClone(action);
            protectRunnerJSON(view);
            const approved = await beforeAction(view, actionApprovalCall(call), {
                signal: options.signal,
            });
            options.signal?.throwIfAborted();
            if (approved !== true) {
                throw new OpenAIError('ComputerToolset action declined by beforeAction.');
            }
            reportDiagnostic(options.onDiagnostic, {
                api: 'computer',
                stage: 'approval',
                reason: 'completed',
                call_id: call.call_id,
                member: action.type,
            }, started);
        }
        catch (error) {
            reportDiagnostic(options.onDiagnostic, {
                api: 'computer',
                stage: 'approval',
                reason: options.signal?.aborted ? 'cancelled' : 'policy_failed',
                call_id: call.call_id,
                member: action.type,
            }, started);
            options.signal?.throwIfAborted();
            throw error;
        }
    }
}
//# sourceMappingURL=computer.mjs.map