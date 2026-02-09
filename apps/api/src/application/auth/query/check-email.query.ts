import {Query} from '#/application/_shared/bus';
import {createClass} from '#/domain/_shared/factories';
import {UserEmailInUseError} from '#/domain/account/errors';
import {UserRepository} from '#/domain/account/repositories';
import {IQueryHandler, QueryHandler} from '@nestjs/cqrs';
import z from 'zod';

export class CheckEmailQuery extends createClass(
  Query,
  z.object({
    email: z.email().meta({
      description: 'Email to check',
    }),
  })
) {}

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
