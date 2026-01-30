export abstract class UnitOfWork<TSession extends object> {
  abstract transaction<TResult = any>(handler: (session: TSession) => Promise<TResult>): Promise<TResult>;
}
