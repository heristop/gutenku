import type { ICommand } from './ICommand';

export interface ICommandBus {
  execute<TResult>(command: ICommand<TResult>): Promise<TResult>;
}

export const ICommandBusToken = 'ICommandBus';
