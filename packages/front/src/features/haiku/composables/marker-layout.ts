import { ref, watch, onMounted, onUnmounted, type Ref, nextTick } from 'vue';
import { useDebounceFn } from '@vueuse/core';

export interface VerseCutout {
  /** Pixel X where the clear window starts within the line */
  startX: number;
  /** Pixel X where the clear window ends within the line */
  endX: number;
}

export interface LineSegment {
  /** Text content of this run */
  text: string;
  /** Whether this run is part of a haiku verse (rendered bold, never redacted) */
  isVerse: boolean;
}

export interface MarkerLine {
  /** Y offset from container top edge (px) */
  y: number;
  /** Natural (pre-justification) text width on this line (px) */
  width: number;
  /** Line height (px) */
  lineHeight: number;
  /** Global index among all lines */
  index: number;
  /** Whether this is the last line of its paragraph (left-aligned, not justified) */
  isLastLine: boolean;
  /** Verse / non-verse runs making up this line, in reading order */
  segments: LineSegment[];
}

export interface MarkerLayoutResult {
  lines: MarkerLine[];
  containerWidth: number;
  containerHeight: number;
}

type PretextRichInline = typeof import('@chenglou/pretext/rich-inline');

let richInlineModule: PretextRichInline | null = null;

async function loadRichInline(): Promise<PretextRichInline> {
  if (!richInlineModule) {
    richInlineModule = await import('@chenglou/pretext/rich-inline');
  }

  return richInlineModule;
}

/**
 * Canvas font shorthand matching an element's computed style.
 * `weight` overrides font-weight — verses render bold, so they must be
 * measured bold or every line carrying one comes out too narrow.
 */
