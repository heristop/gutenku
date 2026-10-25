"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.vertex = vertex;
const error_1 = require("../core/error.js");
const provider_1 = require("../internal/provider.js");
const vertex_1 = require("../internal/vertex.js");
const utils_1 = require("../internal/utils.js");
async function loadGoogleAuth() {
    try {
        // A guarded literal require lets CommonJS bundlers include the peer when installed.
        // oxlint-disable-next-line unicorn/prefer-module -- Native CommonJS must keep a guarded literal require so bundlers can include the optional peer.
        if (typeof require === 'function') {
            // oxlint-disable-next-line node/global-require, unicorn/prefer-module -- Lazy loading inside try makes the peer optional for CommonJS bundlers.
            return require('google-auth-library');
        }
    }
    catch {
        // Bundlers may replace an absent optional require with a throwing stub.
    }
    // Native ESM resolves the optional peer at runtime, outside token-provider bundles.
    const moduleName = 'google-auth-library';
    return await Promise.resolve(`${
    /* webpackIgnore: true */
    /* @vite-ignore */
    moduleName}`).then(s => __importStar(require(s)));
}
/** Vertex provider with lazy optional Google ADC or application-managed refresh. */
function vertex(options = {}) {
    if (options.credentials && options.tokenProvider) {
        throw new error_1.OpenAIError('Set only one of credentials and tokenProvider.');
    }
    let { baseURL } = options;
    if (baseURL === undefined) {
        const project = options.project ?? (0, utils_1.readEnv)('GOOGLE_CLOUD_PROJECT');
        const location = options.location ?? (0, utils_1.readEnv)('GOOGLE_CLOUD_LOCATION');
        // Legacy domain-scoped projects include dots and a colon; exclude dot path segments.
        if (!project || !/^[a-zA-Z0-9_-][a-zA-Z0-9_.:-]*$/u.test(project)) {
            throw new error_1.OpenAIError('Vertex requires a project ID (project or GOOGLE_CLOUD_PROJECT).');
        }
        if (!location || !/^[a-z0-9-]+$/u.test(location)) {
            throw new error_1.OpenAIError('Vertex requires a location (location or GOOGLE_CLOUD_LOCATION).');
        }
        const host = location === 'global' ? 'aiplatform.googleapis.com' : `${location}-aiplatform.googleapis.com`;
        baseURL = `https://${host}/v1/projects/${project}/locations/${location}/publishers/openai/v1`;
    }
    const root = new URL(baseURL);
    if (!['http:', 'https:'].includes(root.protocol) ||
        root.username ||
        root.password ||
        root.search ||
        root.hash) {
        throw new error_1.OpenAIError('Vertex baseURL must be an HTTP(S) API root without credentials, query or fragment.');
    }
    const hostname = root.hostname.replace(/\.$/u, '');
    if (root.protocol !== 'https:' && (hostname === 'googleapis.com' || hostname.endsWith('.googleapis.com'))) {
        throw new error_1.OpenAIError('Google Vertex endpoints require HTTPS.');
    }
    const { tokenProvider, credentials } = options;
    return (0, provider_1.createProvider)({
        configure() {
            let adc;
            async function resolveHeaders(url) {
                if (tokenProvider) {
                    const token = await tokenProvider();
                    if (typeof token !== 'string' || !/^[\u0021-\u007E]+$/u.test(token)) {
                        throw new error_1.OpenAIError('Vertex token provider must return a valid bearer token.');
                    }
                    return new Headers({ authorization: `Bearer ${token}` });
                }
                if (!adc) {
                    // Optional by design: injected token providers do not load Google's library.
                    adc = credentials
                        ? Promise.resolve(credentials)
                        : (async () => {
                            const { GoogleAuth } = await loadGoogleAuth();
                            const auth = new GoogleAuth({ scopes: ['https://www.googleapis.com/auth/cloud-platform'] });
                            return await auth.getClient();
                        })();
                }
                try {
                    const authClient = await adc;
                    return new Headers(await authClient.getRequestHeaders(url));
                }
                catch (error) {
                    // Retry ADC discovery on the next independent call after a failed lookup.
                    adc = undefined;
                    throw error;
                }
            }
            return {
                name: 'vertex',
                baseURL: root.toString(),
                timeoutIncludesAuth: true,
                async prepareRequest(request, context) {
                    // Validate the destination before resolving or attaching credentials.
                    if (new URL(context.url).origin !== root.origin) {
                        throw new error_1.OpenAIError('Refusing to send Vertex credentials outside the configured origin.');
                    }
                    const headers = new Headers(request.headers);
                    if (['authorization', 'api-key', 'openai-organization', 'openai-project'].some((name) => headers.has(name))) {
                        throw new error_1.OpenAIError('Vertex owns authentication; remove OpenAI project/organization and custom Authorization or api-key headers.');
                    }
                    const deadline = new AbortController();
                    const timer = context.timeout === undefined ? undefined : setTimeout(() => deadline.abort(), context.timeout);
                    try {
                        await (0, vertex_1.prepareVertexAuth)(request, context, {
                            resolve: () => resolveHeaders(context.url),
                            apply(authHeaders) {
                                for (const [name, value] of authHeaders) {
                                    headers.set(name, value);
                                }
                                request.headers = headers;
                                request.redirect = 'manual';
                            },
                        }, [deadline.signal]);
                    }
                    catch (error) {
                        if (deadline.signal.aborted) {
                            throw (0, provider_1.createProviderTimeoutError)();
                        }
                        if (error instanceof error_1.APIUserAbortError) {
                            throw error;
                        }
                        // Google and application errors can carry credential material in their cause.
                        throw new error_1.OpenAIError('Vertex authentication failed. Check ADC and google-auth-library, or supply tokenProvider.');
                    }
                    finally {
                        clearTimeout(timer);
                    }
                },
            };
        },
    });
}
//# sourceMappingURL=vertex.js.map