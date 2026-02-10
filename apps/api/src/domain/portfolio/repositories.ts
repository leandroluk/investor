import {type EarningEntity, type InvestmentEntity} from './entities';

export abstract class EarningRepository {
  abstract create(entity: EarningEntity): Promise<void>;
}

export abstract class InvestmentRepository {
  abstract create(entity: InvestmentEntity): Promise<void>;
}
