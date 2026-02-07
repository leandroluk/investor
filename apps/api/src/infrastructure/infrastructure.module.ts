import {Global, Module} from '@nestjs/common';
import {BlockchainModule} from './blockchain/blockchain.module';
import {BrokerModule} from './broker/broker.module';
import {CacheModule} from './cache/cache.module';
import {CipherModule} from './cipher/cipher.module';
import {CoinbaseModule} from './coinbase/coinbase.module';
import {DatabaseModule} from './database/database.module';
import {HasherModule} from './hasher/hasher.module';
import {LoggerModule} from './logger/logger.module';
import {MailerModule} from './mailer/mailer.module';
import {OidcModule} from './oidc/oidc.module';
import {StorageModule} from './storage/storage.module';
import {TemplateModule} from './template/template.module';
import {TokenModule} from './token/token.module';

const modules = [
  BlockchainModule.forRoot(),
  BrokerModule.forRoot(),
  CacheModule.forRoot(),
  CipherModule.forRoot(),
  CoinbaseModule.forRoot(),
  DatabaseModule.forRoot(),
  HasherModule.forRoot(),
  LoggerModule.forRoot(),
  MailerModule.forRoot(),
  OidcModule.forRoot(),
  StorageModule.forRoot(),
  TemplateModule.forRoot(),
  TokenModule.forRoot(),
];

@Global()
@Module({imports: modules, exports: modules})
export class InfrastructureModule {}
