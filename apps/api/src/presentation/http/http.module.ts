import {Module} from '@nestjs/common';
import {CqrsModule} from '@nestjs/cqrs';
import {AuthController} from './account/auth.controller';
import {SsoController} from './account/sso.controller';
import {StatusController} from './system/status.controller';

@Module({
  imports: [CqrsModule],
  controllers: [
    AuthController, //
    SsoController,
    StatusController,
  ],
})
export class HttpModule {}
