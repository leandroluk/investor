import {Command} from '#/application/_shared/bus';
import {createClass} from '#/domain/_shared/factories';
import {DeviceEntity} from '#/domain/account/entities';
import {DeviceNotFoundError, DeviceNotOwnedError} from '#/domain/account/errors';
import {DeviceRepository} from '#/domain/account/repositories';
import {DeviceStore} from '#/domain/account/stores';
import {CommandHandler, ICommandHandler} from '@nestjs/cqrs';

export class RevokeDeviceCommand extends createClass(
  Command,
  DeviceEntity.schema.pick({
    id: true,
    userId: true,
  })
) {}

@CommandHandler(RevokeDeviceCommand)
export class RevokeDeviceHandler implements ICommandHandler<RevokeDeviceCommand, void> {
  constructor(
    private readonly deviceRepository: DeviceRepository,
    private readonly deviceStore: DeviceStore
  ) {}

  private async getDevice(id: string, userId: string): Promise<DeviceEntity> {
    const device = await this.deviceRepository.findById(id);

    if (!device) {
      throw new DeviceNotFoundError();
    }

    if (device.userId !== userId) {
      throw new DeviceNotOwnedError();
    }

    return device;
  }

  async execute(command: RevokeDeviceCommand): Promise<void> {
    const device = await this.getDevice(command.id, command.userId);

    if (!device.isActive) {
      return;
    }

    device.isActive = false;
    device.updatedAt = new Date();

    await this.deviceRepository.update(device);
    if (device.fingerprint) {
      await this.deviceStore.delete(device.userId, device.fingerprint);
    }
  }
}
