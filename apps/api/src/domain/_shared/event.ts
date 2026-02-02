import {v7 as uuidv7} from 'uuid';

export class DomainEvent<TPayload extends Record<string, any>> {
  readonly name = this.constructor.name;
  readonly correlationId = uuidv7();
  readonly occurredAt = new Date();
  readonly payload: TPayload = {} as TPayload;
}
