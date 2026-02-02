import {Query} from '#/application/_shared/bus';
import {EmailInUseError} from '#/domain/account/error/email-in-use.error';
import {UserRepository} from '#/domain/account/repository';
import {IQueryHandler, QueryHandler} from '@nestjs/cqrs';
import {ApiProperty} from '@nestjs/swagger';
import z from 'zod';

const querySchema = z.object({
  email: z.email(),
});

type QuerySchema = z.infer<typeof querySchema>;

export class CheckEmailQuery extends Query<QuerySchema> {
  @ApiProperty({description: 'Email to check'})
  readonly email!: string;

  constructor(payload: CheckEmailQuery) {
    super(payload, querySchema);
  }
}

@QueryHandler(CheckEmailQuery)
export class CheckEmailQueryHandler implements IQueryHandler<CheckEmailQuery, void> {
  constructor(private readonly repository: UserRepository) {}

  private async existsByEmail(email): Promise<void> {
    const exists = await this.repository.existsByEmail(email);
    if (exists) {
      throw new EmailInUseError(email);
    }
  }

  async execute(query: CheckEmailQuery): Promise<void> {
    await this.existsByEmail(query.email);
  }
}
