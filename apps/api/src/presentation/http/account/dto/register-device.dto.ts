import {RegisterDeviceCommand} from '#/application/account/command';
import {PickType} from '@nestjs/swagger';

export class RegisterDeviceBodyDTO extends PickType(RegisterDeviceCommand, [
  'platform',
  'fingerprint',
  'brand',
  'model',
]) {}
