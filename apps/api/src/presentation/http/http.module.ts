import {Module} from '@nestjs/common';
import {CqrsModule} from '@nestjs/cqrs';
import {AuthController} from './account/auth.controller';
import {DeviceController} from './account/device.controller';
import {SsoController} from './account/sso.controller';
import {SystemController} from './system/system.controller';

@Module({
  imports: [CqrsModule],
  controllers: [
    AuthController, //
    DeviceController,
    SsoController,
    SystemController,
  ],
})
export class HttpModule {}
