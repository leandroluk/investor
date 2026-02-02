import {Command} from '#/application/_shared/bus';
import {ApiPropertyOf} from '#/application/_shared/decorator/api-property-of.decorator';
import {MailerPort, TemplatePort} from '#/domain/_shared/port';
import {UserEntity} from '#/domain/account/entity';
import {OtpStore} from '#/domain/account/store';
import {CommandHandler, ICommandHandler} from '@nestjs/cqrs';
import z from 'zod';

const commandSchema = z.object({
  userId: z.string(),
  userEmail: z.email(),
});

type CommandSchema = z.infer<typeof commandSchema>;

export class SendActivationEmailCommand extends Command<CommandSchema> {
  @ApiPropertyOf(UserEntity, 'id')
  readonly userId!: string;

  @ApiPropertyOf(UserEntity, 'email')
  readonly userEmail!: string;

  constructor(payload: SendActivationEmailCommand) {
    super(payload, commandSchema);
  }
}

@CommandHandler(SendActivationEmailCommand)
export class SendActivationEmailHandler implements ICommandHandler<SendActivationEmailCommand> {
  constructor(
    private readonly otpStore: OtpStore,
    private readonly templatePort: TemplatePort,
    private readonly mailerPort: MailerPort
  ) {}

  private async createCodeOTP(userId: string): Promise<string> {
    return this.otpStore.create(userId);
  }

  private async renderTemplate(otp: string): Promise<{html: string; text: string}> {
    const [html, text] = await Promise.all([
      this.templatePort.render('activate.html', {otp}),
      this.templatePort.render('activate.text', {otp}),
    ]);
    return {html, text};
  }

  async execute(command: SendActivationEmailCommand): Promise<void> {
    const otp = await this.createCodeOTP(command.userId);
    const {html, text} = await this.renderTemplate(otp);
    await this.mailerPort.send({to: [command.userEmail], subject: 'Account Activation', text, html});
  }
}
