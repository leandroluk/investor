import {DynamicModule, Module} from '@nestjs/common';
import {DatabaseFakeModule} from './fake';
import {DatabasePostgresModule} from './postgres';

@Module({})
export class DatabaseModule {
  static forRoot(): DynamicModule {
    const provider = process.env.API_CIPHER_PROVIDER || 'postgres';

    const selectedModule = {
      postgres: DatabasePostgresModule,
      fake: DatabaseFakeModule,
    }[provider];

    if (!selectedModule) {
      throw new TypeError(`Invalid Database Provider: ${provider}`);
    }

    return {
      global: true,
      module: DatabaseModule,
      imports: [selectedModule],
      exports: [selectedModule],
    };
  }
}
