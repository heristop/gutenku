import { ALIAS_GROUPS } from "./aliases.js";
import { WalkContext } from "./context.js";
import { CHILD_KEYS } from "./generated.js";
function createDispatch(visitors) {
    let enter = null;
    let leave = null;
    const concrete = new Map();
    // enters accumulate in registration order, leaves mirror in reverse,
    // so aliases enter before the typed handler and leave after it
    const add = (type, handler) => {
        const hooks = typeof handler === "function"
            ? { enter: handler }
            : handler;
        let entry = concrete.get(type);
        if (entry === undefined) {
            entry = { enter: [], leave: [] };
            concrete.set(type, entry);
        }
        if (hooks.enter)
            entry.enter.push(hooks.enter);
        if (hooks.leave)
            entry.leave.unshift(hooks.leave);
    };
    for (const [name, value] of Object.entries(visitors)) {
        if (value == null)
            continue;
        if (name === "enter")
            enter = value;
        else if (name === "leave")
            leave = value;
        else if (name in ALIAS_GROUPS) {
            for (const type of ALIAS_GROUPS[name])
                add(type, value);
        }
    }
    for (const [name, value] of Object.entries(visitors)) {
        if (value == null || name === "enter" || name === "leave" || name in ALIAS_GROUPS)
            continue;
        add(name, value);
    }
    return { enter, leave, typed: (type) => concrete.get(type) };
}
/**
 * Walk an AST depth-first, dispatching to typed visitors and mutating
 * in place. Traversal order is driven by tables generated from the
 * parser's AST definition, so it can never drift. Returns the root.
 */
export function walk(root, visitors, state) {
    _walk(root, visitors, state, new WalkContext());
    return root;
}
/**
 * The async counterpart of {@link walk}: identical traversal order and
 * mutation semantics, with every handler awaited before the walk moves
 * on. Resolves to the root.
 */
export async function walkAsync(root, visitors, state) {
    await _walkAsync(root, visitors, state, new WalkContext());
    return root;
}
function position(ctx, node, key, list, frame) {
    ctx._node = node;
    ctx._key = key;
    ctx._list = list;
    ctx._frame = frame;
}
function applyReplace(ctx, parent, key, list, frame) {
    const next = ctx._replacement;
    ctx._replacement = null;
    if (list !== null)
        list[frame.i] = next;
    else
        parent[key] = next;
    return next;
}
function applyRemove(ctx, parent, key, list, frame) {
    ctx._removed = false;
    if (list !== null) {
        list.splice(frame.i, 1);
        frame.i--;
    }
    else {
        parent[key] = null;
    }
}
export function _walk(root, visitors, state, ctx) {
    const d = createDispatch(visitors);
    ctx.state = state;
    const ancestors = ctx._ancestors;
    (function visit(node, key, list, frame) {
        let typed = d.typed(node.type);
        const parent = ctx.parent;
        position(ctx, node, key, list, frame);
        if (d.enter !== null) {
            d.enter(node, ctx);
            if (ctx._stopped)
                return false;
        }
        if (typed !== undefined) {
            for (const handler of typed.enter) {
                handler(node, ctx);
                if (ctx._stopped)
                    return false;
            }
        }
        if (ctx._removed) {
            applyRemove(ctx, parent, key, list, frame);
            return true;
        }
        if (ctx._replacement !== null) {
            node = applyReplace(ctx, parent, key, list, frame);
            typed = d.typed(node.type);
        }
        const skipped = ctx._skip;
        ctx._skip = false;
        if (!skipped) {
            const keys = CHILD_KEYS[node.type];
            if (keys !== undefined && keys.length > 0) {
                ancestors.push(node);
                for (let k = 0; k < keys.length; k++) {
                    const key2 = keys[k];
                    const value = node[key2];
                    if (value === null || value === undefined || typeof value !== "object")
                        continue;
                    if (Array.isArray(value)) {
                        const childFrame = { i: 0 };
                        for (; childFrame.i < value.length; childFrame.i++) {
                            const item = value[childFrame.i];
                            // pattern element holes are null
                            if (item !== null && !visit(item, key2, value, childFrame))
                                return false;
                        }
                    }
                    else if (!visit(value, key2, null, null)) {
                        return false;
                    }
                }
                ancestors.pop();
            }
        }
        position(ctx, node, key, list, frame);
        if (typed !== undefined) {
            for (const handler of typed.leave) {
                handler(node, ctx);
                if (ctx._stopped)
                    return false;
            }
        }
        if (d.leave !== null) {
            d.leave(node, ctx);
            if (ctx._stopped)
                return false;
        }
        if (ctx._removed)
            applyRemove(ctx, parent, key, list, frame);
        else if (ctx._replacement !== null)
            applyReplace(ctx, parent, key, list, frame);
        return true;
    })(root, null, null, null);
}
// line-for-line twin of _walk with each handler awaited before the walk
// moves on, so keep the two visit bodies in lockstep
export async function _walkAsync(root, visitors, state, ctx) {
    const d = createDispatch(visitors);
    ctx.state = state;
    const ancestors = ctx._ancestors;
    await (async function visit(node, key, list, frame) {
        let typed = d.typed(node.type);
        const parent = ctx.parent;
        position(ctx, node, key, list, frame);
        if (d.enter !== null) {
            await d.enter(node, ctx);
            if (ctx._stopped)
                return false;
        }
        if (typed !== undefined) {
            for (const handler of typed.enter) {
                await handler(node, ctx);
                if (ctx._stopped)
                    return false;
            }
        }
        if (ctx._removed) {
            applyRemove(ctx, parent, key, list, frame);
            return true;
        }
        if (ctx._replacement !== null) {
            node = applyReplace(ctx, parent, key, list, frame);
            typed = d.typed(node.type);
        }
        const skipped = ctx._skip;
        ctx._skip = false;
        if (!skipped) {
            const keys = CHILD_KEYS[node.type];
            if (keys !== undefined && keys.length > 0) {
                ancestors.push(node);
                for (let k = 0; k < keys.length; k++) {
                    const key2 = keys[k];
                    const value = node[key2];
                    if (value === null || value === undefined || typeof value !== "object")
                        continue;
                    if (Array.isArray(value)) {
                        const childFrame = { i: 0 };
                        for (; childFrame.i < value.length; childFrame.i++) {
                            const item = value[childFrame.i];
                            // pattern element holes are null
                            if (item !== null && !(await visit(item, key2, value, childFrame))) {
                                return false;
                            }
                        }
                    }
                    else if (!(await visit(value, key2, null, null))) {
                        return false;
                    }
                }
                ancestors.pop();
            }
        }
        position(ctx, node, key, list, frame);
        if (typed !== undefined) {
            for (const handler of typed.leave) {
                await handler(node, ctx);
                if (ctx._stopped)
                    return false;
            }
        }
        if (d.leave !== null) {
            await d.leave(node, ctx);
            if (ctx._stopped)
                return false;
        }
        if (ctx._removed)
            applyRemove(ctx, parent, key, list, frame);
        else if (ctx._replacement !== null)
            applyReplace(ctx, parent, key, list, frame);
        return true;
    })(root, null, null, null);
}
