import {Command} from '#/application/_shared/bus';
import {createClass} from '#/domain/_shared/factories';
import {BrokerPort} from '#/domain/_shared/ports';
import {DocumentEntity, KycEntity, UserEntity} from '#/domain/account/entities';
import {DocumentStatusEnum, DocumentTypeEnum, KycStatusEnum} from '#/domain/account/enums';
import {UserKycStatusChangedEvent} from '#/domain/account/events';
import {DocumentRepository, KycRepository} from '#/domain/account/repositories';
import {CommandHandler, ICommandHandler} from '@nestjs/cqrs';
import z from 'zod';

export class ConsolidateKycStatusCommand extends createClass(
  Command,
  z.object({
    userId: UserEntity.schema.shape.id,
  })
) {}

@CommandHandler(ConsolidateKycStatusCommand)
export class ConsolidateKycStatusHandler implements ICommandHandler<ConsolidateKycStatusCommand> {
  constructor(
    private readonly documentRepository: DocumentRepository,
    private readonly kycRepository: KycRepository,
    private readonly brokerPort: BrokerPort
  ) {}

  private consolidateStatus(documentList: DocumentEntity[]): [boolean, Partial<Record<DocumentStatusEnum, boolean>>] {
    const approvalMap: Partial<Record<DocumentStatusEnum, boolean>> = {};
    let generalStatus = true;
    for (const {type, status} of documentList) {
      approvalMap[type] = status === DocumentStatusEnum.APPROVED;
      generalStatus = generalStatus && status === DocumentStatusEnum.APPROVED;
    }
    return [generalStatus, approvalMap];
  }

  private async approveKycStatus(userId: string): Promise<KycEntity | undefined> {
    const kyc = await this.kycRepository.findByUserId(userId);
    if (kyc && kyc.status !== KycStatusEnum.APPROVED) {
      kyc.status = KycStatusEnum.APPROVED;
      kyc.verifiedAt = new Date();
      await this.kycRepository.update(kyc);
      return kyc;
    }
  }

  async execute(command: ConsolidateKycStatusCommand): Promise<void> {
    const documentList = await this.documentRepository.findByUserId(command.userId);
    const [generalStatus, approvalMap] = this.consolidateStatus(documentList);

    if (generalStatus) {
      const selfieApproved = approvalMap[DocumentTypeEnum.SELFIE];
      const rgApproved = approvalMap[DocumentTypeEnum.RG_FRONT] && approvalMap[DocumentTypeEnum.RG_BACK];
      const cnhApproved = approvalMap[DocumentTypeEnum.CNH_FRONT] && approvalMap[DocumentTypeEnum.CNH_BACK];

      if (selfieApproved && (rgApproved || cnhApproved)) {
        const kyc = await this.approveKycStatus(command.userId);
        if (kyc) {
          await this.brokerPort.publish(
            new UserKycStatusChangedEvent(command.correlationId, command.occurredAt, {
              userId: kyc.userId,
              status: kyc.status,
              verifiedAt: kyc.verifiedAt,
            })
          );
        }
      }
    }
  }
}
