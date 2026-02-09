import {DomainError} from '#/domain/_shared/errors';

export class UnhealthyError extends DomainError {
  constructor(message = 'Unhealthy') {
    super(message, 'system.unhealthy');
  }
}
