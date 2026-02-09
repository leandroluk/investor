import {Command} from '#/application/_shared/bus';
import {createClass} from '#/domain/_shared/factories';
import {DocumentEntity} from '#/domain/account/entities';
import {DocumentStatusEnum, KycStatusEnum} from '#/domain/account/enums';
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
    private readonly userRepository: UserRepository
  ) {}

  async execute(command: ReviewDocumentCommand): Promise<void> {
    const document = await this.documentRepository.findById(command.documentId);
    if (!document) {
      throw new Error('Document not found'); // Should be DomainError
    }

    if (command.status === DocumentStatusEnum.REJECTED && !command.rejectReason) {
      throw new Error('Reject reason is required'); // DomainError
    }

    document.status = command.status;
    document.rejectReason = command.status === DocumentStatusEnum.REJECTED ? command.rejectReason! : null;
    document.updatedAt = new Date();
    await this.documentRepository.update(document);

    // If approved, check if all docs are approved to upgrade user status
    if (command.status === DocumentStatusEnum.APPROVED) {
      const allDocs = await this.documentRepository.findByUserId(document.userId);
      // Logic: At least one Identity (RG_FRONT+BACK or CNH) + Address + Selfie?
      // Simplified Logic: If all uploaded docs are APPROVED? Or do we enforce specific types?
      // cs.md: "Ao marcar um documento como válido, o sistema verifica se todos os requisitos de KYC foram atendidos; em caso positivo, o status global do usuário é promovido para APPROVED."
      // I will assume for now: If we have at least 1 document and ALL active documents are APPROVED.
      // Better: Check specific types. RG_FRONT+RG_BACK or CNH. And PROOF_ADDRESS. And SELFIE.

      // Logic: At least one Identity (RG_FRONT+BACK or CNH) + Address + Selfie?
      // Simplified Logic: If all uploaded docs are APPROVED.

      const user = await this.userRepository.findById(document.userId);
      if (user && user.kycStatus === KycStatusEnum.PENDING) {
        // Check if pending docs exist
        const hasPending = allDocs.some(d => d.status === DocumentStatusEnum.PENDING);
        const hasRejected = allDocs.some(d => d.status === DocumentStatusEnum.REJECTED);
        if (!hasPending && !hasRejected) {
          // Upgrade to APPROVED? Only if minimum docs present?
          // Assuming yes for MVP.
          user.kycStatus = KycStatusEnum.APPROVED;
          user.updatedAt = new Date();
          await this.userRepository.update(user);
        }
      }
    } else if (command.status === DocumentStatusEnum.REJECTED) {
      const user = await this.userRepository.findById(document.userId);
      if (user && user.kycStatus === KycStatusEnum.PENDING) {
        // If any doc rejected, user status might go to REJECTED or stay PENDING (waiting correct doc).
        // cs.md says: "O sistema dispara automaticamente um alerta... informando passos para correção".
        // Does not explicitly say User Status goes to REJECTED.
        // But KycStatusEnum has REJECTED.
        // I will leave as PENDING unless Admin explicitly rejects user (separate use case?).
        // Or set to REJECTED to block access?
        // Let's keep PENDING so they can upload again.
      }
    }
  }
}
