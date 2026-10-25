var _ResponseStream_instances, _ResponseStream_params, _ResponseStream_currentResponseSnapshot, _ResponseStream_finalResponse, _ResponseStream_accumulatorContext, _ResponseStream_outputPositions, _ResponseStream_wireByIdentity, _ResponseStream_interimOrderDirty, _ResponseStream_completedOutput, _ResponseStream_unfinishedOutput, _ResponseStream_beginRequest, _ResponseStream_prepareEvent, _ResponseStream_prepareOutputEvent, _ResponseStream_outputAtWireIndex, _ResponseStream_assertComplete, _ResponseStream_recordOutput, _ResponseStream_reorderInterimOutput, _ResponseStream_updateInterimResponse, _ResponseStream_addEvent, _ResponseStream_endRequest;
import { __classPrivateFieldGet, __classPrivateFieldSet } from "../../internal/tslib.mjs";
import { APIError, OpenAIError } from "../../error.mjs";
import { EventStream } from "../EventStream.mjs";
import { accumulateResponseWithContext, cloneValidatedResponse, createResponseContext, hasRoutedOutputCallIdentity, replaceResponseOutputItem, validateResponseOutputItemIdentity, } from "../../internal/responses/response-accumulator.mjs";
import { ensureCanonicalOutputText } from "../../internal/responses/canonical-output-text.mjs";
import { hasOwn, isObj } from "../../internal/utils/values.mjs";
import { addOutputText, maybeParseResponse } from "../ResponsesParser.mjs";
import { Stream } from "../../streaming.mjs";
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
export class ResponseStream extends EventStream {
    /** Creates an unstarted stream, retaining request parameters for structured-output parsing. */
    constructor(params) {
        super();
        _ResponseStream_instances.add(this);
        _ResponseStream_params.set(this, void 0);
        _ResponseStream_currentResponseSnapshot.set(this, void 0);
        _ResponseStream_finalResponse.set(this, void 0);
        _ResponseStream_accumulatorContext.set(this, createResponseContext());
        _ResponseStream_outputPositions.set(this, new Map());
        _ResponseStream_wireByIdentity.set(this, new Map());
        _ResponseStream_interimOrderDirty.set(this, false);
        _ResponseStream_completedOutput.set(this, new Map());
        _ResponseStream_unfinishedOutput.set(this, new Map());
        __classPrivateFieldSet(this, _ResponseStream_params, params, "f");
        this.once('end', () => {
            __classPrivateFieldGet(this, _ResponseStream_outputPositions, "f").clear();
            __classPrivateFieldGet(this, _ResponseStream_wireByIdentity, "f").clear();
            __classPrivateFieldGet(this, _ResponseStream_completedOutput, "f").clear();
            __classPrivateFieldGet(this, _ResponseStream_unfinishedOutput, "f").clear();
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
        __classPrivateFieldGet(this, _ResponseStream_instances, "m", _ResponseStream_beginRequest).call(this);
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
            __classPrivateFieldGet(this, _ResponseStream_instances, "m", _ResponseStream_addEvent).call(this, event, starting_after);
        }
        if (stream.controller.signal?.aborted) {
            throw this._userAbortError();
        }
        return __classPrivateFieldGet(this, _ResponseStream_instances, "m", _ResponseStream_endRequest).call(this);
    }
    async _fromReadableStream(readableStream, options) {
        this._listenForAbort(options?.signal);
        __classPrivateFieldGet(this, _ResponseStream_instances, "m", _ResponseStream_beginRequest).call(this);
        this._connected();
        const stream = Stream.fromReadableStream(readableStream, this.controller);
        for await (const event of stream) {
            __classPrivateFieldGet(this, _ResponseStream_instances, "m", _ResponseStream_addEvent).call(this, event, null);
        }
        if (stream.controller.signal?.aborted) {
            throw this._userAbortError();
        }
        return __classPrivateFieldGet(this, _ResponseStream_instances, "m", _ResponseStream_endRequest).call(this);
    }
    /** Iterates over response events; stopping iteration early aborts the underlying request. */
    [(_ResponseStream_params = new WeakMap(), _ResponseStream_currentResponseSnapshot = new WeakMap(), _ResponseStream_finalResponse = new WeakMap(), _ResponseStream_accumulatorContext = new WeakMap(), _ResponseStream_outputPositions = new WeakMap(), _ResponseStream_wireByIdentity = new WeakMap(), _ResponseStream_interimOrderDirty = new WeakMap(), _ResponseStream_completedOutput = new WeakMap(), _ResponseStream_unfinishedOutput = new WeakMap(), _ResponseStream_instances = new WeakSet(), _ResponseStream_beginRequest = function _ResponseStream_beginRequest() {
        if (this.ended) {
            return;
        }
        __classPrivateFieldSet(this, _ResponseStream_currentResponseSnapshot, undefined, "f");
        __classPrivateFieldSet(this, _ResponseStream_accumulatorContext, createResponseContext(), "f");
        __classPrivateFieldGet(this, _ResponseStream_outputPositions, "f").clear();
        __classPrivateFieldGet(this, _ResponseStream_wireByIdentity, "f").clear();
        __classPrivateFieldSet(this, _ResponseStream_interimOrderDirty, false, "f");
        __classPrivateFieldGet(this, _ResponseStream_completedOutput, "f").clear();
        __classPrivateFieldGet(this, _ResponseStream_unfinishedOutput, "f").clear();
    }, _ResponseStream_prepareEvent = function _ResponseStream_prepareEvent(event) {
        if (event.type === 'response.created' ||
            event.type === 'response.queued' ||
            event.type === 'response.in_progress' ||
            event.type === 'response.completed' ||
            event.type === 'response.failed' ||
            event.type === 'response.incomplete') {
            if (!hasOwn(event, 'response')) {
                throw new OpenAIError('Lifecycle events require their own response field.');
            }
            const { response: wireResponse, ...fields } = event;
            if (!isObj(wireResponse)) {
                throw new OpenAIError('Lifecycle events require a response object.');
            }
            let response = structuredClone(wireResponse);
            if (__classPrivateFieldGet(this, _ResponseStream_currentResponseSnapshot, "f") && response.id !== __classPrivateFieldGet(this, _ResponseStream_currentResponseSnapshot, "f").id) {
                throw new OpenAIError('Lifecycle response identity changed.');
            }
            if (!hasOwn(response, 'output') || response.output == null) {
                let output;
                if (event.type === 'response.completed') {
                    output = [...__classPrivateFieldGet(this, _ResponseStream_completedOutput, "f")]
                        // oxlint-disable-next-line unicorn/no-array-sort -- Sort a fresh array; ES2020 declarations do not include toSorted.
                        .sort(([left], [right]) => left - right)
                        .map(([, item]) => structuredClone(item));
                }
                else if (event.type === 'response.failed' || event.type === 'response.incomplete') {
                    output = [...__classPrivateFieldGet(this, _ResponseStream_outputPositions, "f").keys()]
                        // oxlint-disable-next-line unicorn/no-array-sort -- Sort fresh wire indexes; retain partial and completed items.
                        .sort((left, right) => left - right)
                        .map((index) => structuredClone(__classPrivateFieldGet(this, _ResponseStream_instances, "m", _ResponseStream_outputAtWireIndex).call(this, index)));
                }
                else {
                    output = [];
                }
                response = { ...response, output };
                if (event.type === 'response.completed' ||
                    event.type === 'response.failed' ||
                    event.type === 'response.incomplete') {
                    addOutputText(response);
                }
            }
            if (event.type === 'response.completed') {
                __classPrivateFieldGet(this, _ResponseStream_instances, "m", _ResponseStream_assertComplete).call(this, response);
            }
            return { ...fields, type: event.type, sequence_number: event.sequence_number, response };
        }
        return __classPrivateFieldGet(this, _ResponseStream_instances, "m", _ResponseStream_prepareOutputEvent).call(this, event);
    }, _ResponseStream_prepareOutputEvent = function _ResponseStream_prepareOutputEvent(event) {
        if (!__classPrivateFieldGet(this, _ResponseStream_currentResponseSnapshot, "f") || !hasOwn(event, 'output_index') || !('output_index' in event)) {
            return event;
        }
        const index = event.output_index;
        if (!Number.isSafeInteger(index) || index < 0) {
            throw new OpenAIError('Invalid response output index.');
        }
        let position;
        if (event.type === 'response.output_item.added') {
            if (event.item == null) {
                return null;
            }
            if (__classPrivateFieldGet(this, _ResponseStream_completedOutput, "f").has(index) || __classPrivateFieldGet(this, _ResponseStream_unfinishedOutput, "f").has(index)) {
                throw new OpenAIError(`Duplicate response output index ${index}.`);
            }
            position = __classPrivateFieldGet(this, _ResponseStream_currentResponseSnapshot, "f").output.length;
        }
        else {
            const existing = __classPrivateFieldGet(this, _ResponseStream_outputPositions, "f").get(index);
            if (existing === undefined) {
                throw new OpenAIError(`missing output at index ${index}`);
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
        const position = __classPrivateFieldGet(this, _ResponseStream_outputPositions, "f").get(wireIndex);
        return (__classPrivateFieldGet(this, _ResponseStream_completedOutput, "f").get(wireIndex) ??
            (position === undefined ? undefined : __classPrivateFieldGet(this, _ResponseStream_currentResponseSnapshot, "f")?.output[position]));
    }, _ResponseStream_assertComplete = function _ResponseStream_assertComplete(response) {
        if (__classPrivateFieldGet(this, _ResponseStream_unfinishedOutput, "f").size === 0 && __classPrivateFieldGet(this, _ResponseStream_completedOutput, "f").size === 0) {
            return;
        }
        const finalItems = new Map((response.output ?? []).map((item) => [outputIdentity(item), item]));
        for (const item of __classPrivateFieldGet(this, _ResponseStream_completedOutput, "f").values()) {
            const replacement = finalItems.get(outputIdentity(item));
            if (replacement) {
                validateResponseOutputItemIdentity(item, replacement, 'response.completed');
            }
        }
        for (const [wireIndex, identity] of __classPrivateFieldGet(this, _ResponseStream_unfinishedOutput, "f")) {
            const replacement = finalItems.get(identity);
            if (!replacement) {
                throw new OpenAIError('Cannot complete response with unfinished output items.');
            }
            const previous = __classPrivateFieldGet(this, _ResponseStream_instances, "m", _ResponseStream_outputAtWireIndex).call(this, wireIndex);
            if (!previous) {
                throw new OpenAIError('Cannot complete response with a missing output identity.');
            }
            validateResponseOutputItemIdentity(previous, replacement, 'response.completed');
        }
    }, _ResponseStream_recordOutput = function _ResponseStream_recordOutput(event, response, position) {
        if (event.type === 'response.completed') {
            __classPrivateFieldSet(this, _ResponseStream_interimOrderDirty, false, "f");
            return;
        }
        if (response !== __classPrivateFieldGet(this, _ResponseStream_currentResponseSnapshot, "f")) {
            const previous = new Map();
            for (const [wireIndex, item] of __classPrivateFieldGet(this, _ResponseStream_completedOutput, "f")) {
                previous.set(outputIdentity(item), wireIndex);
            }
            for (const [wireIndex, identity] of __classPrivateFieldGet(this, _ResponseStream_unfinishedOutput, "f")) {
                previous.set(identity, wireIndex);
            }
            const positions = new Map();
            __classPrivateFieldGet(this, _ResponseStream_wireByIdentity, "f").clear();
            for (const [newPosition, item] of response.output.entries()) {
                const identity = outputIdentity(item);
                const oldWireIndex = previous.get(identity);
                const wireIndex = oldWireIndex ?? newPosition;
                const done = __classPrivateFieldGet(this, _ResponseStream_completedOutput, "f").get(wireIndex);
                const unfinished = __classPrivateFieldGet(this, _ResponseStream_unfinishedOutput, "f").get(wireIndex);
                if (positions.has(wireIndex) ||
                    (done && outputIdentity(done) !== identity) ||
                    (unfinished !== undefined && unfinished !== identity)) {
                    throw new OpenAIError('Response snapshot has conflicting output positions.');
                }
                const previousItem = __classPrivateFieldGet(this, _ResponseStream_instances, "m", _ResponseStream_outputAtWireIndex).call(this, wireIndex);
                if (previousItem) {
                    validateResponseOutputItemIdentity(previousItem, item, event.type);
                }
                positions.set(wireIndex, newPosition);
                __classPrivateFieldGet(this, _ResponseStream_wireByIdentity, "f").set(identity, wireIndex);
                if (done) {
                    __classPrivateFieldGet(this, _ResponseStream_completedOutput, "f").set(wireIndex, structuredClone(item));
                }
                else {
                    __classPrivateFieldGet(this, _ResponseStream_unfinishedOutput, "f").set(wireIndex, identity);
                }
            }
            __classPrivateFieldSet(this, _ResponseStream_outputPositions, positions, "f");
            __classPrivateFieldSet(this, _ResponseStream_interimOrderDirty, !['response.failed', 'response.incomplete'].includes(event.type), "f");
            if (['response.created', 'response.queued', 'response.in_progress'].includes(event.type)) {
                __classPrivateFieldGet(this, _ResponseStream_instances, "m", _ResponseStream_reorderInterimOutput).call(this, response);
            }
            return;
        }
        if (position === undefined) {
            return;
        }
        if (event.type === 'response.output_item.added' && event.item != null) {
            __classPrivateFieldGet(this, _ResponseStream_outputPositions, "f").set(event.output_index, position);
            const identity = outputIdentity(event.item);
            __classPrivateFieldGet(this, _ResponseStream_unfinishedOutput, "f").set(event.output_index, identity);
            __classPrivateFieldGet(this, _ResponseStream_wireByIdentity, "f").set(identity, event.output_index);
            __classPrivateFieldSet(this, _ResponseStream_interimOrderDirty, true, "f");
        }
        else if (event.type === 'response.output_item.done') {
            const item = response.output[position];
            if (!item) {
                throw new OpenAIError(`missing output at index ${event.output_index}`);
            }
            __classPrivateFieldGet(this, _ResponseStream_completedOutput, "f").set(event.output_index, structuredClone(item));
            __classPrivateFieldGet(this, _ResponseStream_unfinishedOutput, "f").delete(event.output_index);
        }
    }, _ResponseStream_reorderInterimOutput = function _ResponseStream_reorderInterimOutput(response) {
        if (!__classPrivateFieldGet(this, _ResponseStream_interimOrderDirty, "f")) {
            return;
        }
        const ordered = [...__classPrivateFieldGet(this, _ResponseStream_outputPositions, "f")];
        // oxlint-disable-next-line unicorn/no-array-sort -- Sort the fresh map entries; the source supports ES2020.
        ordered.sort(([left], [right]) => left - right);
        if (ordered.some(([, oldPosition], newPosition) => oldPosition !== newPosition)) {
            const derivedText = __classPrivateFieldGet(this, _ResponseStream_accumulatorContext, "f").canonicalSnapshot === response;
            response.output = ordered.map(([, oldPosition]) => response.output[oldPosition]);
            __classPrivateFieldSet(this, _ResponseStream_outputPositions, new Map(ordered.map(([wireIndex], newPosition) => [wireIndex, newPosition])), "f");
            __classPrivateFieldSet(this, _ResponseStream_accumulatorContext, createResponseContext(), "f");
            if (derivedText) {
                ensureCanonicalOutputText(__classPrivateFieldGet(this, _ResponseStream_accumulatorContext, "f"), response);
            }
        }
        __classPrivateFieldSet(this, _ResponseStream_interimOrderDirty, false, "f");
    }, _ResponseStream_updateInterimResponse = function _ResponseStream_updateInterimResponse(incoming, snapshot) {
        if (!Array.isArray(incoming.output)) {
            return false;
        }
        const suppliedText = hasOwn(incoming, 'output_text') ? incoming.output_text : undefined;
        if (incoming.output.length !== 0) {
            // The temporary response validates only the supplied items. Its derived
            // output_text is not the aggregate for the retained full response.
            const validated = cloneValidatedResponse(createResponseContext(), incoming);
            const replacements = [];
            for (const item of validated.output) {
                const wire = __classPrivateFieldGet(this, _ResponseStream_wireByIdentity, "f").get(outputIdentity(item));
                const position = wire === undefined ? undefined : __classPrivateFieldGet(this, _ResponseStream_outputPositions, "f").get(wire);
                if (wire === undefined || position === undefined) {
                    return false;
                }
                replacements.push({ wire, position, item });
            }
            const updateText = suppliedText == null;
            if (!updateText) {
                // Explicit interim text replaces the full aggregate after any required
                // reorder; deriving text from retained messages here would be discarded.
                __classPrivateFieldGet(this, _ResponseStream_accumulatorContext, "f").canonicalSnapshot = undefined;
            }
            for (const { wire, position, item } of replacements) {
                replaceResponseOutputItem(__classPrivateFieldGet(this, _ResponseStream_accumulatorContext, "f"), snapshot, position, item, updateText);
                if (__classPrivateFieldGet(this, _ResponseStream_completedOutput, "f").has(wire)) {
                    __classPrivateFieldGet(this, _ResponseStream_completedOutput, "f").set(wire, structuredClone(item));
                }
            }
            __classPrivateFieldGet(this, _ResponseStream_instances, "m", _ResponseStream_reorderInterimOutput).call(this, snapshot);
        }
        const { output } = snapshot;
        let outputText = suppliedText;
        if (outputText == null) {
            ensureCanonicalOutputText(__classPrivateFieldGet(this, _ResponseStream_accumulatorContext, "f"), snapshot);
            outputText = snapshot.output_text;
        }
        else {
            __classPrivateFieldGet(this, _ResponseStream_accumulatorContext, "f").canonicalSnapshot = undefined;
        }
        for (const key of Object.keys(snapshot)) {
            if (!hasOwn(incoming, key)) {
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
            throw new APIError(undefined, error, event.message, undefined);
        }
        let dispatchEvent = event;
        let outputPosition;
        const response = accumulateResponseWithContext(event, __classPrivateFieldGet(this, _ResponseStream_currentResponseSnapshot, "f"), __classPrivateFieldGet(this, _ResponseStream_accumulatorContext, "f"), true, (sanitizedEvent) => {
            dispatchEvent = sanitizedEvent;
            const prepared = __classPrivateFieldGet(this, _ResponseStream_instances, "m", _ResponseStream_prepareEvent).call(this, sanitizedEvent);
            if (prepared) {
                if (hasOwn(prepared, 'output_index') && 'output_index' in prepared) {
                    outputPosition = prepared.output_index;
                }
                else if (hasOwn(prepared, 'response') && 'response' in prepared) {
                    dispatchEvent = prepared;
                    if ((prepared.type === 'response.created' ||
                        prepared.type === 'response.queued' ||
                        prepared.type === 'response.in_progress') &&
                        __classPrivateFieldGet(this, _ResponseStream_currentResponseSnapshot, "f")) {
                        if (__classPrivateFieldGet(this, _ResponseStream_instances, "m", _ResponseStream_updateInterimResponse).call(this, prepared.response, __classPrivateFieldGet(this, _ResponseStream_currentResponseSnapshot, "f"))) {
                            return null;
                        }
                        const identities = new Set(prepared.response.output.map(outputIdentity));
                        const retained = __classPrivateFieldGet(this, _ResponseStream_currentResponseSnapshot, "f").output.filter((item) => !identities.has(outputIdentity(item)));
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
        __classPrivateFieldGet(this, _ResponseStream_instances, "m", _ResponseStream_recordOutput).call(this, dispatchEvent, response, outputPosition);
        __classPrivateFieldSet(this, _ResponseStream_currentResponseSnapshot, response, "f");
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
                    throw new OpenAIError(`missing output at index ${wireSnapshot.output_index}`);
                }
                if (output.type === 'message') {
                    const content = output.content[wireSnapshot.content_index];
                    if (!content) {
                        throw new OpenAIError(`missing content at index ${wireSnapshot.content_index}`);
                    }
                    if (content.type !== 'output_text') {
                        throw new OpenAIError(`expected content to be 'output_text', got ${content.type}`);
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
                    throw new OpenAIError(`missing output at index ${wireSnapshot.output_index}`);
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
            throw new OpenAIError(`stream has ended, this shouldn't happen`);
        }
        const snapshot = __classPrivateFieldGet(this, _ResponseStream_currentResponseSnapshot, "f");
        if (!snapshot) {
            throw new OpenAIError(`request ended without sending any events`);
        }
        __classPrivateFieldGet(this, _ResponseStream_instances, "m", _ResponseStream_reorderInterimOutput).call(this, snapshot);
        __classPrivateFieldSet(this, _ResponseStream_currentResponseSnapshot, undefined, "f");
        __classPrivateFieldSet(this, _ResponseStream_accumulatorContext, createResponseContext(), "f");
        __classPrivateFieldGet(this, _ResponseStream_outputPositions, "f").clear();
        __classPrivateFieldGet(this, _ResponseStream_wireByIdentity, "f").clear();
        __classPrivateFieldSet(this, _ResponseStream_interimOrderDirty, false, "f");
        __classPrivateFieldGet(this, _ResponseStream_completedOutput, "f").clear();
        __classPrivateFieldGet(this, _ResponseStream_unfinishedOutput, "f").clear();
        const parsedResponse = finalizeResponse(snapshot, __classPrivateFieldGet(this, _ResponseStream_params, "f"));
        __classPrivateFieldSet(this, _ResponseStream_finalResponse, parsedResponse, "f");
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
        const response = __classPrivateFieldGet(this, _ResponseStream_finalResponse, "f");
        if (!response) {
            throw new OpenAIError('stream ended without producing a Response');
        }
        return response;
    }
}
function outputIdentity(item) {
    return JSON.stringify([
        item.type,
        !hasRoutedOutputCallIdentity(item) && hasOwn(item, 'id') ? item.id : null,
        hasOwn(item, 'call_id') && 'call_id' in item ? item.call_id : null,
    ]);
}
function finalizeResponse(snapshot, params) {
    return maybeParseResponse(snapshot, params);
}
//# sourceMappingURL=ResponseStream.mjs.map