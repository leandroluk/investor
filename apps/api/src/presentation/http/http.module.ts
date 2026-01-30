import {Module} from '@nestjs/common';
import {CqrsModule} from '@nestjs/cqrs';
import {DomainExceptionFilter} from './_shared/filter';
import {AccountController} from './account/account.controller';
import {SystemController} from './system/system.controller';

const providers = [DomainExceptionFilter];

@Module({
  imports: [CqrsModule],
  providers,
  exports: providers,
  controllers: [
    AccountController, //
    SystemController,
  ],
})
export class HttpModule {}
