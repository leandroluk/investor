import {Command} from '#/application/_shared/bus';
import {createClass} from '#/domain/_shared/factories';
import {BlockchainPort} from '#/domain/_shared/ports';
import {WalletEntity} from '#/domain/account/entities';
import {WalletNetworkEnum} from '#/domain/account/enums';
import {WalletRepository} from '#/domain/account/repositories';
import {NonceStore} from '#/domain/account/stores';
import {ConflictException, PreconditionFailedException, UnprocessableEntityException} from '@nestjs/common';
import {CommandHandler, ICommandHandler} from '@nestjs/cqrs';
import z from 'zod';

export class LinkUserWalletCommand extends createClass(
  Command,
  z.object({
    userId: z.uuid(),
    address: z.string().length(42),
    signature: z.string().startsWith('0x'),
    message: z.string(),
    name: z.string().min(1).max(50),
  })
) {}

export class LinkUserWalletCommandResult extends createClass(
  z.object({
    id: z.uuid(),
  })
) {}

@CommandHandler(LinkUserWalletCommand)
export class LinkUserWalletHandler implements ICommandHandler<LinkUserWalletCommand, LinkUserWalletCommandResult> {
  constructor(
    private readonly walletRepository: WalletRepository,
    private readonly blockchainPort: BlockchainPort,
    private readonly nonceStore: NonceStore
  ) {}

  async execute(command: LinkUserWalletCommand): Promise<LinkUserWalletCommandResult> {
    // 1. Verify Nonce
    const nonce = await this.nonceStore.get(command.userId);
    if (!nonce) {
      throw new PreconditionFailedException('Nonce not found or expired. Please request a new nonce.');
    }

    if (!command.message.includes(nonce)) {
      throw new UnprocessableEntityException('Message does not contain the correct nonce.');
    }

    // 2. Recover Address
    let recoveredAddress: string;
    try {
      recoveredAddress = this.blockchainPort.recoverAddress(command.message, command.signature);
    } catch {
      throw new UnprocessableEntityException('Invalid signature.');
    }

    if (recoveredAddress.toLowerCase() !== command.address.toLowerCase()) {
      throw new UnprocessableEntityException('Signature does not match the provided wallet address.');
    }

    // 3. Verify Uniqueness
    const existingWallet = await this.walletRepository.findByAddress(command.address);
    if (existingWallet) {
      throw new ConflictException('Wallet address is already linked to an account.');
    }

    // 4. Create and Save Wallet
    const wallet = WalletEntity.new({
      userId: command.userId,
      address: command.address,
      name: command.name,
      network: WalletNetworkEnum.ETHEREUM,
      isCustodial: false,
      seedEncrypted: null,
      isActive: true,
      verifiedAt: new Date(),
    });

    await this.walletRepository.create(wallet);
    await this.nonceStore.delete(command.userId);

    return LinkUserWalletCommandResult.new({id: wallet.id});
  }
}
