import {ApiPropertyOf} from '#/application/_shared/decorator';
import {LoginUsingTokenCommand} from '#/application/account/command';

export class LoginUsingTokenBodyDTO {
  @ApiPropertyOf(LoginUsingTokenCommand, 'token')
  token!: string;
}
