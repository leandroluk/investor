import {Command} from '#/application/_shared/bus';
import {ApiPropertyOf} from '#/application/_shared/decorator';
import {DeviceEntity} from '#/domain/account/entity';
import {DeviceTypeEnum} from '#/domain/account/enum';
import {DeviceRepository} from '#/domain/account/repository';
import {DeviceStore} from '#/domain/account/store';
import {CommandHandler, ICommandHandler} from '@nestjs/cqrs';
import uuid from 'uuid';
import z from 'zod';

const commandSchema = z.object({
  userId: z.uuid(),
  platform: z.enum(DeviceTypeEnum),
  fingerprint: z.string().min(1),
  brand: z.string().min(1),
  name: z.string().min(1),
  model: z.string().min(1),
});

type CommandSchema = z.infer<typeof commandSchema>;

export class RegisterDeviceCommand extends Command<CommandSchema> {
  @ApiPropertyOf(DeviceEntity, 'userId')
  readonly userId!: string;

  @ApiPropertyOf(DeviceEntity, 'platform')
  readonly platform!: DeviceTypeEnum;

  @ApiPropertyOf(DeviceEntity, 'fingerprint')
  readonly fingerprint!: string;

  @ApiPropertyOf(DeviceEntity, 'brand')
  readonly brand!: string;

  @ApiPropertyOf(DeviceEntity, 'name')
  readonly name!: string;

  @ApiPropertyOf(DeviceEntity, 'model')
  readonly model!: string;

  constructor(payload: RegisterDeviceCommand) {
    super(payload, commandSchema);
  }
}

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
      await this.deviceStore.save(existingDevice.userId, existingDevice.fingerprint);
      return; // Explicit return to match void
    }

    const newDevice: DeviceEntity = {
      id: uuid.v7(),
      userId: command.userId,
      platform: command.platform,
      fingerprint: command.fingerprint,
      isActive: true,
      brand: command.brand,
      model: command.model,
      name: command.name,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await this.deviceRepository.create(newDevice);
    if (newDevice.fingerprint) {
      await this.deviceStore.save(newDevice.userId, newDevice.fingerprint);
    }
  }
}
