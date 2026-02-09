import {Authorize2FACommand} from '#/application/auth/command';
import {PickType} from '@nestjs/swagger';

export class Authorize2FABodyDTO extends PickType(Authorize2FACommand, ['challengeId', 'otp']) {}
