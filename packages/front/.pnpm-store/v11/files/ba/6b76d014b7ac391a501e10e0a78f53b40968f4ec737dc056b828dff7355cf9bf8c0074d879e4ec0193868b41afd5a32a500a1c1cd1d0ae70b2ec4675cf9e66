import type { Response, ResponseOutputItem } from "../../resources/responses/responses.mjs";
import type { ResponsesWebSocketEvent } from "./responses-websocket-lane.mjs";
/** The discriminator is checked; other wire fields can be absent or not schema-valid yet. */
type ProvisionalOutputItem = {
    [Type in ResponseOutputItem['type']]: {
        type: Type;
    } & Partial<Record<Exclude<keyof Extract<ResponseOutputItem, {
        type: Type;
    }>, 'type'>, unknown>>;
}[ResponseOutputItem['type']];
type PartSelector = {
    content_index: number;
    annotation_index?: number;
} | {
    summary_index: number;
};
/** Provisional output is never substituted for a completed, failed, or incomplete response. */
export type ResponsesWebSocketAccumulatorState = {
    phase: 'provisional';
    snapshot: {
        output: ProvisionalOutputItem[];
        output_text: string;
    } & {
        [Field in Exclude<keyof Response, 'output' | 'output_text'>]?: unknown;
    };
} | {
    phase: 'unavailable';
    error: Error;
} | {
    phase: 'terminal';
    event: ResponsesWebSocketEvent;
};
/**
 * Optional, caller-fed reconstruction of one lane's provisional output.
 *
 * Feed the raw events returned by lane.receive(). Use a separate instance per
 * lane. This helper never reads, sends, closes, or registers a listener on a
 * socket; raw events remain in the caller's hands. Tools remain output data.
 * Provisional response metadata is preserved as received and is not yet schema
 * validated. Narrow its unknown fields before use. Omitted fields remain absent.
 * Raw deltas give per-event progress. Use outputAt(event.output_index) when an
 * item finishes, or pass its content_index/summary_index to read only a changed
 * part. For citations use content_index and annotation_index together. A full
 * current, item, or part read materializes its entire nested contents, so
 * reserve those reads for when that complete snapshot is needed.
 *
 * A socket stream can omit the item/content scaffolding required for deltas.
 * Such a response is marked unavailable until the next creation or terminal
 * event. Terminal events, including failures and errors, are retained exactly as
 * delivered, without filling omitted output from provisional data.
 */
export declare class ResponsesWebSocketAccumulator {
    #private;
    /** Materialize the full state. For per-item progress prefer outputAt(). */
    get current(): ResponsesWebSocketAccumulatorState | undefined;
    /**
     * Read one provisional item by wire output_index, or just one message/
     * reasoning part with its wire content_index/summary_index. Add annotation_index
     * to content_index to read one raw citation. Full item and part reads copy all
     * nested entries; prefer a selector for progress on a growing collection.
     * Copies remain valid after further events, and cannot change the accumulator.
     * Returns undefined for absent/mismatched parts or outside provisional output.
     */
    outputAt(outputIndex: number): ProvisionalOutputItem | undefined;
    outputAt(outputIndex: number, part: PartSelector): unknown;
    /** Drop retained provisional and terminal state without affecting any lane. */
    reset(): void;
    /** Record one raw lane event. Unknown event types leave the current state unchanged. */
    add(event: ResponsesWebSocketEvent): void;
}
export {};
//# sourceMappingURL=responses-websocket-accumulator.d.mts.map