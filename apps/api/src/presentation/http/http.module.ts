import {Module} from '@nestjs/common';
import {CqrsModule} from '@nestjs/cqrs';
import {AdminKycController} from './admin/admin-kyc.controller';
import {AuthController} from './auth/auth.controller';
import {DeviceController} from './device/device.controller';
import {SsoController} from './sso/sso.controller';
import {SystemController} from './system/system.controller';
import {KycController} from './user/kyc.controller';
import {ProfileController} from './user/profile.controller';

@Module({
  imports: [CqrsModule],
  controllers: [
    AuthController,
    DeviceController,
    KycController,
    AdminKycController,
    ProfileController,
    SsoController,
    SystemController,
  ],
})
export class HttpModule {}
