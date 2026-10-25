"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.agentFile = agentFile;
exports.prepareAgentDirectory = prepareAgentDirectory;
exports.agentFileDestination = agentFileDestination;
const tslib_1 = require("../../../internal/tslib.js");
const node_fs_1 = require("node:fs");
const promises_1 = require("node:fs/promises");
const node_path_1 = tslib_1.__importDefault(require("node:path"));
const error_1 = require("../../../core/error.js");
const uploads_1 = require("../../../internal/uploads.js");
async function checkedPath(path, boundary) {
    const absolute = node_path_1.default.resolve(path);
    const root = boundary ?? node_path_1.default.dirname(absolute);
    let current = root;
    let selected;
    for (const component of node_path_1.default.relative(root, absolute).split(node_path_1.default.sep)) {
        current = node_path_1.default.join(current, component);
        // oxlint-disable-next-line no-await-in-loop -- Check each ancestor before following the next path component.
        const info = await (0, promises_1.lstat)(current);
        selected = info;
        if (info.isSymbolicLink()) {
            throw new error_1.OpenAIError('Agent file sources cannot contain symbolic links');
        }
    }
    const resolved = await (0, promises_1.realpath)(absolute);
    const info = await (0, promises_1.lstat)(resolved);
    const relative = boundary ? node_path_1.default.relative(boundary, resolved) : '';
    if (!selected ||
        selected.dev !== info.dev ||
        selected.ino !== info.ino ||
        selected.size !== info.size ||
        (boundary &&
            (relative === '..' || relative.startsWith(`..${node_path_1.default.sep}`) || node_path_1.default.isAbsolute(relative)))) {
        throw new error_1.OpenAIError('Selected agent file changed while resolving its path');
    }
    return { path: resolved, info: selected };
}
function selectedAgentFile({ path: absolute, info, }) {
    if (!info.isFile()) {
        throw new error_1.OpenAIError('Agent file sources must be regular files');
    }
    async function* bytes() {
        // oxlint-disable-next-line no-bitwise -- Combine native filesystem open flags.
        const handle = await (0, promises_1.open)(absolute, node_fs_1.constants.O_RDONLY | node_fs_1.constants.O_NOFOLLOW);
        try {
            const current = await handle.stat();
            if (!current.isFile() ||
                current.dev !== info.dev ||
                current.ino !== info.ino ||
                current.size !== info.size) {
                throw new error_1.OpenAIError('Selected agent file changed before upload');
            }
            let received = 0;
            if (info.size > 0) {
                for await (const chunk of handle.createReadStream({ autoClose: false, end: info.size - 1 })) {
                    received += chunk.length;
                    yield chunk;
                }
            }
            const finalInfo = await handle.stat();
            if (received !== info.size || finalInfo.size !== info.size) {
                throw new error_1.OpenAIError('Selected agent file changed while uploading');
            }
        }
        finally {
            await handle.close();
        }
    }
    return Object.assign((0, uploads_1.toStreamingFile)({ [Symbol.asyncIterator]: bytes }, node_path_1.default.basename(absolute)), {
        size: info.size,
    });
}
/** Beta, Node.js: select an application-owned file in a stable directory for a lazy upload. */
async function agentFile(path) {
    return selectedAgentFile(await checkedPath(path));
}
/** Beta, Node.js: prepare explicit files from a stable application-owned directory once. */
async function prepareAgentDirectory(resource, directory, params, options) {
    const include = [...params.include];
    const destination = params.to ?? '/workspace';
    const { path: root, info: rootInfo } = await checkedPath(directory);
    if (!rootInfo.isDirectory()) {
        throw new error_1.OpenAIError('Expected a directory');
    }
    const selected = {};
    const seen = new Set();
    for (const relative of include) {
        if (relative.includes('\\') ||
            relative.includes('\0') ||
            relative.split('/').some((part) => part === '' || part === '.' || part === '..') ||
            seen.has(relative)) {
            throw new error_1.OpenAIError('Directory selections must be unique relative file paths');
        }
        seen.add(relative);
        // oxlint-disable-next-line no-await-in-loop -- Prepare each explicitly selected source before any upload begins.
        const source = await checkedPath(node_path_1.default.join(root, relative), root);
        selected[`${destination}/${relative}`] = selectedAgentFile(source);
    }
    return resource.prepare(selected, options);
}
/** Beta, Node.js: an application-owned safe path in a stable directory, opened lazily for a download. */
function agentFileDestination(path) {
    const absolute = node_path_1.default.resolve(path);
    let handle;
    const close = async () => {
        await handle?.close();
        handle = undefined;
    };
    const file = async () => {
        if (handle) {
            return handle;
        }
        let expected;
        try {
            expected = await (0, promises_1.lstat)(absolute);
        }
        catch (error) {
            if (!(error instanceof Error && 'code' in error && error.code === 'ENOENT')) {
                throw error;
            }
        }
        if (expected && !expected.isFile()) {
            throw new error_1.OpenAIError('Agent artifact destinations must be regular files');
        }
        // Never truncate before verifying the opened entry. Exclusive creation also rejects dangling links.
        /* oxlint-disable no-bitwise -- Combine native flags; identity validation also covers Windows. */
        const flags = node_fs_1.constants.O_WRONLY |
            (node_fs_1.constants.O_NOFOLLOW ?? 0) |
            (node_fs_1.constants.O_NONBLOCK ?? 0) |
            (expected ? 0 : node_fs_1.constants.O_CREAT | node_fs_1.constants.O_EXCL);
        /* oxlint-enable no-bitwise */
        const opened = await (0, promises_1.open)(absolute, flags);
        try {
            const current = await opened.stat();
            if (!current.isFile() || (expected && (current.dev !== expected.dev || current.ino !== expected.ino))) {
                throw new error_1.OpenAIError('Agent artifact destination changed before opening');
            }
            await opened.truncate(0);
            handle = opened;
            return handle;
        }
        catch (error) {
            await opened.close();
            throw error;
        }
    };
    return new WritableStream({
        async write(chunk) {
            try {
                const target = await file();
                await target.writeFile(chunk);
            }
            catch (error) {
                await close();
                throw error;
            }
        },
        async close() {
            await file();
            await close();
        },
        async abort() {
            await close();
        },
    });
}
//# sourceMappingURL=filesystem.js.map