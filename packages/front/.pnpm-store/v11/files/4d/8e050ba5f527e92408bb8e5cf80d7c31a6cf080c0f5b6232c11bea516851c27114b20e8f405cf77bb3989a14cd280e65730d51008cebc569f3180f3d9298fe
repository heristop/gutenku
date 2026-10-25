import { Summarizers } from "./summarizer-factory.mjs";
import Context from "./context.mjs";
//#region src/report-base.d.ts
declare const _summarizer: unique symbol;
/** options accepted by {@link ReportBase} */
interface ReportBaseOptions {
  /** the summarizer strategy to use when executing the report */
  summarizer?: Summarizers;
}
declare class ReportBase {
  private [_summarizer];
  constructor(opts?: ReportBaseOptions);
  execute(context: Context): void;
}
//#endregion
export { ReportBaseOptions, ReportBase as default };