import {RegisterDeviceCommand} from '#/application/device/command';
import {PickType} from '@nestjs/swagger';

export class RegisterDeviceBodyDTO extends PickType(RegisterDeviceCommand, ['platform', 'brand', 'model', 'name']) {}
