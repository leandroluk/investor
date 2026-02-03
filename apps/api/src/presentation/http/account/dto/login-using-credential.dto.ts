import {ApiPropertyOf} from '#/application/_shared/decorator';
import {LoginUsingCredentialCommand} from '#/application/account/command';

export class LoginUsingCredentialBodyDTO {
  @ApiPropertyOf(LoginUsingCredentialCommand, 'email')
  email!: string;

  @ApiPropertyOf(LoginUsingCredentialCommand, 'password')
  password!: string;
}
