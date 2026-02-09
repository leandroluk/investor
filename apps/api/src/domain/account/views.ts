import {createClass} from '../_shared/factories';
import {DocumentEntity, UserEntity} from './entities';

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
      userName: UserEntity.schema.shape.name,
      userEmail: UserEntity.schema.shape.email,
      userKycStatus: UserEntity.schema.shape.status,
    })
) {}
