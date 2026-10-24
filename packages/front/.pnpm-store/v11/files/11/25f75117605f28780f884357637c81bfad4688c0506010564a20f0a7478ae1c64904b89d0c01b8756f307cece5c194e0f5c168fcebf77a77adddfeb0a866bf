"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createStructuralDirectiveTransform = createStructuralDirectiveTransform;
exports.cloneLoc = cloneLoc;
const compiler_dom_1 = require("@vue/compiler-dom");
const shared_1 = require("@vue/shared");
function createStructuralDirectiveTransform(name, fn) {
    const matches = (0, shared_1.isString)(name)
        ? (n) => n === name
        : (n) => name.test(n);
    return (node, context) => {
        if (node.type === compiler_dom_1.NodeTypes.ELEMENT) {
            const { props } = node;
            const exitFns = [];
            for (let i = 0; i < props.length; i++) {
                const prop = props[i];
                if (prop.type === compiler_dom_1.NodeTypes.DIRECTIVE && matches(prop.name)) {
                    props.splice(i, 1);
                    i--;
                    const onExit = fn(node, prop, context);
                    if (onExit) {
                        exitFns.push(onExit);
                    }
                }
            }
            return exitFns;
        }
    };
}
function cloneLoc(loc) {
    return {
        start: { ...loc.start },
        end: { ...loc.end },
        source: loc.source,
    };
}
//# sourceMappingURL=utils.js.map