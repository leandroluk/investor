import {DomainUOW} from '../_shared/uow';
import {type AssetRepository, type StrategyRepository} from './repository';

export abstract class CatalogUOW extends DomainUOW<{
  get asset(): AssetRepository;
  get strategy(): StrategyRepository;
}> {}
