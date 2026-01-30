import {DynamicModule, Module} from '@nestjs/common';
import {LoggerFakeModule} from './fake';
import {LoggerWinstonModule} from './winston';

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
