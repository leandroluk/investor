import {type DeviceEntity} from '../entity';

export abstract class DeviceRepository {
  abstract findByFingerprint(userId: string, fingerprint: string): Promise<DeviceEntity | null>;
  abstract create(device: DeviceEntity): Promise<void>;
  abstract update(device: DeviceEntity): Promise<void>;
}
