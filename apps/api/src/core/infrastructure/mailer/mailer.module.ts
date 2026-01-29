import {DynamicModule, Module} from '@nestjs/common';
import {MailerFakeModule} from './mailer-fake/mailer-fake.module';
import {MailerSmtpModule} from './mailer-smtp/mailer-smtp.module';

@Module({})
export class MailerModule {
  static forRoot(): DynamicModule {
    const provider = process.env.API_MAILER_PROVIDER || 'smtp';

    const selectedModule = {
      smtp: MailerSmtpModule,
      fake: MailerFakeModule,
    }[provider];

    if (!selectedModule) {
      throw new TypeError(`Invalid Mailer Provider: ${provider}`);
    }

    return {
      global: true,
      module: MailerModule,
      imports: [selectedModule],
      exports: [selectedModule],
    };
  }
}
