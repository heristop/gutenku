import Canvas from 'canvas';
import type { HaikuValue } from '~/shared/types';
import { renderExLibris } from '~/shared/themes/exlibris';

const PLATE_PATH = './src/shared/assets/plates/gutenmage.png';

// Loaded once, kept for every card
let plate: Promise<Canvas.Image> | null = null;

function loadPlate(): Promise<Canvas.Image> {
  plate ??= Canvas.loadImage(PLATE_PATH).catch((error: unknown) => {
    plate = null;
    throw error;
  });

  return plate;
}

/**
 * Frontispiece: the Ex Libris page with GutenKu's reader printed as a plate
 * above the poem, the way an old book faces its title page with an engraving.
 */
export default {
  async create(haiku: HaikuValue): Promise<Canvas.Canvas> {
    return renderExLibris(haiku, { plate: await loadPlate() });
  },
};
