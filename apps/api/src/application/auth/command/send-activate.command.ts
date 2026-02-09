import {Command} from '#/application/_shared/bus';
import {createClass} from '#/domain/_shared/factories';
import {MailerPort, TemplatePort} from '#/domain/_shared/ports';
import {UserEntity} from '#/domain/account/entities';
import {UserStatusEnum} from '#/domain/account/enums';
import {UserNotFoundError, UserStatusError} from '#/domain/account/errors';
import {UserRepository} from '#/domain/account/repositories';
import {OtpStore} from '#/domain/account/stores';
import {CommandHandler, ICommandHandler} from '@nestjs/cqrs';
import path from 'node:path';
import {AuthConfig} from '../auth.config';

export class SendActivateCommand extends createClass(
  Command,
  UserEntity.schema.pick({
    email: true,
  })
) {}

@CommandHandler(SendActivateCommand)
export class SendActivateHandler implements ICommandHandler<SendActivateCommand> {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly otpStore: OtpStore,
    private readonly authConfig: AuthConfig,
    private readonly templatePort: TemplatePort,
    private readonly mailerPort: MailerPort
  ) {}

  private async checkUserEmail(email: string): Promise<void> {
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw new UserNotFoundError();
    }
    if (user.status === UserStatusEnum.ACTIVE) {
      throw new UserStatusError('User is already active');
    }
  }

  private async renderTemplate(otp: string): Promise<{html: string; text: string}> {
    const url = path.posix.join(this.authConfig.webBaseUrl, this.authConfig.webActivateCallback, `?otp=${otp}`);
    const [html, text] = await Promise.all([
      this.templatePort.render('activate.html', {otp, url}),
      this.templatePort.render('activate.text', {otp, url}),
    ]);
    return {html, text};
  }

  async execute(command: SendActivateCommand): Promise<void> {
    await this.checkUserEmail(command.email);
    const otp = await this.otpStore.create(command.email);
    const {html, text} = await this.renderTemplate(otp);
    await this.mailerPort.send({to: [command.email], subject: 'Account Activation', text, html});
  }
}
