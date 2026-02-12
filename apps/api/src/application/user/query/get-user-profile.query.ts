import {Query} from '#/application/_shared/bus';
import {createClass} from '#/domain/_shared/factories';
import {ProfileEntity, UserEntity} from '#/domain/account/entities';
import {ProfileNotFoundError} from '#/domain/account/errors';
import {ProfileRepository} from '#/domain/account/repositories';
import {IQueryHandler, QueryHandler} from '@nestjs/cqrs';
import z from 'zod';

export class GetUserProfileQuery extends createClass(
  Query,
  z.object({
    userId: UserEntity.schema.shape.id,
  })
) {}

export class GetUserProfileQueryResult extends createClass(
  ProfileEntity.schema.omit({
    userId: true,
  })
) {}

@QueryHandler(GetUserProfileQuery)
export class GetUserProfileHandler implements IQueryHandler<GetUserProfileQuery, GetUserProfileQueryResult> {
  constructor(private readonly profileRepository: ProfileRepository) {}

  async execute(query: GetUserProfileQuery): Promise<GetUserProfileQueryResult> {
    const profile = await this.profileRepository.findByUserId(query.userId);

    if (!profile) {
      throw new ProfileNotFoundError();
    }

    return GetUserProfileQueryResult.new(profile);
  }
}
