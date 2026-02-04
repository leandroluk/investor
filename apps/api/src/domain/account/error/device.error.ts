import {DomainError} from '#/domain/_shared/error';

export class DeviceNotFoundError extends DomainError {
  constructor(message = 'Device not found') {
    super(message, 'device.not_found');
  }
}

export class DeviceNotOwnedError extends DomainError {
  constructor(message = 'Device does not belong to user') {
    super(message, 'device.not_owned');
  }
}
