export function normalizeChatCompletionChunk(chunk) {
    if (!Array.isArray(chunk?.choices)) {
        // SAFETY: This is an opaque provider record, with no choices to normalize.
        // Preserve the existing SSE pass-through; the SDK does not validate these records.
        return chunk;
    }
    return {
        ...chunk,
        choices: chunk.choices.map((choice) => ({ ...choice, finish_reason: choice.finish_reason ?? null })),
    };
}
export function normalizeChatCompletionStream(stream) {
    const iterator = stream[Symbol.asyncIterator].bind(stream);
    stream[Symbol.asyncIterator] = async function* normalizedChunks() {
        const source = { [Symbol.asyncIterator]: iterator };
        for await (const chunk of source) {
            yield normalizeChatCompletionChunk(chunk);
        }
    };
    // SAFETY: The installed iterator normalizes every wire chunk before exposing it.
    return stream;
}
//# sourceMappingURL=streaming.mjs.map