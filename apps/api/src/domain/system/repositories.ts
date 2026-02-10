import {type ConfigEntity} from './entities';

export abstract class ConfigRepository {
  abstract create(entity: ConfigEntity): Promise<void>;
}
