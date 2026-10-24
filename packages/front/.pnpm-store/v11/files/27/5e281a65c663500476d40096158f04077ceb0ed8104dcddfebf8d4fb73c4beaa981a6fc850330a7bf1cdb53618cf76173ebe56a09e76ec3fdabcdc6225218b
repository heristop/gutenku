"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.transformElement = void 0;
const compiler_dom_1 = require("@vue/compiler-dom");
const shared_1 = require("@vue/shared");
const transformElement = (node, context) => {
    return () => {
        if (node.type !== compiler_dom_1.NodeTypes.ELEMENT || node.tagType === compiler_dom_1.ElementTypes.TEMPLATE) {
            return;
        }
        const isComponent = node.tagType === compiler_dom_1.ElementTypes.COMPONENT;
        const isSlotOutlet = node.tagType === compiler_dom_1.ElementTypes.SLOT;
        for (const prop of node.props) {
            if (prop.type !== compiler_dom_1.NodeTypes.DIRECTIVE) {
                continue;
            }
            if (prop.name === 'slot') {
                if (!isComponent) {
                    context.onError((0, compiler_dom_1.createCompilerError)(compiler_dom_1.ErrorCodes.X_V_SLOT_MISPLACED, prop.loc));
                }
                continue;
            }
            const isVBind = prop.name === 'bind';
            const isVOn = prop.name === 'on';
            if (!prop.arg && (isVBind || isVOn)) {
                if (!prop.exp) {
                    context.onError((0, compiler_dom_1.createCompilerError)(isVBind
                        ? compiler_dom_1.ErrorCodes.X_V_BIND_NO_EXPRESSION
                        : compiler_dom_1.ErrorCodes.X_V_ON_NO_EXPRESSION, prop.loc));
                }
                continue;
            }
            const runtimeDirectives = [];
            const directiveTransform = context.directiveTransforms[prop.name];
            if (directiveTransform) {
                const { needRuntime } = directiveTransform(prop, node, context);
                if (needRuntime) {
                    runtimeDirectives.push(prop);
                }
            }
            else if (!(0, shared_1.isBuiltInDirective)(prop.name)) {
                runtimeDirectives.push(prop);
            }
            if (isSlotOutlet && runtimeDirectives.length) {
                context.onError((0, compiler_dom_1.createCompilerError)(compiler_dom_1.ErrorCodes.X_V_SLOT_UNEXPECTED_DIRECTIVE_ON_SLOT_OUTLET, prop.loc));
            }
        }
        if (isComponent) {
            let hasNamedDefaultSlot = false;
            const implicitDefaultChildren = [];
            const seenSlotNames = new Set();
            const onComponentSlot = (0, compiler_dom_1.findDir)(node, 'slot', true);
            for (let child of node.children) {
                // <template v-for> -> for > template
                if (child.type === compiler_dom_1.NodeTypes.FOR) {
                    child = child.children[0];
                }
                // <template v-if> -> if > branch > template
                else if (child.type === compiler_dom_1.NodeTypes.IF) {
                    child = child.branches[0].children[0];
                }
                let slotDir;
                if (!(0, compiler_dom_1.isTemplateNode)(child) || !(slotDir = (0, compiler_dom_1.findDir)(child, 'slot', true))) {
                    if (child.type !== compiler_dom_1.NodeTypes.COMMENT) {
                        implicitDefaultChildren.push(child);
                    }
                    continue;
                }
                if (onComponentSlot) {
                    context.onError((0, compiler_dom_1.createCompilerError)(compiler_dom_1.ErrorCodes.X_V_SLOT_MIXED_SLOT_USAGE, slotDir.loc));
                    break;
                }
                const staticSlotName = slotDir.arg
                    ? (0, compiler_dom_1.isStaticExp)(slotDir.arg)
                        ? slotDir.arg.content
                        : undefined
                    : 'default';
                if (staticSlotName) {
                    if (seenSlotNames.has(staticSlotName)) {
                        context.onError((0, compiler_dom_1.createCompilerError)(compiler_dom_1.ErrorCodes.X_V_SLOT_DUPLICATE_SLOT_NAMES, slotDir.loc));
                        continue;
                    }
                    seenSlotNames.add(staticSlotName);
                    if (staticSlotName === 'default') {
                        hasNamedDefaultSlot = true;
                    }
                }
            }
            if (hasNamedDefaultSlot
                && implicitDefaultChildren.some(node => node.type !== compiler_dom_1.NodeTypes.TEXT || !!node.content.trim())) {
                context.onError((0, compiler_dom_1.createCompilerError)(compiler_dom_1.ErrorCodes.X_V_SLOT_EXTRANEOUS_DEFAULT_SLOT_CHILDREN, implicitDefaultChildren[0].loc));
            }
            context.components.add(node.tag);
        }
    };
};
exports.transformElement = transformElement;
//# sourceMappingURL=transformElement.js.map