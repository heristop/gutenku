import { CommandParser } from '../client/parser';
import { RedisArgument, ArrayReply, BlobStringReply } from '../RESP/types';
declare const _default: {
    readonly IS_READ_ONLY: true;
    /**
     * Returns elements in a lexicographical range from a vector set.
     * Provides a stateless iterator for elements inside a vector set.
     *
     * @param parser - The command parser
     * @param key - The key of the vector set
     * @param start - The starting point of the lexicographical range.
     *                Can be a string prefixed with `[` for inclusive (e.g., `[Redis`),
     *                `(` for exclusive (e.g., `(a7`), or `-` for the minimum element.
     * @param end - The ending point of the lexicographical range.
     *              Can be a string prefixed with `[` for inclusive,
     *              `(` for exclusive, or `+` for the maximum element.
     * @param count - Optional maximum number of elements to return.
     *                If negative, returns all elements in the specified range.
     * @see https://redis.io/commands/vrange/
     */
    readonly parseCommand: (this: void, parser: CommandParser, key: RedisArgument, start: RedisArgument, end: RedisArgument, count?: number) => void;
    readonly transformReply: () => ArrayReply<BlobStringReply>;
};
export default _default;
//# sourceMappingURL=VRANGE.d.ts.map