// A carriage crosses one line at a time, returning to the margin between lines.
// Only the snapshot is clipped: the live page never changes layout.
export function typewriterRevealFrames(lines = 8, columns = 18): Keyframe[] {
  return Array.from({ length: lines * columns + 1 }, (_, index) => {
    const row = Math.min(lines - 1, Math.floor(index / columns));
    const x =
      index === lines * columns ? 100 : ((index % columns) / columns) * 100;
    const top = (row / lines) * 100;
    const bottom = ((row + 1) / lines) * 100;

    return {
      clipPath: `polygon(0 0, 100% 0, 100% ${top}%, ${x}% ${top}%, ${x}% ${bottom}%, 0 ${bottom}%)`,
      offset: index / (lines * columns),
    };
  });
}

export function animateTypewriterReveal(): void {
  document.documentElement.animate(typewriterRevealFrames(), {
    duration: 560,
    easing: 'linear',
    fill: 'both',
    pseudoElement: '::view-transition-new(root)',
  });
}
