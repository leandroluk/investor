import {Command} from '#/application/_shared/bus';
import {ApiPropertyOf} from '#/application/_shared/decorator';
import {UserEntity} from '#/domain/account/entity';
import {UserNotFoundError} from '#/domain/account/error';
import {UserRepository} from '#/domain/account/repository';
import {CommandHandler, ICommandHandler} from '@nestjs/cqrs';
import {OmitType} from '@nestjs/swagger';
import z from 'zod';

const commandSchema = z.object({
  userId: z.string().uuid(),
  name: z.string().min(1).max(100).optional(),
  language: z.string().length(2).optional(),
  timezone: z
    .string()
    .refine(value => {
      try {
        Intl.DateTimeFormat(undefined, {timeZone: value});
        return true;
      } catch {
        return false;
      }
    })
    .optional(),
});

type CommandSchema = z.infer<typeof commandSchema>;

export class UpdateUserProfileCommand extends Command<CommandSchema> {
  @ApiPropertyOf(UserEntity, 'id')
  readonly userId!: string;

  @ApiPropertyOf(UserEntity, 'name')
  readonly name?: string;

  @ApiPropertyOf(UserEntity, 'language')
  readonly language?: string;

  @ApiPropertyOf(UserEntity, 'timezone')
  readonly timezone?: string;

  constructor(payload: UpdateUserProfileCommand) {
    super(payload, commandSchema);
  }
}

export class UpdateUserProfileCommandResult extends OmitType(UserEntity, ['passwordHash']) {}

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

  private async updateUser(user: UserEntity, command: UpdateUserProfileCommand): Promise<UserEntity> {
    if (command.name) {
      user.name = command.name;
    }
    if (command.language) {
      user.language = command.language;
    }
    if (command.timezone) {
      user.timezone = command.timezone;
    }

    user.updatedAt = new Date();
    await this.userRepository.update(user);
    return user;
  }

  async execute(command: UpdateUserProfileCommand): Promise<UpdateUserProfileCommandResult> {
    const user = await this.getUser(command.userId);
    const updatedUser = await this.updateUser(user, command);
    const {passwordHash: _, ...result} = updatedUser;
    return result;
  }
}
