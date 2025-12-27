import { injectable, container } from 'tsyringe';
import type { ICommandBus } from './ICommandBus';
import type { ICommand } from './ICommand';
import {
  type ICommandHandler,
  createCommandHandlerToken,
} from './ICommandHandler';

@injectable()
export class CommandBus implements ICommandBus {
  async execute<TResult>(command: ICommand<TResult>): Promise<TResult> {
    const commandName = command.constructor.name;
    const handlerToken = createCommandHandlerToken(commandName);

    const handler =
      container.resolve<ICommandHandler<ICommand<TResult>, TResult>>(
        handlerToken,
      );

    return handler.execute(command);
  }
}
