export interface IWildcardPattern {
    prefix: string;
    suffix: string;
    hasWildcard: boolean;
}
export interface IMatchWildcardParams {
    pattern: IWildcardPattern;
    text: string;
}
export interface ISubstituteWildcardParams {
    pattern: IWildcardPattern;
    starValue: string;
}
export declare function parseWildcardPattern(raw: string): IWildcardPattern;
export declare function matchWildcard(params: IMatchWildcardParams): {
    matched: boolean;
    starValue: string;
};
export declare function substituteWildcard(params: ISubstituteWildcardParams): string;
