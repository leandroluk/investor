import {ApiPropertyOf} from '#/application/_shared/decorator';
import {Send2FAEmailCommand} from '#/application/account/command';

export class Send2FABodyDTO {
  @ApiPropertyOf(Send2FAEmailCommand, 'email')
  email!: string;
}
