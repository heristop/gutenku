import { zodTextFormat } from "../../zod.mjs";
/** Beta: bind a Zod v3/v4/Mini schema to an Agents text format and completed result. */
export declare function zodAgentTextFormat<S extends Parameters<typeof zodTextFormat>[0]>(schema: S): import("../../../lib/beta/agents/output-format-types.mjs").AgentOutputFormat<S extends {
    _output: infer Output;
} ? Output : S extends {
    _zod: {
        output: infer Output_1;
    };
} ? Output_1 : never>;
//# sourceMappingURL=zod.d.mts.map