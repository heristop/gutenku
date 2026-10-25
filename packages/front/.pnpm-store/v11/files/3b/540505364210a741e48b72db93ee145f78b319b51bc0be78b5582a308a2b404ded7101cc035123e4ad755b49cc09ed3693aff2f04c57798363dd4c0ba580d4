import { CHAR_BANG, CHAR_DOT, CHAR_EQUALS, CHAR_LF, CHAR_LT, CHAR_MINUS, CHAR_PLUS, CHAR_QUESTION, CHAR_SLASH, CHAR_SPACE, isIdCont, } from "./utils.js";
// where a leading `{`, `function`, `class`, or `let[` would misparse as a block or declaration
export const LEAD_NONE = 0;
export const LEAD_STMT = 1;
export const LEAD_ARROW = 2;
export const LEAD_EXPORT_DEFAULT = 3;
// the byte before `.` in `1 .x`, which would lex as a fraction unspaced
const AFTER_BARE_INTEGER = 0xffff;
// the byte each punctuator fuses with, as in `<!` or `!=`
const FUSES_AFTER = new Uint16Array(128);
FUSES_AFTER[CHAR_PLUS] = CHAR_PLUS;
FUSES_AFTER[CHAR_MINUS] = CHAR_MINUS;
FUSES_AFTER[CHAR_SLASH] = CHAR_SLASH;
FUSES_AFTER[CHAR_LT] = CHAR_LT;
FUSES_AFTER[CHAR_BANG] = CHAR_LT;
FUSES_AFTER[CHAR_EQUALS] = CHAR_BANG;
FUSES_AFTER[CHAR_QUESTION] = CHAR_QUESTION;
FUSES_AFTER[CHAR_DOT] = AFTER_BARE_INTEGER;
const CHUNK_LENGTH = 16 * 1024;
const SPACED_ASCII = [];
for (let c = 0; c < 128; c++)
    SPACED_ASCII.push(" " + String.fromCharCode(c));
