export abstract class UOW<TSession extends object = object> {
  abstract transaction<TResult = any>(handler: (session: TSession) => Promise<TResult>): Promise<TResult>;
}
