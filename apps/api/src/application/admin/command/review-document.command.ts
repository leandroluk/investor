import {Command} from '#/application/_shared/bus';
import {createClass} from '#/domain/_shared/factories';
import {BrokerPort} from '#/domain/_shared/ports';
import {DocumentEntity, UserEntity} from '#/domain/account/entities';
import {DocumentStatusEnum, DocumentTypeEnum, KycStatusEnum} from '#/domain/account/enums';
import {DocumentNotFoundError, DocumentStatusError} from '#/domain/account/errors';
import {DocumentReviewedEvent, UserKycStatusChangedEvent} from '#/domain/account/events';
import {DocumentRepository, UserRepository} from '#/domain/account/repositories';
import {CommandHandler, ICommandHandler} from '@nestjs/cqrs';
import z from 'zod';

export class ReviewDocumentCommand extends createClass(
  Command,
  z.object({
    adminId: z.uuid().meta({description: 'Admin ID', example: '123e4567-e89b-12d3-a456-426614174000'}),
    documentId: DocumentEntity.schema.shape.id,
    status: DocumentEntity.schema.shape.status,
    rejectReason: DocumentEntity.schema.shape.rejectReason,
  })
) {}

@CommandHandler(ReviewDocumentCommand)
export class ReviewDocumentHandler implements ICommandHandler<ReviewDocumentCommand, void> {
  constructor(
    private readonly documentRepository: DocumentRepository,
    private readonly userRepository: UserRepository,
    private readonly brokerPort: BrokerPort
  ) {}

  private async getDocumentById(documentId: DocumentEntity['id']): Promise<DocumentEntity> {
    const document = await this.documentRepository.findById(documentId);
    if (!document) {
      throw new DocumentNotFoundError();
    }
    return document;
  }

  private async updateDocumentStatus(
    document: DocumentEntity,
    status: DocumentStatusEnum,
    rejectReason: string | null
  ): Promise<void> {
    document.status = status;
    document.rejectReason = rejectReason;
    document.updatedAt = new Date();
    await this.documentRepository.update(document);
  }

  private async publishDocumentReviewedEvent(
    correlationId: string,
    occurredAt: Date,
    document: DocumentEntity
  ): Promise<void> {
    await this.brokerPort.publish(
      new DocumentReviewedEvent(correlationId, occurredAt, {
        documentId: document.id,
        documentStatus: document.status,
        documentRejectReason: document.rejectReason,
        documentUserId: document.userId,
      })
    );
  }

  private async getDocumentListByUserId(userId: UserEntity['id']): Promise<DocumentEntity[]> {
    return await this.documentRepository.findByUserId(userId);
  }

  private consolidateDocumentStatus(
    documentList: DocumentEntity[]
  ): [generalStatus: boolean, approvalMap: Partial<Record<DocumentStatusEnum, boolean>>] {
    const approvalMap: Partial<Record<DocumentStatusEnum, boolean>> = {};
    let generalStatus = true;
    for (const {type, status} of documentList) {
      approvalMap[type] = status === DocumentStatusEnum.APPROVED;
      generalStatus = generalStatus && status === DocumentStatusEnum.APPROVED;
    }
    return [generalStatus, approvalMap];
  }

  private async approveUserKycStatus(userId: DocumentEntity['userId']): Promise<UserEntity | undefined> {
    const user = await this.userRepository.findById(userId);
    if (user && user.kycStatus !== KycStatusEnum.APPROVED) {
      user.kycStatus = KycStatusEnum.APPROVED;
      user.kycVerifiedAt = new Date();
      user.updatedAt = new Date();
      await this.userRepository.update(user);
      return user;
    }
  }

  private async publishUserKycStatusChangedEvent(
    correlationId: string,
    occurredAt: Date,
    user: UserEntity
  ): Promise<void> {
    await this.brokerPort.publish(
      new UserKycStatusChangedEvent(correlationId, occurredAt, {
        userId: user.id,
        userKycStatus: user.kycStatus,
        userKycVerifiedAt: user.kycVerifiedAt,
      })
    );
  }

  async execute(command: ReviewDocumentCommand): Promise<void> {
    const document = await this.getDocumentById(command.documentId);

    if (command.status === DocumentStatusEnum.REJECTED && !command.rejectReason) {
      throw new DocumentStatusError();
    }

    await this.updateDocumentStatus(document, command.status, command.rejectReason);

    await this.publishDocumentReviewedEvent(command.correlationId, command.occurredAt, document);

    if (command.status === DocumentStatusEnum.APPROVED) {
      const documentList = await this.getDocumentListByUserId(document.userId);
      const [generalStatus, approvalMap] = this.consolidateDocumentStatus(documentList);

      if (generalStatus) {
        const selfieApproved = approvalMap[DocumentTypeEnum.SELFIE];
        const rgApproved = approvalMap[DocumentTypeEnum.RG_FRONT] && approvalMap[DocumentTypeEnum.RG_BACK];
        const cnhApproved = approvalMap[DocumentTypeEnum.CNH_FRONT] && approvalMap[DocumentTypeEnum.CNH_BACK];

        if (selfieApproved && (rgApproved || cnhApproved)) {
          const user = await this.approveUserKycStatus(document.userId);

          if (user) {
            await this.publishUserKycStatusChangedEvent(command.correlationId, command.occurredAt, user);
          }
        }
      }
    }
  }
}
