import type { RequestOptions } from "./request-options.mjs";
import type { OpenAI } from "../client.mjs";
export declare function overlayRequestOptions(original: RequestOptions | undefined, changes: Pick<RequestOptions, 'signal' | 'idempotencyKey' | 'headers' | 'maxRetries'>): RequestOptions;
/** One active owner per helper. Closing admission never waits on caller callbacks. */
export declare class RunnerLifecycle {
    private state;
    enter(): void;
    leave(): void;
    close(): {
        status: "closed" | "draining";
    };
}
/** Recognize local Object.prototype and foreign bases with intact native constructor metadata. */
export declare function isObjectPrototype(value: object): boolean;
/** Read configured fields before recognized native base prototypes; reuse captured own getters. */
export declare function configuredOption<T extends object, K extends keyof T>(options: T, key: K, copied?: T): T[K] | undefined;
export declare function continuationRequestOptions(client: OpenAI, options: RequestOptions | undefined, signal: AbortSignal | undefined): RequestOptions | undefined;
export declare function protectRunnerJSON(value: object): void;
//# sourceMappingURL=runner-lifecycle.d.mts.map