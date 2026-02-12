import {EnhancedModule} from '#/infrastructure/_shared/decorator';
import * as databasePostgresAccount from './account';
import {DatabasePostgresAdapter} from './postgres.adapter';
import {DatabasePostgresConfig} from './postgres.config';
import {DatabasePostgresLifecycle} from './postgres.lifecycle';

const providers = [
  DatabasePostgresAdapter,
  DatabasePostgresConfig,
  DatabasePostgresLifecycle,
  ...Object.values(databasePostgresAccount),
];

@EnhancedModule({providers, exports: providers})
export class DatabasePostgresModule {}
