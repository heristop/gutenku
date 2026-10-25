"use strict";
var _ResponseStream_instances, _ResponseStream_params, _ResponseStream_currentResponseSnapshot, _ResponseStream_finalResponse, _ResponseStream_accumulatorContext, _ResponseStream_outputPositions, _ResponseStream_wireByIdentity, _ResponseStream_interimOrderDirty, _ResponseStream_completedOutput, _ResponseStream_unfinishedOutput, _ResponseStream_beginRequest, _ResponseStream_prepareEvent, _ResponseStream_prepareOutputEvent, _ResponseStream_outputAtWireIndex, _ResponseStream_assertComplete, _ResponseStream_recordOutput, _ResponseStream_reorderInterimOutput, _ResponseStream_updateInterimResponse, _ResponseStream_addEvent, _ResponseStream_endRequest;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResponseStream = void 0;
const tslib_1 = require("../../internal/tslib.js");
const error_1 = require("../../error.js");
const EventStream_1 = require("../EventStream.js");
const response_accumulator_1 = require("../../internal/responses/response-accumulator.js");
const canonical_output_text_1 = require("../../internal/responses/canonical-output-text.js");
const values_1 = require("../../internal/utils/values.js");
const ResponsesParser_1 = require("../ResponsesParser.js");
const streaming_1 = require("../../streaming.js");
// Require every generated native event field here. Unknown hidden transport members remain private.
const nativeEventFields = {
    annotation: true,
    annotation_index: true,
    arguments: true,
    background: true,
    code: true,
    command: true,
    command_index: true,
    content_index: true,
    delta: true,
    input: true,
    item: true,
    item_id: true,
    logprobs: true,
    message: true,
    obfuscation: true,
    output: true,
    output_format: true,
    output_index: true,
    param: true,
    part: true,
    partial_image_b64: true,
    partial_image_index: true,
    quality: true,
    refusal: true,
    response: true,
    sequence_number: true,
    size: true,
    status: true,
    summary_index: true,
    text: true,
    type: true,
};
/** Streams Responses API events while accumulating the latest response and parsed output. */
class ResponseStream extends EventStream_1.EventStream {
    /** Creates an unstarted stream, retaining request parameters for structured-output parsing. */
    constructor(params) {
        super();
        _ResponseStream_instances.add(this);
        _ResponseStream_params.set(this, void 0);
        _ResponseStream_currentResponseSnapshot.set(this, void 0);
        _ResponseStream_finalResponse.set(this, void 0);
        _ResponseStream_accumulatorContext.set(this, (0, response_accumulator_1.createResponseContext)());
        _ResponseStream_outputPositions.set(this, new Map());
        _ResponseStream_wireByIdentity.set(this, new Map());
        _ResponseStream_interimOrderDirty.set(this, false);
        _ResponseStream_completedOutput.set(this, new Map());
        _ResponseStream_unfinishedOutput.set(this, new Map());
        tslib_1.__classPrivateFieldSet(this, _ResponseStream_params, params, "f");
        this.once('end', () => {
            tslib_1.__classPrivateFieldGet(this, _ResponseStream_outputPositions, "f").clear();
            tslib_1.__classPrivateFieldGet(this, _ResponseStream_wireByIdentity, "f").clear();
            tslib_1.__classPrivateFieldGet(this, _ResponseStream_completedOutput, "f").clear();
            tslib_1.__classPrivateFieldGet(this, _ResponseStream_unfinishedOutput, "f").clear();
        });
    }
    /** Starts a new response stream or replays an existing response by its identifier. */
    static createResponse(client, params, options) {
        // SAFETY: The runner's request path forces stream: true; the constructor retains the same caller parameters for parsing metadata.
        const runner = new ResponseStream(params);
        runner._run(() => runner._createOrRetrieveResponse(client, params, {
            ...options,
            __metadata: { ...options?.__metadata, helperMethod: 'stream' },
        }));
        return runner;
    }
    /** Consumes serialized response events from a readable stream in another runtime. */
    static fromReadableStream(stream) {
        const runner = new ResponseStream(null);
        runner._run(() => runner._fromReadableStream(stream));
        return runner;
    }
    async _createOrRetrieveResponse(client, params, options) {
        this._listenForAbort(options?.signal);
        tslib_1.__classPrivateFieldGet(this, _ResponseStream_instances, "m", _ResponseStream_beginRequest).call(this);
        let stream;
        let starting_after = null;
        if ('response_id' in params) {
            // Keep the full replay so that `accumulateResponse()` sees `response.created` and can build
            // complete snapshots before locally filtering events at `starting_after`.
            stream = await client.responses.retrieve(params.response_id, { stream: true }, { ...options, signal: this.controller.signal, stream: true });
            starting_after = params.starting_after ?? null;
        }
        else {
            stream = await client.responses.create({ ...params, stream: true }, { ...options, signal: this.controller.signal });
        }
        this._connected();
        for await (const event of stream) {
            tslib_1.__classPrivateFieldGet(this, _ResponseStream_instances, "m", _ResponseStream_addEvent).call(this, event, starting_after);
        }
        if (stream.controller.signal?.aborted) {
            throw this._userAbortError();
        }
        return tslib_1.__classPrivateFieldGet(this, _ResponseStream_instances, "m", _ResponseStream_endRequest).call(this);
    }
    async _fromReadableStream(readableStream, options) {
        this._listenForAbort(options?.signal);
        tslib_1.__classPrivateFieldGet(this, _ResponseStream_instances, "m", _ResponseStream_beginRequest).call(this);
        this._connected();
        const stream = streaming_1.Stream.fromReadableStream(readableStream, this.controller);
        for await (const event of stream) {
            tslib_1.__classPrivateFieldGet(this, _ResponseStream_instances, "m", _ResponseStream_addEvent).call(this, event, null);
        }
        if (stream.controller.signal?.aborted) {
            throw this._userAbortError();
        }
        return tslib_1.__classPrivateFieldGet(this, _ResponseStream_instances, "m", _ResponseStream_endRequest).call(this);
    }
    /** Iterates over response events; stopping iteration early aborts the underlying request. */
    [(_ResponseStream_params = new WeakMap(), _ResponseStream_currentResponseSnapshot = new WeakMap(), _ResponseStream_finalResponse = new WeakMap(), _ResponseStream_accumulatorContext = new WeakMap(), _ResponseStream_outputPositions = new WeakMap(), _ResponseStream_wireByIdentity = new WeakMap(), _ResponseStream_interimOrderDirty = new WeakMap(), _ResponseStream_completedOutput = new WeakMap(), _ResponseStream_unfinishedOutput = new WeakMap(), _ResponseStream_instances = new WeakSet(), _ResponseStream_beginRequest = function _ResponseStream_beginRequest() {
        if (this.ended) {
            return;
        }
        tslib_1.__classPrivateFieldSet(this, _ResponseStream_currentResponseSnapshot, undefined, "f");
        tslib_1.__classPrivateFieldSet(this, _ResponseStream_accumulatorContext, (0, response_accumulator_1.createResponseContext)(), "f");
        tslib_1.__classPrivateFieldGet(this, _ResponseStream_outputPositions, "f").clear();
        tslib_1.__classPrivateFieldGet(this, _ResponseStream_wireByIdentity, "f").clear();
        tslib_1.__classPrivateFieldSet(this, _ResponseStream_interimOrderDirty, false, "f");
        tslib_1.__classPrivateFieldGet(this, _ResponseStream_completedOutput, "f").clear();
        tslib_1.__classPrivateFieldGet(this, _ResponseStream_unfinishedOutput, "f").clear();
    }, _ResponseStream_prepareEvent = function _ResponseStream_prepareEvent(event) {
        if (event.type === 'response.created' ||
            event.type === 'response.queued' ||
            event.type === 'response.in_progress' ||
            event.type === 'response.completed' ||
            event.type === 'response.failed' ||
            event.type === 'response.incomplete') {
            if (!(0, values_1.hasOwn)(event, 'response')) {
                throw new error_1.OpenAIError('Lifecycle events require their own response field.');
            }
            const { response: wireResponse, ...fields } = event;
            if (!(0, values_1.isObj)(wireResponse)) {
                throw new error_1.OpenAIError('Lifecycle events require a response object.');
            }
            let response = structuredClone(wireResponse);
            if (tslib_1.__classPrivateFieldGet(this, _ResponseStream_currentResponseSnapshot, "f") && response.id !== tslib_1.__classPrivateFieldGet(this, _ResponseStream_currentResponseSnapshot, "f").id) {
                throw new error_1.OpenAIError('Lifecycle response identity changed.');
            }
            if (!(0, values_1.hasOwn)(response, 'output') || response.output == null) {
                let output;
                if (event.type === 'response.completed') {
                    output = [...tslib_1.__classPrivateFieldGet(this, _ResponseStream_completedOutput, "f")]
                        // oxlint-disable-next-line unicorn/no-array-sort -- Sort a fresh array; ES2020 declarations do not include toSorted.
                        .sort(([left], [right]) => left - right)
                        .map(([, item]) => structuredClone(item));
                }
                else if (event.type === 'response.failed' || event.type === 'response.incomplete') {
                    output = [...tslib_1.__classPrivateFieldGet(this, _ResponseStream_outputPositions, "f").keys()]
                        // oxlint-disable-next-line unicorn/no-array-sort -- Sort fresh wire indexes; retain partial and completed items.
                        .sort((left, right) => left - right)
                        .map((index) => structuredClone(tslib_1.__classPrivateFieldGet(this, _ResponseStream_instances, "m", _ResponseStream_outputAtWireIndex).call(this, index)));
                }
                else {
                    output = [];
                }
                response = { ...response, output };
                if (event.type === 'response.completed' ||
                    event.type === 'response.failed' ||
                    event.type === 'response.incomplete') {
                    (0, ResponsesParser_1.addOutputText)(response);
                }
            }
            if (event.type === 'response.completed') {
                tslib_1.__classPrivateFieldGet(this, _ResponseStream_instances, "m", _ResponseStream_assertComplete).call(this, response);
            }
            return { ...fields, type: event.type, sequence_number: event.sequence_number, response };
        }
        return tslib_1.__classPrivateFieldGet(this, _ResponseStream_instances, "m", _ResponseStream_prepareOutputEvent).call(this, event);
    }, _ResponseStream_prepareOutputEvent = function _ResponseStream_prepareOutputEvent(event) {
        if (!tslib_1.__classPrivateFieldGet(this, _ResponseStream_currentResponseSnapshot, "f") || !(0, values_1.hasOwn)(event, 'output_index') || !('output_index' in event)) {
            return event;
        }
        const index = event.output_index;
        if (!Number.isSafeInteger(index) || index < 0) {
            throw new error_1.OpenAIError('Invalid response output index.');
        }
        let position;
        if (event.type === 'response.output_item.added') {
            if (event.item == null) {
                return null;
            }
            if (tslib_1.__classPrivateFieldGet(this, _ResponseStream_completedOutput, "f").has(index) || tslib_1.__classPrivateFieldGet(this, _ResponseStream_unfinishedOutput, "f").has(index)) {
                throw new error_1.OpenAIError(`Duplicate response output index ${index}.`);
            }
            position = tslib_1.__classPrivateFieldGet(this, _ResponseStream_currentResponseSnapshot, "f").output.length;
        }
        else {
            const existing = tslib_1.__classPrivateFieldGet(this, _ResponseStream_outputPositions, "f").get(index);
            if (existing === undefined) {
                throw new error_1.OpenAIError(`missing output at index ${index}`);
            }
            position = existing;
        }
        return new Proxy(event, {
            get(target, property) {
                // oxlint-disable-next-line anti-slop/no-reflect-get -- Preserve the sanitized event fields and their receiver while translating only the dispatch index.
                return property === 'output_index' ? position : Reflect.get(target, property, target);
            },
        });
    }, _ResponseStream_outputAtWireIndex = function _ResponseStream_outputAtWireIndex(wireIndex) {
        const position = tslib_1.__classPrivateFieldGet(this, _ResponseStream_outputPositions, "f").get(wireIndex);
        return (tslib_1.__classPrivateFieldGet(this, _ResponseStream_completedOutput, "f").get(wireIndex) ??
            (position === undefined ? undefined : tslib_1.__classPrivateFieldGet(this, _ResponseStream_currentResponseSnapshot, "f")?.output[position]));
    }, _ResponseStream_assertComplete = function _ResponseStream_assertComplete(response) {
        if (tslib_1.__classPrivateFieldGet(this, _ResponseStream_unfinishedOutput, "f").size === 0 && tslib_1.__classPrivateFieldGet(this, _ResponseStream_completedOutput, "f").size === 0) {
            return;
        }
        const finalItems = new Map((response.output ?? []).map((item) => [outputIdentity(item), item]));
        for (const item of tslib_1.__classPrivateFieldGet(this, _ResponseStream_completedOutput, "f").values()) {
            const replacement = finalItems.get(outputIdentity(item));
            if (replacement) {
                (0, response_accumulator_1.validateResponseOutputItemIdentity)(item, replacement, 'response.completed');
            }
        }
        for (const [wireIndex, identity] of tslib_1.__classPrivateFieldGet(this, _ResponseStream_unfinishedOutput, "f")) {
            const replacement = finalItems.get(identity);
            if (!replacement) {
                throw new error_1.OpenAIError('Cannot complete response with unfinished output items.');
            }
            const previous = tslib_1.__classPrivateFieldGet(this, _ResponseStream_instances, "m", _ResponseStream_outputAtWireIndex).call(this, wireIndex);
            if (!previous) {
                throw new error_1.OpenAIError('Cannot complete response with a missing output identity.');
            }
            (0, response_accumulator_1.validateResponseOutputItemIdentity)(previous, replacement, 'response.completed');
        }
    }, _ResponseStream_recordOutput = function _ResponseStream_recordOutput(event, response, position) {
        if (event.type === 'response.completed') {
            tslib_1.__classPrivateFieldSet(this, _ResponseStream_interimOrderDirty, false, "f");
            return;
        }
        if (response !== tslib_1.__classPrivateFieldGet(this, _ResponseStream_currentResponseSnapshot, "f")) {
            const previous = new Map();
            for (const [wireIndex, item] of tslib_1.__classPrivateFieldGet(this, _ResponseStream_completedOutput, "f")) {
                previous.set(outputIdentity(item), wireIndex);
            }
            for (const [wireIndex, identity] of tslib_1.__classPrivateFieldGet(this, _ResponseStream_unfinishedOutput, "f")) {
                previous.set(identity, wireIndex);
            }
            const positions = new Map();
            tslib_1.__classPrivateFieldGet(this, _ResponseStream_wireByIdentity, "f").clear();
            for (const [newPosition, item] of response.output.entries()) {
                const identity = outputIdentity(item);
                const oldWireIndex = previous.get(identity);
                const wireIndex = oldWireIndex ?? newPosition;
                const done = tslib_1.__classPrivateFieldGet(this, _ResponseStream_completedOutput, "f").get(wireIndex);
                const unfinished = tslib_1.__classPrivateFieldGet(this, _ResponseStream_unfinishedOutput, "f").get(wireIndex);
                if (positions.has(wireIndex) ||
                    (done && outputIdentity(done) !== identity) ||
                    (unfinished !== undefined && unfinished !== identity)) {
                    throw new error_1.OpenAIError('Response snapshot has conflicting output positions.');
                }
                const previousItem = tslib_1.__classPrivateFieldGet(this, _ResponseStream_instances, "m", _ResponseStream_outputAtWireIndex).call(this, wireIndex);
                if (previousItem) {
                    (0, response_accumulator_1.validateResponseOutputItemIdentity)(previousItem, item, event.type);
                }
                positions.set(wireIndex, newPosition);
                tslib_1.__classPrivateFieldGet(this, _ResponseStream_wireByIdentity, "f").set(identity, wireIndex);
                if (done) {
                    tslib_1.__classPrivateFieldGet(this, _ResponseStream_completedOutput, "f").set(wireIndex, structuredClone(item));
                }
                else {
                    tslib_1.__classPrivateFieldGet(this, _ResponseStream_unfinishedOutput, "f").set(wireIndex, identity);
                }
            }
            tslib_1.__classPrivateFieldSet(this, _ResponseStream_outputPositions, positions, "f");
            tslib_1.__classPrivateFieldSet(this, _ResponseStream_interimOrderDirty, !['response.failed', 'response.incomplete'].includes(event.type), "f");
            if (['response.created', 'response.queued', 'response.in_progress'].includes(event.type)) {
                tslib_1.__classPrivateFieldGet(this, _ResponseStream_instances, "m", _ResponseStream_reorderInterimOutput).call(this, response);
            }
            return;
        }
        if (position === undefined) {
            return;
        }
        if (event.type === 'response.output_item.added' && event.item != null) {
            tslib_1.__classPrivateFieldGet(this, _ResponseStream_outputPositions, "f").set(event.output_index, position);
            const identity = outputIdentity(event.item);
            tslib_1.__classPrivateFieldGet(this, _ResponseStream_unfinishedOutput, "f").set(event.output_index, identity);
            tslib_1.__classPrivateFieldGet(this, _ResponseStream_wireByIdentity, "f").set(identity, event.output_index);
            tslib_1.__classPrivateFieldSet(this, _ResponseStream_interimOrderDirty, true, "f");
        }
        else if (event.type === 'response.output_item.done') {
            const item = response.output[position];
            if (!item) {
                throw new error_1.OpenAIError(`missing output at index ${event.output_index}`);
            }
            tslib_1.__classPrivateFieldGet(this, _ResponseStream_completedOutput, "f").set(event.output_index, structuredClone(item));
            tslib_1.__classPrivateFieldGet(this, _ResponseStream_unfinishedOutput, "f").delete(event.output_index);
        }
    }, _ResponseStream_reorderInterimOutput = function _ResponseStream_reorderInterimOutput(response) {
        if (!tslib_1.__classPrivateFieldGet(this, _ResponseStream_interimOrderDirty, "f")) {
            return;
        }
        const ordered = [...tslib_1.__classPrivateFieldGet(this, _ResponseStream_outputPositions, "f")];
        // oxlint-disable-next-line unicorn/no-array-sort -- Sort the fresh map entries; the source supports ES2020.
        ordered.sort(([left], [right]) => left - right);
        if (ordered.some(([, oldPosition], newPosition) => oldPosition !== newPosition)) {
            const derivedText = tslib_1.__classPrivateFieldGet(this, _ResponseStream_accumulatorContext, "f").canonicalSnapshot === response;
            response.output = ordered.map(([, oldPosition]) => response.output[oldPosition]);
            tslib_1.__classPrivateFieldSet(this, _ResponseStream_outputPositions, new Map(ordered.map(([wireIndex], newPosition) => [wireIndex, newPosition])), "f");
            tslib_1.__classPrivateFieldSet(this, _ResponseStream_accumulatorContext, (0, response_accumulator_1.createResponseContext)(), "f");
            if (derivedText) {
                (0, canonical_output_text_1.ensureCanonicalOutputText)(tslib_1.__classPrivateFieldGet(this, _ResponseStream_accumulatorContext, "f"), response);
            }
        }
        tslib_1.__classPrivateFieldSet(this, _ResponseStream_interimOrderDirty, false, "f");
    }, _ResponseStream_updateInterimResponse = function _ResponseStream_updateInterimResponse(incoming, snapshot) {
        if (!Array.isArray(incoming.output)) {
            return false;
        }
        const suppliedText = (0, values_1.hasOwn)(incoming, 'output_text') ? incoming.output_text : undefined;
        if (incoming.output.length !== 0) {
            // The temporary response validates only the supplied items. Its derived
            // output_text is not the aggregate for the retained full response.
            const validated = (0, response_accumulator_1.cloneValidatedResponse)((0, response_accumulator_1.createResponseContext)(), incoming);
            const replacements = [];
            for (const item of validated.output) {
                const wire = tslib_1.__classPrivateFieldGet(this, _ResponseStream_wireByIdentity, "f").get(outputIdentity(item));
                const position = wire === undefined ? undefined : tslib_1.__classPrivateFieldGet(this, _ResponseStream_outputPositions, "f").get(wire);
                if (wire === undefined || position === undefined) {
                    return false;
                }
                replacements.push({ wire, position, item });
            }
            const updateText = suppliedText == null;
            if (!updateText) {
                // Explicit interim text replaces the full aggregate after any required
                // reorder; deriving text from retained messages here would be discarded.
                tslib_1.__classPrivateFieldGet(this, _ResponseStream_accumulatorContext, "f").canonicalSnapshot = undefined;
            }
            for (const { wire, position, item } of replacements) {
                (0, response_accumulator_1.replaceResponseOutputItem)(tslib_1.__classPrivateFieldGet(this, _ResponseStream_accumulatorContext, "f"), snapshot, position, item, updateText);
                if (tslib_1.__classPrivateFieldGet(this, _ResponseStream_completedOutput, "f").has(wire)) {
                    tslib_1.__classPrivateFieldGet(this, _ResponseStream_completedOutput, "f").set(wire, structuredClone(item));
                }
            }
            tslib_1.__classPrivateFieldGet(this, _ResponseStream_instances, "m", _ResponseStream_reorderInterimOutput).call(this, snapshot);
        }
        const { output } = snapshot;
        let outputText = suppliedText;
        if (outputText == null) {
            (0, canonical_output_text_1.ensureCanonicalOutputText)(tslib_1.__classPrivateFieldGet(this, _ResponseStream_accumulatorContext, "f"), snapshot);
            outputText = snapshot.output_text;
        }
        else {
            tslib_1.__classPrivateFieldGet(this, _ResponseStream_accumulatorContext, "f").canonicalSnapshot = undefined;
        }
        for (const key of Object.keys(snapshot)) {
            if (!(0, values_1.hasOwn)(incoming, key)) {
                Reflect.deleteProperty(snapshot, key);
            }
        }
        Object.defineProperties(snapshot, Object.getOwnPropertyDescriptors({ ...incoming, output, output_text: outputText }));
        return true;
    }, _ResponseStream_addEvent = function _ResponseStream_addEvent(event, starting_after) {
        if (this.ended) {
            return;
        }
        const maybeEmit = (name, event) => {
            if (starting_after == null || event.sequence_number > starting_after) {
                // SAFETY: The caller derives the event name from the dispatched event discriminator; this bridge preserves the corresponding payload.
                this._emit(name, event);
            }
        };
        if (event.type === 'error') {
            // First-party providers nest their error payload; retain flat compatibility for
            // serialized events matching the currently published event schema.
            const error = 
            // oxlint-disable-next-line anti-slop/no-runtime-typeof -- An error event can contain malformed server data; validate its container before extracting error details.
            'error' in event && typeof event.error === 'object' && event.error !== null ? event.error : event;
            throw new error_1.APIError(undefined, error, event.message, undefined);
        }
        let dispatchEvent = event;
        let outputPosition;
        const response = (0, response_accumulator_1.accumulateResponseWithContext)(event, tslib_1.__classPrivateFieldGet(this, _ResponseStream_currentResponseSnapshot, "f"), tslib_1.__classPrivateFieldGet(this, _ResponseStream_accumulatorContext, "f"), true, (sanitizedEvent) => {
            dispatchEvent = sanitizedEvent;
            const prepared = tslib_1.__classPrivateFieldGet(this, _ResponseStream_instances, "m", _ResponseStream_prepareEvent).call(this, sanitizedEvent);
            if (prepared) {
                if ((0, values_1.hasOwn)(prepared, 'output_index') && 'output_index' in prepared) {
                    outputPosition = prepared.output_index;
                }
                else if ((0, values_1.hasOwn)(prepared, 'response') && 'response' in prepared) {
                    dispatchEvent = prepared;
                    if ((prepared.type === 'response.created' ||
                        prepared.type === 'response.queued' ||
                        prepared.type === 'response.in_progress') &&
                        tslib_1.__classPrivateFieldGet(this, _ResponseStream_currentResponseSnapshot, "f")) {
                        if (tslib_1.__classPrivateFieldGet(this, _ResponseStream_instances, "m", _ResponseStream_updateInterimResponse).call(this, prepared.response, tslib_1.__classPrivateFieldGet(this, _ResponseStream_currentResponseSnapshot, "f"))) {
                            return null;
                        }
                        const identities = new Set(prepared.response.output.map(outputIdentity));
                        const retained = tslib_1.__classPrivateFieldGet(this, _ResponseStream_currentResponseSnapshot, "f").output.filter((item) => !identities.has(outputIdentity(item)));
                        if (retained.length) {
                            return {
                                ...prepared,
                                response: { ...prepared.response, output: [...prepared.response.output, ...retained] },
                            };
                        }
                    }
                }
            }
            return prepared;
        });
        tslib_1.__classPrivateFieldGet(this, _ResponseStream_instances, "m", _ResponseStream_recordOutput).call(this, dispatchEvent, response, outputPosition);
        tslib_1.__classPrivateFieldSet(this, _ResponseStream_currentResponseSnapshot, response, "f");
        if (dispatchEvent.type === 'response.output_item.added' && dispatchEvent.item == null) {
            return;
        }
        const wireSnapshot = { ...dispatchEvent };
        for (const key of Object.keys(nativeEventFields)) {
            const descriptor = Object.getOwnPropertyDescriptor(dispatchEvent, key);
            if (descriptor && !descriptor.enumerable) {
                Object.defineProperty(wireSnapshot, key, {
                    // oxlint-disable-next-line anti-slop/no-reflect-get -- Read accepted non-enumerable fields from the sanitized Proxy, never the original transport.
                    value: Reflect.get(dispatchEvent, key, dispatchEvent),
                    enumerable: true,
                });
            }
        }
        const eventSnapshot = structuredClone(wireSnapshot);
        maybeEmit('event', eventSnapshot);
        switch (wireSnapshot.type) {
            case 'response.output_text.delta': {
                const output = response.output[outputPosition ?? wireSnapshot.output_index];
                if (!output) {
                    throw new error_1.OpenAIError(`missing output at index ${wireSnapshot.output_index}`);
                }
                if (output.type === 'message') {
                    const content = output.content[wireSnapshot.content_index];
                    if (!content) {
                        throw new error_1.OpenAIError(`missing content at index ${wireSnapshot.content_index}`);
                    }
                    if (content.type !== 'output_text') {
                        throw new error_1.OpenAIError(`expected content to be 'output_text', got ${content.type}`);
                    }
                    maybeEmit('response.output_text.delta', {
                        ...structuredClone(wireSnapshot),
                        snapshot: content.text,
                    });
                }
                break;
            }
            case 'response.function_call_arguments.delta': {
                const output = response.output[outputPosition ?? wireSnapshot.output_index];
                if (!output) {
                    throw new error_1.OpenAIError(`missing output at index ${wireSnapshot.output_index}`);
                }
                if (output.type === 'function_call') {
                    maybeEmit('response.function_call_arguments.delta', {
                        ...structuredClone(wireSnapshot),
                        snapshot: output.arguments,
                    });
                }
                break;
            }
            default: {
                maybeEmit(wireSnapshot.type, eventSnapshot);
                break;
            }
        }
    }, _ResponseStream_endRequest = function _ResponseStream_endRequest() {
        if (this.ended) {
            throw new error_1.OpenAIError(`stream has ended, this shouldn't happen`);
        }
        const snapshot = tslib_1.__classPrivateFieldGet(this, _ResponseStream_currentResponseSnapshot, "f");
        if (!snapshot) {
            throw new error_1.OpenAIError(`request ended without sending any events`);
        }
        tslib_1.__classPrivateFieldGet(this, _ResponseStream_instances, "m", _ResponseStream_reorderInterimOutput).call(this, snapshot);
        tslib_1.__classPrivateFieldSet(this, _ResponseStream_currentResponseSnapshot, undefined, "f");
        tslib_1.__classPrivateFieldSet(this, _ResponseStream_accumulatorContext, (0, response_accumulator_1.createResponseContext)(), "f");
        tslib_1.__classPrivateFieldGet(this, _ResponseStream_outputPositions, "f").clear();
        tslib_1.__classPrivateFieldGet(this, _ResponseStream_wireByIdentity, "f").clear();
        tslib_1.__classPrivateFieldSet(this, _ResponseStream_interimOrderDirty, false, "f");
        tslib_1.__classPrivateFieldGet(this, _ResponseStream_completedOutput, "f").clear();
        tslib_1.__classPrivateFieldGet(this, _ResponseStream_unfinishedOutput, "f").clear();
        const parsedResponse = finalizeResponse(snapshot, tslib_1.__classPrivateFieldGet(this, _ResponseStream_params, "f"));
        tslib_1.__classPrivateFieldSet(this, _ResponseStream_finalResponse, parsedResponse, "f");
        return parsedResponse;
    }, Symbol.asyncIterator)]() {
        return this._createIterator((push) => {
            const onEvent = (event) => push(event);
            this.on('event', onEvent);
            return () => this.off('event', onEvent);
        }, { onReturn: () => this.abort() });
    }
    /**
     * Waits for the stream to end and returns its latest accumulated response.
     *
     * A clean end after at least one response event resolves even when the response is
     * incomplete. Network errors, cancellation, and streams without a response reject.
     */
    async finalResponse() {
        await this.done();
        const response = tslib_1.__classPrivateFieldGet(this, _ResponseStream_finalResponse, "f");
        if (!response) {
            throw new error_1.OpenAIError('stream ended without producing a Response');
        }
        return response;
    }
}
exports.ResponseStream = ResponseStream;
function outputIdentity(item) {
    return JSON.stringify([
        item.type,
        !(0, response_accumulator_1.hasRoutedOutputCallIdentity)(item) && (0, values_1.hasOwn)(item, 'id') ? item.id : null,
        (0, values_1.hasOwn)(item, 'call_id') && 'call_id' in item ? item.call_id : null,
    ]);
}
function finalizeResponse(snapshot, params) {
    return (0, ResponsesParser_1.maybeParseResponse)(snapshot, params);
}
//# sourceMappingURL=ResponseStream.js.map