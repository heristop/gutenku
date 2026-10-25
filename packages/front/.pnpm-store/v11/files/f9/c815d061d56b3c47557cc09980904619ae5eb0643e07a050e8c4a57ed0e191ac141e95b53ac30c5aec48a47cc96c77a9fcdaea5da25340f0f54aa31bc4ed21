import { __assign, __read, __values } from 'tslib';

/*!
 *
 * Copyright 2017 - acrazing
 *
 * @author acrazing joking.young@gmail.com
 * @since 2017-08-18 15:17:51
 * @version 1.0.0
 * @desc types.ts
 */
var SyntaxKind;
(function (SyntaxKind) {
    SyntaxKind["Text"] = "Text";
    SyntaxKind["Tag"] = "Tag";
})(SyntaxKind || (SyntaxKind = {}));

/*!
 *
 * Copyright 2017 - acrazing
 *
 * @author acrazing joking.young@gmail.com
 * @since 2017-08-19 00:54:29
 * @version 1.0.0
 * @desc tokenize.ts
 */
var state;
var buffer$1;
var bufSize;
var sectionStart;
var index$1;
var tokens$1;
var char;
var inScript;
var inStyle;
var offset;
function makeCodePoints(input) {
    return {
        lower: input
            .toLowerCase()
            .split('')
            .map(function (c) { return c.charCodeAt(0); }),
        upper: input
            .toUpperCase()
            .split('')
            .map(function (c) { return c.charCodeAt(0); }),
        length: input.length,
    };
}
var doctype = makeCodePoints('!doctype');
var style = makeCodePoints('style');
var script = makeCodePoints('script');
function isWhiteSpace() {
    return (char === 32 /* _S */ ||
        char === 10 /* _N */ ||
        char === 9 /* _T */ ||
        char === 9 /* _T */ ||
        char === 13 /* _R */ ||
        char === 12 /* _F */);
}
function init$1(input) {
    state = 0 /* Literal */;
    buffer$1 = input;
    bufSize = input.length;
    sectionStart = 0;
    index$1 = 0;
    tokens$1 = [];
    inScript = false;
    inStyle = false;
    offset = 0;
}
function tokenize(input) {
    init$1(input);
    while (index$1 < bufSize) {
        char = buffer$1.charCodeAt(index$1);
        switch (state) {
            case 0 /* Literal */:
                parseLiteral();
                break;
            case 1 /* BeforeOpenTag */:
                parseBeforeOpenTag();
                break;
            case 2 /* OpeningTag */:
                parseOpeningTag();
                break;
            case 3 /* AfterOpenTag */:
                parseAfterOpenTag();
                break;
            case 4 /* InValueNq */:
                parseInValueNq();
                break;
            case 5 /* InValueSq */:
                parseInValueSq();
                break;
            case 6 /* InValueDq */:
                parseInValueDq();
                break;
            case 7 /* ClosingOpenTag */:
                parseClosingOpenTag();
                break;
            case 8 /* OpeningSpecial */:
                parseOpeningSpecial();
                break;
            case 9 /* OpeningDoctype */:
                parseOpeningDoctype();
                break;
            case 10 /* OpeningNormalComment */:
                parseOpeningNormalComment();
                break;
            case 11 /* InNormalComment */:
                parseNormalComment();
                break;
            case 12 /* InShortComment */:
                parseShortComment();
                break;
            case 13 /* ClosingNormalComment */:
                parseClosingNormalComment();
                break;
            case 14 /* ClosingTag */:
                parseClosingTag();
                break;
            default:
                unexpected$1();
                break;
        }
        index$1++;
    }
    switch (state) {
        case 0 /* Literal */:
        case 1 /* BeforeOpenTag */:
        case 4 /* InValueNq */:
        case 5 /* InValueSq */:
        case 6 /* InValueDq */:
        case 7 /* ClosingOpenTag */:
        case 11 /* InNormalComment */:
        case 12 /* InShortComment */:
        case 13 /* ClosingNormalComment */:
            emitToken(0 /* Literal */);
            break;
        case 2 /* OpeningTag */:
            emitToken(1 /* OpenTag */);
            break;
        case 3 /* AfterOpenTag */:
            break;
        case 8 /* OpeningSpecial */:
            emitToken(1 /* OpenTag */, 12 /* InShortComment */);
            break;
        case 9 /* OpeningDoctype */:
            if (index$1 - sectionStart === doctype.length) {
                emitToken(1 /* OpenTag */);
            }
            else {
                emitToken(1 /* OpenTag */, void 0, sectionStart + 1);
                emitToken(0 /* Literal */);
            }
            break;
        case 10 /* OpeningNormalComment */:
            if (index$1 - sectionStart === 2) {
                emitToken(1 /* OpenTag */);
            }
            else {
                emitToken(1 /* OpenTag */, void 0, sectionStart + 1);
                emitToken(0 /* Literal */);
            }
            break;
        case 14 /* ClosingTag */:
            emitToken(3 /* CloseTag */);
            break;
    }
    var _tokens = tokens$1;
    init$1('');
    return _tokens;
}
function emitToken(kind, newState, end) {
    if (newState === void 0) { newState = state; }
    if (end === void 0) { end = index$1; }
    var value = buffer$1.substring(sectionStart, end);
    if (kind === 1 /* OpenTag */ || kind === 3 /* CloseTag */) {
        value = value.toLowerCase();
    }
    if (kind === 1 /* OpenTag */) {
        if (value === 'script') {
            inScript = true;
        }
        else if (value === 'style') {
            inStyle = true;
        }
    }
    if (kind === 3 /* CloseTag */) {
        inScript = inStyle = false;
    }
    if (!((kind === 0 /* Literal */ || kind === 4 /* Whitespace */) && end === sectionStart)) {
        // empty literal should be ignored
        tokens$1.push({ type: kind, start: sectionStart, end: end, value: value });
    }
    if (kind === 2 /* OpenTagEnd */ || kind === 3 /* CloseTag */) {
        sectionStart = end + 1;
        state = 0 /* Literal */;
    }
    else {
        sectionStart = end;
        state = newState;
    }
}
function parseLiteral() {
    if (char === 60 /* Lt */) {
        // <
        emitToken(0 /* Literal */, 1 /* BeforeOpenTag */);
    }
}
function parseBeforeOpenTag() {
    if (inScript || inStyle) {
        if (char === 47 /* Sl */) {
            state = 14 /* ClosingTag */;
            sectionStart = index$1 + 1;
        }
        else {
            state = 0 /* Literal */;
        }
        return;
    }
    if ((char >= 97 /* La */ && char <= 122 /* Lz */) || (char >= 65 /* Ua */ && char <= 90 /* Uz */)) {
        // <d
        state = 2 /* OpeningTag */;
        sectionStart = index$1;
    }
    else if (char === 47 /* Sl */) {
        // </
        state = 14 /* ClosingTag */;
        sectionStart = index$1 + 1;
    }
    else if (char === 60 /* Lt */) {
        // <<
        emitToken(0 /* Literal */);
    }
    else if (char === 33 /* Ep */) {
        // <!
        state = 8 /* OpeningSpecial */;
        sectionStart = index$1;
    }
    else if (char === 63 /* Qm */) {
        // <?
        // treat as short comment
        sectionStart = index$1;
        emitToken(1 /* OpenTag */, 12 /* InShortComment */);
    }
    else {
        // <>
        // any other chars covert to normal state
        state = 0 /* Literal */;
    }
}
function parseOpeningTag() {
    if (isWhiteSpace()) {
        // <div ...
        emitToken(1 /* OpenTag */, 3 /* AfterOpenTag */);
    }
    else if (char === 62 /* Gt */) {
        // <div>
        emitToken(1 /* OpenTag */);
        emitToken(2 /* OpenTagEnd */);
    }
    else if (char === 47 /* Sl */) {
        // <div/
        emitToken(1 /* OpenTag */, 7 /* ClosingOpenTag */);
    }
}
function parseAfterOpenTag() {
    if (char === 62 /* Gt */) {
        // <div >
        emitToken(4 /* Whitespace */);
        emitToken(2 /* OpenTagEnd */);
    }
    else if (char === 47 /* Sl */) {
        // <div /
        emitToken(4 /* Whitespace */, 7 /* ClosingOpenTag */);
    }
    else if (char === 61 /* Eq */) {
        // <div ...=...
        emitToken(4 /* Whitespace */);
        emitToken(5 /* AttrValueEq */, void 0, index$1 + 1);
    }
    else if (char === 39 /* Sq */) {
        // <div ...'...
        emitToken(4 /* Whitespace */, 5 /* InValueSq */);
    }
    else if (char === 34 /* Dq */) {
        // <div ..."...
        emitToken(4 /* Whitespace */, 6 /* InValueDq */);
    }
    else if (!isWhiteSpace()) {
        // <div ...name...
        emitToken(4 /* Whitespace */, 4 /* InValueNq */);
    }
}
function parseInValueNq() {
    if (char === 62 /* Gt */) {
        // <div xxx>
        emitToken(6 /* AttrValueNq */);
        emitToken(2 /* OpenTagEnd */);
    }
    else if (char === 47 /* Sl */) {
        // <div xxx/
        emitToken(6 /* AttrValueNq */, 7 /* ClosingOpenTag */);
    }
    else if (char === 61 /* Eq */) {
        // <div xxx=
        emitToken(6 /* AttrValueNq */);
        emitToken(5 /* AttrValueEq */, 3 /* AfterOpenTag */, index$1 + 1);
    }
    else if (isWhiteSpace()) {
        // <div xxx ...
        emitToken(6 /* AttrValueNq */, 3 /* AfterOpenTag */);
    }
}
function parseInValueSq() {
    if (char === 39 /* Sq */) {
        // <div 'xxx'
        emitToken(7 /* AttrValueSq */, 3 /* AfterOpenTag */, index$1 + 1);
    }
}
function parseInValueDq() {
    if (char === 34 /* Dq */) {
        // <div "xxx", problem same to Sq
        emitToken(8 /* AttrValueDq */, 3 /* AfterOpenTag */, index$1 + 1);
    }
}
function parseClosingOpenTag() {
    if (char === 62 /* Gt */) {
        // <div />
        emitToken(2 /* OpenTagEnd */);
    }
    else {
        // <div /...>
        emitToken(6 /* AttrValueNq */, 3 /* AfterOpenTag */);
        parseAfterOpenTag();
    }
}
function parseOpeningSpecial() {
    switch (char) {
        case 45 /* Cl */: // <!-
            state = 10 /* OpeningNormalComment */;
            break;
        case 100 /* Ld */: // <!d
        case 68 /* Ud */: // <!D
            state = 9 /* OpeningDoctype */;
            break;
        default:
            emitToken(1 /* OpenTag */, 12 /* InShortComment */);
            break;
    }
}
function parseOpeningDoctype() {
    offset = index$1 - sectionStart;
    if (offset === doctype.length) {
        // <!d, <!d , start: 0, index: 2
        if (isWhiteSpace()) {
            emitToken(1 /* OpenTag */, 3 /* AfterOpenTag */);
        }
        else {
            unexpected$1();
        }
    }
    else if (char === 62 /* Gt */) {
        // <!DOCT>
        emitToken(1 /* OpenTag */, void 0, sectionStart + 1);
        emitToken(0 /* Literal */);
        emitToken(2 /* OpenTagEnd */);
    }
    else if (doctype.lower[offset] !== char && doctype.upper[offset] !== char) {
        // <!DOCX...
        emitToken(1 /* OpenTag */, 12 /* InShortComment */, sectionStart + 1);
    }
}
function parseOpeningNormalComment() {
    if (char === 45 /* Cl */) {
        // <!--
        emitToken(1 /* OpenTag */, 11 /* InNormalComment */, index$1 + 1);
    }
    else {
        emitToken(1 /* OpenTag */, 12 /* InShortComment */, sectionStart + 1);
    }
}
function parseNormalComment() {
    if (char === 45 /* Cl */) {
        // <!-- ... -
        emitToken(0 /* Literal */, 13 /* ClosingNormalComment */);
    }
}
function parseShortComment() {
    if (char === 62 /* Gt */) {
        // <! ... >
        emitToken(0 /* Literal */);
        emitToken(2 /* OpenTagEnd */);
    }
}
function parseClosingNormalComment() {
    offset = index$1 - sectionStart;
    if (offset === 2) {
        if (char === 62 /* Gt */) {
            // <!-- xxx -->
            emitToken(2 /* OpenTagEnd */);
        }
        else if (char === 45 /* Cl */) {
            // <!-- xxx ---
            emitToken(0 /* Literal */, void 0, sectionStart + 1);
        }
        else {
            // <!-- xxx --x
            state = 11 /* InNormalComment */;
        }
    }
    else if (char !== 45 /* Cl */) {
        // <!-- xxx - ...
        state = 11 /* InNormalComment */;
    }
}
function parseClosingTag() {
    offset = index$1 - sectionStart;
    if (inStyle) {
        if (char === 60 /* Lt */) {
            sectionStart -= 2;
            emitToken(0 /* Literal */, 1 /* BeforeOpenTag */);
        }
        else if (offset < style.length) {
            if (style.lower[offset] !== char && style.upper[offset] !== char) {
                sectionStart -= 2;
                state = 0 /* Literal */;
            }
        }
        else if (char === 62 /* Gt */) {
            emitToken(3 /* CloseTag */);
        }
        else if (!isWhiteSpace()) {
            sectionStart -= 2;
            state = 0 /* Literal */;
        }
    }
    else if (inScript) {
        if (char === 60 /* Lt */) {
            sectionStart -= 2;
            emitToken(0 /* Literal */, 1 /* BeforeOpenTag */);
        }
        else if (offset < script.length) {
            if (script.lower[offset] !== char && script.upper[offset] !== char) {
                sectionStart -= 2;
                state = 0 /* Literal */;
            }
        }
        else if (char === 62 /* Gt */) {
            emitToken(3 /* CloseTag */);
        }
        else if (!isWhiteSpace()) {
            sectionStart -= 2;
            state = 0 /* Literal */;
        }
    }
    else if (char === 62 /* Gt */) {
        // </ xxx >
        emitToken(3 /* CloseTag */);
    }
}
function unexpected$1() {
    throw new SyntaxError("Unexpected token \"" + buffer$1.charAt(index$1) + "\" at " + index$1 + " when parse " + state);
}

