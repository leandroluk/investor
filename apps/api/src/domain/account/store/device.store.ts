import {type DeviceEntity} from '../entity';

export abstract class DeviceStore {
  abstract save(userId: DeviceEntity['userId'], fingerprint: DeviceEntity['fingerprint']): Promise<void>;
  abstract has(userId: DeviceEntity['userId'], fingerprint: DeviceEntity['fingerprint']): Promise<boolean>;
  abstract delete(userId: DeviceEntity['userId'], fingerprint: DeviceEntity['fingerprint']): Promise<void>;
}
