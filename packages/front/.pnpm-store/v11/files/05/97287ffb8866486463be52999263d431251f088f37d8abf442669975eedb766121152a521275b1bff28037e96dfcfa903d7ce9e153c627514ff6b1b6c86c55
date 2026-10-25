"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.agentItems = agentItems;
const error_1 = require("../../../core/error.js");
const values_1 = require("../../../internal/utils/values.js");
/** Retain server cursor metadata for legacy Agents items with nullable IDs.
 * @internal
 * @yields {T} Each item in server order, failing if pagination cannot advance.
 */
async function* agentItems(load) {
    let after;
    while (true) {
        // oxlint-disable-next-line no-await-in-loop -- Each page determines the next cursor.
        const page = await load(after);
        yield* page.data;
        if (!page.has_more) {
            return;
        }
        // Internal SDK read: CursorPage keeps raw metadata but does not expose last_id.
        // oxlint-disable-next-line prefer-destructuring -- Bracket access intentionally reads a protected internal field.
        const body = page['body'];
        // oxlint-disable-next-line unicorn/prefer-at -- Keep published source compatible with ES2020 declarations.
        const last = page.data[page.data.length - 1];
        // oxlint-disable-next-line anti-slop/no-runtime-typeof -- Validate only the opaque cursor from response metadata.
        const cursor = (0, values_1.isObj)(body) && typeof body['last_id'] === 'string' ? body['last_id'] : last?.id;
        if (!cursor || cursor === after) {
            throw new error_1.OpenAIError('Agent pagination cannot advance to the next page');
        }
        after = cursor;
    }
}
//# sourceMappingURL=pages.js.map