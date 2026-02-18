import {Command} from '#/application/_shared/bus';
import {createClass} from '#/domain/_shared/factories';
import {MailerPort, TemplatePort} from '#/domain/_shared/ports';
import {UserEntity} from '#/domain/account/entities';
import {UserNotFoundError} from '#/domain/account/errors';
import {UserRepository} from '#/domain/account/repositories';
import {CommandHandler, ICommandHandler} from '@nestjs/cqrs';
import path from 'node:path';
import z from 'zod';
import {UserConfig} from '../user.config';

export class SendKycApprovedCommand extends createClass(
  Command,
  z.object({
    userId: UserEntity.schema.shape.id,
  })
) {}

@CommandHandler(SendKycApprovedCommand)
export class SendKycApprovedHandler implements ICommandHandler<SendKycApprovedCommand> {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly userConfig: UserConfig,
    private readonly templatePort: TemplatePort,
    private readonly mailerPort: MailerPort
  ) {}

  private async getEmail(userId: string): Promise<UserEntity['email']> {
    const email = await this.userRepository.getEmailById(userId);
    if (!email) {
      throw new UserNotFoundError();
    }
    return email;
  }

  private async renderTemplate(): Promise<{html: string; text: string}> {
    const url = path.posix.join(this.userConfig.webBaseURL, this.userConfig.webOnboardPath);
    const [html, text] = await Promise.all([
      this.templatePort.render('kyc-approved.html', {url}),
      this.templatePort.render('kyc-approved.text', {url}),
    ]);
    return {html, text};
  }

  private async sendEmail(email: string, html: string, text: string): Promise<void> {
    await this.mailerPort.send({to: [email], subject: 'Your account has been verified!', text, html});
  }

  async execute(command: SendKycApprovedCommand): Promise<void> {
    const email = await this.getEmail(command.userId);
    const {html, text} = await this.renderTemplate();
    await this.sendEmail(email, html, text);
  }
}
