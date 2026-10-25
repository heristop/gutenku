//#region \0rolldown/runtime.js
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
	if (from && typeof from === "object" || typeof from === "function") for (var keys = __getOwnPropNames(from), i = 0, n = keys.length, key; i < n; i++) {
		key = keys[i];
		if (!__hasOwnProp.call(to, key) && key !== except) __defProp(to, key, {
			get: ((k) => from[k]).bind(null, key),
			enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable
		});
	}
	return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(isNodeMode || !mod || !mod.__esModule || !__hasOwnProp.call(mod, "default") ? __defProp(target, "default", {
	value: mod,
	enumerable: true
}) : target, mod));
//#endregion
let node_fs = require("node:fs");
let node_path = require("node:path");
node_path = __toESM(node_path);
let postcss = require("postcss");
let postcss_media_query_parser = require("postcss-media-query-parser");
postcss_media_query_parser = __toESM(postcss_media_query_parser);
let postcss_safe_parser = require("postcss-safe-parser");
postcss_safe_parser = __toESM(postcss_safe_parser);
let css_select = require("css-select");
let css_what = require("css-what");
let dom_serializer = require("dom-serializer");
dom_serializer = __toESM(dom_serializer);
let domhandler = require("domhandler");
let htmlparser2 = require("htmlparser2");
let picocolors = require("picocolors");
picocolors = __toESM(picocolors);
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
	if (options?.safeParser) return (0, postcss_safe_parser.default)(stylesheet);
	return (0, postcss.parse)(stylesheet);
}
/**
* Serialize a postcss Stylesheet to a String of CSS.
* @private
* @param ast A Stylesheet to serialize, such as one returned from `parseStylesheet()`
*/
function serializeStylesheet(ast, options) {
	const cssParts = [];
	(0, postcss.stringify)(ast, (result, node, type) => {
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
* Converts a walkStyleRules() iterator to mark nodes with `.$$remove=true` instead of actually removing them.
* This means they can be removed in a second pass, allowing the first pass to be nondestructive (eg: to preserve mirrored sheets).
* @private
* @param predicate   Invoked on each node in the tree. Return `false` to remove that node.
*/
function markOnly(predicate) {
	return (rule) => {
		const sel = "selectors" in rule ? rule.selectors : void 0;
		if (predicate(rule) === false) rule.$$remove = true;
		if ("selectors" in rule) {
			rule.$$markedSelectors = rule.selectors;
			rule.selectors = sel;
		}
		if (rule._other) rule._other.$$markedSelectors = rule._other.selectors;
	};
}
/**
* Apply filtered selectors to a rule from a previous markOnly run.
* @private
* @param rule The Rule to apply marked selectors to (if they exist).
*/
function applyMarkedSelectors(rule) {
	if (rule.$$markedSelectors) rule.selectors = rule.$$markedSelectors;
	if (rule._other) applyMarkedSelectors(rule._other);
}
/**
* Recursively walk all rules in a stylesheet.
* @private
* @param node       A Stylesheet or Rule to descend into.
* @param iterator   Invoked on each node in the tree. Return `false` to remove that node.
*/
function walkStyleRules(node, iterator) {
	if (!("nodes" in node)) return;
	node.nodes = node.nodes?.filter((rule) => {
		if (hasNestedRules(rule)) walkStyleRules(rule, iterator);
		rule._other = void 0;
		rule.filterSelectors = filterSelectors;
		return iterator(rule) !== false;
	});
}
/**
* Recursively walk all rules in two identical stylesheets, filtering nodes into one or the other based on a predicate.
* @private
* @param node       A Stylesheet or Rule to descend into.
* @param node2      A second tree identical to `node`
* @param iterator   Invoked on each node in the tree. Return `false` to remove that node from the first tree, true to remove it from the second.
*/
function walkStyleRulesWithReverseMirror(node, node2, iterator) {
	if (!node2) return walkStyleRules(node, iterator);
	[node.nodes, node2.nodes] = splitFilter(node.nodes, node2.nodes, (rule, index, _rules, rules2) => {
		const rule2 = rules2?.[index];
		if (hasNestedRules(rule)) {
			walkStyleRulesWithReverseMirror(rule, rule2, iterator);
			if ("nodes" in rule && rule.nodes?.length === 0 && isRemovableIfEmpty(rule)) return false;
		}
		rule._other = rule2;
		rule.filterSelectors = filterSelectors;
		return iterator(rule) !== false;
	});
	if (node2.nodes) node2.nodes = node2.nodes.filter((rule) => {
		if ("nodes" in rule && rule.nodes?.length === 0 && isRemovableIfEmpty(rule)) return false;
		return true;
	});
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
function hasNestedRules(rule) {
	return "nodes" in rule && !!rule.nodes?.length && (!("name" in rule) || rule.name !== "keyframes" && rule.name !== "-webkit-keyframes") && rule.nodes.some((n) => n.type === "rule" || n.type === "atrule");
}
function isRemovableIfEmpty(rule) {
	if (!("name" in rule) || rule.type !== "atrule") return false;
	return rule.name === "media" || rule.name === "supports";
}
function splitFilter(a, b, predicate) {
	const aOut = [];
	const bOut = [];
	for (let index = 0; index < a.length; index++) {
		const item = a[index];
		if (predicate(item, index, a, b)) aOut.push(item);
		else bOut.push(b?.[index] ?? item);
	}
	return [aOut, bOut];
}
function filterSelectors(predicate) {
	if (this._other) {
		const [a, b] = splitFilter(this.selectors, this._other.selectors, predicate);
		this.selectors = a;
		this._other.selectors = b;
	} else this.selectors = this.selectors.filter(predicate);
}
const MEDIA_TYPES = /* @__PURE__ */ new Set([
	"all",
	"print",
	"screen",
	"speech"
]);
const MEDIA_KEYWORDS = /* @__PURE__ */ new Set([
	"and",
	"not",
	","
]);
const MEDIA_FEATURES = new Set([
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
function validateMediaType(node) {
	const { type: nodeType, value: nodeValue } = node;
	if (nodeType === "media-type") return MEDIA_TYPES.has(nodeValue);
	else if (nodeType === "keyword") return MEDIA_KEYWORDS.has(nodeValue);
	else if (nodeType === "media-feature") return MEDIA_FEATURES.has(nodeValue);
}
/**
*
* This function performs a basic media query validation
* to ensure the values passed as part of the 'media' config
* is HTML safe and does not cause any injection issue
*
* @param query Media query to validate
*/
function validateMediaQuery(query) {
	const mediaTree = ("default" in postcss_media_query_parser.default ? postcss_media_query_parser.default.default : postcss_media_query_parser.default)(query);
	const nodeTypes = /* @__PURE__ */ new Set([
		"media-type",
		"keyword",
		"media-feature"
	]);
	const stack = [mediaTree];
	while (stack.length > 0) {
		const node = stack.pop();
		if (nodeTypes.has(node.type) && !validateMediaType(node)) return false;
		if (node.nodes) stack.push(...node.nodes);
	}
	return true;
}
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
//#region package.json
var version = "0.5.5";
//#endregion
//#region src/fonts.ts
/**
* Font family parsing shared by the compiler, the runtime and the DOM-based
* pipeline, so that families collected from `font-family` / `font`
* declarations can be compared with `@font-face` families regardless of
* quoting, escaping or case.
*/
const CSS_WIDE_KEYWORDS = /* @__PURE__ */ new Set([
	"inherit",
	"initial",
	"unset",
	"revert",
	"revert-layer"
]);
const HEX_ESCAPE_RE = /\\([0-9a-f]{1,6})[\t\n\f\r ]?/gi;
const CHAR_ESCAPE_RE = /\\(.)/g;
const WHITESPACE_RE = /\s+/g;
const FONT_SIZE_RE = /^(?:[+-]?(?:\d+|\d*\.\d+)(?:[a-z]+|%)|calc\(|var\()/i;
const FONT_SIZE_KEYWORDS = /* @__PURE__ */ new Set([
	"xx-small",
	"x-small",
	"small",
	"medium",
	"large",
	"x-large",
	"xx-large",
	"xxx-large",
	"smaller",
	"larger"
]);
const UNICODE_RANGE_RE = /^u\+([0-9a-f]{1,6})(?:-([0-9a-f]{1,6}))?$/i;
const UNICODE_WILDCARD_RE = /^u\+([0-9a-f]{0,5})(\?{1,6})$/i;
/**
* Parse a `unicode-range` descriptor into flattened `[start, end, ...]`
* codepoint pairs, or `undefined` if any part of it isn't understood, in which
* case callers must treat the face as covering everything.
*/
function parseUnicodeRanges(value) {
	const ranges = [];
	for (const token of splitTopLevel(value)) {
		const part = token.trim();
		if (!part) continue;
		const wildcard = UNICODE_WILDCARD_RE.exec(part);
		if (wildcard) {
			const prefix = wildcard[1];
			const digits = wildcard[2].length;
			if (prefix.length + digits > 6) return;
			ranges.push(Number.parseInt(prefix + "0".repeat(digits), 16), Number.parseInt(prefix + "f".repeat(digits), 16));
			continue;
		}
		const range = UNICODE_RANGE_RE.exec(part);
		if (!range) return;
		const start = Number.parseInt(range[1], 16);
		const end = range[2] === void 0 ? start : Number.parseInt(range[2], 16);
		if (end < start) return;
		ranges.push(start, end);
	}
	return ranges.length > 0 ? ranges : void 0;
}
/**
* Whether any of a document's codepoints falls inside a face's `unicode-range`.
* Unknown ranges or unknown document text count as a match, so a face is only
* excluded when its subset is provably unused.
*/
function unicodeRangeUsed(ranges, chars) {
	if (!ranges || !chars) return true;
	for (const codepoint of chars) for (let i = 0; i < ranges.length; i += 2) if (codepoint >= ranges[i] && codepoint <= ranges[i + 1]) return true;
	return false;
}
const ENTITY_RE = /&(#x[0-9a-f]+|#\d+|[a-z][a-z0-9]*);/iy;
const REFERENCE_RE = /&(?:#x([0-9a-f]+);?|#(\d+);?|([a-z0-9]+)(;?))/gi;
const ATTRIBUTE_ENTITIES = new Map(Object.entries({
	"AMP": "&",
	"amp": "&",
	"apos;": "'",
	"COPY": "©",
	"GT": ">",
	"gt": ">",
	"LT": "<",
	"lt": "<",
	"QUOT": "\"",
	"quot": "\"",
	"REG": "®"
}));
for (const [index, name] of "nbsp iexcl cent pound curren yen brvbar sect uml copy ordf laquo not shy reg macr deg plusmn sup2 sup3 acute micro para middot cedil sup1 ordm raquo frac14 frac12 frac34 iquest Agrave Aacute Acirc Atilde Auml Aring AElig Ccedil Egrave Eacute Ecirc Euml Igrave Iacute Icirc Iuml ETH Ntilde Ograve Oacute Ocirc Otilde Ouml times Oslash Ugrave Uacute Ucirc Uuml Yacute THORN szlig agrave aacute acirc atilde auml aring aelig ccedil egrave eacute ecirc euml igrave iacute icirc iuml eth ntilde ograve oacute ocirc otilde ouml divide oslash ugrave uacute ucirc uuml yacute thorn yuml".split(" ").entries()) ATTRIBUTE_ENTITIES.set(name, String.fromCharCode(160 + index));
const C1_REPLACEMENTS = "€‚ƒ„…†‡ˆ‰Š‹ŒŽ‘’“”•–—˜™š›œžŸ";
const NAMED_ENTITIES = new Map(Object.entries({
	amp: "&",
	apos: "'",
	gt: ">",
	lt: "<",
	nbsp: "\xA0",
	quot: "\""
}));
function createTextCodepoints() {
	return {
		bmp: /* @__PURE__ */ new Uint8Array(65536),
		astral: /* @__PURE__ */ new Set(),
		complete: true
	};
}
/** Materialize collected codepoints, or `undefined` if some text was undecodable */
function toCodepointSet(text) {
	if (!text.complete) return;
	const chars = new Set(text.astral);
	for (let codepoint = 0; codepoint < text.bmp.length; codepoint++) if (text.bmp[codepoint]) chars.add(codepoint);
	return chars;
}
/**
* Add the codepoints of a run of (possibly entity-encoded) HTML text. An
* entity that can't be decoded clears `complete`, since the document then
* contains characters we can't account for.
*/
function addTextCodepoints(text, into) {
	const { bmp } = into;
	for (let index = 0; index < text.length; index++) {
		const code = text.charCodeAt(index);
		if (code === 38) {
			ENTITY_RE.lastIndex = index;
			const entity = ENTITY_RE.exec(text);
			if (entity) {
				const body = entity[1];
				if (body[0] === "#") {
					const codepoint = body[1] === "x" || body[1] === "X" ? Number.parseInt(body.slice(2), 16) : Number.parseInt(body.slice(1), 10);
					if (codepoint >= 0 && codepoint <= 65535) bmp[codepoint] = 1;
					else if (codepoint > 65535 && codepoint <= 1114111) into.astral.add(codepoint);
				} else {
					const decoded = NAMED_ENTITIES.get(body.toLowerCase());
					if (decoded) bmp[decoded.charCodeAt(0)] = 1;
					else into.complete = false;
				}
				index = ENTITY_RE.lastIndex - 1;
				continue;
			}
		}
		if (code >= 55296 && code <= 56319 && index + 1 < text.length) {
			const low = text.charCodeAt(index + 1);
			if (low >= 56320 && low <= 57343) {
				into.astral.add((code - 55296) * 1024 + low - 56320 + 65536);
				index++;
				continue;
			}
		}
		bmp[code] = 1;
	}
}
/**
* Decode the character references in an attribute value that was kept as
* written, as an HTML parser does. References that need the full table of
* named references are left as written, since it would outweigh the runtime.
*/
function decodeEntities(text) {
	if (!text.includes("&")) return text;
	return text.replace(REFERENCE_RE, (reference, hex, decimal, name, semicolon, offset = 0) => {
		if (name) {
			const char = ATTRIBUTE_ENTITIES.get(name) ?? ATTRIBUTE_ENTITIES.get(name + semicolon);
			return char && (semicolon || text[offset + reference.length] !== "=") ? char : reference;
		}
		const codepoint = hex ? Number.parseInt(hex, 16) : Number(decimal);
		if (!codepoint || codepoint > 1114111 || codepoint >= 55296 && codepoint <= 57343) return "�";
		return C1_REPLACEMENTS[codepoint - 128] ?? String.fromCodePoint(codepoint);
	});
}
/** Case-fold, unquote and unescape a single family name for comparison */
function normalizeFontFamily(family) {
	let value = family.trim();
	const quote = value[0];
	if ((quote === "\"" || quote === "'") && value.endsWith(quote) && value.length > 1) value = value.slice(1, -1);
	value = value.replace(HEX_ESCAPE_RE, (_, hex) => String.fromCodePoint(Number.parseInt(hex, 16))).replace(CHAR_ESCAPE_RE, "$1").replace(WHITESPACE_RE, " ").trim();
	return value.toLowerCase();
}
/**
* Extract normalized family names from the value of a `font-family` or `font`
* declaration. CSS-wide keywords and system font shorthands yield no families.
*/
function parseFontFamilies(prop, value) {
	const isShorthand = prop.toLowerCase() === "font";
	const segments = splitTopLevel(value);
	if (isShorthand) {
		const first = segments[0];
		if (first === void 0) return [];
		const tail = shorthandFamily(first);
		if (tail === void 0) return [];
		segments[0] = tail;
	}
	const families = [];
	for (const segment of segments) {
		const family = normalizeFontFamily(segment);
		if (family && !CSS_WIDE_KEYWORDS.has(family)) families.push(family);
	}
	return families;
}
/**
* The family portion of a `font` shorthand's first comma-separated segment, or
* `undefined` when the segment has no font-size and so declares no family
* (`font: inherit`, `font: menu`).
*/
function shorthandFamily(segment) {
	const tokens = segment.trim().replace(/\s*\/\s*/g, "/").split(/\s+/);
	for (let i = 0; i < tokens.length; i++) {
		const size = tokens[i].split("/")[0];
		if (FONT_SIZE_RE.test(size) || FONT_SIZE_KEYWORDS.has(size.toLowerCase())) return tokens.slice(i + 1).join(" ");
	}
}
/** Split a family list on top-level commas, ignoring those inside quotes or parens */
function splitTopLevel(value) {
	const segments = [];
	let start = 0;
	let depth = 0;
	let quote;
	for (let i = 0; i < value.length; i++) {
		const char = value[i];
		if (quote) {
			if (char === "\\") i++;
			else if (char === quote) quote = void 0;
			continue;
		}
		if (char === "\"" || char === "'") quote = char;
		else if (char === "(") depth++;
		else if (char === ")") depth = Math.max(0, depth - 1);
		else if (char === "," && depth === 0) {
			segments.push(value.slice(start, i));
			start = i + 1;
		}
	}
	segments.push(value.slice(start));
	return segments;
}
//#endregion
//#region src/dom.ts
function buildCache(container) {
	container._classCache = /* @__PURE__ */ new Set();
	container._idCache = /* @__PURE__ */ new Set();
	const queue = [container];
	while (queue.length) {
		const node = queue.shift();
		if (node.hasAttribute?.("class")) decodeEntities(node.getAttribute("class")).trim().split(/\s+/).forEach((cls) => {
			container._classCache.add(cls);
		});
		if (node.hasAttribute?.("id")) {
			const id = decodeEntities(node.getAttribute("id")).trim();
			container._idCache.add(id);
		}
		if ("children" in node) queue.push(...node.children.filter((child) => child.type === "tag"));
	}
}
/**
* Parse HTML into a mutable, serializable DOM Document.
* The DOM implementation is an htmlparser2 DOM enhanced with basic DOM mutation methods.
* @param html   HTML to parse into a Document instance
*/
function createDocument(html, logger) {
	const document = (0, htmlparser2.parseDocument)(html, { decodeEntities: false });
	extendDocument(document);
	const parsedPrototype = Object.getPrototypeOf(document.children.find((child) => child.type === "tag") ?? domhandler.Element.prototype);
	extendElement(parsedPrototype, logger);
	if (parsedPrototype !== domhandler.Element.prototype) extendElement(domhandler.Element.prototype, logger);
	let beastiesContainers = document.querySelectorAll("[data-beasties-container]");
	if (!beastiesContainers.length) {
		document.documentElement?.setAttribute("data-beasties-container", "");
		beastiesContainers = [document.documentElement || document];
	}
	document.beastiesContainers = beastiesContainers;
	for (const container of beastiesContainers) buildCache(container);
	return document;
}
/**
* Serialize a Document to an HTML String
*/
function serializeDocument(document) {
	return (0, dom_serializer.default)(document, { decodeEntities: false });
}
/**
* Methods and descriptors to mix into Element.prototype
* @private
*/
const extendedMarker = Symbol.for("beasties.element-extended");
function extendElement(element, logger) {
	const appliedVersion = element[extendedMarker] ?? (Object.hasOwn(element, "nodeName") ? "an older version" : void 0);
	if (typeof appliedVersion === "string") {
		if (appliedVersion !== version) logger?.warn?.(`Multiple versions of beasties are patching the same \`domhandler\` instance (${appliedVersion} applied it, ${version} loaded after). Deduplicate beasties to a single version if you see unexpected DOM errors.`);
		return;
	}
	Object.defineProperties(element, {
		nodeName: { get() {
			return this.tagName.toUpperCase();
		} },
		id: {
			get() {
				return this.getAttribute("id");
			},
			set(value) {
				this.setAttribute("id", value);
			}
		},
		className: {
			get() {
				return this.getAttribute("class");
			},
			set(value) {
				this.setAttribute("class", value);
			}
		},
		insertBefore: { value(child, referenceNode) {
			if (!referenceNode) return this.appendChild(child);
			htmlparser2.DomUtils.prepend(referenceNode, child);
			return child;
		} },
		appendChild: { value(child) {
			htmlparser2.DomUtils.appendChild(this, child);
			return child;
		} },
		removeChild: { value(child) {
			htmlparser2.DomUtils.removeElement(child);
		} },
		remove: { value() {
			htmlparser2.DomUtils.removeElement(this);
		} },
		textContent: {
			get() {
				return htmlparser2.DomUtils.getText(this);
			},
			set(text) {
				this.children = [];
				htmlparser2.DomUtils.appendChild(this, new domhandler.Text(text));
			}
		},
		setAttribute: { value(name, value) {
			this.attribs ??= {};
			value ??= "";
			this.attribs[name] = value;
		} },
		removeAttribute: { value(name) {
			if (this.attribs != null) delete this.attribs[name];
		} },
		getAttribute: { value(name) {
			return this.attribs != null && this.attribs[name];
		} },
		hasAttribute: { value(name) {
			return this.attribs != null && this.attribs[name] != null;
		} },
		getAttributeNode: { value(name) {
			const value = this.getAttribute(name);
			if (value != null) return {
				specified: true,
				value
			};
		} },
		exists: { value(sel) {
			return cachedQuerySelector(sel, this);
		} },
		querySelector: { value(sel) {
			return (0, css_select.selectOne)(sel, this);
		} },
		querySelectorAll: { value(sel) {
			return (0, css_select.selectAll)(sel, this);
		} }
	});
	Object.defineProperty(element, extendedMarker, {
		value: version,
		configurable: true
	});
}
function extendDocument(document) {
	Object.defineProperties(document, {
		nodeType: { get() {
			return 9;
		} },
		contentType: { get() {
			return "text/html";
		} },
		nodeName: { get() {
			return "#document";
		} },
		documentElement: { get() {
			return this.children.find((child) => "tagName" in child && String(child.tagName).toLowerCase() === "html");
		} },
		head: { get() {
			return this.querySelector("head");
		} },
		body: { get() {
			return this.querySelector("body");
		} },
		createElement: { value(name) {
			return new domhandler.Element(name, {});
		} },
		createTextNode: { value(text) {
			return new domhandler.Text(text);
		} },
		exists: { value(sel) {
			return cachedQuerySelector(sel, this);
		} },
		querySelector: { value(sel) {
			return (0, css_select.selectOne)(sel, this);
		} },
		querySelectorAll: { value(sel) {
			if (sel === ":root") return this;
			return (0, css_select.selectAll)(sel, this);
		} },
		beastiesContainer: { get() {
			return this.beastiesContainers?.[0];
		} }
	});
}
const selectorTokensCache = /* @__PURE__ */ new Map();
const selectOptions = { adapter: {
	...htmlparser2.DomUtils,
	isTag: domhandler.isTag,
	getAttributeValue(elem, name) {
		const value = htmlparser2.DomUtils.getAttributeValue(elem, name);
		return value && decodeEntities(value);
	}
} };
function cachedQuerySelector(sel, node) {
	let selectorTokens = selectorTokensCache.get(sel);
	if (selectorTokens === void 0) {
		selectorTokens = parseRelevantSelectors(sel);
		selectorTokensCache.set(sel, selectorTokens);
	}
	if (selectorTokens && node._classCache && node._idCache) {
		for (const token of selectorTokens) {
			if (token.name === "class" && !node._classCache.has(token.value)) return false;
			if (token.name === "id" && !node._idCache.has(token.value)) return false;
		}
		return true;
	}
	return !!(0, css_select.selectOne)(sel, node, selectOptions);
}
function parseRelevantSelectors(sel) {
	const tokens = (0, css_what.parse)(sel);
	const relevantTokens = [];
	for (let i = 0; i < tokens.length; i++) {
		const tokenGroup = tokens[i];
		if (tokenGroup?.length !== 1) return null;
		const token = tokenGroup[0];
		if (token?.type === "attribute" && (token.name === "class" || token.name === "id")) relevantTokens.push(token);
	}
	return relevantTokens.length > 0 ? relevantTokens : null;
}
//#endregion
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
//#region src/selectors.ts
const removePseudoClassesAndElementsPattern = /(?<!\\)::?[a-z-]+(?:\(.+\))?/gi;
const implicitUniversalPattern = /([>+~])\s*(?!\1)([>+~])/g;
const emptyCombinatorPattern = /([>+~])\s*(?=\1|$)/g;
const removeTrailingCommasPattern = /\(\s*,|,\s*\)/g;
const BEFORE_AFTER_PSEUDO_RE = /^::?(?:before|after)$/;
const UNEVALUABLE_SELECTOR_ERROR_RE = /^(?:unknown pseudo-class|pseudo-elements are not supported)/i;
/**
* Whether a selector matching error means the selector is valid CSS that cannot
* be evaluated statically (rather than a selector we failed to parse).
*/
function isUnevaluableSelectorError(message) {
	return UNEVALUABLE_SELECTOR_ERROR_RE.test(message);
}
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
	const dir = node_path.default.posix.dirname(base);
	if (dir === "." || dir === "") return url;
	return node_path.default.posix.join(dir, url);
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
//#region src/util.ts
const LOG_LEVELS = [
	"trace",
	"debug",
	"info",
	"warn",
	"error",
	"silent"
];
const defaultLogger = {
	trace(msg) {
		console.trace(msg);
	},
	debug(msg) {
		console.debug(msg);
	},
	warn(msg) {
		console.warn(picocolors.default.yellow(msg));
	},
	error(msg) {
		console.error(picocolors.default.bold(picocolors.default.red(msg)));
	},
	info(msg) {
		console.info(picocolors.default.bold(picocolors.default.blue(msg)));
	},
	silent() {}
};
function createLogger(logLevel) {
	const logLevelIdx = LOG_LEVELS.indexOf(logLevel);
	return LOG_LEVELS.reduce((logger, type, index) => {
		if (index >= logLevelIdx) logger[type] = defaultLogger[type];
		else logger[type] = defaultLogger.silent;
		return logger;
	}, {});
}
const DEDUPE_WINDOW_MS = 6e4;
const DEDUPE_MAX_ENTRIES = 500;
const processSeen = /* @__PURE__ */ new Map();
/**
* Wrap a logger so that identical `warn`/`error` messages are only emitted once
* per scope. Server-side rendering constructs a Beasties instance per request,
* so the default scope is the process.
*/
function createDeduplicatingLogger(logger, scope) {
	if (scope === false) return logger;
	const seen = scope === "process" ? processSeen : /* @__PURE__ */ new Map();
	const shouldEmit = (level, message) => {
		const key = `${level}:${message}`;
		const now = Date.now();
		const last = seen.get(key);
		if (last !== void 0 && now - last < DEDUPE_WINDOW_MS) return false;
		if (seen.size >= DEDUPE_MAX_ENTRIES) seen.clear();
		seen.set(key, now);
		return true;
	};
	const deduped = { ...logger };
	for (const level of ["warn", "error"]) {
		const original = logger[level];
		if (!original) continue;
		deduped[level] = (message) => {
			if (shouldEmit(level, message)) original.call(logger, message);
		};
	}
	return deduped;
}
function isSubpath(basePath, currentPath) {
	return !node_path.default.relative(basePath, currentPath).startsWith("..");
}
//#endregion
//#region src/index.ts
const LEADING_SLASH_OR_QUERY_RE = /^\/(?!\/)|[?#].*$/g;
const PUBLIC_PATH_RE = /(^\/(?!\/)|\/$)/g;
const FONT_PROP_RE = /^font(?:-family)?$/i;
const NON_RENDERED_ELEMENTS = /* @__PURE__ */ new Set([
	"script",
	"style",
	"template",
	"noscript",
	"head",
	"title"
]);
const RENDERED_ATTRS = [
	"alt",
	"label",
	"placeholder",
	"title",
	"value"
];
const LEADING_SLASH_RE = /^\//;
const URL_RE = /url\s*\(\s*(['"]?)(.+?)\1\s*\)/;
const DEFERRED_MEDIA_ATTR = "data-beasties-media";
const DEFERRED_MEDIA_SCRIPT = `document.querySelectorAll('link[${DEFERRED_MEDIA_ATTR}]').forEach(function(l){l.media=l.getAttribute('${DEFERRED_MEDIA_ATTR}');l.removeAttribute('${DEFERRED_MEDIA_ATTR}')})`;
var Beasties = class Beasties {
	#selectorCache = /* @__PURE__ */ new Map();
	#preloadedFonts = /* @__PURE__ */ new WeakMap();
	#documentChars = /* @__PURE__ */ new WeakMap();
	#pendingWrites = /* @__PURE__ */ new Set();
	options;
	logger;
	fs;
	constructor(options = {}) {
		this.options = Object.assign({
			logLevel: "info",
			path: "",
			publicPath: "",
			reduceInlineStyles: true,
			pruneSource: false,
			additionalStylesheets: [],
			allowRules: [],
			dedupeWarnings: "process"
		}, options);
		this.logger = createDeduplicatingLogger(this.options.logger || createLogger(this.options.logLevel), this.options.dedupeWarnings === true ? "process" : this.options.dedupeWarnings);
	}
	/**
	* Read the contents of a file from the specified filesystem or disk
	*/
	readFile(filename) {
		const fs = this.fs;
		return new Promise((resolve, reject) => {
			const callback = (err, data) => {
				if (err) reject(err);
				else resolve(data.toString());
			};
			if (fs && fs.readFile) fs.readFile(filename, callback);
			else (0, node_fs.readFile)(filename, "utf-8", callback);
		});
	}
	/**
	* Write content to a file
	*/
	writeFile(filename, data) {
		const fs = this.fs;
		return new Promise((resolve, reject) => {
			const callback = (err) => {
				if (err) reject(err);
				else resolve();
			};
			if (fs && fs.writeFile) fs.writeFile(filename, data, callback);
			else (0, node_fs.writeFile)(filename, data, callback);
		});
	}
	/**
	* Apply critical CSS processing to the html
	*/
	async process(html) {
		const start = Date.now();
		const document = createDocument(html, this.logger);
		if (this.options.additionalStylesheets.length > 0) await this.embedAdditionalStylesheet(document);
		if (this.options.external !== false) {
			const externalSheets = [...document.querySelectorAll("link[rel=\"stylesheet\"]")];
			if (this.embedLinkedStylesheet !== Beasties.prototype.embedLinkedStylesheet) for (const link of externalSheets) await this.embedLinkedStylesheet(link, document);
			else {
				const sheets = await Promise.all(externalSheets.map((link) => this.fetchStylesheet(link, document)));
				for (const sheet of sheets) if (sheet) this.embedFetchedStylesheet(sheet, document);
			}
		}
		if (this.options.preload === "media-script") this.injectDeferredMediaScript(document);
		const styles = this.getAffectedStyleTags(document);
		for (const style of styles) this.processStyle(style, document);
		if (this.options.mergeStylesheets !== false && styles.length !== 0) this.mergeStylesheets(document);
		await Promise.all(this.#pendingWrites);
		const output = serializeDocument(document);
		const end = Date.now();
		this.logger.info?.(`Time ${end - start}ms`);
		return output;
	}
	/**
	* Get the style tags that need processing
	*/
	getAffectedStyleTags(document) {
		const styles = [...document.querySelectorAll("style")];
		if (this.options.reduceInlineStyles === false) return styles.filter((style) => style.$$external);
		return styles;
	}
	/**
	* Append the single deferred-CSS activation script used by the `"media-script"`
	* strategy, if any link was actually deferred. The script body is invariant, so
	* it can be covered by a CSP hash as well as by `options.nonce`.
	*/
	injectDeferredMediaScript(document) {
		if (document.querySelectorAll(`link[${DEFERRED_MEDIA_ATTR}]`).length === 0) return;
		const script = document.createElement("script");
		this.applyNonce(document, script);
		script.textContent = DEFERRED_MEDIA_SCRIPT;
		document.body.appendChild(script);
	}
	#nonces = /* @__PURE__ */ new WeakMap();
	applyNonce(document, element) {
		if (!this.#nonces.has(document)) this.#nonces.set(document, typeof this.options.nonce === "function" ? this.options.nonce(document) : this.options.nonce);
		const nonce = this.#nonces.get(document);
		if (nonce) element.setAttribute("nonce", nonce);
	}
	mergeStylesheets(document) {
		const styles = this.getAffectedStyleTags(document);
		if (styles.length === 0) {
			this.logger.warn?.("Merging inline stylesheets into a single <style> tag skipped, no inline stylesheets to merge");
			return;
		}
		const first = styles[0];
		let sheet = first.textContent;
		for (let i = 1; i < styles.length; i++) {
			const node = styles[i];
			sheet += node.textContent;
			node.remove();
		}
		first.textContent = sheet;
	}
	/**
	* Given href, find the corresponding CSS asset
	*/
	async getCssAsset(href, _style) {
		const outputPath = this.options.path;
		const publicPath = this.options.publicPath;
		let normalizedPath = href.replace(LEADING_SLASH_OR_QUERY_RE, "");
		const pathPrefix = `${(publicPath || "").replace(PUBLIC_PATH_RE, "")}/`;
		if (normalizedPath.startsWith(pathPrefix) && !(pathPrefix === "/" && normalizedPath.startsWith("//"))) normalizedPath = normalizedPath.substring(pathPrefix.length).replace(LEADING_SLASH_RE, "");
		if (REMOTE_URL_RE.test(normalizedPath) || normalizedPath.startsWith("//")) {
			if (this.options.remote === true) try {
				const absoluteUrl = href.startsWith("//") ? `https:${href}` : href;
				const response = await fetch(absoluteUrl);
				if (!response.ok) {
					this.logger.warn?.(`Failed to fetch ${absoluteUrl} (${response.status})`);
					return;
				}
				return await response.text();
			} catch (error) {
				this.logger.warn?.(`Error fetching ${href}: ${error.message}`);
				return;
			}
			return;
		}
		const filename = node_path.default.resolve(outputPath, normalizedPath);
		if (!isSubpath(outputPath, filename)) return;
		let sheet;
		try {
			sheet = await this.readFile(filename);
		} catch {
			this.logger.warn?.(`Unable to locate stylesheet ${href} (resolved to ${filename}, using path: ${JSON.stringify(outputPath)}, publicPath: ${JSON.stringify(publicPath)}). If this file is not part of your build output, add data-beasties-skip to its <link> to skip it.`);
		}
		return sheet;
	}
	checkInlineThreshold(link, style, sheet) {
		if (this.options.inlineThreshold && sheet.length < this.options.inlineThreshold) {
			const href = style.$$name;
			style.$$reduce = false;
			this.logger.info?.(`\u001B[32mInlined all of ${href} (${sheet.length} was below the threshold of ${this.options.inlineThreshold})\u001B[39m`);
			link.remove();
			return true;
		}
		return false;
	}
	/**
	* Inline the stylesheets from options.additionalStylesheets (assuming it passes `options.filter`)
	*/
	async embedAdditionalStylesheet(document) {
		const styleSheetsIncluded = [];
		const sources = await Promise.all(this.options.additionalStylesheets.map((cssFile) => {
			if (styleSheetsIncluded.includes(cssFile)) return [];
			styleSheetsIncluded.push(cssFile);
			const style = document.createElement("style");
			this.applyNonce(document, style);
			style.$$external = true;
			style.$$name = cssFile;
			return this.getCssAsset(cssFile, style).then((sheet) => [sheet, style]);
		}));
		for (const [sheet, style] of sources) if (sheet) {
			style.textContent = sheet;
			document.head.appendChild(style);
		}
	}
	/**
	* Fetch CSS content for a linked stylesheet
	*/
	async fetchStylesheet(link, document) {
		if (link.hasAttribute("data-beasties-skip")) return;
		const href = link.getAttribute("href");
		if (!(href?.split("?")[0]?.split("#")[0])?.endsWith(".css")) return;
		const style = document.createElement("style");
		this.applyNonce(document, style);
		style.$$external = true;
		const sheet = await this.getCssAsset(href, style);
		if (!sheet) return;
		return {
			link,
			href,
			sheet,
			style
		};
	}
	/**
	* Embed a fetched stylesheet into the document
	*/
	embedFetchedStylesheet(data, document) {
		const { link, href, sheet, style } = data;
		style.textContent = sheet;
		style.$$name = href;
		style.$$links = [link];
		link.parentNode?.insertBefore(style, link);
		if (this.checkInlineThreshold(link, style, sheet)) return;
		let media = link.getAttribute("media");
		if (media && (!validateMediaQuery(media) || !isSafeMediaValue(media))) media = void 0;
		const preloadMode = this.options.preload;
		let cssLoaderPreamble = "function $loadcss(u,m,l){(l=document.createElement('link')).rel='stylesheet';l.href=u;document.head.appendChild(l)}";
		if (preloadMode === "js-lazy") cssLoaderPreamble = cssLoaderPreamble.replace("l.href", "l.media='print';l.onload=function(){l.media=m};l.href");
		if (preloadMode === false) return;
		let noscriptFallback = false;
		let updateLinkToPreload = false;
		const noscriptLink = link.cloneNode(false);
		if (preloadMode === "body") document.body.appendChild(link);
		else if (preloadMode === "js" || preloadMode === "js-lazy") {
			const script = document.createElement("script");
			this.applyNonce(document, script);
			script.setAttribute("data-href", href);
			script.setAttribute("data-media", media || "all");
			script.textContent = `${cssLoaderPreamble}$loadcss(document.currentScript.dataset.href,document.currentScript.dataset.media)`;
			link.parentNode.insertBefore(script, link.nextSibling);
			style.$$links.push(script);
			cssLoaderPreamble = "";
			noscriptFallback = true;
			updateLinkToPreload = true;
		} else if (preloadMode === "media-script") {
			link.setAttribute("media", "print");
			link.setAttribute(DEFERRED_MEDIA_ATTR, media || "all");
			noscriptFallback = true;
		} else if (preloadMode === "media") {
			link.setAttribute("media", "print");
			link.setAttribute("onload", `this.media='${media || "all"}'`);
			noscriptFallback = true;
		} else if (preloadMode === "swap-high") {
			link.setAttribute("rel", "alternate stylesheet preload");
			link.setAttribute("title", "styles");
			link.setAttribute("as", "style");
			link.setAttribute("onload", `this.title='';this.rel='stylesheet'`);
			noscriptFallback = true;
		} else if (preloadMode === "swap-low") {
			link.setAttribute("rel", "alternate stylesheet");
			link.setAttribute("title", "styles");
			link.setAttribute("onload", `this.title='';this.rel='stylesheet'`);
			noscriptFallback = true;
		} else if (preloadMode === "swap") {
			link.setAttribute("onload", "this.rel='stylesheet'");
			updateLinkToPreload = true;
			noscriptFallback = true;
		} else {
			const bodyLink = link.cloneNode(false);
			bodyLink.removeAttribute("id");
			document.body.appendChild(bodyLink);
			style.$$links.push(bodyLink);
			updateLinkToPreload = true;
		}
		if (this.options.noscriptFallback !== false && noscriptFallback && !href.includes("</noscript>")) {
			const noscript = document.createElement("noscript");
			noscriptLink.removeAttribute("id");
			noscript.appendChild(noscriptLink);
			link.parentNode.insertBefore(noscript, link.nextSibling);
			style.$$links.push(noscript);
		}
		if (updateLinkToPreload) {
			link.setAttribute("rel", "preload");
			link.setAttribute("as", "style");
		}
	}
	/**
	* Inline the target stylesheet referred to by a <link rel="stylesheet"> (assuming it passes `options.filter`)
	*/
	async embedLinkedStylesheet(link, document) {
		const sheet = await this.fetchStylesheet(link, document);
		if (sheet) this.embedFetchedStylesheet(sheet, document);
	}
	/**
	* Prune the source CSS files
	*/
	pruneSource(style, before, sheetInverse) {
		const minSize = this.options.minimumExternalSize;
		const name = style.$$name;
		const shouldInline = minSize && sheetInverse.length < minSize;
		if (shouldInline) this.logger.info?.(`\u001B[32mInlined all of ${name} (non-critical external stylesheet would have been ${sheetInverse.length}b, which was below the threshold of ${minSize})\u001B[39m`);
		if (shouldInline || !sheetInverse) {
			style.textContent = before;
			if (style.$$links) for (const link of style.$$links) link.parentNode?.removeChild(link);
		}
		return !!shouldInline;
	}
	/**
	* Parse the stylesheet within a <style> element, then reduce it to contain only rules used by the document.
	*/
	processStyle(style, document) {
		if (style.$$reduce === false) {
			if (style.$$name && style.textContent) style.textContent = rewriteCssUrls(style.textContent, style.$$name);
			return;
		}
		const name = style.$$name ? style.$$name.replace(LEADING_SLASH_RE, "") : "inline CSS";
		const options = this.options;
		const beastiesContainers = document.beastiesContainers;
		let keyframesMode = options.keyframes ?? "critical";
		if (keyframesMode === true) keyframesMode = "all";
		if (keyframesMode === false) keyframesMode = "none";
		let sheet = style.textContent;
		const before = sheet;
		if (!sheet) return;
		const ast = parseStylesheet(sheet, { safeParser: this.options.safeParser !== false });
		const astInverse = options.pruneSource ? parseStylesheet(sheet, { safeParser: this.options.safeParser !== false }) : null;
		const criticalFonts = /* @__PURE__ */ new Set();
		const unparseableSelectors = [];
		const criticalKeyframeNames = /* @__PURE__ */ new Set();
		let includeNext = false;
		let includeAll = false;
		let excludeNext = false;
		let excludeAll = false;
		let warnedCritters = false;
		const shouldPreloadFonts = options.fonts === true || options.preloadFonts === true;
		const shouldInlineFonts = options.fonts !== false && options.inlineFonts === true;
		walkStyleRules(ast, markOnly((rule) => {
			if (rule.type === "comment") {
				const { command, deprecated, warning } = parseDirective(rule.text);
				if (warning) this.logger.warn?.(warning);
				if (deprecated && !warnedCritters) {
					warnedCritters = true;
					this.logger.warn?.(CRITTERS_DEPRECATION_WARNING);
				}
				if (command) switch (command) {
					case "include":
						includeNext = true;
						break;
					case "exclude":
						excludeNext = true;
						break;
					case "include start":
						includeAll = true;
						break;
					case "include end":
						includeAll = false;
						break;
					case "exclude start":
						excludeAll = true;
						break;
					case "exclude end": excludeAll = false;
				}
			}
			if (rule.type === "rule") {
				if (includeNext) {
					includeNext = false;
					return true;
				}
				if (excludeNext) {
					excludeNext = false;
					return false;
				}
				if (includeAll) return true;
				if (excludeAll) return false;
				rule.filterSelectors?.((sel) => {
					if (options.allowRules.some((exp) => {
						if (exp instanceof RegExp) return exp.test(sel);
						return exp === sel;
					})) return true;
					if (isAlwaysCriticalSelector(sel)) return true;
					sel = this.normalizeCssSelector(sel);
					if (!sel) return false;
					try {
						return beastiesContainers.some((container) => container.exists(sel));
					} catch (e) {
						const message = e.message || String(e);
						if (isUnevaluableSelectorError(message)) this.logger.debug?.(`Cannot statically evaluate selector, excluding it from critical CSS: ${sel} (${message})`);
						else unparseableSelectors.push(`${sel} (${message})`);
						return false;
					}
				});
				if (!rule.selector) return false;
				if (rule.nodes) for (const decl of rule.nodes) {
					if (!("prop" in decl)) continue;
					if ((shouldInlineFonts || shouldPreloadFonts) && FONT_PROP_RE.test(decl.prop)) for (const family of parseFontFamilies(decl.prop, decl.value)) criticalFonts.add(family);
					if (decl.prop === "animation" || decl.prop === "animation-name") for (const name of parseAnimationNames(decl.value, ast)) {
						const nameTrimmed = name.trim();
						if (nameTrimmed) criticalKeyframeNames.add(nameTrimmed);
					}
				}
			}
			if (rule.type === "atrule" && (rule.name === "font-face" || rule.name === "layer")) return;
			return ("nodes" in rule && rule.nodes?.some((rule) => !rule.$$remove)) ?? true;
		}));
		if (unparseableSelectors.length !== 0) {
			const single = unparseableSelectors.length === 1;
			this.logger.warn?.(`Could not parse ${single ? "1 selector" : `${unparseableSelectors.length} selectors`} in ${style.$$name || "inline styles"}; ${single ? "its rule was" : "their rules were"} left out of the critical CSS but still ${single ? "applies" : "apply"} once the full stylesheet loads:\n  ${unparseableSelectors.join("\n  ")}`);
		}
		const preloadedFonts = this.getPreloadedFonts(document);
		walkStyleRulesWithReverseMirror(ast, astInverse, (rule) => {
			if (rule.$$remove === true) return false;
			if ("selectors" in rule) applyMarkedSelectors(rule);
			if (rule.type === "atrule" && rule.name === "keyframes") {
				if (keyframesMode === "none") return false;
				if (keyframesMode === "all") return true;
				return criticalKeyframeNames.has(rule.params);
			}
			if (rule.type === "atrule" && rule.name === "font-face") {
				let family, src, ranges;
				let used = false;
				if (rule.nodes) {
					for (const decl of rule.nodes) {
						if (!("prop" in decl)) continue;
						if (decl.prop === "src") src = (decl.value.match(URL_RE) || [])[2];
						else if (decl.prop === "font-family") family = decl.value;
						else if (decl.prop === "unicode-range") ranges = parseUnicodeRanges(decl.value);
					}
					used = !!family && criticalFonts.has(normalizeFontFamily(family)) && (!ranges || unicodeRangeUsed(ranges, this.getDocumentChars(document)));
					if (used && src && shouldPreloadFonts) {
						const href = style.$$name ? resolveCssUrl(src.trim(), style.$$name) : src.trim();
						if (!preloadedFonts.has(href)) {
							preloadedFonts.add(href);
							const preload = document.createElement("link");
							preload.setAttribute("rel", "preload");
							preload.setAttribute("as", "font");
							preload.setAttribute("crossorigin", "anonymous");
							preload.setAttribute("href", href);
							document.head.appendChild(preload);
						}
					}
				}
				if (!shouldInlineFonts || !used) return false;
			}
		});
		sheet = serializeStylesheet(ast, { compress: this.options.compress !== false });
		if (style.$$name) sheet = rewriteCssUrls(sheet, style.$$name);
		if (sheet.trim().length === 0) {
			if (style.parentNode) style.remove();
			return;
		}
		let afterText = "";
		let styleInlinedCompletely = false;
		if (options.pruneSource) {
			const sheetInverse = serializeStylesheet(astInverse, { compress: this.options.compress !== false });
			styleInlinedCompletely = this.pruneSource(style, style.$$name ? rewriteCssUrls(before, style.$$name) : before, sheetInverse);
			if (styleInlinedCompletely) afterText = `, reducing non-inlined size ${sheetInverse.length / before.length * 100 | 0}% to ${formatSize(sheetInverse.length)}`;
			const cssFilePath = node_path.default.resolve(this.options.path, name);
			const write = this.writeFile(cssFilePath, sheetInverse).then(() => this.logger.info?.(`${name} was successfully updated`)).catch((err) => this.logger.error?.(err)).finally(() => this.#pendingWrites.delete(write));
			this.#pendingWrites.add(write);
		}
		if (!styleInlinedCompletely) style.textContent = sheet;
		const percent = sheet.length / before.length * 100 | 0;
		this.logger.info?.(`\u001B[32mInlined ${formatSize(sheet.length)} (${percent}% of original ${formatSize(before.length)}) of ${name}${afterText}.\u001B[39m`);
	}
	/**
	* Codepoints of a document's rendered text, or `undefined` when its text
	* could not be read exactly, which disables `unicode-range` filtering.
	*/
	getDocumentChars(document) {
		if (this.#documentChars.has(document)) return this.#documentChars.get(document);
		const text = createTextCodepoints();
		const queue = [document];
		while (queue.length > 0) {
			const node = queue.pop();
			if (node.type === "text") {
				addTextCodepoints(node.data, text);
				continue;
			}
			if (node.type === "tag") {
				if (NON_RENDERED_ELEMENTS.has(node.nodeName.toLowerCase())) continue;
				for (const attr of RENDERED_ATTRS) {
					const value = node.getAttribute(attr);
					if (value) addTextCodepoints(value, text);
				}
			}
			if ("children" in node) queue.push(...node.children);
		}
		const chars = toCodepointSet(text);
		this.#documentChars.set(document, chars);
		return chars;
	}
	/**
	* Font URLs already preloaded for a document, whether by beasties while
	* processing an earlier stylesheet or by the document itself.
	*/
	getPreloadedFonts(document) {
		let preloaded = this.#preloadedFonts.get(document);
		if (!preloaded) {
			preloaded = /* @__PURE__ */ new Set();
			for (const link of document.querySelectorAll("link[rel=\"preload\"][as=\"font\"]")) {
				const href = link.getAttribute("href");
				if (href) preloaded.add(href);
			}
			this.#preloadedFonts.set(document, preloaded);
		}
		return preloaded;
	}
	normalizeCssSelector(sel) {
		let normalizedSelector = this.#selectorCache.get(sel);
		if (normalizedSelector !== void 0) return normalizedSelector;
		normalizedSelector = normalizeCssSelector(sel);
		this.#selectorCache.set(sel, normalizedSelector);
		return normalizedSelector;
	}
};
function formatSize(size) {
	if (size <= 0) return "0 bytes";
	const abbreviations = [
		"bytes",
		"kB",
		"MB",
		"GB"
	];
	const index = Math.floor(Math.log(size) / Math.log(1024));
	const roundedSize = size / 1024 ** index;
	const fractionDigits = index === 0 ? 0 : 2;
	return `${roundedSize.toFixed(fractionDigits)} ${abbreviations[index]}`;
}
//#endregion
module.exports = Beasties;
