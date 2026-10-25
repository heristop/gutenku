import { Alias, IProjectConfig, PathLike } from '../interfaces';
import { ITrieContainer } from './alias-trie-builder';
export declare class TrieNode<T> implements ITrieContainer<T> {
    private children;
    data: T | null;
    constructor();
    private getOrCreateChild;
    add(name: string, data: T): void;
    search(name: string): T | null;
    static buildAliasTrie(config: IProjectConfig, paths?: PathLike): TrieNode<Alias>;
}
