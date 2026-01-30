import {Module} from '@nestjs/common';
import {AccountModule} from './account/account.module';
import {ApplicationListener} from './application.listener';
import {AuditModule} from './audit/audit.module';
import {CatalogModule} from './catalog/catalog.module';
import {PortfolioModule} from './portfolio/portfolio.module';
import {SignalModule} from './signal/signal.module';
import {SupportModule} from './support/support.module';
import {SystemModule} from './system/system.module';
import {TreasuryModule} from './treasury/treasury.module';

const modules = [
  AccountModule,
  AuditModule,
  CatalogModule,
  PortfolioModule,
  SignalModule,
  SupportModule,
  SystemModule,
  TreasuryModule,
];

@Module({
  providers: [ApplicationListener],
  imports: modules,
  exports: modules,
})
export class ApplicationModule {}
