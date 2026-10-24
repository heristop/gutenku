import FileWriter from "../../file-writer.mjs";
import { ReportNode } from "../../summarizer-factory.mjs";
import Context from "../../context.mjs";
import ReportBase from "../../report-base.mjs";
import "../../index.mjs";
import { CoverageSummary } from "@vitest/istanbul-lib-coverage";
//#region src/reports/html/index.d.ts
/** maps report nodes to output paths, see the html report's `linkMapper` option */
interface LinkMapper {
  getPath(node: ReportNode | string): string;
  relativePath(source: ReportNode | string, target: ReportNode | string): string;
  assetPath(node: ReportNode, name: string): string;
}
/** options accepted by {@link HtmlReport} */
interface HtmlOptions {
  /** show extra logging while the report is generated */
  verbose?: boolean;
  /** maps report nodes to output paths */
  linkMapper?: LinkMapper;
  /** subdirectory (under the report dir) to write the report to */
  subdir?: string;
  /** skip nodes with no coverage */
  skipEmpty?: boolean;
}
/** data threaded through the header/footer templates while rendering a page */
interface TemplateData {
  datetime: string;
  entity: string;
  metrics: CoverageSummary;
  reportClass: string;
  pathHtml: string;
  base: {
    css: string;
  };
  sorter: {
    js: string;
    image: string;
  };
  blockNavigation: {
    js: string;
  };
  prettify: {
    js: string;
    css: string;
  };
  favicon: string;
}
declare class HtmlReport extends ReportBase {
  verbose: boolean | undefined;
  linkMapper: LinkMapper;
  subdir: string;
  date: string;
  skipEmpty: boolean | undefined;
  constructor(opts: HtmlOptions);
  getBreadcrumbHtml(node: ReportNode): string;
  fillTemplate(node: ReportNode, templateData: TemplateData, context: Context): void;
  getTemplateData(): TemplateData;
  getWriter(context: Context): FileWriter;
  onStart(root: ReportNode, context: Context): void;
  onSummary(node: ReportNode, context: Context): void;
  onDetail(node: ReportNode, context: Context): void;
}
//#endregion
export { HtmlOptions, LinkMapper, HtmlReport as default };