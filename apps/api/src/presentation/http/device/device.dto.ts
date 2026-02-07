import {RegisterDeviceCommand} from '#/application/device/command';
import {DeviceEntity} from '#/domain/account/entity';
import {ApiProperty, PickType} from '@nestjs/swagger';

// #region RegisterDevice
export class RegisterDeviceBodyDTO extends PickType(RegisterDeviceCommand, ['platform', 'brand', 'model', 'name']) {}
// #endregion

// #region ListActiveDevice
export class ListActiveDeviceResultItemDTO extends DeviceEntity {}
export class ListActiveDeviceResultDTO {
  @ApiProperty({description: 'List of active devices', type: ListActiveDeviceResultItemDTO, isArray: true})
  items!: ListActiveDeviceResultItemDTO[];
}
// #endregion
