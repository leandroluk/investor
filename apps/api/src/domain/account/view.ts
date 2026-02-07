import {type DocumentStatusEnum, type DocumentTypeEnum, type KycStatusEnum} from './enum';

export class DocumentView {
  id!: string;
  createdAt!: Date;
  updatedAt!: Date;
  userId!: string;
  type!: DocumentTypeEnum;
  storageKey!: string;
  status!: DocumentStatusEnum;
  rejectReason!: string | null;
  userName!: string;
  userEmail!: string;
  userKycStatus!: KycStatusEnum;
}