/*!
 *
 * Copyright 2017 - acrazing
 *
 * @author acrazing joking.young@gmail.com
 * @since 2017-08-19 15:56:14
 * @version 1.0.0
 * @desc config.ts
 */
function createMap(keys, value) {
    return keys.split(',').reduce(function (pre, now) {
        pre[now] = value;
        return pre;
    }, Object.create(null));
}
var selfCloseTags = createMap('area,base,br,col,embed,hr,img,input,link,meta,param,source,track,wbr,!doctype,,!,!--', true);
var noNestedTags = createMap('li,option,select,textarea', true);

/*!
 *
 * Copyright 2017 - acrazing
 *
 * @author acrazing joking.young@gmail.com
 * @since 2017-08-20 21:41:39
 * @version 1.0.0
 * @desc utils.ts
 */
function getLineRanges(input) {
    return input.split('\n').reduce(function (arr, line) {
        arr.push(line.length + 1 + arr[arr.length - 1]);
        return arr;
    }, [0]);
}
function getPosition(ranges, offset) {
    var line = NaN;
    var column = NaN;
    for (var i = 1; i < ranges.length; i++) {
        if (ranges[i] > offset) {
            line = i;
            column = offset - ranges[i - 1] + 1;
            break;
        }
    }
    return [line, column];
}

