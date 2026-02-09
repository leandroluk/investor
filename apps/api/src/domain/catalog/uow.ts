import {UOW} from '../_shared/classes';
import {type AssetRepository, type StrategyRepository} from './repositories';

export abstract class CatalogUOW extends UOW<{
  get asset(): AssetRepository;
  get strategy(): StrategyRepository;
}> {}
