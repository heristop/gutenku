import { S as ScriptNetworkEvents } from './unhead.AvDFlk_u.mjs';

function NOOP() {
}
function replayRecordings(target, stack) {
  stack.forEach((recordings) => {
    let context = target;
    let prevContext = target;
    recordings.forEach(({ type, key, args }) => {
      if (type === "get") {
        prevContext = context;
        context = context[key];
      } else if (type === "apply") {
        context = Reflect.apply(context, prevContext, args);
      }
    });
  });
}
function walk(root, path) {
  let owner;
  let value = root;
  for (const key of path) {
    if (value == null)
      return { owner: void 0, value: void 0 };
    owner = value;
    value = value[key];
  }
  return { owner, value };
}
function createScriptProxy(initial = {}) {
  const stack = [];
  let instance;
  let stackIdx = -1;
  function node(path) {
    const children = /* @__PURE__ */ new Map();
    return new Proxy(NOOP, {
      get(_, prop) {
        if (instance) {
          const { value } = walk(instance, path);
          const result = value == null ? void 0 : Reflect.get(value, prop, value);
          if (typeof result !== "function")
            return result;
        } else if (!path.length) {
          const result = Reflect.get(initial, prop);
          if (typeof result !== "undefined")
            return result;
          stackIdx++;
          stack[stackIdx] = [{ type: "get", key: prop }];
        } else {
          stack[stackIdx].push({ type: "get", key: prop });
        }
        let child = children.get(prop);
        if (!child) {
          child = node([...path, prop]);
          children.set(prop, child);
        }
        return child;
      },
      apply(_, __, args) {
        if (instance) {
          const { owner, value } = walk(instance, path);
          if (typeof value === "function")
            Reflect.apply(value, owner, args);
        } else {
          stack[stackIdx].push({ type: "apply", key: "", args });
        }
        return void 0;
      }
    });
  }
  return {
    proxy: node([]),
    stack,
    resolve(api) {
      instance = api;
      replayRecordings(api, stack);
      stack.length = 0;
    }
  };
}

