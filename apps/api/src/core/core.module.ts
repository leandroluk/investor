import {Global, Module} from '@nestjs/common';
import {ApplicationModule} from './application/application.module';
import {InfrastructureModule} from './infrastructure/infrastructure.module';

const modules = [ApplicationModule, InfrastructureModule];

@Global()
@Module({
  imports: modules,
  exports: modules,
})
export class CoreModule {}
