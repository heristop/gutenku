/** "~12s" while time remains; nothing once it reaches zero. */
export function etaLabel(seconds: number | null): string | null {
  return seconds !== null && seconds > 0 ? `~${seconds}s` : null;
}

/**
 * The running best on the Quality Score's own scale: a whole number, and
 * nothing before a candidate has scored at all.
 */
export function bestScoreLabel(score: number): number | null {
  return score > 0 ? Math.round(score) : null;
}
