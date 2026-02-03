import {ApiPropertyOf} from '#/application/_shared/decorator';
import {RegisterDeviceCommand} from '#/application/account/command';
import {DeviceTypeEnum} from '#/domain/account/enum';

export class RegisterDeviceBodyDTO {
  @ApiPropertyOf(RegisterDeviceCommand, 'platform')
  readonly platform!: DeviceTypeEnum;

  @ApiPropertyOf(RegisterDeviceCommand, 'fingerprint')
  readonly fingerprint!: string;

  @ApiPropertyOf(RegisterDeviceCommand, 'brand')
  readonly brand!: string;

  @ApiPropertyOf(RegisterDeviceCommand, 'model')
  readonly model!: string;
}
