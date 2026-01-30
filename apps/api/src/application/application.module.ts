import {Module} from '@nestjs/common';
import {IAMModule} from './account/iam.module';
import {ApplicationListener} from './application.listener';
import {CatalogModule} from './catalog/catalog.module';
import {PortfolioModule} from './portfolio/portfolio.module';
import {SupportModule} from './support/support.module';
import {TreasuryModule} from './treasury/treasury.module';

const modules = [CatalogModule, IAMModule, PortfolioModule, SupportModule, TreasuryModule];

@Module({
  providers: [ApplicationListener],
  imports: modules,
  exports: modules,
})
export class ApplicationModule {}