function fontString(style: CSSStyleDeclaration, weight?: string): string {
  return `${style.fontStyle} ${weight ?? style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
}

function getElementLineHeight(style: CSSStyleDeclaration): number {
  const lh = Number.parseFloat(style.lineHeight);

  if (!Number.isNaN(lh)) {
    return lh;
  }

  return Number.parseFloat(style.fontSize) * 1.8;
}

/**
 * Splits a paragraph into alternating non-verse / verse runs.
 * Overlapping or touching verse matches are merged so runs strictly alternate.
 */
export function splitIntoRuns(
  paragraph: string,
  verses: string[],
): LineSegment[] {
  const ranges: Array<{ start: number; end: number }> = [];

  for (const verse of verses) {
    const needle = verse?.trim();

    if (!needle) {
      continue;
    }
    const idx = paragraph.indexOf(needle);

    if (idx !== -1) {
      ranges.push({ start: idx, end: idx + needle.length });
    }
  }

  if (!ranges.length) {
    return [{ text: paragraph, isVerse: false }];
  }

  ranges.sort((a, b) => a.start - b.start);

  const merged: Array<{ start: number; end: number }> = [ranges[0]];

  for (const range of ranges.slice(1)) {
    const last = merged.at(-1)!;

    if (range.start <= last.end) {
      last.end = Math.max(last.end, range.end);

      continue;
    }
    merged.push(range);
  }

  const runs: LineSegment[] = [];
  let cursor = 0;

  for (const range of merged) {
    if (range.start > cursor) {
      runs.push({ text: paragraph.slice(cursor, range.start), isVerse: false });
    }
    runs.push({ text: paragraph.slice(range.start, range.end), isVerse: true });
    cursor = range.end;
  }

  if (cursor < paragraph.length) {
    runs.push({ text: paragraph.slice(cursor), isVerse: false });
  }

  return runs;
}

/**
 * Folds one laid-out rich-inline line back into verse / non-verse runs.
 * Collapsed inter-run whitespace is pushed outside the verse so the <mark>
 * box hugs the verse text exactly — the marker cutouts are measured from it.
 */
function foldFragments(
  fragments: Array<{ itemIndex: number; text: string; gapBefore: number }>,
  runs: LineSegment[],
): LineSegment[] {
  const segments: LineSegment[] = [];

  const push = (text: string, isVerse: boolean) => {
    const last = segments.at(-1);

    if (last && last.isVerse === isVerse) {
      last.text += text;

      return;
    }
    segments.push({ text, isVerse });
  };

  fragments.forEach((fragment, index) => {
    const isVerse = runs[fragment.itemIndex]?.isVerse ?? false;
    const previous = segments.at(-1);
    const hasGap =
      fragment.gapBefore > 0 && index > 0 && previous !== undefined;

    // Keep the collapsed gap outside the <mark> so its box hugs the verse
    if (hasGap && !previous.isVerse) {
      previous.text += ' ';
    }
    push(
      hasGap && previous?.isVerse && !isVerse
        ? ' ' + fragment.text
        : fragment.text,
      isVerse,
    );
  });

  return segments.filter((segment) => segment.text.length > 0);
}

/**
 * Measures chapter text with pretext's rich-inline flow, so line breaking
 * accounts for the bold verse runs instead of assuming a single font.
 * Y positions come from lineHeight arithmetic, guaranteed to match CSS.
 */
export function useMarkerLayout(
  elementRef: Ref<HTMLElement | null>,
  textContent: Ref<string>,
  verses?: Ref<string[]>,
) {
  const layout = ref<MarkerLayoutResult>({
    lines: [],
    containerWidth: 0,
    containerHeight: 0,
  });
  const ready = ref(false);

  let resizeObserver: ResizeObserver | null = null;

  async function computeLayout() {
    const el = elementRef.value;

    if (!el || !textContent.value) {
      layout.value = { lines: [], containerWidth: 0, containerHeight: 0 };

      return;
    }

    const rich = await loadRichInline();
    const style = getComputedStyle(el);
    const font = fontString(style);
    const verseFont = fontString(style, 'bold');
    const lineHeight = getElementLineHeight(style);
    const containerWidth = el.clientWidth;

    if (!containerWidth) {
      return;
    }

    const paragraphs = textContent.value.split('\n\n').filter((p) => p.trim());
    const activeVerses = verses?.value ?? [];
    const allLines: MarkerLine[] = [];
    let currentY = 0;
    let globalIndex = 0;

    for (let pi = 0; pi < paragraphs.length; pi++) {
      // Paragraph gap: one blank line height (matches the rendered spacing)
      if (pi > 0) {
        currentY += lineHeight;
      }

      const runs = splitIntoRuns(paragraphs[pi].trim(), activeVerses);
      const prepared = rich.prepareRichInline(
        runs.map((run) => ({
          text: run.text,
          font: run.isVerse ? verseFont : font,
        })),
      );

      const paragraphStart = allLines.length;

      rich.walkRichInlineLineRanges(prepared, containerWidth, (range) => {
        const line = rich.materializeRichInlineLineRange(prepared, range);

        allLines.push({
          y: currentY,
          width: line.width,
          lineHeight,
          index: globalIndex++,
          isLastLine: false,
          segments: foldFragments(line.fragments, runs),
        });
        currentY += lineHeight;
      });

      if (allLines.length > paragraphStart) {
        allLines.at(-1)!.isLastLine = true;
      }
    }

    layout.value = {
      lines: allLines,
      containerWidth,
      containerHeight: currentY,
    };
    ready.value = true;
  }

  const debouncedCompute = useDebounceFn(computeLayout, 50);

  watch([textContent, () => verses?.value], () => debouncedCompute());

  onMounted(async () => {
    if (import.meta.env.SSR) {
      return;
    }
    await document.fonts.ready;

    if (elementRef.value) {
      resizeObserver = new ResizeObserver(() => debouncedCompute());
      resizeObserver.observe(elementRef.value);
    }

    await nextTick();
    computeLayout();
  });

  watch(elementRef, (newEl) => {
    resizeObserver?.disconnect();

    if (newEl) {
      resizeObserver = new ResizeObserver(() => debouncedCompute());
      resizeObserver.observe(newEl);
      debouncedCompute();
    }
  });

  onUnmounted(() => {
    resizeObserver?.disconnect();
  });

  return { layout, ready };
}
