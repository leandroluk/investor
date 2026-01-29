import {DynamicModule, Module} from '@nestjs/common';
import {LoggerFakeModule} from './logger-fake/logger-fake.module';
import {LoggerWinstonModule} from './logger-winston/logger-winston.module';

@Module({})
export class LoggerModule {
  static forRoot(): DynamicModule {
    const provider = process.env.API_LOGGER_PROVIDER || 'winston';

    const selectedModule = {
      winston: LoggerWinstonModule,
      fake: LoggerFakeModule,
    }[provider];

    if (!selectedModule) {
      throw new TypeError(`Invalid Logger Provider: ${provider}`);
    }

    return {
      global: true,
      module: LoggerModule,
      imports: [selectedModule],
      exports: [selectedModule],
    };
  }
}
