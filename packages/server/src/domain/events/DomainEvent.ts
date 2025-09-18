export interface DomainEvent<T = unknown> {
  type: string;
  payload: T;
}
