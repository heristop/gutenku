"use strict";
// File generated from our OpenAPI spec by Castiron. See CONTRIBUTING.md for details.
Object.defineProperty(exports, "__esModule", { value: true });
exports.Voices = void 0;
const resource_1 = require("../../core/resource.js");
const uploads_1 = require("../../internal/uploads.js");
const path_1 = require("../../internal/utils/path.js");
function resolveResourceRequestOptions(options, buildOptions) {
    return Promise.resolve(options).then(buildOptions);
}
/**
 * Turn audio into text or text into audio.
 */
class Voices extends resource_1.APIResource {
    /**
     * Creates a voice from a text prompt or from a consent recording and an audio
     * sample.
     *
     * For prompt-based creation, send `type: "prompt"` with a `name` and `prompt` as
     * JSON or multipart form data. For creation from an audio sample, send
     * `type: "audio_sample"` with a `name`, `audio_sample`, and `consent` recording ID
     * as multipart form data. The type defaults to `audio_sample` when omitted.
     *
     * Returns the saved voice's metadata. Voices created from text prompts are
     * supported only in Live, not in Realtime or the speech endpoint. The response
     * does not include preview audio.
     *
     * @example
     * ```ts
     * const voice = await client.audio.voices.create({
     *   audio_sample: fs.createReadStream('path/to/file'),
     *   consent: 'consent',
     *   name: 'x',
     * });
     * ```
     */
    create(body, options) {
        return this._client.post('/audio/voices', resolveResourceRequestOptions(options, (options) => (0, uploads_1.multipartFormRequestOptions)({ body, ...options, __security: { bearerAuth: true } }, this._client)));
    }
    /**
     * Deletes a voice created from a text prompt or an audio sample.
     *
     * Requires voice write permission and access to the voice's project. Access to
     * voices created from recordings is limited to eligible customers. See the
     * [custom voices guide](https://developers.openai.com/api/docs/guides/custom-voices).
     *
     * Deleting a voice does not delete its consent recording. Deleting an already
     * deleted voice returns a 404 error.
     *
     * @example
     * ```ts
     * const voiceDeleted = await client.audio.voices.delete(
     *   'voice_id',
     * );
     * ```
     */
    delete(voiceID, options) {
        return this._client.delete((0, path_1.path) `/audio/voices/${voiceID}`, resolveResourceRequestOptions(options, (options) => ({ ...options, __security: { bearerAuth: true } })));
    }
}
exports.Voices = Voices;
//# sourceMappingURL=voices.js.map