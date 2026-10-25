"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.transformIf = void 0;
const compiler_dom_1 = require("@vue/compiler-dom");
const utils_1 = require("../utils");
exports.transformIf = (0, utils_1.createStructuralDirectiveTransform)(/^(?:if|else-if|else)$/, (node, dir, context) => {
    if (dir.name !== 'else'
        && (!dir.exp || !dir.exp.content.trim())) {
        context.onError((0, compiler_dom_1.createCompilerError)(compiler_dom_1.ErrorCodes.X_V_IF_NO_EXPRESSION, dir.loc));
    }
    if (dir.name === 'if') {
        const branch = createIfBranch(node, dir);
        const ifNode = {
            type: compiler_dom_1.NodeTypes.IF,
            loc: (0, utils_1.cloneLoc)(node.loc),
            branches: [branch],
        };
        context.replaceNode(ifNode);
    }
    else {
        const siblings = context.parent.children;
        const comments = [];
        let i = siblings.indexOf(node);
        while (i-- >= -1) {
            const sibling = siblings[i];
            if (sibling?.type === compiler_dom_1.NodeTypes.COMMENT) {
                context.removeNode(sibling);
                comments.unshift(sibling);
                continue;
            }
            if (sibling?.type === compiler_dom_1.NodeTypes.TEXT && !sibling.content.trim().length) {
                context.removeNode(sibling);
                continue;
            }
            if (sibling?.type === compiler_dom_1.NodeTypes.IF) {
                if (!sibling.branches.at(-1).condition) {
                    context.onError((0, compiler_dom_1.createCompilerError)(compiler_dom_1.ErrorCodes.X_V_ELSE_NO_ADJACENT_IF, node.loc));
                }
                context.removeNode();
                const branch = createIfBranch(node, dir);
                if (comments.length) {
                    branch.children.unshift(...comments);
                }
                if (branch.userKey) {
                    for (const { userKey } of sibling.branches) {
                        if (isSameKey(userKey, branch.userKey)) {
                            context.onError((0, compiler_dom_1.createCompilerError)(compiler_dom_1.ErrorCodes.X_V_IF_SAME_KEY, branch.userKey.loc));
                        }
                    }
                }
                sibling.branches.push(branch);
                (0, compiler_dom_1.traverseNode)(branch, context);
                context.currentNode = null;
            }
            else {
                context.onError((0, compiler_dom_1.createCompilerError)(compiler_dom_1.ErrorCodes.X_V_ELSE_NO_ADJACENT_IF, node.loc));
            }
            break;
        }
    }
});
function createIfBranch(node, dir) {
    return {
        type: compiler_dom_1.NodeTypes.IF_BRANCH,
        loc: node.loc,
        condition: dir.name === 'else' ? undefined : dir.exp,
        children: [node],
        userKey: (0, compiler_dom_1.findProp)(node, 'key'),
    };
}
function isSameKey(a, b) {
    if (!a || a.type !== b.type) {
        return false;
    }
    if (a.type === compiler_dom_1.NodeTypes.ATTRIBUTE) {
        if (a.value.content !== b.value.content) {
            return false;
        }
    }
    else {
        const exp = a.exp;
        const branchExp = b.exp;
        if (exp.type !== branchExp.type
            || exp.type !== compiler_dom_1.NodeTypes.SIMPLE_EXPRESSION
            || exp.isStatic !== branchExp.isStatic
            || exp.content !== branchExp.content) {
            return false;
        }
    }
    return true;
}
//# sourceMappingURL=vIf.js.map