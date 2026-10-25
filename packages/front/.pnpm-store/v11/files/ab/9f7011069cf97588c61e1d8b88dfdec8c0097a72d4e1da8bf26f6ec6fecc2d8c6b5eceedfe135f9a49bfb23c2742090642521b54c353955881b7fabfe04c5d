var _AgentResultArtifacts_resource, _AgentResultArtifacts_sessionID, _AgentResultArtifacts_turnID;
import { __classPrivateFieldGet, __classPrivateFieldSet } from "../../../internal/tslib.mjs";
import { agentItems } from "./pages.mjs";
import { OpenAIError } from "../../../core/error.mjs";
/** Beta: artifacts from the exact session and turn represented by a result. */
export class AgentResultArtifacts {
    constructor(resource, result) {
        _AgentResultArtifacts_resource.set(this, void 0);
        _AgentResultArtifacts_sessionID.set(this, void 0);
        _AgentResultArtifacts_turnID.set(this, void 0);
        __classPrivateFieldSet(this, _AgentResultArtifacts_resource, resource, "f");
        __classPrivateFieldSet(this, _AgentResultArtifacts_sessionID, result.session_id, "f");
        __classPrivateFieldSet(this, _AgentResultArtifacts_turnID, result.turn_id, "f");
    }
    /** Find one immutable artifact by its exact hosted path, across all pages. */
    async retrieve(path, options) {
        let selected;
        for await (const artifact of agentItems((after) => __classPrivateFieldGet(this, _AgentResultArtifacts_resource, "f").list(__classPrivateFieldGet(this, _AgentResultArtifacts_sessionID, "f"), {}, { ...options, query: { ...options?.query, after, environment_id: undefined } }))) {
            if (artifact.session_id === __classPrivateFieldGet(this, _AgentResultArtifacts_sessionID, "f") &&
                artifact.turn_id === __classPrivateFieldGet(this, _AgentResultArtifacts_turnID, "f") &&
                artifact.path === path) {
                if (selected) {
                    throw new OpenAIError('Multiple artifacts match this result and path');
                }
                selected = artifact;
            }
        }
        if (!selected) {
            throw new OpenAIError('No artifact matches this result and path');
        }
        return selected;
    }
    /** Return the native binary response for this result's exact artifact path. */
    async content(path, options) {
        const artifact = await this.retrieve(path, options);
        return __classPrivateFieldGet(this, _AgentResultArtifacts_resource, "f").content(artifact.id, { session_id: __classPrivateFieldGet(this, _AgentResultArtifacts_sessionID, "f") }, options);
    }
    /** Stream bytes to a caller-chosen destination; the hosted path never selects a local path. */
    async download(params, options) {
        const { path, to } = params;
        const artifact = await this.retrieve(path, options);
        const response = await __classPrivateFieldGet(this, _AgentResultArtifacts_resource, "f").content(artifact.id, { session_id: __classPrivateFieldGet(this, _AgentResultArtifacts_sessionID, "f") }, options);
        if (!response.body) {
            throw new OpenAIError('Artifact response has no content stream');
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
_AgentResultArtifacts_resource = new WeakMap(), _AgentResultArtifacts_sessionID = new WeakMap(), _AgentResultArtifacts_turnID = new WeakMap();
//# sourceMappingURL=result-artifacts.mjs.map