import {ApiPropertyOf} from '#/application/_shared/decorator/api-property-of.decorator';
import {LoginUsingTokenCommand} from '#/application/account/command';

export class LoginUsingTokenBodyDTO {
  @ApiPropertyOf(LoginUsingTokenCommand, 'token')
  token!: string;
}
