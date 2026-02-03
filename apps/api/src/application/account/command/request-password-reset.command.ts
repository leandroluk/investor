import {Command} from '#/application/_shared/bus';
import {ApiPropertyOf} from '#/application/_shared/decorator/api-property-of.decorator';
import {MailerPort, TemplatePort} from '#/domain/_shared/port';
import {UserEntity} from '#/domain/account/entity';
import {UserRepository} from '#/domain/account/repository';
import {OtpStore} from '#/domain/account/store';
import {CommandHandler, ICommandHandler} from '@nestjs/cqrs';
import path from 'node:path';
import z from 'zod';
import {AccountConfig} from '../account.config';

const commandSchema = z.object({
  email: z.string().email(),
});

type CommandSchema = z.infer<typeof commandSchema>;

export class RequestPasswordResetCommand extends Command<CommandSchema> {
  @ApiPropertyOf(UserEntity, 'email')
  readonly email!: string;

  constructor(payload: RequestPasswordResetCommand) {
    super(payload, commandSchema);
  }
}

@CommandHandler(RequestPasswordResetCommand)
export class RequestPasswordResetHandler implements ICommandHandler<RequestPasswordResetCommand> {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly otpStore: OtpStore,
    private readonly accountConfig: AccountConfig,
    private readonly templatePort: TemplatePort,
    private readonly mailerPort: MailerPort
  ) {}

  private async checkUserExists(userEmail: string): Promise<boolean> {
    const user = await this.userRepository.findByEmail(userEmail);
    return !!user;
  }

  private async createCodeOTP(userEmail: string): Promise<string> {
    return this.otpStore.create(userEmail);
  }

  private async renderTemplate(otp: string): Promise<{html: string; text: string}> {
    const url = path.posix.join(this.accountConfig.webBaseUrl, this.accountConfig.webRecoverCallback, `?otp=${otp}`);
    const [html, text] = await Promise.all([
      this.templatePort.render('recover.html', {otp, url}),
      this.templatePort.render('recover.text', {otp, url}),
    ]);
    return {html, text};
  }

  async execute(command: RequestPasswordResetCommand): Promise<void> {
    const userExists = await this.checkUserExists(command.email);

    if (!userExists) {
      return;
    }

    const otp = await this.createCodeOTP(command.email);
    const {html, text} = await this.renderTemplate(otp);
    await this.mailerPort.send({to: [command.email], subject: 'Password Reset', text, html});
  }
}
