import { hasOwn, isObj } from "../../../internal/utils/values.mjs";
/**
 * Recognizes supported content blocks without confusing JSON business data with content.
 * @internal
 */
export function isInputContent(value) {
    if (!isObj(value)) {
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
    return hasOwn(content, 'type') && hasOwn(content, field) && typeof content[field] === 'string';
}
//# sourceMappingURL=tool-output.mjs.map