"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseScriptRanges = parseScriptRanges;
exports.parseOptionsFromExtression = parseOptionsFromExtression;
const shared_1 = require("../utils/shared");
const utils_1 = require("./utils");
function parseScriptRanges(ts, sourceFile, vueCompilerOptions) {
    let exportDefault;
    ts.forEachChild(sourceFile, child => {
        if (ts.isExportAssignment(child)) {
            exportDefault = {
                ...(0, shared_1.getStartEnd)(ts, child, sourceFile),
                expression: (0, shared_1.getStartEnd)(ts, child.expression, sourceFile),
                isObjectLiteral: ts.isObjectLiteralExpression(child.expression),
                options: parseOptionsFromExtression(ts, child.expression, sourceFile),
            };
            const comment = (0, utils_1.getClosestMultiLineCommentRange)(ts, child, [], sourceFile);
            if (comment) {
                exportDefault.start = comment.start;
            }
        }
    });
    return {
        bindings: (0, utils_1.parseBindings)(ts, sourceFile, vueCompilerOptions.extensions),
        exportDefault,
    };
}
function parseOptionsFromExtression(ts, exp, sourceFile) {
    let obj;
    // #1882
    exp = (0, utils_1.getUnwrappedExpression)(ts, exp);
    if (ts.isObjectLiteralExpression(exp)) {
        obj = exp;
    }
    else if (ts.isCallExpression(exp) && exp.arguments.length) {
        const arg0 = exp.arguments[0];
        if (ts.isObjectLiteralExpression(arg0)) {
            obj = arg0;
        }
    }
    if (obj) {
        let componentsOptionNode;
        let directivesOptionNode;
        let nameOptionNode;
        let inheritAttrsOption;
        ts.forEachChild(obj, node => {
            if (ts.isPropertyAssignment(node) && ts.isIdentifier(node.name)) {
                const name = _getNodeText(node.name);
                if (name === 'components' && ts.isObjectLiteralExpression(node.initializer)) {
                    componentsOptionNode = node.initializer;
                }
                else if (name === 'directives' && ts.isObjectLiteralExpression(node.initializer)) {
                    directivesOptionNode = node.initializer;
                }
                else if (name === 'name' && ts.isStringLiteral(node.initializer)) {
                    nameOptionNode = node.initializer;
                }
                else if (name === 'inheritAttrs') {
                    inheritAttrsOption = _getNodeText(node.initializer);
                }
            }
        });
        return {
            isObjectLiteral: ts.isObjectLiteralExpression(exp),
            expression: _getStartEnd(exp),
            args: _getStartEnd(obj),
            argsNode: obj,
            components: componentsOptionNode ? _getStartEnd(componentsOptionNode) : undefined,
            componentsNode: componentsOptionNode,
            directives: directivesOptionNode ? _getStartEnd(directivesOptionNode) : undefined,
            name: nameOptionNode ? _getStartEnd(nameOptionNode) : undefined,
            nameNode: nameOptionNode,
            inheritAttrs: inheritAttrsOption,
        };
    }
    function _getStartEnd(node) {
        return (0, shared_1.getStartEnd)(ts, node, sourceFile);
    }
    function _getNodeText(node) {
        return (0, shared_1.getNodeText)(ts, node, sourceFile);
    }
}
//# sourceMappingURL=scriptRanges.js.map