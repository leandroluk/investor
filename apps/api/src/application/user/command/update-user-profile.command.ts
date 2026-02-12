import {Command} from '#/application/_shared/bus';
import {createClass} from '#/domain/_shared/factories';
import {AccountUOW, ProfileRepository, UserRepository} from '#/domain/account';
import {ProfileEntity, UserEntity} from '#/domain/account/entities';
import {ProfileNotFoundError, UserNotFoundError} from '#/domain/account/errors';
import {CommandHandler, ICommandHandler} from '@nestjs/cqrs';
import z from 'zod';

export class UpdateUserProfileCommand extends createClass(
  Command,
  z.object({
    userId: z.uuid(),
    changes: z.object({
      profile: ProfileEntity.schema
        .pick({
          name: true,
          phone: true,
          birthdate: true,
          language: true,
          timezone: true,
          theme: true,
          currencyDisplay: true,
          twoFactorEnabled: true,
          marketingEmail: true,
          pushNotification: true,
        })
        .optional(),
    }),
  })
) {}

@CommandHandler(UpdateUserProfileCommand)
export class UpdateUserProfileHandler implements ICommandHandler<UpdateUserProfileCommand, void> {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly profileRepository: ProfileRepository,
    private readonly accountUOW: AccountUOW
  ) {}

  private async getUserAndProfile(userId: string): Promise<{user: UserEntity; profile: ProfileEntity}> {
    const [user, profile] = await Promise.all([
      this.userRepository.findById(userId),
      this.profileRepository.findByUserId(userId),
    ]);

    if (!user) {
      throw new UserNotFoundError();
    }

    if (!profile) {
      throw new ProfileNotFoundError();
    }

    return {user, profile};
  }

  private async updateEntities(profile: ProfileEntity, changes: UpdateUserProfileCommand['changes']): Promise<void> {
    await this.accountUOW.transaction(async session => {
      const {profile: profileChanges} = changes;
      if (profileChanges) {
        await session.profile.update(Object.assign(profile, profileChanges));
      }
    });
  }

  async execute(command: UpdateUserProfileCommand): Promise<void> {
    const {profile} = await this.getUserAndProfile(command.userId);
    await this.updateEntities(profile, command.changes);
  }
}
