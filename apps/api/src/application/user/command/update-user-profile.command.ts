import {Command} from '#/application/_shared/bus';
import {createClass} from '#/domain/_shared/factories';
import {UserEntity} from '#/domain/account/entities';
import {UserNotFoundError} from '#/domain/account/errors';
import {UserRepository} from '#/domain/account/repositories';
import {CommandHandler, ICommandHandler} from '@nestjs/cqrs';
import z from 'zod';

export class UpdateUserProfileCommand extends createClass(
  Command,
  z.object({
    userId: z.uuid(),
    changes: UserEntity.schema.pick({
      name: true,
      language: true,
      timezone: true,
      twoFactorEnabled: true,
    }),
  })
) {}

export class UpdateUserProfileCommandResult extends createClass(
  UserEntity.schema.omit({
    passwordHash: true,
  })
) {}

@CommandHandler(UpdateUserProfileCommand)
export class UpdateUserProfileHandler implements ICommandHandler<
  UpdateUserProfileCommand,
  UpdateUserProfileCommandResult
> {
  constructor(private readonly userRepository: UserRepository) {}

  private async getUser(userId: string): Promise<UserEntity> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new UserNotFoundError();
    }
    return user;
  }

  private async updateUser(user: UserEntity, changes: UpdateUserProfileCommand['changes']): Promise<UserEntity> {
    Object.assign(user, changes);
    user.updatedAt = new Date();
    await this.userRepository.update(user);
    return user;
  }

  async execute(command: UpdateUserProfileCommand): Promise<UpdateUserProfileCommandResult> {
    const user = await this.getUser(command.userId);
    const updatedUser = await this.updateUser(user, command.changes);
    const {passwordHash: _, ...result} = updatedUser;
    return UpdateUserProfileCommandResult.new(result);
  }
}
