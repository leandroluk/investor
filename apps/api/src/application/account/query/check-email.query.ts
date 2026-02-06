import {Query} from '#/application/_shared/bus';
import {UserEmailInUseError} from '#/domain/account/error';
import {UserRepository} from '#/domain/account/repository';
import {IQueryHandler, QueryHandler} from '@nestjs/cqrs';
import {ApiProperty} from '@nestjs/swagger';
import z from 'zod';

const querySchema = z.object({
  email: z.email(),
});

type QuerySchema = z.infer<typeof querySchema>;

export class CheckEmailQuery extends Query<QuerySchema> {
  @ApiProperty({
    description: 'Email to check',
  })
  readonly email!: string;

  constructor(payload: CheckEmailQuery) {
    super(payload, querySchema);
  }
}

@QueryHandler(CheckEmailQuery)
export class CheckEmailQueryHandler implements IQueryHandler<CheckEmailQuery, void> {
  constructor(private readonly userRepository: UserRepository) {}

  private async existsByEmail(email): Promise<void> {
    const exists = await this.userRepository.existsByEmail(email);
    if (exists) {
      throw new UserEmailInUseError(email);
    }
  }

  async execute(query: CheckEmailQuery): Promise<void> {
    await this.existsByEmail(query.email);
  }
}
