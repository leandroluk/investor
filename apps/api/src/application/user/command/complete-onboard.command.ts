import {Command} from '#/application/_shared/bus';
import {createClass} from '#/domain/_shared/factories';
import {UserEntity} from '#/domain/account/entities';
import {UserNotFoundError} from '#/domain/account/errors';
import {UserRepository} from '#/domain/account/repositories';
import {CommandHandler, ICommandHandler} from '@nestjs/cqrs';
import z from 'zod';

export class CompleteOnboardCommand extends createClass(
  Command,
  z.object({
    userId: UserEntity.schema.shape.id,
  })
) {}

@CommandHandler(CompleteOnboardCommand)
export class CompleteOnboardHandler implements ICommandHandler<CompleteOnboardCommand> {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(command: CompleteOnboardCommand): Promise<void> {
    const user = await this.userRepository.findById(command.userId);
    if (!user) {
      throw new UserNotFoundError();
    }

    if (user.isOnboardCompleted) {
      return;
    }

    user.isOnboardCompleted = true;
    user.updatedAt = new Date();
    await this.userRepository.update(user);
  }
}
