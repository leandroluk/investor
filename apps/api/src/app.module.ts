import {Module} from '@nestjs/common';
import {EventEmitterModule} from '@nestjs/event-emitter';
import {AppLogger} from './app.logger';
import {ContextModule} from './context/context.module';
import {CoreModule} from './core/core.module';

@Module({
  providers: [AppLogger],
  exports: [AppLogger],
  imports: [
    // external
    EventEmitterModule.forRoot({wildcard: true}), //
    // internal
    CoreModule,
    ContextModule,
  ],
})
export class AppModule {}
