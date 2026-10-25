import { a as decodeEntities, i as createTextCodepoints, l as toCodepointSet, n as isCompactPlan, o as normalizeFontFamily, r as addTextCodepoints, t as ATTR_ACTIONS, u as unicodeRangeUsed } from "./plan-BCGCztjP.mjs";
//#region src/media.ts
/**
* Conservative allowlist for re-emitting a `media` attribute value into
* generated JavaScript. `validateMediaQuery()` parses the query but tolerates
* quotes and semicolons, which would break out of the `onload` handler that the
* `media` and `js*` strategies build.
*
* @see https://github.com/angular/angular-cli/issues/33342
*/
const SAFE_MEDIA_RE = /^[\w\s\-(),:.]+$/;
function isSafeMediaValue(media) {
	return SAFE_MEDIA_RE.test(media);
}
//#endregion
//#region src/plan-decode.ts
function decodePlan(plan) {
	const [, href, size, pool, wraps, rules] = plan;
	const deref = (value) => typeof value === "number" ? pool[value - 1] : value;
	const derefAll = (values) => values.map(deref);
	const wrapChains = wraps.map(derefAll);
	return {
		href: href === 0 ? void 0 : href,
		size,
		warnings: [],
		rules: rules.map((rule) => decodeRule(rule, deref, derefAll, wrapChains))
	};
}
function decodeRule(compact, deref, derefAll, wrapChains) {
	const flags = compact[0];
	let cursor = 1;
	const next = () => compact[cursor++];
	const rule = {};
	if (flags & 1) {
		const selectors = next();
		rule.selectors = Array.isArray(selectors) ? derefAll(selectors) : [deref(selectors)];
		rule.body = deref(next());
	}
	if (flags & 2) rule.css = deref(next());
	if (flags & 4) rule.match = next().map((condition, index) => decodeMatch(condition, rule.selectors?.[index], deref, derefAll));
	if (flags & 8) rule.always = true;
	if (flags & 16) rule.wrap = wrapChains[next()];
	if (flags & 32) rule.fontsUsed = derefAll(next());
	if (flags & 64) rule.keyframesUsed = derefAll(next());
	if (flags & 128) {
		const [family, src, ranges] = next();
		rule.fontFace = {
			family: family === 0 ? void 0 : deref(family),
			src: src === 0 ? void 0 : deref(src),
			ranges
		};
	}
	if (flags & 256) rule.keyframes = deref(next());
	return rule;
}
function decodeMatch(compact, selector, deref, derefAll) {
	if (compact === 0) return true;
	if (compact === 1) return { classes: [selector.slice(1)] };
	if (compact === 2) return { ids: [selector.slice(1)] };
	if (compact === 3) return { tags: [selector.toLowerCase()] };
	if (typeof compact[0] === "string") return { program: decodeProgram(compact, deref, derefAll) };
	const [classes, ids, tags, attrs] = compact;
	const condition = {};
	if (classes !== 0) condition.classes = derefAll(classes);
	if (ids !== 0) condition.ids = derefAll(ids);
	if (tags !== 0) condition.tags = derefAll(tags);
	if (attrs !== 0) condition.attrs = derefAll(attrs);
	return condition;
}
function decodeProgram(compact, deref, derefAll) {
	const [combinators, compounds] = compact;
	return {
		combinators: [...combinators],
		compounds: compounds.map((compound) => decodeCompound(compound, deref, derefAll))
	};
}
function decodeCompound(compact, deref, derefAll) {
	if (!Array.isArray(compact)) return { classes: [deref(compact)] };
	const [tag, classes, ids, attrs] = compact;
	const compound = {};
	if (tag !== 0) compound.tag = deref(tag);
	if (classes !== 0) compound.classes = derefAll(classes);
	if (ids !== 0) compound.ids = derefAll(ids);
	if (attrs !== 0) compound.attrs = attrs.map(([name, action, value, ignoreCase]) => {
		const test = {
			name: deref(name),
			action: ATTR_ACTIONS[action]
		};
		if (value !== 0) test.value = deref(value);
		if (ignoreCase) test.ignoreCase = true;
		return test;
	});
	return compound;
}
//#endregion
//#region src/runtime.ts
const VOID_ELEMENTS = /* @__PURE__ */ new Set([
	"area",
	"base",
	"br",
	"col",
	"embed",
	"hr",
	"img",
	"input",
	"link",
	"meta",
	"param",
	"source",
	"track",
	"wbr"
]);
const RAW_TEXT_ELEMENTS = /* @__PURE__ */ new Set([
	"script",
	"style",
	"textarea",
	"title",
	"xmp"
]);
/** Raw text elements whose contents are still rendered as page text */
const RENDERED_RAW_TEXT_ELEMENTS = /* @__PURE__ */ new Set(["textarea", "xmp"]);
/** Attributes whose value can be rendered as text */
const RENDERED_ATTRS = /* @__PURE__ */ new Set([
	"alt",
	"label",
	"placeholder",
	"title",
	"value"
]);
const TAG_START_RE = /[a-z]/;
const TAG_NAME_END_RE = /[\s/>]/;
const ATTR_NAME_END_RE = /[\s=/>]/;
const WHITESPACE_RE = /\s/;
const CLASS_SPLIT_RE = /\s+/;
function createTokens() {
	return {
		tags: /* @__PURE__ */ new Set(),
		classes: /* @__PURE__ */ new Set(),
		ids: /* @__PURE__ */ new Set(),
		attrs: /* @__PURE__ */ new Set()
	};
}
function preparePrograms(programs) {
	const prepared = {
		programs,
		flat: [],
		byClass: /* @__PURE__ */ new Map(),
		byId: /* @__PURE__ */ new Map(),
		byTag: /* @__PURE__ */ new Map(),
		byAttr: /* @__PURE__ */ new Map(),
		universal: []
	};
	for (let p = 0; p < programs.length; p++) {
		const { compounds, combinators } = programs[p];
		const start = prepared.flat.length;
		for (let c = 0; c < compounds.length; c++) prepared.flat.push({
			test: compounds[c],
			edge: combinators[c] ?? null,
			last: c === compounds.length - 1,
			program: p
		});
		const first = compounds[0];
		if (first.classes?.length) pushIndex(prepared.byClass, first.classes[0], start);
		else if (first.ids?.length) pushIndex(prepared.byId, first.ids[0], start);
		else if (first.tag) pushIndex(prepared.byTag, first.tag, start);
		else if (first.attrs?.length) pushIndex(prepared.byAttr, first.attrs[0].name, start);
		else prepared.universal.push(start);
	}
	return prepared;
}
function pushIndex(map, key, position) {
	const list = map.get(key);
	if (list) list.push(position);
	else map.set(key, [position]);
}
function getAttrValue(element, name) {
	for (const [attrName, value] of element.attrs) if (attrName === name) return value ?? "";
}
function matchesAttr(test, element) {
	let value = getAttrValue(element, test.name);
	if (value === void 0) return false;
	if (test.action === "exists") return true;
	let expected = test.value ?? "";
	if (test.ignoreCase) {
		value = value.toLowerCase();
		expected = expected.toLowerCase();
	}
	switch (test.action) {
		case "equals": return value === expected;
		case "element": return expected.length > 0 && value.split(CLASS_SPLIT_RE).includes(expected);
		case "start": return expected.length > 0 && value.startsWith(expected);
		case "end": return expected.length > 0 && value.endsWith(expected);
		case "any": return expected.length > 0 && value.includes(expected);
		case "hyphen": return value === expected || value.startsWith(`${expected}-`);
	}
	return false;
}
function matchesCompound(test, element) {
	if (test.tag && test.tag !== element.tag) return false;
	if (test.ids) {
		for (const id of test.ids) if (element.id !== id) return false;
	}
	if (test.classes) {
		for (const cls of test.classes) if (!element.classes.includes(cls)) return false;
	}
	if (test.attrs) {
		for (const attr of test.attrs) if (!matchesAttr(attr, element)) return false;
	}
	return true;
}
function createFrame(container, descLength, child) {
	return {
		container,
		descLength,
		child,
		adjacent: [],
		sibling: null
	};
}
function scanHtml(html, programs, options = {}) {
	const collectText = options.chars !== false;
	const lower = html.toLowerCase();
	const all = createTokens();
	const contained = createTokens();
	const text = createTextCodepoints();
	const collectChars = collectText ? (run) => addTextCodepoints(run, text) : () => {};
	const prepared = programs && programs.length > 0 ? preparePrograms(programs) : void 0;
	const matchedAll = prepared ? Array.from({ length: prepared.programs.length }).fill(false) : [];
	const matchedContained = prepared ? Array.from({ length: prepared.programs.length }).fill(false) : [];
	const candidateSet = /* @__PURE__ */ new Set();
	const descStack = [];
	const descMembers = new Uint8Array(prepared ? prepared.flat.length * 2 : 0);
	let containerFound = false;
	const frames = [createFrame(false, 0, [])];
	let i = 0;
	const length = html.length;
	while (i < length) {
		const textStart = i;
		i = lower.indexOf("<", i);
		if (i === -1) {
			collectChars(html.slice(textStart));
			break;
		}
		if (i > textStart) collectChars(html.slice(textStart, i));
		const next = lower[i + 1];
		if (next === "/") {
			const end = lower.indexOf(">", i);
			if (end === -1) break;
			if (frames.length > 1) {
				frames.pop();
				const { descLength } = frames[frames.length - 1];
				while (descStack.length > descLength) descMembers[descStack.pop()] = 0;
			}
			i = end + 1;
			continue;
		}
		if (next === "!") {
			if (lower.startsWith("<!--", i)) {
				const end = lower.indexOf("-->", i + 4);
				i = end === -1 ? length : end + 3;
			} else {
				const end = lower.indexOf(">", i);
				i = end === -1 ? length : end + 1;
			}
			continue;
		}
		if (next === "?") {
			const end = lower.indexOf(">", i);
			i = end === -1 ? length : end + 1;
			continue;
		}
		if (!next || !TAG_START_RE.test(next)) {
			i++;
			continue;
		}
		let pos = i + 1;
		while (pos < length && !TAG_NAME_END_RE.test(lower[pos])) pos++;
		const tagName = lower.slice(i + 1, pos);
		const element = {
			tag: tagName,
			id: null,
			classes: [],
			attrs: []
		};
		let isContainer = false;
		let selfClosing = false;
		while (pos < length) {
			while (pos < length && WHITESPACE_RE.test(lower[pos])) pos++;
			if (lower[pos] === "/") {
				selfClosing = true;
				pos++;
				continue;
			}
			if (lower[pos] === ">" || pos >= length) break;
			selfClosing = false;
			const nameStart = pos;
			while (pos < length && !ATTR_NAME_END_RE.test(lower[pos])) pos++;
			const attrName = lower.slice(nameStart, pos);
			let value = null;
			while (pos < length && WHITESPACE_RE.test(lower[pos])) pos++;
			if (lower[pos] === "=") {
				pos++;
				while (pos < length && WHITESPACE_RE.test(lower[pos])) pos++;
				const quote = lower[pos];
				if (quote === "\"" || quote === "'") {
					const valueEnd = lower.indexOf(quote, pos + 1);
					value = html.slice(pos + 1, valueEnd === -1 ? length : valueEnd);
					pos = valueEnd === -1 ? length : valueEnd + 1;
				} else {
					const valueStart = pos;
					while (pos < length && !WHITESPACE_RE.test(lower[pos]) && lower[pos] !== ">") pos++;
					value = html.slice(valueStart, pos);
				}
			}
			if (attrName) {
				if (value !== null && RENDERED_ATTRS.has(attrName)) collectChars(value);
				value &&= decodeEntities(value);
				element.attrs.push([attrName, value]);
				if (attrName === "data-beasties-container") {
					isContainer = true;
					containerFound = true;
				} else if (attrName === "class" && value !== null) {
					for (const cls of value.trim().split(CLASS_SPLIT_RE)) if (cls) element.classes.push(cls);
				} else if (attrName === "id" && value !== null) element.id = value.trim() || null;
			}
		}
		const frame = frames[frames.length - 1];
		const insideContainer = frame.container || isContainer;
		collectElement(all, element);
		if (insideContainer) collectElement(contained, element);
		let descOut;
		let childOut;
		if (prepared) {
			const strictlyInside = frame.container;
			candidateSet.clear();
			for (let k = 0; k < frame.descLength; k++) candidateSet.add(descStack[k]);
			for (const list of [frame.child, frame.adjacent]) for (const encoded of list) candidateSet.add(encoded);
			if (frame.sibling) for (const encoded of frame.sibling) candidateSet.add(encoded);
			addAnchoredStarts(candidateSet, prepared, element);
			const adjacentOut = [];
			frame.adjacent = adjacentOut;
			let siblingOut;
			for (const encoded of candidateSet) {
				const position = encoded >> 1;
				const compound = prepared.flat[position];
				if (!matchesCompound(compound.test, element)) continue;
				const chainContained = (encoded & 1) === 1 && strictlyInside;
				if (compound.last) {
					matchedAll[compound.program] = true;
					if (chainContained) matchedContained[compound.program] = true;
					continue;
				}
				const nextEncoded = position + 1 << 1 | (chainContained ? 1 : 0);
				switch (compound.edge) {
					case " ":
						(descOut ??= []).push(nextEncoded);
						break;
					case ">":
						(childOut ??= []).push(nextEncoded);
						break;
					case "+":
						adjacentOut.push(nextEncoded);
						break;
					case "~": (siblingOut ??= []).push(nextEncoded);
				}
			}
			if (siblingOut) {
				if (!frame.sibling) frame.sibling = siblingOut;
				else {
					if (Array.isArray(frame.sibling)) frame.sibling = new Set(frame.sibling);
					for (const encoded of siblingOut) frame.sibling.add(encoded);
				}
			}
		} else frame.adjacent = [];
		const isVoid = VOID_ELEMENTS.has(tagName) || selfClosing;
		const isRawText = RAW_TEXT_ELEMENTS.has(tagName);
		if (!isVoid && !isRawText) {
			if (descOut) {
				for (const encoded of descOut) if (!descMembers[encoded]) {
					descMembers[encoded] = 1;
					descStack.push(encoded);
				}
			}
			frames.push(createFrame(insideContainer, descStack.length, childOut ?? []));
		}
		i = lower[pos] === ">" ? pos + 1 : pos;
		if (!isVoid && isRawText) {
			const close = lower.indexOf(`</${tagName}`, i);
			if (close === -1) break;
			if (RENDERED_RAW_TEXT_ELEMENTS.has(tagName)) collectChars(html.slice(i, close));
			const end = lower.indexOf(">", close);
			i = end === -1 ? length : end + 1;
		}
	}
	const tokens = containerFound ? contained : all;
	if (collectText) tokens.chars = toCodepointSet(text);
	if (prepared) {
		const matched = containerFound ? matchedContained : matchedAll;
		tokens.matchedPrograms = /* @__PURE__ */ new Map();
		for (let p = 0; p < prepared.programs.length; p++) tokens.matchedPrograms.set(prepared.programs[p], matched[p]);
	}
	return tokens;
}
function collectElement(tokens, element) {
	tokens.tags.add(element.tag);
	if (element.id) tokens.ids.add(element.id);
	for (const cls of element.classes) tokens.classes.add(cls);
	for (const [name] of element.attrs) tokens.attrs.add(name);
}
function addAnchoredStarts(candidates, prepared, element) {
	for (const cls of element.classes) {
		const starts = prepared.byClass.get(cls);
		if (starts) for (const position of starts) candidates.add(position << 1 | 1);
	}
	if (element.id) {
		const starts = prepared.byId.get(element.id);
		if (starts) for (const position of starts) candidates.add(position << 1 | 1);
	}
	const tagStarts = prepared.byTag.get(element.tag);
	if (tagStarts) for (const position of tagStarts) candidates.add(position << 1 | 1);
	for (const [name] of element.attrs) {
		const starts = prepared.byAttr.get(name);
		if (starts) for (const position of starts) candidates.add(position << 1 | 1);
	}
	for (const position of prepared.universal) candidates.add(position << 1 | 1);
}
function matchesCondition(condition, tokens) {
	if (condition === true) return true;
	if (condition.program) {
		const exact = tokens.matchedPrograms?.get(condition.program);
		if (exact !== void 0) return exact;
	}
	if (condition.classes) {
		for (const cls of condition.classes) if (!tokens.classes.has(cls)) return false;
	}
	if (condition.ids) {
		for (const id of condition.ids) if (!tokens.ids.has(id)) return false;
	}
	if (condition.tags) {
		for (const tag of condition.tags) if (!tokens.tags.has(tag)) return false;
	}
	if (condition.attrs) {
		for (const attr of condition.attrs) if (!tokens.attrs.has(attr)) return false;
	}
	return true;
}
/** Collect structural programs referenced by the compiled sheets */
function collectPrograms(sheets) {
	const programs = [];
	for (const sheet of sheets) for (const rule of sheet.rules) {
		if (!rule.match) continue;
		for (const condition of rule.match) if (condition !== true && condition.program) programs.push(condition.program);
	}
	return programs;
}
/**
* Evaluate a compiled sheet against scanned document tokens, producing the
* critical CSS subset.
*/
function renderCriticalCss(sheet, tokens, options = {}) {
	let keyframesMode = options.keyframes ?? "critical";
	if (keyframesMode === true) keyframesMode = "all";
	if (keyframesMode === false) keyframesMode = "none";
	const shouldPreloadFonts = options.fonts === true || options.preloadFonts === true;
	const shouldInlineFonts = options.fonts !== false && options.inlineFonts === true;
	const rules = sheet.rules;
	const texts = Array.from({ length: rules.length }).fill(null);
	const inverseTexts = options.inverse ? Array.from({ length: rules.length }).fill(null) : void 0;
	const criticalFonts = /* @__PURE__ */ new Set();
	const criticalKeyframeNames = /* @__PURE__ */ new Set();
	const fontPreloads = [];
	const preloadedFonts = /* @__PURE__ */ new Set();
	for (let i = 0; i < rules.length; i++) {
		const rule = rules[i];
		if (rule.fontFace) continue;
		if (rule.keyframes !== void 0) continue;
		const text = ruleText(rule, tokens);
		if (inverseTexts) inverseTexts[i] = ruleText(rule, tokens, true);
		if (text === null) continue;
		texts[i] = text;
		if (rule.fontsUsed) for (const family of rule.fontsUsed) criticalFonts.add(normalizeFontFamily(family));
		if (rule.keyframesUsed) for (const name of rule.keyframesUsed) criticalKeyframeNames.add(name);
	}
	for (let i = 0; i < rules.length; i++) {
		const rule = rules[i];
		if (rule.keyframes !== void 0) {
			if (keyframesMode !== "none" && (keyframesMode === "all" || criticalKeyframeNames.has(rule.keyframes))) texts[i] = rule.css ?? "";
			else if (inverseTexts) inverseTexts[i] = rule.css ?? "";
			continue;
		}
		if (rule.fontFace) {
			const { family, src, ranges } = rule.fontFace;
			const used = !!family && criticalFonts.has(normalizeFontFamily(family)) && unicodeRangeUsed(ranges, tokens.chars);
			if (used && src && shouldPreloadFonts && !preloadedFonts.has(src)) {
				preloadedFonts.add(src);
				fontPreloads.push(src.trim());
			}
			if (shouldInlineFonts && used) texts[i] = rule.css ?? "";
			else if (inverseTexts) inverseTexts[i] = rule.css ?? "";
		}
	}
	const result = {
		css: assemble(texts, rules),
		fontPreloads
	};
	if (inverseTexts) result.inverseCss = assemble(inverseTexts, rules);
	return result;
}
/** Emit every rule in the sheet, as when a stylesheet is inlined in full */
function renderFullCss(sheet) {
	return assemble(sheet.rules.map(wholeRuleText), sheet.rules);
}
function wholeRuleText(rule) {
	if (rule.css !== void 0) return rule.css;
	return rule.selectors ? rule.selectors.join(",") + rule.body : "";
}
/** Join rule texts, opening and closing at-rule wrappers as needed */
function assemble(texts, rules) {
	const out = [];
	let openWrap = [];
	for (let i = 0; i < texts.length; i++) {
		const text = texts[i];
		if (text == null) continue;
		const wrap = rules[i].wrap ?? [];
		let common = 0;
		while (common < openWrap.length && common < wrap.length && openWrap[common] === wrap[common]) common++;
		for (let j = openWrap.length; j > common; j--) out.push("}");
		for (let j = common; j < wrap.length; j++) out.push(wrap[j]);
		openWrap = wrap;
		out.push(text);
	}
	for (let j = openWrap.length; j > 0; j--) out.push("}");
	return out.join("");
}
/**
* The rule's text as inlined, or `null` when it isn't. With `invert`, returns
* the complement instead: what the external stylesheet still has to provide.
*/
function ruleText(rule, tokens, invert = false) {
	if (rule.always) return invert ? null : wholeRuleText(rule);
	if (!rule.match) return invert ? null : rule.css ?? null;
	const body = rule.body;
	if (rule.selectors && body !== void 0) {
		const kept = rule.selectors.filter((_, index) => matchesCondition(rule.match[index], tokens) !== invert);
		if (kept.length === 0) return null;
		return kept.join(",") + body;
	}
	if (rule.match.some((condition) => matchesCondition(condition, tokens)) !== invert) return rule.css ?? "";
	return null;
}
const DEFAULT_CACHE_SIZE = 100;
/**
* Fingerprint the scanned tokens. Token sets iterate in insertion order,
* which is deterministic for a given document shape; a differently-ordered
* but equal set only costs a cache miss, never a wrong hit.
*/
function fingerprintTokens(tokens) {
	const parts = [];
	for (const set of [
		tokens.tags,
		tokens.classes,
		tokens.ids,
		tokens.attrs
	]) {
		for (const token of set) parts.push(token);
		parts.push("\n");
	}
	if (tokens.chars) parts.push(Array.from(tokens.chars).join(","));
	parts.push("\n");
	if (tokens.matchedPrograms) for (const matched of tokens.matchedPrograms.values()) parts.push(matched ? "1" : "0");
	return parts.join(" ");
}
const CSS_HREF_RE = /\.css(?:[?#]|$)/i;
const LINK_TAG_RE = /<link\b(?:[^>"']|"[^"]*"|'[^']*')*>/gi;
const REL_STYLESHEET_RE = /\brel\s*=\s*(?:"stylesheet"|'stylesheet'|stylesheet(?=[\s>]))/i;
const REL_PRELOAD_RE = /\brel\s*=\s*(?:"preload"|'preload'|preload(?=[\s>]))/i;
const AS_FONT_RE = /\bas\s*=\s*(?:"font"|'font'|font(?=[\s>]))/i;
const CSS_LOADER_PREAMBLE = "function $loadcss(u,m,l){(l=document.createElement('link')).rel='stylesheet';l.href=u;document.head.appendChild(l)}";
const CSS_LOADER_LAZY_PREAMBLE = CSS_LOADER_PREAMBLE.replace("l.href", "l.media='print';l.onload=function(){l.media=m};l.href");
const CSS_LOADER_INVOKE = "$loadcss(document.currentScript.dataset.href,document.currentScript.dataset.media)";
const DEFERRED_MEDIA_ATTR = "data-beasties-media";
const DEFERRED_MEDIA_SCRIPT = `document.querySelectorAll('link[${DEFERRED_MEDIA_ATTR}]').forEach(function(l){l.media=l.getAttribute('${DEFERRED_MEDIA_ATTR}');l.removeAttribute('${DEFERRED_MEDIA_ATTR}')})`;
function attrValueRegex(name) {
	return new RegExp(`(^|\\s)(${name})\\s*=\\s*("[^"]*"|'[^']*'|[^\\s>]+)`, "i");
}
function attrNameRegex(name) {
	return new RegExp(`(^|\\s)${name}(?=[\\s/>=])`, "i");
}
function escapeAttr(value) {
	return value.replace(/"/g, "&quot;");
}
/** Get a (raw, un-decoded) attribute value from a tag string */
function getAttr(tag, name) {
	const match = tag.match(attrValueRegex(name));
	if (match) {
		const raw = match[3];
		if (raw[0] === "\"" || raw[0] === "'") return raw.slice(1, -1);
		return raw;
	}
	return attrNameRegex(name).test(tag) ? "" : null;
}
/** Set an attribute in a tag string, replacing in place or appending before `>` */
function setAttr(tag, name, value) {
	const valueRe = attrValueRegex(name);
	if (valueRe.test(tag)) return tag.replace(valueRe, `$1$2="${escapeAttr(value)}"`);
	const nameRe = attrNameRegex(name);
	if (nameRe.test(tag)) return tag.replace(nameRe, `$1${name}="${escapeAttr(value)}"`);
	if (!tag.endsWith(">")) return tag;
	let cut = tag.length - 1;
	if (tag[cut - 1] === "/") cut--;
	while (cut > 0 && WHITESPACE_RE.test(tag[cut - 1])) cut--;
	return `${tag.slice(0, cut)} ${name}="${escapeAttr(value)}"${tag.slice(cut)}`;
}
/** Remove an attribute from a tag string */
function removeAttr(tag, name) {
	return tag.replace(attrValueRegex(name), "").replace(attrNameRegex(name), "");
}
function toPreload(tag) {
	return setAttr(setAttr(tag, "rel", "preload"), "as", "style");
}
function normalizeHref(href) {
	const query = href.indexOf("?");
	const hash = href.indexOf("#");
	let end = href.length;
	if (query !== -1) end = query;
	if (hash !== -1 && hash < end) end = hash;
	let start = 0;
	if (href[0] === "." && href[1] === "/") start = 2;
	else if (href[0] === "/") start = 1;
	return href.slice(start, end);
}
function sheetForHref(sheets, href) {
	const normalized = normalizeHref(href);
	return sheets.find((sheet) => {
		if (!sheet.href) return false;
		const sheetHref = normalizeHref(sheet.href);
		return normalized === sheetHref || normalized.endsWith(`/${sheetHref}`);
	});
}
function applyEdits(html, edits) {
	edits.sort((a, b) => a.start - b.start || a.end - b.end);
	let out = "";
	let cursor = 0;
	for (const edit of edits) {
		if (edit.start < cursor) continue;
		out += html.slice(cursor, edit.start) + edit.text;
		cursor = edit.end;
	}
	return out + html.slice(cursor);
}
function createProcessor(plans, options = {}) {
	const sheets = plans.map((plan) => isCompactPlan(plan) ? decodePlan(plan) : plan);
	const programs = collectPrograms(sheets);
	const scanOptions = { chars: sheets.some((sheet) => sheet.rules.some((rule) => rule.fontFace?.ranges)) };
	const cacheSize = options.cache === false ? 0 : typeof options.cache === "object" ? options.cache.maxSize ?? DEFAULT_CACHE_SIZE : DEFAULT_CACHE_SIZE;
	const cache = cacheSize > 0 ? /* @__PURE__ */ new Map() : void 0;
	const renderOptions = {
		...options,
		inverse: !!options.minimumExternalSize
	};
	const fullCssCache = /* @__PURE__ */ new Map();
	function fullCss(sheet) {
		let css = fullCssCache.get(sheet);
		if (css === void 0) {
			css = renderFullCss(sheet);
			fullCssCache.set(sheet, css);
		}
		return css;
	}
	/**
	* Whether the whole stylesheet should be inlined, making its `<link>`
	* unnecessary: either it is small enough outright, or what would be left for
	* it to serve is small enough that the request isn't worth saving.
	*/
	function inlineInFull(sheet, critical) {
		if (options.inlineThreshold && sheet.size < options.inlineThreshold) return true;
		if (options.minimumExternalSize && critical.inverseCss !== void 0) return critical.inverseCss.length < options.minimumExternalSize;
		return false;
	}
	function renderSheet(sheet, tokens, key) {
		if (!cache || key === void 0) return renderCriticalCss(sheet, tokens, renderOptions);
		let bySheet = cache.get(key);
		if (bySheet) {
			cache.delete(key);
			cache.set(key, bySheet);
		} else {
			bySheet = /* @__PURE__ */ new Map();
			cache.set(key, bySheet);
			if (cache.size > cacheSize) cache.delete(cache.keys().next().value);
		}
		let result = bySheet.get(sheet);
		if (!result) {
			result = renderCriticalCss(sheet, tokens, renderOptions);
			bySheet.set(sheet, result);
		}
		return result;
	}
	function skippedSheets(html) {
		let skipped;
		for (const match of html.matchAll(LINK_TAG_RE)) {
			const tag = match[0];
			if (!REL_STYLESHEET_RE.test(tag) || getAttr(tag, "data-beasties-skip") === null) continue;
			const href = getAttr(tag, "href");
			const sheet = href ? sheetForHref(sheets, href) : void 0;
			if (sheet) (skipped ??= /* @__PURE__ */ new Set()).add(sheet);
		}
		return skipped;
	}
	function extract(html) {
		const tokens = scanHtml(html, programs, scanOptions);
		const key = cache ? fingerprintTokens(tokens) : void 0;
		const skipped = skippedSheets(html);
		const css = [];
		const fontPreloads = [];
		for (const sheet of sheets) {
			if (skipped?.has(sheet)) continue;
			const result = renderSheet(sheet, tokens, key);
			css.push(inlineInFull(sheet, result) ? fullCss(sheet) : result.css);
			fontPreloads.push(...result.fontPreloads);
		}
		return {
			css: css.join(""),
			fontPreloads
		};
	}
	function process(html, processOptions) {
		const tokens = scanHtml(html, programs, scanOptions);
		const key = cache ? fingerprintTokens(tokens) : void 0;
		const strategy = options.preload;
		const nonce = processOptions?.nonce ?? options.nonce;
		const nonceAttr = nonce ? ` nonce="${escapeAttr(nonce)}"` : "";
		let firstLinkIndex = -1;
		const edits = [];
		const bodyAppends = [];
		let deferredMedia = false;
		const criticalParts = [];
		const fontPreloads = /* @__PURE__ */ new Set();
		const existingFontPreloads = /* @__PURE__ */ new Set();
		let isFirstSheet = true;
		for (const match of html.matchAll(LINK_TAG_RE)) {
			const tag = match[0];
			if (!REL_STYLESHEET_RE.test(tag)) {
				if (REL_PRELOAD_RE.test(tag) && AS_FONT_RE.test(tag)) {
					const preloaded = getAttr(tag, "href");
					if (preloaded) existingFontPreloads.add(preloaded);
				}
				continue;
			}
			if (getAttr(tag, "data-beasties-skip") !== null) continue;
			const href = getAttr(tag, "href");
			if (!href) continue;
			const sheet = sheetForHref(sheets, href);
			if (!sheet) {
				if (CSS_HREF_RE.test(href)) options.logger?.warn?.(`Unable to locate stylesheet: ${href}`);
				continue;
			}
			const result = renderSheet(sheet, tokens, key);
			const wholeSheet = inlineInFull(sheet, result);
			criticalParts.push(wholeSheet ? fullCss(sheet) : result.css);
			for (const preload of result.fontPreloads) fontPreloads.add(preload);
			const start = match.index;
			const end = start + tag.length;
			if (firstLinkIndex === -1) firstLinkIndex = start;
			if (wholeSheet) {
				edits.push({
					start,
					end,
					text: ""
				});
				continue;
			}
			if (strategy === false) continue;
			const rawMedia = getAttr(tag, "media");
			const media = rawMedia && isSafeMediaValue(rawMedia) ? rawMedia : void 0;
			let newTag = tag;
			let noscriptFallback = false;
			let scriptAfter;
			if (strategy === "body") {
				bodyAppends.push(tag);
				newTag = "";
			} else if (strategy === "media-script") {
				newTag = setAttr(setAttr(tag, "media", "print"), DEFERRED_MEDIA_ATTR, media || "all");
				deferredMedia = true;
				noscriptFallback = true;
			} else if (strategy === "media") {
				newTag = setAttr(setAttr(tag, "media", "print"), "onload", `this.media='${media || "all"}'`);
				noscriptFallback = true;
			} else if (strategy === "swap") {
				newTag = toPreload(setAttr(tag, "onload", "this.rel='stylesheet'"));
				noscriptFallback = true;
			} else if (strategy === "swap-high") {
				newTag = setAttr(setAttr(setAttr(setAttr(tag, "rel", "alternate stylesheet preload"), "title", "styles"), "as", "style"), "onload", "this.title='';this.rel='stylesheet'");
				noscriptFallback = true;
			} else if (strategy === "swap-low") {
				newTag = setAttr(setAttr(setAttr(tag, "rel", "alternate stylesheet"), "title", "styles"), "onload", "this.title='';this.rel='stylesheet'");
				noscriptFallback = true;
			} else if (strategy === "js" || strategy === "js-lazy") {
				const preamble = isFirstSheet ? strategy === "js-lazy" ? CSS_LOADER_LAZY_PREAMBLE : CSS_LOADER_PREAMBLE : "";
				scriptAfter = `<script${nonceAttr} data-href="${escapeAttr(href)}" data-media="${escapeAttr(media || "all")}">${preamble}${CSS_LOADER_INVOKE}<\/script>`;
				newTag = toPreload(tag);
				noscriptFallback = true;
			} else {
				bodyAppends.push(removeAttr(tag, "id"));
				newTag = toPreload(tag);
			}
			if (options.noscriptFallback !== false && noscriptFallback && !href.includes("</noscript>")) edits.push({
				start: end,
				end,
				text: `<noscript>${removeAttr(tag, "id")}</noscript>`
			});
			if (scriptAfter) edits.push({
				start: end,
				end,
				text: scriptAfter
			});
			if (newTag !== tag) edits.push({
				start,
				end,
				text: newTag
			});
			isFirstSheet = false;
		}
		for (const preloaded of existingFontPreloads) fontPreloads.delete(preloaded);
		const critical = criticalParts.join("");
		if (!critical && fontPreloads.size === 0 && edits.length === 0 && bodyAppends.length === 0) return html;
		const headInsertions = [];
		for (const preload of fontPreloads) headInsertions.push(`<link rel="preload" as="font" crossorigin="anonymous" href="${escapeAttr(preload)}">`);
		if (critical) headInsertions.push(`<style${nonceAttr}>${critical}</style>`);
		if (deferredMedia) bodyAppends.push(`<script${nonceAttr}>${DEFERRED_MEDIA_SCRIPT}<\/script>`);
		if (headInsertions.length > 0) {
			let insertAt = firstLinkIndex;
			if (insertAt === -1) insertAt = html.match(/<\/head\s*>/i)?.index ?? 0;
			edits.push({
				start: insertAt,
				end: insertAt,
				text: headInsertions.join("")
			});
		}
		if (bodyAppends.length > 0) {
			const bodyClose = lastIndexOfRe(html, /<\/body\s*>/gi);
			const insertAt = bodyClose === -1 ? html.length : bodyClose;
			edits.push({
				start: insertAt,
				end: insertAt,
				text: bodyAppends.join("")
			});
		}
		return applyEdits(html, edits);
	}
	return {
		process,
		extract
	};
}
function lastIndexOfRe(html, re) {
	let last = -1;
	for (const match of html.matchAll(re)) last = match.index;
	return last;
}
//#endregion
export { collectPrograms, createProcessor, decodePlan, renderCriticalCss, renderFullCss, scanHtml };
