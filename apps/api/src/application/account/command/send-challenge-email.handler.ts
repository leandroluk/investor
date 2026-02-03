import {Command} from '#/application/_shared/bus';
import {MailerPort, TemplatePort} from '#/domain/_shared/port';
import {CommandHandler, ICommandHandler} from '@nestjs/cqrs';
import {ApiProperty} from '@nestjs/swagger';
import z from 'zod';

const commandSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  email: z.string().email(),
  otp: z.string(),
});

type CommandSchema = z.infer<typeof commandSchema>;

export class SendChallengeEmailCommand extends Command<CommandSchema> {
  @ApiProperty()
  readonly id!: string;

  @ApiProperty()
  readonly userId!: string;

  @ApiProperty()
  readonly email!: string;

  @ApiProperty()
  readonly otp!: string;

  constructor(payload: SendChallengeEmailCommand) {
    super(payload, commandSchema);
  }
}

@CommandHandler(SendChallengeEmailCommand)
export class SendChallengeEmailHandler implements ICommandHandler<SendChallengeEmailCommand, void> {
  constructor(
    private readonly mailerPort: MailerPort,
    private readonly templatePort: TemplatePort
  ) {}

  async execute(command: SendChallengeEmailCommand): Promise<void> {
    const [html, text] = await Promise.all([
      this.templatePort.render('2fa.html', {otp: command.otp}),
      this.templatePort.render('2fa.text', {otp: command.otp}),
    ]);
    await this.mailerPort.send({to: [command.email], subject: '2FA Challenge', text, html});
  }
}
