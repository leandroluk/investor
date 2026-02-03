import {ApiPropertyOf} from '#/application/_shared/decorator/api-property-of.decorator';
import {UserEntity} from '#/domain/account/entity';

export class RequestPasswordResetBodyDTO {
  @ApiPropertyOf(UserEntity, 'email')
  readonly email!: string;
}
