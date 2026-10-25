"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.transformText = void 0;
const compiler_dom_1 = require("@vue/compiler-dom");
const transformText = node => {
    if (node.type === compiler_dom_1.NodeTypes.ROOT
        || node.type === compiler_dom_1.NodeTypes.ELEMENT
        || node.type === compiler_dom_1.NodeTypes.FOR
        || node.type === compiler_dom_1.NodeTypes.IF_BRANCH) {
        return () => {
            const children = node.children;
            let currentContainer = undefined;
            for (let i = 0; i < children.length; i++) {
                const child = children[i];
                if ((0, compiler_dom_1.isText)(child)) {
                    for (let j = i + 1; j < children.length; j++) {
                        const next = children[j];
                        if ((0, compiler_dom_1.isText)(next)) {
                            currentContainer ??= children[i] = (0, compiler_dom_1.createCompoundExpression)([child], child.loc);
                            currentContainer.children.push(` + `, next);
                            children.splice(j, 1);
                            j--;
                        }
                        else {
                            currentContainer = undefined;
                            break;
                        }
                    }
                }
            }
        };
    }
};
exports.transformText = transformText;
//# sourceMappingURL=transformText.js.map