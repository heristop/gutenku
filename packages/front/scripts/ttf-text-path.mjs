// Minimal TrueType reader: turns a string into an SVG path using the glyph
// outlines of a .ttf (glyf/loca, cmap format 4, hmtx, kern format 0).
// Enough for rendering the JMH Typewriter wordmark without a font at
// render time. No dependencies.

import { readFileSync } from 'node:fs';

function readTables(b) {
  const tables = {};
  const numTables = b.readUInt16BE(4);

  for (let i = 0; i < numTables; i++) {
    const o = 12 + i * 16;
    tables[b.toString('ascii', o, o + 4)] = b.readUInt32BE(o + 8);
  }

  return tables;
}

// cmap format 4 (platform 3, encoding 1)
function findCmap4(b, cm) {
  const nSub = b.readUInt16BE(cm + 2);

  for (let i = 0; i < nSub; i++) {
    const pid = b.readUInt16BE(cm + 4 + i * 8);
    const eid = b.readUInt16BE(cm + 6 + i * 8);
    const off = cm + b.readUInt32BE(cm + 8 + i * 8);

    if (pid === 3 && eid === 1 && b.readUInt16BE(off) === 4) {
      return off;
    }
  }

  throw new Error('No cmap format 4 table');
}

function glyphIndexer(b, cmap4) {
  const segX2 = b.readUInt16BE(cmap4 + 6);
  const ends = cmap4 + 14;
  const starts = ends + segX2 + 2;
  const deltas = starts + segX2;
  const ranges = deltas + segX2;

  return (code) => {
    for (let i = 0; i < segX2 / 2; i++) {
      const end = b.readUInt16BE(ends + i * 2);

      if (code > end) {
        continue;
      }

      const start = b.readUInt16BE(starts + i * 2);

      if (code < start) {
        return 0;
      }

      const delta = b.readInt16BE(deltas + i * 2);
      const ro = b.readUInt16BE(ranges + i * 2);

      if (ro === 0) {
        return (code + delta) & 0xff_ff;
      }

      const g = b.readUInt16BE(ranges + i * 2 + ro + (code - start) * 2);

      return g === 0 ? 0 : (g + delta) & 0xff_ff;
    }

    return 0;
  };
}

// kern table, format 0 pairs
function readKern(b, k) {
  const kern = new Map();

  if (k === undefined) {
    return kern;
  }

  const nT = b.readUInt16BE(k + 2);
  let o = k + 4;

  for (let t = 0; t < nT; t++) {
    const len = b.readUInt16BE(o + 2);

    if (b.readUInt8(o + 4) === 0) {
      const nPairs = b.readUInt16BE(o + 6);

      for (let p = 0; p < nPairs; p++) {
        const po = o + 14 + p * 6;
        kern.set(
          `${b.readUInt16BE(po)},${b.readUInt16BE(po + 2)}`,
          b.readInt16BE(po + 4),
        );
      }
    }

    o += len;
  }

  return kern;
}

// Bytes of the optional transform after a component's offsets
function transformBytes(flags) {
  if (flags & 8) {
    return 2;
  }

  if (flags & 0x40) {
    return 4;
  }

  if (flags & 0x80) {
    return 8;
  }

  return 0;
}

// composite: offsets only (scales ignored, fine for Latin text)
function compositeContours(b, o, dx, dy, contours) {
  const out = [];
  let p = o + 10;
  let flags;

  do {
    flags = b.readUInt16BE(p);
    const glyph = b.readUInt16BE(p + 2);
    p += 4;

    const wide = flags & 1;
    const a1 = wide ? b.readInt16BE(p) : b.readInt8(p);
    const a2 = wide ? b.readInt16BE(p + 2) : b.readInt8(p + 1);
    p += wide ? 4 : 2;
    p += transformBytes(flags);

    const offsets = flags & 2;
    out.push(
      ...contours(glyph, dx + (offsets ? a1 : 0), dy + (offsets ? a2 : 0)),
    );
  } while (flags & 0x20);

  return out;
}

function readFlags(b, p, nPts) {
  const flags = [];

  while (flags.length < nPts) {
    const fl = b.readUInt8(p++);
    flags.push(fl);

    if (fl & 8) {
      let r = b.readUInt8(p++);

      while (r-- > 0) {
        flags.push(fl);
      }
    }
  }

  return { flags, p };
}

// One axis of a simple glyph: a short (1 byte) delta whose sign is given by
// `sameBit`, or a 2-byte delta, or (sameBit set) the same value as before
function readAxis(b, p, flags, shortBit, sameBit) {
  const values = [];
  let v = 0;

  for (const fl of flags) {
    if (fl & shortBit) {
      const d = b.readUInt8(p++);
      v += fl & sameBit ? d : -d;
      values.push(v);
      continue;
    }

    if (!(fl & sameBit)) {
      v += b.readInt16BE(p);
      p += 2;
    }

    values.push(v);
  }

  return { values, p };
}

