"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TrieNode = void 0;
const alias_trie_builder_1 = require("./alias-trie-builder");
class TrieNode {
    constructor() {
        this.children = new Map();
        this.data = null;
    }
    getOrCreateChild(char) {
        const existing = this.children.get(char);
        if (existing)
            return existing;
        const child = new TrieNode();
        this.children.set(char, child);
        return child;
    }
    add(name, data) {
        var _a;
        const char = (_a = name[0]) !== null && _a !== void 0 ? _a : '';
        const node = this.getOrCreateChild(char);
        if (name.length <= 1) {
            node.data = data;
            return;
        }
        node.add(name.substring(1), data);
    }
    search(name) {
        var _a, _b;
        if (name.length <= 0)
            return null;
        const char = name[0];
        const node = (_a = this.children.get(char)) !== null && _a !== void 0 ? _a : this.children.get('');
        if (!node)
            return this.data;
        if (name.length === 1)
            return node.data;
        return (_b = node.search(name.substring(1))) !== null && _b !== void 0 ? _b : node.data;
    }
    static buildAliasTrie(config, paths) {
        const trie = new TrieNode();
        return (0, alias_trie_builder_1.buildAliasTrie)({ config, paths, trie });
    }
}
exports.TrieNode = TrieNode;
//# sourceMappingURL=trie.js.map