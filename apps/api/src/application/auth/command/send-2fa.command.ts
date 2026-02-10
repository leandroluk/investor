import {Command} from '#/application/_shared/bus';
import {createClass} from '#/domain/_shared/factories';
import {MailerPort, TemplatePort} from '#/domain/_shared/ports';
import {ChallengeEntity, UserEntity} from '#/domain/account/entities';
import {UserNotFoundError} from '#/domain/account/errors';
import {ChallengeRepository, UserRepository} from '#/domain/account/repositories';
import {ChallengeStore} from '#/domain/account/stores';
import {CommandHandler, ICommandHandler} from '@nestjs/cqrs';
import z from 'zod';

export class Send2FACommand extends createClass(
  Command,
  z.object({
    email: UserEntity.schema.shape.email,
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

  private async getUserByEmail(userId: UserEntity['id']): Promise<UserEntity> {
    const user = await this.userRepository.findByEmail(userId);
    if (!user) {
      throw new UserNotFoundError();
    }
    return user;
  }

  private async createChallenge(userId: ChallengeEntity['userId']): Promise<string> {
    const challenge = ChallengeEntity.new({userId});
    await this.challengeRepository.create(challenge);
    await this.challengeStore.save(challenge);
    return challenge.code;
  }

  private async renderTemplate(otp: string): Promise<{html: string; text: string}> {
    const [html, text] = await Promise.all([
      this.templatePort.render('2fa.html', {otp}),
      this.templatePort.render('2fa.text', {otp}),
    ]);
    return {html, text};
  }

  private async sendEmail(email: string, html: string, text: string): Promise<void> {
    await this.mailerPort.send({to: [email], subject: '2FA Challenge', text, html});
  }

  async execute(command: Send2FACommand): Promise<void> {
    const user = await this.getUserByEmail(command.email);
    const otp = await this.createChallenge(user.id);
    const {html, text} = await this.renderTemplate(otp);
    await this.sendEmail(user.email, html, text);
  }
}
