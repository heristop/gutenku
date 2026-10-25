/*!
* vue-router v5.4.0
* (c) 2026 Eduardo San Martin Morote
* @license MIT
*/
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
const require_options = require("./options-D14Nr6_1.cjs");
let unplugin = require("unplugin");
let scule = require("scule");
let node_fs = require("node:fs");
let tinyglobby = require("tinyglobby");
let _vue_macros_common = require("@vue-macros/common");
let pathe = require("pathe");
pathe = __toESM(pathe, 1);
let _vue_compiler_sfc = require("@vue/compiler-sfc");
let confbox_json5 = require("confbox/json5");
let confbox_yaml = require("confbox/yaml");
let chokidar = require("chokidar");
let picomatch = require("picomatch");
picomatch = __toESM(picomatch, 1);
let ast_walker_scope = require("ast-walker-scope");
let mlly = require("mlly");
let unplugin_utils = require("unplugin-utils");
let magic_string = require("magic-string");
magic_string = __toESM(magic_string, 1);
//#region src/unplugin/utils/encoding.ts
/**
* Encoding Rules (␣ = Space)
* - Path: ␣ " < > # ? { }
* - Query: ␣ " < > # & =
* - Hash: ␣ " < > `
*
* On top of that, the RFC3986 (https://tools.ietf.org/html/rfc3986#section-2.2)
* defines some extra characters to be encoded. Most browsers do not encode them
* in encodeURI https://github.com/whatwg/url/issues/369, so it may be safer to
* also encode `!'()*`. Leaving un-encoded only ASCII alphanumeric(`a-zA-Z0-9`)
* plus `-._~`. This extra safety should be applied to query by patching the
* string returned by encodeURIComponent encodeURI also encodes `[\]^`. `\`
* should be encoded to avoid ambiguity. Browsers (IE, FF, C) transform a `\`
* into a `/` if directly typed in. The _backtick_ (`````) should also be
* encoded everywhere because some browsers like FF encode it when directly
* written while others don't. Safari and IE don't encode ``"<>{}``` in hash.
*/
const HASH_RE = /#/g;
const IM_RE = /\?/g;
/**
* NOTE: It's not clear to me if we should encode the + symbol in queries, it
* seems to be less flexible than not doing so and I can't find out the legacy
* systems requiring this for regular requests like text/html. In the standard,
* the encoding of the plus character is only mentioned for
* application/x-www-form-urlencoded
* (https://url.spec.whatwg.org/#urlencoded-parsing) and most browsers seems lo
* leave the plus character as is in queries. To be more flexible, we allow the
* plus character on the query, but it can also be manually encoded by the user.
*
* Resources:
* - https://url.spec.whatwg.org/#urlencoded-parsing
* - https://stackoverflow.com/questions/1634271/url-encoding-the-space-character-or-20
*/
const ENC_BRACKET_OPEN_RE = /%5B/g;
const ENC_BRACKET_CLOSE_RE = /%5D/g;
const ENC_PIPE_RE = /%7C/g;
/**
* Encode characters that need to be encoded on the path, search and hash
* sections of the URL.
*
* @internal
* @param text - string to encode
* @returns encoded string
*/
function commonEncode(text) {
	return text == null ? "" : encodeURI("" + text).replace(ENC_PIPE_RE, "|").replace(ENC_BRACKET_OPEN_RE, "[").replace(ENC_BRACKET_CLOSE_RE, "]");
}
/**
* Encode characters that need to be encoded on the path section of the URL.
*
* @param text - string to encode
* @returns encoded string
*/
function encodePath(text) {
	return commonEncode(text).replace(HASH_RE, "%23").replace(IM_RE, "%3F");
}
//#endregion
//#region src/unplugin/core/treeNodeValue.ts
const RE_HEX_CHARS = /^[0-9a-fA-F]{2}$/;
const CONVENTION_OVERRIDE_NAME = "@@convention";
const EDITS_OVERRIDE_NAME = "@@edits";
var _TreeNodeValueBase = class {
	/**
	* flag based on the type of the segment
	*/
	_type;
	parent;
	/**
	* segment as defined by the file structure e.g. keeps the `index` name, `(group-name)`
	*/
	rawSegment;
	/**
	* transformed version of the segment into a vue-router path. e.g. `'index'` becomes `''` and `[param]` becomes
	* `:param`, `prefix-[param]-end` becomes `prefix-:param-end`.
	*/
	pathSegment;
	/**
	* Array of sub segments. This is usually one single elements but can have more for paths like `prefix-[param]-end.vue`
	*/
	subSegments;
	/**
	* Overrides defined by each file. The map is necessary to handle named views.
	*/
	_overrides = /* @__PURE__ */ new Map();
	/**
	* Merged result of `_overrides`. Reset by every method that writes to them.
	*/
	_mergedOverrides = null;
	/**
	* Params already warned about declaring a parser twice, so the warning is
	* emitted once per param even though `pathParams` is a getter.
	*/
	_warnedParsers = /* @__PURE__ */ new Set();
	_warnedRegexps = /* @__PURE__ */ new Set();
	/**
	* Ignored hash params last warned about, for the same reason.
	*/
	_warnedHashParams = "";
	/**
	* View name (Vue Router feature) mapped to their corresponding file. By default, the view name is `default` unless
	* specified with a `@` e.g. `index@aux.vue` will have a view name of `aux`.
	*/
	components = /* @__PURE__ */ new Map();
	constructor(rawSegment, parent, pathSegment = rawSegment, subSegments = [pathSegment]) {
		this._type = 0;
		this.rawSegment = rawSegment;
		this.pathSegment = pathSegment;
		this.subSegments = subSegments;
		this.parent = parent;
	}
	/**
	* Path of the node. Can be absolute or not. If it has been overridden, it
	* will return the overridden path.
	*/
	get path() {
		return this.overrides.path ?? this.pathSegment;
	}
	/**
	* Aliases of the node if any.
	*/
	get alias() {
		return this.overrides.alias ?? [];
	}
	/**
	* Full path of the node including parent nodes.
	*/
	get fullPath() {
		const pathSegment = this.path;
		if (require_options.isAbsolutePath(pathSegment)) return pathSegment;
		return require_options.joinPath(this.parent?.fullPath ?? "", pathSegment);
	}
	/**
	* Gets all the query params for the node. This does not include params from parent nodes.
	*/
	get queryParams() {
		const paramsQuery = this.overrides.params?.query;
		if (!paramsQuery) return [];
		const queryParams = [];
		for (var paramName in paramsQuery) {
			var config = paramsQuery[paramName];
			if (!config) continue;
			if (typeof config === "string") queryParams.push({
				type: "query",
				paramName,
				parser: config,
				format: null
			});
			else queryParams.push({
				type: "query",
				paramName,
				parser: config.parser || null,
				format: config.format || null,
				defaultValue: config.default,
				required: config.required
			});
		}
		return queryParams;
	}
	/**
	* Gets hash params declared on this node.
	*/
	get hashParams() {
		const hash = this.overrides.params?.hash ?? {};
		const paramNames = Object.keys(hash);
		const paramName = paramNames.at(-1);
		if (paramNames.length > 1) {
			const ignoredParamNames = paramNames.slice(0, -1).join(", ");
			if (this._warnedHashParams !== ignoredParamNames) {
				this._warnedHashParams = ignoredParamNames;
				require_options.diagnostics.VUE_ROUTER_B0022({
					segment: this.rawSegment,
					usedParamName: paramName,
					ignoredParamNames
				});
			}
		}
		let config = paramName ? hash[paramName] : void 0;
		if (typeof config === "string") config = { parser: config };
		return paramName && config ? [{
			type: "hash",
			paramName,
			parser: config.parser || null,
			defaultValue: config.default,
			required: config.required
		}] : [];
	}
	/**
	* Gets path, query, and hash params declared on this node.
	*/
	get params() {
		return [
			...this.pathParams,
			...this.queryParams,
			...this.hashParams
		];
	}
	/**
	* Gets the path params for the node. They come from the `path` override when
	* there is one, otherwise from the file based segment. Parsers declared in
	* `params.path` are applied on top. This does not include params from parent
	* nodes.
	*/
	get pathParams() {
		const overridePath = this.overrides.path;
		const params = [];
		if (overridePath) for (const segment of overridePath.split("/")) {
			if (!segment) continue;
			const [, segmentParams] = parseRawPathSegment(segment);
			params.push(...segmentParams);
		}
		else params.push(...this.subSegments.filter(isTreePathParam));
		const declaredParsers = this.overrides.params?.path;
		if (!declaredParsers) return params;
		return params.map((param) => {
			const declared = declaredParsers[param.paramName];
			const { parser, re } = declared && typeof declared === "object" ? declared : { parser: declared };
			if (re != null) param = {
				...param,
				re: this._validateParamRe(param, re)
			};
			if (parser === void 0) return param;
			if (parser && param.parser && !this._warnedParsers.has(param.paramName)) {
				this._warnedParsers.add(param.paramName);
				require_options.diagnostics.VUE_ROUTER_B0021({
					paramName: param.paramName,
					segment: this.rawSegment,
					filenameParser: param.parser,
					declaredParser: parser
				});
			}
			return {
				...param,
				parser
			};
		});
	}
	/**
	* Returns the regexp source if it can be used to match the param, `null`
	* otherwise.
	*/
	_validateParamRe(param, re) {
		let reason;
		if (param.isSplat) reason = "splat params always match everything";
		else try {
			re = new RegExp(re).source;
			if (new RegExp(re + "|").exec("").length - 1 > 0) reason = "it contains capturing groups, use `(?:...)` instead";
			else if (new RegExp(`^(?:${re})$`).test("")) reason = "it matches an empty value";
		} catch (err) {
			reason = err.message;
		}
		if (reason) {
			if (!this._warnedRegexps.has(param.paramName)) {
				this._warnedRegexps.add(param.paramName);
				require_options.diagnostics.VUE_ROUTER_B0023({
					paramName: param.paramName,
					segment: this.rawSegment,
					re,
					reason
				});
			}
			return null;
		}
		if (param.repeatable && !this._warnedRegexps.has(param.paramName)) {
			if (new RegExp(`^(?:${re})$`).test("/")) {
				this._warnedRegexps.add(param.paramName);
				require_options.diagnostics.VUE_ROUTER_B0024({
					paramName: param.paramName,
					segment: this.rawSegment,
					re
				});
			}
		}
		return re;
	}
	toString() {
		let value = "";
		if (!this.pathSegment) value += "<index>" + (this.rawSegment === "index" ? "" : " " + this.rawSegment);
		else value += this.pathSegment;
		if (this.alias.length) value += ` alias(${this.alias.join(", ")})`;
		return value;
	}
	isParam() {
		return !!(this._type & 2);
	}
	isStatic() {
		return this._type === 0;
	}
	isGroup() {
		return this._type === 1;
	}
	get overrides() {
		return this._mergedOverrides ??= [...this._overrides.entries()].sort(([nameA], [nameB]) => nameA === nameB ? 0 : nameA === "@@convention" || nameA !== "@@edits" && (nameA < nameB || nameB === "@@edits") ? -1 : 1).reduce((acc, [_path, routeBlock]) => {
			return require_options.mergeRouteRecordOverride(acc, routeBlock);
		}, {});
	}
	setOverride(filePath, routeBlock) {
		this._overrides.set(filePath, routeBlock || {});
		this._mergedOverrides = null;
	}
	/**
	* Remove all overrides for a given key.
	*
	* @param key - key to remove from the override, e.g. path, name, etc
	*/
	removeOverride(key) {
		for (const [_filePath, routeBlock] of this._overrides) delete routeBlock[key];
		this._mergedOverrides = null;
	}
	/**
	* Add an override to the current node by merging with the existing values.
	*
	* @param filePath - The file path to add to the override
	* @param routeBlock - The route block to add to the override
	*/
	mergeOverride(filePath, routeBlock) {
		const existing = this._overrides.get(filePath) || {};
		this._overrides.set(filePath, require_options.mergeRouteRecordOverride(existing, routeBlock));
		this._mergedOverrides = null;
	}
	/**
	* Add an override to the current node using the special file path `@@edits` that makes this added at build time.
	*
	* @param routeBlock -  The route block to add to the override
	*/
	addEditOverride(routeBlock) {
		return this.mergeOverride(EDITS_OVERRIDE_NAME, routeBlock);
	}
	/**
	* Set a specific value in the _edits_ override.
	*
	* @param key - key to set in the override, e.g. path, name, etc
	* @param value - value to set in the override
	*/
	setEditOverride(key, value) {
		if (!this._overrides.has("@@edits")) this._overrides.set(EDITS_OVERRIDE_NAME, {});
		const existing = this._overrides.get(EDITS_OVERRIDE_NAME);
		existing[key] = value;
		this._mergedOverrides = null;
	}
};
/**
* - Static
* - Static + Custom Param (subSegments)
* - Static + Param (subSegments)
* - Custom Param
* - Param
* - CatchAll
*/
/**
* Static path like `/users`, `/users/list`, etc
* @extends _TreeNodeValueBase
*/
var TreeNodeValueStatic = class extends _TreeNodeValueBase {
	_type = 0;
	score = [300];
	constructor(rawSegment, parent, pathSegment = rawSegment) {
		super(rawSegment, parent, pathSegment);
	}
};
var TreeNodeValueGroup = class extends _TreeNodeValueBase {
	_type = 1;
	groupName;
	score = [300];
	constructor(rawSegment, parent, pathSegment, groupName) {
		super(rawSegment, parent, pathSegment);
		this.groupName = groupName;
	}
};
function isTreeHashParam(param) {
	return typeof param !== "string" && param.type === "hash";
}
/**
* Checks if a path, query, or hash param is optional.
*
* @internal
*/
function isTreeParamOptional(param) {
	if (param.type === "path") return param.optional;
	return hasTreeParamDefault(param) || !param.required;
}
function hasTreeParamDefault(param) {
	return param.defaultValue !== void 0 && param.defaultValue !== "undefined";
}
/**
* Checks if a TreePathParam or TreeQueryParam is repeatable (array).
*
* @internal
*/
function isTreeParamRepeatable(param) {
	if (isTreeHashParam(param)) return false;
	if (param.type === "path") return param.repeatable;
	return param.format === "array";
}
/**
* Checks if a param is a TreePathParam.
*
* @internal
*/
function isTreePathParam(param) {
	return typeof param !== "string" && param.type === "path";
}
/**
* To escape regex characters in the path segment.
* @internal
*/
const REGEX_CHARS_RE = /[.+*?^${}()[\]/\\]/g;
/**
* Escapes regex characters in a string to be used in a regex pattern.
* @param str - The string to escape.
*
* @internal
*/
const escapeRegex = (str) => str.replace(REGEX_CHARS_RE, "\\$&");
var TreeNodeValueParam = class extends _TreeNodeValueBase {
	_type = 2;
	/**
	* @param rawSegment The raw segment as defined by the file structure, e.g.
	* `[id]`, `prefix-[param]-end`, etc.
	*
	* @param parent The parent node in the tree, if any.
	*
	* @param pathSegment The transformed version of the segment into a
	* vue-router path, e.g. `:id`, `prefix-:param-end`, etc.
	*
	* @param subSegments Array of sub segments. This is usually one single
	* element but can have more for paths like `prefix-[param]-end.vue`.
	*/
	constructor(rawSegment, parent, pathSegment, subSegments) {
		super(rawSegment, parent, pathSegment, subSegments);
	}
	get score() {
		return this.subSegments.map((segment) => {
			if (typeof segment === "string") return 300;
			else return 80 - (segment.isSplat ? 500 : (segment.optional ? 10 : 0) + (segment.repeatable ? 20 : 0));
		});
	}
	/**
	* Generates the regex pattern for the path segment.
	*/
	get re() {
		const customRegexps = new Map(this.pathParams.map((param) => [param.paramName, param.re]));
		let regexp = "";
		for (var i = 0; i < this.subSegments.length; i++) {
			var segment = this.subSegments[i];
			if (!segment) continue;
			if (typeof segment === "string") regexp += escapeRegex(segment);
			else if (segment.isSplat) regexp += "(.*)";
			else {
				var customRe = customRegexps.get(segment.paramName);
				var re = customRe ? segment.repeatable ? `((?:${customRe})(?:\\/(?:${customRe}))*)` : `(${customRe})` : segment.repeatable ? "(.+?)" : "([^/]+?)";
				if (segment.optional) {
					var prevSegment = this.subSegments[i - 1];
					if ((!prevSegment || typeof prevSegment === "string" && prevSegment.endsWith("/")) && this.subSegments.length > 1) {
						re = `(?:\\/${re})?`;
						regexp = regexp.slice(0, -2);
					} else re += "?";
				}
				regexp += re;
			}
		}
		return regexp;
	}
	toString() {
		const params = this.params.length > 0 ? ` 𝑥(` + this.params.map((p) => (p.type === "query" ? "?" : "") + `${p.paramName}${p.type === "path" ? p.modifier : ""}` + (p.parser ? "=" + p.parser : "")).join(", ") + ")" : "";
		return `${this.pathSegment}` + params;
	}
};
/**
* Resolves the options for the TreeNodeValue.
*
* @param options - options to resolve
* @returns resolved options
*/
function resolveTreeNodeValueOptions(options) {
	return {
		format: "file",
		dotNesting: true,
		...options
	};
}
/**
* Creates a new TreeNodeValue based on the segment. The result can be a static segment, group segment or a param segment.
*
* @param segment - path segment
* @param parent - parent node
* @param options - options
*/
function createTreeNodeValue(segment, parent, opts = {}) {
	if (!segment || segment === "index") return new TreeNodeValueStatic(segment, parent, "");
	const options = resolveTreeNodeValueOptions(opts);
	const openingPar = segment.indexOf("(");
	if (options.format === "file" && openingPar >= 0) {
		let groupName;
		const closingPar = segment.lastIndexOf(")");
		if (closingPar < 0 || closingPar < openingPar) {
			require_options.diagnostics.VUE_ROUTER_B0010({ segment });
			return new TreeNodeValueStatic(segment, parent, segment);
		}
		groupName = segment.slice(openingPar + 1, closingPar);
		const before = segment.slice(0, openingPar);
		const after = segment.slice(closingPar + 1);
		if (!before && !after) return new TreeNodeValueGroup(segment, parent, "", groupName);
	}
	const [pathSegment, pathParams, subSegments] = options.format === "path" ? parseRawPathSegment(segment) : parseFileSegment(segment, options);
	if (pathParams.length) return new TreeNodeValueParam(segment, parent, pathSegment, subSegments);
	return new TreeNodeValueStatic(segment, parent, pathSegment);
}
const IS_VARIABLE_CHAR_RE = /[0-9a-zA-Z_]/;
/**
* Parses a segment into the route path segment and the extracted params.
*
* @param segment - segment to parse without the extension
* @returns - the pathSegment and the params
*/
function parseFileSegment(segment, { dotNesting }) {
	let buffer = "";
	let paramParserBuffer = "";
	let state = 0;
	const params = [];
	let pathSegment = "";
	const subSegments = [];
	let currentTreeRouteParam = createEmptyRouteParam();
	let pos = 0;
	let c;
	function consumeBuffer() {
		if (state === 0) {
			const encodedBuffer = buffer.split("/").map((part) => encodePath(part)).join("/");
			pathSegment += encodedBuffer;
			subSegments.push(encodedBuffer);
		} else if (state === 4) {
			currentTreeRouteParam.paramName = buffer;
			currentTreeRouteParam.parser = paramParserBuffer || null;
			currentTreeRouteParam.modifier = currentTreeRouteParam.optional ? currentTreeRouteParam.repeatable ? "*" : "?" : currentTreeRouteParam.repeatable ? "+" : "";
			buffer = "";
			paramParserBuffer = "";
			pathSegment += `:${currentTreeRouteParam.paramName}${currentTreeRouteParam.isSplat ? "(.*)" : pos < segment.length - 1 && IS_VARIABLE_CHAR_RE.test(segment[pos + 1]) ? "()" : ""}${currentTreeRouteParam.modifier}`;
			params.push(currentTreeRouteParam);
			subSegments.push(currentTreeRouteParam);
			currentTreeRouteParam = createEmptyRouteParam();
		} else if (state === 5) {
			if (buffer.length !== 2) throw new SyntaxError(`Invalid character code in segment "${segment}". Hex code must be exactly 2 digits, got "${buffer}"`);
			if (!RE_HEX_CHARS.test(buffer)) throw new SyntaxError(`Invalid hex code "${buffer}" in segment "${segment}"`);
			const char = String.fromCharCode(parseInt(buffer, 16));
			pathSegment += char;
			subSegments.push(char);
		}
		buffer = "";
	}
	for (pos = 0; pos < segment.length; pos++) {
		c = segment[pos];
		if (state === 0) {
			if (c === "[") {
				if (buffer) consumeBuffer();
				state = 1;
			} else buffer += dotNesting && c === "." ? "/" : c;
		} else if (state === 1) {
			if (c === "[") currentTreeRouteParam.optional = true;
			else if (c === ".") {
				currentTreeRouteParam.isSplat = true;
				pos += 2;
			} else buffer += c;
			state = 2;
		} else if (state === 2) {
			if (c === "]") {
				if (currentTreeRouteParam.optional) pos++;
				state = 4;
			} else if (c === ".") {
				currentTreeRouteParam.isSplat = true;
				pos += 2;
			} else if (c === "=") {
				state = 3;
				paramParserBuffer = "";
			} else if (c === "+" && buffer === "x" && !currentTreeRouteParam.isSplat && !currentTreeRouteParam.optional) {
				buffer = "";
				state = 5;
			} else buffer += c;
		} else if (state === 4) {
			if (c === "+") currentTreeRouteParam.repeatable = true;
			else pos--;
			consumeBuffer();
			state = 0;
		} else if (state === 3) {
			if (c === "]") {
				if (currentTreeRouteParam.optional) pos++;
				state = 4;
			} else paramParserBuffer += c;
		} else if (state === 5) {
			if (c === "]") {
				consumeBuffer();
				state = 0;
			} else buffer += c;
		}
	}
	if (state === 2 || state === 1 || state === 3 || state === 5) throw new SyntaxError(`Invalid segment: "${segment}"`);
	if (buffer) consumeBuffer();
	return [
		pathSegment,
		params,
		subSegments
	];
}
const IS_MODIFIER_RE = /[+*?]/;
/**
* Parses a raw path segment like the `:id` in a route `/users/:id`.
*
* @param segment - segment to parse without the extension
* @returns - the pathSegment and the params
*/
function parseRawPathSegment(segment) {
	let buffer = "";
	let state = 0;
	const params = [];
	const subSegments = [];
	let currentTreeRouteParam = createEmptyRouteParam();
	let pos = 0;
	let c;
	function consumeBuffer() {
		if (state === 0) subSegments.push(buffer);
		else if (state === 1 || state === 2 || state === 3) {
			if (!currentTreeRouteParam.paramName) {
				require_options.diagnostics.VUE_ROUTER_B0011({ segment });
				currentTreeRouteParam.paramName = "pathMatch";
			}
			subSegments.push(currentTreeRouteParam);
			params.push(currentTreeRouteParam);
			currentTreeRouteParam = createEmptyRouteParam();
		}
		buffer = "";
	}
	for (pos = 0; pos < segment.length; pos++) {
		c = segment[pos];
		if (c === "\\") {
			pos++;
			buffer += segment[pos];
			continue;
		}
		if (state === 0) {
			if (c === ":") {
				consumeBuffer();
				state = 1;
			} else buffer += c;
		} else if (state === 1) {
			if (c === "(") {
				currentTreeRouteParam.paramName = buffer;
				buffer = "";
				state = 2;
			} else if (IS_MODIFIER_RE.test(c)) {
				currentTreeRouteParam.modifier = c;
				currentTreeRouteParam.optional = c === "?" || c === "*";
				currentTreeRouteParam.repeatable = c === "+" || c === "*";
				consumeBuffer();
				state = 0;
			} else if (IS_VARIABLE_CHAR_RE.test(c)) {
				buffer += c;
				currentTreeRouteParam.paramName = buffer;
			} else {
				currentTreeRouteParam.paramName = buffer;
				consumeBuffer();
				pos--;
				state = 0;
			}
		} else if (state === 2) {
			if (c === ")") {
				if (buffer === ".*") currentTreeRouteParam.isSplat = true;
				state = 3;
			} else buffer += c;
		} else if (state === 3) {
			if (IS_MODIFIER_RE.test(c)) {
				currentTreeRouteParam.modifier = c;
				currentTreeRouteParam.optional = c === "?" || c === "*";
				currentTreeRouteParam.repeatable = c === "+" || c === "*";
			} else pos--;
			consumeBuffer();
			state = 0;
		}
	}
	if (state === 2) throw new Error(`Invalid segment: "${segment}"`);
	if (buffer || state === 3) consumeBuffer();
	return [
		segment,
		params,
		subSegments
	];
}
/**
* Helper function to create an empty route param used by the parser.
*
* @returns an empty route param
*/
function createEmptyRouteParam() {
	return {
		type: "path",
		paramName: "",
		parser: null,
		modifier: "",
		optional: false,
		repeatable: false,
		isSplat: false,
		re: null
	};
}
//#endregion
//#region src/unplugin/core/tree.ts
var TreeNode = class TreeNode {
	/**
	* value of the node
	*/
	value;
	/**
	* children of the node
	*/
	children = /* @__PURE__ */ new Map();
	/**
	* Parent node.
	*/
	parent;
	/**
	* Plugin options taken into account by the tree.
	*/
	options;
	/**
	* Set of file paths that use `definePage()` with runtime properties (meta, props, etc.) that require a `?definePage`
	* import at build time. Tracked per-file to avoid race conditions when multiple files (e.g. named views) map to the
	* same node.
	*/
	_needsDefinePageImport = /* @__PURE__ */ new Set();
	/**
	* Whether at least one component file uses `definePage()` with runtime properties (meta, props, etc.) that require a
	* `?definePage` import at build time.
	*/
	get needsDefinePageImport() {
		return this._needsDefinePageImport.size > 0;
	}
	/**
	* Mark whether a file needs a `?definePage` import.
	*/
	setDefinePageImport(filePath, needsImport) {
		if (needsImport) this._needsDefinePageImport.add(filePath);
		else this._needsDefinePageImport.delete(filePath);
	}
	/**
	* Check if a specific file needs a `?definePage` import.
	*/
	fileNeedsDefinePageImport(filePath) {
		return this._needsDefinePageImport.has(filePath);
	}
	/**
	* Creates a new tree node.
	*
	* @param options - TreeNodeOptions shared by all nodes
	* @param pathSegment - path segment of this node e.g. `users` or `:id`
	* @param parent
	*/
	constructor(options, pathSegment, parent) {
		this.options = options;
		this.parent = parent;
		this.value = createTreeNodeValue(pathSegment, parent?.value, options.treeNodeOptions || options.pathParser);
	}
	/**
	* Adds a path to the tree. `path` cannot start with a `/`.
	*
	* @param path - path segment to insert. **It shouldn't contain the file extension**
	* @param filePath - file path, must be a file (not a folder)
	*/
	insert(path, filePath) {
		const { tail, segment, viewName } = splitFilePath(path);
		if (segment === "_parent" && !tail) {
			this.value.setOverride(CONVENTION_OVERRIDE_NAME, { name: false });
			this.value.components.set(viewName, filePath);
			return this;
		}
		if (!this.children.has(segment)) this.children.set(segment, new TreeNode(this.options, segment, this));
		const child = this.children.get(segment);
		if (!tail) child.value.components.set(viewName, filePath);
		else return child.insert(tail, filePath);
		return child;
	}
	/**
	* Adds a path that has already been parsed to the tree. `path` cannot start with a `/`. This method is similar to
	* `insert` but the path argument should be already parsed. e.g. `users/:id` for a file named `users/[id].vue`.
	*
	* @param path - path segment to insert, already parsed (e.g. users/:id)
	* @param filePath - file path, defaults to path for convenience and testing
	*/
	insertParsedPath(path, filePath = path) {
		const node = new TreeNode({
			...this.options,
			treeNodeOptions: {
				...this.options.pathParser,
				format: "path"
			}
		}, path, this);
		this.children.set(path, node);
		node.value.components.set("default", filePath);
		return node;
	}
	/**
	* Saves a custom route block for a specific file path. The file path is used
	* as a key. Some special file paths will have a lower or higher priority.
	*
	* @param filePath - file path where the custom block is located
	* @param routeBlock - custom block to set
	*/
	setCustomRouteBlock(filePath, routeBlock) {
		this.value.setOverride(filePath, routeBlock);
	}
	/**
	* Generator that yields all descendants without sorting.
	* Use with Array.from() for now, native .map() support in Node 22+.
	*/
	*getChildrenDeep() {
		for (const child of this.children.values()) {
			yield child;
			yield* child.getChildrenDeep();
		}
	}
	/**
	* Comparator function for sorting TreeNodes.
	*
	* @internal
	*/
	static compare(a, b) {
		return a.path.localeCompare(b.path, "en") || a.value.rawSegment.localeCompare(b.value.rawSegment, "en");
	}
	/**
	* Get the children of this node sorted by their path.
	*/
	getChildrenSorted() {
		return Array.from(this.children.values()).sort(TreeNode.compare);
	}
	/**
	* Calls {@link getChildrenDeep} and sorts the result by path in the end.
	*/
	getChildrenDeepSorted() {
		return Array.from(this.getChildrenDeep()).sort(TreeNode.compare);
	}
	/**
	* Delete a child node. If the child node has no more children and no
	* components, it will be deleted as well. This is used to recursively delete
	* empty nodes after removing a route.
	*
	* @param child - child node to delete
	*/
	deleteChild(child) {
		this.children.delete(child.value.rawSegment);
		if (!this.isRoot() && !this.isMatchable() && this.children.size === 0) this.delete();
	}
	/**
	* Delete and detach itself from the tree.
	*/
	delete() {
		if (this.isRoot()) throw new Error("Cannot delete the root node.");
		this.parent?.deleteChild(this);
		this.parent = void 0;
	}
	/**
	* Remove a route from the tree. The path shouldn't start with a `/` but it can be a nested one. e.g. `foo/bar`.
	* The `path` should be relative to the page folder.
	*
	* @param path - path segment of the file
	*/
	remove(path) {
		const { tail, segment, viewName } = splitFilePath(path);
		if (segment === "_parent" && !tail) {
			this.value.components.delete(viewName);
			return;
		}
		const child = this.children.get(segment);
		if (!child) throw new Error(`Cannot Delete "${path}". "${segment}" not found at "${this.path}".`);
		if (tail) {
			child.remove(tail);
			if (child.children.size === 0 && child.value.components.size === 0) this.children.delete(segment);
		} else {
			child.value.components.delete(viewName);
			if (child.children.size === 0 && child.value.components.size === 0) this.children.delete(segment);
		}
	}
	/**
	* Returns the route path of the node without parent paths. If the path was overridden, it returns the override.
	*/
	get path() {
		return this.value.overrides.path ?? (this.parent?.isRoot() ? "/" : "") + this.value.pathSegment;
	}
	/**
	* Returns the route path of the node including parent paths.
	*/
	get fullPath() {
		return this.value.fullPath;
	}
	/**
	* Returns the alias of the node
	*/
	get alias() {
		return this.value.alias;
	}
	/**
	* Object of components (filepaths) for this node.
	*/
	get components() {
		return Object.fromEntries(this.value.components.entries());
	}
	/**
	* Does this node render any component?
	*/
	get hasComponents() {
		return this.value.components.size > 0;
	}
	/**
	* Returns the route name of the node. If the name was overridden, it returns the override.
	*/
	get name() {
		const overrideName = this.value.overrides.name;
		return overrideName === void 0 ? this.options.getRouteName(this) : overrideName;
	}
	/**
	* Returns the meta property as an object.
	*/
	get metaAsObject() {
		return { ...this.value.overrides.meta };
	}
	/**
	* Returns the JSON string of the meta object of the node. If the meta was overridden, it returns the override. If
	* there is no override, it returns an empty string.
	*/
	get meta() {
		const overrideMeta = this.metaAsObject;
		return Object.keys(overrideMeta).length > 0 ? JSON.stringify(overrideMeta, null, 2) : "";
	}
	/**
	* Hash params declared by this node. Parent hash params are not inherited.
	*/
	get hashParams() {
		return this.value.hashParams;
	}
	/**
	* Inherited path and query params, followed by this node's hash params.
	*/
	get params() {
		return [
			...this.pathParams,
			...this.queryParams,
			...this.hashParams
		];
	}
	/**
	* Array of route params coming from the path. It includes all the params
	* from the parents as well. Use `node.value.pathParams` for the ones
	* declared by this specific node.
	*/
	get pathParams() {
		const params = this.value.pathParams;
		if (this.value.overrides.path?.startsWith("/")) return params;
		let node = this.parent;
		while (node) {
			params.unshift(...node.value.pathParams);
			if (node.value.overrides.path?.startsWith("/")) break;
			node = node.parent;
		}
		return params;
	}
	/**
	* Array of query params extracted from definePage. It includes all the query
	* params from the parents as well. Use `node.value.queryParams` for the ones
	* declared by this specific node.
	*/
	get queryParams() {
		const params = [...this.value.queryParams];
		let node = this.parent;
		while (node) {
			params.unshift(...node.value.queryParams);
			node = node.parent;
		}
		return params;
	}
	/**
	* Generates a regexp based on this node and its parents. This regexp is used by the custom resolver
	*/
	get regexp() {
		let node = this;
		const nodeList = [];
		while (node && !node.isRoot()) {
			nodeList.unshift(node);
			node = node.parent;
		}
		let re = "";
		for (var i = 0; i < nodeList.length; i++) {
			node = nodeList[i];
			if (node.value.isParam()) {
				var nodeRe = node.value.re;
				if ((re || i < nodeList.length - 1) && node.value.subSegments.length === 1 && node.value.subSegments.at(0).optional) re += `(?:\\/${nodeRe.slice(0, -1)})?`;
				else re += (re ? "\\/" : "") + nodeRe;
			} else if (node.value.pathSegment) re += (re ? "\\/" : "") + escapeRegex(node.value.pathSegment);
		}
		return "/^" + (re.startsWith("(?:\\/") ? "" : "\\/") + re.replace(require_options.ESCAPED_TRAILING_SLASH_RE, "") + "$/i";
	}
	/**
	* Score of the path used for sorting routes.
	*/
	get score() {
		const scores = [];
		let node = this;
		while (node && !node.isRoot()) {
			scores.unshift(node.value.score);
			node = node.parent;
		}
		return scores;
	}
	/**
	* True if the last segment of the path is a splat (catch-all) param e.g.
	* /some/thing/:path(.*). Useful to compute the trailing slash behavior of
	* the route.
	*/
	get endsWithSplat() {
		const lastSegment = this.value.subSegments.at(-1);
		return !!lastSegment && isTreePathParam(lastSegment) && lastSegment.isSplat;
	}
	/**
	* Returns an array of matcher parts that is consumed by
	* MatcherPatternPathDynamic to render the path.
	*/
	get matcherPatternPathDynamicParts() {
		const parts = [];
		let node = this;
		while (node && !node.isRoot()) {
			if (!node.value.pathSegment) {
				node = node.parent;
				continue;
			}
			const subSegments = node.value.subSegments.map((segment) => typeof segment === "string" ? segment : segment.isSplat ? 0 : 1);
			if (subSegments.length > 1) parts.unshift(subSegments);
			else if (subSegments.length === 1) parts.unshift(subSegments[0]);
			node = node.parent;
		}
		return parts;
	}
	/**
	* Is this tree node matchable? A matchable node has at least one component
	* and a name.
	*/
	isMatchable() {
		return this.value.components.size > 0 && this.name !== false;
	}
	/**
	* Returns wether this tree node is the root node of the tree.
	*
	* @returns true if the node is the root node
	*/
	isRoot() {
		return !this.parent && this.value.fullPath === "/" && !this.value.components.size;
	}
	/**
	* Returns wether this tree node has a name. This allows to coerce the type
	* of TreeNode
	*/
	isNamed() {
		return !!this.name;
	}
	toString() {
		return `${this.isRoot() ? "·" : this.value}${this.value.components.size > 1 || this.value.components.size === 1 && !this.value.components.get("default") ? ` ⎈(${Array.from(this.value.components.keys()).join(", ")})` : ""}${this.needsDefinePageImport ? " ⚑ definePage()" : ""}`;
	}
	/**
	* Iterates over the tree in a breadth-first way. It first yields the direct
	* children of the node, then their children and so on. The order of the
	* children is not guaranteed.
	*/
	*[Symbol.iterator]() {
		for (const [_name, child] of this.children) yield child;
		for (const [_name, child] of this.children) yield* child[Symbol.iterator]();
	}
};
/**
* Creates a new prefix tree. This is meant to only be the root node. It has access to extra methods that only make
* sense on the root node.
*/
var PrefixTree = class extends TreeNode {
	map = /* @__PURE__ */ new Map();
	constructor(options) {
		super(options, "");
	}
	insert(path, filePath) {
		const node = super.insert(path, filePath);
		this.map.set(filePath, node);
		return node;
	}
	/**
	* Returns the tree node of the given file path.
	*
	* @param filePath - file path of the tree node to get
	*/
	getChild(filePath) {
		return this.map.get(filePath);
	}
	/**
	* Removes the tree node of the given file path.
	*
	* @param filePath - file path of the tree node to remove
	*/
	removeChild(filePath) {
		if (this.map.has(filePath)) {
			const node = this.map.get(filePath);
			const components = node.value.components;
			for (const [viewName, componentPath] of components) if (componentPath === filePath) {
				components.delete(viewName);
				break;
			}
			node.setDefinePageImport(filePath, false);
			this.map.delete(filePath);
			if (node.children.size === 0 && node.value.components.size === 0) {
				node.delete();
				for (const [key, mappedNode] of this.map) if (mappedNode === node) this.map.delete(key);
			}
		}
	}
};
/**
* Returns a list of tree nodes that create the same route, the last one in the
* list is the one that takes precedence. This is used to warn about duplicated
* routes.
*
* @param tree - prefix tree to scan
*/
function collectDuplicatedRouteNodes(tree) {
	const seen = /* @__PURE__ */ new Map();
	const treeNodes = new Set(...tree);
	for (const [filePath, node] of tree.map) {
		const key = `${node.fullPath}::${node.toString()}`;
		let nodes = seen.get(key);
		if (!nodes) {
			nodes = [];
			seen.set(key, nodes);
		}
		nodes.push({
			filePath,
			node
		});
	}
	return Array.from(seen.values()).filter((nodes) => nodes.length > nodes[0].node.value.components.size).map((nodes) => nodes.toSorted(({ node: a }, { node: b }) => {
		if (treeNodes.has(a) && !treeNodes.has(b)) return -1;
		else if (!treeNodes.has(a) && treeNodes.has(b)) return 1;
		else return 0;
	}));
}
/**
* Splits a path into by finding the first '/' and returns the tail and segment. If it has an extension, it removes it.
* If it contains a named view, it returns the view name as well (otherwise it's default).
*
* @param filePath - filePath to split
*/
function splitFilePath(filePath) {
	const slashPos = filePath.indexOf("/");
	let head = slashPos < 0 ? filePath : filePath.slice(0, slashPos);
	const tail = slashPos < 0 ? "" : filePath.slice(slashPos + 1);
	let segment = head;
	let viewName = "default";
	const namedSeparatorPos = segment.indexOf("@");
	if (namedSeparatorPos > 0) {
		viewName = segment.slice(namedSeparatorPos + 1);
		segment = segment.slice(0, namedSeparatorPos);
	}
	return {
		segment,
		tail,
		viewName
	};
}
//#endregion
//#region src/unplugin/codegen/generateParamParsers.ts
const NATIVE_PARAM_PARSERS = [
	"int",
	"bool",
	"string"
];
const NATIVE_PARAM_PARSERS_TYPES = {
	int: "number",
	bool: "boolean",
	string: "string"
};
const RAW_PARAM_PARSER_DEFINER = "defineParamParserRaw";
const PARAM_PARSER_MODULE = "vue-router/experimental";
function isInitRawCall(declarator, rawLocalName) {
	const init = declarator.init;
	return !!init && init.type === "CallExpression" && init.callee.type === "Identifier" && init.callee.name === rawLocalName;
}
/**
* Detects whether a param parser source file declares its `parser` export via
* `defineParamParserRaw` (from `vue-router/experimental`). Aliased imports are
* supported.
*
* Returns `false` when the file doesn't import the raw definer, when the
* `parser` export uses something else, or when the source can't be parsed.
*
* @internal
*/
function isRawParamParserSource(source, filename = "parser.ts") {
	let ast;
	try {
		ast = (0, _vue_macros_common.babelParse)(source, /\.tsx?$/.test(filename) ? "ts" : "js");
	} catch {
		return false;
	}
	let rawLocalName = null;
	for (const node of ast.body) {
		if (node.type !== "ImportDeclaration") continue;
		const imp = node;
		if (imp.source.value !== PARAM_PARSER_MODULE) continue;
		for (const spec of imp.specifiers) if (spec.type === "ImportSpecifier" && spec.imported.type === "Identifier" && spec.imported.name === RAW_PARAM_PARSER_DEFINER) {
			rawLocalName = spec.local.name;
			break;
		}
		if (rawLocalName) break;
	}
	if (!rawLocalName) return false;
	const rawLocals = /* @__PURE__ */ new Set();
	for (const node of ast.body) if (node.type === "VariableDeclaration") {
		for (const declarator of node.declarations) if (declarator.id.type === "Identifier" && isInitRawCall(declarator, rawLocalName)) rawLocals.add(declarator.id.name);
	}
	let isRaw = false;
	(0, _vue_macros_common.walkAST)(ast, { enter(node) {
		if (isRaw) return;
		if (node.type !== "ExportNamedDeclaration") return;
		const exportNode = node;
		if (exportNode.source) {
			if (exportNode.specifiers.some((spec) => spec.type === "ExportSpecifier" && spec.exported.type === "Identifier" && spec.exported.name === "parser")) require_options.diagnostics.VUE_ROUTER_B0018({
				filename,
				source: exportNode.source.value
			});
			return;
		}
		if (exportNode.declaration?.type === "VariableDeclaration") {
			const decl = exportNode.declaration;
			for (const declarator of decl.declarations) if (declarator.id.type === "Identifier" && declarator.id.name === "parser" && isInitRawCall(declarator, rawLocalName)) {
				isRaw = true;
				return;
			}
			return;
		}
		for (const spec of exportNode.specifiers) if (spec.type === "ExportSpecifier" && spec.exported.type === "Identifier" && spec.exported.name === "parser" && spec.local.type === "Identifier" && rawLocals.has(spec.local.name)) {
			isRaw = true;
			return;
		}
	} });
	return isRaw;
}
/**
* Reads a param parser file from disk and registers (or replaces) the matching
* entry in `paramParsersMap`. Used by both the initial scan and the watcher's
* `add` handler.
*
* @internal
*/
async function addParamParserToMap(file, folder, dtsDir, paramParsersMap) {
	const fileName = (0, pathe.parse)(file).name;
	const name = (0, scule.camelCase)(fileName);
	const absolutePath = (0, pathe.resolve)(folder, file);
	const source = await node_fs.promises.readFile(absolutePath, "utf8");
	paramParsersMap.set(fileName, {
		name,
		typeName: `Param_${name}`,
		absolutePath,
		relativePath: (0, pathe.relative)(dtsDir, absolutePath),
		isRaw: isRawParamParserSource(source, absolutePath)
	});
}
/**
* Scans a folder for param parser files matching `include` while filtering out `exclude`.
* Only flat matches are returned (no nested folders). Exported solely to make this
* filesystem-touching behavior testable.
*
* @internal
*/
function scanParamParserFiles(folder, include, exclude) {
	if (!include.length) return Promise.resolve([]);
	return (0, tinyglobby.glob)(include, {
		cwd: folder,
		onlyFiles: true,
		ignore: exclude,
		expandDirectories: false
	});
}
function warnMissingParamParsers(tree, paramParsers) {
	for (const node of tree.getChildrenDeepSorted()) for (const param of node.params) if (param.parser && !paramParsers.has(param.parser)) {
		if (!NATIVE_PARAM_PARSERS.includes(param.parser)) require_options.diagnostics.VUE_ROUTER_B0019({
			parser: param.parser,
			fullPath: node.fullPath
		});
	}
}
/**
* Walks the route tree and returns the set of parser names referenced by any
* path or query param. Native parser names (`int`, `bool`) and references to
* parsers not present on disk are included as-is, leaving the decision of
* how to handle them to the caller.
*/
function collectUsedParamParserNames(tree) {
	const used = /* @__PURE__ */ new Set();
	for (const node of tree.getChildrenDeepSorted()) for (const param of node.params) if (param.parser) used.add(param.parser);
	return used;
}
function collectMissingParamParsers(tree, paramParsers) {
	const missing = [];
	for (const node of tree.getChildrenDeepSorted()) for (const param of node.params) if (param.parser && !paramParsers.has(param.parser)) {
		if (!NATIVE_PARAM_PARSERS.includes(param.parser)) missing.push({
			parser: param.parser,
			routePath: node.fullPath,
			filePaths: Array.from(node.value.components.values())
		});
	}
	return missing;
}
function generateParamParsersTypesDeclarations(paramParsers) {
	return Array.from(paramParsers.values()).map(({ typeName, relativePath }) => {
		return `type ${typeName} = _ExtractParamParserType<typeof import('${relativePath.startsWith(".") ? relativePath : "./" + relativePath}').parser>`;
	}).sort().join("\n");
}
function generateParamsTypes(params, parparsersMap) {
	return params.map((param) => {
		if (param.parser) {
			if (parparsersMap.has(param.parser)) return parparsersMap.get(param.parser).typeName;
			else if (param.parser in NATIVE_PARAM_PARSERS_TYPES) return NATIVE_PARAM_PARSERS_TYPES[param.parser];
		}
		return null;
	});
}
function generateParamParserOptions(param, importsMap, paramParsers) {
	if (!param.parser) return "";
	if (paramParsers.has(param.parser)) {
		const { name } = paramParsers.get(param.parser);
		return `_normalized_PARAM_PARSER__${name}`;
	} else if (param.parser === "string") return "";
	else if (NATIVE_PARAM_PARSERS.includes(param.parser)) {
		const varName = `PARAM_PARSER_${param.parser.toUpperCase()}`;
		importsMap.add("vue-router/experimental", varName);
		return varName;
	}
	return "";
}
function generateNormalizedParamParsersDeclarations(paramParsers, importsMap) {
	const declarations = [];
	for (const [, { name, absolutePath }] of paramParsers) {
		const rawVar = `PARAM_PARSER__${name}`;
		const normalizedVar = `_normalized_PARAM_PARSER__${name}`;
		importsMap.add("vue-router/experimental", "_normalizeParamParser");
		importsMap.add(absolutePath, {
			name: "parser",
			as: rawVar
		});
		declarations.push(`const ${normalizedVar} = _normalizeParamParser(${rawVar})`);
	}
	return declarations.join("\n");
}
/**
* Generates one entry per registered custom parser for the
* `TypesConfig._ParamParsers` augmentation, e.g.
* `'date': { type: Param_date }`. Returns an empty array when there are no
* custom parsers so the consumer can emit an empty object literal.
*/
function generateCustomParamParsersList(paramParsers) {
	return Array.from(paramParsers.entries()).sort(([a], [b]) => a < b ? -1 : a > b ? 1 : 0).map(([key, { typeName }]) => `${require_options.toStringLiteral(key)}: { type: ${typeName} }`);
}
function generatePathParamsOptions(params, importsMap, paramParsers) {
	const paramOptions = params.map((param) => {
		const optionList = [];
		const parser = generateParamParserOptions(param, importsMap, paramParsers);
		optionList.push(parser || `/* no parser */`);
		if (param.optional || param.repeatable) optionList.push(`/* repeatable: ` + (param.repeatable ? `*/ true` : `false */`));
		if (param.optional) optionList.push(`/* optional: ` + (param.optional ? `*/ true` : `false */`));
		return `
${param.paramName}: [${optionList.join(", ")}],
`.slice(1, -1);
	});
	return paramOptions.length === 0 ? "{}" : `{
      ${paramOptions.join("\n      ")}
    }`;
}
//#endregion
//#region src/unplugin/codegen/generateRouteParams.ts
const NON_NULL_EXPRESSIONS = /* @__PURE__ */ new Set([
	"StringLiteral",
	"TemplateLiteral",
	"BooleanLiteral",
	"NumericLiteral",
	"BigIntLiteral",
	"UnaryExpression",
	"ArrayExpression",
	"ObjectExpression"
]);
/**
* `definePage()` constrains hash defaults to `T | null` or a factory of it,
* so only a possible `null` widens the type. Unknown values, like page-local
* bindings, are assumed to be nullable.
*/
function mayHashDefaultBeNull(defaultValue) {
	const statement = (0, _vue_macros_common.babelParse)(`(\n${defaultValue}\n)`, "ts").body[0];
	if (statement?.type !== "ExpressionStatement") return true;
	let expression = statement.expression;
	if (expression.type === "ArrowFunctionExpression" || expression.type === "FunctionExpression") {
		const body = expression.body;
		if (body.type !== "BlockStatement") expression = body;
		else if (body.body.length === 1 && body.body[0]?.type === "ReturnStatement" && body.body[0].argument) expression = body.body[0].argument;
		else return true;
	}
	return mayExpressionBeNull(expression);
}
function mayExpressionBeNull(expression) {
	return expression.type === "ConditionalExpression" ? mayExpressionBeNull(expression.consequent) || mayExpressionBeNull(expression.alternate) : !NON_NULL_EXPRESSIONS.has(expression.type);
}
/**
* Prepares params to be rendered as a type: params without a name are dropped
* and reported as they would generate invalid types. A param can also be
* declared more than once across the chain of records, and duplicated keys are
* invalid in a type literal, so the deepest declaration wins like at runtime.
* Params are then sorted by name to keep the generated types stable.
*
* @internal
*/
function normalizeParamsForTypes(node, params) {
	const byName = /* @__PURE__ */ new Map();
	for (const param of params) {
		if (!param.paramName) {
			require_options.diagnostics.VUE_ROUTER_B0017({
				fullPath: node.fullPath,
				path: node.path
			});
			continue;
		}
		byName.set(param.paramName, param);
	}
	return Array.from(byName.values()).sort((a, b) => a.paramName < b.paramName ? -1 : a.paramName > b.paramName ? 1 : 0);
}
/**
* @param nodeParams - path params already normalized with `normalizeParamsForTypes()`. This version does not support query params.
* @param isRaw - whether to generate the type accepted when pushing
*/
function generateRouteParams(nodeParams, isRaw) {
	return nodeParams.length > 0 ? `{ ${nodeParams.map((param) => `${param.paramName}${param.optional ? "?" : ""}: ` + (param.modifier === "+" ? `ParamValueOneOrMore<${isRaw}>` : param.modifier === "*" ? `ParamValueZeroOrMore<${isRaw}>` : param.modifier === "?" ? `ParamValueZeroOrOne<${isRaw}>` : `ParamValue<${isRaw}>`)).join(", ")} }` : "Record<never, never>";
}
/**
* Enhanced version of `generateRouteParams` that supports path, query, and hash
* params, and also takes into account the types of the params and whether they
* are defined with raw parsers.
*
* @internal
*
* @param nodeParams - The params to generate the type for. Must be the same array passed to `generateParamsTypes()` since `types` is aligned with it by index.
* @param types - An array of types corresponding to the params in the node. The order should match the order of params in the node.
* @param isLoose - Whether to generate the type that is accepted when pushing (more persmissive)
* @param paramParsersMap - An optional map of param parsers, used to determine if a param is defined with a raw parser.
* @returns A string representing the TypeScript type for the route params of the given node.
*/
function EXPERIMENTAL_generateRouteParams(nodeParams, types, isLoose, paramParsersMap) {
	return nodeParams.length > 0 ? `{ ${nodeParams.map((param, i) => {
		const paramName = require_options.toStringLiteral(param.paramName);
		if (isTreeHashParam(param)) {
			const hasDefault = hasTreeParamDefault(param);
			const isOptional = isLoose && (!param.required || hasDefault);
			let type = types[i] ?? "string";
			if (!isLoose && (param.required || hasDefault) && type.startsWith("Param_")) type = `Exclude<${type}, undefined>`;
			if (hasDefault && mayHashDefaultBeNull(param.defaultValue)) type += " | null";
			if (isLoose ? isOptional : !hasDefault && !param.required) type += " | undefined";
			return `${paramName}${isOptional ? "?" : ""}: ${type}`;
		}
		const isOptional = isTreeParamOptional(param);
		const isRepeatable = isTreeParamRepeatable(param);
		const type = types[i];
		const isRawParser = !!(param.parser && paramParsersMap?.get(param.parser)?.isRaw);
		let extractedType;
		if (type?.startsWith("Param_")) extractedType = isRawParser ? `${type} /* raw param parser */` : isRepeatable ? `Extract<${type}, unknown[]>` : `Exclude<${type}, unknown[] | null>`;
		else extractedType = `${type ?? "string"}${isRepeatable ? "[]" : ""}`;
		if (isTreePathParam(param)) {
			if (isOptional && !isRepeatable && !isRawParser) extractedType += " | null";
			return `${paramName}: ${extractedType}`;
		}
		if (!param.required && !hasTreeParamDefault(param) && (isLoose || !isRawParser)) extractedType += " | undefined";
		return `${paramName}${isLoose && isOptional ? "?" : ""}: ${extractedType}`;
	}).join(", ")} }` : "Record<never, never>";
}
//#endregion
//#region src/unplugin/codegen/generateRouteMap.ts
function generateRouteNamedMap(node, options, paramParsersMap) {
	if (node.isRoot()) return `export interface RouteNamedMap {
${node.getChildrenSorted().map((n) => generateRouteNamedMap(n, options, paramParsersMap)).join("")}}`;
	return (node.value.components.size && node.isNamed() ? require_options.pad(2, `${require_options.toStringLiteral(node.name)}: ${generateRouteRecordInfo(node, options, paramParsersMap)},\n`) : "") + (node.children.size > 0 ? node.getChildrenSorted().map((n) => generateRouteNamedMap(n, options, paramParsersMap)).join("\n") : "");
}
function generateRouteRecordInfo(node, options, paramParsersMap) {
	const params = options.experimental.paramParsers ? normalizeParamsForTypes(node, node.params) : [];
	const pathParams = options.experimental.paramParsers ? [] : normalizeParamsForTypes(node, node.pathParams);
	const paramParsers = options.experimental.paramParsers ? generateParamsTypes(params, paramParsersMap) : [];
	const typeParams = [
		require_options.toStringLiteral(node.name),
		require_options.toStringLiteral(node.fullPath),
		options.experimental.paramParsers ? EXPERIMENTAL_generateRouteParams(params, paramParsers, true, paramParsersMap) : generateRouteParams(pathParams, true),
		options.experimental.paramParsers ? EXPERIMENTAL_generateRouteParams(params, paramParsers, false, paramParsersMap) : generateRouteParams(pathParams, false)
	];
	const childRouteNames = node.children.size > 0 ? Array.from(node.getChildrenDeep()).reduce((acc, childRoute) => {
		if (childRoute.value.components.size && childRoute.isNamed()) acc.push(childRoute.name);
		return acc;
	}, []).sort() : [];
	typeParams.push(require_options.formatMultilineUnion(childRouteNames.map(require_options.toStringLiteral), 4));
	return `RouteRecordInfo<
${typeParams.map((line) => require_options.pad(4, line)).join(",\n")}
  >`;
}
//#endregion
//#region src/unplugin/codegen/generateRouteFileInfoMap.ts
function generateRouteFileInfoMap(node, { root }) {
	if (!node.isRoot()) throw new Error("The provided node is not a root node");
	const routesInfoList = node.getChildrenSorted().flatMap((child) => generateRouteFileInfoLines(child, root));
	const routesInfo = /* @__PURE__ */ new Map();
	for (const routeInfo of routesInfoList) {
		let info = routesInfo.get(routeInfo.key);
		if (!info) routesInfo.set(routeInfo.key, info = {
			routes: [],
			views: [],
			pathParamNames: []
		});
		info.routes.push(...routeInfo.routeNames);
		info.views.push(...routeInfo.childrenNamedViews || []);
		info.pathParamNames.push(...routeInfo.pathParamNames);
	}
	return `export interface _RouteFileInfoMap {
${Array.from(routesInfo.entries()).map(([file, { routes, views, pathParamNames }]) => `
  ${require_options.toStringLiteral(file)}: {
    routes:
      ${require_options.formatMultilineUnion(routes.sort().map(require_options.toStringLiteral), 6)}
    views:
      ${require_options.formatMultilineUnion(views.sort().map(require_options.toStringLiteral), 6)}
    pathParamNames:
      ${require_options.formatMultilineUnion(Array.from(new Set(pathParamNames)).sort().map(require_options.toStringLiteral), 6)}
  }`).join("\n")}
}`;
}
/**
* Generate the route file info for a non-root node.
*/
function generateRouteFileInfoLines(node, rootDir) {
	const deepChildren = node.children.size > 0 ? node.getChildrenDeepSorted() : null;
	const deepChildrenNamedViews = deepChildren ? Array.from(new Set(deepChildren.flatMap((child) => Array.from(child.value.components.keys())))) : null;
	const routeNames = [node, ...deepChildren ?? []].reduce((acc, node) => {
		if (node.isNamed() && node.value.components.size > 0) acc.push(node.name);
		return acc;
	}, []);
	const pathParamNames = node.value.isParam() ? node.value.pathParams.map((p) => p.paramName) : [];
	const currentRouteInfo = routeNames.length === 0 ? [] : Array.from(node.value.components.values()).map((file) => ({
		key: (0, pathe.relative)(rootDir, file).replaceAll("\\", "/"),
		routeNames,
		childrenNamedViews: deepChildrenNamedViews,
		pathParamNames
	}));
	const childrenRouteInfo = node.getChildrenSorted().flatMap((child) => generateRouteFileInfoLines(child, rootDir));
	return currentRouteInfo.concat(childrenRouteInfo);
}
//#endregion
//#region src/unplugin/core/moduleConstants.ts
const MODULE_ROUTES_PATH = `vue-router/auto-routes`;
const MODULE_RESOLVER_PATH = `vue-router/auto-resolver`;
let time = Date.now();
/**
* Last time the routes were loaded from MODULE_ROUTES_PATH
*/
const ROUTES_LAST_LOAD_TIME = {
	get value() {
		return time;
	},
	update(when = Date.now()) {
		time = when;
	}
};
const ROUTE_BLOCK_ID = asVirtualId("vue-router/auto/route-block");
function getVirtualId(id) {
	return id.startsWith("\0") ? id.slice(1) : null;
}
const routeBlockQueryRE = /\?vue&type=route/;
function asVirtualId(id) {
	return "\0" + id;
}
const DEFINE_PAGE_QUERY_RE = /\?.*\bdefinePage&vue\b/;
//#endregion
//#region src/unplugin/codegen/generateRouteRecords.ts
/**
* Generate the route records for the given node.
*
* @param node - the node to generate the route record for
* @param options - the options to use
* @param importsMap - the imports map to fill and use
* @param indent - the indent level
* @returns the code of the routes as a string
*/
function generateRouteRecords(node, options, importsMap, indent = 0) {
	if (node.isRoot()) return `[
${node.getChildrenSorted().map((child) => generateRouteRecords(child, options, importsMap, indent + 1)).join(",\n")}
]`;
	if (!node.isMatchable() && node.children.size === 0) return "";
	const definePageDataList = [];
	if (node.needsDefinePageImport) {
		for (const [name, filePath] of node.value.components) {
			if (!node.fileNeedsDefinePageImport(filePath)) continue;
			const pageDataImport = `_definePage_${require_options.encodeImportIdentifierPart(name)}_${importsMap.size}`;
			definePageDataList.push(pageDataImport);
			const lang = (0, _vue_macros_common.getLang)(filePath);
			importsMap.addDefault(`${filePath}?definePage&` + (lang === "vue" ? "vue&lang.tsx" : `lang.${lang}`), pageDataImport);
		}
		if (definePageDataList.length > 0) indent++;
	}
	const startIndent = require_options.pad(indent * 2);
	const indentStr = require_options.pad((indent + 1) * 2);
	const overrides = node.value.overrides;
	const routeRecord = `${startIndent}{
${indentStr}path: ${require_options.toStringLiteral(node.path)},
${indentStr}${node.value.components.size ? node.isNamed() ? `name: ${require_options.toStringLiteral(node.name)},` : `/* no name */` : `/* internal name: ${typeof node.name === "string" ? require_options.toStringLiteral(node.name) : node.name} */`}
${indentStr}${node.value.components.size ? generateRouteRecordComponent$1(node, indentStr, options.importMode, importsMap) : "/* no component */"}
${overrides.props != null ? indentStr + `props: ${overrides.props},\n` : ""}${overrides.alias != null ? indentStr + `alias: ${JSON.stringify(overrides.alias)},\n` : ""}${indentStr}${node.children.size > 0 ? `children: [
${node.getChildrenSorted().map((child) => generateRouteRecords(child, options, importsMap, indent + 2)).join(",\n")}
${indentStr}],` : "/* no children */"}${formatMeta(node, indentStr)}
${startIndent}}`;
	if (definePageDataList.length > 0) {
		const mergeCallIndent = startIndent.slice(2);
		importsMap.add("vue-router/experimental", "_mergeRouteRecord");
		return `${mergeCallIndent}_mergeRouteRecord(
${routeRecord},
${definePageDataList.map((s) => startIndent + s).join(",\n")}
${mergeCallIndent})`;
	}
	return routeRecord;
}
function generateRouteRecordComponent$1(node, indentStr, importMode, importsMap) {
	const files = Array.from(node.value.components);
	return files.length === 1 && files[0][0] === "default" ? `component: ${generatePageImport(files[0][1], importMode, importsMap)},` : `components: {
${files.map(([key, path]) => `${indentStr + "  "}${require_options.toStringLiteral(key)}: ${generatePageImport(path, importMode, importsMap)}`).join(",\n")}
${indentStr}},`;
}
/**
* Generate the import (dynamic or static) for the given filepath. If the filepath is a static import, add it to the importsMap.
*
* @param filepath - the filepath to the file
* @param importMode - the import mode to use
* @param importsMap - the import list to fill
* @returns
*/
function generatePageImport(filepath, importMode, importsMap) {
	if ((typeof importMode === "function" ? importMode(filepath) : importMode) === "async") return `() => import(${require_options.toStringLiteral(filepath)})`;
	const existingEntry = importsMap.getImportList(filepath).find((entry) => entry.name === "default");
	if (existingEntry) return existingEntry.as;
	const importName = `_page_${importsMap.size}`;
	importsMap.addDefault(filepath, importName);
	return importName;
}
function formatMeta(node, indent) {
	const meta = node.meta;
	const formatted = meta && meta.split("\n").map((line) => indent + line).join("\n") + ",";
	return formatted ? "\n" + indent + "meta: " + formatted.trimStart() : "";
}
//#endregion
//#region src/unplugin/core/customBlock.ts
function getRouteBlock(path, content, options) {
	const blockStr = (0, _vue_compiler_sfc.parse)(content, { pad: "space" }).descriptor?.customBlocks.find((b) => b.type === "route");
	if (blockStr) return parseCustomBlock(blockStr, path, options);
}
function parseCustomBlock(block, filePath, options) {
	const lang = block.lang ?? options.routeBlockLang;
	if (lang === "json5") try {
		return (0, confbox_json5.parseJSON5)(block.content);
	} catch (err) {
		require_options.diagnostics.VUE_ROUTER_B0012({
			type: block.type,
			filePath,
			message: err.message
		});
	}
	else if (lang === "json") try {
		return JSON.parse(block.content);
	} catch (err) {
		require_options.diagnostics.VUE_ROUTER_B0013({
			type: block.type,
			filePath,
			message: err.message
		});
	}
	else if (lang === "yaml" || lang === "yml") try {
		return (0, confbox_yaml.parseYAML)(block.content);
	} catch (err) {
		require_options.diagnostics.VUE_ROUTER_B0014({
			type: block.type,
			filePath,
			message: err.message
		});
	}
	else require_options.diagnostics.VUE_ROUTER_B0015({
		lang,
		type: block.type,
		filePath
	});
}
//#endregion
//#region src/unplugin/core/RoutesFolderWatcher.ts
var RoutesFolderWatcher = class {
	src;
	path;
	extensions;
	filePatterns;
	exclude;
	watcher;
	constructor(folderOptions) {
		this.src = folderOptions.src;
		this.path = folderOptions.path;
		this.exclude = folderOptions.exclude;
		this.extensions = folderOptions.extensions;
		this.filePatterns = folderOptions.pattern;
		const isMatch = (0, picomatch.default)(this.filePatterns, { ignore: this.exclude });
		this.watcher = (0, chokidar.watch)(".", {
			cwd: this.src,
			ignoreInitial: true,
			ignorePermissionErrors: true,
			awaitWriteFinish: !!process.env.CI,
			ignored: (filePath, stats) => {
				if (!stats || stats.isDirectory()) return false;
				return !isMatch(pathe.default.relative(this.src, filePath));
			}
		});
	}
	on(event, handler) {
		this.watcher.on(event, (filePath) => {
			filePath = (0, pathe.resolve)(this.src, filePath);
			handler({
				filePath,
				routePath: require_options.asRoutePath({
					src: this.src,
					path: this.path,
					extensions: this.extensions
				}, filePath)
			});
		});
		return this;
	}
	close() {
		return this.watcher.close();
	}
};
function resolveFolderOptions(globalOptions, folderOptions) {
	const extensions = overrideOption(globalOptions.extensions, folderOptions.extensions);
	const filePatterns = overrideOption(globalOptions.filePatterns, folderOptions.filePatterns);
	return {
		src: pathe.default.resolve(globalOptions.root, folderOptions.src),
		pattern: require_options.appendExtensionListToPattern(filePatterns, extensions),
		path: folderOptions.path || "",
		extensions,
		filePatterns,
		exclude: overrideOption(globalOptions.exclude, folderOptions.exclude).map((p) => p.startsWith("**") ? p : (0, pathe.resolve)(p))
	};
}
function overrideOption(existing, newValue) {
	const asArray = typeof existing === "string" ? [existing] : existing;
	if (typeof newValue === "function") return newValue(asArray);
	if (typeof newValue !== "undefined") return typeof newValue === "string" ? [newValue] : newValue;
	return asArray;
}
//#endregion
//#region src/unplugin/codegen/generateDTS.ts
/**
* Removes empty lines and indent by two spaces to match the rest of the file.
*/
function normalizeLines(code) {
	return code.split("\n").filter((line) => line.length !== 0).map((line) => require_options.pad(2, line)).join("\n");
}
function generateDTS({ routesModule, routeNamedMap, routeFileInfoMap, paramsTypesDeclaration, customParamsTypeList }) {
	return require_options.ts`
/* eslint-disable */
/* prettier-ignore */
// oxfmt-ignore
// @ts-nocheck
// noinspection ES6UnusedImports
// Generated by vue-router. !! DO NOT MODIFY THIS FILE !!
// It's recommended to commit this file.
// Make sure to add this file to your tsconfig.json file as an "includes" or "files" entry.

import type {
  RouteRecordInfo,
  ParamValue,
  ParamValueOneOrMore,
  ParamValueZeroOrMore,
  ParamValueZeroOrOne,
} from 'vue-router'
import type {
  _ExtractParamParserType,
} from 'vue-router/experimental'

${paramsTypesDeclaration ? `
// Custom route params parsers
${paramsTypesDeclaration}

`.trimStart() : ""}declare module 'vue-router' {
  interface TypesConfig {
    _ParamParsers: ${customParamsTypeList.length === 0 ? "{}" : `{
${customParamsTypeList.map((entry) => " ".repeat(6) + entry).join("\n")}
    }`}
    RouteNamedMap: import('${routesModule}').RouteNamedMap
    _RouteFileInfoMap: import('${routesModule}')._RouteFileInfoMap
  }
}

declare module '${routesModule}' {
  /**
   * Route name map generated by vue-router
   */
${normalizeLines(routeNamedMap)}

  /**
   * Route file to route info map by vue-router.
   * Used by the \`sfc-typed-router\` Volar plugin to automatically type \`useRoute()\`.
   *
   * Each key is a file path relative to the project root with 2 properties:
   * - routes: union of route names of the possible routes when in this page (passed to useRoute<...>())
   * - views: names of nested views (can be passed to <RouterView name="...">)
   *
   * @internal
   */
${normalizeLines(routeFileInfoMap)}

  /**
   * Get a union of possible route names in a certain route component file.
   * Used by the \`sfc-typed-router\` Volar plugin to automatically type \`useRoute()\`.
   *
   * @internal
   */
  export type _RouteNamesForFilePath<FilePath extends string> =
    _RouteFileInfoMap extends Record<FilePath, infer Info>
      ? Info['routes']
      : keyof RouteNamedMap
}

export {}
`.trimStart();
}
//#endregion
//#region src/unplugin/core/definePage.ts
const MACRO_DEFINE_PAGE = "definePage";
const MACRO_DEFINE_PAGE_QUERY = /[?&]definePage\b/;
/**
* Generate the ast from a code string and an id. Works with SFC and non-SFC files.
*/
function getCodeAst(code, id) {
	let offset = 0;
	let ast;
	const lang = (0, _vue_macros_common.getLang)(id.split(MACRO_DEFINE_PAGE_QUERY)[0]);
	if (lang === "vue") {
		const sfc = (0, _vue_macros_common.parseSFC)(code, id);
		if (sfc.scriptSetup) {
			ast = sfc.getSetupAst();
			offset = sfc.scriptSetup.loc.start.offset;
		} else if (sfc.script) {
			ast = sfc.getScriptAst();
			offset = sfc.script.loc.start.offset;
		}
	} else if (/[jt]sx?$/.test(lang)) ast = (0, _vue_macros_common.babelParse)(code, lang);
	const definePageNodes = (ast?.body || []).map((node) => {
		const definePageCallNode = node.type === "ExpressionStatement" ? node.expression : node;
		return (0, _vue_macros_common.isCallOf)(definePageCallNode, MACRO_DEFINE_PAGE) ? definePageCallNode : null;
	}).filter((node) => !!node);
	return {
		ast,
		offset,
		definePageNodes
	};
}
/**
* Extract the source text of an ast node from the original code. Works with
* SFC and non-SFC files by applying the script block offset.
*
* @param source - full source code the ast was parsed from
* @param node - ast node with source range information
* @param offset - offset of the parsed script within the source
* @returns the source text of the node or `undefined` if the node has no range
*/
function getNodeSource(source, node, offset) {
	if (node.start == null || node.end == null) return;
	return source.slice(offset + node.start, offset + node.end);
}
function definePageTransform({ code, id }) {
	const isExtractingDefinePage = MACRO_DEFINE_PAGE_QUERY.test(id);
	if (!code.includes(MACRO_DEFINE_PAGE)) return isExtractingDefinePage ? "export default {}" : void 0;
	let ast;
	let offset;
	let definePageNodes;
	try {
		const result = getCodeAst(code, id);
		ast = result.ast;
		offset = result.offset;
		definePageNodes = result.definePageNodes;
	} catch (error) {
		require_options.diagnostics.VUE_ROUTER_B0001({
			filename: id,
			message: error instanceof Error ? error.message : "Unknown error"
		});
		return isExtractingDefinePage ? "export default {}" : void 0;
	}
	if (!ast) return;
	if (!definePageNodes.length) return isExtractingDefinePage ? "export default {}" : null;
	else if (definePageNodes.length > 1) require_options.diagnostics.VUE_ROUTER_B0020({ filename: id });
	const definePageNode = definePageNodes[0];
	if (isExtractingDefinePage) {
		const s = new _vue_macros_common.MagicString(code);
		const routeRecord = definePageNode.arguments[0];
		if (!routeRecord) throw new SyntaxError(`In file "${id}": definePage() expects an object expression as its only argument`);
		const scriptBindings = ast.body ? getIdentifiers(ast.body) : [];
		try {
			(0, _vue_macros_common.checkInvalidScopeReference)(routeRecord, MACRO_DEFINE_PAGE, scriptBindings);
		} catch (error) {
			require_options.diagnostics.VUE_ROUTER_B0002({
				filename: id,
				message: error instanceof Error ? error.message : "Invalid scope reference in definePage"
			});
			return "export default {}";
		}
		s.remove(offset + routeRecord.end, code.length);
		s.remove(0, offset + routeRecord.start);
		s.prepend(`export default `);
		const staticImports = (0, mlly.findStaticImports)(code);
		const usedIds = /* @__PURE__ */ new Set();
		const localIds = /* @__PURE__ */ new Set();
		(0, ast_walker_scope.walkAST)(routeRecord, {
			enter(node) {
				if (this.parent?.type === "ObjectProperty" && this.parent.key === node && !this.parent.computed && node.type === "Identifier") this.skip();
				else if (this.parent?.type === "MemberExpression" && this.parent.property === node && !this.parent.computed && node.type === "Identifier") this.skip();
				else if (node.type === "TSTypeAnnotation") this.skip();
				else if (node.type === "Identifier" && !localIds.has(node.name)) usedIds.add(node.name);
				else if ("scopeIds" in node && node.scopeIds instanceof Set) for (const id of node.scopeIds) localIds.add(id);
			},
			leave(node) {
				if ("scopeIds" in node && node.scopeIds instanceof Set) for (const id of node.scopeIds) localIds.delete(id);
			}
		});
		for (const imp of staticImports) {
			const importCode = generateFilteredImportStatement((0, mlly.parseStaticImport)(imp), usedIds);
			if (importCode) s.prepend(importCode + "\n");
		}
		return (0, _vue_macros_common.generateTransform)(s, id);
	} else {
		const s = new _vue_macros_common.MagicString(code);
		for (const node of definePageNodes) s.remove(offset + node.start, offset + node.end);
		return (0, _vue_macros_common.generateTransform)(s, id);
	}
}
/**
* Extracts name, path, and params from definePage(). Those do not require
* extracting the whole definePage object as a different import
*/
function extractDefinePageInfo(sfcCode, id) {
	if (!sfcCode.includes(MACRO_DEFINE_PAGE)) return;
	let ast;
	let offset;
	let definePageNodes;
	try {
		const result = getCodeAst(sfcCode, id);
		ast = result.ast;
		offset = result.offset;
		definePageNodes = result.definePageNodes;
	} catch (error) {
		require_options.diagnostics.VUE_ROUTER_B0003({
			filename: id,
			message: error instanceof Error ? error.message : "Unknown error"
		});
		return;
	}
	if (!ast) return;
	if (!definePageNodes.length) return;
	else if (definePageNodes.length > 1) require_options.diagnostics.VUE_ROUTER_B0020({ filename: id });
	const routeRecord = definePageNodes[0].arguments[0];
	if (!routeRecord) throw new SyntaxError(`In file "${id}": definePage() expects an object expression as its only argument`);
	if (routeRecord.type !== "ObjectExpression") throw new SyntaxError(`In file "${id}": definePage() expects an object expression as its only argument`);
	const routeInfo = { hasRemainingProperties: false };
	for (const prop of routeRecord.properties) if (prop.type === "ObjectProperty" && prop.key.type === "Identifier") {
		if (prop.key.name === "name") {
			if (prop.value.type !== "StringLiteral" && (prop.value.type !== "BooleanLiteral" || prop.value.value !== false)) require_options.diagnostics.VUE_ROUTER_B0004({ filename: id });
			else routeInfo.name = prop.value.value;
		} else if (prop.key.name === "path") {
			if (prop.value.type !== "StringLiteral") require_options.diagnostics.VUE_ROUTER_B0005({ filename: id });
			else routeInfo.path = prop.value.value;
		} else if (prop.key.name === "alias") routeInfo.alias = extractRouteAlias(prop.value, id);
		else if (prop.key.name === "params") {
			if (prop.value.type === "ObjectExpression") routeInfo.params = extractParamsInfo(prop.value, id, sfcCode, offset);
		} else routeInfo.hasRemainingProperties = true;
	}
	return routeInfo;
}
function extractParamsInfo(paramsObj, id, source, offset) {
	const params = {};
	for (const prop of paramsObj.properties) if (prop.type === "ObjectProperty" && prop.key.type === "Identifier") {
		if (prop.key.name === "query" && prop.value.type === "ObjectExpression") params.query = extractQueryParams(prop.value, id, source, offset);
		else if (prop.key.name === "path" && prop.value.type === "ObjectExpression") params.path = extractPathParams(prop.value, id);
		else if (prop.key.name === "hash" && prop.value.type === "ObjectExpression") params.hash = extractHashParams(prop.value, source, offset);
	}
	return params;
}
function extractQueryParams(queryObj, _id, source, offset) {
	const queryParams = {};
	for (const prop of queryObj.properties) if (prop.type === "ObjectProperty" && prop.key.type === "Identifier") {
		const paramName = prop.key.name;
		if (prop.value.type === "StringLiteral") queryParams[paramName] = { parser: prop.value.value };
		else if (prop.value.type === "ObjectExpression") queryParams[paramName] = extractParamOptions(prop.value, paramName, source, offset, true);
	}
	return queryParams;
}
function extractParamOptions(optionsObj, paramName, source, offset, includeFormat) {
	const paramInfo = {};
	for (const paramProp of optionsObj.properties) if (paramProp.type === "ObjectProperty" && paramProp.key.type === "Identifier") {
		if (paramProp.key.name === "parser" && paramProp.value.type === "StringLiteral") paramInfo.parser = paramProp.value.value;
		else if (includeFormat && paramProp.key.name === "format" && paramProp.value.type === "StringLiteral") paramInfo.format = paramProp.value.value;
		else if (paramProp.key.name === "required" && paramProp.value.type === "BooleanLiteral") paramInfo.required = paramProp.value.value;
		else if (paramProp.key.name === "default") {
			if (typeof paramProp.value.extra?.raw === "string") paramInfo.default = paramProp.value.extra.raw;
			else if (paramProp.value.type === "NumericLiteral") paramInfo.default = String(paramProp.value.value);
			else if (paramProp.value.type === "StringLiteral") paramInfo.default = JSON.stringify(paramProp.value.value);
			else if (paramProp.value.type === "BooleanLiteral") paramInfo.default = String(paramProp.value.value);
			else if (paramProp.value.type === "NullLiteral") paramInfo.default = "null";
			else if (paramProp.value.type === "UnaryExpression" && (paramProp.value.operator === "-" || paramProp.value.operator === "+" || paramProp.value.operator === "!" || paramProp.value.operator === "~") && paramProp.value.argument.type === "NumericLiteral") paramInfo.default = `${paramProp.value.operator}${paramProp.value.argument.value}`;
			else if (paramProp.value.type === "ArrowFunctionExpression") {
				const expression = getNodeSource(source, paramProp.value, offset);
				if (expression == null) require_options.diagnostics.VUE_ROUTER_B0006({
					paramName,
					type: paramProp.value.type
				});
				else paramInfo.default = expression;
			} else require_options.diagnostics.VUE_ROUTER_B0006({
				paramName,
				type: paramProp.value.type
			});
		}
	}
	return paramInfo;
}
function extractHashParams(hashObj, source, offset) {
	const hashParams = {};
	for (const prop of hashObj.properties) if (prop.type === "ObjectProperty" && !prop.computed && (prop.key.type === "Identifier" || prop.key.type === "StringLiteral")) {
		const name = prop.key.type === "Identifier" ? prop.key.name : prop.key.value;
		if (prop.value.type === "StringLiteral") hashParams[name] = prop.value.value;
		else if (prop.value.type === "ObjectExpression") hashParams[name] = extractParamOptions(prop.value, name, source, offset, false);
	}
	return hashParams;
}
function extractPathParams(pathObj, _id) {
	const pathParams = {};
	for (const prop of pathObj.properties) {
		if (prop.type !== "ObjectProperty" || prop.key.type !== "Identifier") continue;
		if (prop.value.type === "StringLiteral") pathParams[prop.key.name] = prop.value.value;
		else if (prop.value.type === "ObjectExpression") {
			const options = {};
			for (const optionProp of prop.value.properties) {
				if (optionProp.type !== "ObjectProperty" || optionProp.key.type !== "Identifier") continue;
				const { name } = optionProp.key;
				const { value } = optionProp;
				if (name === "parser") {
					if (value.type === "StringLiteral") options.parser = value.value;
					else if (value.type === "NullLiteral") options.parser = null;
				} else if (name === "re") {
					if (value.type === "RegExpLiteral") options.re = value.pattern;
					else if (value.type === "NullLiteral") options.re = null;
				}
			}
			pathParams[prop.key.name] = options;
		}
	}
	return pathParams;
}
function extractRouteAlias(aliasValue, id) {
	if (aliasValue.type !== "StringLiteral" && aliasValue.type !== "ArrayExpression") require_options.diagnostics.VUE_ROUTER_B0007({ filename: id });
	else return aliasValue.type === "StringLiteral" ? [aliasValue.value] : aliasValue.elements.filter((node) => {
		if (node?.type === "StringLiteral") return true;
		require_options.diagnostics.VUE_ROUTER_B0008({
			found: node?.type ? `"${node.type}" ` : "",
			filename: id
		});
		return false;
	}).map((el) => el.value);
}
const getIdentifiers = (stmts) => {
	let ids = [];
	(0, ast_walker_scope.walkAST)({
		type: "Program",
		body: stmts,
		directives: [],
		sourceType: "module"
	}, {
		enter(node) {
			if (node.type === "BlockStatement") this.skip();
		},
		leave(node) {
			if (node.type !== "Program") return;
			ids = Object.keys(this.scope);
		}
	});
	return ids;
};
/**
* Generate a filtere import statement based on a set of identifiers that should be kept.
*
* @param parsedImports - parsed imports with mlly
* @param usedIds - set of used identifiers
* @returns `null` if no import statement should be generated, otherwise the import statement as a string without a newline
*/
function generateFilteredImportStatement(parsedImports, usedIds) {
	if (!parsedImports || usedIds.size < 1) return null;
	const { namedImports, defaultImport, namespacedImport } = parsedImports;
	if (namespacedImport && usedIds.has(namespacedImport)) return `import * as ${namespacedImport} from '${parsedImports.specifier}'`;
	let importListCode = "";
	if (defaultImport && usedIds.has(defaultImport)) importListCode += defaultImport;
	let namedImportListCode = "";
	for (const importName in namedImports) if (usedIds.has(importName)) {
		namedImportListCode += namedImportListCode ? `, ` : "";
		namedImportListCode += importName === namedImports[importName] ? importName : `${importName} as ${namedImports[importName]}`;
	}
	importListCode += importListCode && namedImportListCode ? ", " : "";
	importListCode += namedImportListCode ? `{${namedImportListCode}}` : "";
	if (!importListCode) return null;
	return `import ${importListCode} from '${parsedImports.specifier}'`;
}
//#endregion
//#region src/unplugin/core/extendRoutes.ts
/**
* A route node that can be modified by the user. The tree can be iterated to be traversed.
* @example
* ```js
* [...node] // creates an array of all the children
* for (const child of node) {
*   // do something with the child node
* }
* ```
*
* @experimental
*/
var EditableTreeNode = class EditableTreeNode {
	node;
	constructor(node) {
		this.node = node;
	}
	/**
	* Remove and detach the current route node from the tree. Subsequently, its children will be removed as well.
	*/
	delete() {
		return this.node.delete();
	}
	/**
	* Inserts a new route as a child of this route. This route cannot use `definePage()`. If it was meant to be included,
	* add it to the `routesFolder` option.
	*
	* @param path - path segment to insert. Note this is relative to the current route. **It shouldn't start with `/`**. If it does, it will be added to the root of the tree.
	* @param filePath - file path
	* @returns the new editable route node
	*/
	insert(path, filePath) {
		let addBackLeadingSlash = false;
		if (require_options.isAbsolutePath(path)) {
			path = path.slice(1);
			addBackLeadingSlash = !this.node.isRoot();
		}
		const node = this.node.insertParsedPath(path, filePath);
		const editable = new EditableTreeNode(node);
		if (addBackLeadingSlash) editable.path = "/" + node.path;
		return editable;
	}
	/**
	* Get an editable version of the parent node if it exists.
	*/
	get parent() {
		return this.node.parent && new EditableTreeNode(this.node.parent);
	}
	/**
	* Return a Map of the files associated to the current route. The key of the map represents the name of the view (Vue
	* Router feature) while the value is the **resolved** file path.
	* By default, the name of the view is `default`.
	*/
	get components() {
		return this.node.value.components;
	}
	/**
	* Alias for `route.components.get('default')`.
	*/
	get component() {
		return this.node.value.components.get("default");
	}
	/**
	* Name of the route. Note that **all routes are named** but when the final `routes` array is generated, routes
	* without a `component` will not include their `name` property to avoid accidentally navigating to them and display
	* nothing.
	* @see {@link isPassThrough}
	*/
	get name() {
		return this.node.name;
	}
	/**
	* Override the route name. If not provided, the name will be generated based
	* on the file path. Can be set to `false` to make the route _anonymous_
	* which removes it from types and make the route unmatchable.
	*/
	set name(name) {
		this.node.value.addEditOverride({ name });
	}
	/**
	* Whether the route is a pass-through route. A pass-through route is a route that does not have a component and is
	* used to group other routes under the same prefix `path` and/or `meta` properties.
	*/
	get isPassThrough() {
		return this.node.value.components.size === 0;
	}
	/**
	* Meta property of the route as an object. Note this property is readonly and will be serialized as JSON. It won't contain the meta properties defined with `definePage()` as it could contain expressions **but it does contain the meta properties defined with `<route>` blocks**.
	*/
	get meta() {
		return this.node.metaAsObject;
	}
	/**
	* Override the meta property of the route. This will discard any other meta property defined with `<route>` blocks or
	* through other means. If you want to keep the existing meta properties, use `addToMeta`.
	* @see {@link addToMeta}
	*/
	set meta(meta) {
		this.node.value.removeOverride("meta");
		this.node.value.setEditOverride("meta", meta);
	}
	/**
	* Add meta properties to the route keeping the existing ones. The passed object will be deeply merged with the
	* existing meta object if any. Note that the meta property is later on serialized as JSON so you can't pass functions
	* or any other non-serializable value.
	*/
	addToMeta(meta) {
		this.node.value.addEditOverride({ meta });
	}
	/**
	* Path of the route without parent paths.
	*/
	get path() {
		return this.node.path;
	}
	/**
	* Override the path of the route. You must ensure `params` match with the existing path.
	*/
	set path(path) {
		if ((!this.node.parent || this.node.parent.isRoot()) && !require_options.isAbsolutePath(path)) path = "/" + path;
		this.node.value.addEditOverride({ path });
	}
	/**
	* Alias of the route.
	*/
	get alias() {
		return this.node.value.overrides.alias?.slice();
	}
	/**
	* Add an alias to the route.
	*
	* @param alias - Alias to add to the route
	*/
	addAlias(alias) {
		this.node.value.addEditOverride({ alias });
	}
	/**
	* Array of the route params and all of its parent's params. Note that
	* changing the params will not update the path, you need to update both.
	*/
	get params() {
		return this.node.pathParams;
	}
	/**
	* Path of the route including parent paths.
	*/
	get fullPath() {
		return this.node.fullPath;
	}
	/**
	* Computes an array of EditableTreeNode from the current node. Differently from iterating over the tree, this method
	* **only returns direct children**.
	*/
	get children() {
		return [...this.node.children.values()].map((node) => new EditableTreeNode(node));
	}
	/**
	* DFS traversal of the tree.
	* @example
	* ```ts
	* for (const node of tree) {
	*   // ...
	* }
	* ```
	*/
	*traverseDFS() {
		if (!this.node.isRoot()) yield this;
		for (const [_name, child] of this.node.children) yield* new EditableTreeNode(child).traverseDFS();
	}
	*[Symbol.iterator]() {
		yield* this.traverseBFS();
	}
	/**
	* BFS traversal of the tree as a generator.
	*
	* @example
	* ```ts
	* for (const node of tree) {
	*   // ...
	* }
	* ```
	*/
	*traverseBFS() {
		for (const [_name, child] of this.node.children) yield new EditableTreeNode(child);
		for (const [_name, child] of this.node.children) yield* new EditableTreeNode(child).traverseBFS();
	}
};
//#endregion
//#region src/unplugin/codegen/generateRouteResolver.ts
/**
* Compare two score sub-arrays element by element.
* Ported from pathParserRanker.ts compareScoreArray.
*/
function compareScoreArray(a, b) {
	let i = 0;
	while (i < a.length && i < b.length) {
		const diff = b[i] - a[i];
		if (diff) return diff;
		i++;
	}
	if (a.length < b.length) return a.length === 1 && a[0] === 300 ? -1 : 1;
	else if (a.length > b.length) return b.length === 1 && b[0] === 300 ? 1 : -1;
	return 0;
}
function isLastScoreNegative(score) {
	const last = score[score.length - 1];
	return score.length > 0 && last[last.length - 1] < 0;
}
/**
* Compare two score arrays for sorting routes by priority.
* Ported from pathParserRanker.ts comparePathParserScore.
*/
function compareRouteScore(a, b) {
	let i = 0;
	while (i < a.length && i < b.length) {
		const comp = compareScoreArray(a[i], b[i]);
		if (comp) return comp;
		i++;
	}
	if (Math.abs(b.length - a.length) === 1) {
		if (isLastScoreNegative(a)) return 1;
		if (isLastScoreNegative(b)) return -1;
	}
	return b.length - a.length;
}
const ROUTE_RECORD_VAR_PREFIX = "__route_";
function generateRouteResolver(tree, options, importsMap, paramParsersMap) {
	const usedParserNames = collectUsedParamParserNames(tree);
	const usedParamParsersMap = new Map(Array.from(paramParsersMap).filter(([key]) => usedParserNames.has(key)));
	const state = {
		id: 0,
		matchableRecords: []
	};
	const records = tree.getChildrenSorted().map((node) => generateRouteRecord({
		node,
		parentVar: null,
		parentNode: null,
		state,
		options,
		importsMap,
		paramParsersMap: usedParamParsersMap
	}));
	importsMap.add("vue-router/experimental", "createFixedResolver");
	importsMap.add("vue-router/experimental", "MatcherPatternPathStatic");
	importsMap.add("vue-router/experimental", "MatcherPatternPathDynamic");
	importsMap.add("vue-router/experimental", "normalizeRouteRecord");
	const normalizedDeclarations = generateNormalizedParamParsersDeclarations(usedParamParsersMap, importsMap);
	return require_options.ts`
${normalizedDeclarations ? normalizedDeclarations + "\n\n" : ""}${records.join("\n\n")}

export const resolver = createFixedResolver([
${state.matchableRecords.sort((a, b) => compareRouteScore(a.score, b.score) || b.path.split("/").filter(Boolean).length - a.path.split("/").filter(Boolean).length).map(({ varName, path }) => `  ${varName},  ${" ".repeat(String(state.id).length - varName.length + 8)}// ${path}`).join("\n")}
])
`;
}
/**
* Generates the route record in the format expected by the static resolver.
*/
function generateRouteRecord({ node, parentVar, parentNode, state, options, importsMap, paramParsersMap }) {
	const isMatchable = node.isMatchable();
	const shouldSkipNode = !isMatchable && !node.meta && !node.hasComponents;
	let varName = null;
	let recordDeclaration = "";
	const definePageDataList = [];
	if (node.needsDefinePageImport) for (const [name, filePath] of node.value.components) {
		if (!node.fileNeedsDefinePageImport(filePath)) continue;
		const pageDataImport = `_definePage_${require_options.encodeImportIdentifierPart(name)}_${importsMap.size}`;
		definePageDataList.push(pageDataImport);
		const lang = (0, _vue_macros_common.getLang)(filePath);
		importsMap.addDefault(`${filePath}?definePage&` + (lang === "vue" ? "vue&lang.tsx" : `lang.${lang}`), pageDataImport);
	}
	if (!shouldSkipNode) {
		varName = `${ROUTE_RECORD_VAR_PREFIX}${state.id++}`;
		let recordName;
		const recordComponents = generateRouteRecordComponent(node, "  ", options.importMode, importsMap);
		if (isMatchable) {
			state.matchableRecords.push({
				path: node.fullPath,
				varName,
				score: node.score
			});
			recordName = `name: ${require_options.toStringLiteral(node.name)},`;
		} else recordName = node.name ? `/* (internal) name: ${require_options.toStringLiteral(node.name)} */` : `/* (removed) name: false */`;
		const queryProperty = generateRouteRecordQuery({
			node,
			importsMap,
			paramParsersMap
		});
		const hashProperty = generateRouteRecordHash({
			node,
			importsMap,
			paramParsersMap
		});
		const routeRecordObject = `{
  ${recordName}
  ${generateRouteRecordPath({
			node,
			importsMap,
			paramParsersMap,
			parentVar,
			parentNode
		})}${queryProperty ? `\n  ${queryProperty}` : ""}${hashProperty ? `\n  ${hashProperty}` : ""}${formatMeta(node, "  ")}
  ${recordComponents}${parentVar ? `\n  parent: ${parentVar},` : ""}
}`;
		recordDeclaration = definePageDataList.length > 0 ? `
