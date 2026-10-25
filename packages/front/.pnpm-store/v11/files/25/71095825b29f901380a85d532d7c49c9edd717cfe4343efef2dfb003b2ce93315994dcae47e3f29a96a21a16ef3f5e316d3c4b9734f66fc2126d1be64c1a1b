import type { Response } from "../../resources/responses/responses.mjs";
import { OutputTextIndex } from "./output-text-index.mjs";
type ResponseOutput = Response['output'][number];
export type ResponseOutputSnapshot = Pick<Response, 'output' | 'output_text'>;
export interface ResponseAccumulatorContext {
    canonicalSnapshot: ResponseOutputSnapshot | undefined;
    outputTextLengths: WeakMap<ResponseOutput, number>;
    outputTextIndex: OutputTextIndex;
    /** Only the caller-fed WebSocket helper can defer the aggregate until a snapshot is read. */
    deferOutputText?: boolean;
    outputTextDirty?: boolean;
}
export declare function createCanonicalResponseContext(): ResponseAccumulatorContext;
export declare function getOutputText(context: ResponseAccumulatorContext, output: ResponseOutput): string;
export declare function ensureCanonicalOutputText(context: ResponseAccumulatorContext, snapshot: ResponseOutputSnapshot): void;
export declare function cloneResponse<T extends ResponseOutputSnapshot>(context: ResponseAccumulatorContext, response: T): T;
export declare function updateCachedOutputTextLength(context: ResponseAccumulatorContext, output: ResponseOutput, outputIndex: number, previousText: string, nextText: string): void;
export declare function updateOutputText(context: ResponseAccumulatorContext, snapshot: ResponseOutputSnapshot, outputIndex: number, previousText: string, nextText: string, contentIndex?: number): void;
export {};
//# sourceMappingURL=canonical-output-text.d.mts.map