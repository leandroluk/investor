import {type DeviceEntity} from '../entity';

export abstract class DeviceRepository {
  abstract create(device: DeviceEntity): Promise<void>;
  abstract update(device: DeviceEntity): Promise<void>;
  abstract findByFingerprint(userId: string, fingerprint: string): Promise<DeviceEntity | null>;
  abstract findById(id: string): Promise<DeviceEntity | null>;
  abstract listActiveByUserId(userId: string): Promise<DeviceEntity[]>;
  abstract listFingerprintByUserId(userId: string): Promise<Array<DeviceEntity['fingerprint']>>;
}
