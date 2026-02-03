import {ApiPropertyOf} from '#/application/_shared/decorator';
import {Authorize2FACommand} from '#/application/account/command';
import {UserEntity} from '#/domain/account/entity';

export class Authorize2FABodyDTO {
  @ApiPropertyOf(UserEntity, 'email')
  email!: string;

  @ApiPropertyOf(Authorize2FACommand, 'otp')
  otp!: string;
}
