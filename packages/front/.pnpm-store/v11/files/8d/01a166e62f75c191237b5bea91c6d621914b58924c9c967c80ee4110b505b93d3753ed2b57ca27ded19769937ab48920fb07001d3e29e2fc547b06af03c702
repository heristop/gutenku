/*!
 *
 * Copyright 2017 - acrazing
 *
 * @author acrazing joking.young@gmail.com
 * @since 2017-08-19 00:54:29
 * @version 1.0.0
 * @desc tokenize.ts
 */
export declare const enum TokenKind {
    Literal = 0,
    OpenTag = 1,
    OpenTagEnd = 2,
    CloseTag = 3,
    Whitespace = 4,
    AttrValueEq = 5,
    AttrValueNq = 6,
    AttrValueSq = 7,
    AttrValueDq = 8
}
export interface IToken {
    start: number;
    end: number;
    value: string;
    type: TokenKind;
}
export declare function tokenize(input: string): IToken[];
