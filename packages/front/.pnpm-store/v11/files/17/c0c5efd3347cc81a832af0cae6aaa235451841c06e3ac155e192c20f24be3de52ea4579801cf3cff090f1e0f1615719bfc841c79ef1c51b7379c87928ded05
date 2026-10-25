/*!
 *
 * Copyright 2017 - acrazing
 *
 * @author acrazing joking.young@gmail.com
 * @since 2017-08-19 00:54:46
 * @version 1.0.0
 * @desc walk.ts
 */
import { INode } from './types';
export interface WalkOptions {
    enter?(node: INode, parent: INode | undefined, index: number): void;
    leave?(node: INode, parent: INode | undefined, index: number): void;
}
export declare function walk(ast: INode[], options: WalkOptions): void;
