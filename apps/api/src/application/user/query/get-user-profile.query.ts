import {Query} from '#/application/_shared/bus';
import {createClass} from '#/domain/_shared/factories';
import {UserEntity} from '#/domain/account/entities';
import {UserNotFoundError} from '#/domain/account/errors';
import {UserRepository} from '#/domain/account/repositories';
import {IQueryHandler, QueryHandler} from '@nestjs/cqrs';
import z from 'zod';

export class GetUserProfileQuery extends createClass(
  Query,
  z.object({
    userId: UserEntity.schema.shape.id,
  })
) {}

export class GetUserProfileQueryResult extends createClass(
  UserEntity.schema.pick({
    name: true,
    status: true,
    walletVerifiedAt: true,
    kycStatus: true,
    kycVerifiedAt: true,
    twoFactorEnabled: true,
    language: true,
    timezone: true,
  })
) {}

@QueryHandler(GetUserProfileQuery)
export class GetUserProfileHandler implements IQueryHandler<GetUserProfileQuery, GetUserProfileQueryResult> {
  constructor(private readonly userRepository: UserRepository) {}

  private async getUser(userId: string): Promise<UserEntity> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new UserNotFoundError();
    }
    return user;
  }

  async execute(query: GetUserProfileQuery): Promise<GetUserProfileQueryResult> {
    const user = await this.getUser(query.userId);
    return GetUserProfileQueryResult.new(user);
  }
}
