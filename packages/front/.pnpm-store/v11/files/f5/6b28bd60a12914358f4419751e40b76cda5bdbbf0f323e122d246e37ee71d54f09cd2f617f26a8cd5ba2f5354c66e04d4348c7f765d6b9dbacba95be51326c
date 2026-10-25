import type { Response, ResponseStreamEvent } from "../../resources/responses/responses.js";
import type { ResponseAccumulatorContext, ResponseOutputSnapshot } from "./canonical-output-text.js";
interface ResponseKeepAliveEvent {
    type: 'keepalive';
    sequence_number: number;
}
type ResponseAccumulatorEvent = ResponseStreamEvent | ResponseKeepAliveEvent;
type ResponseLifecycleEvent = Extract<ResponseAccumulatorEvent, {
    type: 'response.created' | 'response.queued' | 'response.in_progress' | 'response.completed' | 'response.failed' | 'response.incomplete';
}>;
export declare function hasRoutedOutputCallIdentity(output: Response['output'][number]): output is Extract<Response['output'][number], {
    type: 'function_call' | 'custom_tool_call' | 'shell_call' | 'shell_call_output';
}>;
export declare function cloneValidatedResponse<T extends ResponseOutputSnapshot>(context: ResponseAccumulatorContext, response: T): T;
export declare function validateResponseOutputItemIdentity(output: Response['output'][number], replacement: Response['output'][number], eventType: string): void;
export declare const responseEventRoutingFields: readonly ["item_id", "output_index", "content_index", "annotation_index", "command_index", "summary_index"];
/** Replace one existing native item, preserving its routing identity and aggregate-text index. */
export declare function replaceResponseOutputItem(context: ResponseAccumulatorContext, snapshot: ResponseOutputSnapshot, outputIndex: number, replacement: Response['output'][number], updateText?: boolean): void;
export declare function createResponseContext(): ResponseAccumulatorContext;
type ResponseOutputEvent = Exclude<ResponseAccumulatorEvent, ResponseLifecycleEvent>;
/** Matches shared events that can change output. Validation still occurs before mutation. */
export declare function isResponseOutputEvent(event: {
    type: string;
}): event is ResponseOutputEvent;
/** Applies the same strict output validation and mutations without requiring response metadata. */
export declare function accumulateWebSocketOutput(event: ResponseOutputEvent, snapshot: ResponseOutputSnapshot, context: ResponseAccumulatorContext): void;
export declare function accumulateResponseWithContext(event: ResponseAccumulatorEvent, snapshot: Response | undefined, context: ResponseAccumulatorContext, rejectInvalidShellTargets?: boolean, prepareSanitizedEvent?: (event: ResponseStreamEvent) => ResponseStreamEvent | null): Response;
export {};
//# sourceMappingURL=response-accumulator.d.ts.map