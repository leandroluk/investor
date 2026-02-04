import {DeviceEntity} from '#/domain/account/entity';
import {ApiProperty} from '@nestjs/swagger';

export class ListActiveDeviceResultItemDTO extends DeviceEntity {}

export class ListActiveDeviceResultDTO {
  @ApiProperty({description: 'List of active devices', type: ListActiveDeviceResultItemDTO, isArray: true})
  items!: ListActiveDeviceResultItemDTO[];
}
