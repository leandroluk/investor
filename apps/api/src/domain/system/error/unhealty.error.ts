import {DomainError} from '#/domain/_shared/error';

export class UnhealthyError extends DomainError {
  constructor(message = 'Unhealthy') {
    super(message, 'system.unhealthy');
  }
}
