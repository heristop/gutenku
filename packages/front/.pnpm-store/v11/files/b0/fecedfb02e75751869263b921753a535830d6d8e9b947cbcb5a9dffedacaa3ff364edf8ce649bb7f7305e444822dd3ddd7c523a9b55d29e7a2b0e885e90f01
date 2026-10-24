import { APIResource } from "../../../core/resource.mjs";
import * as CompletionsAPI from "./completions.mjs";
import { ChatCompletionStoreMessagesPage } from "./completions.mjs";
import { type CursorPageParams, PagePromise } from "../../../core/pagination.mjs";
import { RequestOptions } from "../../../internal/request-options.mjs";
/**
 * Given a list of messages comprising a conversation, the model will return a response.
 */
export declare class Messages extends APIResource {
    /**
     * Get the messages in a stored chat completion. Only Chat Completions that have
     * been created with the `store` parameter set to `true` will be returned.
     *
     * @example
     * ```ts
     * // Automatically fetches more pages as needed.
     * for await (const chatCompletionStoreMessage of client.chat.completions.messages.list(
     *   'completion_id',
     * )) {
     *   // ...
     * }
     * ```
     */
    list(completionID: string, query?: (MessageListParams & ({
        [K in 'method' | 'path' | 'query' | 'body' | 'headers' | 'maxRetries' | 'stream' | 'timeout' | 'httpAgent' | 'fetchOptions' | 'signal' | 'idempotencyKey' | 'defaultBaseURL' | '__metadata' | '__binaryRequest' | '__binaryResponse' | '__streamClass' | '__security' | '__synthesizeEventData']?: never;
    } | null | undefined)) | null | undefined, options?: RequestOptions): PagePromise<ChatCompletionStoreMessagesPage, CompletionsAPI.ChatCompletionStoreMessage>;
    list(completionID: string, options?: {
        [K in 'headers' | 'maxRetries' | 'timeout' | 'signal' | 'idempotencyKey' | 'query']?: RequestOptions[K];
    } & {
        [K in 'method' | 'path' | 'body' | 'stream' | 'httpAgent' | 'fetchOptions' | 'defaultBaseURL' | '__metadata' | '__binaryRequest' | '__binaryResponse' | '__streamClass' | '__security' | '__synthesizeEventData']?: never;
    }): PagePromise<ChatCompletionStoreMessagesPage, CompletionsAPI.ChatCompletionStoreMessage>;
}
export interface MessageListParams extends CursorPageParams {
    /**
     * Sort order for messages by timestamp. Use `asc` for ascending order or `desc`
     * for descending order. Defaults to `asc`.
     */
    order?: 'asc' | 'desc';
}
export declare namespace Messages {
    export { type MessageListParams as MessageListParams };
}
export { type ChatCompletionStoreMessagesPage };
//# sourceMappingURL=messages.d.mts.map