import {Command} from '#/application/_shared/bus';
import {StoragePort} from '#/domain/_shared/port';
import {DocumentEntity} from '#/domain/account/entity';
import {DocumentStatusEnum, DocumentTypeEnum, KycStatusEnum} from '#/domain/account/enum';
import {UserNotFoundError} from '#/domain/account/error';
import {DocumentRepository, UserRepository} from '#/domain/account/repository';
import {CommandHandler, ICommandHandler} from '@nestjs/cqrs';
import uuid from 'uuid';
import z from 'zod';

const commandSchema = z.object({
  userId: z.uuid(),
  type: z.enum(DocumentTypeEnum),
  contentType: z.string().min(1),
  size: z.number().positive(),
});

type CommandSchema = z.infer<typeof commandSchema>;

export class UploadDocumentCommand extends Command<CommandSchema> {
  readonly userId!: string;
  readonly type!: DocumentTypeEnum;
  readonly contentType!: string;
  readonly size!: number;

  constructor(payload: CommandSchema) {
    super(payload as any, commandSchema);
  }
}

export class UploadDocumentCommandResult {
  readonly id!: string;
  readonly uploadUrl!: string;
  readonly expiresAt!: Date;
}

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
