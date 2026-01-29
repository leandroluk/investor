import {Module} from '@nestjs/common';
import {CatalogModule} from './catalog/catalog.module';
import {IAMModule} from './iam/iam.module';
import {PortfolioModule} from './portfolio/portfolio.module';
import {SupportModule} from './support/support.module';
import {TreasuryModule} from './treasury/treasury.module';

@Module({
  imports: [CatalogModule, IAMModule, PortfolioModule, SupportModule, TreasuryModule],
})
export class ContextModule {}
