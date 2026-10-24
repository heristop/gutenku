"use strict";
var _AgentResultArtifacts_resource, _AgentResultArtifacts_sessionID, _AgentResultArtifacts_turnID;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AgentResultArtifacts = void 0;
const tslib_1 = require("../../../internal/tslib.js");
const pages_1 = require("./pages.js");
const error_1 = require("../../../core/error.js");
/** Beta: artifacts from the exact session and turn represented by a result. */
class AgentResultArtifacts {
    constructor(resource, result) {
        _AgentResultArtifacts_resource.set(this, void 0);
        _AgentResultArtifacts_sessionID.set(this, void 0);
        _AgentResultArtifacts_turnID.set(this, void 0);
        tslib_1.__classPrivateFieldSet(this, _AgentResultArtifacts_resource, resource, "f");
        tslib_1.__classPrivateFieldSet(this, _AgentResultArtifacts_sessionID, result.session_id, "f");
        tslib_1.__classPrivateFieldSet(this, _AgentResultArtifacts_turnID, result.turn_id, "f");
    }
    /** Find one immutable artifact by its exact hosted path, across all pages. */
    async retrieve(path, options) {
        let selected;
        for await (const artifact of (0, pages_1.agentItems)((after) => tslib_1.__classPrivateFieldGet(this, _AgentResultArtifacts_resource, "f").list(tslib_1.__classPrivateFieldGet(this, _AgentResultArtifacts_sessionID, "f"), {}, { ...options, query: { ...options?.query, after, environment_id: undefined } }))) {
            if (artifact.session_id === tslib_1.__classPrivateFieldGet(this, _AgentResultArtifacts_sessionID, "f") &&
                artifact.turn_id === tslib_1.__classPrivateFieldGet(this, _AgentResultArtifacts_turnID, "f") &&
                artifact.path === path) {
                if (selected) {
                    throw new error_1.OpenAIError('Multiple artifacts match this result and path');
                }
                selected = artifact;
            }
        }
        if (!selected) {
            throw new error_1.OpenAIError('No artifact matches this result and path');
        }
        return selected;
    }
    /** Return the native binary response for this result's exact artifact path. */
    async content(path, options) {
        const artifact = await this.retrieve(path, options);
        return tslib_1.__classPrivateFieldGet(this, _AgentResultArtifacts_resource, "f").content(artifact.id, { session_id: tslib_1.__classPrivateFieldGet(this, _AgentResultArtifacts_sessionID, "f") }, options);
    }
    /** Stream bytes to a caller-chosen destination; the hosted path never selects a local path. */
    async download(params, options) {
        const { path, to } = params;
        const artifact = await this.retrieve(path, options);
        const response = await tslib_1.__classPrivateFieldGet(this, _AgentResultArtifacts_resource, "f").content(artifact.id, { session_id: tslib_1.__classPrivateFieldGet(this, _AgentResultArtifacts_sessionID, "f") }, options);
        if (!response.body) {
            throw new error_1.OpenAIError('Artifact response has no content stream');
        }
        try {
            await response.body.pipeTo(to, options?.signal ? { signal: options.signal } : {});
        }
        catch (error) {
            // pipeTo can reject before acquiring a reader, for example when the destination is locked.
            try {
                await response.body.cancel();
            }
            catch {
                /* already cancelled or owned by pipeTo */
            }
            throw error;
        }
        return artifact;
    }
}
exports.AgentResultArtifacts = AgentResultArtifacts;
_AgentResultArtifacts_resource = new WeakMap(), _AgentResultArtifacts_sessionID = new WeakMap(), _AgentResultArtifacts_turnID = new WeakMap();
//# sourceMappingURL=result-artifacts.js.map