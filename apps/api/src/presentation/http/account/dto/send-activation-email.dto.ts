import {ApiPropertyOf} from '#/application/_shared/decorator/api-property-of.decorator';
import {SendActivationEmailCommand} from '#/application/account/command';

export class SendActivationEmailBodyDTO {
  @ApiPropertyOf(SendActivationEmailCommand, 'email')
  email!: string;
}
