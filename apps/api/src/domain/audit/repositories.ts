import {type LedgerEntity} from './entities';

export abstract class LedgerRepository {
  abstract create(entity: LedgerEntity): Promise<void>;
}
