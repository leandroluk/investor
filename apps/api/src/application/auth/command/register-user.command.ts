import {Command} from '#/application/_shared/bus';
import {ApiPropertyOf} from '#/application/_shared/decorator';
import {BrokerPort, HasherPort} from '#/domain/_shared/port';
import {PASSWORD_REGEX_CONSTANT} from '#/domain/account/constant';
import {UserEntity} from '#/domain/account/entity';
import {KycStatusEnum, UserStatusEnum} from '#/domain/account/enum';
import {UserEmailInUseError} from '#/domain/account/error';
import {UserRegisteredEvent} from '#/domain/account/event';
import {UserRepository} from '#/domain/account/repository';
import {CommandHandler, ICommandHandler} from '@nestjs/cqrs';
import {ApiProperty} from '@nestjs/swagger';
import uuid from 'uuid';
import z from 'zod';

const commandSchema = z.object({
  name: z.string().min(1).max(255),
  email: z.email(),
  password: z.string().min(1).max(100).regex(PASSWORD_REGEX_CONSTANT),
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
    pattern: PASSWORD_REGEX_CONSTANT.source,
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
      throw new UserEmailInUseError(email);
    }
  }

  private async createUser(email: string, name: string, password: string): Promise<UserEntity> {
    const user: UserEntity = {
      id: uuid.v7(),
      email,
      passwordHash: this.hasherPort.hash(password),
      name,
      walletAddress: null,
      walletVerifiedAt: null,
      walletSeedEncrypted: null,
      kycStatus: KycStatusEnum.NONE,
      kycVerifiedAt: null,
      status: UserStatusEnum.PENDING,
      twoFactorEnabled: false,
      language: 'en',
      timezone: 'UTC',
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
    };
    await this.userRepository.create(user);
    return user;
  }

  private async publishEvent(correlationId: string, user: UserEntity): Promise<void> {
    await this.brokerPort.publish(
      new UserRegisteredEvent(correlationId, user.createdAt, {
        userId: user.id,
        userEmail: user.email,
      })
    );
  }

  async execute({correlationId, email, name, password}: RegisterUserCommand): Promise<void> {
    await this.existsByEmail(email);
    const user = await this.createUser(email, name, password);
    await this.publishEvent(correlationId, user);
  }
}
