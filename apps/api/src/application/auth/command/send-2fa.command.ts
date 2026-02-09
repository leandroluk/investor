import {Command} from '#/application/_shared/bus';
import {createClass} from '#/domain/_shared/factories';
import {MailerPort, TemplatePort} from '#/domain/_shared/ports';
import {ChallengeEntity, UserEntity} from '#/domain/account/entities';
import {ChallengeStatusEnum, UserStatusEnum} from '#/domain/account/enums';
import {UserNotFoundError, UserStatusError} from '#/domain/account/errors';
import {ChallengeRepository, UserRepository} from '#/domain/account/repositories';
import {ChallengeStore} from '#/domain/account/stores';
import {CommandHandler, ICommandHandler} from '@nestjs/cqrs';
import crypto from 'node:crypto';
import uuid from 'uuid';

export class Send2FACommand extends createClass(
  Command,
  UserEntity.schema.pick({
    email: true,
  })
) {}

@CommandHandler(Send2FACommand)
export class Send2FACommandHandler implements ICommandHandler<Send2FACommand, void> {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly challengeRepository: ChallengeRepository,
    private readonly challengeStore: ChallengeStore,
    private readonly mailerPort: MailerPort,
    private readonly templatePort: TemplatePort
  ) {}

  private async getUserByEmail(email: string): Promise<UserEntity> {
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw new UserNotFoundError();
    }
    if (user.status !== UserStatusEnum.ACTIVE) {
      throw new UserStatusError();
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
    await this.challengeStore.save(challenge);
    return code;
  }

  private async renderTemplate(otp: string): Promise<{html: string; text: string}> {
    const [html, text] = await Promise.all([
      this.templatePort.render('2fa.html', {otp}),
      this.templatePort.render('2fa.text', {otp}),
    ]);
    return {html, text};
  }

  async execute(command: Send2FACommand): Promise<void> {
    const user = await this.getUserByEmail(command.email);
    const otp = await this.createChallenge(user);
    const {html, text} = await this.renderTemplate(otp);
    await this.mailerPort.send({to: [user.email], subject: '2FA Challenge', text, html});
  }
}
