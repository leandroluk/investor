import {DomainEvent} from '#/domain/_shared/events';
import {type DocumentEntity, type KycEntity, type UserEntity, type WalletEntity} from './entities';
import {type LoginStrategyEnum} from './enums';

// #region User
export class UserRegisteredEvent extends DomainEvent<{
  userId: UserEntity['id'];
  userEmail: UserEntity['email'];
  userRole: UserEntity['role'];
}> {}

export class UserActivatedEvent extends DomainEvent<{
  userId: UserEntity['id'];
}> {}

export class UserPasswordChangedEvent extends DomainEvent<{
  userId: UserEntity['id'];
}> {}

export class UserLoggedInEvent extends DomainEvent<{
  userId: UserEntity['id'];
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
}> {}
// #endregion

// #region Document
export class DocumentUploadedEvent extends DomainEvent<{
  documentId: DocumentEntity['id'];
  documentUserId: DocumentEntity['userId'];
}> {}
export class DocumentReviewedEvent extends DomainEvent<{
  documentId: DocumentEntity['id'];
  documentStatus: DocumentEntity['status'];
  documentRejectReason: DocumentEntity['rejectReason'];
  documentUserId: DocumentEntity['userId'];
}> {}
// #endregion
