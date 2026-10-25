import type { Stream } from "../../core/streaming.mjs";
import type { ChatCompletionChunk } from "../../resources/chat/completions/completions.mjs";
/** Wire chunks can omit the finish reason, including the final audio expiry update. */
export type ChatCompletionWireChunk = Omit<ChatCompletionChunk, 'choices'> & {
    choices: (Omit<ChatCompletionChunk.Choice, 'finish_reason'> & {
        finish_reason?: ChatCompletionChunk.Choice['finish_reason'];
    })[];
};
export declare function normalizeChatCompletionChunk(chunk: ChatCompletionWireChunk): ChatCompletionChunk;
export declare function normalizeChatCompletionStream(stream: Stream<ChatCompletionWireChunk>): Stream<ChatCompletionChunk>;
//# sourceMappingURL=streaming.d.mts.map