"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildAliasTrie = exports.normalizeAliasEntry = void 0;
const helpers_1 = require("../helpers");
const alias_path_normalizer_1 = require("./alias-path-normalizer");
const pattern_matcher_1 = require("./pattern-matcher");
function normalizeAliasEntry(params) {
    const { aliasKey, targetPaths, config } = params;
    const keyPattern = (0, pattern_matcher_1.parseWildcardPattern)(aliasKey);
    const prefix = keyPattern.prefix;
    const suffix = keyPattern.suffix;
    const hasWildcard = keyPattern.hasWildcard;
    const shouldPrefixMatchWildly = hasWildcard && suffix === '';
    const paths = targetPaths.map((path) => (0, alias_path_normalizer_1.normalizeAliasPath)({ path, config }));
    return { prefix, suffix, hasWildcard, shouldPrefixMatchWildly, paths };
}
exports.normalizeAliasEntry = normalizeAliasEntry;
function buildAliasTrie(params) {
    const { config, paths, trie } = params;
    if (!paths)
        return trie;
    const normalizedAliases = Object.keys(paths).map((aliasKey) => normalizeAliasEntry({ aliasKey, targetPaths: paths[aliasKey], config }));
    for (const alias of normalizedAliases) {
        trie.add(alias.prefix, {
            ...alias,
            paths: alias.paths.map((0, helpers_1.findBasePathOfAlias)(config))
        });
    }
    return trie;
}
exports.buildAliasTrie = buildAliasTrie;
//# sourceMappingURL=alias-trie-builder.js.map