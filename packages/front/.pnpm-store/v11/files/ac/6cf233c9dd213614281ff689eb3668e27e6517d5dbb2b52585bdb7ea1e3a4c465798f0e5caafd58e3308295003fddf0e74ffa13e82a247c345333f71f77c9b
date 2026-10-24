import { constants } from 'node:fs';
import { lstat, open, realpath } from 'node:fs/promises';
import nodePath from 'node:path';
import { OpenAIError } from "../../../core/error.mjs";
import { toStreamingFile } from "../../../internal/uploads.mjs";
async function checkedPath(path, boundary) {
    const absolute = nodePath.resolve(path);
    const root = boundary ?? nodePath.dirname(absolute);
    let current = root;
    let selected;
    for (const component of nodePath.relative(root, absolute).split(nodePath.sep)) {
        current = nodePath.join(current, component);
        // oxlint-disable-next-line no-await-in-loop -- Check each ancestor before following the next path component.
        const info = await lstat(current);
        selected = info;
        if (info.isSymbolicLink()) {
            throw new OpenAIError('Agent file sources cannot contain symbolic links');
        }
    }
    const resolved = await realpath(absolute);
    const info = await lstat(resolved);
    const relative = boundary ? nodePath.relative(boundary, resolved) : '';
    if (!selected ||
        selected.dev !== info.dev ||
        selected.ino !== info.ino ||
        selected.size !== info.size ||
        (boundary &&
            (relative === '..' || relative.startsWith(`..${nodePath.sep}`) || nodePath.isAbsolute(relative)))) {
        throw new OpenAIError('Selected agent file changed while resolving its path');
    }
    return { path: resolved, info: selected };
}
function selectedAgentFile({ path: absolute, info, }) {
    if (!info.isFile()) {
        throw new OpenAIError('Agent file sources must be regular files');
    }
    async function* bytes() {
        // oxlint-disable-next-line no-bitwise -- Combine native filesystem open flags.
        const handle = await open(absolute, constants.O_RDONLY | constants.O_NOFOLLOW);
        try {
            const current = await handle.stat();
            if (!current.isFile() ||
                current.dev !== info.dev ||
                current.ino !== info.ino ||
                current.size !== info.size) {
                throw new OpenAIError('Selected agent file changed before upload');
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
                throw new OpenAIError('Selected agent file changed while uploading');
            }
        }
        finally {
            await handle.close();
        }
    }
    return Object.assign(toStreamingFile({ [Symbol.asyncIterator]: bytes }, nodePath.basename(absolute)), {
        size: info.size,
    });
}
/** Beta, Node.js: select an application-owned file in a stable directory for a lazy upload. */
export async function agentFile(path) {
    return selectedAgentFile(await checkedPath(path));
}
/** Beta, Node.js: prepare explicit files from a stable application-owned directory once. */
export async function prepareAgentDirectory(resource, directory, params, options) {
    const include = [...params.include];
    const destination = params.to ?? '/workspace';
    const { path: root, info: rootInfo } = await checkedPath(directory);
    if (!rootInfo.isDirectory()) {
        throw new OpenAIError('Expected a directory');
    }
    const selected = {};
    const seen = new Set();
    for (const relative of include) {
        if (relative.includes('\\') ||
            relative.includes('\0') ||
            relative.split('/').some((part) => part === '' || part === '.' || part === '..') ||
            seen.has(relative)) {
            throw new OpenAIError('Directory selections must be unique relative file paths');
        }
        seen.add(relative);
        // oxlint-disable-next-line no-await-in-loop -- Prepare each explicitly selected source before any upload begins.
        const source = await checkedPath(nodePath.join(root, relative), root);
        selected[`${destination}/${relative}`] = selectedAgentFile(source);
    }
    return resource.prepare(selected, options);
}
/** Beta, Node.js: an application-owned safe path in a stable directory, opened lazily for a download. */
export function agentFileDestination(path) {
    const absolute = nodePath.resolve(path);
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
            expected = await lstat(absolute);
        }
        catch (error) {
            if (!(error instanceof Error && 'code' in error && error.code === 'ENOENT')) {
                throw error;
            }
        }
        if (expected && !expected.isFile()) {
            throw new OpenAIError('Agent artifact destinations must be regular files');
        }
        // Never truncate before verifying the opened entry. Exclusive creation also rejects dangling links.
        /* oxlint-disable no-bitwise -- Combine native flags; identity validation also covers Windows. */
        const flags = constants.O_WRONLY |
            (constants.O_NOFOLLOW ?? 0) |
            (constants.O_NONBLOCK ?? 0) |
            (expected ? 0 : constants.O_CREAT | constants.O_EXCL);
        /* oxlint-enable no-bitwise */
        const opened = await open(absolute, flags);
        try {
            const current = await opened.stat();
            if (!current.isFile() || (expected && (current.dev !== expected.dev || current.ino !== expected.ino))) {
                throw new OpenAIError('Agent artifact destination changed before opening');
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
//# sourceMappingURL=filesystem.mjs.map