const SPACES = [""];
const SPACES_CACHED_MAX = 256;
function spaces(n) {
    if (n < SPACES.length)
        return SPACES[n];
    if (n >= SPACES_CACHED_MAX)
        return " ".repeat(n);
    while (SPACES.length <= n)
        SPACES.push(SPACES[SPACES.length - 1] + " ");
    return SPACES[n];
}
const FLATTEN_SINK = { value: 0 };
// a string search flattens the rope, so joining the chunks later copies flat strings
function flatten(s) {
    FLATTEN_SINK.value ^= s.indexOf(" ");
}
export class Output {
    pretty;
    mappings;
    text = "";
    chunks = null;
    spilled = 0;
    lastChar = 0;
    heldSpaces = 0;
    heldLiteral = false;
    bareIntegerEnd = -1;
    mapStart = -1;
    lead = LEAD_NONE;
    constructor(pretty, mappings) {
        this.pretty = pretty;
        this.mappings = mappings;
    }
    finish() {
        if (this.chunks === null) {
            flatten(this.text);
            return this.text;
        }
        this.chunks.push(this.text);
        return this.chunks.join("");
    }
    length() {
        return this.spilled + this.text.length;
    }
    lastByte() {
        if (this.heldSpaces > 0)
            return CHAR_SPACE;
        return this.length() === 0 ? 0 : this.lastChar;
    }
    writeToken(s) {
        const first = s.charCodeAt(0);
        if (!this.pretty)
            this.dropHeldSpace(first);
        const last = s.charCodeAt(s.length - 1);
        if (last === CHAR_SPACE)
            return this.writeHolding(s, first, false);
        this.lead = LEAD_NONE;
        const held = this.heldSpaces;
        if (held === 0) {
            this.separateToken(first);
            if (this.mapStart >= 0)
                this.placeMapping(0);
            this.text += s;
        }
        else {
            if (this.mapStart >= 0)
                this.placeMapping(held);
            this.appendAfterHeld(s, first, held);
        }
        this.lastChar = last;
    }
    // a name starts with an identifier character, so it neither fuses nor drops a held space
    writeName(s) {
        this.lead = LEAD_NONE;
        const held = this.heldSpaces;
        if (held === 0) {
            if (this.mapStart >= 0)
                this.placeMapping(0);
            this.text += s;
        }
        else {
            if (this.mapStart >= 0)
                this.placeMapping(held);
            this.appendAfterHeld(s, s.charCodeAt(0), held);
        }
        this.lastChar = s.charCodeAt(s.length - 1);
    }
    writeKeyword(word) {
        this.writeToken(word);
        this.heldSpaces++;
        this.heldLiteral = false;
    }
    writeSpaced(pretty, compact) {
        this.writeToken(this.pretty ? pretty : compact);
    }
    writeLiteral(s) {
        if (s.length === 0)
            return;
        const last = s.charCodeAt(s.length - 1);
        if (last === CHAR_SPACE)
            return this.writeHolding(s, s.charCodeAt(0), true);
        this.lead = LEAD_NONE;
        const held = this.heldSpaces;
        if (this.mapStart >= 0)
            this.placeMapping(held);
        if (held === 0)
            this.text += s;
        else
            this.appendAfterHeld(s, s.charCodeAt(0), held);
        this.lastChar = last;
    }
    // a comment leaves the lead and the mapping to the next token
    writeComment(s) {
        if (s.length === 0)
            return;
        let end = s.length;
        while (end > 0 && s.charCodeAt(end - 1) === CHAR_SPACE)
            end--;
        if (end > 0 && this.heldSpaces !== 0)
            this.commitSpaces();
        this.appendRest(s, end, false);
    }
    atLineStart() {
        return this.lastChar === CHAR_LF;
    }
    space() {
        if (!this.pretty)
            return;
        this.lead = LEAD_NONE;
        if (this.mapStart >= 0)
            this.placeMapping(this.heldSpaces);
        this.heldSpaces++;
        this.heldLiteral = false;
    }
    endLine(indent) {
        if (this.length() === 0)
            return;
        if (this.lastChar !== CHAR_LF) {
            this.text += "\n";
            this.lastChar = CHAR_LF;
        }
        this.heldSpaces = this.pretty ? indent : 0;
        this.heldLiteral = false;
    }
    recordMapping(span) {
        if (this.mappings === null)
            return;
        const start = span.start;
        // a node without a span or with a zero span is synthetic
        if (typeof start !== "number")
            return;
        if (start === 0 && span.end === 0)
            return;
        this.mapStart = start;
    }
    markBareInteger() {
        this.bareIntegerEnd = this.length();
    }
    spillWhenFull() {
        if (this.text.length >= CHUNK_LENGTH)
            this.spill();
    }
    writeHolding(s, first, literal) {
        let end = s.length;
        while (end > 0 && s.charCodeAt(end - 1) === CHAR_SPACE)
            end--;
        if (end > 0) {
            if (this.heldSpaces !== 0)
                this.commitSpaces();
            else if (!literal)
                this.separateToken(first);
        }
        this.lead = LEAD_NONE;
        // spaces alone map where the held spaces end
        if (this.mapStart >= 0)
            this.placeMapping(this.heldSpaces);
        this.appendRest(s, end, literal);
    }
    appendRest(s, end, literal) {
        if (end > 0) {
            this.text += end === s.length ? s : s.slice(0, end);
            this.lastChar = s.charCodeAt(end - 1);
        }
        if (end < s.length) {
            this.heldSpaces += s.length - end;
            this.heldLiteral = literal;
        }
    }
    appendAfterHeld(s, first, held) {
        this.heldSpaces = 0;
        this.heldLiteral = false;
        if (held === 1 && s.length === 1 && first < 128) {
            this.text += SPACED_ASCII[first];
        }
        else {
            this.text += spaces(held);
            this.text += s;
        }
    }
    commitSpaces() {
        this.text += spaces(this.heldSpaces);
        this.lastChar = CHAR_SPACE;
        this.heldSpaces = 0;
        this.heldLiteral = false;
    }
    // compact mode drops a keyword's lone trailing space before punctuation, never a literal's
    dropHeldSpace(next) {
        if (this.heldSpaces !== 1 || this.heldLiteral)
            return;
        if (this.length() === 0)
            return;
        if (isIdCont(this.lastChar) && !isIdCont(next))
            this.heldSpaces = 0;
    }
    separateToken(next) {
        if (next >= 128)
            return;
        const prev = FUSES_AFTER[next];
        if (prev === 0)
            return;
        const fuses = prev === AFTER_BARE_INTEGER ? this.bareIntegerEnd === this.length() : this.lastChar === prev;
        if (!fuses)
            return;
        this.text += " ";
        this.lastChar = CHAR_SPACE;
    }
    spill() {
        const text = this.text;
        flatten(text);
        this.spilled += text.length;
        this.text = "";
        if (this.chunks === null)
            this.chunks = [text];
        else
            this.chunks.push(text);
    }
    placeMapping(colOffset) {
        this.mappings.push(this.length(), colOffset, this.mapStart);
        this.mapStart = -1;
    }
}
