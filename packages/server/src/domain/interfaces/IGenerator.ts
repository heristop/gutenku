import type { HaikuValue } from '~/shared/types';

export interface IGenerator {
  generate(): Promise<HaikuValue | null>;
}
