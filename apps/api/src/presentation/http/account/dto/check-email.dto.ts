import {UserEntity} from '#/domain/account/entity';
import {ApiProperty, PickType} from '@nestjs/swagger';

class CheckEmailDTOParams extends PickType(UserEntity, ['email']) {}

export class CheckEmailDTO {
  @ApiProperty({type: CheckEmailDTOParams})
  params!: CheckEmailDTOParams;
}
