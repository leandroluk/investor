import {RegisterUserCommand} from '#/application/account/command';
import {PickType} from '@nestjs/swagger';

export class RegisterUserDTO extends PickType(RegisterUserCommand, ['email', 'name', 'password']) {}
