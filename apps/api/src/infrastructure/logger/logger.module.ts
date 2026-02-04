import {DynamicModule, Module} from '@nestjs/common';
import {makeDynamicEnvModule} from '../_shared/factory';
import {LoggerWinstonModule} from './winston';

@Module({})
export class LoggerModule {
  static forRoot(): DynamicModule {
    return makeDynamicEnvModule(LoggerModule, {
      envVar: 'API_LOGGER_PROVIDER',
      envSelectedProvider: 'winston',
      envProviderMap: {winston: LoggerWinstonModule},
      global: true,
    });
  }
}
