import type { CanvasRenderingContext2D, Image } from 'canvas';

export const CANVAS_WIDTH = 2025;
export const CANVAS_HEIGHT = 2700;

export function drawImageCover(
  ctx: CanvasRenderingContext2D,
  img: Image,
  canvasWidth: number,
  canvasHeight: number,
): void {
  const scale = Math.max(canvasWidth / img.width, canvasHeight / img.height);
  const x = (canvasWidth - img.width * scale) / 2;
  const y = (canvasHeight - img.height * scale) / 2;
  ctx.drawImage(img, x, y, img.width * scale, img.height * scale);
}