/*!
 *
 * Copyright 2017 - acrazing
 *
 * @author acrazing joking.young@gmail.com
 * @since 2017-08-19 00:54:46
 * @version 1.0.0
 * @desc walk.ts
 */
function visit(node, parent, index, options) {
    options.enter && options.enter(node, parent, index);
    if (node.type === SyntaxKind.Tag && Array.isArray(node.body)) {
        for (var i = 0; i < node.body.length; i++) {
            visit(node.body[i], node, i, options);
        }
    }
    options.leave && options.leave(node, parent, index);
}
function walk(ast, options) {
    for (var i = 0; i < ast.length; i++) {
        visit(ast[i], void 0, i, options);
    }
}

/*!
 *
 * Copyright 2017 - acrazing
 *
 * @author acrazing joking.young@gmail.com
 * @since 2017-08-19 00:54:46
 * @version 1.0.0
 * @desc parse.ts
 */
var index;
var count;
var tokens;
var tagChain;
var nodes;
var token;
var node;
var buffer;
var lines;
var parseOptions;
function init(input, options) {
    if (input === void 0) {
        count = 0;
        tokens.length = 0;
        buffer = '';
    }
    else {
        tokens = tokenize(input);
        count = tokens.length;
        buffer = input;
    }
    index = 0;
    tagChain = void 0;
    nodes = [];
    token = void 0;
    node = void 0;
    lines = void 0;
    parseOptions = options;
}
function pushNode(_node) {
    if (!tagChain) {
        nodes.push(_node);
    }
    else if (_node.type === SyntaxKind.Tag &&
        _node.name === tagChain.tag.name &&
        noNestedTags[_node.name]) {
        tagChain = tagChain.parent;
        pushNode(_node);
    }
    else if (tagChain.tag.body) {
        tagChain.tag.end = _node.end;
        tagChain.tag.body.push(_node);
    }
}
function pushTagChain(tag) {
    tagChain = { parent: tagChain, tag: tag };
    node = void 0;
}
function createLiteral(start, end, value) {
    if (start === void 0) { start = token.start; }
    if (end === void 0) { end = token.end; }
    if (value === void 0) { value = token.value; }
    return { start: start, end: end, value: value, type: SyntaxKind.Text };
}
function createTag() {
    return {
        start: token.start - 1,
        end: token.end,
        type: SyntaxKind.Tag,
        open: createLiteral(token.start - 1),
        name: token.value,
        rawName: buffer.substring(token.start, token.end),
        attributes: [],
        attributeMap: void 0,
        body: null,
        close: null,
    };
}
function createAttribute() {
    return {
        start: token.start,
        end: token.end,
        name: createLiteral(),
        value: void 0,
    };
}
function createAttributeValue() {
    return {
        start: token.start,
        end: token.end,
        value: token.type === 6 /* AttrValueNq */
            ? token.value
            : token.value.substr(1, token.value.length - 2),
        quote: token.type === 6 /* AttrValueNq */
            ? void 0
            : token.type === 7 /* AttrValueSq */
                ? "'"
                : '"',
    };
}
function appendLiteral(_node) {
    if (_node === void 0) { _node = node; }
    _node.value += token.value;
    _node.end = token.end;
}
function unexpected() {
    if (lines === void 0) {
        lines = getLineRanges(buffer);
    }
    var _a = __read(getPosition(lines, token.start), 2), line = _a[0], column = _a[1];
    throw new Error("Unexpected token \"" + token.value + "(" + token.type + ")\" at [" + line + "," + column + "]" +
        (tagChain ? " when parsing tag: " + JSON.stringify(tagChain.tag.name) + "." : ''));
}
function buildAttributeMap(tag) {
    var e_1, _a;
    tag.attributeMap = {};
    try {
        for (var _b = __values(tag.attributes), _c = _b.next(); !_c.done; _c = _b.next()) {
            var attr = _c.value;
            tag.attributeMap[attr.name.value] = attr;
        }
    }
    catch (e_1_1) { e_1 = { error: e_1_1 }; }
    finally {
        try {
            if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
        }
        finally { if (e_1) throw e_1.error; }
    }
}
function parseOpenTag() {
    var state = 0 /* BeforeAttr */;
    var attr = void 0;
    var tag = createTag();
    pushNode(tag);
    if (tag.name === '' || tag.name === '!' || tag.name === '!--') {
        tag.open.value = '<' + tag.open.value;
        if (index === count) {
            return;
        }
        else {
            token = tokens[++index];
            if (token.type !== 2 /* OpenTagEnd */) {
                node = createLiteral();
                tag.body = [node];
                while (++index < count) {
                    token = tokens[index];
                    if (token.type === 2 /* OpenTagEnd */) {
                        node = void 0;
                        break;
                    }
                    appendLiteral();
                }
            }
            tag.close = createLiteral(token.start, token.end + 1, token.value + ">");
            tag.end = tag.close.end;
        }
        return;
    }
    while (++index < count) {
        token = tokens[index];
        if (token.type === 2 /* OpenTagEnd */) {
            tag.end = tag.open.end = token.end + 1;
            tag.open.value = buffer.substring(tag.open.start, tag.open.end);
            if (token.value === '' && !selfCloseTags[tag.name]) {
                tag.body = [];
                pushTagChain(tag);
            }
            else {
                tag.body = void 0;
            }
            break;
        }
        else if (state === 0 /* BeforeAttr */) {
            if (token.type !== 4 /* Whitespace */) {
                attr = createAttribute();
                state = 1 /* InName */;
                tag.attributes.push(attr);
            }
        }
        else if (state === 1 /* InName */) {
            if (token.type === 4 /* Whitespace */) {
                state = 2 /* AfterName */;
            }
            else if (token.type === 5 /* AttrValueEq */) {
                state = 3 /* AfterEqual */;
            }
            else {
                appendLiteral(attr.name);
            }
        }
        else if (state === 2 /* AfterName */) {
            if (token.type !== 4 /* Whitespace */) {
                if (token.type === 5 /* AttrValueEq */) {
                    state = 3 /* AfterEqual */;
                }
                else {
                    attr = createAttribute();
                    state = 1 /* InName */;
                    tag.attributes.push(attr);
                }
            }
        }
        else if (state === 3 /* AfterEqual */) {
            if (token.type !== 4 /* Whitespace */) {
                attr.value = createAttributeValue();
                if (token.type === 6 /* AttrValueNq */) {
                    state = 4 /* InValue */;
                }
                else {
                    attr.end = attr.value.end;
                    state = 0 /* BeforeAttr */;
                }
            }
        }
        else {
            if (token.type === 4 /* Whitespace */) {
                attr.end = attr.value.end;
                state = 0 /* BeforeAttr */;
            }
            else {
                appendLiteral(attr.value);
            }
        }
    }
}
function parseCloseTag() {
    var _context = tagChain;
    while (true) {
        if (!_context || token.value.trim() === _context.tag.name) {
            break;
        }
        _context = _context.parent;
    }
    if (!_context) {
        return;
    }
    _context.tag.close = createLiteral(token.start - 2, token.end + 1, buffer.substring(token.start - 2, token.end + 1));
    _context.tag.end = _context.tag.close.end;
    _context = _context.parent;
    tagChain = _context;
}
function parse(input, options) {
    init(input, __assign({ setAttributeMap: false }, options));
    while (index < count) {
        token = tokens[index];
        switch (token.type) {
            case 0 /* Literal */:
                if (!node) {
                    node = createLiteral();
                    pushNode(node);
                }
                else {
                    appendLiteral(node);
                }
                break;
            case 1 /* OpenTag */:
                node = void 0;
                parseOpenTag();
                break;
            case 3 /* CloseTag */:
                node = void 0;
                parseCloseTag();
                break;
            default:
                unexpected();
                break;
        }
        index++;
    }
    var _nodes = nodes;
    if (parseOptions === null || parseOptions === void 0 ? void 0 : parseOptions.setAttributeMap) {
        walk(_nodes, {
            enter: function (node) {
                if (node.type === SyntaxKind.Tag) {
                    buildAttributeMap(node);
                }
            },
        });
    }
    init();
    return _nodes;
}

