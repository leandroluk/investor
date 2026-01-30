import {DynamicModule, Module} from '@nestjs/common';
import {makeDynamicEnvModule} from '../_shared/factory';
import {StorageFakeModule} from './fake';
import {StorageS3CompatModule} from './s3compat';

@Module({})
export class StorageModule {
  static forRoot(): DynamicModule {
    return makeDynamicEnvModule(StorageModule, {
      envVar: 'API_STORAGE_PROVIDER',
      envSelectedProvider: 'fake',
      envProviderMap: {
        s3: StorageS3CompatModule,
        fake: StorageFakeModule,
      },
      global: true,
    });
  }
}
