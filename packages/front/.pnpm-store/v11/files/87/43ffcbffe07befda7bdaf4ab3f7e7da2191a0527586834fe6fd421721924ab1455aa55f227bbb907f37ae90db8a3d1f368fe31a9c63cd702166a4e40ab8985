"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseBindings = parseBindings;
exports.getClosestMultiLineCommentRange = getClosestMultiLineCommentRange;
exports.getUnwrappedExpression = getUnwrappedExpression;
const collectBindings_1 = require("../utils/collectBindings");
const shared_1 = require("../utils/shared");
function parseBindings(ts, ast, componentExtsensions) {
    const bindings = new Map();
    ts.forEachChild(ast, node => {
        if (ts.isVariableStatement(node)) {
            const flags = (node.declarationList.flags & ts.NodeFlags.Const)
                ? 0 /* BindingFlag.None */ : 1 /* BindingFlag.Variable */;
            for (const decl of node.declarationList.declarations) {
                for (const { start, end } of (0, collectBindings_1.collectBindingRanges)(ts, decl.name, ast)) {
                    bindings.set(ast.text.slice(start, end), flags);
                }
            }
        }
        else if (ts.isFunctionDeclaration(node)) {
            if (node.name && ts.isIdentifier(node.name)) {
                bindings.set(_getNodeText(node.name), 2 /* BindingFlag.Const */);
            }
        }
        else if (ts.isClassDeclaration(node)) {
            if (node.name) {
                bindings.set(_getNodeText(node.name), 2 /* BindingFlag.Const */);
            }
        }
        else if (ts.isEnumDeclaration(node)) {
            bindings.set(_getNodeText(node.name), 2 /* BindingFlag.Const */);
        }
        if (ts.isImportDeclaration(node)) {
            const moduleName = _getNodeText(node.moduleSpecifier).slice(1, -1);
            if (node.importClause && !node.importClause.isTypeOnly) {
                const { name, namedBindings } = node.importClause;
                if (name) {
                    if (componentExtsensions.some(ext => moduleName.endsWith(ext))) {
                        bindings.set(_getNodeText(name), 2 /* BindingFlag.Const */ | 4 /* BindingFlag.Component */);
                    }
                    else {
                        bindings.set(_getNodeText(name), 1 /* BindingFlag.Variable */);
                    }
                }
                if (namedBindings) {
                    if (ts.isNamedImports(namedBindings)) {
                        for (const element of namedBindings.elements) {
                            if (element.isTypeOnly) {
                                continue;
                            }
                            if (element.propertyName
                                && _getNodeText(element.propertyName) === 'default'
                                && componentExtsensions.some(ext => moduleName.endsWith(ext))) {
                                bindings.set(_getNodeText(element.name), 2 /* BindingFlag.Const */ | 4 /* BindingFlag.Component */);
                            }
                            else {
                                bindings.set(_getNodeText(element.name), 1 /* BindingFlag.Variable */);
                            }
                        }
                    }
                    else {
                        bindings.set(_getNodeText(namedBindings.name), 1 /* BindingFlag.Variable */);
                    }
                }
            }
        }
    });
    return bindings;
    function _getNodeText(node) {
        return (0, shared_1.getNodeText)(ts, node, ast);
    }
}
function getClosestMultiLineCommentRange(ts, node, parents, ast) {
    for (let i = parents.length - 1; i >= 0; i--) {
        if (ts.isStatement(node)) {
            break;
        }
        node = parents[i];
    }
    const comment = ts.getLeadingCommentRanges(ast.text, node.pos)
        ?.reverse()
        .find(range => range.kind === 3);
    if (comment) {
        return {
            node,
            start: comment.pos,
            end: comment.end,
        };
    }
}
function getUnwrappedExpression(ts, node) {
    while (ts.isParenthesizedExpression(node)
        || ts.isAssertionExpression(node)
        || ts.isNonNullExpression(node)
        || ts.isSatisfiesExpression(node)) {
        node = node.expression;
    }
    return node;
}
//# sourceMappingURL=utils.js.map