import {ApiPropertyOf} from '#/application/_shared/decorator';
import {ResetPasswordCommand} from '#/application/account/command';

export class ResetPasswordBodyDTO {
  @ApiPropertyOf(ResetPasswordCommand, 'email')
  email!: string;

  @ApiPropertyOf(ResetPasswordCommand, 'otp')
  otp!: string;

  @ApiPropertyOf(ResetPasswordCommand, 'password')
  password!: string;
}
