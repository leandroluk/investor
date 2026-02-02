import {Module} from '@nestjs/common';
import {CqrsModule} from '@nestjs/cqrs';
import {AccountController} from './account/account.controller';
import {SystemController} from './system/system.controller';

@Module({
  imports: [CqrsModule],
  controllers: [
    AccountController, //
    SystemController,
  ],
})
export class HttpModule {}
