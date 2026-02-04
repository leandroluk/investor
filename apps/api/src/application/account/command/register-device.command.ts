import {Command} from '#/application/_shared/bus';
import {ApiPropertyOf} from '#/application/_shared/decorator';
import {DeviceEntity} from '#/domain/account/entity';
import {DeviceTypeEnum} from '#/domain/account/enum';
import {DeviceRepository} from '#/domain/account/repository';
import {CommandHandler, ICommandHandler} from '@nestjs/cqrs';
import uuid from 'uuid';
import z from 'zod';

const commandSchema = z.object({
  userId: z.string().uuid(),
  platform: z.nativeEnum(DeviceTypeEnum),
  fingerprint: z.string().min(1),
  brand: z.string().min(1),
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

  @ApiPropertyOf(DeviceEntity, 'model')
  readonly model!: string;

  constructor(payload: RegisterDeviceCommand) {
    super(payload, commandSchema);
  }
}

@CommandHandler(RegisterDeviceCommand)
export class RegisterDeviceHandler implements ICommandHandler<RegisterDeviceCommand, void> {
  constructor(private readonly deviceRepository: DeviceRepository) {}

  async execute(command: RegisterDeviceCommand): Promise<void> {
    const oldDevice = await this.deviceRepository.findByFingerprint(command.userId, command.fingerprint);

    if (oldDevice) {
      oldDevice.isActive = true;
      oldDevice.brand = command.brand;
      oldDevice.model = command.model;
      oldDevice.updatedAt = new Date();
      const result = await this.deviceRepository.update(oldDevice);
      return result;
    }

    const newDevice: DeviceEntity = {
      id: uuid.v7(),
      userId: command.userId,
      platform: command.platform,
      fingerprint: command.fingerprint,
      isActive: true,
      brand: command.brand,
      model: command.model,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await this.deviceRepository.create(newDevice);
  }
}
