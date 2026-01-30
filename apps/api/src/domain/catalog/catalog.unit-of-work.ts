import {UnitOfWork} from '../_shared/unit-of-work';
import {type AssetRepository} from './repository/asset.repository';
import {type StrategyRepository} from './repository/strategy.repository';

export abstract class CatalogUnitOfWork extends UnitOfWork<{
  get asset(): AssetRepository;
  get strategy(): StrategyRepository;
}> {}
