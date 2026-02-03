import {ApiPropertyOf} from '#/application/_shared/decorator/api-property-of.decorator';
import {ActivateUserCommand} from '#/application/account/command';

export class ActivateUserBodyDTO {
  @ApiPropertyOf(ActivateUserCommand, 'email')
  email!: string;

  @ApiPropertyOf(ActivateUserCommand, 'otp')
  otp!: string;
}
