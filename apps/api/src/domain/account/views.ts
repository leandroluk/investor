import {createClass} from '../_shared/factories';
import {DocumentEntity, KycEntity, ProfileEntity, UserEntity} from './entities';

export class DocumentView extends createClass(
  DocumentEntity.schema
    .pick({
      id: true,
      createdAt: true,
      updatedAt: true,
      userId: true,
      type: true,
      status: true,
      rejectReason: true,
      storageKey: true,
    })
    .extend({
      profileName: ProfileEntity.schema.shape.name,
      userEmail: UserEntity.schema.shape.email,
      kycStatus: KycEntity.schema.shape.status,
    })
) {}
