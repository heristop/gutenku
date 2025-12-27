import { Command } from '~/application/cqrs/ICommand';
import type { HaikuValue } from '~/shared/types';

export class CacheHaikuCommand extends Command<void> {
  constructor(
    public readonly haiku: HaikuValue,
    public readonly ttl: number,
  ) {
    super();
  }
}
