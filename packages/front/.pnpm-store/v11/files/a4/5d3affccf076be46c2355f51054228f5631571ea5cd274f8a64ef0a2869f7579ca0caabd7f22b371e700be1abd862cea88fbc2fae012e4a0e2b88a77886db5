import { c as parseUnicodeRanges, s as parseFontFamilies, t as ATTR_ACTIONS } from "./plan-BCGCztjP.mjs";
import { parse } from "css-what";
import { parse as parse$1, stringify } from "postcss";
import "postcss-media-query-parser";
import safeParser from "postcss-safe-parser";
import path from "node:path";
//#region src/css.ts
const ANIMATION_SPLIT_RE = /[\s,()]+/;
const CUSTOM_PROPERTY_RE = /^--/;
const customPropertiesCache = /* @__PURE__ */ new WeakMap();
/**
* Parse a textual CSS Stylesheet into a Stylesheet instance.
* Stylesheet is a mutable postcss AST with format similar to CSSOM.
* @see https://github.com/postcss/postcss/
* @private
*/
function parseStylesheet(stylesheet, options) {
	if (options?.safeParser) return safeParser(stylesheet);
	return parse$1(stylesheet);
}
/**
* Serialize a postcss Stylesheet to a String of CSS.
* @private
* @param ast A Stylesheet to serialize, such as one returned from `parseStylesheet()`
*/
function serializeStylesheet(ast, options) {
	const cssParts = [];
	stringify(ast, (result, node, type) => {
		if (node?.type === "decl" && node.value.includes("</style>")) return;
		if (!options.compress) {
			cssParts.push(result);
			return;
		}
		if (node?.type === "comment") return;
		if (node?.type === "decl") {
			const prefix = node.prop + node.raws.between;
			cssParts.push(result.replace(prefix, prefix.trim()));
			return;
		}
		if (type === "start") {
			if (node?.type === "rule" && node.selectors) {
				if (node.selectors.length === 1) cssParts.push(node.selectors[0] ?? "", "{");
				else cssParts.push(node.selectors.join(","), "{");
			} else cssParts.push(result.trim());
			return;
		}
		if (type === "end" && result === "}" && node?.raws?.semicolon && (node.type === "rule" || node.type === "atrule")) {
			const lastChild = node.nodes?.[node.nodes.length - 1];
			const lastItemIdx = cssParts.length - 2;
			if (lastChild?.type === "decl" && lastItemIdx >= 0 && cssParts[lastItemIdx]) cssParts[lastItemIdx] = cssParts[lastItemIdx].slice(0, -1);
		}
		cssParts.push(result.trim());
	});
	return cssParts.join("");
}
/**
* Split an `animation` or `animation-name` value into the names it may refer to,
* following `var()` references to the custom properties declared in `root`.
*/
function parseAnimationNames(value, root) {
	const names = new Set(value.split(ANIMATION_SPLIT_RE));
	for (const name of names) if (CUSTOM_PROPERTY_RE.test(name)) for (const part of customProperties(root).get(name) ?? []) names.add(part);
	return names;
}
function customProperties(root) {
	const cached = customPropertiesCache.get(root);
	if (cached) return cached;
	const properties = /* @__PURE__ */ new Map();
	root.walkDecls(CUSTOM_PROPERTY_RE, (decl) => {
		const parts = decl.value.split(ANIMATION_SPLIT_RE);
		const existing = properties.get(decl.prop);
		if (existing) existing.push(...parts);
		else properties.set(decl.prop, parts);
	});
	customPropertiesCache.set(root, properties);
	return properties;
}
new Set([
	"width",
	"aspect-ratio",
	"color",
	"color-index",
	"grid",
	"height",
	"monochrome",
	"orientation",
	"resolution",
	"scan"
].flatMap((feature) => [
	feature,
	`min-${feature}`,
	`max-${feature}`
]));
//#endregion
//#region src/directives.ts
const DIRECTIVE_RE = /^(beasties|critters):(.*)$/;
/**
* A comment which looks like a directive but uses an unknown namespace, e.g.
* `/* critter:include *\/`. Deliberately narrow: a single bare word followed by
* `include`/`exclude` and an optional `start`/`end`, and nothing else, so that
* license banners, sourcemap comments and ordinary prose never match.
*/
const DIRECTIVE_LOOKALIKE_RE = /^([\w-]+):(include|exclude)(?: (start|end))?$/;
const COMMANDS = /* @__PURE__ */ new Set([
	"include",
	"exclude",
	"include start",
	"include end",
	"exclude start",
	"exclude end"
]);
const SUPPORTED_DIRECTIVES = [...COMMANDS].map((command) => `beasties:${command}`).join(", ");
/**
* Interpret a CSS comment's text as a beasties directive.
*
* `text` is the comment body with the delimiters removed and whitespace
* trimmed, i.e. postcss' `Comment#text`. Comments beginning with `!` (legal
* comments preserved by minifiers) are not treated as directives.
*/
function parseDirective(text) {
	const match = text.match(DIRECTIVE_RE);
	if (match) {
		const command = match[2].trim();
		if (COMMANDS.has(command)) return {
			command,
			deprecated: match[1] === "critters"
		};
		return { warning: `Unknown comment directive "${text}". Supported directives are: ${SUPPORTED_DIRECTIVES}.` };
	}
	const lookalike = text.match(DIRECTIVE_LOOKALIKE_RE);
	if (lookalike) return { warning: `Ignoring unrecognised comment directive "${text}". Did you mean "beasties:${lookalike[3] ? `${lookalike[2]} ${lookalike[3]}` : lookalike[2]}"?` };
	return {};
}
const CRITTERS_DEPRECATION_WARNING = "Found deprecated \"critters:\" comment directives. Use the \"beasties:\" prefix instead, for example \"/* beasties:include start */\".";
//#endregion
//#region src/selectors.ts
const removePseudoClassesAndElementsPattern = /(?<!\\)::?[a-z-]+(?:\(.+\))?/gi;
const implicitUniversalPattern = /([>+~])\s*(?!\1)([>+~])/g;
const emptyCombinatorPattern = /([>+~])\s*(?=\1|$)/g;
const removeTrailingCommasPattern = /\(\s*,|,\s*\)/g;
const BEFORE_AFTER_PSEUDO_RE = /^::?(?:before|after)$/;
/**
* Selectors that are considered critical regardless of whether they match an element in the document.
*/
function isAlwaysCriticalSelector(sel) {
	return sel === ":root" || sel === "html" || sel === "body" || sel[0] === ":" && BEFORE_AFTER_PSEUDO_RE.test(sel);
}
/**
* Strip pseudo-classes and pseudo-elements from a selector so it can be
* matched against the document, since we only care that the associated
* elements exist.
*/
function normalizeCssSelector(sel) {
	return sel.replace(removePseudoClassesAndElementsPattern, "").replace(removeTrailingCommasPattern, (match) => match.includes("(") ? "(" : ")").replace(implicitUniversalPattern, "$1 * $2").replace(emptyCombinatorPattern, "$1 *").trim();
}
//#endregion
//#region src/urls.ts
const REMOTE_URL_RE = /^https?:\/\//;
const URL_RE_G = /url\((?:'((?:[^'\\]|\\.)*)'|"((?:[^"\\]|\\.)*)"|([^()]*))\)/gis;
const ABSOLUTE_URL_RE = /^(?:[a-z][\w+.-]*:|\/\/|\/|#)/i;
/**
* Resolve a `url()` value that is relative to `baseHref` (the location of the
* stylesheet it was declared in) so that it can be used from the document instead.
*/
function resolveCssUrl(url, baseHref) {
	if (!url || ABSOLUTE_URL_RE.test(url)) return url;
	const base = baseHref.split("?")[0].split("#")[0];
	if (REMOTE_URL_RE.test(base) || base.startsWith("//")) try {
		const resolved = new URL(url, base.startsWith("//") ? `https:${base}` : base);
		return base.startsWith("//") ? resolved.href.replace(REMOTE_URL_RE, "//") : resolved.href;
	} catch {
		return url;
	}
	const dir = path.posix.dirname(base);
	if (dir === "." || dir === "") return url;
	return path.posix.join(dir, url);
}
function rewriteCssUrls(css, baseHref) {
	return css.replace(URL_RE_G, (match, singleQuoted, doubleQuoted, bare) => {
		const quote = singleQuoted !== void 0 ? "'" : doubleQuoted !== void 0 ? "\"" : "";
		const url = singleQuoted ?? doubleQuoted ?? bare?.trim() ?? "";
		const resolved = resolveCssUrl(url, baseHref);
		return resolved === url ? match : `url(${quote}${resolved}${quote})`;
	});
}
//#endregion
//#region src/plan-encode.ts
/**
* Collects string frequencies so only strings used more than once are pooled;
* pooling a unique string would cost more than inlining it.
*/
var StringPool = class {
	#counts = /* @__PURE__ */ new Map();
	#indices = /* @__PURE__ */ new Map();
	strings = [];
	count(value) {
		if (value === void 0) return;
		this.#counts.set(value, (this.#counts.get(value) ?? 0) + 1);
	}
	finalize() {
		for (const [value, count] of this.#counts) if (count > 1) {
			this.strings.push(value);
			this.#indices.set(value, this.strings.length);
		}
	}
	/** A pooled string's one-based index, or the string itself when it isn't pooled */
	ref(value) {
		return this.#indices.get(value) ?? value;
	}
	refs(values) {
		return values.map((value) => this.ref(value));
	}
};
function encodePlan(sheet) {
	const pool = new StringPool();
	const wrapKeys = /* @__PURE__ */ new Map();
	const wraps = [];
	for (const rule of sheet.rules) {
		countRule(rule, pool);
		if (rule.wrap) {
			const key = rule.wrap.join("\0");
			if (!wrapKeys.has(key)) {
				wrapKeys.set(key, wraps.length);
				wraps.push(rule.wrap);
			}
		}
	}
	for (const wrap of wraps) for (const part of wrap) pool.count(part);
	pool.finalize();
	return [
		1,
		sheet.href ?? 0,
		sheet.size,
		pool.strings,
		wraps.map((wrap) => pool.refs(wrap)),
		sheet.rules.map((rule) => encodeRule(rule, pool, wrapKeys))
	];
}
function countRule(rule, pool) {
	if (rule.selectors) {
		for (const selector of rule.selectors) pool.count(selector);
		pool.count(rule.body);
	}
	pool.count(rule.css);
	if (rule.match) for (const condition of rule.match) countCondition(condition, pool);
	for (const value of rule.fontsUsed ?? []) pool.count(value);
	for (const value of rule.keyframesUsed ?? []) pool.count(value);
	pool.count(rule.keyframes);
	pool.count(rule.fontFace?.family);
	pool.count(rule.fontFace?.src);
}
function countCondition(condition, pool) {
	if (condition === true) return;
	if (condition.program) {
		for (const compound of condition.program.compounds) {
			pool.count(compound.tag);
			for (const value of compound.classes ?? []) pool.count(value);
			for (const value of compound.ids ?? []) pool.count(value);
			for (const attr of compound.attrs ?? []) {
				pool.count(attr.name);
				pool.count(attr.value);
			}
		}
		return;
	}
	for (const list of [
		condition.classes,
		condition.ids,
		condition.tags,
		condition.attrs
	]) for (const value of list ?? []) pool.count(value);
}
function encodeRule(rule, pool, wrapKeys) {
	let flags = 0;
	const fields = [];
	if (rule.selectors && rule.body !== void 0) {
		flags |= 1;
		fields.push(rule.selectors.length === 1 ? pool.ref(rule.selectors[0]) : pool.refs(rule.selectors), pool.ref(rule.body));
	}
	if (rule.css !== void 0) {
		flags |= 2;
		fields.push(pool.ref(rule.css));
	}
	if (rule.match) {
		flags |= 4;
		fields.push(rule.match.map((condition, index) => encodeMatch(condition, rule.selectors?.[index], pool)));
	}
	if (rule.always) flags |= 8;
	if (rule.wrap) {
		flags |= 16;
		fields.push(wrapKeys.get(rule.wrap.join("\0")));
	}
	if (rule.fontsUsed) {
		flags |= 32;
		fields.push(pool.refs(rule.fontsUsed));
	}
	if (rule.keyframesUsed) {
		flags |= 64;
		fields.push(pool.refs(rule.keyframesUsed));
	}
	if (rule.fontFace) {
		flags |= 128;
		const face = [rule.fontFace.family === void 0 ? 0 : pool.ref(rule.fontFace.family), rule.fontFace.src === void 0 ? 0 : pool.ref(rule.fontFace.src)];
		if (rule.fontFace.ranges) face.push(rule.fontFace.ranges);
		fields.push(face);
	}
	if (rule.keyframes !== void 0) {
		flags |= 256;
		fields.push(pool.ref(rule.keyframes));
	}
	return [flags, ...fields];
}
/**
* Most conditions restate their selector (`.foo` -> `{ classes: ['foo'] }`).
* Those are stored as a marker and rederived at decode time, but only when the
* derivation round-trips exactly: escaped selectors (`.md\:flex`) parse to a
* different value than their source text.
*
* When a structural program is present it decides the match on its own, so the
* token fields are dropped. A scan that doesn't evaluate programs then treats
* such a selector as critical rather than checking tokens, which over-inlines
* but never drops a rule.
*/
function encodeMatch(condition, selector, pool) {
	if (condition === true) return 0;
	if (condition.program) return encodeProgram(condition.program, pool);
	if (selector !== void 0) for (const marker of [
		1,
		2,
		3
	]) {
		const derived = deriveCondition(marker, selector);
		if (derived && sameCondition(derived, condition)) return marker;
	}
	return [
		condition.classes ? pool.refs(condition.classes) : 0,
		condition.ids ? pool.refs(condition.ids) : 0,
		condition.tags ? pool.refs(condition.tags) : 0,
		condition.attrs ? pool.refs(condition.attrs) : 0
	];
}
function deriveCondition(marker, selector) {
	if (marker === 3) return { tags: [selector.toLowerCase()] };
	const expectedPrefix = marker === 1 ? "." : "#";
	if (selector[0] !== expectedPrefix) return;
	const value = selector.slice(1);
	return marker === 1 ? { classes: [value] } : { ids: [value] };
}
function sameCondition(a, b) {
	for (const key of [
		"classes",
		"ids",
		"tags",
		"attrs"
	]) {
		const left = a[key];
		const right = b[key];
		if (left === void 0 || right === void 0) {
			if (left !== right) return false;
			continue;
		}
		if (left.length !== right.length || left.some((value, index) => value !== right[index])) return false;
	}
	return true;
}
function encodeProgram(program, pool) {
	return [program.combinators.join(""), program.compounds.map((compound) => {
		if (compound.classes?.length === 1 && compound.tag === void 0 && !compound.ids && !compound.attrs) return pool.ref(compound.classes[0]);
		return [
			compound.tag === void 0 ? 0 : pool.ref(compound.tag),
			compound.classes ? pool.refs(compound.classes) : 0,
			compound.ids ? pool.refs(compound.ids) : 0,
			compound.attrs ? compound.attrs.map((attr) => [
				pool.ref(attr.name),
				ATTR_ACTIONS.indexOf(attr.action),
				attr.value === void 0 ? 0 : pool.ref(attr.value),
				attr.ignoreCase ? 1 : 0
			]) : 0
		];
	})];
}
//#endregion
//#region src/compiler.ts
const FONT_PROP_RE = /^font(?:-family)?$/i;
const WHITESPACE_RE = /\s+/;
const URL_RE = /url\s*\(\s*(['"]?)(.+?)\1\s*\)/;
const COMBINATOR_TOKENS = {
	descendant: " ",
	child: ">",
	adjacent: "+",
	sibling: "~"
};
const SUPPORTED_ATTR_ACTIONS = /* @__PURE__ */ new Set([
	"exists",
	"equals",
	"element",
	"start",
	"end",
	"any",
	"hyphen"
]);
function compileSheet(css, options = {}) {
	const ast = parseStylesheet(css, { safeParser: options.safeParser !== false });
	const rebase = options.href ? (text) => rewriteCssUrls(text, options.href) : (text) => text;
	const sheet = {
		href: options.href,
		rules: [],
		size: css.length,
		warnings: []
	};
	walk(ast, [], sheet, {
		includeNext: false,
		excludeNext: false,
		includeAll: false,
		excludeAll: false,
		warnedCritters: false
	}, options, rebase);
	return sheet;
}
function walk(container, wrap, sheet, state, options, rebase) {
	for (const node of container.nodes ?? []) {
		if (node.type === "comment") {
			const { command, deprecated, warning } = parseDirective(node.text);
			if (warning) sheet.warnings.push(warning);
			if (deprecated && !state.warnedCritters) {
				state.warnedCritters = true;
				sheet.warnings.push(CRITTERS_DEPRECATION_WARNING);
			}
			if (command) switch (command) {
				case "include":
					state.includeNext = true;
					break;
				case "exclude":
					state.excludeNext = true;
					break;
				case "include start":
					state.includeAll = true;
					break;
				case "include end":
					state.includeAll = false;
					break;
				case "exclude start":
					state.excludeAll = true;
					break;
				case "exclude end": state.excludeAll = false;
			}
			continue;
		}
		if (node.type === "rule") {
			compileRule(node, wrap, sheet, state, options, rebase);
			continue;
		}
		if (node.type === "atrule") compileAtRule(node, wrap, sheet, state, options, rebase);
	}
}
function compileRule(rule, wrap, sheet, state, options, rebase) {
	if (state.includeNext) {
		state.includeNext = false;
		sheet.rules.push(withWrap({
			css: rebase(serializeStylesheet(rule, { compress: true })),
			always: true
		}, wrap));
		return;
	}
	if (state.excludeNext) {
		state.excludeNext = false;
		return;
	}
	if (state.includeAll) {
		sheet.rules.push(withWrap({
			css: rebase(serializeStylesheet(rule, { compress: true })),
			always: true
		}, wrap));
		return;
	}
	if (state.excludeAll) return;
	const selectors = [];
	const match = [];
	for (const sel of rule.selectors) {
		const condition = compileSelector(sel, sheet, options);
		if (condition === false) continue;
		selectors.push(sel);
		match.push(condition);
	}
	if (selectors.length === 0) return;
	const compiled = {
		selectors,
		match
	};
	if (rule.nodes?.some((n) => n.type === "rule" || n.type === "atrule")) {
		compiled.css = rebase(serializeStylesheet(rule, { compress: true }));
		delete compiled.selectors;
		compiled.match = match;
	} else {
		const original = rule.selector;
		rule.selector = "\0";
		const text = serializeStylesheet(rule, { compress: true });
		rule.selector = original;
		compiled.body = rebase(text.slice(text.indexOf("\0") + 1));
	}
	collectDependencies(rule, compiled);
	sheet.rules.push(withWrap(compiled, wrap));
}
function compileAtRule(rule, wrap, sheet, state, options, rebase) {
	const name = rule.name;
	if (name === "keyframes" || name === "-webkit-keyframes") {
		sheet.rules.push(withWrap({
			css: rebase(serializeStylesheet(rule, { compress: true })),
			keyframes: rule.params
		}, wrap));
		return;
	}
	if (name === "font-face") {
		let family;
		let src;
		let ranges;
		for (const decl of rule.nodes ?? []) {
			if (!("prop" in decl)) continue;
			if (decl.prop === "src") src = (decl.value.match(URL_RE) || [])[2];
			else if (decl.prop === "font-family") family = decl.value;
			else if (decl.prop === "unicode-range") ranges = parseUnicodeRanges(decl.value);
		}
		sheet.rules.push(withWrap({
			css: rebase(serializeStylesheet(rule, { compress: true })),
			fontFace: {
				family,
				src: src && options.href ? resolveCssUrl(src.trim(), options.href) : src,
				ranges
			}
		}, wrap));
		return;
	}
	if (rule.nodes?.some((n) => n.type === "rule" || n.type === "atrule")) {
		const open = `@${name}${rule.raws.afterName ?? " "}${rule.params}${rule.raws.between ?? ""}{`;
		const childWrap = [...wrap, open];
		if (name === "layer") sheet.rules.push({
			css: "",
			always: true,
			wrap: childWrap
		});
		walk(rule, childWrap, sheet, state, options, rebase);
		return;
	}
	let css = rebase(serializeStylesheet(rule, { compress: true }));
	if (rule.nodes === void 0 && !css.endsWith(";")) css += ";";
	sheet.rules.push(withWrap({
		css,
		always: true
	}, wrap));
}
function compileSelector(sel, sheet, options) {
	if (options.allowRules?.some((exp) => {
		if (exp instanceof RegExp) return exp.test(sel);
		return exp === sel;
	})) return true;
	if (isAlwaysCriticalSelector(sel)) return true;
	const normalized = normalizeCssSelector(sel);
	if (!normalized) return false;
	let parsed;
	try {
		parsed = parse(normalized);
	} catch (e) {
		sheet.warnings.push(`${normalized} -> ${e.message || String(e)}`);
		return false;
	}
	const condition = {};
	let simpleTokens = 0;
	let compounds = 1;
	let hasValuedAttr = false;
	for (const token of parsed.flat()) if (token.type === "attribute") {
		simpleTokens++;
		if (token.name === "class" && (token.action === "element" || token.action === "equals")) {
			for (const cls of token.value.split(WHITESPACE_RE)) if (cls) (condition.classes ??= []).push(cls);
		} else if (token.name === "id" && token.action === "equals") (condition.ids ??= []).push(token.value);
		else {
			if (token.action !== "exists") hasValuedAttr = true;
			(condition.attrs ??= []).push(token.name.toLowerCase());
		}
	} else if (token.type === "tag") {
		simpleTokens++;
		(condition.tags ??= []).push(token.name.toLowerCase());
	} else if (token.type in COMBINATOR_TOKENS) compounds++;
	if (!condition.classes && !condition.ids && !condition.tags && !condition.attrs) return true;
	if (compounds === 1 && simpleTokens === 1 && !hasValuedAttr) return condition;
	if (options.exact !== false && parsed.length === 1) {
		const program = buildProgram(parsed[0]);
		if (program) condition.program = program;
	}
	return condition;
}
function buildProgram(tokens) {
	const compounds = [];
	const combinators = [];
	let current = {};
	for (const token of tokens) {
		if (token.type === "universal") continue;
		if (token.type in COMBINATOR_TOKENS) {
			compounds.push(current);
			combinators.push(COMBINATOR_TOKENS[token.type]);
			current = {};
			continue;
		}
		if (token.type === "tag") {
			current.tag = token.name.toLowerCase();
			continue;
		}
		if (token.type === "attribute") {
			if (token.name === "class" && token.action === "element") {
				(current.classes ??= []).push(token.value);
				continue;
			}
			if (token.name === "id" && token.action === "equals") {
				(current.ids ??= []).push(token.value);
				continue;
			}
			if (!SUPPORTED_ATTR_ACTIONS.has(token.action)) return null;
			(current.attrs ??= []).push({
				name: token.name.toLowerCase(),
				action: token.action,
				value: token.value,
				ignoreCase: token.ignoreCase === true || void 0
			});
			continue;
		}
		return null;
	}
	compounds.push(current);
	return {
		compounds,
		combinators
	};
}
function collectDependencies(rule, compiled) {
	for (const decl of rule.nodes ?? []) {
		if (!("prop" in decl)) continue;
		if (FONT_PROP_RE.test(decl.prop)) for (const family of parseFontFamilies(decl.prop, decl.value)) (compiled.fontsUsed ??= []).push(family);
		if (decl.prop === "animation" || decl.prop === "animation-name") for (const name of parseAnimationNames(decl.value, rule.root())) {
			const trimmed = name.trim();
			if (trimmed) (compiled.keyframesUsed ??= []).push(trimmed);
		}
	}
}
function withWrap(rule, wrap) {
	if (wrap.length > 0) rule.wrap = wrap;
	return rule;
}
//#endregion
export { compileSheet, encodePlan };
