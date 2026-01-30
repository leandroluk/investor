import {DynamicModule, Module} from '@nestjs/common';
import {makeDynamicEnvModule} from '../_shared/factory';
import {MailerFakeModule} from './fake';
import {MailerSmtpModule} from './smtp';

@Module({})
export class MailerModule {
  static forRoot(): DynamicModule {
    return makeDynamicEnvModule(MailerModule, {
      envVar: 'API_MAILER_PROVIDER',
      envSelectedProvider: 'smtp',
      envProviderMap: {smtp: MailerSmtpModule, fake: MailerFakeModule},
      global: true,
    });
  }
}
