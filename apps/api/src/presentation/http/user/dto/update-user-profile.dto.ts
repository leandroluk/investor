import {UserEntity} from '#/domain/account/entities';
import {PickType} from '@nestjs/swagger';

export class UpdateUserProfileBodyDTO extends PickType(UserEntity, ['name', 'language', 'timezone']) {}
