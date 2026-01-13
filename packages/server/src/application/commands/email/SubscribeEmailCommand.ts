import { Command } from '~/application/cqrs/ICommand';

export interface SubscribeEmailResult {
  success: boolean;
  message: string;
}

export class SubscribeEmailCommand extends Command<SubscribeEmailResult> {
  constructor(public readonly email: string) {
    super();
  }
}
