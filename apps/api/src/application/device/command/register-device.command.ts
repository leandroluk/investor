import {Command} from '#/application/_shared/bus';
import {createClass} from '#/domain/_shared/factories';
import {DeviceEntity} from '#/domain/account/entities';
import {DeviceRepository} from '#/domain/account/repositories';
import {DeviceStore} from '#/domain/account/stores';
import {CommandHandler, ICommandHandler} from '@nestjs/cqrs';

export class RegisterDeviceCommand extends createClass(
  Command,
  DeviceEntity.schema.pick({
    userId: true,
    platform: true,
    fingerprint: true,
    brand: true,
    name: true,
    model: true,
  })
) {}

@CommandHandler(RegisterDeviceCommand)
export class RegisterDeviceHandler implements ICommandHandler<RegisterDeviceCommand, void> {
  constructor(
    private readonly deviceRepository: DeviceRepository,
    private readonly deviceStore: DeviceStore
  ) {}

  async execute(command: RegisterDeviceCommand): Promise<void> {
    const existingDevice = await this.deviceRepository.findByFingerprint(command.userId, command.fingerprint);

    if (existingDevice) {
      existingDevice.isActive = true;
      existingDevice.brand = command.brand;
      existingDevice.model = command.model;
      existingDevice.name = command.name;
      existingDevice.updatedAt = new Date();
      await this.deviceRepository.update(existingDevice);
      return await this.deviceStore.save({
        userId: existingDevice.userId,
        deviceFingerprint: existingDevice.fingerprint,
      });
    }

    const newDevice = DeviceEntity.new({
      userId: command.userId,
      platform: command.platform,
      fingerprint: command.fingerprint,
      isActive: true,
      brand: command.brand,
      model: command.model,
      name: command.name,
      pushToken: null,
      metadata: null,
    });

    await this.deviceRepository.create(newDevice);
    if (newDevice.fingerprint) {
      await this.deviceStore.save({
        userId: newDevice.userId,
        deviceFingerprint: newDevice.fingerprint,
      });
    }
  }
}
