import { CommandParser } from '../client/parser';
import { SimpleStringReply, NullReply } from '../RESP/types';
/**
 * HOTKEYS STOP command - stops hotkeys tracking but keeps results available for GET
 *
 * State transitions:
 * - ACTIVE -> STOPPED (returns OK)
 * - STOPPED -> STOPPED (no-op)
 * - EMPTY -> EMPTY (returns null - no session was started)
 *
 * Note: Returns null if no session was started or is already stopped.
 */
declare const _default: {
    readonly NOT_KEYED_COMMAND: true;
    readonly IS_READ_ONLY: false;
    /**
     * Stops hotkeys tracking. Results remain available via HOTKEYS GET.
     * Returns null if no session was started or is already stopped.
     * @param parser - The Redis command parser
     * @see https://redis.io/commands/hotkeys-stop/
     */
    readonly parseCommand: (this: void, parser: CommandParser) => void;
    readonly transformReply: () => SimpleStringReply<'OK'> | NullReply;
};
export default _default;
//# sourceMappingURL=HOTKEYS_STOP.d.ts.map