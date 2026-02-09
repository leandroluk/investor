import uuid from 'uuid';

export class DomainEvent<TPayload extends Record<string, any>> {
  constructor(
    readonly correlationId = uuid.v7(),
    readonly occurredAt = new Date(),
    readonly payload: TPayload = {} as TPayload,
    readonly name: string = ''
  ) {
    this.name = name || this.constructor.name;
  }
}
