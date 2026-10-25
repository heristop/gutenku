"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const CompilerDOM = __importStar(require("@vue/compiler-dom"));
const codeFeatures_1 = require("../codegen/codeFeatures");
const forEachTemplateNode_1 = require("../utils/forEachTemplateNode");
const shared_1 = require("../utils/shared");
const plugin = () => {
    return {
        version: 2.2,
        getEmbeddedCodes(_fileName, ir) {
            if (!ir.template?.ast) {
                return [];
            }
            return [{ id: 'template_inline_css', lang: 'css' }];
        },
        resolveEmbeddedCode(_fileName, ir, embeddedFile) {
            if (embeddedFile.id !== 'template_inline_css' || !ir.template?.ast) {
                return;
            }
            embeddedFile.parentCodeId = ir.template.lang === 'md' ? 'root_tags' : 'template';
            embeddedFile.content.push(...generate(ir.template.ast));
        },
    };
};
exports.default = plugin;
function* generate(templateAst) {
    for (const node of (0, forEachTemplateNode_1.forEachElementNode)(templateAst)) {
        for (const prop of node.props) {
            if (prop.type === CompilerDOM.NodeTypes.ATTRIBUTE
                && prop.name === 'style'
                && prop.value) {
                yield `x { `;
                const [content, offset] = (0, shared_1.normalizeAttributeValue)(prop.value);
                yield [content, 'template', offset, codeFeatures_1.codeFeatures.all];
                yield ` }\n`;
            }
        }
    }
}
//# sourceMappingURL=vue-template-inline-css.js.map