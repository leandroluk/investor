import {Command} from '#/application/_shared/bus';
import {ApiPropertyOf} from '#/application/_shared/decorator';
import {MailerPort, TemplatePort} from '#/domain/_shared/port';
import {ChallengeEntity, UserEntity} from '#/domain/account/entity';
import {ChallengeStatusEnum, UserStatusEnum} from '#/domain/account/enum';
import {UserNotFoundError} from '#/domain/account/error';
import {ChallengeRepository, UserRepository} from '#/domain/account/repository';
import {CommandHandler, ICommandHandler} from '@nestjs/cqrs';
import crypto from 'node:crypto';
import uuid from 'uuid';
import z from 'zod';

const commandSchema = z.object({
  email: z.email(),
});

type CommandSchema = z.infer<typeof commandSchema>;

export class Send2FAEmailCommand extends Command<CommandSchema> {
  @ApiPropertyOf(UserEntity, 'email')
  readonly email!: string;

  constructor(payload: Send2FAEmailCommand) {
    super(payload, commandSchema);
  }
}

@CommandHandler(Send2FAEmailCommand)
export class Send2FACommandHandler implements ICommandHandler<Send2FAEmailCommand, void> {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly challengeRepository: ChallengeRepository,
    private readonly mailerPort: MailerPort,
    private readonly templatePort: TemplatePort
  ) {}

  private async getUserByEmail(email: string): Promise<UserEntity> {
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw new UserNotFoundError();
    }
    if (user.status !== UserStatusEnum.ACTIVE) {
      throw new UserNotFoundError();
    }
    return user;
  }

  private async createChallenge(user: UserEntity): Promise<string> {
    const code = crypto.randomInt(100000, 999999).toString();
    const challenge = new ChallengeEntity();
    challenge.id = uuid.v7();
    challenge.userId = user.id;
    challenge.type = '2FA';
    challenge.code = code;
    challenge.status = ChallengeStatusEnum.PENDING;
    challenge.expiresAt = new Date(Date.now() + 1000 * 60 * 15); // 15 min
    challenge.createdAt = new Date();
    challenge.updatedAt = new Date();

    await this.challengeRepository.create(challenge);
    return code;
  }

  private async renderTemplate(otp: string): Promise<{html: string; text: string}> {
    const [html, text] = await Promise.all([
      this.templatePort.render('2fa.html', {otp}),
      this.templatePort.render('2fa.text', {otp}),
    ]);
    return {html, text};
  }

  async execute(command: Send2FAEmailCommand): Promise<void> {
    const user = await this.getUserByEmail(command.email);
    const otp = await this.createChallenge(user);
    const {html, text} = await this.renderTemplate(otp);
    await this.mailerPort.send({to: [user.email], subject: '2FA Challenge', text, html});
  }
}
