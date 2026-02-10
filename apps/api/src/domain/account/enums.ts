export enum ChallengeStatusEnum {
  PENDING = 'pending',
  COMPLETED = 'completed',
  EXPIRED = 'expired',
}

export enum DeviceTypeEnum {
  IOS = 'ios',
  ANDROID = 'android',
  WEB = 'web',
  UNKNOWN = 'unknown',
}

export enum DocumentStatusEnum {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

export enum DocumentTypeEnum {
  CNH_FRONT = 'cnh_front',
  CNH_BACK = 'cnh_back',
  RG_FRONT = 'rg_front',
  RG_BACK = 'rg_back',
  SELFIE = 'selfie',
}

export enum KycStatusEnum {
  NONE = 'none',
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

export enum SsoProviderEnum {
  GOOGLE = 'google',
  MICROSOFT = 'microsoft',
}

export enum UserStatusEnum {
  PENDING = 'pending',
  DELETED = 'deleted',
  ACTIVE = 'active',
  READY_TO_INVEST = 'ready_to_invest',
}

export enum LoginStrategyEnum {
  PASSWORD = 'password',
  TOKEN = 'token',
}
