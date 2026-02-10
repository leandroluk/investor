import {type WithdrawalEntity} from './entities';

export abstract class WithdrawalRepository {
  abstract create(entity: WithdrawalEntity): Promise<void>;
}
