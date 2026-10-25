import { a as __toCommonJS, i as __require, t as __commonJSMin } from "./chunk-HkwdBwDg.js";
import { n as init_babel, t as babel_exports } from "./babel-Cs312VeV.js";
import { n as prettier_exports, t as init_prettier } from "./prettier-D7Ly-aG0.js";
//#region ../../node_modules/.pnpm/prettier-plugin-svelte@3.5.2_prettier@3.8.3_svelte@5.55.7_@typescript-eslint+types@8.59.3_/node_modules/prettier-plugin-svelte/plugin.js
var require_plugin = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	var prettierPluginBabel = (init_babel(), __toCommonJS(babel_exports));
	var prettier = (init_prettier(), __toCommonJS(prettier_exports));
	var compiler = __require("svelte/compiler");
	function _interopNamespace(e) {
		if (e && e.__esModule) return e;
		var n = Object.create(null);
		if (e) Object.keys(e).forEach(function(k) {
			if (k !== "default") {
				var d = Object.getOwnPropertyDescriptor(e, k);
				Object.defineProperty(n, k, d.get ? d : {
					enumerable: true,
					get: function() {
						return e[k];
					}
				});
			}
		});
		n["default"] = e;
		return Object.freeze(n);
	}
	/******************************************************************************
	Copyright (c) Microsoft Corporation.
	
	Permission to use, copy, modify, and/or distribute this software for any
	purpose with or without fee is hereby granted.
	
	THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
	REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
	AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
	INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
	LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
	OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
	PERFORMANCE OF THIS SOFTWARE.
	***************************************************************************** */
	function __awaiter(thisArg, _arguments, P, generator) {
		function adopt(value) {
			return value instanceof P ? value : new P(function(resolve) {
				resolve(value);
			});
		}
		return new (P || (P = Promise))(function(resolve, reject) {
			function fulfilled(value) {
				try {
					step(generator.next(value));
				} catch (e) {
					reject(e);
				}
			}
			function rejected(value) {
				try {
					step(generator["throw"](value));
				} catch (e) {
					reject(e);
				}
			}
			function step(result) {
				result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
			}
			step((generator = generator.apply(thisArg, _arguments || [])).next());
		});
	}
	const selfClosingTags = [
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
	];
	const blockElements = [
		"address",
		"article",
		"aside",
		"blockquote",
		"details",
		"dialog",
		"dd",
		"div",
		"dl",
		"dt",
		"fieldset",
		"figcaption",
		"figure",
		"footer",
		"form",
		"h1",
		"h2",
		"h3",
		"h4",
		"h5",
		"h6",
		"header",
		"hgroup",
		"hr",
		"li",
		"main",
		"nav",
		"ol",
		"p",
		"pre",
		"section",
		"table",
		"ul"
	];
	/**
	* HTML attributes that we may safely reformat (trim whitespace, add or remove newlines)
	*/
	const formattableAttributes = [];
	const stringToBase64 = typeof Buffer !== "undefined" ? (str) => Buffer.from(str).toString("base64") : (str) => btoa(new TextEncoder().encode(str).reduce((acc, byte) => acc + String.fromCharCode(byte), ""));
	const base64ToString = typeof Buffer !== "undefined" ? (str) => Buffer.from(str, "base64").toString() : (str) => new TextDecoder().decode(Uint8Array.from(atob(str), (c) => c.charCodeAt(0)));
	const snippedTagContentAttribute = "✂prettier:content✂";
	const scriptRegex = /<!--[^]*?-->|<script((?:\s+[^=>'"\/\s]+=(?:"[^"]*"|'[^']*'|[^>\s]+)|\s+[^=>'"\/\s]+)*\s*)>([^]*?)<\/script>/g;
	const styleRegex = /<!--[^]*?-->|<style((?:\s+[^=>'"\/\s]+=(?:"[^"]*"|'[^']*'|[^>\s]+)|\s+[^=>'"\/\s]+)*\s*)>([^]*?)<\/style>/g;
	const langTsRegex = /\slang=["']?ts["']?/;
	function snipScriptAndStyleTagContent(source) {
		let scriptMatchSpans = getMatchIndexes("script");
		let styleMatchSpans = getMatchIndexes("style");
		let isTypescript = false;
		return {
			text: snipTagContent(snipTagContent(source, "script", "{}", styleMatchSpans), "style", "", scriptMatchSpans),
			isTypescript
		};
		function getMatchIndexes(tagName) {
			const regex = getRegexp(tagName);
			const indexes = [];
			let match = null;
			while ((match = regex.exec(source)) != null) if (source.slice(match.index, match.index + 4) !== "<!--") indexes.push([match.index, regex.lastIndex]);
			return indexes;
		}
		function snipTagContent(_source, tagName, placeholder, otherSpans) {
			const regex = getRegexp(tagName);
			let newScriptMatchSpans = scriptMatchSpans;
			let newStyleMatchSpans = styleMatchSpans;
			const newSource = _source.replace(regex, (match, attributes, content, index) => {
				if (match.startsWith("<!--") || withinOtherSpan(index)) return match;
				if (langTsRegex.test(attributes)) isTypescript = true;
				const newContent = `<${tagName}${attributes} ${snippedTagContentAttribute}="${stringToBase64(content)}">${placeholder}</${tagName}>`;
				const lengthDiff = match.length - newContent.length;
				newScriptMatchSpans = adjustSpans(scriptMatchSpans, newScriptMatchSpans);
				newStyleMatchSpans = adjustSpans(styleMatchSpans, newStyleMatchSpans);
				function adjustSpans(oldSpans, newSpans) {
					return oldSpans.map((oldSpan, idx) => {
						const newSpan = newSpans[idx];
						if (oldSpan[0] > index) return [newSpan[0] - lengthDiff, newSpan[1] - lengthDiff];
						else if (oldSpan[0] === index) return [newSpan[0], newSpan[1] - lengthDiff];
						else return newSpan;
					});
				}
				return newContent;
			});
			scriptMatchSpans = newScriptMatchSpans;
			styleMatchSpans = newStyleMatchSpans;
			return newSource;
			function withinOtherSpan(idx) {
				return otherSpans.some((otherSpan) => idx > otherSpan[0] && idx < otherSpan[1]);
			}
		}
		function getRegexp(tagName) {
			return tagName === "script" ? scriptRegex : styleRegex;
		}
	}
	function hasSnippedContent(text) {
		return text.includes(snippedTagContentAttribute);
	}
	const regex = /(<\w+.*?)\s*✂prettier:content✂="(.*?)">.*?(?=<\/)/gi;
	function unsnipContent(text) {
		return text.replace(regex, (_, start, encodedContent) => {
			return `${start}>${base64ToString(encodedContent)}`;
		});
	}
	function makeChoice(choice) {
		return {
			value: choice,
			description: choice
		};
	}
	const options = {
		svelte5CompilerPath: {
			category: "Svelte",
			type: "string",
			default: "",
			description: "Only set this when using Svelte 5! Path to the Svelte 5 compiler"
		},
		svelteSortOrder: {
			category: "Svelte",
			type: "choice",
			default: "options-scripts-markup-styles",
			description: "Sort order for scripts, markup, and styles",
			choices: [
				makeChoice("options-scripts-markup-styles"),
				makeChoice("options-scripts-styles-markup"),
				makeChoice("options-markup-styles-scripts"),
				makeChoice("options-markup-scripts-styles"),
				makeChoice("options-styles-markup-scripts"),
				makeChoice("options-styles-scripts-markup"),
				makeChoice("scripts-options-markup-styles"),
				makeChoice("scripts-options-styles-markup"),
				makeChoice("markup-options-styles-scripts"),
				makeChoice("markup-options-scripts-styles"),
				makeChoice("styles-options-markup-scripts"),
				makeChoice("styles-options-scripts-markup"),
				makeChoice("scripts-markup-options-styles"),
				makeChoice("scripts-styles-options-markup"),
				makeChoice("markup-styles-options-scripts"),
				makeChoice("markup-scripts-options-styles"),
				makeChoice("styles-markup-options-scripts"),
				makeChoice("styles-scripts-options-markup"),
				makeChoice("scripts-markup-styles-options"),
				makeChoice("scripts-styles-markup-options"),
				makeChoice("markup-styles-scripts-options"),
				makeChoice("markup-scripts-styles-options"),
				makeChoice("styles-markup-scripts-options"),
				makeChoice("styles-scripts-markup-options"),
				makeChoice("none")
			]
		},
		svelteStrictMode: {
			category: "Svelte",
			type: "boolean",
			default: false,
			description: "More strict HTML syntax: Quotes in attributes, no self-closing DOM tags"
		},
		svelteBracketNewLine: {
			category: "Svelte",
			type: "boolean",
			description: "Put the `>` of a multiline element on a new line",
			deprecated: "2.5.0"
		},
		svelteAllowShorthand: {
			category: "Svelte",
			type: "boolean",
			default: true,
			description: "Option to enable/disable component attribute shorthand if attribute name and expressions are same"
		},
		svelteIndentScriptAndStyle: {
			category: "Svelte",
			type: "boolean",
			default: true,
			description: "Whether or not to indent the code inside <script> and <style> tags in Svelte files"
		}
	};
	const sortOrderSeparator = "-";
	function parseSortOrder(sortOrder = "options-scripts-markup-styles") {
		if (sortOrder === "none") return [];
		const order = sortOrder.split(sortOrderSeparator);
		if (!order.includes("options")) throw new Error("svelteSortOrder is missing option `options`");
		return order;
	}
	function isBracketSameLine(options) {
		return options.svelteBracketNewLine != null ? !options.svelteBracketNewLine : options.bracketSameLine != null ? options.bracketSameLine : false;
	}
	/**
	* Determines whether or not given node
	* is the root of the Svelte AST.
	*/
	function isASTNode(n) {
		return n && n.__isRoot;
	}
	function isPreTagContent(path) {
		return path.stack.some((node) => node.type === "Element" && node.name.toLowerCase() === "pre" || node.type === "Attribute" && !formattableAttributes.includes(node.name));
	}
	function flatten(arrays) {
		return [].concat.apply([], arrays);
	}
	function findLastIndex(isMatch, items) {
		for (let i = items.length - 1; i >= 0; i--) if (isMatch(items[i], i)) return i;
		return -1;
	}
	function replaceEndOfLineWith(text, replacement) {
		const parts = [];
		for (const part of text.split("\n")) {
			if (parts.length > 0) parts.push(replacement);
			if (part.endsWith("\r")) parts.push(part.slice(0, -1));
			else parts.push(part);
		}
		return parts;
	}
	function getAttributeLine(node, options) {
		const { hardline, line } = prettier.doc.builders;
		const hasThisBinding = node.type === "InlineComponent" && !!node.expression || node.type === "Element" && !!node.tag;
		const attributes = node.attributes.filter((attribute) => attribute.name !== snippedTagContentAttribute);
		return options.singleAttributePerLine && (attributes.length > 1 || attributes.length && hasThisBinding) ? hardline : line;
	}
	function printWithPrependedAttributeLine(node, options, print) {
		return (path) => path.getNode().name !== snippedTagContentAttribute ? [getAttributeLine(node, options), path.call(print)] : "";
	}
	/**
	* Check if doc is a hardline.
	* We can't just rely on a simple equality check because the doc could be created with another
	* runtime version of prettier than what we import, making a reference check fail.
	*/
	function isHardline(docToCheck) {
		return docToCheck === prettier.doc.builders.hardline || deepEqual(docToCheck, prettier.doc.builders.hardline);
	}
	/**
	* Simple deep equal function which suits our needs. Only works properly on POJOs without cyclic deps.
	*/
	function deepEqual(x, y) {
		if (x === y) return true;
		else if (typeof x == "object" && x != null && typeof y == "object" && y != null) {
			if (Object.keys(x).length != Object.keys(y).length) return false;
			for (var prop in x) if (y.hasOwnProperty(prop)) {
				if (!deepEqual(x[prop], y[prop])) return false;
			} else return false;
			return true;
		} else return false;
	}
	function isDocCommand(doc) {
		return typeof doc === "object" && doc !== null;
	}
	function isLine(docToCheck) {
		return isHardline(docToCheck) || isDocCommand(docToCheck) && docToCheck.type === "line" || Array.isArray(docToCheck) && docToCheck.every(isLine);
	}
	/**
	* Check if the doc is empty, i.e. consists of nothing more than empty strings (possibly nested).
	*/
	function isEmptyDoc(doc) {
		if (typeof doc === "string") return doc.length === 0;
		if (isDocCommand(doc) && doc.type === "line") return !doc.keepIfLonely;
		if (Array.isArray(doc)) return doc.length === 0;
		const { contents } = doc;
		if (contents) return isEmptyDoc(contents);
		const { parts } = doc;
		if (parts) return isEmptyGroup(parts);
		return false;
	}
	function isEmptyGroup(group) {
		return !group.find((doc) => !isEmptyDoc(doc));
	}
	/**
	* Trims both leading and trailing nodes matching `isWhitespace` independent of nesting level
	* (though all trimmed adjacent nodes need to be a the same level). Modifies the `docs` array.
	*/
	function trim(docs, isWhitespace) {
		trimLeft(docs, isWhitespace);
		trimRight(docs, isWhitespace);
		return docs;
	}
	/**
	* Trims the leading nodes matching `isWhitespace` independent of nesting level (though all nodes need to be a the same level).
	* If there are empty docs before the first whitespace, they are removed, too.
	*/
	function trimLeft(group, isWhitespace) {
		let firstNonWhitespace = group.findIndex((doc) => !isEmptyDoc(doc) && !isWhitespace(doc));
		if (firstNonWhitespace < 0 && group.length) firstNonWhitespace = group.length;
		if (firstNonWhitespace > 0) {
			if (group.splice(0, firstNonWhitespace).every(isEmptyDoc)) return trimLeft(group, isWhitespace);
		} else {
			const parts = getParts(group[0]);
			if (parts) return trimLeft(parts, isWhitespace);
		}
	}
	/**
	* Trims the trailing nodes matching `isWhitespace` independent of nesting level (though all nodes need to be a the same level).
	* If there are empty docs after the last whitespace, they are removed, too.
	*/
	function trimRight(group, isWhitespace) {
		let lastNonWhitespace = group.length ? findLastIndex((doc) => !isEmptyDoc(doc) && !isWhitespace(doc), group) : 0;
		if (lastNonWhitespace < group.length - 1) {
			if (group.splice(lastNonWhitespace + 1).every(isEmptyDoc)) return trimRight(group, isWhitespace);
		} else {
			const parts = getParts(group[group.length - 1]);
			if (parts) return trimRight(parts, isWhitespace);
		}
	}
	function getParts(doc) {
		if (typeof doc === "object") {
			if (Array.isArray(doc)) return doc;
			if (doc.type === "fill") return doc.parts;
			if (doc.type === "group") return getParts(doc.contents);
		}
	}
	/**
	* `(foo = bar)` => `foo = bar`
	* Also handles leading comments and line breaks before "(".
	*/
	function removeParentheses(doc) {
		if (!Array.isArray(doc)) return trim([doc], (_doc) => _doc === "(" || _doc === ")")[0];
		const transformed = [];
		let i = 0;
		let opened = false;
		for (; i < doc.length; i++) {
			const part = doc[i];
			if (typeof part === "string" && part.startsWith("//")) transformed.push(part);
			else if (typeof part === "string" && part.startsWith("/*")) {
				transformed.push(part);
				opened = true;
			} else if (opened) {
				transformed.push(part);
				opened = typeof part !== "string" || !part.trim().endsWith("*/");
			} else if (transformed.length > 0 && isLine(part)) {
				transformed.push(part);
				i++;
				const next = doc[i];
				if (typeof next !== "string" && !Array.isArray(next) && next.type === "break-parent") {
					transformed.push(next);
					i++;
				}
				break;
			} else break;
		}
		transformed.push(...trim(doc.slice(i), (_doc) => _doc === "(" || _doc === ")"));
		return transformed;
	}
	const unsupportedLanguages = [
		"coffee",
		"coffeescript",
		"styl",
		"stylus",
		"sass"
	];
	/**
	* Characters treated as interchangeable/collapsible HTML whitespace for layout.
	* Excludes NBSP (U+00A0) and other Unicode separators — see prettier/prettier#5796.
	*/
	const ONLY_HTML_COLLAPSE_WHITESPACE_RE = /^[\t\n\f\r ]*$/;
	const STARTS_WITH_HTML_COLLAPSE_WHITESPACE_RE = /^[\t\n\f\r ]/;
	const ENDS_WITH_HTML_COLLAPSE_WHITESPACE_RE = /[\t\n\f\r ]$/;
	const LEADING_HTML_COLLAPSE_WHITESPACE_RE = /^[\t\n\f\r ]+/;
	const TRAILING_HTML_COLLAPSE_WHITESPACE_RE = /[\t\n\f\r ]+$/;
	function isOnlyHtmlCollapseWhitespace(text) {
		return ONLY_HTML_COLLAPSE_WHITESPACE_RE.test(text);
	}
	function isInlineElement(path, options, node) {
		return node && node.type === "Element" && !isBlockElement(node, options) && !isPreTagContent(path);
	}
	function isBlockElement(node, options) {
		return node && node.type === "Element" && options.htmlWhitespaceSensitivity !== "strict" && (options.htmlWhitespaceSensitivity === "ignore" || blockElements.includes(node.name));
	}
	function isSvelteBlock(node) {
		return [
			"IfBlock",
			"SnippetBlock",
			"AwaitBlock",
			"CatchBlock",
			"EachBlock",
			"ElseBlock",
			"KeyBlock",
			"PendingBlock",
			"ThenBlock"
		].includes(node.type);
	}
	function isNodeWithChildren(node) {
		return node.children;
	}
	function getChildren(node) {
		return isNodeWithChildren(node) ? node.children : [];
	}
	/**
	* Returns siblings, that is, the children of the parent.
	*/
	function getSiblings(path) {
		let parent = path.getParentNode();
		if (isASTNode(parent)) parent = parent.html;
		return getChildren(parent);
	}
	/**
	* Returns the next sibling node.
	*/
	function getNextNode(path, node = path.getNode()) {
		return getSiblings(path).find((child) => child.start === node.end);
	}
	/**
	* Returns the comment that is above the current node.
	*/
	function getLeadingComment(path) {
		const siblings = getSiblings(path);
		let node = path.getNode();
		let prev = siblings.find((child) => child.end === node.start);
		while (prev) if (prev.type === "Comment" && !isIgnoreStartDirective(prev) && !isIgnoreEndDirective(prev)) return prev;
		else if (isEmptyTextNode(prev)) {
			node = prev;
			prev = siblings.find((child) => child.end === node.start);
		} else return;
	}
	/**
	* Did there use to be any embedded object (that has been snipped out of the AST to be moved)
	* at the specified position?
	*/
	function doesEmbedStartAfterNode(node, path, siblings = getSiblings(path)) {
		if (!isNodeTopLevelHTML(node, path)) return false;
		const position = node.end;
		const root = path.stack[0];
		const embeds = [
			root.css,
			root.html,
			root.instance,
			root.js,
			root.module
		];
		const nextNode = siblings[siblings.indexOf(node) + 1];
		return embeds.find((n) => n && n.start >= position && (!nextNode || n.end <= nextNode.start));
	}
	function isNodeTopLevelHTML(node, path) {
		const root = path.stack[0];
		return !!root.html && !!root.html.children && root.html.children.includes(node);
	}
	function isEmptyTextNode(node) {
		return !!node && node.type === "Text" && isOnlyHtmlCollapseWhitespace(getUnencodedText(node));
	}
	function isIgnoreDirective(node) {
		return !!node && node.type === "Comment" && node.data.trim() === "prettier-ignore";
	}
	function isIgnoreStartDirective(node) {
		return !!node && node.type === "Comment" && node.data.trim() === "prettier-ignore-start";
	}
	function isIgnoreEndDirective(node) {
		return !!node && node.type === "Comment" && node.data.trim() === "prettier-ignore-end";
	}
	function printRaw(node, originalText, stripLeadingAndTrailingNewline = false) {
		if (node.children.length === 0) return "";
		const firstChild = node.children[0];
		const lastChild = node.children[node.children.length - 1];
		let raw = originalText.substring(firstChild.start, lastChild.end);
		if (!stripLeadingAndTrailingNewline) return raw;
		if (startsWithLinebreak(raw)) raw = raw.substring(raw.indexOf("\n") + 1);
		if (endsWithLinebreak(raw)) {
			raw = raw.substring(0, raw.lastIndexOf("\n"));
			if (raw.charAt(raw.length - 1) === "\r") raw = raw.substring(0, raw.length - 1);
		}
		return raw;
	}
	function isTextNode(node) {
		return node.type === "Text";
	}
	function getAttributeValue(attributeName, node) {
		var _a;
		const langAttribute = ((_a = node.attributes) !== null && _a !== void 0 ? _a : []).find((attribute) => attribute.name === attributeName);
		return langAttribute && langAttribute.value;
	}
	function getAttributeTextValue(attributeName, node) {
		const value = getAttributeValue(attributeName, node);
		if (value != null && typeof value === "object") {
			const textValue = value.find(isTextNode);
			if (textValue) return textValue.data;
		}
		return null;
	}
	function getLangAttribute(node) {
		const value = getAttributeTextValue("lang", node) || getAttributeTextValue("type", node);
		if (value != null) return value.replace(/^text\//, "");
		else return null;
	}
	/**
	* Checks whether the node contains a `lang` or `type` attribute with a value corresponding to
	* a language we cannot format. This might for example be `<template lang="pug">`.
	* If the node does not contain a `lang` attribute, the result is true.
	*/
	function isNodeSupportedLanguage(node) {
		const lang = getLangAttribute(node);
		return !(lang && unsupportedLanguages.includes(lang));
	}
	/**
	* Checks whether the node contains a `lang` or `type` attribute which indicates that
	* the script contents are written in TypeScript. Note that the absence of the tag
	* does not mean it's not TypeScript, because the user could have set the default
	* to TypeScript in his settings.
	*/
	function isTypeScript(node) {
		const lang = getLangAttribute(node) || "";
		return ["typescript", "ts"].includes(lang);
	}
	function isJSON(node) {
		const lang = getLangAttribute(node) || "";
		return lang.endsWith("json") || lang.endsWith("importmap");
	}
	function isLess(node) {
		const lang = getLangAttribute(node) || "";
		return ["less"].includes(lang);
	}
	function isScss(node) {
		const lang = getLangAttribute(node) || "";
		return ["sass", "scss"].includes(lang);
	}
	function isPugTemplate(node) {
		return node.type === "Element" && node.name === "template" && getLangAttribute(node) === "pug";
	}
	function isLoneMustacheTag(node) {
		return node !== true && node.length === 1 && node[0].type === "MustacheTag";
	}
	function isAttributeShorthand(node) {
		return node !== true && node.length === 1 && node[0].type === "AttributeShorthand";
	}
	/**
	* True if node is of type `{a}` or `a={a}`
	*/
	function isOrCanBeConvertedToShorthand(node) {
		if (isAttributeShorthand(node.value)) return true;
		if (isLoneMustacheTag(node.value)) {
			const expression = node.value[0].expression;
			return expression.type === "Identifier" && expression.name === node.name;
		}
		return false;
	}
	function getUnencodedText(node) {
		return node.raw || node.data;
	}
	function isTextNodeStartingWithLinebreak(node, nrLines = 1) {
		return node.type === "Text" && startsWithLinebreak(getUnencodedText(node), nrLines);
	}
	function startsWithLinebreak(text, nrLines = 1) {
		return new RegExp(`^([\\t\\f\\r ]*\\n){${nrLines}}`).test(text);
	}
	function isTextNodeEndingWithLinebreak(node, nrLines = 1) {
		return node.type === "Text" && endsWithLinebreak(getUnencodedText(node), nrLines);
	}
	function endsWithLinebreak(text, nrLines = 1) {
		return new RegExp(`(\\n[\\t\\f\\r ]*){${nrLines}}$`).test(text);
	}
	function isTextNodeStartingWithWhitespace(node) {
		return node.type === "Text" && STARTS_WITH_HTML_COLLAPSE_WHITESPACE_RE.test(getUnencodedText(node));
	}
	function isTextNodeEndingWithWhitespace(node) {
		return node.type === "Text" && ENDS_WITH_HTML_COLLAPSE_WHITESPACE_RE.test(getUnencodedText(node));
	}
	function trimTextNodeRight(node) {
		node.raw = node.raw && node.raw.replace(TRAILING_HTML_COLLAPSE_WHITESPACE_RE, "");
		node.data = node.data && node.data.replace(TRAILING_HTML_COLLAPSE_WHITESPACE_RE, "");
	}
	function trimTextNodeLeft(node) {
		node.raw = node.raw && node.raw.replace(LEADING_HTML_COLLAPSE_WHITESPACE_RE, "");
		node.data = node.data && node.data.replace(LEADING_HTML_COLLAPSE_WHITESPACE_RE, "");
	}
	/**
	* Remove all leading whitespace up until the first non-empty text node,
	* and all trailing whitespace from the last non-empty text node onwards.
	*/
	function trimChildren(children, path) {
		let firstNonEmptyNode = children.findIndex((n) => !isEmptyTextNode(n) && !doesEmbedStartAfterNode(n, path));
		firstNonEmptyNode = firstNonEmptyNode === -1 ? children.length - 1 : firstNonEmptyNode;
		let lastNonEmptyNode = findLastIndex((n, idx) => {
			return !isEmptyTextNode(n) && (idx === children.length - 1 && n.type !== "Comment" || !doesEmbedStartAfterNode(n, path));
		}, children);
		lastNonEmptyNode = lastNonEmptyNode === -1 ? 0 : lastNonEmptyNode;
		for (let i = 0; i <= firstNonEmptyNode; i++) {
			const n = children[i];
			if (n.type === "Text") trimTextNodeLeft(n);
		}
		for (let i = children.length - 1; i >= lastNonEmptyNode; i--) {
			const n = children[i];
			if (n.type === "Text") trimTextNodeRight(n);
		}
	}
	/**
	* Check if given node's start tag should hug its first child. This is the case for inline elements when there's
	* no whitespace between the `>` and the first child.
	*/
	function shouldHugStart(node, isSupportedLanguage, options) {
		if (!isSupportedLanguage) return true;
		if (node.type === "SvelteBoundary") return false;
		if (isBlockElement(node, options)) return false;
		if (!isNodeWithChildren(node)) return false;
		const children = node.children;
		if (children.length === 0) return true;
		if (options.htmlWhitespaceSensitivity === "ignore") return false;
		const firstChild = children[0];
		return !isTextNodeStartingWithWhitespace(firstChild);
	}
	/**
	* Check if given node's end tag should hug its last child. This is the case for inline elements when there's
	* no whitespace between the last child and the `</`.
	*/
	function shouldHugEnd(node, isSupportedLanguage, options) {
		if (!isSupportedLanguage) return true;
		if (node.type === "SvelteBoundary") return false;
		if (isBlockElement(node, options)) return false;
		if (!isNodeWithChildren(node)) return false;
		const children = node.children;
		if (children.length === 0) return true;
		if (options.htmlWhitespaceSensitivity === "ignore") return false;
		const lastChild = children[children.length - 1];
		return !isTextNodeEndingWithWhitespace(lastChild);
	}
	/**
	* Check for a svelte block if there's whitespace at the start and if it's a space or a line.
	*/
	function checkWhitespaceAtStartOfSvelteBlock(node, options) {
		if (!isSvelteBlock(node) || !isNodeWithChildren(node)) return "none";
		const children = node.children;
		if (children.length === 0) return "none";
		const firstChild = children[0];
		if (isTextNodeStartingWithLinebreak(firstChild)) return "line";
		else if (isTextNodeStartingWithWhitespace(firstChild)) return "space";
		const parentOpeningEnd = options.originalText.lastIndexOf("}", firstChild.start);
		if (parentOpeningEnd > 0 && firstChild.start > parentOpeningEnd + 1) {
			const textBetween = options.originalText.substring(parentOpeningEnd + 1, firstChild.start);
			if (ONLY_HTML_COLLAPSE_WHITESPACE_RE.test(textBetween)) return startsWithLinebreak(textBetween) ? "line" : "space";
		}
		return "none";
	}
	/**
	* Check for a svelte block if there's whitespace at the end and if it's a space or a line.
	*/
	function checkWhitespaceAtEndOfSvelteBlock(node, options) {
		if (!isSvelteBlock(node) || !isNodeWithChildren(node)) return "none";
		const children = node.children;
		if (children.length === 0) return "none";
		const lastChild = children[children.length - 1];
		if (isTextNodeEndingWithLinebreak(lastChild)) return "line";
		else if (isTextNodeEndingWithWhitespace(lastChild)) return "space";
		const parentClosingStart = options.originalText.indexOf("{", lastChild.end);
		if (parentClosingStart > 0 && lastChild.end < parentClosingStart) {
			const textBetween = options.originalText.substring(lastChild.end, parentClosingStart);
			if (ONLY_HTML_COLLAPSE_WHITESPACE_RE.test(textBetween)) return endsWithLinebreak(textBetween) ? "line" : "space";
		}
		return "none";
	}
	function isInsideQuotedAttribute(path, options) {
		return path.stack.some((node) => (node.type === "Attribute" || node.type === "StyleDirective") && (!isLoneMustacheTag(node.value) || options.svelteStrictMode && !options._svelte_is5Plus));
	}
	/**
	* Returns true if the softline between `</tagName` and `>` can be omitted.
	*/
	function canOmitSoftlineBeforeClosingTag(node, path, options) {
		return isBracketSameLine(options) && (!hugsStartOfNextNode(node, options) || isLastChildWithinParentBlockElement(path, options));
	}
	/**
	* Return true if given node does not hug the next node, meaning there's whitespace
	* or the end of the doc afterwards.
	*/
	function hugsStartOfNextNode(node, options) {
		if (node.end === options.originalText.length) return false;
		return !STARTS_WITH_HTML_COLLAPSE_WHITESPACE_RE.test(options.originalText.substring(node.end));
	}
	function isLastChildWithinParentBlockElement(path, options) {
		const parent = path.getParentNode();
		if (!parent || !isBlockElement(parent, options)) return false;
		const children = getChildren(parent);
		return children[children.length - 1] === path.getNode();
	}
	function assignCommentsToNodes(ast) {
		if (ast.module) ast.module.comments = removeAndGetLeadingComments(ast, ast.module);
		if (ast.instance) ast.instance.comments = removeAndGetLeadingComments(ast, ast.instance);
		if (ast.css) ast.css.comments = removeAndGetLeadingComments(ast, ast.css);
	}
	/**
	* Returns the comments that are above the current node and deletes them from the html ast.
	*/
	function removeAndGetLeadingComments(ast, current) {
		const siblings = getChildren(ast.html);
		const comments = [];
		const newlines = [];
		if (!siblings.length) return [];
		let node = current;
		let prev = siblings.find((child) => child.end === node.start);
		while (prev) {
			if (prev.type === "Comment" && !isIgnoreStartDirective(prev) && !isIgnoreEndDirective(prev)) {
				comments.push(prev);
				if (comments.length !== newlines.length) newlines.push({
					type: "Text",
					data: "",
					raw: "",
					start: -1,
					end: -1
				});
			} else if (isEmptyTextNode(prev)) newlines.push(prev);
			else break;
			node = prev;
			prev = siblings.find((child) => child.end === node.start);
		}
		newlines.length = comments.length;
		for (const comment of comments) siblings.splice(siblings.indexOf(comment), 1);
		for (const text of newlines) siblings.splice(siblings.indexOf(text), 1);
		return comments.map((comment, i) => ({
			comment,
			emptyLineAfter: getUnencodedText(newlines[i]).split("\n").length > 2
		})).reverse();
	}
	const { join, line, group, indent, dedent, softline, hardline, fill, breakParent, literalline } = prettier.doc.builders;
	function hasPragma(text) {
		return /^\s*<!--\s*@(format|prettier)\W/.test(text);
	}
	let ignoreNext = false;
	let ignoreRange = false;
	let svelteOptionsDoc;
	function print(path, options, print) {
		var _a, _b;
		const bracketSameLine = isBracketSameLine(options);
		const n = path.getValue();
		if (!n) return "";
		if (isASTNode(n)) return printTopLevelParts(n, options, path, print);
		const [open, close] = options.svelteStrictMode && !options._svelte_is5Plus ? ["\"{", "}\""] : ["{", "}"];
		const printJsExpression = () => [
			open,
			printJS(path, print, "expression"),
			close
		];
		const node = n;
		if ((ignoreNext || ignoreRange && !isIgnoreEndDirective(node)) && (node.type !== "Text" || !isEmptyTextNode(node))) {
			if (ignoreNext) ignoreNext = false;
			return flatten(options.originalText.slice(options.locStart(node), options.locEnd(node)).split("\n").map((o, i) => i == 0 ? [o] : [literalline, o]));
		}
		switch (node.type) {
			case "Fragment":
				const children = node.children;
				if (children.length === 0 || children.every(isEmptyTextNode)) return "";
				if (!isPreTagContent(path)) {
					trimChildren(node.children, path);
					const output = trim([printChildren(path, print, options)], (n) => isLine(n) || typeof n === "string" && isOnlyHtmlCollapseWhitespace(n) || n === breakParent);
					if (output.every((doc) => isEmptyDoc(doc))) return "";
					return group([...output, hardline]);
				} else return group(path.map(print, "children"));
			case "Text": if (!isPreTagContent(path)) {
				if (isEmptyTextNode(node)) {
					const text = getUnencodedText(node);
					const hasWhiteSpace = text.length > 0;
					const hasOneOrMoreNewlines = /\n/.test(text);
					if (/\n\r?[\t\n\f\r ]*\n\r?/.test(text)) return [hardline, hardline];
					if (hasOneOrMoreNewlines) return hardline;
					if (hasWhiteSpace) return line;
					return "";
				}
				/**
				* For non-empty text nodes each sequence of non-whitespace characters (effectively,
				* each "word") is joined by a single `line`, which will be rendered as a single space
				* until this node's current line is out of room, at which `fill` will break at the
				* most convenient instance of `line`.
				*/
				return fill(splitTextToDocs(node));
			} else {
				let rawText = getUnencodedText(node);
				const parent = path.getParentNode();
				if (parent.type === "Attribute") {
					if (parent.name === "class" && path.getParentNode(1).type === "Element") {
						rawText = rawText.replace(/([^ \t\n])(([ \t]+$)|([ \t]+(\r?\n))|[ \t]+)/g, (match, characterBeforeWhitespace, _, isEndOfString, isEndOfLine, endOfLine) => isEndOfString ? match : characterBeforeWhitespace + (isEndOfLine ? endOfLine : " "));
						rawText = rawText.replace(/([^ \t\n])[ \t]+$/, parent.value.indexOf(node) === parent.value.length - 1 ? "$1" : "$1 ");
					}
					return replaceEndOfLineWith(rawText, literalline);
				}
				return rawText;
			}
			case "Element":
			case "InlineComponent":
			case "Slot":
			case "SlotTemplate":
			case "Window":
			case "Head":
			case "SvelteBoundary":
			case "Title": {
				const isSupportedLanguage = !(node.name === "template" && !isNodeSupportedLanguage(node));
				const isEmpty = node.children.every((child) => isEmptyTextNode(child));
				const isDoctypeTag = node.name.toUpperCase() === "!DOCTYPE";
				const didSelfClose = options.originalText[node.end - 2] === "/";
				const isSelfClosingTag = isEmpty && ((node.type === "Element" && !options.svelteStrictMode || node.type === "Head" || node.type === "InlineComponent" || node.type === "Slot" || node.type === "SlotTemplate" || node.type === "SvelteBoundary" || node.type === "Title") && didSelfClose || node.type === "Window" || selfClosingTags.indexOf(node.name) !== -1 || isDoctypeTag);
				const attributes = path.map(printWithPrependedAttributeLine(node, options, print), "attributes");
				const attributeLine = getAttributeLine(node, options);
				const possibleThisBinding = node.type === "InlineComponent" && node.expression ? [
					attributeLine,
					"this=",
					...printJsExpression()
				] : node.type === "Element" && node.tag ? [
					attributeLine,
					"this=",
					...typeof node.tag === "string" ? [`"${node.tag}"`] : [
						open,
						printJS(path, print, "tag"),
						close
					]
				] : "";
				if (isSelfClosingTag) return group([
					"<",
					node.name,
					indent(group([
						possibleThisBinding,
						...attributes,
						bracketSameLine || isDoctypeTag ? "" : dedent(line)
					])),
					...[bracketSameLine && !isDoctypeTag ? " " : "", `${isDoctypeTag ? "" : "/"}>`]
				]);
				const children = node.children;
				const firstChild = children[0];
				const lastChild = children[children.length - 1];
				let body;
				const hugStart = shouldHugStart(node, isSupportedLanguage, options);
				const hugEnd = shouldHugEnd(node, isSupportedLanguage, options);
				if (isEmpty) body = isInlineElement(path, options, node) && node.children.length && isTextNodeStartingWithWhitespace(node.children[0]) && !isPreTagContent(path) ? () => line : () => bracketSameLine ? softline : "";
				else if (isPreTagContent(path)) body = () => printPre(node, options.originalText, path, print);
				else if (!isSupportedLanguage) body = () => printRaw(node, options.originalText, true);
				else if (isInlineElement(path, options, node) && !isPreTagContent(path)) body = () => printChildren(path, print, options);
				else body = () => printChildren(path, print, options);
				const openingTag = [
					"<",
					node.name,
					indent(group([
						possibleThisBinding,
						...attributes,
						hugStart && !isEmpty ? "" : !bracketSameLine && !isPreTagContent(path) ? dedent(softline) : ""
					]))
				];
				if (!isSupportedLanguage && !isEmpty) return group([
					...openingTag,
					">",
					group([
						hardline,
						body(),
						hardline
					]),
					`</${node.name}>`
				]);
				if (hugStart && hugEnd) {
					const huggedContent = [softline, group([
						">",
						body(),
						`</${node.name}`
					])];
					const omitSoftlineBeforeClosingTag = isEmpty && !bracketSameLine || canOmitSoftlineBeforeClosingTag(node, path, options);
					return group([
						...openingTag,
						isEmpty ? group(huggedContent) : group(indent(huggedContent)),
						omitSoftlineBeforeClosingTag ? "" : softline,
						">"
					]);
				}
				let noHugSeparatorStart = softline;
				let noHugSeparatorEnd = softline;
				if (isPreTagContent(path)) {
					noHugSeparatorStart = "";
					noHugSeparatorEnd = "";
				} else {
					let didSetEndSeparator = false;
					if (!hugStart && firstChild && firstChild.type === "Text") {
						if (isTextNodeStartingWithLinebreak(firstChild) && firstChild !== lastChild && (!isInlineElement(path, options, node) || isTextNodeEndingWithWhitespace(lastChild))) {
							noHugSeparatorStart = hardline;
							noHugSeparatorEnd = hardline;
							didSetEndSeparator = true;
						} else if (isInlineElement(path, options, node)) noHugSeparatorStart = line;
						trimTextNodeLeft(firstChild);
					}
					if (!hugEnd && lastChild && lastChild.type === "Text") {
						if (isInlineElement(path, options, node) && !didSetEndSeparator) noHugSeparatorEnd = line;
						trimTextNodeRight(lastChild);
					}
				}
				if (hugStart) return group([
					...openingTag,
					indent([softline, group([">", body()])]),
					noHugSeparatorEnd,
					`</${node.name}>`
				]);
				if (hugEnd) return group([
					...openingTag,
					">",
					indent([noHugSeparatorStart, group([body(), `</${node.name}`])]),
					canOmitSoftlineBeforeClosingTag(node, path, options) ? "" : softline,
					">"
				]);
				if (isEmpty) return group([
					...openingTag,
					">",
					body(),
					`</${node.name}>`
				]);
				return group([
					...openingTag,
					">",
					indent([noHugSeparatorStart, body()]),
					noHugSeparatorEnd,
					`</${node.name}>`
				]);
			}
			case "Options": if (options.svelteSortOrder !== "none") throw new Error("Options tags should have been handled by prepareChildren");
			case "Body":
			case "Document":
			case "SvelteHTML": return group([
				"<",
				node.name,
				indent(group([...path.map(printWithPrependedAttributeLine(node, options, print), "attributes"), bracketSameLine ? "" : dedent(line)])),
				...[bracketSameLine ? " " : "", "/>"]
			]);
			case "Identifier": return node.name;
			case "AttributeShorthand": return node.expression.name;
			case "Attribute": if (isOrCanBeConvertedToShorthand(node)) if (options.svelteAllowShorthand) return [
				"{",
				node.name,
				"}"
			];
			else return [
				node.name,
				`=${open}`,
				node.name,
				close
			];
			else {
				if (node.value === true) return [node.name];
				const quotes = !isLoneMustacheTag(node.value) || ((_a = options.svelteStrictMode && !options._svelte_is5Plus) !== null && _a !== void 0 ? _a : false);
				const attrNodeValue = printAttributeNodeValue(path, print, quotes, node);
				if (quotes) return [
					node.name,
					"=",
					"\"",
					attrNodeValue,
					"\""
				];
				else return [
					node.name,
					"=",
					attrNodeValue
				];
			}
			case "MustacheTag": return [
				"{",
				printJS(path, print, "expression"),
				"}"
			];
			case "IfBlock": {
				const def = [
					"{#if ",
					printJS(path, print, "expression"),
					"}",
					printSvelteBlockChildren(path, print, options)
				];
				if (node.else) def.push(path.call(print, "else"));
				def.push("{/if}");
				return group([def, breakParent]);
			}
			case "ElseBlock": {
				const parent = path.getParentNode();
				if (node.children.length === 1 && node.children[0].type === "IfBlock" && parent.type !== "EachBlock") {
					const ifNode = node.children[0];
					const def = [
						"{:else if ",
						path.map((ifPath) => printJS(ifPath, print, "expression"), "children")[0],
						"}",
						path.map((ifPath) => printSvelteBlockChildren(ifPath, print, options), "children")[0]
					];
					if (ifNode.else) def.push(path.map((ifPath) => ifPath.call(print, "else"), "children")[0]);
					return def;
				}
				return ["{:else}", printSvelteBlockChildren(path, print, options)];
			}
			case "EachBlock": {
				const def = ["{#each ", printJS(path, print, "expression")];
				if (node.context) def.push(" as", expandNode(node.context, options.originalText));
				if (node.index) def.push(", ", node.index);
				if (node.key) def.push(" (", printJS(path, print, "key"), ")");
				def.push("}", printSvelteBlockChildren(path, print, options));
				if (node.else) def.push(path.call(print, "else"));
				def.push("{/each}");
				return group([def, breakParent]);
			}
			case "AwaitBlock": {
				const hasPendingBlock = node.pending.children.some((n) => !isEmptyTextNode(n));
				const hasThenBlock = node.then.children.some((n) => !isEmptyTextNode(n));
				const hasCatchBlock = node.catch.children.some((n) => !isEmptyTextNode(n));
				let block = [];
				if (!hasPendingBlock && hasThenBlock) block.push(group([
					"{#await ",
					printJS(path, print, "expression"),
					" then",
					expandNode(node.value, options.originalText),
					"}"
				]), path.call(print, "then"));
				else if (!hasPendingBlock && hasCatchBlock) block.push(group([
					"{#await ",
					printJS(path, print, "expression"),
					" catch",
					expandNode(node.error, options.originalText),
					"}"
				]), path.call(print, "catch"));
				else {
					block.push(group([
						"{#await ",
						printJS(path, print, "expression"),
						"}"
					]));
					if (hasPendingBlock) block.push(path.call(print, "pending"));
					if (hasThenBlock) block.push(group([
						"{:then",
						expandNode(node.value, options.originalText),
						"}"
					]), path.call(print, "then"));
				}
				if ((hasPendingBlock || hasThenBlock) && hasCatchBlock) block.push(group([
					"{:catch",
					expandNode(node.error, options.originalText),
					"}"
				]), path.call(print, "catch"));
				block.push("{/await}");
				return group(block);
			}
			case "KeyBlock": {
				const def = [
					"{#key ",
					printJS(path, print, "expression"),
					"}",
					printSvelteBlockChildren(path, print, options)
				];
				def.push("{/key}");
				return group([def, breakParent]);
			}
			case "ThenBlock":
			case "PendingBlock":
			case "CatchBlock": return printSvelteBlockChildren(path, print, options);
			case "SnippetBlock": {
				const snippet = ["{#snippet ", printJS(path, print, "expression")];
				snippet.push("}", printSvelteBlockChildren(path, print, options), "{/snippet}");
				return snippet;
			}
			case "EventHandler": return [
				"on:",
				node.name,
				node.modifiers && node.modifiers.length ? ["|", join("|", node.modifiers)] : "",
				node.expression ? ["=", ...printJsExpression()] : ""
			];
			case "Binding": return [
				"bind:",
				node.name,
				node.expression.type === "Identifier" && node.expression.name === node.name && options.svelteAllowShorthand ? "" : ["=", ...printJsExpression()]
			];
			case "Class": return [
				"class:",
				node.name,
				node.expression.type === "Identifier" && node.expression.name === node.name && options.svelteAllowShorthand ? "" : ["=", ...printJsExpression()]
			];
			case "StyleDirective":
				const prefix = [
					"style:",
					node.name,
					node.modifiers && node.modifiers.length ? ["|", join("|", node.modifiers)] : ""
				];
				if (isOrCanBeConvertedToShorthand(node) || node.value === true) if (options.svelteAllowShorthand) return [...prefix];
				else return [
					...prefix,
					`=${open}`,
					node.name,
					close
				];
				else {
					const quotes = !isLoneMustacheTag(node.value) || ((_b = options.svelteStrictMode && !options._svelte_is5Plus) !== null && _b !== void 0 ? _b : false);
					const attrNodeValue = printAttributeNodeValue(path, print, quotes, node);
					if (quotes) return [
						...prefix,
						"=",
						"\"",
						attrNodeValue,
						"\""
					];
					else return [
						...prefix,
						"=",
						attrNodeValue
					];
				}
			case "Let": return [
				"let:",
				node.name,
				!node.expression || node.expression.type === "Identifier" && node.expression.name === node.name ? "" : ["=", ...printJsExpression()]
			];
			case "DebugTag": return [
				"{@debug",
				node.identifiers.length > 0 ? [" ", join(", ", path.map(print, "identifiers"))] : "",
				"}"
			];
			case "Ref": return ["ref:", node.name];
			case "Comment": {
				const nodeAfterComment = getNextNode(path);
				if (isIgnoreStartDirective(node) && isNodeTopLevelHTML(node, path)) ignoreRange = true;
				else if (isIgnoreEndDirective(node) && isNodeTopLevelHTML(node, path)) ignoreRange = false;
				else if (doesEmbedStartAfterNode(node, path) || isEmptyTextNode(nodeAfterComment) && doesEmbedStartAfterNode(nodeAfterComment, path)) return "";
				else if (isIgnoreDirective(node)) ignoreNext = true;
				return printComment(node);
			}
			case "Transition": return [
				node.intro && node.outro ? "transition" : node.intro ? "in" : "out",
				":",
				node.name,
				node.modifiers && node.modifiers.length ? ["|", join("|", node.modifiers)] : "",
				node.expression ? ["=", ...printJsExpression()] : ""
			];
			case "Action": return [
				"use:",
				node.name,
				node.expression ? ["=", ...printJsExpression()] : ""
			];
			case "Animation": return [
				"animate:",
				node.name,
				node.expression ? ["=", ...printJsExpression()] : ""
			];
			case "RawMustacheTag": return [
				"{@html ",
				printJS(path, print, "expression"),
				"}"
			];
			case "RenderTag": return [
				"{@render ",
				printJS(path, print, "expression"),
				"}"
			];
			case "AttachTag": return [
				"{@attach ",
				printJS(path, print, "expression"),
				"}"
			];
			case "Spread": return [
				"{...",
				printJS(path, print, "expression"),
				"}"
			];
			case "ConstTag": return [
				"{@const ",
				printJS(path, print, "expression"),
				"}"
			];
		}
		console.error(JSON.stringify(node, null, 4));
		throw new Error("unknown node type: " + node.type);
	}
	function printTopLevelParts(n, options, path, print) {
		if (options.svelteSortOrder === "none") {
			const topLevelPartsByEnd = {};
			const topLevelPartsByStart = {};
			if (n.module) {
				topLevelPartsByEnd[n.module.end] = n.module;
				topLevelPartsByStart[n.module.start] = n.module;
			}
			if (n.instance) {
				topLevelPartsByEnd[n.instance.end] = n.instance;
				topLevelPartsByStart[n.instance.start] = n.instance;
			}
			if (n.css) {
				topLevelPartsByEnd[n.css.end] = n.css;
				topLevelPartsByStart[n.css.start] = n.css;
			}
			const children = getChildren(n.html);
			for (let i = 0; i < children.length; i++) {
				const node = children[i];
				if (topLevelPartsByEnd[node.start]) {
					children.splice(i, 0, topLevelPartsByEnd[node.start]);
					delete topLevelPartsByEnd[node.start];
				} else if (i === children.length - 1 && topLevelPartsByStart[node.end]) children.push(topLevelPartsByStart[node.end]);
			}
			const result = path.call(print, "html");
			if (options.insertPragma && !hasPragma(options.originalText)) return [
				`<!-- @format -->`,
				hardline,
				result
			];
			else return result;
		}
		const parts = {
			options: [],
			scripts: [],
			markup: [],
			styles: []
		};
		if (n.module) parts.scripts.push(path.call(print, "module"));
		if (n.instance) parts.scripts.push(path.call(print, "instance"));
		if (n.css) parts.styles.push(path.call(print, "css"));
		const htmlDoc = path.call(print, "html");
		if (htmlDoc) parts.markup.push(htmlDoc);
		if (svelteOptionsDoc) parts.options.push(svelteOptionsDoc);
		const docs = flatten(parseSortOrder(options.svelteSortOrder).map((p) => parts[p]));
		ignoreNext = false;
		ignoreRange = false;
		svelteOptionsDoc = void 0;
		if (options.parentParser === "markdown") {
			const lastDoc = docs[docs.length - 1];
			trimRight([lastDoc], isLine);
		}
		if (options.insertPragma && !hasPragma(options.originalText)) return [
			`<!-- @format -->`,
			hardline,
			group(docs)
		];
		else return group([join(hardline, docs)]);
	}
	function printAttributeNodeValue(path, print, quotes, node) {
		const valueDocs = path.map((childPath) => childPath.call(print), "value");
		if (!quotes || !formattableAttributes.includes(node.name)) return valueDocs;
		else return indent(group(trim(valueDocs, isLine)));
	}
	function printSvelteBlockChildren(path, print, options) {
		const node = path.getValue();
		const children = node.children;
		if (!children || children.length === 0) return "";
		const whitespaceAtStartOfBlock = checkWhitespaceAtStartOfSvelteBlock(node, options);
		const whitespaceAtEndOfBlock = checkWhitespaceAtEndOfSvelteBlock(node, options);
		const startline = whitespaceAtStartOfBlock === "none" ? "" : whitespaceAtEndOfBlock === "line" || whitespaceAtStartOfBlock === "line" ? hardline : line;
		const endline = whitespaceAtEndOfBlock === "none" ? "" : whitespaceAtEndOfBlock === "line" || whitespaceAtStartOfBlock === "line" ? hardline : line;
		const firstChild = children[0];
		const lastChild = children[children.length - 1];
		if (isTextNodeStartingWithWhitespace(firstChild)) trimTextNodeLeft(firstChild);
		if (isTextNodeEndingWithWhitespace(lastChild)) trimTextNodeRight(lastChild);
		return [indent([startline, group(printChildren(path, print, options))]), endline];
	}
	function printPre(node, originalText, path, print) {
		const result = [];
		const length = node.children.length;
		for (let i = 0; i < length; i++) {
			const child = node.children[i];
			if (child.type === "Text") originalText.substring(child.start, child.end).split(/\r?\n/).forEach((line, j) => {
				if (j > 0) result.push(literalline);
				result.push(line);
			});
			else result.push(path.call(print, "children", i));
		}
		return result;
	}
	function printChildren(path, print, options) {
		if (isPreTagContent(path)) return path.map(print, "children");
		const childNodes = prepareChildren(path.getValue().children, path, print, options);
		path.getValue().children = childNodes;
		if (childNodes.length === 0) return "";
		const childDocs = [];
		let handleWhitespaceOfPrevTextNode = false;
		for (let i = 0; i < childNodes.length; i++) {
			const childNode = childNodes[i];
			if (childNode.type === "Text") handleTextChild(i, childNode);
			else if (isBlockElement(childNode, options)) handleBlockChild(i);
			else if (isInlineElement(path, options, childNode)) handleInlineChild(i);
			else {
				childDocs.push(printChild(i));
				handleWhitespaceOfPrevTextNode = false;
			}
		}
		if (childNodes.length > 1 && childNodes.some((child) => isBlockElement(child, options))) childDocs.push(breakParent);
		return childDocs;
		function printChild(idx) {
			return path.call(print, "children", idx);
		}
		/**
		* Print inline child. Hug whitespace of previous text child if there was one.
		*/
		function handleInlineChild(idx) {
			if (handleWhitespaceOfPrevTextNode) childDocs.push(group([line, printChild(idx)]));
			else childDocs.push(printChild(idx));
			handleWhitespaceOfPrevTextNode = false;
		}
		/**
		* Print block element. Add softlines around it if needed
		* so it breaks into a separate line if children are broken up.
		* Don't add lines at the start/end if it's the first/last child because this
		* kind of whitespace handling is done in the parent already.
		*/
		function handleBlockChild(idx) {
			const prevChild = childNodes[idx - 1];
			if (prevChild && !isBlockElement(prevChild, options) && (prevChild.type !== "Text" || handleWhitespaceOfPrevTextNode || !isTextNodeEndingWithWhitespace(prevChild))) childDocs.push(softline);
			childDocs.push(printChild(idx));
			const nextChild = childNodes[idx + 1];
			if (nextChild && (nextChild.type !== "Text" || (!isEmptyTextNode(nextChild) || childNodes[idx + 2] && isInlineElement(path, options, childNodes[idx + 2])) && !isTextNodeStartingWithLinebreak(nextChild))) childDocs.push(softline);
			handleWhitespaceOfPrevTextNode = false;
		}
		/**
		* Print text child. First/last child white space handling
		* is done in parent already. By definition of the Svelte AST,
		* a text node always is inbetween other tags. Add hardlines
		* if the users wants to have them inbetween.
		* If the text is trimmed right, toggle flag telling
		* subsequent (inline)block element to alter its printing logic
		* to check if they need to hug or print lines themselves.
		*/
		function handleTextChild(idx, childNode) {
			handleWhitespaceOfPrevTextNode = false;
			if (idx === 0 || idx === childNodes.length - 1) {
				childDocs.push(printChild(idx));
				return;
			}
			const prevNode = childNodes[idx - 1];
			const nextNode = childNodes[idx + 1];
			if (isTextNodeStartingWithWhitespace(childNode) && !isEmptyTextNode(childNode)) {
				if (isInlineElement(path, options, prevNode) && !isTextNodeStartingWithLinebreak(childNode)) {
					trimTextNodeLeft(childNode);
					const lastChildDoc = childDocs.pop();
					childDocs.push(group([lastChildDoc, line]));
				}
				if (isBlockElement(prevNode, options) && !isTextNodeStartingWithLinebreak(childNode)) trimTextNodeLeft(childNode);
			}
			if (isTextNodeEndingWithWhitespace(childNode)) {
				if (isInlineElement(path, options, nextNode) && !isTextNodeEndingWithLinebreak(childNode)) {
					handleWhitespaceOfPrevTextNode = !prevNode || !isBlockElement(prevNode, options);
					trimTextNodeRight(childNode);
				}
				if (isBlockElement(nextNode, options) && !isTextNodeEndingWithLinebreak(childNode, 2)) {
					handleWhitespaceOfPrevTextNode = !prevNode || !isBlockElement(prevNode, options);
					trimTextNodeRight(childNode);
				}
			}
			childDocs.push(printChild(idx));
		}
	}
	/**
	* `svelte:options` is part of the html part but needs to be snipped out and handled
	* separately to reorder it as configured. The comment above it should be moved with it.
	* Do that here.
	*/
	function prepareChildren(children, path, print, options) {
		let svelteOptionsComment;
		const childrenWithoutOptions = [];
		const bracketSameLine = isBracketSameLine(options);
		for (let idx = 0; idx < children.length; idx++) {
			const currentChild = children[idx];
			if (currentChild.type === "Text" && getUnencodedText(currentChild) === "") continue;
			if (isEmptyTextNode(currentChild) && doesEmbedStartAfterNode(currentChild, path)) continue;
			if (options.svelteSortOrder !== "none") {
				if (isCommentFollowedByOptions(currentChild, idx)) {
					svelteOptionsComment = printComment(currentChild);
					const nextChild = children[idx + 1];
					idx += nextChild && isEmptyTextNode(nextChild) ? 1 : 0;
					continue;
				}
				if (currentChild.type === "Options") {
					printSvelteOptions(currentChild, idx, path, print);
					continue;
				}
			}
			childrenWithoutOptions.push(currentChild);
		}
		const mergedChildrenWithoutOptions = [];
		for (let idx = 0; idx < childrenWithoutOptions.length; idx++) {
			const currentChild = childrenWithoutOptions[idx];
			const nextChild = childrenWithoutOptions[idx + 1];
			if (currentChild.type === "Text" && nextChild && nextChild.type === "Text") {
				currentChild.raw += nextChild.raw;
				currentChild.data += nextChild.data;
				idx++;
			}
			mergedChildrenWithoutOptions.push(currentChild);
		}
		return mergedChildrenWithoutOptions;
		function printSvelteOptions(node, idx, path, print) {
			svelteOptionsDoc = group([[
				"<",
				node.name,
				indent(group([...path.map(printWithPrependedAttributeLine(node, options, print), "children", idx, "attributes"), bracketSameLine ? "" : dedent(line)])),
				...[bracketSameLine ? " " : "", "/>"]
			], hardline]);
			if (svelteOptionsComment) svelteOptionsDoc = group([
				svelteOptionsComment,
				hardline,
				svelteOptionsDoc
			]);
		}
		function isCommentFollowedByOptions(node, idx) {
			if (node.type !== "Comment" || isIgnoreEndDirective(node) || isIgnoreStartDirective(node)) return false;
			const nextChild = children[idx + 1];
			if (nextChild) {
				if (isEmptyTextNode(nextChild)) {
					const afterNext = children[idx + 2];
					return afterNext && afterNext.type === "Options";
				}
				return nextChild.type === "Options";
			}
			return false;
		}
	}
	/**
	* Split the text into words separated by whitespace. Replace the whitespaces by lines,
	* collapsing multiple whitespaces into a single line.
	*
	* If the text starts or ends with multiple newlines, two of those should be kept.
	*/
	function splitTextToDocs(node) {
		const text = getUnencodedText(node);
		let docs = join(line, text.split(/[\t\n\f\r ]+/)).filter((doc) => doc !== "");
		if (startsWithLinebreak(text)) docs[0] = hardline;
		if (startsWithLinebreak(text, 2)) docs = [hardline, ...docs];
		if (endsWithLinebreak(text)) docs[docs.length - 1] = hardline;
		if (endsWithLinebreak(text, 2)) docs = [...docs, hardline];
		return docs;
	}
	function printJS(path, print, name) {
		return path.call(print, name);
	}
	function expandNode(node, original) {
		let str = _expandNode(node, original);
		if (node === null || node === void 0 ? void 0 : node.typeAnnotation) str += ": " + original.slice(node.typeAnnotation.typeAnnotation.start, node.typeAnnotation.typeAnnotation.end);
		return str;
	}
	function _expandNode(node, original, parent) {
		var _a, _b;
		if (node === null) return "";
		if (typeof node === "string") return " " + node;
		switch (node.type) {
			case "ArrayExpression":
			case "ArrayPattern": return " [" + node.elements.map((el) => el === null ? " " : _expandNode(el, original)).join(",").slice(1) + "]";
			case "AssignmentPattern": return _expandNode(node.left, original) + " =" + _expandNode(node.right, original);
			case "Identifier": return " " + node.name;
			case "Literal": return " " + node.raw;
			case "ObjectExpression": return " {" + node.properties.map((p) => _expandNode(p, original, node)).join(",") + " }";
			case "ObjectPattern": return " {" + node.properties.map((p) => _expandNode(p, original)).join(",") + " }";
			case "Property": {
				let computedKeyInner = "";
				if (node.computed) computedKeyInner = typeof ((_a = node.key) === null || _a === void 0 ? void 0 : _a.start) === "number" && typeof ((_b = node.key) === null || _b === void 0 ? void 0 : _b.end) === "number" ? original.slice(node.key.start, node.key.end) : _expandNode(node.key, original).trim();
				if (node.value.type === "ObjectPattern" || node.value.type === "ArrayPattern") return (node.computed ? " [" + computedKeyInner + "]" : " " + node.key.name) + ":" + _expandNode(node.value, original);
				else if (node.value.type === "Identifier" && node.key.name !== node.value.name || parent && parent.type === "ObjectExpression") return (node.computed ? " [" + computedKeyInner + "]" : _expandNode(node.key, original)) + ":" + _expandNode(node.value, original);
				else return _expandNode(node.value, original);
			}
			case "RestElement": return " ..." + node.argument.name;
		}
		console.error(JSON.stringify(node, null, 4));
		throw new Error("unknown node type: " + node.type);
	}
	function printComment(node) {
		let text = node.data;
		if (hasSnippedContent(text)) text = unsnipContent(text);
		return group([
			"<!--",
			text,
			"-->"
		]);
	}
	function getText(node, options, unsnip = false) {
		const leadingComments = node.leadingComments;
		const text = options.originalText.slice(options.locStart(leadingComments && leadingComments[0] || node), options.locEnd(node));
		if (!unsnip || !hasSnippedContent(text)) return text;
		return unsnipContent(text);
	}
	const extractAttributesRegex = /<[a-z]+((?:\s+[^=>'"\/]+=(?:"[^"]*"|'[^']*'|[^>\s]+)|\s+[^=>'"\/]+)*\s*)>/im;
	const attributeRegex = /([^\s=]+)(?:=(?:(?:("|')([\s\S]*?)\2)|(?:([^>\s]+?)(?:\s|>|$))))?/gim;
	function extractAttributes(html) {
		const [, attributesString] = html.match(extractAttributesRegex);
		const attrs = [];
		let match;
		while (match = attributeRegex.exec(attributesString)) {
			const [all, name, quotes, valueQuoted, valueUnquoted] = match;
			const value = valueQuoted || valueUnquoted;
			const attrStart = match.index;
			let valueNode;
			if (!value) valueNode = true;
			else {
				let valueStart = attrStart + name.length;
				if (quotes) valueStart += 2;
				valueNode = [{
					type: "Text",
					data: value,
					start: valueStart,
					end: valueStart + value.length
				}];
			}
			attrs.push({
				type: "Attribute",
				name,
				value: valueNode,
				start: attrStart,
				end: attrStart + all.length
			});
		}
		return attrs;
	}
	const { builders: { group: group$1, hardline: hardline$1, softline: softline$1, indent: indent$1, dedent: dedent$1, literalline: literalline$1 }, utils: { removeLines } } = prettier.doc;
	const leaveAlone = new Set([
		"Script",
		"Style",
		"Identifier",
		"MemberExpression",
		"CallExpression",
		"ArrowFunctionExpression"
	]);
	const dontTraverse = new Set([
		"start",
		"end",
		"type"
	]);
	function getVisitorKeys(node, nonTraversableKeys) {
		return Object.keys(node).filter((key) => {
			return !nonTraversableKeys.has(key) && !leaveAlone.has(node.type) && !dontTraverse.has(key);
		});
	}
	function embed(path, _options) {
		var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o;
		const node = path.getNode();
		const options = _options;
		if (!options.locStart || !options.locEnd || !options.originalText) throw new Error("Missing required options");
		if (isASTNode(node)) {
			assignCommentsToNodes(node);
			attachAttributeComments(node, options.originalText);
			if (node.module) {
				node.module.type = "Script";
				node.module.attributes = extractAttributes(getText(node.module, options));
			}
			if (node.instance) {
				node.instance.type = "Script";
				node.instance.attributes = extractAttributes(getText(node.instance, options));
			}
			if (node.css) {
				node.css.type = "Style";
				node.css.content.type = "StyleProgram";
			}
			return null;
		}
		const parent = path.getParentNode();
		const printJsExpression = () => {
			var _a;
			return parent.expression ? printJS$1(parent, "expression", { forceSingleQuote: (_a = options.svelteStrictMode && !options._svelte_is5Plus) !== null && _a !== void 0 ? _a : false }) : void 0;
		};
		const printSvelteBlockJS = (name) => printJS$1(parent, name, { forceSingleLine: true });
		switch (parent.type) {
			case "IfBlock":
			case "ElseBlock":
			case "AwaitBlock":
			case "KeyBlock":
				printSvelteBlockJS("expression");
				break;
			case "EachBlock":
				printSvelteBlockJS("expression");
				printSvelteBlockJS("key");
				break;
			case "SnippetBlock":
				if (node === parent.expression) {
					parent.expression.end = options.originalText.indexOf(")", (_g = (_d = (_c = (_b = (_a = parent.parameters) === null || _a === void 0 ? void 0 : _a[parent.parameters.length - 1]) === null || _b === void 0 ? void 0 : _b.typeAnnotation) === null || _c === void 0 ? void 0 : _c.end) !== null && _d !== void 0 ? _d : (_f = (_e = parent.parameters) === null || _e === void 0 ? void 0 : _e[parent.parameters.length - 1]) === null || _f === void 0 ? void 0 : _f.end) !== null && _g !== void 0 ? _g : parent.expression.end) + 1;
					parent.parameters = null;
					node.isJS = true;
					node.asFunction = true;
				}
				break;
			case "Element":
				printJS$1(parent, "tag", { forceSingleQuote: (_h = options.svelteStrictMode && !options._svelte_is5Plus) !== null && _h !== void 0 ? _h : false });
				break;
			case "MustacheTag":
				printJS$1(parent, "expression", { forceSingleQuote: isInsideQuotedAttribute(path, options) });
				break;
			case "RawMustacheTag":
				printJS$1(parent, "expression", {});
				break;
			case "Spread":
				printJS$1(parent, "expression", {});
				break;
			case "AttachTag":
				printJS$1(parent, "expression", {});
				break;
			case "ConstTag":
				printJS$1(parent, "expression", { removeParentheses: true });
				break;
			case "Binding":
				printJS$1(parent, "expression", {
					removeParentheses: parent.expression.type === "SequenceExpression",
					surroundWithSoftline: true
				});
				break;
			case "RenderTag":
				if (node === parent.expression) {
					if ("argument" in parent || "arguments" in parent) {
						parent.expression.end = options.originalText.indexOf(")", (_o = (_k = (_j = parent.argument) === null || _j === void 0 ? void 0 : _j.end) !== null && _k !== void 0 ? _k : (_m = (_l = parent.arguments) === null || _l === void 0 ? void 0 : _l[parent.arguments.length - 1]) === null || _m === void 0 ? void 0 : _m.end) !== null && _o !== void 0 ? _o : parent.expression.end) + 1;
						parent.argument = null;
						parent.arguments = null;
					}
					printJS$1(parent, "expression", {});
				}
				break;
			case "EventHandler":
			case "Binding":
			case "Class":
			case "Let":
			case "Transition":
			case "Action":
			case "Animation":
			case "InlineComponent":
				printJsExpression();
				break;
		}
		if (node.isJS) return (textToDoc) => __awaiter(this, void 0, void 0, function* () {
			try {
				const embeddedOptions = {
					parser: options._svelte_ts ? "svelteTSExpressionParser" : "svelteExpressionParser",
					singleQuote: node.forceSingleQuote ? true : options.singleQuote,
					_svelte_asFunction: node.asFunction
				};
				const text = getText(node, options, true);
				let docs = yield textToDoc(node.asFunction ? forceIntoFunction(text) : forceIntoExpression(text), embeddedOptions);
				if (node.forceSingleLine) docs = removeLines(docs);
				if (node.removeParentheses) docs = removeParentheses(docs);
				if (node.asFunction) if (Array.isArray(docs) && typeof docs[0] === "string") {
					docs[0] = docs[0].replace("function ", "");
					docs.splice(-1, 1);
				} else throw new Error("Prettier AST changed, asFunction logic needs to change");
				if (node.surroundWithSoftline) docs = group$1(indent$1([
					softline$1,
					group$1(docs),
					dedent$1(softline$1)
				]));
				return docs;
			} catch (e) {
				return getText(node, options, true);
			}
		});
		const embedType = (tag, parser, isTopLevel) => {
			return (textToDoc, print) => __awaiter(this, void 0, void 0, function* () {
				return embedTag(tag, options.originalText, path, (content) => formatBodyContent(content, parser, textToDoc, options), print, isTopLevel, options);
			});
		};
		const embedScript = (isTopLevel) => embedType("script", isTypeScript(node) ? "typescript" : isJSON(node) ? "json" : "babel-ts", isTopLevel);
		const embedStyle = (isTopLevel) => embedType("style", isLess(node) ? "less" : isScss(node) ? "scss" : "css", isTopLevel);
		const embedPug = () => embedType("template", "pug", false);
		switch (node.type) {
			case "Script": return embedScript(true);
			case "Style": return embedStyle(true);
			case "Element": if (node.name === "script") return embedScript(false);
			else if (node.name === "style") return embedStyle(false);
			else if (isPugTemplate(node)) return embedPug();
		}
		return null;
	}
	function forceIntoExpression(statement) {
		return `(${statement}\n)`;
	}
	function forceIntoFunction(statement) {
		return `function ${statement} {}`;
	}
	function preformattedBody(str) {
		if (!str) return "";
		return [
			literalline$1,
			str.replace(/^[\t\f\r ]*\n/, "").replace(/\n[\t\f\r ]*$/, ""),
			hardline$1
		];
	}
	function getSnippedContent(node) {
		const encodedContent = getAttributeTextValue(snippedTagContentAttribute, node);
		if (encodedContent) return base64ToString(encodedContent);
		else return "";
	}
	function formatBodyContent(content, parser, textToDoc, options) {
		return __awaiter(this, void 0, void 0, function* () {
			try {
				const body = yield textToDoc(content, { parser });
				if (parser === "pug" && typeof body === "string") {
					const whitespace = options.useTabs ? "	" : " ".repeat(options.pugTabWidth && options.pugTabWidth > 0 ? options.pugTabWidth : options.tabWidth);
					return [hardline$1, body.split("\n").map((line) => line ? whitespace + line : line).join("\n")];
				}
				const indentIfDesired = (doc) => options.svelteIndentScriptAndStyle ? indent$1(doc) : doc;
				trimRight([body], isLine);
				return [indentIfDesired([hardline$1, body]), hardline$1];
			} catch (error) {
				if (process.env.PRETTIER_DEBUG) throw error;
				console.error(error);
				return preformattedBody(content);
			}
		});
	}
	function embedTag(tag, text, path, formatBodyContent, print, isTopLevel, options) {
		var _a;
		return __awaiter(this, void 0, void 0, function* () {
			const node = path.getNode();
			const content = tag === "template" ? printRaw(node, text) : getSnippedContent(node);
			const previousComments = node.type === "Script" || node.type === "Style" ? node.comments : [getLeadingComment(path)].filter(Boolean).map((comment) => ({
				comment,
				emptyLineAfter: false
			}));
			const body = isNodeSupportedLanguage(node) && !isIgnoreDirective((_a = previousComments[previousComments.length - 1]) === null || _a === void 0 ? void 0 : _a.comment) && (tag !== "template" || options.plugins.some((plugin) => typeof plugin !== "string" && plugin.parsers && plugin.parsers.pug)) ? content.trim() !== "" ? yield formatBodyContent(content) : content === "" ? "" : hardline$1 : preformattedBody(content);
			let result = group$1([
				group$1([
					"<",
					tag,
					indent$1(group$1([...path.map(printWithPrependedAttributeLine(node, options, print), "attributes"), isBracketSameLine(options) ? "" : dedent$1(softline$1)])),
					">"
				]),
				body,
				"</",
				tag,
				">"
			]);
			const comments = [];
			for (const comment of previousComments) {
				comments.push("<!--", comment.comment.data, "-->");
				comments.push(hardline$1);
				if (comment.emptyLineAfter) comments.push(hardline$1);
			}
			if (isTopLevel && options.svelteSortOrder !== "none") return [
				...comments,
				result,
				hardline$1
			];
			else return isTopLevel && comments.length ? [...comments, result] : result;
		});
	}
	function printJS$1(node, name, options) {
		const part = node[name];
		if (!part || typeof part !== "object") return;
		part.isJS = true;
		part.forceSingleQuote = options.forceSingleQuote;
		part.forceSingleLine = options.forceSingleLine;
		part.removeParentheses = options.removeParentheses;
		part.surroundWithSoftline = options.surroundWithSoftline;
	}
	/**
	* Walk the AST and use `_comments` (stashed by the parser) to attach
	* attribute-level comments to their neighbouring attribute nodes via
	* Prettier's `util.addLeadingComment` / `util.addTrailingComment`.
	*/
	function attachAttributeComments(ast, original_text) {
		const comments = ast._comments;
		if (!comments || comments.length === 0) return;
		const commentsByStart = /* @__PURE__ */ new Map();
		for (const c of comments) commentsByStart.set(c.start, c);
		walkAndAttach(ast.html, commentsByStart, original_text);
	}
	function walkAndAttach(node, commentsByStart, original_text) {
		if (!node || typeof node !== "object") return;
		if ("attributes" in node && Array.isArray(node.attributes) && node.attributes.length > 0) {
			const attrs = node.attributes;
			attachCommentsInRange(node.start + 2, attrs[0].start, null, attrs[0], commentsByStart);
			for (let i = 0; i < attrs.length - 1; i++) attachCommentsInRange(attrs[i].end, attrs[i + 1].start, attrs[i], attrs[i + 1], commentsByStart);
			const last_attr = attrs[attrs.length - 1];
			const opening_tag_end = original_text && typeof node.end === "number" ? original_text.indexOf(">", last_attr.end) : -1;
			if (opening_tag_end >= 0 && opening_tag_end <= node.end) attachCommentsInRange(last_attr.end, opening_tag_end, last_attr, null, commentsByStart);
		}
		for (const child of getChildren(node)) walkAndAttach(child, commentsByStart, original_text);
		if ((node.type === "IfBlock" || node.type === "EachBlock") && node.else) walkAndAttach(node.else, commentsByStart, original_text);
		if (node.type === "AwaitBlock") {
			if (node.pending) walkAndAttach(node.pending, commentsByStart, original_text);
			if (node.then) walkAndAttach(node.then, commentsByStart, original_text);
			if (node.catch) walkAndAttach(node.catch, commentsByStart, original_text);
		}
	}
	function attachCommentsInRange(rangeStart, rangeEnd, precedingAttr, followingAttr, commentsByStart) {
		for (const [start, comment] of commentsByStart) if (start >= rangeStart && comment.end <= rangeEnd) {
			if (followingAttr) prettier.util.addLeadingComment(followingAttr, comment);
			else if (precedingAttr) prettier.util.addTrailingComment(precedingAttr, comment);
			commentsByStart.delete(start);
		}
	}
	const babelParser = prettierPluginBabel.parsers.babel;
	const typescriptParser = prettierPluginBabel.parsers["babel-ts"];
	const isSvelte5Plus = Number(compiler.VERSION.split(".")[0]) >= 5;
	function locStart(node) {
		return node.start;
	}
	function locEnd(node) {
		return node.end;
	}
	const languages = [{
		name: "svelte",
		parsers: ["svelte"],
		extensions: [".svelte"],
		vscodeLanguageIds: ["svelte"]
	}];
	const parsers = {
		svelte: {
			hasPragma,
			parse: (text, options) => __awaiter(void 0, void 0, void 0, function* () {
				try {
					let _parse = compiler.parse;
					if (options.svelte5CompilerPath) try {
						_parse = (yield Promise.resolve().then(function() {
							return /* @__PURE__ */ _interopNamespace(__require(options.svelte5CompilerPath));
						})).parse;
					} catch (e) {
						console.warn(`Failed to load Svelte 5 compiler from ${options.svelte5CompilerPath}`);
						console.warn(e);
						options.svelte5CompilerPath = void 0;
					}
					const root = _parse(text);
					root.__isRoot = true;
					return root;
				} catch (err) {
					if (err.start != null && err.end != null) err.loc = {
						start: err.start,
						end: err.end
					};
					throw err;
				}
			}),
			preprocess: (text, options) => {
				const result = snipScriptAndStyleTagContent(text);
				text = result.text.trim();
				options.originalText = text;
				const is = !!options.svelte5CompilerPath || isSvelte5Plus;
				options._svelte_ts = is && result.isTypescript;
				options._svelte_is5Plus = is;
				return text;
			},
			locStart,
			locEnd,
			astFormat: "svelte-ast"
		},
		svelteExpressionParser: Object.assign(Object.assign({}, babelParser), { parse: (text, options) => {
			const ast = babelParser.parse(text, options);
			let program = ast.program.body[0];
			if (!options._svelte_asFunction) program = program.expression;
			return Object.assign(Object.assign({}, ast), { program });
		} }),
		svelteTSExpressionParser: Object.assign(Object.assign({}, typescriptParser), { parse: (text, options) => {
			const ast = typescriptParser.parse(text, options);
			let program = ast.program.body[0];
			if (!options._svelte_asFunction) program = program.expression;
			return Object.assign(Object.assign({}, ast), { program });
		} })
	};
	const printers = { "svelte-ast": {
		print,
		embed,
		getVisitorKeys,
		isBlockComment(comment) {
			return comment.type === "Block";
		},
		printComment(commentPath) {
			const comment = commentPath.getValue();
			if (comment.type === "Line") return "//" + comment.value.replace(/\r$/, "");
			return "/*" + comment.value + "*/";
		}
	} };
	exports.languages = languages;
	exports.options = options;
	exports.parsers = parsers;
	exports.printers = printers;
}));
//#endregion
export default require_plugin();
export {};
