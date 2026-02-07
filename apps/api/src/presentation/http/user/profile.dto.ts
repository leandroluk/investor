import {GetUserProfileQueryResult} from '#/application/user/query';
import {UserEntity} from '#/domain/account/entity';
import {PickType} from '@nestjs/swagger';

// #region GetUserProfile
export class GetUserProfileResultDTO extends GetUserProfileQueryResult {}
// #endregion

// #region UpdateUserProfile
export class UpdateUserProfileBodyDTO extends PickType(UserEntity, ['name', 'language', 'timezone']) {}
// #endregion
