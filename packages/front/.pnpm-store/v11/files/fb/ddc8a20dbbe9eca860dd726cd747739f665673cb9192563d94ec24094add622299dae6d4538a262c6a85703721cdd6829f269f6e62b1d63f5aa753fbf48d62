import { APIUserAbortError, OpenAIError } from "../../../core/error.mjs";
import { buildHeaders } from "../../../internal/headers.mjs";
import { TurnState } from "../../agents/turn-state.mjs";
import { AgentToolDispatcher } from "./tool-dispatcher.mjs";
import { parseAgentResultPromise } from "./parse-result.mjs";
import { ResultCollection } from "./result-collection.mjs";
async function* dispatchCreationTools(source, dispatcher, signal) {
    const state = new TurnState();
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
            if (signal.aborted && error instanceof APIUserAbortError) {
                return;
            }
            throw error;
        }
    }
}
/** Add beta result collection without replacing custom stream instances.
 * @internal
 */
export function withAgentTurnResult(stream, format, tools) {
    let collection;
    stream.__betaTransformIterator((source) => {
        // A tool result has its own POST endpoint, independent of creation overrides.
        const { path: _path, method: _method, stream: _stream, ...options } = tools?.options ?? {};
        const dispatcher = tools && new AgentToolDispatcher(tools.sessions, tools.handlers, stream.controller, options);
        collection = new ResultCollection(dispatcher ? () => dispatchCreationTools(source, dispatcher, stream.controller.signal) : source, dispatcher ? (name) => dispatcher.canHandle(name) : undefined, undefined, stream.controller.signal);
        return () => collection.iterate();
    });
    let parsed;
    const result = Object.assign(stream, {
        finalResult: () => (parsed ?? (parsed = parseAgentResultPromise(collection.finalResult(), format))),
        withResultCollection: () => {
            collection.enable();
            return result;
        },
    });
    return result;
}
/** Remove local callbacks without changing ordinary creation requests. @internal */
export function captureCreationTools(body, options) {
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
        throw new OpenAIError('Creation tool handlers cannot customize request body serialization');
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
        throw new OpenAIError('toolHandlers requires stream: true');
    }
    capturedOptions.headers = buildHeaders([capturedOptions.headers]);
    descriptors.stream = { value: stream, enumerable: true, configurable: true, writable: true };
    // SAFETY: Preserve request fields, omitting callbacks and fixing the validated streaming mode.
    const request = Object.create(Object.getPrototypeOf(body), descriptors);
    return {
        body: request,
        options: capturedOptions,
        handlers: handlers && Object.fromEntries(Object.entries(handlers)),
    };
}
//# sourceMappingURL=agent-session-create-stream.mjs.map