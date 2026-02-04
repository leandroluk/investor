import {Command} from '#/application/_shared/bus';
import {ApiPropertyOf} from '#/application/_shared/decorator';
import {TokenPort} from '#/domain/_shared/port';
import {UserEntity} from '#/domain/account/entity';
import {UserInvalidOtpError, UserNotFoundError} from '#/domain/account/error';
import {UserRepository} from '#/domain/account/repository';
import {OtpStore, SessionStore} from '#/domain/account/store';
import {CommandHandler, ICommandHandler} from '@nestjs/cqrs';
import {ApiProperty} from '@nestjs/swagger';
import z from 'zod';

const commandSchema = z.object({
  ip: z.string(),
  userAgent: z.string(),
  email: z.email(),
  otp: z.string().min(1),
});

type CommandSchema = z.infer<typeof commandSchema>;

export class Authorize2FACommand extends Command<CommandSchema> {
  @ApiProperty({
    description: 'IP Address',
    example: '127.0.0.1',
  })
  readonly ip!: string;

  readonly userAgent!: string;

  @ApiPropertyOf(UserEntity, 'email')
  readonly email!: string;

  @ApiProperty({
    description: '2FA Code',
    example: '123456',
  })
  readonly otp!: string;

  constructor(payload: Authorize2FACommand) {
    super(payload, commandSchema);
  }
}

export class Authorize2FACommandResult implements TokenPort.Authorization {
  @ApiProperty({example: 'Bearer', description: 'Token type'})
  tokenType!: string;

  @ApiProperty({example: 'Bearer', description: 'Access token'})
  accessToken!: string;

  @ApiProperty({example: 'Bearer', description: 'Access token'})
  expiresIn!: number;

  @ApiProperty({example: 'Bearer', description: 'Access token'})
  refreshToken!: string;
}

@CommandHandler(Authorize2FACommand)
export class Authorize2FAHandler implements ICommandHandler<Authorize2FACommand, Authorize2FACommandResult> {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly otpStore: OtpStore,
    private readonly sessionStore: SessionStore,
    private readonly tokenPort: TokenPort
  ) {}

  private async verifyOtp(otp: string): Promise<UserEntity['email']> {
    try {
      const result = await this.otpStore.verify(otp);
      return result;
    } catch {
      throw new UserInvalidOtpError();
    }
  }

  private async getUserByEmail(email: string): Promise<UserEntity> {
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw new UserNotFoundError();
    }
    return user;
  }

  private async createToken(
    ip: string,
    userAgent: string,
    user: UserEntity
  ): Promise<Required<TokenPort.Authorization>> {
    const sessionKey = await this.sessionStore.create(user.id, ip, userAgent);
    const result = await this.tokenPort.create<true>(sessionKey, user, true);
    return result;
  }

  async execute(command: Authorize2FACommand): Promise<Authorize2FACommandResult> {
    const email = await this.verifyOtp(command.otp);
    if (email !== command.email) {
      throw new UserInvalidOtpError();
    }

    const user = await this.getUserByEmail(email);

    const result = await this.createToken(command.ip, command.userAgent, user);
    return result;
  }
}
