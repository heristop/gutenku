"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isInputContent = isInputContent;
const values_1 = require("../../../internal/utils/values.js");
/**
 * Recognizes supported content blocks without confusing JSON business data with content.
 * @internal
 */
function isInputContent(value) {
    if (!(0, values_1.isObj)(value)) {
        return false;
    }
    const content = value;
    let field;
    if (content['type'] === 'input_text') {
        field = 'text';
    }
    else if (content['type'] === 'input_image') {
        field = 'image_url';
    }
    else {
        return false;
    }
    return (0, values_1.hasOwn)(content, 'type') && (0, values_1.hasOwn)(content, field) && typeof content[field] === 'string';
}
//# sourceMappingURL=tool-output.js.map