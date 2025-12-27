import { inject, injectable } from 'tsyringe';
import type { ICommandHandler } from '~/application/cqrs/ICommandHandler';
import type { CacheHaikuCommand } from './CacheHaikuCommand';
import {
  type IHaikuRepository,
  IHaikuRepositoryToken,
} from '~/domain/repositories/IHaikuRepository';

@injectable()
export class CacheHaikuHandler implements ICommandHandler<
  CacheHaikuCommand,
  void
> {
  constructor(
    @inject(IHaikuRepositoryToken)
    private readonly haikuRepository: IHaikuRepository,
  ) {}

  async execute(command: CacheHaikuCommand): Promise<void> {
    await this.haikuRepository.createCacheWithTTL(command.haiku, command.ttl);
  }
}
