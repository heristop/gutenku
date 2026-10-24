"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.transformFor = void 0;
const compiler_dom_1 = require("@vue/compiler-dom");
const utils_1 = require("../utils");
exports.transformFor = (0, utils_1.createStructuralDirectiveTransform)('for', (node, dir, context) => {
    if (!dir.exp) {
        context.onError((0, compiler_dom_1.createCompilerError)(compiler_dom_1.ErrorCodes.X_V_FOR_NO_EXPRESSION, dir.loc));
        return;
    }
    const parseResult = dir.forParseResult;
    if (!parseResult) {
        context.onError((0, compiler_dom_1.createCompilerError)(compiler_dom_1.ErrorCodes.X_V_FOR_MALFORMED_EXPRESSION, dir.loc));
        return;
    }
    const { source, value, key, index } = parseResult;
    const forNode = {
        type: compiler_dom_1.NodeTypes.FOR,
        loc: dir.loc,
        source,
        valueAlias: value,
        keyAlias: key,
        objectIndexAlias: index,
        parseResult,
        children: [node],
    };
    context.replaceNode(forNode);
    return () => {
        if ((0, compiler_dom_1.isTemplateNode)(node)) {
            for (const child of node.children) {
                if (child.type === compiler_dom_1.NodeTypes.ELEMENT) {
                    const key = (0, compiler_dom_1.findProp)(child, 'key');
                    if (key) {
                        context.onError((0, compiler_dom_1.createCompilerError)(compiler_dom_1.ErrorCodes.X_V_FOR_TEMPLATE_KEY_PLACEMENT, key.loc));
                        break;
                    }
                }
            }
        }
    };
});
//# sourceMappingURL=vFor.js.map