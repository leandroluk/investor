import {LoginUsingTokenCommand} from '#/application/account/command';
import {PickType} from '@nestjs/swagger';

export class LoginUsingTokenBodyDTO extends PickType(LoginUsingTokenCommand, ['token']) {}
