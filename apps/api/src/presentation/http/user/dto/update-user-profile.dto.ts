import {UserEntity} from '#/domain/account/entities';
import {createDTO} from '../../_shared/factories';

export class UpdateUserProfileBodyDTO extends createDTO(
  UserEntity.schema
    .pick({
      name: true,
      twoFactorEnabled: true,
      language: true,
      timezone: true,
    })
    .partial()
) {}
