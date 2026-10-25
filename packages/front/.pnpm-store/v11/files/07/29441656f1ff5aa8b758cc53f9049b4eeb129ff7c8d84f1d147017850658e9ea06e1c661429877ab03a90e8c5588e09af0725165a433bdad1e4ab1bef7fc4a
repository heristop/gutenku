import { type TextAnalysis } from './analysis.js';
import { type FontMeasurement } from './measurement.js';
export declare function textMayHanKern(text: string): boolean;
export type HanKerningFontData = {
    typeForDot: number;
    typeForColon: number;
    typeForSemicolon: number;
    quoteFullwidth: boolean;
    trims: Map<number, number>;
};
export type HanKerningTrims = {
    widthTrims: number[] | null;
    lineStartExtras: number[] | null;
    lineEndTrims: number[] | null;
    overflowLineEndTrims: number[] | null;
};
export declare function getHanKerningTrims(measurement: FontMeasurement, analysis: TextAnalysis, from: number, to: number): HanKerningTrims;
//# sourceMappingURL=han-kerning.d.ts.map