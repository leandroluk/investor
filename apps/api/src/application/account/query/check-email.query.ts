import {Query} from '#/application/_shared/bus';
import {EmailAlreadyInUseError} from '#/domain/account/error';
import {UserRepository} from '#/domain/account/repository';
import {IQueryHandler, QueryHandler} from '@nestjs/cqrs';
import {ApiProperty} from '@nestjs/swagger';
import z from 'zod';

const checkEmailQuerySchema = z.object({
  email: z.email(),
});

type CheckEmailQuerySchema = z.infer<typeof checkEmailQuerySchema>;

export class CheckEmailQuery extends Query<CheckEmailQuerySchema> {
  @ApiProperty({description: 'Email to check'})
  readonly email!: string;

  constructor(payload: CheckEmailQuery) {
    super(payload, checkEmailQuerySchema);
  }
}

@QueryHandler(CheckEmailQuery)
export class CheckEmailQueryHandler implements IQueryHandler<CheckEmailQuery, void> {
  constructor(private readonly repository: UserRepository) {}

  async execute(query: CheckEmailQuery): Promise<void> {
    const exists = await this.repository.existsByEmail(query.email);
    if (exists) {
      throw new EmailAlreadyInUseError(query.email);
    }
  }
}
