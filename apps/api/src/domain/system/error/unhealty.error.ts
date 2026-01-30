import {DomainError} from '#/domain/_shared/error/domain.error';

export class UnhealthyError extends DomainError {
  constructor(message = 'Unhealthy') {
    super(message, 'SYSTEM.UNHEALTHY');
  }
}