function resolveScriptKey(input) {
  return input.key || input.src || (typeof input.innerHTML === "string" ? input.innerHTML : "");
}
const PreconnectServerModes = ["preconnect", "dns-prefetch"];
function useScript(head, _input, _options) {
  const input = typeof _input === "string" ? { src: _input } : _input;
  const options = _options || {};
  const id = resolveScriptKey(input);
  const scripts = head._scripts || (head._scripts = /* @__PURE__ */ Object.create(null));
  const prevScript = Object.prototype.hasOwnProperty.call(scripts, id) ? scripts[id] : void 0;
  if (prevScript) {
    prevScript.setupTriggerHandler(options.trigger);
    return prevScript;
  }
  options.beforeInit?.();
  const syncStatus = (s) => {
    script.status = s;
    head.hooks.callHook(`script:updated`, hookCtx);
  };
  ScriptNetworkEvents.forEach((fn) => {
    const k = fn;
    const _fn = typeof input[k] === "function" ? input[k].bind(options.eventContext) : null;
    input[k] = (e) => {
      if (script.status === "removed")
        return;
      syncStatus(fn === "onload" ? "loaded" : fn === "onerror" ? "error" : "loading");
      _fn?.(e);
    };
  });
  const _cbs = { loaded: [], error: [] };
  const _uniqueCbs = /* @__PURE__ */ new Set();
  const _registerCb = (key, cb, options2) => {
    if (head.ssr) {
      return;
    }
    let uniqueKey;
    if (options2?.key) {
      uniqueKey = `${key}:${options2.key}`;
      if (_uniqueCbs.has(uniqueKey)) {
        return;
      }
      _uniqueCbs.add(uniqueKey);
    }
    if (_cbs[key]) {
      _cbs[key].push(cb);
      return () => {
        const idx = _cbs[key]?.indexOf(cb) ?? -1;
        if (idx !== -1)
          _cbs[key]?.splice(idx, 1);
        if (uniqueKey)
          _uniqueCbs.delete(uniqueKey);
      };
    }
    if (key === "loaded" && script.status === "loaded")
      cb(script.instance);
    else if (key === "error" && script.status === "error")
      cb();
    return () => {
      if (uniqueKey)
        _uniqueCbs.delete(uniqueKey);
    };
  };
  const loadPromise = new Promise((resolve) => {
    if (head.ssr)
      return;
    const emit = (api) => queueMicrotask(() => resolve(api));
    const _ = head.hooks.hook("script:updated", ({ script: updatedScript }) => {
      if (updatedScript !== script)
        return;
      const status = updatedScript.status;
      if (status === "loaded" || status === "error" || status === "removed") {
        if (status === "loaded") {
          if (typeof options.use === "function") {
            const api = options.use();
            if (api) {
              emit(api);
            }
          } else {
            emit({});
          }
        } else if (status === "error") {
          resolve(false);
        } else if (status === "removed") {
          resolve(false);
        }
        _();
      }
    });
  });
  const script = {
    _loadPromise: loadPromise,
    instance: !head.ssr && options?.use?.() || null,
    proxy: null,
    id,
    status: "awaitingLoad",
    remove() {
      const hadEntry = !!script.entry;
      script._triggerAbortControllers?.forEach((ac) => ac.abort());
      script._triggerAbortControllers?.clear();
      script._triggerPromises = [];
      script._warmupEl?.dispose();
      script._warmupEl = void 0;
      if (script.entry) {
        script.entry.dispose();
        script.entry = void 0;
      }
      if (scripts[id] === script)
        delete scripts[id];
      if (script.status !== "removed")
        syncStatus("removed");
      return hadEntry;
    },
    warmup(rel) {
      const { src } = input;
      const isCrossOrigin = !src.startsWith("/") || src.startsWith("//");
      const isPreconnect = rel && PreconnectServerModes.includes(rel);
      let href = src;
      if (!rel || isPreconnect && !isCrossOrigin) {
        return;
      }
      if (isPreconnect) {
        const $url = new URL(src);
        href = `${$url.protocol}//${$url.host}`;
      }
      const link = {
        href,
        rel,
        crossorigin: typeof input.crossorigin !== "undefined" ? input.crossorigin : isCrossOrigin ? "anonymous" : void 0,
        referrerpolicy: typeof input.referrerpolicy !== "undefined" ? input.referrerpolicy : isCrossOrigin ? "no-referrer" : void 0,
        fetchpriority: typeof input.fetchpriority !== "undefined" ? input.fetchpriority : "low",
        integrity: input.integrity,
        as: rel === "preload" ? "script" : void 0
      };
      script._warmupEl = head.push({ link: [link] }, { head, tagPriority: "high" });
      return script._warmupEl;
    },
    load(cb) {
      if (script.status === "removed")
        return loadPromise;
      script._triggerAbortControllers?.forEach((ac) => ac.abort());
      script._triggerAbortControllers?.clear();
      script._triggerPromises = [];
      if (!script.entry) {
        syncStatus("loading");
        const defaults = {
          defer: true,
          fetchpriority: "low"
        };
        if (input.src && (input.src.startsWith("http") || input.src.startsWith("//"))) {
          defaults.crossorigin = "anonymous";
          defaults.referrerpolicy = "no-referrer";
        }
        script.entry = head.push({
          script: [{ ...defaults, ...input }]
        }, options);
      }
      if (cb)
        _registerCb("loaded", cb);
      return loadPromise;
    },
    onLoaded(cb, options2) {
      return _registerCb("loaded", cb, options2);
    },
    onError(cb, options2) {
      return _registerCb("error", cb, options2);
    },
    setupTriggerHandler(trigger) {
      if (script.status !== "awaitingLoad") {
        return;
      }
      if ((typeof trigger === "undefined" || trigger === "client") && !head.ssr || trigger === "server") {
        script.load();
      } else if (trigger instanceof Promise) {
        if (head.ssr) {
          return;
        }
        const abortController = new AbortController();
        script._triggerAbortControllers = script._triggerAbortControllers || /* @__PURE__ */ new Set();
        script._triggerAbortControllers.add(abortController);
        const abortPromise = new Promise((resolve) => {
          abortController.signal.addEventListener("abort", () => {
            script._triggerAbortControllers?.delete(abortController);
            resolve();
          });
        });
        script._triggerAbortController = abortController;
        script._triggerPromises = script._triggerPromises || [];
        const triggerPromise = Promise.race([
          trigger.then((v) => typeof v === "undefined" || v ? script.load : void 0),
          abortPromise
        ]).catch(() => {
        }).then((res) => {
          res?.();
        }).finally(() => {
          script._triggerAbortControllers?.delete(abortController);
          const idx = script._triggerPromises?.indexOf(triggerPromise) ?? -1;
          if (idx !== -1)
            script._triggerPromises?.splice(idx, 1);
        });
        script._triggerPromises.push(triggerPromise);
      } else if (typeof trigger === "function") {
        trigger(script.load);
      }
    },
    _cbs
  };
  loadPromise.then((api) => {
    if (api !== false) {
      script.instance = api;
      _cbs.loaded?.forEach((cb) => cb(api));
      _cbs.loaded = null;
    } else {
      if (script.status === "error")
        _cbs.error?.forEach((cb) => cb());
      _cbs.loaded = null;
      _cbs.error = null;
    }
  });
  const hookCtx = { script };
  script.setupTriggerHandler(options.trigger);
  if (options.use) {
    const { proxy, resolve } = createScriptProxy(head.ssr ? {} : options.use() || {});
    script.proxy = proxy;
    script.onLoaded(resolve);
  }
  if (!options.warmupStrategy && (typeof options.trigger === "undefined" || options.trigger === "client")) {
    options.warmupStrategy = "preload";
  }
  if (options.warmupStrategy) {
    script.warmup(options.warmupStrategy);
  }
  scripts[id] = script;
  return script;
}

export { resolveScriptKey as r, useScript as u };
