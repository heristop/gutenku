import { CommandParser } from '../client/parser';
type RawHistogram = [string, number, string, number[]];
type Histogram = Record<string, {
    calls: number;
    histogram_usec: Record<string, number>;
}>;
declare const _default: {
    readonly CACHEABLE: false;
    readonly IS_READ_ONLY: true;
    /**
     * Constructs the LATENCY HISTOGRAM command
     *
     * @param parser - The command parser
     * @param commands - The list of redis commands to get histogram for
     * @see https://redis.io/docs/latest/commands/latency-histogram/
     */
    readonly parseCommand: (this: void, parser: CommandParser, ...commands: string[]) => void;
    readonly transformReply: {
        readonly 2: (reply: (string | RawHistogram)[]) => Histogram;
        readonly 3: () => Histogram;
    };
};
export default _default;
//# sourceMappingURL=LATENCY_HISTOGRAM.d.ts.map