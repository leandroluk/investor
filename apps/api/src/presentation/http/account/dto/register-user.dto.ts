import {ApiPropertyOf} from '#/application/_shared/decorator';
import {RegisterUserCommand} from '#/application/account/command';

export class RegisterUserBodyDTO {
  @ApiPropertyOf(RegisterUserCommand, 'email')
  email!: string;

  @ApiPropertyOf(RegisterUserCommand, 'name')
  name!: string;

  @ApiPropertyOf(RegisterUserCommand, 'password')
  password!: string;
}
