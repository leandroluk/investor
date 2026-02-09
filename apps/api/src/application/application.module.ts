import {Module} from '@nestjs/common';
import {AdminModule} from './admin/admin.module';
import {ApplicationListener} from './application.listener';
import {AuthModule} from './auth/auth.module';
import {DeviceModule} from './device/device.module';
import {SsoModule} from './sso/sso.module';
import {SystemModule} from './system/system.module';
import {UserModule} from './user/user.module';

const modules = [AdminModule, AuthModule, DeviceModule, SsoModule, SystemModule, UserModule];

@Module({
  providers: [ApplicationListener],
  imports: modules,
  exports: modules,
})
export class ApplicationModule {}
