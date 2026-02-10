import {type AssetEntity, type StrategyEntity} from './entities';

export abstract class AssetRepository {
  abstract create(entity: AssetEntity): Promise<void>;
}

export abstract class StrategyRepository {
  abstract create(entity: StrategyEntity): Promise<void>;
}
