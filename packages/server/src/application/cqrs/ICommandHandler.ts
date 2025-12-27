import type { ICommand } from './ICommand';

export interface ICommandHandler<TCommand extends ICommand<TResult>, TResult> {
  execute(command: TCommand): Promise<TResult>;
}

// Token factory for consistent handler registration
export const createCommandHandlerToken = (commandName: string): string =>
  `CommandHandler:${commandName}`;
