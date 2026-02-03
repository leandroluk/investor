import {Command} from '#/application/_shared/bus';
import {ApiPropertyOf} from '#/application/_shared/decorator';
import {MailerPort, TemplatePort} from '#/domain/_shared/port';
import {UserEntity} from '#/domain/account/entity';
import {UserStatusEnum} from '#/domain/account/enum';
import {UserNotFoundError, UserStatusError} from '#/domain/account/error';
import {UserRepository} from '#/domain/account/repository';
import {OtpStore} from '#/domain/account/store';
import {CommandHandler, ICommandHandler} from '@nestjs/cqrs';
import path from 'node:path';
import z from 'zod';
import {AccountConfig} from '../account.config';

const commandSchema = z.object({
  email: z.email(),
});

type CommandSchema = z.infer<typeof commandSchema>;

export class SendActivateEmailCommand extends Command<CommandSchema> {
  @ApiPropertyOf(UserEntity, 'email')
  readonly email!: string;

  constructor(payload: SendActivateEmailCommand) {
    super(payload, commandSchema);
  }
}

@CommandHandler(SendActivateEmailCommand)
export class SendActivateEmailHandler implements ICommandHandler<SendActivateEmailCommand> {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly otpStore: OtpStore,
    private readonly accountConfig: AccountConfig,
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
    const url = path.posix.join(this.accountConfig.webBaseUrl, this.accountConfig.webActivateCallback, `?otp=${otp}`);
    const [html, text] = await Promise.all([
      this.templatePort.render('activate.html', {otp, url}),
      this.templatePort.render('activate.text', {otp, url}),
    ]);
    return {html, text};
  }

  async execute(command: SendActivateEmailCommand): Promise<void> {
    await this.checkUserEmail(command.email);
    const otp = await this.otpStore.create(command.email);
    const {html, text} = await this.renderTemplate(otp);
    await this.mailerPort.send({to: [command.email], subject: 'Account Activation', text, html});
  }
}
