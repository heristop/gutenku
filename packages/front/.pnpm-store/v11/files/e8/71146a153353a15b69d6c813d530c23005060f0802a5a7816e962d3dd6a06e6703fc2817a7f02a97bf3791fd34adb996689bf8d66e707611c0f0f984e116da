import { standardTextFormat } from "../../standard-schema.js";
import type { JSONSchema } from "../../../lib/jsonschema.js";
/** Beta: bind a synchronous Standard Schema validator to Agents output. */
export declare function standardAgentTextFormat<S extends Parameters<typeof standardTextFormat>[0]>(schema: S, jsonSchema?: JSONSchema): import("../../../lib/beta/agents/output-format-types.js").AgentOutputFormat<[NonNullable<S["~standard"]["types"]>] extends [never] ? unknown : NonNullable<S["~standard"]["types"]> extends {
    readonly output: infer Output;
} ? Output : unknown>;
//# sourceMappingURL=standard-schema.d.ts.map