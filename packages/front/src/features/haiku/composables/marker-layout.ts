import { ref, watch, onMounted, onUnmounted, type Ref, nextTick } from 'vue';
import { useDebounceFn } from '@vueuse/core';

export interface VerseCutout {
  /** Pixel X where verse starts within the line */
  startX: number;
  /** Pixel X where verse ends within the line */
  endX: number;
}

export interface MarkerLine {
  /** X offset from container left edge (px) */
  x: number;
  /** Y offset from container top edge (px) */
  y: number;
  /** Measured text width on this line (px) */
  width: number;
  /** Line height (px) */
  lineHeight: number;
  /** Global index among all lines */
  index: number;
  /** Whether this is the last line of its paragraph (left-aligned, not justified) */
  isLastLine: boolean;
  /** The text content of this line */
  text: string;
  /** Verse cutouts — regions where marker bars should NOT render */
  cutouts: VerseCutout[];
}

export interface MarkerLayoutResult {
  lines: MarkerLine[];
  containerWidth: number;
  containerHeight: number;
}

let pretextModule: typeof import('@chenglou/pretext') | null = null;

async function loadPretext() {
  if (!pretextModule) {
    pretextModule = await import('@chenglou/pretext');
  }
  return pretextModule;
}

function getElementFont(el: HTMLElement): string {
  return getComputedStyle(el).font;
}

function getElementLineHeight(el: HTMLElement): number {
  const style = getComputedStyle(el);
  const lh = Number.parseFloat(style.lineHeight);
  if (!Number.isNaN(lh)) {
    return lh;
  }
  return Number.parseFloat(style.fontSize) * 1.8;
}

/** Gap before verse: small — bar ends close to the verse start */
const CUTOUT_GAP_LEFT = 2;
/** Gap after verse: larger — compensates for bold rendering being wider than measured */
const CUTOUT_GAP_RIGHT = 28;

/**
 * Measures the pixel width of a text string using pretext (single-line).
 */
function measureTextWidth(
  pretext: typeof import('@chenglou/pretext'),
  text: string,
  font: string,
  lineHeight: number,
): number {
  if (!text) {
    return 0;
  }
  const prepared = pretext.prepareWithSegments(text, font);
  const result = pretext.layoutWithLines(prepared, Infinity, lineHeight);
  return result.lines[0]?.width ?? 0;
}

/**
 * Find verse cutouts for a given line text.
 */
function findCutouts(
  pretext: typeof import('@chenglou/pretext'),
  lineText: string,
  verses: string[],
  font: string,
  lineHeight: number,
): VerseCutout[] {
  const cutouts: VerseCutout[] = [];
  for (const verse of verses) {
    if (!verse || !verse.trim()) {
      continue;
    }
    const idx = lineText.indexOf(verse);
    if (idx === -1) {
      continue;
    }

    const beforeText = lineText.slice(0, idx);
    const startX = measureTextWidth(pretext, beforeText, font, lineHeight);
    const verseWidth = measureTextWidth(pretext, verse, font, lineHeight);

    cutouts.push({
      startX: Math.max(0, startX - CUTOUT_GAP_LEFT),
      endX: startX + verseWidth + CUTOUT_GAP_RIGHT,
    });
  }
  return cutouts;
}

/**
 * Measures text layout using pretext.
 * Splits text by paragraph breaks, computes per-line data with accurate
 * Y positioning using lineHeight arithmetic (guaranteed to match CSS).
 * Computes verse cutout positions for split marker bars.
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

    const pretext = await loadPretext();
    const font = getElementFont(el);
    const lineHeight = getElementLineHeight(el);
    const containerWidth = el.clientWidth;

    if (!containerWidth || !font) {
      return;
    }

    const paragraphs = textContent.value.split('\n\n').filter((p) => p.trim());
    const allLines: MarkerLine[] = [];
    let currentY = 0;
    let globalIndex = 0;

    for (let pi = 0; pi < paragraphs.length; pi++) {
      // Paragraph gap: one blank line height (matches <br/><br/> in DOM)
      if (pi > 0) {
        currentY += lineHeight;
      }

      const para = paragraphs[pi].trim();
      const prepared = pretext.prepareWithSegments(para, font);
      const result = pretext.layoutWithLines(
        prepared,
        containerWidth,
        lineHeight,
      );

      for (let li = 0; li < result.lines.length; li++) {
        const line = result.lines[li];
        const cutouts = verses?.value
          ? findCutouts(pretext, line.text, verses.value, font, lineHeight)
          : [];
        allLines.push({
          text: line.text,
          x: 0,
          y: currentY,
          width: line.width,
          lineHeight,
          index: globalIndex++,
          isLastLine: li === result.lines.length - 1,
          cutouts,
        });
        currentY += lineHeight;
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

  watch(textContent, () => debouncedCompute());

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
