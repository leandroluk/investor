export abstract class DeviceStore {
  abstract save(userId: string, fingerprint: string): Promise<void>;
  abstract has(userId: string, fingerprint: string): Promise<boolean>;
  abstract delete(userId: string, fingerprint: string): Promise<void>;
}