function simpleContours(b, o, nC, dx, dy) {
  const endPts = [];

  for (let i = 0; i < nC; i++) {
    endPts.push(b.readUInt16BE(o + 10 + i * 2));
  }

  const nPts = endPts[nC - 1] + 1;
  let p = o + 10 + nC * 2;
  p += 2 + b.readUInt16BE(p);

  const read = readFlags(b, p, nPts);
  const { flags } = read;
  const xs = readAxis(b, read.p, flags, 2, 16);
  const ys = readAxis(b, xs.p, flags, 4, 32);
  const out = [];
  let s = 0;

  for (const e of endPts) {
    const c = [];

    for (let i = s; i <= e; i++) {
      c.push({
        x: xs.values[i] + dx,
        y: ys.values[i] + dy,
        on: Boolean(flags[i] & 1),
      });
    }

    out.push(c);
    s = e + 1;
  }

  return out;
}

export function loadFont(file) {
  const b = readFileSync(file);
  const tables = readTables(b);
  const head = tables.head;
  const unitsPerEm = b.readUInt16BE(head + 18);
  const longLoca = b.readInt16BE(head + 50) === 1;
  const numGlyphs = b.readUInt16BE(tables.maxp + 4);
  const numHMetrics = b.readUInt16BE(tables.hhea + 34);
  const ascender = b.readInt16BE(tables.hhea + 4);

  const advance = (g) =>
    b.readUInt16BE(tables.hmtx + 4 * Math.min(g, numHMetrics - 1));

  const locaAt = (g) =>
    longLoca
      ? b.readUInt32BE(tables.loca + g * 4)
      : b.readUInt16BE(tables.loca + g * 2) * 2;

  const glyphIndex = glyphIndexer(b, findCmap4(b, tables.cmap));
  const kern = readKern(b, tables.kern);

  // Returns contours as arrays of {x, y, on}.
  function contours(g, dx = 0, dy = 0) {
    if (g >= numGlyphs) {
      return [];
    }

    const start = locaAt(g);

    if (locaAt(g + 1) === start) {
      return [];
    }

    const o = tables.glyf + start;
    const nC = b.readInt16BE(o);

    if (nC < 0) {
      return compositeContours(b, o, dx, dy, contours);
    }

    return simpleContours(b, o, nC, dx, dy);
  }

  return { unitsPerEm, ascender, advance, glyphIndex, kern, contours };
}

const r = (n) => Math.round(n * 100) / 100;

// Start on an on-curve point, or the midpoint of two off-curve ones
function contourStart(c) {
  const startIdx = c.findIndex((pt) => pt.on);

  if (startIdx !== -1) {
    return { start: c[startIdx], startIdx };
  }

  return {
    start: { x: (c[0].x + c[1].x) / 2, y: (c[0].y + c[1].y) / 2, on: true },
    startIdx: 0,
  };
}

// One closed contour as SVG commands: lines between on-curve points, and
// quadratics through off-curve ones (two in a row imply an on-curve midpoint)
function contourPath(c, P) {
  const { start, startIdx } = contourStart(c);
  const n = c.length;
  let d = `M${P(start)}`;
  let ctrl = null;

  for (let i = 1; i <= n; i++) {
    const pt = c[(startIdx + i) % n];

    if (pt.on) {
      d += ctrl ? `Q${P(ctrl)} ${P(pt)}` : `L${P(pt)}`;
      ctrl = null;
      continue;
    }

    if (ctrl) {
      const mid = { x: (ctrl.x + pt.x) / 2, y: (ctrl.y + pt.y) / 2 };
      d += `Q${P(ctrl)} ${P(mid)}`;
    }

    ctrl = pt;
  }

  if (ctrl) {
    d += `Q${P(ctrl)} ${P(start)}`;
  }

  return `${d}Z`;
}

/**
 * SVG path for `text` set at `size` px with its baseline at (x, y).
 * Returns { d, width }.
 */
export function textPath(
  font,
  text,
  { x = 0, y = 0, size = 64, tracking = 0 } = {},
) {
  const k = size / font.unitsPerEm;
  let pen = 0;
  let d = '';
  let prev = null;

  for (const ch of text) {
    const g = font.glyphIndex(ch.codePointAt(0));

    if (prev !== null) {
      pen += font.kern.get(`${prev},${g}`) ?? 0;
    }

    const P = (pt) => `${r(x + (pen + pt.x) * k)} ${r(y - pt.y * k)}`;

    for (const c of font.contours(g)) {
      if (c.length > 0) {
        d += contourPath(c, P);
      }
    }

    pen += font.advance(g) + tracking / k;
    prev = g;
  }

  return { d, width: pen * k };
}
