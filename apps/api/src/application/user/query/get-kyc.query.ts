import {Query} from '#/application/_shared/bus';
import {createClass} from '#/domain/_shared/factories';
import {KycEntity, UserEntity} from '#/domain/account/entities';
import {KycNotFoundError} from '#/domain/account/errors';
import {KycRepository} from '#/domain/account/repositories';
import {IQueryHandler, QueryHandler} from '@nestjs/cqrs';
import z from 'zod';

export class GetKycQuery extends createClass(
  Query,
  z.object({
    userId: UserEntity.schema.shape.id,
  })
) {}

export class GetKycQueryResult extends createClass(
  KycEntity.schema.omit({
    userId: true,
  })
) {}

@QueryHandler(GetKycQuery)
export class GetKycHandler implements IQueryHandler<GetKycQuery, GetKycQueryResult> {
  constructor(private readonly kycRepository: KycRepository) {}

  async execute(query: GetKycQuery): Promise<GetKycQueryResult> {
    const kyc = await this.kycRepository.findByUserId(query.userId);

    if (!kyc) {
      throw new KycNotFoundError();
    }

    return GetKycQueryResult.new(kyc);
  }
}
