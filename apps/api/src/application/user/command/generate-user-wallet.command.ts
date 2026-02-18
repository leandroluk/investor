import {Command} from '#/application/_shared/bus';
import {createClass} from '#/domain/_shared/factories';
import {BrokerPort, CipherPort} from '#/domain/_shared/ports';
import {WalletEntity} from '#/domain/account/entities';
import {WalletNetworkEnum} from '#/domain/account/enums';
import {DeviceNotFoundError} from '#/domain/account/errors';
import {WalletCreatedEvent} from '#/domain/account/events';
import {DeviceRepository, WalletRepository} from '#/domain/account/repositories';
import {CommandHandler, ICommandHandler} from '@nestjs/cqrs';
import {ethers} from 'ethers';
import z from 'zod';

export class GenerateUserWalletCommand extends createClass(
  Command,
  z.object({
    userId: z.uuid().meta({
      description: 'The user owner of this wallet',
      example: '018f3b5e-1234-7000-8000-000000000000',
    }),
    fingerprint: z.string().min(1),
    name: z.string().min(1).max(50).meta({
      description: 'Name for the new wallet',
      example: 'Minha Carteira',
    }),
  })
) {}

export class GenerateUserWalletResult extends createClass(
  z.object({
    id: z.uuid().meta({example: '018f3b5e-1234-7000-8000-000000000000'}),
    address: z.string().meta({example: '0x71C...'}),
    network: z.enum(WalletNetworkEnum).meta({example: WalletNetworkEnum.ETHEREUM}),
  })
) {}

@CommandHandler(GenerateUserWalletCommand)
export class GenerateUserWalletHandler implements ICommandHandler<GenerateUserWalletCommand, GenerateUserWalletResult> {
  constructor(
    private readonly walletRepository: WalletRepository,
    private readonly deviceRepository: DeviceRepository,
    private readonly cipherPort: CipherPort,
    private readonly brokerPort: BrokerPort
  ) {}

  private async getDevice(userId: string, fingerprint: string): Promise<string> {
    const device = await this.deviceRepository.findByFingerprint(userId, fingerprint);
    if (!device) {
      throw new DeviceNotFoundError();
    }
    return device.id;
  }

  private async publishEvent(
    correlationId: string,
    occurredAt: Date,
    wallet: WalletEntity,
    deviceId: string
  ): Promise<void> {
    await this.brokerPort.publish(
      new WalletCreatedEvent(correlationId, occurredAt, {
        walletId: wallet.id,
        userId: wallet.userId,
        walletAddress: wallet.address,
        deviceId,
      })
    );
  }

  async execute(command: GenerateUserWalletCommand): Promise<GenerateUserWalletResult> {
    const deviceId = await this.getDevice(command.userId, command.fingerprint);

    // 1. Generate random wallet
    const randomWallet = ethers.Wallet.createRandom();

    // 2. Encrypt mnemonic
    // We expect the phrase to be present for a random wallet
    const mnemonic = randomWallet.mnemonic!.phrase;
    const seedEncrypted = this.cipherPort.encrypt(mnemonic);

    // 3. Create wallet entity
    const wallet = WalletEntity.new({
      userId: command.userId,
      name: command.name,
      network: WalletNetworkEnum.ETHEREUM,
      address: randomWallet.address,
      seedEncrypted: seedEncrypted,
      isCustodial: true,
      isActive: true,
      verifiedAt: new Date(), // Custodial wallets are verified by definition
    });

    // 4. Persist
    await this.walletRepository.create(wallet);
    await this.publishEvent(command.correlationId, command.occurredAt, wallet, deviceId);

    // 5. Return result
    return GenerateUserWalletResult.new({
      id: wallet.id,
      address: wallet.address,
      network: wallet.network,
    });
  }
}
