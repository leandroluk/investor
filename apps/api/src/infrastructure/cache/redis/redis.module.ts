import {CachePort} from '#/domain/_shared/port';
import {OtpStore} from '#/domain/account/store';
import {EnhancedModule} from '#/infrastructure/_shared/decorator';
import * as account from './account';
import {CacheRedisAdapter} from './redis.adapter';
import {CacheRedisConfig} from './redis.config';
import {CacheRedisLifecycle} from './redis.lifecycle';

@EnhancedModule({
  providers: Array().concat(
    CacheRedisAdapter, //
    CacheRedisConfig,
    CacheRedisLifecycle,
    Object.values(account)
  ),
  exports: [CachePort, OtpStore],
})
export class CacheRedisModule {}
