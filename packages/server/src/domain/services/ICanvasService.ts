import { HaikuValue } from '../../shared/types';

export interface ICanvasService {
  useTheme(theme: string): void;
  create(haiku: HaikuValue): Promise<string>;
  read(imagePath: string): Promise<{ data: Buffer; contentType: string }>;
}

export const ICanvasServiceToken = 'ICanvasService';
