import { CommandParser } from '../client/parser';
import { ReplyUnion, UnwrapReply, ArrayReply, BlobStringReply, NumberReply } from '../RESP/types';
/**
 * Hotkey entry with key name and metric value
 */
export interface HotkeyEntry {
    key: string;
    value: number;
}
/**
 * Slot range with start and end values
 */
export interface SlotRange {
    start: number;
    end: number;
}
/**
 * HOTKEYS GET response structure
 */
export interface HotkeysGetReply {
    trackingActive: number;
    sampleRatio: number;
    selectedSlots: Array<SlotRange>;
    /** Only present when sample-ratio > 1 AND selected-slots is not empty */
    sampledCommandsSelectedSlotsUs?: number;
    /** Only present when selected-slots is not empty */
    allCommandsSelectedSlotsUs?: number;
    allCommandsAllSlotsUs: number;
    /** Only present when sample-ratio > 1 AND selected-slots is not empty */
    netBytesSampledCommandsSelectedSlots?: number;
    /** Only present when selected-slots is not empty */
    netBytesAllCommandsSelectedSlots?: number;
    netBytesAllCommandsAllSlots: number;
    collectionStartTimeUnixMs: number;
    collectionDurationMs: number;
    totalCpuTimeSysMs: number;
    totalCpuTimeUserMs: number;
    totalNetBytes: number;
    byCpuTimeUs?: Array<HotkeyEntry>;
    byNetBytes?: Array<HotkeyEntry>;
}
type HotkeysGetRawReply = ArrayReply<ArrayReply<BlobStringReply | NumberReply | ArrayReply<BlobStringReply | NumberReply>>>;
/**
 * HOTKEYS GET command - returns hotkeys tracking data
 *
 * State transitions:
 * - ACTIVE -> returns data (does not stop)
 * - STOPPED -> returns data
 * - EMPTY -> returns null
 */
declare const _default: {
    readonly NOT_KEYED_COMMAND: true;
    readonly IS_READ_ONLY: true;
    /**
     * Returns the top K hotkeys by CPU time and network bytes.
     * Returns null if no tracking has been started or tracking was reset.
     * @param parser - The Redis command parser
     * @see https://redis.io/commands/hotkeys-get/
     */
    readonly parseCommand: (this: void, parser: CommandParser) => void;
    readonly transformReply: {
        readonly 2: (reply: UnwrapReply<HotkeysGetRawReply> | null) => HotkeysGetReply | null;
        readonly 3: () => ReplyUnion;
    };
    readonly unstableResp3: true;
};
export default _default;
//# sourceMappingURL=HOTKEYS_GET.d.ts.map