/*
 * @since 2020-09-09 22:53:14
 * @author acrazing <joking.young@gmail.com>
 */
var safeHtmlDefaultOptions = {
    allowedTags: [
        'a',
        'abbr',
        'address',
        'area',
        'article',
        'aside',
        'b',
        'bdi',
        'bdo',
        'big',
        'blockquote',
        'br',
        'button',
        'caption',
        'cite',
        'code',
        'col',
        'colgroup',
        'data',
        'dd',
        'del',
        'dfn',
        'div',
        'dl',
        'dt',
        'em',
        'figcaption',
        'figure',
        'footer',
        'h1',
        'h2',
        'h3',
        'h4',
        'h5',
        'h6',
        'header',
        'hgroup',
        'hr',
        'i',
        'img',
        'ins',
        'kbd',
        'label',
        'li',
        'main',
        'map',
        'ol',
        'p',
        'picture',
        'pre',
        'q',
        'rp',
        'rt',
        'ruby',
        's',
        'samp',
        'section',
        'small',
        'span',
        'strong',
        'sub',
        'summary',
        'sup',
        'table',
        'tbody',
        'td',
        'tfoot',
        'th',
        'thead',
        'time',
        'tr',
        'u',
        'ul',
        'var',
        'wbr',
    ],
    allowedAttrs: ['style'],
    tagAllowedAttrs: {
        a: ['href', 'target'],
        img: ['src'],
        td: ['rowspan', 'colspan'],
        th: ['rowspan', 'colspan'],
        time: ['datetime'],
        colgroup: ['span'],
        col: ['span'],
    },
    allowedUrl: /^(?:mailto|tel|https?|ftp|[^:]*[^a-z0-9.+-][^:]*):|^[^:]*$/i,
};
function safeHtml(input, options) {
    if (options === void 0) { options = {}; }
    var config = __assign(__assign(__assign({}, safeHtmlDefaultOptions), options), { tagAllowedAttrs: __assign(__assign({}, safeHtmlDefaultOptions.tagAllowedAttrs), options.tagAllowedAttrs) });
    var ast = parse(input);
    return stringify(ast, config, input);
}
function stringify(ast, config, input) {
    return ast
        .map(function (node) {
        if (node.type === SyntaxKind.Text) {
            return node.value;
        }
        if (config.allowedTags.indexOf(node.name) === -1) {
            return '';
        }
        if (selfCloseTags[node.name]) {
            if (node.body !== void 0) {
                throw new Error("self closed tag \"" + node.name + "\" should not have body");
            }
        }
        else {
            if (!node.body || !node.close) {
                throw new Error("tag \"" + node.name + "\" should have body and close");
            }
        }
        var attrs = node.attributes
            .filter(function (a) {
            var _a;
            if (config.allowedAttrs.indexOf(a.name.value) > -1 ||
                ((_a = config.tagAllowedAttrs[node.name]) === null || _a === void 0 ? void 0 : _a.indexOf(a.name.value)) > -1) {
                if (!a.value) {
                    return true;
                }
                if (a.name.value !== 'src' && a.name.value !== 'href') {
                    return true;
                }
                if (config.allowedUrl.test(a.value.value)) {
                    return true;
                }
                return false;
            }
            return false;
        })
            .map(function (a) { return input.substring(a.start, a.end); })
            .join(' ');
        var head = '<' + node.rawName + (attrs ? ' ' + attrs : '') + '>';
        if (!node.body) {
            return head;
        }
        return head + stringify(node.body, config, input) + ("</" + node.rawName + ">");
    })
        .join('');
}

export { SyntaxKind, parse, safeHtml, safeHtmlDefaultOptions, tokenize, walk };
//# sourceMappingURL=html5parser.es.js.map
