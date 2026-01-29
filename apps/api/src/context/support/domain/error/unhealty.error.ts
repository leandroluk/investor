import {DomainError} from '#/core/domain/error/domain';

export class UnhealthyError extends DomainError {
  constructor() {
    super('Unhealthy', 'UNHEALTHY');
  }
}
