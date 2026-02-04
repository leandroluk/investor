import {Command} from '#/application/_shared/bus';
import {ApiPropertyOf} from '#/application/_shared/decorator';
import {DeviceEntity} from '#/domain/account/entity';
import {DeviceNotFoundError, DeviceNotOwnedError} from '#/domain/account/error';
import {DeviceRepository} from '#/domain/account/repository';
import {DeviceStore} from '#/domain/account/store';
import {CommandHandler, ICommandHandler} from '@nestjs/cqrs';
import z from 'zod';

const commandSchema = z.object({
  id: z.uuid(),
  userId: z.uuid(),
});

type CommandSchema = z.infer<typeof commandSchema>;

export class RevokeDeviceCommand extends Command<CommandSchema> {
  @ApiPropertyOf(DeviceEntity, 'id')
  readonly id!: string;

  @ApiPropertyOf(DeviceEntity, 'userId')
  readonly userId!: string;

  constructor(payload: RevokeDeviceCommand) {
    super(payload, commandSchema);
  }
}

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
