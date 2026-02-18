import {Command} from '#/application/_shared/bus';
import {createClass} from '#/domain/_shared/factories';
import {BrokerPort} from '#/domain/_shared/ports';
import {DocumentEntity} from '#/domain/account/entities';
import {DocumentStatusEnum} from '#/domain/account/enums';
import {DocumentNotFoundError, DocumentStatusError} from '#/domain/account/errors';
import {DocumentReviewedEvent} from '#/domain/account/events';
import {DocumentRepository} from '#/domain/account/repositories';
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

  async execute(command: ReviewDocumentCommand): Promise<void> {
    const document = await this.getDocumentById(command.documentId);

    if (command.status === DocumentStatusEnum.REJECTED && !command.rejectReason) {
      throw new DocumentStatusError();
    }

    await this.updateDocumentStatus(document, command.status, command.rejectReason);

    await this.brokerPort.publish(
      new DocumentReviewedEvent(command.correlationId, command.occurredAt, {
        documentId: document.id,
        documentStatus: document.status,
        documentRejectReason: document.rejectReason,
        documentUserId: document.userId,
      })
    );
  }
}
