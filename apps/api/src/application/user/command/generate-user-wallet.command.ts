import {Command} from '#/application/_shared/bus';
import {createClass} from '#/domain/_shared/factories';
import {CipherPort} from '#/domain/_shared/ports';
import {WalletEntity} from '#/domain/account/entities';
import {WalletNetworkEnum} from '#/domain/account/enums';
import {WalletRepository} from '#/domain/account/repositories';
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
    private readonly cipherPort: CipherPort
  ) {}

  async execute(command: GenerateUserWalletCommand): Promise<GenerateUserWalletResult> {
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

    // 5. Return result
    return GenerateUserWalletResult.new({
      id: wallet.id,
      address: wallet.address,
      network: wallet.network,
    });
  }
}
