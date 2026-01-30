import {Storage} from '#/domain/_shared/port';
import {EnhancedModule} from '#/infrastructure/_shared/decorator';
import {StorageS3CompatAdapter} from './s3compat.adapter';
import {StorageS3CompatConfig} from './s3compat.config';

@EnhancedModule({
  providers: [StorageS3CompatAdapter, StorageS3CompatConfig],
  exports: [Storage],
})
export class StorageS3CompatModule {}
