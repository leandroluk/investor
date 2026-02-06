import {Query} from '#/application/_shared/bus';
import {UserEntity} from '#/domain/account/entity';
import {UserNotFoundError} from '#/domain/account/error';
import {UserRepository} from '#/domain/account/repository';
import {IQueryHandler, QueryHandler} from '@nestjs/cqrs';
import {OmitType} from '@nestjs/swagger';
import z from 'zod';

const querySchema = z.object({
  userId: z.string().uuid(),
});

type QuerySchema = z.infer<typeof querySchema>;

export class GetUserProfileQuery extends Query<QuerySchema> {
  readonly userId!: string;

  constructor(payload: QuerySchema) {
    super(payload as any, querySchema);
  }
}

export class GetUserProfileQueryResult extends OmitType(UserEntity, ['passwordHash']) {}

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
    const {passwordHash: _, ...result} = user;
    return result;
  }
}
