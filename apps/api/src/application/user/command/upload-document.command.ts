import {Command} from '#/application/_shared/bus';
import {createClass} from '#/domain/_shared/factories';
import {BrokerPort, StoragePort} from '#/domain/_shared/ports';
import {DocumentEntity, UserEntity} from '#/domain/account/entities';
import {DocumentStatusEnum, KycStatusEnum} from '#/domain/account/enums';
import {UserNotFoundError} from '#/domain/account/errors';
import {DocumentUploadedEvent} from '#/domain/account/events';
import {DocumentRepository, UserRepository} from '#/domain/account/repositories';
import {CommandHandler, ICommandHandler} from '@nestjs/cqrs';
import z from 'zod';

export class UploadDocumentCommand extends createClass(
  Command,
  z.object({
    userId: UserEntity.schema.shape.id,
    type: DocumentEntity.schema.shape.type,
    contentType: z.string().min(1).meta({
      description: 'File content type',
      example: 'image/jpeg',
    }),
    size: z.coerce.number().positive().meta({
      description: 'File size in bytes',
      example: 1024,
    }),
  })
) {}

export class UploadDocumentCommandResult extends createClass(
  z.object({
    id: DocumentEntity.schema.shape.id,
    uploadURL: z.url().meta({
      description: 'URL to upload the document',
      example: 'https://storage...',
    }),
    expiresAt: z.date().meta({
      description: 'Expiration date of the upload URL',
      example: new Date(),
    }),
  })
) {}

@CommandHandler(UploadDocumentCommand)
export class UploadDocumentHandler implements ICommandHandler<UploadDocumentCommand, UploadDocumentCommandResult> {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly documentRepository: DocumentRepository,
    private readonly storagePort: StoragePort,
    private readonly brokerPort: BrokerPort
  ) {}

  private async getUserById(userId: UserEntity['id']): Promise<UserEntity> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new UserNotFoundError();
    }
    return user;
  }

  private async createDocumentWithUploadURL(
    type: DocumentEntity['type'],
    user: UserEntity
  ): Promise<{document: DocumentEntity; uploadURL: string; expiresAt: Date}> {
    const document = DocumentEntity.new({
      userId: user.id,
      type,
      status: DocumentStatusEnum.PENDING,
      rejectReason: null,
      storageKey: '',
    });
    document.storageKey = `kyc/${user.id}/${type}-${document.id}`;
    await this.documentRepository.create(document);
    return {
      document,
      uploadURL: await this.storagePort.getSignedURL(document.storageKey, 15 * 60, 'write'),
      expiresAt: new Date(Date.now() + 15 * 60 * 1000),
    };
  }

  private async updateUserKycStatus(user: UserEntity): Promise<void> {
    if (user.kycStatus === KycStatusEnum.NONE) {
      user.kycStatus = KycStatusEnum.PENDING;
      user.updatedAt = new Date();
      await this.userRepository.update(user);
    }
  }

  private async publishDocumentUploadedEvent(
    correlationId: string,
    occurredAt: Date,
    document: DocumentEntity
  ): Promise<void> {
    await this.brokerPort.publish(
      new DocumentUploadedEvent(correlationId, occurredAt, {
        documentId: document.id,
        documentUserId: document.userId,
      })
    );
  }

  async execute(command: UploadDocumentCommand): Promise<UploadDocumentCommandResult> {
    const user = await this.getUserById(command.userId);
    const {document, uploadURL, expiresAt} = await this.createDocumentWithUploadURL(command.type, user);
    await this.updateUserKycStatus(user);
    await this.publishDocumentUploadedEvent(command.correlationId, new Date(), document);
    return UploadDocumentCommandResult.new({id: document.id, uploadURL, expiresAt});
  }
}
