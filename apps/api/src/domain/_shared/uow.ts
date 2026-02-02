export abstract class DomainUOW<TSession extends object> {
  abstract transaction<TResult = any>(handler: (session: TSession) => Promise<TResult>): Promise<TResult>;
}
