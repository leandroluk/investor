import {RegisterDeviceCommand} from '#/application/device/command';
import {createDTO} from '../../_shared/factories';

export class RegisterDeviceBodyDTO extends createDTO(
  RegisterDeviceCommand.schema.pick({
    platform: true,
    brand: true,
    model: true,
    name: true,
  })
) {}
