import {Command} from '#/application/_shared/bus';
import {createClass} from '#/domain/_shared/factories';
import {BrokerPort} from '#/domain/_shared/ports';
import {DocumentEntity, KycEntity, UserEntity} from '#/domain/account/entities';
import {DocumentStatusEnum, DocumentTypeEnum, KycStatusEnum} from '#/domain/account/enums';
import {DocumentNotFoundError, DocumentStatusError} from '#/domain/account/errors';
import {DocumentReviewedEvent, UserKycStatusChangedEvent} from '#/domain/account/events';
import {DocumentRepository, KycRepository} from '#/domain/account/repositories';
import {CommandHandler, ICommandHandler} from '@nestjs/cqrs';
import z from 'zod';

export class ReviewDocumentCommand extends createClass(
  Command,
  z.object({
    adminId: z.uuid().meta({
      description: 'Admin ID',
      example: '123e4567-e89b-12d3-a456-426614174000',
    }),
    documentId: DocumentEntity.schema.shape.id,
    status: DocumentEntity.schema.shape.status,
    rejectReason: DocumentEntity.schema.shape.rejectReason,
  })
) {}

@CommandHandler(ReviewDocumentCommand)
export class ReviewDocumentHandler implements ICommandHandler<ReviewDocumentCommand, void> {
  constructor(
    private readonly documentRepository: DocumentRepository,
    private readonly kycRepository: KycRepository,
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
    await this.documentRepository.update(
      Object.assign(document, {
        status: status,
        rejectReason: rejectReason,
        updatedAt: new Date(),
      })
    );
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

  private consolidateStatus(documentList: DocumentEntity[]): [boolean, Partial<Record<DocumentStatusEnum, boolean>>] {
    const approvalMap: Partial<Record<DocumentStatusEnum, boolean>> = {};
    let generalStatus = true;
    for (const {type, status} of documentList) {
      approvalMap[type] = status === DocumentStatusEnum.APPROVED;
      generalStatus = generalStatus && status === DocumentStatusEnum.APPROVED;
    }
    return [generalStatus, approvalMap];
  }

  private async approveKycStatus(userId: DocumentEntity['userId']): Promise<KycEntity | undefined> {
    const kyc = await this.kycRepository.findByUserId(userId);
    if (kyc && kyc.status !== KycStatusEnum.APPROVED) {
      kyc.status = KycStatusEnum.APPROVED;
      kyc.verifiedAt = new Date();
      await this.kycRepository.update(kyc);
      return kyc;
    }
  }

  private async publishUserKycStatusChangedEvent(
    correlationId: string,
    occurredAt: Date,
    kyc: KycEntity
  ): Promise<void> {
    await this.brokerPort.publish(
      new UserKycStatusChangedEvent(correlationId, occurredAt, {
        userId: kyc.userId,
        status: kyc.status,
        verifiedAt: kyc.verifiedAt,
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
      const [generalStatus, approvalMap] = this.consolidateStatus(documentList);

      if (generalStatus) {
        const selfieApproved = approvalMap[DocumentTypeEnum.SELFIE];
        const rgApproved = approvalMap[DocumentTypeEnum.RG_FRONT] && approvalMap[DocumentTypeEnum.RG_BACK];
        const cnhApproved = approvalMap[DocumentTypeEnum.CNH_FRONT] && approvalMap[DocumentTypeEnum.CNH_BACK];

        if (selfieApproved && (rgApproved || cnhApproved)) {
          const kyc = await this.approveKycStatus(document.userId);

          if (kyc) {
            await this.publishUserKycStatusChangedEvent(command.correlationId, command.occurredAt, kyc);
          }
        }
      }
    }
  }
}
