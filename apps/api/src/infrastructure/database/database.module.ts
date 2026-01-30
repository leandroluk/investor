import {DynamicModule, Module} from '@nestjs/common';
import {makeDynamicEnvModule} from '../_shared/factory';
import {DatabaseFakeModule} from './fake';
import {DatabasePostgresModule} from './postgres';

@Module({})
export class DatabaseModule {
  static forRoot(): DynamicModule {
    return makeDynamicEnvModule(DatabaseModule, {
      envVar: 'API_DATABASE_PROVIDER',
      envSelectedProvider: 'postgres',
      envProviderMap: {postgres: DatabasePostgresModule, fake: DatabaseFakeModule},
      global: true,
    });
  }
}
