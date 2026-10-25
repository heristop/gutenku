import type { Mappings } from "./sourcemap.js";
export declare const LEAD_NONE = 0;
export declare const LEAD_STMT = 1;
export declare const LEAD_ARROW = 2;
export declare const LEAD_EXPORT_DEFAULT = 3;
export interface Span {
    start: number;
    end: number;
}
export declare class Output {
    readonly pretty: boolean;
    readonly mappings: Mappings | null;
    text: string;
    chunks: string[] | null;
    spilled: number;
    lastChar: number;
    heldSpaces: number;
    heldLiteral: boolean;
    bareIntegerEnd: number;
    mapStart: number;
    lead: number;
    constructor(pretty: boolean, mappings: Mappings | null);
    finish(): string;
    length(): number;
    lastByte(): number;
    writeToken(s: string): void;
    writeName(s: string): void;
    writeKeyword(word: string): void;
    writeSpaced(pretty: string, compact: string): void;
    writeLiteral(s: string): void;
    writeComment(s: string): void;
    atLineStart(): boolean;
    space(): void;
    endLine(indent: number): void;
    recordMapping(span: Span): void;
    markBareInteger(): void;
    spillWhenFull(): void;
    private writeHolding;
    private appendRest;
    private appendAfterHeld;
    private commitSpaces;
    private dropHeldSpace;
    private separateToken;
    private spill;
    private placeMapping;
}
