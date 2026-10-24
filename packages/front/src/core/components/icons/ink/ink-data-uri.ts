import { INK_PATHS, type InkIconName } from './paths';

/**
 * Ink icon as an SVG data URI, for CSS `cursor`/`mask`/`background` and
 * <img src> uses where a component cannot render.
 */
export function inkIconDataUri(
  name: InkIconName,
  {
    color = '#27221f',
    size = 24,
    strokeWidth = 1.75,
  }: { color?: string; size?: number; strokeWidth?: number } = {},
): string {
  const paths = INK_PATHS[name].map((d) => `<path d="${d}"/>`).join('');
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="${strokeWidth}" stroke-linecap="round" stroke-linejoin="round">${paths}</svg>`;

  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}
