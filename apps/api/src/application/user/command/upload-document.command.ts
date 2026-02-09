import {Command} from '#/application/_shared/bus';
import {createClass} from '#/domain/_shared/factories';
import {StoragePort} from '#/domain/_shared/ports';
import {DocumentEntity, UserEntity} from '#/domain/account/entities';
import {DocumentStatusEnum, KycStatusEnum} from '#/domain/account/enums';
import {UserNotFoundError} from '#/domain/account/errors';
import {DocumentRepository, UserRepository} from '#/domain/account/repositories';
import {CommandHandler, ICommandHandler} from '@nestjs/cqrs';
import uuid from 'uuid';
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
    size: z.number().positive().meta({
      description: 'File size in bytes',
      example: 1024,
    }),
  })
) {}

export class UploadDocumentCommandResult extends createClass(
  z.object({
    id: DocumentEntity.schema.shape.id,
    uploadUrl: z.url().meta({
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
    private readonly storagePort: StoragePort
  ) {}

  async execute(command: UploadDocumentCommand): Promise<UploadDocumentCommandResult> {
    const user = await this.userRepository.findById(command.userId);
    if (!user) {
      throw new UserNotFoundError();
    }

    const documentId = uuid.v7();
    const storageKey = `kyc/${user.id}/${documentId}`;
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);
    const uploadUrl = await this.storagePort.getSignedUrl(storageKey, 15 * 60, 'write');
    const document: DocumentEntity = {
      id: documentId,
      userId: user.id,
      type: command.type,
      status: DocumentStatusEnum.PENDING,
      storageKey: storageKey,
      rejectReason: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    if (user.kycStatus === KycStatusEnum.NONE) {
      user.kycStatus = KycStatusEnum.PENDING;
      user.updatedAt = new Date();
      await this.userRepository.update(user);
    }

    await this.documentRepository.create(document);

    return {
      id: document.id,
      uploadUrl,
      expiresAt,
    };
  }
}
