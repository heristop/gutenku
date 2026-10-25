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
//#region src/plan.ts
const ATTR_ACTIONS = [
	"exists",
	"equals",
	"element",
	"start",
	"end",
	"any",
	"hyphen"
];
/** Whether a value is a compact plan rather than a `CompiledSheet` */
function isCompactPlan(plan) {
	return Array.isArray(plan) && plan[0] === 1;
}
//#endregion
export { decodeEntities as a, parseUnicodeRanges as c, createTextCodepoints as i, toCodepointSet as l, isCompactPlan as n, normalizeFontFamily as o, addTextCodepoints as r, parseFontFamilies as s, ATTR_ACTIONS as t, unicodeRangeUsed as u };
