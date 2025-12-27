export interface ICommand<TResult = void> {
  readonly _brand: 'Command';
  readonly _resultType?: TResult;
}

export abstract class Command<TResult = void> implements ICommand<TResult> {
  readonly _brand = 'Command' as const;
  readonly _resultType?: TResult;
}
