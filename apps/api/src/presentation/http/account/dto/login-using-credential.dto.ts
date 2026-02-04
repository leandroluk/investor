import {LoginUsingCredentialCommand} from '#/application/account/command';
import {PickType} from '@nestjs/swagger';

export class LoginUsingCredentialBodyDTO extends PickType(LoginUsingCredentialCommand, ['email', 'password']) {}
