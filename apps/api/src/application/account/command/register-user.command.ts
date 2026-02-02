import {Command} from '#/application/_shared/bus';
import {ApiPropertyOf} from '#/application/_shared/decorator/api-property-of.decorator';
import {BrokerPort, HasherPort} from '#/domain/_shared/port';
import {PASSWORD_REGEX} from '#/domain/account/constant';
import {UserEntity} from '#/domain/account/entity';
import {EmailInUseError} from '#/domain/account/error';
import {UserRegisteredEvent} from '#/domain/account/event/user-registered.event';
import {UserRepository} from '#/domain/account/repository';
import {CommandHandler, ICommandHandler} from '@nestjs/cqrs';
import {ApiProperty} from '@nestjs/swagger';
import z from 'zod';

const commandSchema = z.object({
  name: z.string().min(1).max(255),
  email: z.email(),
  password: z.string().min(1).max(100).regex(PASSWORD_REGEX),
});

type CommandSchema = z.infer<typeof commandSchema>;

export class RegisterUserCommand extends Command<CommandSchema> {
  @ApiPropertyOf(UserEntity, 'email')
  readonly email!: string;

  @ApiPropertyOf(UserEntity, 'name')
  readonly name!: string;

  @ApiProperty({
    description: 'User password used to authenticate',
    minLength: 8,
    maxLength: 100,
    example: 'Test@123',
    pattern: PASSWORD_REGEX.source,
  })
  readonly password!: string;

  constructor(payload: RegisterUserCommand) {
    super(payload, commandSchema);
  }
}

@CommandHandler(RegisterUserCommand)
export class RegisterUserCommandHandler implements ICommandHandler<RegisterUserCommand> {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly brokerPort: BrokerPort,
    private readonly hasherPort: HasherPort
  ) {}

  private async existsByEmail(email: string): Promise<void> {
    const exists = await this.userRepository.existsByEmail(email);
    if (exists) {
      throw new EmailInUseError(email);
    }
  }

  private async createUser(email: string, name: string, password: string): Promise<UserEntity> {
    const passwordHash = await this.hasherPort.hash(password);
    const user = UserEntity.create({email, name, passwordHash});
    await this.userRepository.create(user);
    return user;
  }

  private async publishEvent(correlationId: string, user: UserEntity): Promise<void> {
    await this.brokerPort.publish(
      Object.assign(new UserRegisteredEvent(), {
        correlationId,
        occurredAt: user.createdAt,
        payload: {userId: user.id, userEmail: user.email},
      })
    );
  }

  async execute({correlationId, email, name, password}: RegisterUserCommand): Promise<void> {
    await this.existsByEmail(email);
    const user = await this.createUser(email, name, password);
    await this.publishEvent(correlationId, user);
  }
}