const ${varName} = normalizeRouteRecord(
  ${generateRouteRecordMerge(routeRecordObject, definePageDataList, importsMap)}
)
` : `
const ${varName} = normalizeRouteRecord(${routeRecordObject})
`.trim().split("\n").filter((l) => l.trimStart().length > 0).join("\n");
	}
	let aliasDeclarations = "";
	const aliases = node.value.overrides.alias;
	if (varName && isMatchable && aliases && aliases.length > 0) for (const aliasPath of aliases) {
		const aliasVarName = `${ROUTE_RECORD_VAR_PREFIX}${state.id++}`;
		const tempTree = new PrefixTree(options);
		const strippedAlias = aliasPath.replace(/^\//, "");
		const tempNode = tempTree.insertParsedPath(strippedAlias);
		const aliasPathCode = generatePathCode(tempNode, importsMap, paramParsersMap);
		const aliasRecordObject = `{
  ...${varName},
  ${aliasPathCode}
  aliasOf: ${varName},
}`;
		aliasDeclarations += `\nconst ${aliasVarName} = normalizeRouteRecord(${aliasRecordObject})`;
		state.matchableRecords.push({
			path: tempNode.fullPath,
			varName: aliasVarName,
			score: tempNode.score
		});
	}
	const children = node.getChildrenSorted().map((child) => generateRouteRecord({
		node: child,
		parentVar: shouldSkipNode ? parentVar : varName,
		parentNode: shouldSkipNode ? parentNode : node,
		state,
		options,
		importsMap,
		paramParsersMap
	}));
	return recordDeclaration + aliasDeclarations + (children.length ? (recordDeclaration || aliasDeclarations ? "\n" : "") + children.join("\n") : "");
}
function generateRouteRecordComponent(node, indentStr, importMode, importsMap) {
	if (!node.hasComponents) return "";
	return `components: {
${Array.from(node.value.components).map(([key, path]) => `${indentStr + "  "}${require_options.toStringLiteral(key)}: ${generatePageImport(path, importMode, importsMap)}`).join(",\n")}
${indentStr}},`;
}
/**
* Generates the dynamic/static `path: ...` property from a TreeNode.
*/
function generatePathCode(node, importsMap, paramParsersMap) {
	const params = node.pathParams;
	if (params.length > 0) return `path: new MatcherPatternPathDynamic(
    ${node.regexp},
    ${generatePathParamsOptions(params, importsMap, paramParsersMap)},
    ${JSON.stringify(node.matcherPatternPathDynamicParts)},
    ${node.endsWithSplat ? "null," : "/* trailingSlash */"}
  ),`;
	else return `path: new MatcherPatternPathStatic(${require_options.toStringLiteral(node.fullPath)}),`;
}
/**
* Generates the `path` property of a route record for the static resolver.
*/
function generateRouteRecordPath({ node, importsMap, paramParsersMap, parentVar, parentNode }) {
	if (!node.isMatchable() && node.name) return "";
	if (parentVar && parentNode && node.regexp === parentNode.regexp) return `path: ${parentVar}.path,`;
	return generatePathCode(node, importsMap, paramParsersMap);
}
/**
* Generates the `query` property of a route record for the static resolver.
*/
function generateRouteRecordQuery({ node, importsMap, paramParsersMap }) {
	const queryParams = node.value.queryParams;
	if (queryParams.length === 0) return "";
	importsMap.add("vue-router/experimental", "MatcherPatternQueryParam");
	return `query: [
${queryParams.map((param) => {
		const parserOptions = generateParamParserOptions(param, importsMap, paramParsersMap);
		const isRawParser = !!(param.parser && paramParsersMap.get(param.parser)?.isRaw);
		const invalidFormatWarn = isRawParser && param.format === "value" && `console.warn(${require_options.toStringLiteral(`Query param "${param.paramName}" in route "${node.fullPath}" uses raw param parser "${param.parser}" but specifies \`format: 'value'\`. The format is ignored because raw parsers always receive the array form. Set it to 'array' to silence the warning.`)}) ||`;
		const format = isRawParser ? "array" : param.format || "value";
		const args = [
			require_options.toStringLiteral(param.paramName),
			require_options.toStringLiteral(param.paramName),
			require_options.toStringLiteral(format)
		];
		if (parserOptions || param.defaultValue !== void 0 || param.required) args.push(parserOptions || "{}");
		if (param.defaultValue !== void 0 || param.required) args.push(param.defaultValue || "undefined");
		if (param.required) args.push(String(param.required));
		return `    ${invalidFormatWarn || ""}new MatcherPatternQueryParam(${args.join(", ")})`;
	}).join(",\n")}
  ],`;
}
/**
* Generates a merge call for route records with definePage data in the experimental resolver format.
*/
function generateRouteRecordMerge(routeRecordObject, definePageDataList, importsMap) {
	if (definePageDataList.length === 0) return routeRecordObject;
	importsMap.add("vue-router/experimental", "_mergeRouteRecord");
	return `_mergeRouteRecord(
${routeRecordObject.split("\n").map((line) => {
		return line && `    ${line}`;
	}).join("\n")},
${definePageDataList.map((name) => `    ${name}`).join(",\n")}
  )`;
}
function generateRouteRecordHash({ node, importsMap, paramParsersMap }) {
	const param = node.value.hashParams[0];
	if (!param) return "";
	importsMap.add("vue-router/experimental", "MatcherPatternHashParam");
	const parser = generateParamParserOptions(param, importsMap, paramParsersMap);
	const args = [require_options.toStringLiteral(param.paramName)];
	if (parser || param.defaultValue !== void 0 || param.required) args.push(parser || "{}");
	if (param.defaultValue !== void 0 || param.required) args.push(param.defaultValue ?? "undefined");
	if (param.required) args.push("true");
	return `hash: new MatcherPatternHashParam(${args.join(", ")}),`;
}
//#endregion
//#region src/unplugin/codegen/generateDuplicateRoutesWarnings.ts
/**
* Generates runtime warnings for `_parent` conflicts.
*
* @param tree - prefix tree to scan
*
* @internal
*/
function generateDuplicatedRoutesWarnings(tree) {
	const conflicts = collectDuplicatedRouteNodes(tree);
	if (!conflicts.length) return "";
	return conflicts.flatMap((conflicts) => `console.warn('[vue-router] Conflicting files found for route "${conflicts.at(0).node.fullPath}":\\n${conflicts.map(({ filePath }) => `- ${filePath}`).join("\\n")}')`).join("\n");
}
//#endregion
//#region src/unplugin/codegen/generateAliasWarnings.ts
/**
* Generates runtime warnings for aliases that are not absolute paths.
*
* @param tree - prefix tree to scan
*
* @internal
*/
function generateAliasWarnings(tree) {
	const warnings = [];
	for (const node of tree.getChildrenDeepSorted()) for (const alias of node.value.alias) if (!require_options.isAbsolutePath(alias)) warnings.push(`console.warn('[vue-router] Alias "${alias}" for route "${node.value.fullPath}" must be absolute (start with "/"). Relative aliases are not supported in file-based routing.')`);
	return warnings.join("\n");
}
//#endregion
//#region src/unplugin/core/context.ts
function createRoutesContext(options) {
	const { dts: preferDTS, root, routesFolder } = options;
	const dts = preferDTS === false ? false : preferDTS === true ? (0, pathe.resolve)(root, "typed-router.d.ts") : (0, pathe.resolve)(root, preferDTS);
	const dtsDir = dts ? (0, pathe.dirname)(dts) : root;
	const routeTree = new PrefixTree(options);
	const editableRoutes = new EditableTreeNode(routeTree);
	const logger = new Proxy(console, { get(target, prop) {
		const res = Reflect.get(target, prop);
		if (typeof res === "function") return options.logs ? res : () => {};
		return res;
	} });
	const watchers = [];
	const paramParsersMap = /* @__PURE__ */ new Map();
	async function scanPages(startWatchers = true) {
		if (options.extensions.length < 1) throw new Error("\"extensions\" cannot be empty. Please specify at least one extension.");
		if (watchers.length > 0) return;
		const paramParsersInclude = options.experimental.paramParsers?.include ?? [];
		const paramParsersExclude = options.experimental.paramParsers?.exclude ?? [];
		const isParamParserExcluded = paramParsersExclude.length ? (0, picomatch.default)(paramParsersExclude) : () => false;
		const isParamParserIncluded = paramParsersInclude.length ? (0, picomatch.default)(paramParsersInclude) : () => false;
		await Promise.all([...routesFolder.map((folder) => resolveFolderOptions(options, folder)).map((folder) => {
			if (startWatchers) watchers.push(setupWatcher(new RoutesFolderWatcher(folder)));
			const ignorePattern = folder.exclude.map((f) => f.startsWith("**") ? f : (0, pathe.relative)(folder.src, f));
			return (0, tinyglobby.glob)(folder.pattern, {
				cwd: folder.src,
				ignore: ignorePattern,
				expandDirectories: false
			}).then((files) => Promise.all(files.map((file) => (0, pathe.resolve)(folder.src, file)).map((file) => addPage({
				routePath: require_options.asRoutePath(folder, file),
				filePath: file
			}))));
		}), ...options.experimental.paramParsers?.dir.map((folder) => {
			if (startWatchers) watchers.push(setupParamParserWatcher((0, chokidar.watch)(".", {
				cwd: folder,
				ignoreInitial: true,
				ignorePermissionErrors: true,
				ignored: (filePath, stats) => {
					if (!stats || stats.isDirectory()) return false;
					const fileName = (0, pathe.relative)(folder, filePath);
					return !isParamParserIncluded(fileName) || isParamParserExcluded(fileName);
				}
			}), folder));
			return scanParamParserFiles(folder, paramParsersInclude, paramParsersExclude).then(async (paramParserFiles) => {
				await Promise.all(paramParserFiles.map((file) => addParamParserToMap(file, folder, dtsDir, paramParsersMap)));
				logger.log("Parsed param parsers", [...paramParsersMap].map((p) => p[0]));
			});
		}) || []]);
		for (const route of editableRoutes) await options.extendRoute?.(route);
		await _writeConfigFiles();
	}
	async function writeRouteInfoToNode(node, filePath) {
		const content = await node_fs.promises.readFile(filePath, "utf8");
		const definedPageInfo = extractDefinePageInfo(content, filePath);
		node.setDefinePageImport(filePath, definedPageInfo?.hasRemainingProperties ?? false);
		const routeBlock = getRouteBlock(filePath, content, options);
		node.setCustomRouteBlock(filePath, {
			...routeBlock,
			...definedPageInfo
		});
		server?.invalidatePage(filePath);
	}
	async function addPage({ filePath, routePath }, triggerExtendRoute = false) {
		logger.log(`added "${routePath}" for "${filePath}"`);
		const node = routeTree.insert(routePath, filePath);
		await writeRouteInfoToNode(node, filePath);
		if (triggerExtendRoute) await options.extendRoute?.(new EditableTreeNode(node));
		server?.updateRoutes();
	}
	async function updatePage({ filePath, routePath }) {
		logger.log(`updated "${routePath}" for "${filePath}"`);
		const node = routeTree.getChild(filePath);
		if (!node) {
			logger.warn(`Cannot update "${filePath}": Not found.`);
			return;
		}
		await writeRouteInfoToNode(node, filePath);
		await options.extendRoute?.(new EditableTreeNode(node));
		server?.updateRoutes();
	}
	function removePage({ filePath, routePath }) {
		logger.log(`remove "${routePath}" for "${filePath}"`);
		routeTree.removeChild(filePath);
		server?.updateRoutes();
	}
	function setupParamParserWatcher(watcher, cwd) {
		logger.log(`🤖 Scanning param parsers in ${cwd}`);
		return watcher.on("add", async (file) => {
			await addParamParserToMap(file, cwd, dtsDir, paramParsersMap);
			writeConfigFiles();
		}).on("change", async (file) => {
			await addParamParserToMap(file, cwd, dtsDir, paramParsersMap);
			writeConfigFiles();
		}).on("unlink", (file) => {
			paramParsersMap.delete((0, pathe.parse)(file).name);
			writeConfigFiles();
		});
	}
	function setupWatcher(watcher) {
		logger.log(`🤖 Scanning files in ${watcher.src}`);
		return watcher.on("change", async (ctx) => {
			await updatePage(ctx);
			writeConfigFiles();
		}).on("add", async (ctx) => {
			await addPage(ctx, true);
			writeConfigFiles();
		}).on("unlink", (ctx) => {
			removePage(ctx);
			writeConfigFiles();
		});
	}
	function generateResolver() {
		const importsMap = new require_options.ImportsMap();
		const resolverCode = generateRouteResolver(routeTree, options, importsMap, paramParsersMap);
		let imports = importsMap.toString();
		if (imports) imports += "\n";
		const missingParsers = collectMissingParamParsers(routeTree, paramParsersMap);
		let missingParserErrors = "";
		if (missingParsers.length > 0) missingParserErrors = "\n" + missingParsers.map(({ parser, routePath, filePaths }) => `console.error('[vue-router] Parameter parser "${parser}" not found for route "${routePath}". File: ${filePaths.join(", ")}')`).join("\n") + "\n";
		const routeDupsWarns = generateDuplicatedRoutesWarnings(routeTree);
		const aliasWarns = generateAliasWarnings(routeTree);
		const hmr = require_options.ts`
export function handleHotUpdate(_router, _hotUpdateCallback) {
  if (import.meta.hot) {
    import.meta.hot.data.router = _router
    import.meta.hot.data.router_hotUpdateCallback = _hotUpdateCallback
  }
}

if (import.meta.hot) {
  import.meta.hot.accept((mod) => {
    const router = import.meta.hot.data.router
    if (!router) {
      import.meta.hot.invalidate('[vue-router:HMR] Cannot replace the resolver because there is no active router. Reloading.')
      return
    }
    router._hmrReplaceResolver(mod.resolver)
    // call the hotUpdateCallback for custom updates
    import.meta.hot.data.router_hotUpdateCallback?.(mod.resolver)
    const route = router.currentRoute.value
    router.replace({
      path: route.path,
      query: route.query,
      hash: route.hash,
      force: true
    })
  })
}`;
		return `${imports}${routeDupsWarns}\n${aliasWarns}\n${missingParserErrors}${resolverCode}\n${hmr}`;
	}
	function generateRoutes() {
		const importsMap = new require_options.ImportsMap();
		const routeList = `export const routes = ${generateRouteRecords(routeTree, options, importsMap)}\n`;
		const hmr = require_options.ts`
export function handleHotUpdate(_router, _hotUpdateCallback) {
  if (import.meta.hot) {
    import.meta.hot.data.router = _router
    import.meta.hot.data.router_hotUpdateCallback = _hotUpdateCallback
  }
}

if (import.meta.hot) {
  import.meta.hot.accept((mod) => {
    const router = import.meta.hot.data.router
    if (!router) {
      import.meta.hot.invalidate('[vue-router:HMR] Cannot replace the routes because there is no active router. Reloading.')
      return
    }
    router.clearRoutes()
    for (const route of mod.routes) {
      router.addRoute(route)
    }
    // call the hotUpdateCallback for custom updates
    import.meta.hot.data.router_hotUpdateCallback?.(mod.routes)
    const route = router.currentRoute.value
    router.replace({
      ...route,
      // NOTE: we should be able to just do ...route but the router
      // currently skips resolving and can give errors with renamed routes
      // so we explicitly set remove matched and name
      name: undefined,
      matched: undefined,
      force: true
    })
  })
}
`;
		let imports = importsMap.toString();
		if (imports) imports += "\n";
		const routeDupsWarns = generateDuplicatedRoutesWarnings(routeTree);
		return `${imports}${routeDupsWarns}\n${routeList}${hmr}\n`;
	}
	function generateDTS$1() {
		if (options.experimental.paramParsers?.dir.length) warnMissingParamParsers(routeTree, paramParsersMap);
		return generateDTS({
			routesModule: MODULE_ROUTES_PATH,
			routeNamedMap: generateRouteNamedMap(routeTree, options, paramParsersMap),
			routeFileInfoMap: generateRouteFileInfoMap(routeTree, { root }),
			paramsTypesDeclaration: generateParamParsersTypesDeclarations(paramParsersMap),
			customParamsTypeList: generateCustomParamParsersList(paramParsersMap)
		});
	}
	let lastDTS;
	async function _writeConfigFiles() {
		logger.time("writeConfigFiles");
		if (options.beforeWriteFiles) {
			await options.beforeWriteFiles(editableRoutes);
			logger.timeLog("writeConfigFiles", "beforeWriteFiles()");
		}
		require_options.logTree(routeTree, logger.log);
		if (dts) {
			const content = generateDTS$1();
			if (lastDTS !== content) {
				await node_fs.promises.mkdir((0, pathe.dirname)(dts), { recursive: true });
				await node_fs.promises.writeFile(dts, content, "utf-8");
				logger.timeLog("writeConfigFiles", "wrote dts file");
				lastDTS = content;
				server?.updateRoutes();
			}
		}
		logger.timeEnd("writeConfigFiles");
	}
	const writeConfigFiles = require_options.throttle(_writeConfigFiles, 500, 100);
	function stopWatcher() {
		if (watchers.length) {
			logger.log("🛑 stopping watcher");
			watchers.forEach((watcher) => watcher.close());
		}
	}
	let server;
	function setServerContext(_server) {
		server = _server;
	}
	return {
		scanPages,
		writeConfigFiles,
		setServerContext,
		stopWatcher,
		generateRoutes,
		generateResolver,
		definePageTransform(code, id) {
			return definePageTransform({
				code,
				id
			});
		}
	};
}
//#endregion
//#region src/unplugin/core/vite/index.ts
function createViteContext(server) {
	function invalidate(path) {
		const foundModule = server.moduleGraph.getModuleById(path);
		if (foundModule) return server.reloadModule(foundModule);
		return !!foundModule;
	}
	function invalidatePage(filepath) {
		const pageModules = server.moduleGraph.getModulesByFile(filepath);
		if (pageModules) return Promise.all([...pageModules].map((mod) => server.reloadModule(mod))).then(() => {});
		return false;
	}
	function reload() {
		server.ws.send({
			type: "full-reload",
			path: "*"
		});
	}
	/**
	* Triggers HMR for the vue-router/auto-routes module.
	*/
	async function updateRoutes() {
		const autoRoutesMod = server.moduleGraph.getModuleById(asVirtualId(MODULE_ROUTES_PATH));
		const autoResolvedMod = server.moduleGraph.getModuleById(asVirtualId(MODULE_RESOLVER_PATH));
		await Promise.all([autoRoutesMod && server.reloadModule(autoRoutesMod), autoResolvedMod && server.reloadModule(autoResolvedMod)]);
	}
	return {
		invalidate,
		invalidatePage,
		updateRoutes,
		reload
	};
}
//#endregion
//#region src/utils/index.ts
/**
* Checks if a path is absolute, meaning it starts with a `/`.
*
* @param path - path to check
*
* @internal
*/
const isAbsolutePath = (path) => path.startsWith("/");
Array.isArray;
//#endregion
//#region src/experimental/data-loaders/auto-exports.ts
function extractLoadersToExport(code, filterPaths, root) {
	return (0, mlly.findStaticImports)(code).flatMap((i) => {
		const parsed = (0, mlly.parseStaticImport)(i);
		if (!filterPaths((0, pathe.resolve)(root, isAbsolutePath(parsed.specifier) ? parsed.specifier.slice(1) : parsed.specifier))) return [];
		return [parsed.defaultImport, ...Object.values(parsed.namedImports || {})].filter((v) => !!v && !v.startsWith("_"));
	});
}
const PLUGIN_NAME = "vue-router:data-loaders-auto-export";
/**
* Vite Plugin to automatically export loaders from page components.
*
* @param options Options
* @experimental - This API is experimental and can be changed in the future. It's used internally by `experimental.autoExportsDataLoaders`

*/
function AutoExportLoaders({ transformFilter, loadersPathsGlobs, root = process.cwd() }) {
	const filterPaths = (0, unplugin_utils.createFilter)(loadersPathsGlobs);
	return {
		name: PLUGIN_NAME,
		transform: {
			order: "post",
			filter: { id: transformFilter },
			handler(code) {
				const loadersToExports = extractLoadersToExport(code, filterPaths, root);
				if (loadersToExports.length <= 0) return;
				const s = new magic_string.default(code);
				s.append(`\nexport const __loaders = [\n${loadersToExports.join(",\n")}\n];\n`);
				return {
					code: s.toString(),
					map: s.generateMap()
				};
			}
		}
	};
}
function createAutoExportPlugin(options) {
	return {
		name: PLUGIN_NAME,
		vite: AutoExportLoaders(options)
	};
}
//#endregion
//#region src/unplugin/index.ts
var unplugin_default = (0, unplugin.createUnplugin)((opt = {}, _meta) => {
	const options = require_options.resolveOptions(opt);
	const ctx = createRoutesContext(options);
	function getVirtualId$1(id) {
		if (options._inspect) return id;
		return getVirtualId(id);
	}
	function asVirtualId$1(id) {
		if (options._inspect) return id;
		return asVirtualId(id);
	}
	const pageFilePattern = require_options.appendExtensionListToPattern(options.filePatterns, require_options.mergeAllExtensions(options));
	const IDS_TO_INCLUDE = options.routesFolder.flatMap((routeOption) => pageFilePattern.map((pattern) => (0, pathe.join)(routeOption.src, pattern)));
	const plugins = [{
		name: "vue-router",
		enforce: "pre",
		resolveId: {
			filter: { id: new RegExp(`^${MODULE_ROUTES_PATH}$|^${MODULE_RESOLVER_PATH}$|${routeBlockQueryRE.source}`) },
			handler(id) {
				if (id === MODULE_ROUTES_PATH || id === MODULE_RESOLVER_PATH) return asVirtualId$1(id);
				return ROUTE_BLOCK_ID;
			}
		},
		async buildStart() {
			await ctx.scanPages(options.watch);
		},
		buildEnd() {
			ctx.stopWatcher();
		},
		transform: {
			filter: { id: {
				include: [...IDS_TO_INCLUDE, DEFINE_PAGE_QUERY_RE],
				exclude: options.exclude
			} },
			handler(code, id) {
				return ctx.definePageTransform(code, id);
			}
		},
		load: {
			filter: { id: { include: [
				new RegExp(`^${ROUTE_BLOCK_ID}$`),
				new RegExp(`^ ${MODULE_ROUTES_PATH}$`),
				new RegExp(`^ ${MODULE_RESOLVER_PATH}$`)
			] } },
			handler(id) {
				if (id === ROUTE_BLOCK_ID) return {
					code: `export default {}`,
					map: null
				};
				const resolvedId = getVirtualId$1(id);
				if (resolvedId === MODULE_ROUTES_PATH) {
					ROUTES_LAST_LOAD_TIME.update();
					return ctx.generateRoutes();
				}
				if (resolvedId === MODULE_RESOLVER_PATH) {
					ROUTES_LAST_LOAD_TIME.update();
					return ctx.generateResolver();
				}
			}
		},
		vite: { configureServer(server) {
			ctx.setServerContext(createViteContext(server));
		} }
	}];
	if (options.experimental.autoExportsDataLoaders) plugins.push(createAutoExportPlugin({
		transformFilter: {
			include: IDS_TO_INCLUDE,
			exclude: options.exclude
		},
		loadersPathsGlobs: options.experimental.autoExportsDataLoaders,
		root: options.root
	}));
	return plugins;
});
/**
* Adds useful auto imports to the AutoImport config:
* @example
* ```js
* import { VueRouterAutoImports } from 'vue-router/unplugin'
*
* AutoImport({
*   imports: [VueRouterAutoImports],
* }),
* ```
*/
const VueRouterAutoImports = {
	"vue-router": [
		"useRoute",
		"useRouter",
		"onBeforeRouteUpdate",
		"onBeforeRouteLeave"
	],
	"vue-router/experimental": ["definePage"]
};
//#endregion
Object.defineProperty(exports, "AutoExportLoaders", {
	enumerable: true,
	get: function() {
		return AutoExportLoaders;
	}
});
Object.defineProperty(exports, "EditableTreeNode", {
	enumerable: true,
	get: function() {
		return EditableTreeNode;
	}
});
Object.defineProperty(exports, "VueRouterAutoImports", {
	enumerable: true,
	get: function() {
		return VueRouterAutoImports;
	}
});
Object.defineProperty(exports, "createRoutesContext", {
	enumerable: true,
	get: function() {
		return createRoutesContext;
	}
});
Object.defineProperty(exports, "createTreeNodeValue", {
	enumerable: true,
	get: function() {
		return createTreeNodeValue;
	}
});
Object.defineProperty(exports, "unplugin_default", {
	enumerable: true,
	get: function() {
		return unplugin_default;
	}
});
