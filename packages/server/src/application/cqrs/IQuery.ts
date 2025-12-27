export interface IQuery<TResult> {
  readonly _brand: 'Query';
  readonly _resultType?: TResult;
}

export abstract class Query<TResult> implements IQuery<TResult> {
  readonly _brand = 'Query' as const;
  readonly _resultType?: TResult;
}
