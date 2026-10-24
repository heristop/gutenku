/*!
 *
 * Copyright 2017 - acrazing
 *
 * @author acrazing joking.young@gmail.com
 * @since 2017-08-18 15:17:51
 * @version 1.0.0
 * @desc types.ts
 */
export declare enum SyntaxKind {
    Text = "Text",
    Tag = "Tag"
}
export interface IBaseNode {
    start: number;
    end: number;
}
export interface IText extends IBaseNode {
    type: SyntaxKind.Text;
    value: string;
}
export interface IAttributeValue extends IBaseNode {
    value: string;
    quote: "'" | '"' | undefined;
}
export interface IAttribute extends IBaseNode {
    name: IText;
    value: IAttributeValue | undefined;
}
export interface ITag extends IBaseNode {
    type: SyntaxKind.Tag;
    open: IText;
    name: string;
    rawName: string;
    attributes: IAttribute[];
    attributeMap: Record<string, IAttribute> | undefined;
    body: Array<ITag | IText> | undefined | null;
    close: IText | undefined | null;
}
export declare type INode = IText | ITag;
