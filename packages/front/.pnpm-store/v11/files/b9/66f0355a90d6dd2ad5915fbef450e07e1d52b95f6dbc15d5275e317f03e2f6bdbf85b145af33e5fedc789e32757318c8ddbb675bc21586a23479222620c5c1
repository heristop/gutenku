"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.withAgentTurnResult = withAgentTurnResult;
exports.captureCreationTools = captureCreationTools;
const error_1 = require("../../../core/error.js");
const headers_1 = require("../../../internal/headers.js");
const turn_state_1 = require("../../agents/turn-state.js");
const tool_dispatcher_1 = require("./tool-dispatcher.js");
const parse_result_1 = require("./parse-result.js");
const result_collection_1 = require("./result-collection.js");
async function* dispatchCreationTools(source, dispatcher, signal) {
    const state = new turn_state_1.TurnState();
    let sessionID;
    for await (const event of { [Symbol.asyncIterator]: source }) {
        if (event.type === 'agent.session.created') {
            sessionID ?? (sessionID = event.session.id);
        }
        const dispatch = state.accept(event) ? dispatcher.prepare(state.call(event), sessionID) : undefined;
        yield event;
        if (signal.aborted) {
            return;
        }
        try {
            await dispatch?.();
        }
        catch (error) {
            if (signal.aborted && error instanceof error_1.APIUserAbortError) {
                return;
            }
            throw error;
        }
    }
}
/** Add beta result collection without replacing custom stream instances.
 * @internal
 */
function withAgentTurnResult(stream, format, tools) {
    let collection;
    stream.__betaTransformIterator((source) => {
        // A tool result has its own POST endpoint, independent of creation overrides.
        const { path: _path, method: _method, stream: _stream, ...options } = tools?.options ?? {};
        const dispatcher = tools && new tool_dispatcher_1.AgentToolDispatcher(tools.sessions, tools.handlers, stream.controller, options);
        collection = new result_collection_1.ResultCollection(dispatcher ? () => dispatchCreationTools(source, dispatcher, stream.controller.signal) : source, dispatcher ? (name) => dispatcher.canHandle(name) : undefined, undefined, stream.controller.signal);
        return () => collection.iterate();
    });
    let parsed;
    const result = Object.assign(stream, {
        finalResult: () => (parsed ?? (parsed = (0, parse_result_1.parseAgentResultPromise)(collection.finalResult(), format))),
        withResultCollection: () => {
            collection.enable();
            return result;
        },
    });
    return result;
}
/** Remove local callbacks without changing ordinary creation requests. @internal */
function captureCreationTools(body, options) {
    const descriptor = Object.getOwnPropertyDescriptor(body, 'toolHandlers');
    if (!descriptor) {
        return { body, options };
    }
    const handlers = body.toolHandlers;
    if (handlers === undefined && 'value' in descriptor) {
        return { body, options };
    }
    const descriptors = Object.getOwnPropertyDescriptors(body);
    delete descriptors.toolHandlers;
    const capturedOptions = { ...options };
    if ('toJSON' in body || capturedOptions.body !== undefined) {
        throw new error_1.OpenAIError('Creation tool handlers cannot customize request body serialization');
    }
    if (handlers === undefined) {
        // SAFETY: Preserve request fields while removing the accessor so serialization cannot evaluate it again.
        return {
            body: Object.create(Object.getPrototypeOf(body), descriptors),
            options: capturedOptions,
        };
    }
    const { stream } = body;
    if (stream !== true) {
        throw new error_1.OpenAIError('toolHandlers requires stream: true');
    }
    capturedOptions.headers = (0, headers_1.buildHeaders)([capturedOptions.headers]);
    descriptors.stream = { value: stream, enumerable: true, configurable: true, writable: true };
    // SAFETY: Preserve request fields, omitting callbacks and fixing the validated streaming mode.
    const request = Object.create(Object.getPrototypeOf(body), descriptors);
    return {
        body: request,
        options: capturedOptions,
        handlers: handlers && Object.fromEntries(Object.entries(handlers)),
    };
}
//# sourceMappingURL=agent-session-create-stream.js.map