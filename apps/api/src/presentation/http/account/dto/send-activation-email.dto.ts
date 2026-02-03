import {ApiPropertyOf} from '#/application/_shared/decorator';
import {SendActivateEmailCommand} from '#/application/account/command';

export class SendActivationEmailBodyDTO {
  @ApiPropertyOf(SendActivateEmailCommand, 'email')
  email!: string;
}
