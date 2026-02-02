import {DomainUOW} from '../_shared/uow';
import {type AssetRepository} from './repository/asset.repository';
import {type StrategyRepository} from './repository/strategy.repository';

export abstract class CatalogUOW extends DomainUOW<{
  get asset(): AssetRepository;
  get strategy(): StrategyRepository;
}> {}
