import {DomainEvent} from '#/domain/_shared/events';
import {Auditable} from '../_shared/decorators';
import {type DocumentEntity, type KycEntity, type UserEntity, type WalletEntity} from './entities';
import {type LoginStrategyEnum} from './enums';

// #region User
export class UserRegisteredEvent extends DomainEvent<{
  userId: UserEntity['id'];
  userEmail: UserEntity['email'];
}> {}

export class UserActivatedEvent extends DomainEvent<{
  userId: UserEntity['id'];
}> {}

@Auditable('RESET_PASSWORD')
export class UserPasswordResetEvent extends DomainEvent<{
  userId: UserEntity['id'];
}> {}

export class UserLoggedInEvent extends DomainEvent<{
  userId: UserEntity['id'];
  deviceId: string;
  strategy: LoginStrategyEnum;
}> {}

export class UserRequestChallengeEvent extends DomainEvent<{
  userId: UserEntity['id'];
  userEmail: UserEntity['email'];
}> {}

// #endregion

// #region Kyc
export class UserKycStatusChangedEvent extends DomainEvent<{
  userId: UserEntity['id'];
  status: KycEntity['status'];
  verifiedAt: KycEntity['verifiedAt'];
}> {}
// #endregion

// #region Wallet
export class WalletCreatedEvent extends DomainEvent<{
  walletId: WalletEntity['id'];
  userId: WalletEntity['userId'];
  walletAddress: WalletEntity['address'];
  deviceId: string;
}> {}

@Auditable('LINK_WALLET')
export class WalletLinkedEvent extends DomainEvent<{
  userId: UserEntity['id'];
  deviceId: string;
  walletId: WalletEntity['id'];
  address: WalletEntity['address'];
  network: string;
}> {}

@Auditable('REVEAL_SEED')
export class WalletSeedRevealedEvent extends DomainEvent<{
  userId: UserEntity['id'];
  deviceId: string;
  walletId: WalletEntity['id'];
}> {}
// #endregion

// #region Document
export class DocumentUploadedEvent extends DomainEvent<{
  documentId: DocumentEntity['id'];
  documentUserId: DocumentEntity['userId'];
  deviceId: string;
}> {}

export class DocumentReviewedEvent extends DomainEvent<{
  documentId: DocumentEntity['id'];
  documentStatus: DocumentEntity['status'];
  documentRejectReason: DocumentEntity['rejectReason'];
  documentUserId: DocumentEntity['userId'];
}> {}

@Auditable('REVIEW_DOCUMENT_ADMIN')
export class DocumentReviewedByAdminEvent extends DomainEvent<{
  documentOwnerId: UserEntity['id'];
  documentId: DocumentEntity['id'];
  previousStatus: DocumentEntity['status'];
  newStatus: DocumentEntity['status'];
  reviewerId: UserEntity['id'];
  reviewerDeviceId: string;
  rejectReason?: DocumentEntity['rejectReason'];
}> {}
// #endregion
