import {Module} from '@nestjs/common';
import {EventEmitterModule} from '@nestjs/event-emitter';
import {AppConfig} from './app.config';
import {AppLogger} from './app.logger';
import {ApplicationModule} from './application/application.module';
import {InfrastructureModule} from './infrastructure/infrastructure.module';
import {PresentationModule} from './presentation/presentation.module';

const providers = [AppLogger, AppConfig];

@Module({
  imports: [
    // external
    EventEmitterModule.forRoot({wildcard: true}), //
    // internal
    ApplicationModule,
    InfrastructureModule,
    PresentationModule,
  ],
  providers,
  exports: providers,
})
export class AppModule {}
