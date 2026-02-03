import {ApiPropertyOf} from '#/application/_shared/decorator/api-property-of.decorator';
import {UserEntity} from '#/domain/account/entity';

export class CheckEmailDTOParams {
  @ApiPropertyOf(UserEntity, 'email')
  email!: string;
}
