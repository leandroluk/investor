import {DomainUOW} from '../../_shared/uow';
import {type AssetRepository} from './asset.repository';
import {type StrategyRepository} from './strategy.repository';

export abstract class CatalogUOW extends DomainUOW<{
  get asset(): AssetRepository;
  get strategy(): StrategyRepository;
}> {}
