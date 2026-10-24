// Shared choreography for the redaction marker (title, author and chapter).
// Every sequence finishes inside the 600ms motion ceiling whatever the number
// of lines: the per-line stagger shrinks as the page grows.

/** One marker pass (drawing a bar on, or lifting it off) */
export const MARKER_STROKE_MS = 240;
/** Upper bound for the cumulative stagger of a sequence */
export const MARKER_STAGGER_BUDGET_MS = 600 - MARKER_STROKE_MS;
/** Stagger between lines when the budget allows it */
const MARKER_LINE_STAGGER_MS = 30;

export function markerStagger(lineCount: number, offset = 0): number {
  if (lineCount <= 1) {
    return 0;
  }

  const budget = Math.max(MARKER_STAGGER_BUDGET_MS - offset, 0);

  return Math.min(MARKER_LINE_STAGGER_MS, budget / (lineCount - 1));
}

/** Total time a sequence runs, used to unmount the lifted bars */
export function markerSequenceMs(lineCount: number, offset = 0): number {
  return (
    offset +
    markerStagger(lineCount, offset) * Math.max(lineCount - 1, 0) +
    MARKER_STROKE_MS
  );
}
