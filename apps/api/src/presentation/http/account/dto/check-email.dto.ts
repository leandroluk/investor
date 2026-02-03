import {ApiPropertyOf} from '#/application/_shared/decorator';
import {UserEntity} from '#/domain/account/entity';

export class CheckEmailDTOParams {
  @ApiPropertyOf(UserEntity, 'email')
  email!: string;
}
