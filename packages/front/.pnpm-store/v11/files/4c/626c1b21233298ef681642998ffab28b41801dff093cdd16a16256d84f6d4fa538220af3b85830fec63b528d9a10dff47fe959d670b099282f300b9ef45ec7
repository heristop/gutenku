import { CHAR_CR, CHAR_LF, CHAR_LS, CHAR_PS } from "./utils.js";
const MAPPING_FIELDS = 3;
const SEGMENT_BYTES_MAX = 1 + 4 * 7;
const VLQ_DIGITS = new TextEncoder().encode("ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/");
const VLQ_ZERO = VLQ_DIGITS[0];
const CHAR_COMMA = 0x2c;
const CHAR_SEMICOLON = 0x3b;
const LINE_TERMINATORS = ["\n", "\r", String.fromCharCode(CHAR_LS), String.fromCharCode(CHAR_PS)];
export class Mappings {
    data;
    length = 0;
    constructor(capacity) {
        this.data = new Int32Array(capacity * MAPPING_FIELDS);
    }
    push(committed, colOffset, sourceOffset) {
        if (this.length + MAPPING_FIELDS > this.data.length) {
            const data = new Int32Array(this.data.length * 2);
            data.set(this.data);
            this.data = data;
        }
        const at = this.length;
        this.data[at] = committed;
        this.data[at + 1] = colOffset;
        this.data[at + 2] = sourceOffset;
        this.length = at + MAPPING_FIELDS;
    }
}
export function encodeMappings(output, source, mappings) {
    const { data, length } = mappings;
    const outputLines = new OutputLines(output);
    const sourceLines = lineStarts(source);
    const writer = new VlqWriter(length / MAPPING_FIELDS);
    let hasPending = false;
    let pendingGenLine = 0;
    let pendingGenCol = 0;
    let pendingSourceLine = 0;
    let pendingSourceCol = 0;
    let sourceLine = 0;
    for (let i = 0; i < length; i += MAPPING_FIELDS) {
        const committed = data[i];
        const sourceOffset = data[i + 2];
        outputLines.advance(committed);
        const genLine = outputLines.line;
        const genCol = committed - outputLines.lineStart + data[i + 1];
        sourceLine = lineOf(sourceLines, sourceOffset, sourceLine);
        const sourceCol = sourceOffset - sourceLines[sourceLine];
        if (hasPending && (pendingGenLine !== genLine || pendingGenCol !== genCol)) {
            writer.segment(pendingGenLine, pendingGenCol, pendingSourceLine, pendingSourceCol);
        }
        hasPending = true;
        pendingGenLine = genLine;
        pendingGenCol = genCol;
        pendingSourceLine = sourceLine;
        pendingSourceCol = sourceCol;
    }
    if (hasPending) {
        writer.segment(pendingGenLine, pendingGenCol, pendingSourceLine, pendingSourceCol);
    }
    return writer.finish();
}
class LineBreaks {
    text;
    at = -1;
    after = 0;
    next;
    constructor(text) {
        this.text = text;
        this.next = Int32Array.from(LINE_TERMINATORS, (terminator) => text.indexOf(terminator));
        this.step();
    }
    step() {
        const { text, next, after } = this;
        let at = -1;
        for (let k = 0; k < next.length; k++) {
            let offset = next[k];
            if (offset !== -1 && offset < after) {
                offset = text.indexOf(LINE_TERMINATORS[k], after);
                next[k] = offset;
            }
            if (offset !== -1 && (at === -1 || offset < at))
                at = offset;
        }
        this.at = at;
        if (at === -1)
            return;
        const crlf = text.charCodeAt(at) === CHAR_CR && text.charCodeAt(at + 1) === CHAR_LF;
        this.after = crlf ? at + 2 : at + 1;
    }
}
class OutputLines {
    breaks;
    line = 0;
    lineStart = 0;
    constructor(output) {
        this.breaks = new LineBreaks(output);
    }
    advance(offset) {
        const breaks = this.breaks;
        while (breaks.at !== -1 && breaks.after <= offset) {
            this.line++;
            this.lineStart = breaks.after;
            breaks.step();
        }
    }
}
function lineStarts(text) {
    const starts = [0];
    const breaks = new LineBreaks(text);
    while (breaks.at !== -1) {
        starts.push(breaks.after);
        breaks.step();
    }
    return Int32Array.from(starts);
}
function lineOf(starts, offset, hint) {
    const last = starts.length - 1;
    if (starts[hint] <= offset) {
        if (hint === last || offset < starts[hint + 1])
            return hint;
        if (hint + 1 === last || offset < starts[hint + 2])
            return hint + 1;
    }
    let low = 0;
    let high = last;
    while (low < high) {
        const mid = (low + high + 1) >>> 1;
        if (starts[mid] <= offset)
            low = mid;
        else
            high = mid - 1;
    }
    return low;
}
class VlqWriter {
    bytes;
    length = 0;
    genLine = 0;
    genCol = 0;
    sourceLine = 0;
    sourceCol = 0;
    constructor(segments) {
        this.bytes = new Uint8Array(Math.max(segments * 6, 1024));
    }
    segment(genLine, genCol, sourceLine, sourceCol) {
        const lines = genLine - this.genLine;
        this.reserve(lines + SEGMENT_BYTES_MAX);
        const bytes = this.bytes;
        let at = this.length;
        if (lines > 0) {
            bytes.fill(CHAR_SEMICOLON, at, at + lines);
            at += lines;
            this.genLine = genLine;
            this.genCol = 0;
        }
        else if (at > 0) {
            bytes[at++] = CHAR_COMMA;
        }
        at = writeVlq(bytes, at, genCol - this.genCol);
        // the source index delta, always zero with one source
        bytes[at++] = VLQ_ZERO;
        at = writeVlq(bytes, at, sourceLine - this.sourceLine);
        at = writeVlq(bytes, at, sourceCol - this.sourceCol);
        this.length = at;
        this.genCol = genCol;
        this.sourceLine = sourceLine;
        this.sourceCol = sourceCol;
    }
    reserve(extra) {
        const needed = this.length + extra;
        if (needed <= this.bytes.length)
            return;
        const bytes = new Uint8Array(Math.max(needed, this.bytes.length * 2));
        bytes.set(this.bytes.subarray(0, this.length));
        this.bytes = bytes;
    }
    finish() {
        return new TextDecoder("latin1").decode(this.bytes.subarray(0, this.length));
    }
}
function writeVlq(bytes, start, value) {
    let bits = value < 0 ? (-value << 1) | 1 : value << 1;
    let at = start;
    do {
        const digit = bits & 0x1f;
        bits >>>= 5;
        bytes[at++] = VLQ_DIGITS[bits === 0 ? digit : digit | 0x20];
    } while (bits !== 0);
    return at;
}
