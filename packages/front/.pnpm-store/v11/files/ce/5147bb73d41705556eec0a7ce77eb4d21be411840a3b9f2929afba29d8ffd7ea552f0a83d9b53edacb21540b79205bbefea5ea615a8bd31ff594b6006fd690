"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getActiveSub = getActiveSub;
exports.setActiveSub = setActiveSub;
exports.getBatchDepth = getBatchDepth;
exports.startBatch = startBatch;
exports.endBatch = endBatch;
exports.isSignal = isSignal;
exports.isComputed = isComputed;
exports.isEffect = isEffect;
exports.isEffectScope = isEffectScope;
exports.signal = signal;
exports.computed = computed;
exports.effect = effect;
exports.effectScope = effectScope;
exports.trigger = trigger;
const system_js_1 = require("./system.cjs");
const HasChildEffect = 64;
let cycle = 0;
let runDepth = 0;
let batchDepth = 0;
let notifyIndex = 0;
let queuedLength = 0;
let activeSub;
const queued = [];
const { link, unlink, propagate, checkDirty, shallowPropagate, } = (0, system_js_1.createReactiveSystem)({
    update(node) {
        if ('getter' in node) {
            return updateComputed(node);
        }
        if ('currentValue' in node) {
            return updateSignal(node);
        }
        node.flags = 1;
        return true;
    },
    notify(effect) {
        let insertIndex = queuedLength;
        let firstInsertedIndex = insertIndex;
        do {
            queued[insertIndex++] = effect;
            effect.flags &= ~2;
            effect = effect.subs?.sub;
            if (effect === undefined || !(effect.flags & 2)) {
                break;
            }
        } while (true);
        queuedLength = insertIndex;
        while (firstInsertedIndex < --insertIndex) {
            const left = queued[firstInsertedIndex];
            queued[firstInsertedIndex++] = queued[insertIndex];
            queued[insertIndex] = left;
        }
    },
    unwatched(node) {
        if ('getter' in node) {
            if (node.depsTail !== undefined) {
                node.flags = 1 | 16;
                disposeAllDepsInReverse(node);
            }
        }
        else if ('currentValue' in node) {
        }
        else if ('fn' in node) {
            effectOper.call(node);
        }
        else {
            effectScopeOper.call(node);
        }
    },
});
function getActiveSub() {
    return activeSub;
}
function setActiveSub(sub) {
    const prevSub = activeSub;
    activeSub = sub;
    return prevSub;
}
function getBatchDepth() {
    return batchDepth;
}
function startBatch() {
    ++batchDepth;
}
function endBatch() {
    if (!--batchDepth) {
        flush();
    }
}
function isSignal(fn) {
    return fn.name === 'bound ' + signalOper.name;
}
function isComputed(fn) {
    return fn.name === 'bound ' + computedOper.name;
}
function isEffect(fn) {
    return fn.name === 'bound ' + effectOper.name;
}
function isEffectScope(fn) {
    return fn.name === 'bound ' + effectScopeOper.name;
}
function signal(initialValue) {
    return signalOper.bind({
        currentValue: initialValue,
        pendingValue: initialValue,
        subs: undefined,
        subsTail: undefined,
        flags: 1,
    });
}
function computed(getter) {
    return computedOper.bind({
        value: undefined,
        subs: undefined,
        subsTail: undefined,
        deps: undefined,
        depsTail: undefined,
        flags: 0,
        getter: getter,
    });
}
function effect(fn) {
    const e = {
        fn,
        cleanup: undefined,
        subs: undefined,
        subsTail: undefined,
        deps: undefined,
        depsTail: undefined,
        flags: 2 | 4,
    };
    const prevSub = setActiveSub(e);
    if (prevSub !== undefined) {
        link(e, prevSub, 0);
        prevSub.flags |= HasChildEffect;
    }
    try {
        ++runDepth;
        e.cleanup = e.fn();
    }
    finally {
        --runDepth;
        activeSub = prevSub;
        e.flags &= ~4;
    }
    return effectOper.bind(e);
}
function effectScope(fn) {
    const e = {
        deps: undefined,
        depsTail: undefined,
        subs: undefined,
        subsTail: undefined,
        flags: 1,
    };
    const prevSub = setActiveSub(e);
    if (prevSub !== undefined) {
        link(e, prevSub, 0);
        prevSub.flags |= HasChildEffect;
    }
    try {
        fn();
    }
    finally {
        activeSub = prevSub;
    }
    return effectScopeOper.bind(e);
}
function trigger(fn) {
    const sub = {
        deps: undefined,
        depsTail: undefined,
        flags: 2,
    };
    const prevSub = setActiveSub(sub);
    try {
        fn();
    }
    finally {
        activeSub = prevSub;
        sub.flags = 0;
        let link = sub.deps;
        while (link !== undefined) {
            const dep = link.dep;
            link = unlink(link, sub);
            const subs = dep.subs;
            if (subs !== undefined) {
                propagate(subs, !!runDepth);
                shallowPropagate(subs);
            }
        }
        if (!batchDepth) {
            flush();
        }
    }
}
function updateComputed(c) {
    if (c.flags & HasChildEffect) {
        let link = c.depsTail;
        while (link !== undefined) {
            const prev = link.prevDep;
            const dep = link.dep;
            if (!('getter' in dep) && !('currentValue' in dep)) {
                unlink(link, c);
            }
            link = prev;
        }
    }
    c.depsTail = undefined;
    c.flags = 1 | 4;
    const prevSub = setActiveSub(c);
    try {
        ++cycle;
        const oldValue = c.value;
        return oldValue !== (c.value = c.getter(oldValue));
    }
    finally {
        activeSub = prevSub;
        c.flags &= ~4;
        purgeDeps(c);
    }
}
function updateSignal(s) {
    s.flags = 1;
    return s.currentValue !== (s.currentValue = s.pendingValue);
}
function run(e) {
    const flags = e.flags;
    if (flags & 16
        || (flags & 32
            && checkDirty(e.deps, e))) {
        if (flags & HasChildEffect) {
            let link = e.depsTail;
            while (link !== undefined) {
                const prev = link.prevDep;
                const dep = link.dep;
                if (!('getter' in dep) && !('currentValue' in dep)) {
                    unlink(link, e);
                }
                link = prev;
            }
        }
        if (e.cleanup) {
            runCleanup(e);
            if (!e.flags) {
                return;
            }
        }
        e.depsTail = undefined;
        e.flags = 2 | 4;
        const prevSub = setActiveSub(e);
        try {
            ++cycle;
            ++runDepth;
            e.cleanup = e.fn();
        }
        finally {
            --runDepth;
            activeSub = prevSub;
            e.flags &= ~4;
            purgeDeps(e);
        }
    }
    else if (e.deps !== undefined) {
        e.flags = 2 | (flags & HasChildEffect);
    }
}
function flush() {
    try {
        while (notifyIndex < queuedLength) {
            const effect = queued[notifyIndex];
            queued[notifyIndex++] = undefined;
            run(effect);
        }
    }
    finally {
        while (notifyIndex < queuedLength) {
            const effect = queued[notifyIndex];
            queued[notifyIndex++] = undefined;
            effect.flags |= 2 | 8;
        }
        notifyIndex = 0;
        queuedLength = 0;
    }
}
function computedOper() {
    const flags = this.flags;
    if (flags & 16
        || (flags & 32
            && (checkDirty(this.deps, this)
                || (this.flags = flags & ~32, false)))) {
        if (updateComputed(this)) {
            const subs = this.subs;
            if (subs !== undefined) {
                shallowPropagate(subs);
            }
        }
    }
    else if (!flags) {
        this.flags = 1 | 4;
        const prevSub = setActiveSub(this);
        try {
            this.value = this.getter();
        }
        finally {
            activeSub = prevSub;
            this.flags &= ~4;
        }
    }
    const sub = activeSub;
    if (sub !== undefined) {
        link(this, sub, cycle);
    }
    return this.value;
}
function signalOper(...value) {
    if (value.length) {
        if (this.pendingValue !== (this.pendingValue = value[0])) {
            this.flags = 1 | 16;
            const subs = this.subs;
            if (subs !== undefined) {
                propagate(subs, !!runDepth);
                if (!batchDepth) {
                    flush();
                }
            }
        }
    }
    else {
        if (this.flags & 16) {
            if (updateSignal(this)) {
                const subs = this.subs;
                if (subs !== undefined) {
                    shallowPropagate(subs);
                }
            }
        }
        const sub = activeSub;
        if (sub !== undefined) {
            link(this, sub, cycle);
        }
        return this.currentValue;
    }
}
function runCleanup(e) {
    const cleanup = e.cleanup;
    e.cleanup = undefined;
    const prevSub = activeSub;
    activeSub = undefined;
    try {
        cleanup();
    }
    finally {
        activeSub = prevSub;
    }
}
function effectOper() {
    effectScopeOper.call(this);
    if (this.cleanup) {
        runCleanup(this);
    }
}
function effectScopeOper() {
    this.flags = 0;
    disposeAllDepsInReverse(this);
    const sub = this.subs;
    if (sub !== undefined) {
        unlink(sub);
    }
}
function disposeAllDepsInReverse(sub) {
    let link = sub.depsTail;
    while (link !== undefined) {
        const prev = link.prevDep;
        unlink(link, sub);
        link = prev;
    }
}
function purgeDeps(sub) {
    const depsTail = sub.depsTail;
    let dep = depsTail !== undefined ? depsTail.nextDep : sub.deps;
    while (dep !== undefined) {
        dep = unlink(dep, sub);
    }
}
