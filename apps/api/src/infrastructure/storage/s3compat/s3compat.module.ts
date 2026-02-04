import {EnhancedModule} from '#/infrastructure/_shared/decorator';
import {StorageS3CompatAdapter} from './s3compat.adapter';
import {StorageS3CompatConfig} from './s3compat.config';

const providers = [StorageS3CompatAdapter, StorageS3CompatConfig];

@EnhancedModule({providers, exports: providers})
export class StorageS3CompatModule {}
