import { OpenAIError } from "../../../core/error.mjs";
import { buildHeaders } from "../../../internal/headers.mjs";
/** Beta: uploaded file IDs remain available after partial preparation or staging failure. */
export class AgentFileUploadError extends OpenAIError {
    constructor(uploadedFiles, cause) {
        super('Agent file preparation or staging failed; uploaded files remain caller-owned.');
        this.name = 'AgentFileUploadError';
        this.uploadedFiles = uploadedFiles;
        Object.defineProperty(this, 'cause', { value: cause, configurable: true });
    }
}
/** @internal */
export function validateAgentFilePath(path) {
    const parts = path.split('/');
    const root = parts[2] ?? '';
    if (!path.startsWith('/workspace/') ||
        path.includes('\\') ||
        path.includes('\0') ||
        parts.slice(1).some((part) => part === '' || part === '.' || part === '..') ||
        root === '.codex' ||
        root === '.managed-agents' ||
        root.startsWith('.managed-agents-') ||
        path === '/workspace/outputs') {
        throw new OpenAIError('Agent files require a non-reserved absolute file path inside /workspace');
    }
}
function preflight(files, options) {
    const entries = Object.entries(files);
    const headers = buildHeaders([options.headers]);
    if (entries.length > 1 &&
        (headers.values.has('idempotency-key') ||
            (!headers.nulls.has('idempotency-key') && options?.idempotencyKey !== undefined))) {
        throw new OpenAIError('Do not reuse an Idempotency-Key across multiple file uploads');
    }
    const paths = { children: new Map() };
    for (const [path] of entries) {
        validateAgentFilePath(path);
        // Index components once instead of repeatedly hashing overlapping ancestor prefixes.
        let node = paths;
        for (const part of path.split('/')) {
            if (node.file) {
                throw new OpenAIError('Agent file destinations conflict');
            }
            let child = node.children.get(part);
            if (!child) {
                child = { children: new Map() };
                node.children.set(part, child);
            }
            node = child;
        }
        if (node.children.size > 0) {
            throw new OpenAIError('Agent file destinations conflict');
        }
        node.file = true;
    }
    return entries;
}
/** @internal */
export async function prepareAgentFiles(client, files, options) {
    const requestOptions = { ...options };
    // Internal SDK read: capture effective headers once, including defaults and explicit omissions.
    const headers = buildHeaders([client['_options'].defaultHeaders, requestOptions.headers]);
    requestOptions.headers = headers;
    const entries = preflight(files, requestOptions);
    if (entries.length > 1) {
        // Keep a later mutation of client defaults from adding one key to this entire batch.
        headers.nulls.add('idempotency-key');
    }
    const prepared = { files: [], uploadedFiles: [] };
    try {
        for (const [path, file] of entries) {
            // oxlint-disable-next-line no-await-in-loop -- Stop on the first failure and expose precisely the uploads already created.
            const uploaded = await client.files.create({ file, purpose: 'user_data' }, requestOptions);
            prepared.uploadedFiles.push(uploaded);
            prepared.files.push({ type: 'file_id', file_id: uploaded.id, path });
        }
        return prepared;
    }
    catch (error) {
        throw new AgentFileUploadError(prepared.uploadedFiles, error);
    }
}
/** @internal */
export async function uploadAgentFile(client, resource, environmentID, params, options) {
    const prepared = await prepareAgentFiles(client, { [params.path]: params.file }, options);
    const [reference] = prepared.files;
    const [uploadedFile] = prepared.uploadedFiles;
    if (!reference || !uploadedFile) {
        throw new OpenAIError('Missing prepared agent file');
    }
    try {
        return { uploadedFile, environmentFile: await resource.create(environmentID, reference, options) };
    }
    catch (error) {
        throw new AgentFileUploadError(prepared.uploadedFiles, error);
    }
}
//# sourceMappingURL=files.mjs.map