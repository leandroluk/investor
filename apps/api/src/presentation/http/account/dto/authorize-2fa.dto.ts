import {Authorize2FACommand, Authorize2FACommandResult} from '#/application/account/command';
import {PickType} from '@nestjs/swagger';

export class Authorize2FABodyDTO extends PickType(Authorize2FACommand, ['email', 'otp']) {}

export class Authorize2FAResultDTO extends Authorize2FACommandResult {}
