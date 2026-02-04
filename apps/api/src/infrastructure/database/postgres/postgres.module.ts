import {EnhancedModule} from '#/infrastructure/_shared/decorator';
import * as implementationList from './account';
import {DatabasePostgresAdapter} from './postgres.adapter';
import {DatabasePostgresConfig} from './postgres.config';
import {DatabasePostgresLifecycle} from './postgres.lifecycle';

const providers = Array().concat(
  DatabasePostgresAdapter,
  DatabasePostgresConfig,
  DatabasePostgresLifecycle,
  Object.values(implementationList)
);

@EnhancedModule({providers, exports: providers})
export class DatabasePostgresModule {}
