import {ApiPropertyOf} from '#/application/_shared/decorator/api-property-of.decorator';
import {Send2FACommand} from '#/application/account/command';

export class Send2FABodyDTO {
  @ApiPropertyOf(Send2FACommand, 'email')
  email!: string;
}
