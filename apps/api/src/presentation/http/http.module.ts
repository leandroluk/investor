import {Module} from '@nestjs/common';
import {CqrsModule} from '@nestjs/cqrs';
import {AdminController} from './admin/admin.controller';
import {AuthController} from './auth/auth.controller';
import {DeviceController} from './device/device.controller';
import {SsoController} from './sso/sso.controller';
import {SystemController} from './system/system.controller';
import {UserController} from './user/user.controller';

@Module({
  imports: [CqrsModule],
  controllers: [
    AdminController, //
    AuthController,
    DeviceController,
    SsoController,
    SystemController,
    UserController,
  ],
})
export class HttpModule {}
