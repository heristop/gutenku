import type Canvas from 'canvas';
import type { CanvasRenderingContext2D } from 'canvas';

interface PlateRoom {
  left: number;
  width: number;
  headerBaseline: number;
  /** The highest the poem block may start and still fit above the colophon */
  lowest: number;
  colophonBaseline: number;
  h: number;
  u: number;
}

/**
 * The illustration printed into the paper: contained in its box, multiplied
 * so its white ground sinks into the laid sheet and only the ink remains.
 */
function drawPlate(
  ctx: CanvasRenderingContext2D,
  image: Canvas.Image,
  box: { left: number; top: number; width: number; height: number },
): void {
  const scale = Math.min(box.width / image.width, box.height / image.height);
  const width = image.width * scale;
  const height = image.height * scale;

  ctx.save();
  ctx.globalCompositeOperation = 'multiply';
  ctx.globalAlpha = 0.92;
  ctx.drawImage(
    image,
    box.left + (box.width - width) / 2,
    box.top + (box.height - height) / 2,
    width,
    height,
  );
  ctx.restore();
}

/**
 * Prints the plate at the head of the page when the poem leaves it room, and
 * says where the poem may then sit: below the plate, centred a little high
 * in what is left, as the text block under a plate does. Null when long
 * verses need the room and the plate steps aside.
 */
export function placePlate(
  ctx: CanvasRenderingContext2D,
  image: Canvas.Image,
  room: PlateRoom,
): { highest: number; opticalCentre: number } | null {
  const { u, h } = room;
  const top = room.headerBaseline + 36 * u;
  const gap = 44 * u;
  const height = Math.min(h * 0.34, room.lowest - top - gap);

  if (height < h * 0.16) {
    return null;
  }

  drawPlate(ctx, image, { left: room.left, top, width: room.width, height });

  const highest = top + height + gap;

  return {
    highest,
    opticalCentre: highest + (room.colophonBaseline - highest) * 0.42,
  };
}
