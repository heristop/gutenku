/*!
* vue-router v5.4.0
* (c) 2026 Eduardo San Martin Morote
* @license MIT
*/
import { A as PLUS_RE, C as isSameRouteLocation, D as resolveRelativePath, F as encodePath, I as isBrowser, M as decode, P as encodeParam, S as START_LOCATION_NORMALIZED, c as useCallbacks, d as stringifyQuery, g as getScrollKey, h as getSavedScrollPosition, i as guardToPromiseFn, j as commonEncode, n as extractChangingRecords, r as extractComponentsGuards, t as addDevtools, v as saveScrollPosition, y as scrollToPosition } from "../devtools-CxgSYwGp.js";
import { S as toValueWithArgs, _ as isArray, a as routerKey, d as createRouterError, f as isNavigationFailure, h as identityFn, i as routeLocationKey, l as diagnostics, m as assign, n as useRouter, o as routerViewLocationKey, s as routerViewOnRouteRenderedKey, t as useRoute, x as noop } from "../useApi-CUWMwLLw.js";
import { _ as LOADER_SET_KEY, b as toLazyValue, c as setCurrentContext, d as ABORT_CONTROLLER_KEY, f as APP_KEY, g as LOADER_ENTRIES_KEY, h as IS_USE_DATA_LOADER_KEY, i as useIsDataLoading, l as trackRoute, m as IS_SSR_KEY, n as NavigationResult$1, o as getCurrentContext, r as reroute, t as DataLoaderPlugin, u as withLoaderContext, v as PENDING_LOCATION_KEY, y as STAGED_NO_VALUE } from "../navigation-guard-DnFUWw4l.js";
import { getCurrentInstance, inject, nextTick, onActivated, onBeforeMount, onDeactivated, onMounted, onUnmounted, shallowReactive, shallowRef, toValue, unref, warn } from "vue";
//#region src/experimental/route-resolver/resolver-abstract.ts
/**
* Checks if a location is absolute, meaning it has a `name` or an absolute `path`.
*
* @param to - The location to check.
* @returns `true` if the location is absolute, `false` otherwise.
*/
const isAbsoluteLocation = (to) => typeof to === "string" ? to.startsWith("/") : to.name != null || !!to.path?.startsWith("/");
/**
* Common properties for a location that couldn't be matched. This ensures
* having the same name while having a `path`, `query` and `hash` that change.
*/
const NO_MATCH_LOCATION = {
	name: process.env.NODE_ENV !== "production" ? Symbol("no-match") : Symbol(),
	params: {},
	matched: []
};
//#endregion
//#region src/experimental/router.ts
function normalizeRouteRecord(record) {
	if (process.env.NODE_ENV !== "production" && !record.aliasOf && "beforeEnter" in record && record.beforeEnter) diagnostics.VUE_ROUTER_D0001({ name: record.name == null ? "(unnamed)" : String(record.name) });
	const normalizedRecord = {
		meta: {},
		props: {},
		...record,
		instances: {},
		leaveGuards: /* @__PURE__ */ new Set(),
		updateGuards: /* @__PURE__ */ new Set()
	};
	Object.defineProperty(normalizedRecord, "mods", { value: {} });
	return normalizedRecord;
}
/**
* Creates an experimental Router that allows passing a resolver instead of a
* routes array. This router does not have `addRoute()` and `removeRoute()`
* methods and is meant to be used with file-based routing thanks to
* vue-router/vite or vue-router/unplugin resolver generation in
* `'vue-router/auto-resolver'`.
*
* @param options - Options to initialize the router
*/
function experimental_createRouter(options) {
	let { resolver, stringifyQuery: stringifyQuery$1 = stringifyQuery, history: routerHistory } = options;
	const beforeGuards = useCallbacks();
	const beforeResolveGuards = useCallbacks();
	const afterGuards = useCallbacks();
	const currentRoute = shallowRef(START_LOCATION_NORMALIZED);
	let pendingLocation = START_LOCATION_NORMALIZED;
	if (isBrowser && options.scrollBehavior) history.scrollRestoration = "manual";
	function resolve(...[to, currentLocation]) {
		const matchedRoute = resolver.resolve(to, currentLocation ?? (typeof to === "string" && !to.startsWith("/") ? currentRoute.value : void 0));
		const href = routerHistory.createHref(matchedRoute.fullPath);
		if (process.env.NODE_ENV !== "production") {
			if (href.startsWith("//")) warn(`Location ${JSON.stringify(to)} resolved to "${href}". A resolved location cannot start with multiple slashes.`);
			if (!matchedRoute.matched.length) warn(`No match found for location with path "${to}"`);
		}
		return assign(matchedRoute, {
			redirectedFrom: void 0,
			href,
			meta: mergeMetaFields(matchedRoute.matched)
		});
	}
	function checkCanceledNavigation(to, from) {
		if (pendingLocation !== to) return createRouterError(8, {
			from,
			to
		});
	}
	const push = (...args) => pushWithRedirect(resolve(...args));
	const replace = (...args) => pushWithRedirect(resolve(...args), true);
	function handleRedirectRecord(to, from) {
		const redirect = to.matched.at(-1)?.redirect;
		if (redirect) {
			const target = typeof redirect === "function" ? redirect(to, from) : redirect;
			if (process.env.NODE_ENV !== "production" && !isAbsoluteLocation(target)) throw diagnostics.VUE_ROUTER_R0008({
				target: JSON.stringify(target, null, 2),
				to: to.fullPath
			});
			return target;
		}
	}
	function pushWithRedirect(to, replace, redirectedFrom) {
		replace = to.replace ?? replace;
		pendingLocation = to;
		const from = currentRoute.value;
		const data = to.state;
		const force = to.force;
		const shouldRedirect = handleRedirectRecord(to, from);
		if (shouldRedirect) return pushWithRedirect({
			...resolve(shouldRedirect),
			state: typeof shouldRedirect === "object" ? assign({}, data, shouldRedirect.state) : data,
			force
		}, replace, redirectedFrom || to);
		const toLocation = to;
		toLocation.redirectedFrom = redirectedFrom;
		let failure;
		if (!force && isSameRouteLocation(stringifyQuery$1, from, to)) {
			failure = createRouterError(16, {
				to: toLocation,
				from
			});
			handleScroll(from, from, true, false);
		}
		return (failure ? Promise.resolve(failure) : navigate(toLocation, from)).catch((error) => isNavigationFailure(error) ? isNavigationFailure(error, 2) ? error : markAsReady(error) : triggerError(error, toLocation, from)).then((failure) => {
			if (failure) {
				if (isNavigationFailure(failure, 2)) {
					const redirectTo = resolve(failure.to, isAbsoluteLocation(failure.to) ? void 0 : toLocation);
					if (process.env.NODE_ENV !== "production" && isSameRouteLocation(stringifyQuery$1, redirectTo, toLocation) && redirectedFrom && (redirectedFrom._count = redirectedFrom._count ? redirectedFrom._count + 1 : 1) > 30) {
						warn(`Detected a possibly infinite redirection in a navigation guard when going from "${from.fullPath}" to "${toLocation.fullPath}". Aborting to avoid a Stack Overflow.\n Are you always returning a new location within a navigation guard? That would lead to this error. Only return when redirecting or aborting, that should fix this. This might break in production if not fixed.`);
						return Promise.reject(/* @__PURE__ */ new Error("Infinite redirect in navigation guard"));
					}
					return pushWithRedirect({
						...redirectTo,
						state: typeof failure.to === "object" ? assign({}, data, failure.to.state) : data,
						force
					}, replace, redirectedFrom || toLocation);
				}
			} else failure = finalizeNavigation(toLocation, from, true, replace, data);
			triggerAfterEach(toLocation, from, failure);
			return failure;
		});
	}
	/**
	* Helper to reject and skip all navigation guards if a new navigation happened
	* @param to
	* @param from
	*/
	function checkCanceledNavigationAndReject(to, from) {
		const error = checkCanceledNavigation(to, from);
		return error ? Promise.reject(error) : Promise.resolve();
	}
	function runWithContext(fn) {
		const app = installedApps.values().next().value;
		return app?.runWithContext ? app.runWithContext(fn) : fn();
	}
	function navigate(to, from) {
		let guards;
		const [leavingRecords, updatingRecords, enteringRecords] = extractChangingRecords(to, from);
		guards = extractComponentsGuards(leavingRecords.reverse(), "beforeRouteLeave", to, from);
		for (const record of leavingRecords) record.leaveGuards.forEach((guard) => {
			guards.push(guardToPromiseFn(guard, to, from));
		});
		const canceledNavigationCheck = checkCanceledNavigationAndReject.bind(null, to, from);
		guards.push(canceledNavigationCheck);
		return runGuardQueue(guards).then(() => {
			guards = [];
			for (const guard of beforeGuards.list()) guards.push(guardToPromiseFn(guard, to, from));
			guards.push(canceledNavigationCheck);
			return runGuardQueue(guards);
		}).then(() => {
			guards = extractComponentsGuards(updatingRecords, "beforeRouteUpdate", to, from);
			for (const record of updatingRecords) record.updateGuards.forEach((guard) => {
				guards.push(guardToPromiseFn(guard, to, from));
			});
			guards.push(canceledNavigationCheck);
			return runGuardQueue(guards);
		}).then(() => {
			guards = [];
			for (const record of enteringRecords) if (record.beforeEnter) {
				if (isArray(record.beforeEnter)) for (const beforeEnter of record.beforeEnter) guards.push(guardToPromiseFn(beforeEnter, to, from));
				else guards.push(guardToPromiseFn(record.beforeEnter, to, from));
			}
			guards.push(canceledNavigationCheck);
			return runGuardQueue(guards);
		}).then(() => {
			to.matched.forEach((record) => record.enterCallbacks = {});
			guards = extractComponentsGuards(enteringRecords, "beforeRouteEnter", to, from, runWithContext);
			guards.push(canceledNavigationCheck);
			return runGuardQueue(guards);
		}).then(() => {
			guards = [];
			for (const guard of beforeResolveGuards.list()) guards.push(guardToPromiseFn(guard, to, from));
			guards.push(canceledNavigationCheck);
			return runGuardQueue(guards);
		}).catch((err) => isNavigationFailure(err, 8) ? err : Promise.reject(err));
	}
	function triggerAfterEach(to, from, failure) {
		afterGuards.list().forEach((guard) => runWithContext(() => guard(to, from, failure)));
	}
	/**
	* - Cleans up any navigation guards
	* - Changes the url if necessary
	* - Calls the scrollBehavior
	*/
	function finalizeNavigation(toLocation, from, isPush, replace, data) {
		const error = checkCanceledNavigation(toLocation, from);
		if (error) return error;
		const isFirstNavigation = from === START_LOCATION_NORMALIZED;
		const state = !isBrowser ? {} : history.state;
		if (isPush) {
			if (replace || isFirstNavigation) routerHistory.replace(toLocation.fullPath, assign({ scroll: isFirstNavigation && state && state.scroll }, data));
			else routerHistory.push(toLocation.fullPath, data);
		}
		currentRoute.value = toLocation;
		handleScroll(toLocation, from, isPush, isFirstNavigation);
		markAsReady();
	}
	let removeHistoryListener;
	function setupListeners() {
		if (removeHistoryListener) return;
		removeHistoryListener = routerHistory.listen((to, _from, info) => {
			if (!router.listening) return;
			const toLocation = resolve(to);
			const shouldRedirect = handleRedirectRecord(toLocation, router.currentRoute.value);
			if (shouldRedirect) {
				pushWithRedirect(assign(resolve(shouldRedirect), { force: true }), true, toLocation).catch(noop);
				return;
			}
			pendingLocation = toLocation;
			const from = currentRoute.value;
			if (isBrowser && info.delta) saveScrollPosition(getScrollKey(from.fullPath, info.delta));
			navigate(toLocation, from).catch((error) => {
				if (isNavigationFailure(error, 12)) return error;
				if (isNavigationFailure(error, 2)) {
					pushWithRedirect(assign(resolve(error.to, isAbsoluteLocation(error.to) ? void 0 : toLocation), { force: true }), void 0, toLocation).then((failure) => {
						if (isNavigationFailure(failure, 20) && !info.delta && info.type === "pop") routerHistory.go(-1, false);
					}).catch(noop);
					return Promise.reject();
				}
				if (info.delta) routerHistory.go(-info.delta, false);
				return triggerError(error, toLocation, from);
			}).then((failure) => {
				failure = failure || finalizeNavigation(toLocation, from, false);
				if (failure) {
					if (info.delta && !isNavigationFailure(failure, 8)) routerHistory.go(-info.delta, false);
					else if (info.type === "pop" && isNavigationFailure(failure, 20)) routerHistory.go(-1, false);
				}
				triggerAfterEach(toLocation, from, failure);
			}).catch(noop);
		});
	}
	let readyHandlers = useCallbacks();
	let errorListeners = useCallbacks();
	let ready;
	/**
	* Trigger errorListeners added via onError and throws the error as well
	*
	* @param error - error to throw
	* @param to - location we were navigating to when the error happened
	* @param from - location we were navigating from when the error happened
	* @returns the error as a rejected promise
	*/
	function triggerError(error, to, from) {
		markAsReady(error);
		const list = errorListeners.list();
		if (list.length) list.forEach((handler) => handler(error, to, from));
		else {
			if (process.env.NODE_ENV !== "production") warn("uncaught error during route navigation:");
			console.error(error);
		}
		return Promise.reject(error);
	}
	function isReady() {
		if (ready && currentRoute.value !== START_LOCATION_NORMALIZED) return Promise.resolve();
		return new Promise((resolve, reject) => {
			readyHandlers.add([resolve, reject]);
		});
	}
	function markAsReady(err) {
		if (!ready) {
			ready = !err;
			setupListeners();
			readyHandlers.list().forEach(([resolve, reject]) => err ? reject(err) : resolve());
			readyHandlers.reset();
		}
		return err;
	}
	function handleScroll(to, from, isPush, isFirstNavigation) {
		const { scrollBehavior } = options;
		if (!isBrowser || !scrollBehavior) return Promise.resolve();
		const scrollPosition = !isPush && getSavedScrollPosition(getScrollKey(to.fullPath, 0)) || (isFirstNavigation || !isPush) && history.state && history.state.scroll || null;
		return nextTick().then(() => scrollBehavior(to, from, scrollPosition)).then((position) => to === currentRoute.value && position && scrollToPosition(position)).catch((err) => to === currentRoute.value && triggerError(err, to, from));
	}
	const go = (delta) => routerHistory.go(delta);
	let started;
	const installedApps = /* @__PURE__ */ new Set();
	const router = {
		currentRoute,
		listening: true,
		hasRoute: (name) => !!resolver.getRoute(name),
		getRoutes: () => resolver.getRoutes(),
		resolve,
		options,
		push,
		replace,
		go,
		back: () => go(-1),
		forward: () => go(1),
		beforeEach: beforeGuards.add,
		beforeResolve: beforeResolveGuards.add,
		afterEach: afterGuards.add,
		onError: errorListeners.add,
		isReady,
		install(app) {
			app.config.globalProperties.$router = router;
			Object.defineProperty(app.config.globalProperties, "$route", {
				enumerable: true,
				get: () => unref(currentRoute)
			});
			if (isBrowser && !started && currentRoute.value === START_LOCATION_NORMALIZED) {
				started = true;
				push(routerHistory.location).catch((err) => {
					if (process.env.NODE_ENV !== "production") warn("Unexpected error on initial navigation:", err);
				});
			}
			const reactiveRoute = {};
			for (const key in START_LOCATION_NORMALIZED) Object.defineProperty(reactiveRoute, key, {
				get: () => currentRoute.value[key],
				enumerable: true
			});
			app.provide(routerKey, router);
			app.provide(routeLocationKey, shallowReactive(reactiveRoute));
			app.provide(routerViewLocationKey, currentRoute);
			installedApps.add(app);
			app.onUnmount(() => {
				installedApps.delete(app);
				if (installedApps.size < 1) {
					pendingLocation = START_LOCATION_NORMALIZED;
					removeHistoryListener && removeHistoryListener();
					removeHistoryListener = null;
					currentRoute.value = START_LOCATION_NORMALIZED;
					started = false;
					ready = false;
				}
			});
			if ((process.env.NODE_ENV !== "production" || __VUE_PROD_DEVTOOLS__) && isBrowser) addDevtools(app, router, resolver);
		}
	};
	function runGuardQueue(guards) {
		return guards.reduce((promise, guard) => promise.then(() => runWithContext(guard)), Promise.resolve());
	}
	if (process.env.NODE_ENV !== "production") router._hmrReplaceResolver = (newResolver) => {
		resolver = newResolver;
	};
	return router;
}
/**
* Merge meta fields of an array of records
*
* @param matched - array of matched records
*/
function mergeMetaFields(matched) {
	return assign({}, ...matched.map((r) => r.meta));
}
//#endregion
//#region src/experimental/on-route-rendered.ts
function onRouteRenderedClient(callback) {
	let callbacks = inject(routerViewOnRouteRenderedKey, null);
	if (!callbacks) {
		callbacks = /* @__PURE__ */ new Set();
		const router = useRouter();
		let reportedNavigation = false;
		if (!getCurrentInstance().root.isMounted && router.currentRoute.value !== START_LOCATION_NORMALIZED) onMounted(() => {
			if (!reportedNavigation) for (const registeredCallback of callbacks) registeredCallback(router.currentRoute.value, START_LOCATION_NORMALIZED);
		});
		onUnmounted(router.afterEach((to, from, failure) => {
			if (!failure) for (const registeredCallback of callbacks) {
				reportedNavigation = true;
				registeredCallback(to, from);
			}
		}));
	}
	const add = () => callbacks.add(callback);
	const remove = () => callbacks.delete(callback);
	add();
	onActivated(add);
	onDeactivated(remove);
	onUnmounted(remove);
}
/**
* Calls `callback` after each successful navigation. Within a `<RouterView>`,
* it is called once the closest ancestor `<RouterView>` displays the new
* route: after the page mounts or updates, after `<Suspense>` resolves, and
* after an out-in `<Transition>` enters. Outside of any `<RouterView>`, it is
* called in `router.afterEach()`, before the new route renders, and once
* mounted if the app is mounted after the initial navigation.
*
* Must be called in `setup()`. The callback is removed when the component
* unmounts and paused while it is deactivated by `<KeepAlive>`. Does nothing
* during SSR.
*
* Within a `<RouterView>` whose route component is memoized with `v-memo`
* (e.g. `<component :is="Component" v-memo="[route.path]" />`), it is not
* called for navigations that keep the memo values (e.g. query or hash
* changes).
*
* @param callback - called with the displayed route and the previously
* displayed one
*/
const onRouteRendered = typeof document === "undefined" ? noop : onRouteRenderedClient;
//#endregion
//#region src/experimental/scroll-restoration.ts
/**
* Captures the current window scroll position for default scroll restoration.
*
* @returns the saved entry or `null` if the browser handles scroll restoration
* itself (`history.scrollRestoration !== 'manual'`)
*
* @see {@link ScrollRestoration}
*/
const SCROLL_RESTORATION_CAPTURE_DEFAULT = () => history.scrollRestoration === "manual" ? { default: {
	left: window.scrollX,
	top: window.scrollY
} } : null;
/**
* Restores the saved window position, scrolls to the route hash target, or
* scrolls to the top when there is no saved position or hash target.
*
* @see {@link ScrollRestoration}
*/
function SCROLL_RESTORATION_RESTORE_DEFAULT(entry, to) {
	const position = entry?.default;
	let options = position || {
		left: 0,
		top: 0
	};
	let element;
	if (position?.el) {
		const { el } = position;
		element = el.startsWith("#") ? document.getElementById(el.slice(1)) : void 0;
		/**
		* `id`s can accept pretty much any characters, including CSS combinators
		* like `>` or `~`. It's still possible to retrieve elements using
		* `document.getElementById('~')` but it needs to be escaped when using
		* `document.querySelector('#\\~')` for it to be valid. The only
		* requirements for `id`s are them to be unique on the page and to not be
		* empty (`id=""`). Because of that, when passing an id selector, it should
		* be properly escaped for it to work with `querySelector`. We could check
		* for the id selector to be simple (no CSS combinators `+ >~`) but that
		* would make things inconsistent since they are valid characters for an
		* `id` but would need to be escaped when using `querySelector`, breaking
		* their usage and ending up in no selector returned. Selectors need to be
		* escaped:
		*
		* - `#1-thing` becomes `#\31 -thing`
		* - `#with~symbols` becomes `#with\\~symbols`
		*
		* - More information about  the topic can be found at
		*   https://mathiasbynens.be/notes/html5-id-class.
		* - Practical example: https://mathiasbynens.be/demo/html5-id
		*/
		if (process.env.NODE_ENV !== "production" && !element) try {
			const foundEl = document.querySelector(el);
			if (el.startsWith("#") && foundEl) {
				diagnostics.VUE_ROUTER_R0040({ el });
				return;
			}
		} catch {
			diagnostics.VUE_ROUTER_R0041({ el });
			return;
		}
		element ??= document.querySelector(el);
		if (!element) {
			process.env.NODE_ENV !== "production" && diagnostics.VUE_ROUTER_R0042({ el });
			return;
		}
	} else if (!position && to?.hash) element = document.getElementById(to.hash.slice(1));
	if (element) {
		const docRect = document.documentElement.getBoundingClientRect();
		const elRect = element.getBoundingClientRect();
		options = {
			behavior: position?.behavior,
			left: elRect.left - docRect.left - (position?.left || 0),
			top: elRect.top - docRect.top - (position?.top || 0)
		};
	}
	window.scrollTo(options);
}
const SCROLL_RESTORATION_REGISTRATIONS = Symbol();
const SCROLL_RESTORATION_PLUGIN_OPTIONS_DEFAULTS = {
	storageKeyPrefix: "vue:scroll:",
	key: (to) => to.path + to.hash,
	manual: false
};
const SCROLL_RESTORATION_OPTIONS_KEY = Symbol();
/**
* Enables component-owned scroll restoration backed by `sessionStorage`.
* Sets `history.scrollRestoration` to `manual` when `document` is defined, is
* a noop otherwise (SSR).
*
* Must be installedb before the router, and the router must be passed in the options.
*
* ```ts
* app.use(ScrollRestoration, { router })
* app.use(router)
* ```
*/
const ScrollRestoration = typeof document === "undefined" ? noop : ScrollRestorationClient;
let devTrackedCapturedOptions;
function ScrollRestorationClient(app, options) {
	const optionsWithDefaults = {
		...SCROLL_RESTORATION_PLUGIN_OPTIONS_DEFAULTS,
		...options
	};
	const { storageKeyPrefix, router } = optionsWithDefaults;
	app.provide(SCROLL_RESTORATION_OPTIONS_KEY, optionsWithDefaults);
	const registrations = /* @__PURE__ */ new Set();
	history.scrollRestoration = "manual";
	function restoreScroll({ restore, key }, to = router.currentRoute.value) {
		let entry;
		let value;
		try {
			entry = (value = sessionStorage[storageKeyPrefix + toValueWithArgs(key, to)]) && JSON.parse(value);
		} catch {}
		restore(entry, to);
	}
	app.provide(SCROLL_RESTORATION_REGISTRATIONS, [registrations, restoreScroll]);
	function capture(route) {
		if (process.env.NODE_ENV !== "production") devTrackedCapturedOptions = /* @__PURE__ */ new Map();
		for (const registration of registrations) {
			const key = storageKeyPrefix + toValueWithArgs(registration.key, route);
			if (process.env.NODE_ENV !== "production") {
				const other = devTrackedCapturedOptions.get(key);
				if (other && (other.capture !== registration.capture || other.restore !== registration.restore)) diagnostics.VUE_ROUTER_R0043({ key: key.slice(storageKeyPrefix.length) });
				devTrackedCapturedOptions.set(key, registration);
			}
			const entry = registration.capture();
			try {
				if (entry) sessionStorage[key] = JSON.stringify(entry);
				else delete sessionStorage[key];
			} catch {}
		}
	}
	const removeAfterEach = router.afterEach((_to, from, failure) => {
		if (!failure && from !== START_LOCATION_NORMALIZED) capture(from);
	});
	const listenersController = new AbortController();
	const captureOnPageHide = () => capture(router.currentRoute.value);
	window.addEventListener("pagehide", captureOnPageHide, { signal: listenersController.signal });
	document.addEventListener("visibilitychange", () => {
		if (document.visibilityState === "hidden") captureOnPageHide();
	}, { signal: listenersController.signal });
	app.onUnmount(() => {
		removeAfterEach();
		listenersController.abort();
	});
}
/**
* Registers scroll capture and restoration for the current component.
*
* @returns a `scroll` function that manually restores the saved entry
*/
const useScrollRestoration = typeof document === "undefined" ? useScrollRestorationSSR : useScrollRestorationClient;
function useScrollRestorationSSR() {
	return { scroll: noop };
}
function useScrollRestorationClient(options) {
	if (process.env.NODE_ENV !== "production" && !inject(SCROLL_RESTORATION_REGISTRATIONS, null)) throw diagnostics.VUE_ROUTER_R0044();
	const [registrations, restore] = inject(SCROLL_RESTORATION_REGISTRATIONS);
	const optionsWithDefaults = {
		...inject(SCROLL_RESTORATION_OPTIONS_KEY),
		...options
	};
	const add = () => registrations.add(optionsWithDefaults);
	const remove = () => registrations.delete(optionsWithDefaults);
	onBeforeMount(add);
	onActivated(add);
	onDeactivated(remove);
	onUnmounted(remove);
	onRouteRendered((to) => {
		if (!toValue(optionsWithDefaults.manual)) {
			if (registrations.has(optionsWithDefaults)) restore(optionsWithDefaults, to);
		}
	});
	return { scroll: () => restore(optionsWithDefaults) };
}
//#endregion
//#region src/experimental/encoding.ts
const PERCENT_RE = /%/g;
const ENC_PERCENT_RE = /%25/g;
const ENC_CARET_RE = /%5E/g;
const ENC_CURLY_OPEN_RE = /%7B/g;
const ENC_CURLY_CLOSE_RE = /%7D/g;
/**
* Encode characters that need to be encoded on the hash section of the URL.
* Like setting `url.hash`: existing percent encoded sequences and lone `%` are
* kept as they are, which makes this function idempotent and never decoding.
*
* @param text - string to encode
* @returns encoded string
*/
function encodeHash(text) {
	return commonEncode(text).replace(ENC_CURLY_OPEN_RE, "{").replace(ENC_CURLY_CLOSE_RE, "}").replace(ENC_CARET_RE, "^").replace(ENC_PERCENT_RE, "%");
}
//#endregion
//#region src/experimental/query.ts
/**
* Transforms a queryString into a {@link LocationQuery} object. Accept both, a
* version with the leading `?` and without. Uses `Object.create(null)` so the
* returned object cannot be exploited via prototype pollution.
*
* @internal
*
* @param search - search string to parse
* @returns a query object
*/
function experimental_parseQuery(search) {
	const query = Object.create(null);
	if (search === "" || search === "?") return query;
	const searchParams = (search[0] === "?" ? search.slice(1) : search).split("&");
	for (let i = 0; i < searchParams.length; ++i) {
		const searchParam = searchParams[i].replace(PLUS_RE, " ");
		const eqPos = searchParam.indexOf("=");
		const key = decode(eqPos < 0 ? searchParam : searchParam.slice(0, eqPos));
		const value = eqPos < 0 ? null : decode(searchParam.slice(eqPos + 1));
		query[key] ??= [];
		query[key].push(value);
	}
	return query;
}
/**
* Transforms a {@link LocationQueryRaw} into a {@link LocationQuery} by casting
* numbers into strings, wrapping non array values in an array, removing keys
* with an undefined value and replacing undefined with null in arrays. Uses `Object.create(null)` so the returned
* object cannot be exploited via prototype pollution.
*
* FIXME: remove once only arrays are accepted in {@link LocationQueryRaw}.
* Normalization will then only cast numbers and remove undefined keys.
*
* @param query - query object to normalize
* @returns a normalized query object
*/
function experimental_normalizeQuery(query) {
	const normalizedQuery = Object.create(null);
	for (const key in query) {
		const value = query[key];
		if (value !== void 0) normalizedQuery[key] = (isArray(value) ? value : [value]).map((v) => v == null ? null : "" + v);
	}
	return normalizedQuery;
}
/**
* Warns about raw query values that are not arrays. Dev only.
* FIXME: remove with the non array normalization in
* {@link experimental_normalizeQuery}.
*
* @param query - raw query passed by the user
*/
function warnNonArrayQueryValues(query) {
	for (const key in query) {
		const value = query[key];
		if (value !== void 0 && !isArray(value)) diagnostics.VUE_ROUTER_D0002({
			key,
			value: JSON.stringify(value)
		});
	}
}
//#endregion
//#region src/experimental/location.ts
/**
* Transforms a URI into a normalized history location. Same behavior as the
* legacy `parseURL` but uses `Object.create(null)` for the query object so it
* cannot be exploited via prototype pollution.
*
* @param parseQuery
* @param location - URI to normalize
* @param currentLocation - current absolute location. Allows resolving relative
* paths. Must start with `/`. Defaults to `/`
* @returns a normalized history location
*/
function experimental_parseURL(parseQuery, location, currentLocation = "/") {
	let path, query = Object.create(null), searchString = "", hash = "";
	const hashPos = location.indexOf("#");
	let searchPos = location.indexOf("?");
	searchPos = hashPos >= 0 && searchPos > hashPos ? -1 : searchPos;
	if (searchPos >= 0) {
		path = location.slice(0, searchPos);
		searchString = location.slice(searchPos, hashPos > 0 ? hashPos : location.length);
		query = parseQuery(searchString.slice(1));
	}
	if (hashPos >= 0) {
		path = path || location.slice(0, hashPos);
		hash = location.slice(hashPos, location.length);
	}
	path = resolveRelativePath(path != null ? path : location, currentLocation);
	return {
		fullPath: path + searchString + hash,
		path,
		query,
		hash
	};
}
/**
* Stringifies a URL from its parts. The `hash` must already be encoded (as
* returned by `encodeHash` or read from a URL), it is appended as is.
*
* @param stringifyQuery - function to stringify the query object
* @param path - path section of the URL
* @param query - normalized query object
* @param hash - encoded hash section of the URL, with its leading `#`
* @returns the URL string
*/
function experimental_stringifyURL(stringifyQuery, path, query, hash = "") {
	const searchText = stringifyQuery(query);
	return path + (searchText && "?") + searchText + hash;
}
//#endregion
//#region src/warning.ts
function warn$1(msg) {
	const args = Array.from(arguments).slice(1);
	console.warn.apply(console, ["[Vue Router warn]: " + msg].concat(args));
}
//#endregion
//#region src/experimental/route-resolver/resolver-fixed.ts
/**
* Build the `matched` array of a record that includes all parent records from the root to the current one.
*/
function buildMatched(record) {
	const matched = [];
	let node = record;
	while (node) {
		matched.unshift(node);
		node = node.parent;
	}
	return matched;
}
/**
* Creates a fixed resolver that must have all records defined at creation
* time.
*
* @template TRecord - extended type of the records
* @param {TRecord[]} records - Ordered array of records that will be used to resolve routes
* @returns a resolver that can be passed to the router
*/
function createFixedResolver(records) {
	const recordMap = /* @__PURE__ */ new Map();
	for (const record of records) if (!record.aliasOf) recordMap.set(record.name, record);
	function validateMatch(record, url) {
		const pathParams = record.path.match(url.path);
		const hashParams = record.hash?.match(url.hash);
		const matched = buildMatched(record);
		const queryParams = Object.assign({}, ...matched.flatMap((record) => record.query?.map((query) => query.match(url.query))));
		return [matched, {
			...pathParams,
			...queryParams,
			...hashParams
		}];
	}
	function resolve(...[to, currentLocation]) {
		if (process.env.NODE_ENV !== "production" && typeof to === "object") warnNonArrayQueryValues(to.query);
		if (typeof to === "object" && (to.name || to.path == null)) {
			if (process.env.NODE_ENV !== "production" && to.name == null && currentLocation == null) {
				warn$1(`Cannot resolve relative location "${JSON.stringify(to)}"without a "name" or a current location. This will crash in production.`, to);
				const query = experimental_normalizeQuery(to.query);
				const hash = encodeHash(to.hash ?? "");
				const path = to.path ?? "/";
				return {
					...to,
					...NO_MATCH_LOCATION,
					fullPath: experimental_stringifyURL(stringifyQuery, path, query, hash),
					path,
					query,
					hash
				};
			}
			const name = to.name ?? currentLocation.name;
			const record = recordMap.get(name);
			if (process.env.NODE_ENV !== "production") {
				if (!record || !name) throw new Error(`Record "${String(name)}" not found`);
				if (typeof to === "object" && to.hash && !to.hash.startsWith("#")) warn$1(`A "hash" should always start with the character "#". Replace "${to.hash}" with "#${to.hash}".`);
			}
			let params = {
				...currentLocation?.params,
				...to.params
			};
			const path = record.path.build(params);
			const hash = encodeHash(record.hash?.build(params) ?? to.hash ?? currentLocation?.hash ?? "");
			let matched = buildMatched(record);
			const query = experimental_normalizeQuery(assign({
				...currentLocation?.query,
				...experimental_normalizeQuery(to.query)
			}, ...matched.flatMap((record) => record.query?.map((query) => query.build(params)))));
			const url = {
				...to,
				fullPath: experimental_stringifyURL(stringifyQuery, path, query, hash),
				path,
				hash,
				query
			};
			[matched, params] = validateMatch(record, url);
			return {
				...url,
				name,
				matched,
				params
			};
		} else {
			let url;
			if (typeof to === "string") url = experimental_parseURL(experimental_parseQuery, to, currentLocation?.path);
			else {
				const query = experimental_normalizeQuery(to.query);
				const path = resolveRelativePath(to.path, currentLocation?.path || "/");
				const hash = encodeHash(to.hash || "");
				url = {
					...to,
					fullPath: experimental_stringifyURL(stringifyQuery, path, query, hash),
					path,
					query,
					hash
				};
			}
			let record;
			let matched;
			let parsedParams;
			for (record of records) try {
				[matched, parsedParams] = validateMatch(record, url);
				break;
			} catch {}
			if (!parsedParams || !matched) return {
				...url,
				...NO_MATCH_LOCATION
			};
			return {
				...url,
				name: record.name,
				params: parsedParams,
				matched
			};
		}
	}
	return {
		resolve,
		getRoutes: () => records,
		getRoute: (name) => recordMap.get(name)
	};
}
//#endregion
//#region src/experimental/route-resolver/matchers/errors.ts
/**
* Error throw when a matcher matches by regex but validation fails.
*
* @internal
*/
var MatchMiss = class extends Error {
	name = "MatchMiss";
};
/**
* Helper to throw a {@link MatchMiss} error.
* @param args - Arguments to pass to the `MatchMiss` constructor.
*
* @example
* ```ts
* miss()
* // in a number param matcher
* miss('Number must be finite')
* ```
*/
const miss = (...args) => {
	throw new MatchMiss(...args);
};
//#endregion
//#region src/experimental/route-resolver/matchers/matcher-pattern.ts
/**
* Allows matching a static path.
*
* @example
* ```ts
* const matcher = new MatcherPatternPathStatic('/team')
* matcher.match('/team') // {}
* matcher.match('/team/123') // throws MatchMiss
* matcher.build() // '/team'
* ```
*/
var MatcherPatternPathStatic = class {
	path;
	/**
	* lowercase version of the path to match against.
	* This is used to make the matching case insensitive.
	*/
	pathi;
	constructor(path) {
		this.path = path;
		this.pathi = path.toLowerCase();
	}
	match(path) {
		if (path.toLowerCase() !== this.pathi) miss();
		return {};
	}
	build() {
		return this.path;
	}
};
/**
* Regex to remove trailing slashes from a path.
*
* @internal
*/
const TRAILING_SLASHES_RE = /\/*$/;
/**
* Handles the `path` part of a URL with dynamic parameters.
*/
var MatcherPatternPathDynamic = class {
	re;
	params;
	pathParts;
	trailingSlash;
	/**
	* Cached keys of the {@link params} object.
	*/
	paramsKeys;
	/**
	* Creates a new dynamic path matcher.
	*
	* @param re - regex to match the path against
	* @param params - object of param parsers as {@link MatcherPatternPathDynamic_ParamOptions}
	* @param pathParts - array of path parts, where strings are static parts, 1 are regular params, and 0 are splat params (not encode slash)
	* @param trailingSlash - whether the path should end with a trailing slash, null means "do not care" (for trailing splat params)
	*/
	constructor(re, params, pathParts, trailingSlash = false) {
		this.re = re;
		this.params = params;
		this.pathParts = pathParts;
		this.trailingSlash = trailingSlash;
		this.paramsKeys = Object.keys(this.params);
	}
	match(path) {
		if (this.trailingSlash != null && this.trailingSlash === !path.endsWith("/")) miss();
		const match = path.match(this.re);
		if (!match) miss();
		const params = {};
		for (var i = 0; i < this.paramsKeys.length; i++) {
			var paramName = this.paramsKeys[i];
			var [parser, repeatable] = this.params[paramName];
			var currentMatch = match[i + 1] ?? null;
			var value = repeatable ? (currentMatch?.split("/") || []).map(decode) : decode(currentMatch);
			params[paramName] = (parser?.get || identityFn)(value);
		}
		if (process.env.NODE_ENV !== "production" && Object.keys(params).length !== Object.keys(this.params).length) warn$1(`Regexp matched ${match.length} params, but ${i} params are defined. Found when matching "${path}" against ${String(this.re)}`);
		return params;
	}
	build(params) {
		let paramIndex = 0;
		let paramName;
		let parser;
		let optional;
		let value;
		const path = "/" + this.pathParts.map((part) => {
			if (typeof part === "string") return part;
			else if (typeof part === "number") {
				paramName = this.paramsKeys[paramIndex++];
				[parser, , optional] = this.params[paramName];
				value = (parser?.set || identityFn)(params[paramName]);
				if (process.env.NODE_ENV !== "production" && optional && Object.hasOwn(params, paramName)) warnLegacyOptionalParam(String(paramName), params[paramName], value);
				if (Array.isArray(value) && !value.length && !optional) miss();
				return Array.isArray(value) ? value.map(encodeParam).join("/") : (part ? encodeParam : encodePath)(value);
			} else return part.map((subPart) => {
				if (typeof subPart === "string") return subPart;
				paramName = this.paramsKeys[paramIndex++];
				[parser, , optional] = this.params[paramName];
				value = (parser?.set || identityFn)(params[paramName]);
				if (process.env.NODE_ENV !== "production" && optional && Object.hasOwn(params, paramName)) warnLegacyOptionalParam(String(paramName), params[paramName], value);
				return Array.isArray(value) ? value.map(encodeParam).join("/") : encodeParam(value);
			}).join("");
		}).filter(identityFn).join("/");
		/**
		* If the last part of the path is a splat param and its value is empty, it gets
		* filteretd out, resulting in a path that doesn't end with a `/` and doesn't even match
		* with the original splat path: e.g. /teams/[...pathMatch] does not match /teams, so it makes
		* no sense to build a path it cannot match.
		*/
		return this.trailingSlash == null ? path + (!value && path.at(-1) !== "/" ? "/" : "") : path.replace(TRAILING_SLASHES_RE, this.trailingSlash ? "/" : "");
	}
};
/**
* Warns about a usage that is no longer supported: using undefined or an empty
* string for an optional param. Instead just use null
*/
function warnLegacyOptionalParam(param, raw, value) {
	if ((raw === void 0 || raw === "") && (value == null || value === "" || Array.isArray(value) && !value.length)) diagnostics.VUE_ROUTER_R0122({
		param,
		value: raw === void 0 ? "undefined" : "an empty string"
	});
}
//#endregion
//#region src/experimental/route-resolver/matchers/matcher-pattern-hash.ts
/**
* Reads and writes one param using the hash content, without its leading `#`.
*/
var MatcherPatternHashParam = class {
	paramName;
	parser;
	defaultValue;
	required;
	constructor(paramName, parser = {}, defaultValue, required) {
		this.paramName = paramName;
		this.parser = parser;
		this.defaultValue = defaultValue;
		this.required = required;
	}
	match(hash) {
		let value;
		if (hash) {
			const content = decode(hash.slice(1));
			try {
				value = this.parser.get ? this.parser.get(content) : content;
			} catch (error) {
				if (this.required && this.defaultValue === void 0) throw error;
			}
		}
		if (value === void 0) value = this.defaultValue !== void 0 ? toValue(this.defaultValue) : this.required ? miss() : void 0;
		return { [this.paramName]: value };
	}
	build(params) {
		const value = params[this.paramName];
		if (value == null) return "";
		const content = this.parser.set ? this.parser.set(value) : String(value);
		return content == null ? "" : "#" + String(content).replace(PERCENT_RE, "%25");
	}
};
//#endregion
//#region src/experimental/route-resolver/matchers/param-parsers/define-param-parser.ts
/**
* Default parser for params that will keep values as is, and will use `String()`
*/
const PARAM_PARSER_DEFAULTS = {
	get: (value) => value ?? null,
	set: (value) => value == null ? null : Array.isArray(value) ? value.map((v) => v == null ? null : String(v)) : String(value)
};
/**
* Defines a param parser that works with any kind of param (path, repeatable,
* optional, query, hash, ...) but requires the user to handle all cases in the
* get and set functions (nullish, undefined, arrays, etc). This allows you to
* have full control over the parsing logic, but it also means that you need to
* handle all edge cases yourself. If possible, prefer using {@see defineParamParser}
* which provides a more structured way to handle these
* cases and automatically handles arrays and nullish values.
*
* @example
*
* Here is an example that allows arbitrary numbers (NaN values are filtered
* out). It supports repeatable params, so it can be used both as a path param
* parser and a query param parser.
*
* ```ts
* export const parser = defineParamParserRaw<number>({
*   get: value => {
*     if (value == null) return null
*     if (Array.isArray(value)) {
*       return value
*         .filter(v => v != null)
*         .map(Number)
*         .filter(v => !Number.isNaN(v))
*     }
*
*     return Number.isNaN(Number(value))
*       ? miss(`"${value}" is not a valid number`)
*       : Number(value)
*   },
*
*   set: value =>
*     Array.isArray(value)
*       ? value.map(String)
*       : value == null
*         ? null
*         : String(value),
* })
* ```
*
* @see {@link defineParamParser}
*/
/*! #__NO_SIDE_EFFECTS__ */
function defineParamParserRaw(parser) {
	return parser;
}
/**
* Defines a parser for the hash content, without the leading `#`.
* A bare `#` passes an empty string; a missing hash skips the getter.
* The setter returns the content; the matcher adds the leading `#`.
* Unlike {@link defineParamParser}, this does not wrap arrays or nullish values.
*/
const defineHashParamParser = defineParamParserRaw;
/**
* Defines a param parser that transforms strings to another type. Handles
* optional and repeatable params:
*
* - Optional params: become `null` if the value is nullish
* - Repeatable params: the value becomes an array of the parsed type, and nullish values are filtered out
*
* @example
*
* Here is an example that allows arbitrary valid numbers (NaN values are
* filtered out). It can be used in both, path, and query params.
*
* ```ts
* import { defineParamParser, miss } from 'vue-router/experimental'
*
* export const parser = defineParamParser<number>({
*   get: value => {
*     const num = Number(value)
*     if (Number.isNaN(num)) {
*       miss(`"${value}" is not a valid number`)
*     }
*     return num
*   },
*
*   set: value => String(value),
* })
* ```
*
* @see {@link defineParamParserRaw}
*/
function defineParamParser(parser) {
	return {
		get: (value) => value == null ? null : Array.isArray(value) ? value.filter((v) => v != null).map(parser.get) : parser.get(value),
		set: (value) => value == null ? value : Array.isArray(value) ? value.map(parser.set) : parser.set(value)
	};
}
//#endregion
//#region src/experimental/route-resolver/matchers/param-parsers/booleans.ts
const PARAM_BOOLEAN_SINGLE = {
	get: (value) => {
		if (value === void 0) return void 0;
		if (value == null) return true;
		const lowercaseValue = value.toLowerCase();
		if (lowercaseValue === "true") return true;
		if (lowercaseValue === "false") return false;
		miss();
	},
	set: (value) => value == null ? value : String(value)
};
const PARAM_BOOLEAN_REPEATABLE = {
	get: (value) => value.map((v) => {
		const result = PARAM_BOOLEAN_SINGLE.get(v);
		return result === void 0 ? false : result;
	}),
	set: (value) => value.map((v) => PARAM_BOOLEAN_SINGLE.set(v))
};
/**
* Native Param parser for booleans.
*
* @internal
*/
const PARAM_PARSER_BOOL = {
	get: (value) => Array.isArray(value) ? PARAM_BOOLEAN_REPEATABLE.get(value) : PARAM_BOOLEAN_SINGLE.get(value),
	set: (value) => Array.isArray(value) ? PARAM_BOOLEAN_REPEATABLE.set(value) : PARAM_BOOLEAN_SINGLE.set(value)
};
//#endregion
//#region src/experimental/route-resolver/matchers/param-parsers/integers.ts
const PARAM_INTEGER_SINGLE = {
	get: (value) => {
		const num = Number(value);
		if (value && Number.isSafeInteger(num)) return num;
		miss();
	},
	set: (value) => String(value)
};
const PARAM_INTEGER_REPEATABLE = {
	get: (value) => value.filter((v) => v != null).map(PARAM_INTEGER_SINGLE.get),
	set: (value) => value.map(PARAM_INTEGER_SINGLE.set)
};
/**
* Native Param parser for integers.
*
* @internal
*/
const PARAM_PARSER_INT = {
	get: (value) => Array.isArray(value) ? PARAM_INTEGER_REPEATABLE.get(value) : value != null ? PARAM_INTEGER_SINGLE.get(value) : null,
	set: (value) => Array.isArray(value) ? PARAM_INTEGER_REPEATABLE.set(value) : value != null ? PARAM_INTEGER_SINGLE.set(value) : null
};
//#endregion
//#region src/experimental/route-resolver/matchers/param-parsers/standard-schema.ts
/**
* Normalizes a param parser input, converting a StandardSchema-compliant object
* into a {@link ParamParser} if needed.
*
* @param parser - a param parser or a StandardSchema-compliant validator
*
* @internal
*/
function normalizeParamParser(parser) {
	return "~standard" in parser ? { get(value) {
		const result = parser["~standard"].validate(value);
		if (process.env.NODE_ENV !== "production" && result instanceof Promise) throw new TypeError("async validation is not supported for param parsers");
		if (result.issues) miss(result.issues.map((issue) => issue.message).join(", "));
		return result.value;
	} } : parser;
}
//#endregion
//#region src/experimental/route-resolver/matchers/matcher-pattern-query.ts
/**
* Matcher for a specific query parameter. It will read and write the parameter
*/
var MatcherPatternQueryParam = class {
	paramName;
	queryKey;
	format;
	parser;
	defaultValue;
	required;
	constructor(paramName, queryKey, format, parser = {}, defaultValue, required) {
		this.paramName = paramName;
		this.queryKey = queryKey;
		this.format = format;
		this.parser = parser;
		this.defaultValue = defaultValue;
		this.required = required;
	}
	match(query) {
		const queryValue = query[this.queryKey];
		let valueBeforeParse = this.format === "value" ? Array.isArray(queryValue) ? queryValue.at(-1) : queryValue : Array.isArray(queryValue) ? queryValue : queryValue == null ? [] : [queryValue];
		let value;
		if (Array.isArray(valueBeforeParse)) {
			if (queryValue === void 0 && this.defaultValue !== void 0) value = toValue(this.defaultValue);
			else try {
				value = (this.parser.get ?? PARAM_PARSER_DEFAULTS.get)(valueBeforeParse);
			} catch (error) {
				if (this.required && this.defaultValue === void 0) throw error;
				value = void 0;
			}
		} else try {
			value = valueBeforeParse === void 0 ? valueBeforeParse : (this.parser.get ?? PARAM_PARSER_DEFAULTS.get)(valueBeforeParse);
		} catch (error) {
			if (this.required && this.defaultValue === void 0) throw error;
		}
		if (value === void 0) {
			if (this.defaultValue !== void 0) value = toValue(this.defaultValue);
			else if (this.required) miss();
		}
		return { [this.paramName]: value };
	}
	build(params) {
		const paramValue = params[this.paramName];
		if (paramValue === void 0) return {};
		return { [this.queryKey]: (this.parser.set ?? PARAM_PARSER_DEFAULTS.set)(paramValue) };
	}
};
//#endregion
//#region src/experimental/runtime.ts
/**
* Helper to define page properties with file-based routing.
* **Doesn't do anything**, used for types only.
*
* The `FilePath` type parameter is injected by the `sfc-typed-router` Volar
* plugin so that `params.path` keys are restricted to the file's actual path
* params. When omitted, `params.path` falls back to a loose record.
*
* @param route - route information to be added to this page
*
* @internal
*/
function definePage(route) {
	return route;
}
/**
* Merges route records.
*
* @internal
*
* @param main - main route record
* @param routeRecords - route records to merge
* @returns merged route record
*/
function _mergeRouteRecord(main, ...routeRecords) {
	return routeRecords.reduce((acc, routeRecord) => {
		const meta = Object.assign({}, acc.meta, routeRecord.meta);
		const alias = [].concat(acc.alias || [], routeRecord.alias || []);
		Object.assign(acc, routeRecord);
		acc.meta = meta;
		acc.alias = alias;
		return acc;
	}, main);
}
/**
* TODO: native parsers ideas:
* - json -> just JSON.parse(value)
* - boolean -> 'true' | 'false' -> boolean
* - number -> Number(value) -> NaN if not a number
*/
//#endregion
//#region src/experimental/data-loaders/defineLoader.ts
function defineBasicLoader(nameOrLoader, _loaderOrOptions, opts) {
	const loader = typeof nameOrLoader === "function" ? nameOrLoader : _loaderOrOptions;
	opts = typeof _loaderOrOptions === "object" ? _loaderOrOptions : opts;
	const options = {
		...DEFAULT_DEFINE_LOADER_OPTIONS,
		...opts,
		commit: opts?.commit || DEFAULT_DEFINE_LOADER_OPTIONS.commit
	};
	function load(to, router, from, parent) {
		const entries = router[LOADER_ENTRIES_KEY];
		const isSSR = router[IS_SSR_KEY];
		if (!entries.has(loader)) entries.set(loader, {
			data: shallowRef(),
			isLoading: shallowRef(false),
			error: shallowRef(null),
			to,
			options,
			children: /* @__PURE__ */ new Set(),
			resetPending() {
				this.pendingLoad = null;
				this.pendingTo = null;
			},
			pendingLoad: null,
			pendingTo: null,
			staged: STAGED_NO_VALUE,
			stagedError: null,
			commit
		});
		const entry = entries.get(loader);
		if (entry.pendingTo === to && entry.pendingLoad) return entry.pendingLoad;
		const { error, isLoading, data } = entry;
		const initialRootData = router[INITIAL_DATA_KEY];
		const key = options.key || "";
		let initialData = STAGED_NO_VALUE;
		if (initialRootData && key in initialRootData) {
			initialData = initialRootData[key];
			delete initialRootData[key];
		}
		if (initialData !== STAGED_NO_VALUE) {
			data.value = initialData;
			return entry.pendingLoad = Promise.resolve();
		}
		entry.pendingTo = to;
		isLoading.value = true;
		const currentContext = getCurrentContext();
		if (process.env.NODE_ENV !== "production") {
			if (parent !== currentContext[0]) diagnostics.VUE_ROUTER_R1001({ key: options.key });
		}
		setCurrentContext([
			entry,
			router,
			to
		]);
		entry.staged = STAGED_NO_VALUE;
		entry.stagedError = error.value;
		const currentLoad = Promise.resolve(loader(to, { signal: to.meta[ABORT_CONTROLLER_KEY]?.signal })).then((d) => {
			if (entry.pendingLoad === currentLoad) {
				if (d instanceof NavigationResult$1) {
					if (process.env.NODE_ENV !== "production") {
						diagnostics.VUE_ROUTER_R1002();
						warnNonExposedLoader({
							to,
							options,
							useDataLoader
						});
					}
					entry.pendingTo = null;
					throw d;
				} else {
					entry.staged = d;
					entry.stagedError = null;
				}
			}
		}).catch((error) => {
			if (entry.pendingLoad === currentLoad) {
				if (error instanceof NavigationResult$1) {
					if (process.env.NODE_ENV !== "production") warnNonExposedLoader({
						to,
						options,
						useDataLoader
					});
					entry.pendingTo = null;
					throw error;
				}
				entry.stagedError = error;
				if (!toLazyValue(options.lazy, to, from) || isSSR) throw error;
			}
		}).finally(() => {
			setCurrentContext(currentContext);
			if (entry.pendingLoad === currentLoad) {
				isLoading.value = false;
				if (options.commit === "immediate" || !router[PENDING_LOCATION_KEY]) entry.commit(to);
			}
		});
		setCurrentContext(currentContext);
		entry.pendingLoad = currentLoad;
		return currentLoad;
	}
	function commit(to) {
		if (this.pendingTo === to) {
			if (process.env.NODE_ENV !== "production") {
				if (this.staged === STAGED_NO_VALUE && this.stagedError === null) diagnostics.VUE_ROUTER_R1003({ key: options.key });
			}
			if (this.staged !== STAGED_NO_VALUE) this.data.value = this.staged;
			this.error.value = this.stagedError;
			this.staged = STAGED_NO_VALUE;
			this.stagedError = this.error.value;
			this.pendingTo = null;
			this.to = to;
			for (const childEntry of this.children) childEntry.commit(to);
		}
	}
	const useDataLoader = () => {
		const currentContext = getCurrentContext();
		const [parentEntry, _router, _route] = currentContext;
		const router = _router || useRouter();
		const route = _route || useRoute();
		const entries = router[LOADER_ENTRIES_KEY];
		let entry = entries.get(loader);
		if (!entry || parentEntry && entry.pendingTo !== route || !entry.pendingLoad) router[APP_KEY].runWithContext(() => load(route, router, void 0, parentEntry));
		entry = entries.get(loader);
		if (parentEntry) {
			if (process.env.NODE_ENV !== "production" && parentEntry === entry) diagnostics.VUE_ROUTER_R1005({ key: options.key });
			parentEntry.children.add(entry);
		}
		const { data, error, isLoading } = entry;
		const useDataLoaderResult = {
			data,
			error,
			isLoading,
			reload: (to = router.currentRoute.value) => router[APP_KEY].runWithContext(() => load(to, router)).then(() => entry.commit(to))
		};
		const promise = entry.pendingLoad.then(() => entry.staged === STAGED_NO_VALUE ? data.value : entry.staged).catch((e) => parentEntry ? Promise.reject(e) : null).finally(() => setCurrentContext(currentContext));
		setCurrentContext(currentContext);
		return Object.assign(promise, useDataLoaderResult);
	};
	useDataLoader[IS_USE_DATA_LOADER_KEY] = true;
	useDataLoader._ = {
		load,
		options,
		getEntry(router) {
			return router[LOADER_ENTRIES_KEY].get(loader);
		}
	};
	return useDataLoader;
}
/**
* Dev only warning for loaders that return/throw NavigationResult but are not exposed
*
* @param to - target location
* @param options - options used to define the loader
* @param useDataLoader - the data loader composable
*/
function warnNonExposedLoader({ to, options, useDataLoader }) {
	const loaders = to.meta[LOADER_SET_KEY];
	if (loaders && !loaders.has(useDataLoader)) diagnostics.VUE_ROUTER_R1004({ key: options.key ? ` (loader key: "${options.key}")` : "" });
}
const DEFAULT_DEFINE_LOADER_OPTIONS = {
	lazy: false,
	server: true,
	commit: "after-load"
};
/**
* Initial data generated on server and consumed on client.
* @internal
*/
const INITIAL_DATA_KEY = Symbol();
//#endregion
//#region src/experimental/index.ts
/**
* @deprecated Use {@link reroute} instead.
*/
var NavigationResult = class extends NavigationResult$1 {
	constructor(...args) {
		super(...args);
		console.warn(`[vue-router]: new NavigationResult(to) is deprecated. Use reroute(to) instead.`);
	}
};
//#endregion
export { DataLoaderPlugin, MatcherPatternHashParam, MatcherPatternPathDynamic, MatcherPatternPathStatic, MatcherPatternQueryParam, NavigationResult, PARAM_PARSER_BOOL, PARAM_PARSER_INT, SCROLL_RESTORATION_CAPTURE_DEFAULT, SCROLL_RESTORATION_RESTORE_DEFAULT, ScrollRestoration, MatchMiss as _MatchMiss, NavigationResult$1 as _NavigationResult, _mergeRouteRecord, normalizeParamParser as _normalizeParamParser, createFixedResolver, defineBasicLoader, defineHashParamParser, definePage, defineParamParser, defineParamParserRaw, experimental_createRouter, getCurrentContext, miss, normalizeRouteRecord, onRouteRendered, reroute, setCurrentContext, toLazyValue, trackRoute, useIsDataLoading, useScrollRestoration, withLoaderContext };
