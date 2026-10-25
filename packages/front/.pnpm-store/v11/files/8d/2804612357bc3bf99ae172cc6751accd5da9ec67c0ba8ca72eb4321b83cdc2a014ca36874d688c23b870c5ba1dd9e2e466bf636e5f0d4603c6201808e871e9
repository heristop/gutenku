"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.compileTemplate = compileTemplate;
const compiler_dom_1 = require("@vue/compiler-dom");
const transformElement_1 = require("./transforms/transformElement");
const transformText_1 = require("./transforms/transformText");
const vFor_1 = require("./transforms/vFor");
const vIf_1 = require("./transforms/vIf");
function compileTemplate(source, options) {
    const [nodeTransforms, directiveTransforms] = (0, compiler_dom_1.getBaseTransformPreset)();
    const resolvedOptions = {
        ...options,
        comments: true,
        nodeTransforms: [
            nodeTransforms[0], // transformVBindShorthand
            vIf_1.transformIf,
            vFor_1.transformFor,
            transformElement_1.transformElement,
            transformText_1.transformText,
            ...options.nodeTransforms || [],
        ],
        directiveTransforms: {
            ...directiveTransforms,
            ...options.directiveTransforms,
        },
    };
    const ast = (0, compiler_dom_1.parse)(source, resolvedOptions);
    (0, compiler_dom_1.transform)(ast, resolvedOptions);
    return ast;
}
//# sourceMappingURL=compile.js.map