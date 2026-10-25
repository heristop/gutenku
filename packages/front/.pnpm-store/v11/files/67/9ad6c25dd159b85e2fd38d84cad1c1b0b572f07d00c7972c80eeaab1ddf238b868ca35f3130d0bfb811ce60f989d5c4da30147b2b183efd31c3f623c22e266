import { APIResource } from "../../core/resource.mjs";
import { APIPromise } from "../../core/api-promise.mjs";
import { CursorPage, type CursorPageParams, PagePromise } from "../../core/pagination.mjs";
import { type Uploadable } from "../../core/uploads.mjs";
import { RequestOptions } from "../../internal/request-options.mjs";
/**
 * Turn audio into text or text into audio.
 */
export declare class VoiceConsents extends APIResource {
    /**
     * Upload a voice consent recording.
     *
     * @example
     * ```ts
     * const voiceConsent =
     *   await client.audio.voiceConsents.create({
     *     language: 'language',
     *     name: 'name',
     *     recording: fs.createReadStream('path/to/file'),
     *   });
     * ```
     */
    create(body: VoiceConsentCreateParams, options?: RequestOptions): APIPromise<VoiceConsent>;
    /**
     * Retrieves a voice consent recording.
     *
     * @example
     * ```ts
     * const voiceConsent =
     *   await client.audio.voiceConsents.retrieve('consent_id');
     * ```
     */
    retrieve(consentID: string, options?: RequestOptions): APIPromise<VoiceConsent>;
    /**
     * Updates a voice consent recording (metadata only).
     *
     * @example
     * ```ts
     * const voiceConsent =
     *   await client.audio.voiceConsents.update(
     *     'consent_id',
     *     { name: 'name' },
     *   );
     * ```
     */
    update(consentID: string, body: VoiceConsentUpdateParams, options?: RequestOptions): APIPromise<VoiceConsent>;
    /**
     * Returns a list of voice consent recordings.
     *
     * @example
     * ```ts
     * // Automatically fetches more pages as needed.
     * for await (const voiceConsent of client.audio.voiceConsents.list()) {
     *   // ...
     * }
     * ```
     */
    list(query?: (VoiceConsentListParams & ({
        [K in 'method' | 'path' | 'query' | 'body' | 'headers' | 'maxRetries' | 'stream' | 'timeout' | 'httpAgent' | 'fetchOptions' | 'signal' | 'idempotencyKey' | 'defaultBaseURL' | '__metadata' | '__binaryRequest' | '__binaryResponse' | '__streamClass' | '__security' | '__synthesizeEventData']?: never;
    } | null | undefined)) | null | undefined, options?: RequestOptions): PagePromise<VoiceConsentsPage, VoiceConsent>;
    list(options?: {
        [K in 'headers' | 'maxRetries' | 'timeout' | 'signal' | 'idempotencyKey' | 'query']?: RequestOptions[K];
    } & {
        [K in 'method' | 'path' | 'body' | 'stream' | 'httpAgent' | 'fetchOptions' | 'defaultBaseURL' | '__metadata' | '__binaryRequest' | '__binaryResponse' | '__streamClass' | '__security' | '__synthesizeEventData']?: never;
    }): PagePromise<VoiceConsentsPage, VoiceConsent>;
    /**
     * Deletes a voice consent recording.
     *
     * @example
     * ```ts
     * const voiceConsentDeleted =
     *   await client.audio.voiceConsents.delete('consent_id');
     * ```
     */
    delete(consentID: string, options?: RequestOptions): APIPromise<VoiceConsentDeleted>;
}
export type VoiceConsentsPage = CursorPage<VoiceConsent>;
/**
 * A consent recording used to authorize creation of a custom voice.
 */
export interface VoiceConsent {
    /**
     * The consent recording identifier.
     */
    id: string;
    /**
     * The Unix timestamp (in seconds) for when the consent recording was created.
     */
    created_at: number;
    /**
     * The BCP 47 language tag for the consent phrase (for example, `en-US`).
     */
    language: string;
    /**
     * The label provided when the consent recording was uploaded.
     */
    name: string;
    /**
     * The object type, which is always `audio.voice_consent`.
     */
    object: 'audio.voice_consent';
}
export interface VoiceConsentDeleted {
    /**
     * The consent recording identifier.
     */
    id: string;
    deleted: boolean;
    object: 'audio.voice_consent';
}
export interface VoiceConsentCreateParams {
    /**
     * The BCP 47 language tag for the consent phrase (for example, `en-US`).
     */
    language: string;
    /**
     * The label to use for this consent recording.
     */
    name: string;
    /**
     * The consent audio recording file. Maximum size is 10 MiB.
     *
     * Supported MIME types: `audio/mpeg`, `audio/wav`, `audio/x-wav`, `audio/ogg`,
     * `audio/aac`, `audio/flac`, `audio/webm`, `audio/mp4`.
     */
    recording: Uploadable;
}
export interface VoiceConsentUpdateParams {
    /**
     * The updated label for this consent recording.
     */
    name: string;
}
export interface VoiceConsentListParams extends CursorPageParams {
}
export declare namespace VoiceConsents {
    export { type VoiceConsent as VoiceConsent, type VoiceConsentDeleted as VoiceConsentDeleted, type VoiceConsentsPage as VoiceConsentsPage, type VoiceConsentCreateParams as VoiceConsentCreateParams, type VoiceConsentUpdateParams as VoiceConsentUpdateParams, type VoiceConsentListParams as VoiceConsentListParams, };
}
//# sourceMappingURL=voice-consents.d.mts.map