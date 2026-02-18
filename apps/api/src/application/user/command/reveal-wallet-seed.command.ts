import {Command} from '#/application/_shared/bus';
import {createClass} from '#/domain/_shared/factories';
import {BrokerPort, CipherPort, HasherPort} from '#/domain/_shared/ports';
import {ChallengeEntity, DeviceEntity, UserEntity, WalletEntity} from '#/domain/account/entities';
import {ChallengeStatusEnum} from '#/domain/account/enums';
import {
  DeviceNotFoundError,
  UserInvalidCredentialsError,
  UserInvalidOtpError,
  WalletNotFoundError,
  WalletSeedNotAvailableError,
} from '#/domain/account/errors';
import {WalletSeedRevealedEvent} from '#/domain/account/events';
import {ChallengeRepository, DeviceRepository, UserRepository, WalletRepository} from '#/domain/account/repositories';
import {ChallengeStore} from '#/domain/account/stores';
import {CommandHandler, ICommandHandler} from '@nestjs/cqrs';
import {z} from 'zod';

export class RevealWalletSeedCommand extends createClass(
  Command,
  z.object({
    userId: z.uuid(),
    walletId: z.uuid(),
    fingerprint: DeviceEntity.schema.shape.fingerprint,
    challengeId: z.uuid().meta({
      description: 'Challenge ID',
      example: '018f3b5e-chal-7000-8000-000000000099',
    }),
    password: z.string().min(8).meta({
      description: 'User current password for re-authentication',
      example: 'Test@123',
    }),
    otp: z.string().length(6).meta({
      description: '6-digit OTP code received via email/2FA app',
      example: '123456',
    }),
  })
) {}

export class RevealWalletSeedCommandResult extends createClass(
  z.object({
    mnemonic: z.string().meta({
      description: 'Decrypted seed phrase (12 words)',
      example: 'inner result eagle decide actual clip argue correct speed notice image match',
    }),
    walletId: z.uuid().meta({
      description: 'Wallet ID',
      example: '018f3b5e-abcd-7000-8000-000000000002',
    }),
  })
) {}

@CommandHandler(RevealWalletSeedCommand)
export class RevealWalletSeedCommandHandler implements ICommandHandler<
  RevealWalletSeedCommand,
  RevealWalletSeedCommandResult
> {
  constructor(
    private readonly walletRepository: WalletRepository,
    private readonly userRepository: UserRepository,
    private readonly challengeRepository: ChallengeRepository,
    private readonly deviceRepository: DeviceRepository,
    private readonly challengeStore: ChallengeStore,
    private readonly cipherPort: CipherPort,
    private readonly hasherPort: HasherPort,
    private readonly brokerPort: BrokerPort
  ) {}

  private async getChallengeById(
    challengeId: ChallengeEntity['id'],
    userId: ChallengeEntity['userId'],
    otp: string
  ): Promise<ChallengeEntity> {
    const challenge = await this.challengeRepository.findById(challengeId);
    if (challenge?.status !== ChallengeStatusEnum.PENDING) {
      throw new UserInvalidOtpError('Invalid or expired challenge');
    }
    if (challenge.expiresAt < new Date()) {
      await this.challengeRepository.update(
        Object.assign(challenge, {status: ChallengeStatusEnum.EXPIRED, updatedAt: new Date()})
      );
      throw new UserInvalidOtpError('Challenge expired');
    }
    if (challenge.userId !== userId) {
      throw new UserInvalidOtpError('Invalid challenge');
    }
    if (challenge.code !== otp) {
      throw new UserInvalidOtpError('Invalid OTP');
    }
    return challenge;
  }

  private async getWalletById(walletId: WalletEntity['id'], userId: WalletEntity['userId']): Promise<WalletEntity> {
    const wallet = await this.walletRepository.findById(walletId);
    if (!wallet) {
      throw new WalletNotFoundError();
    }
    if (!wallet.seedEncrypted || !wallet.isCustodial) {
      throw new WalletSeedNotAvailableError();
    }
    if (wallet.userId !== userId) {
      throw new WalletNotFoundError();
    }
    return wallet;
  }

  private async getDeviceByUserId(
    userId: DeviceEntity['userId'],
    fingerprint: DeviceEntity['fingerprint']
  ): Promise<DeviceEntity> {
    const device = await this.deviceRepository.findByFingerprint(userId, fingerprint);
    if (!device) {
      throw new DeviceNotFoundError();
    }
    return device;
  }

  private async verifyUserPassword(id: UserEntity['id'], password: string): Promise<UserEntity> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new UserInvalidCredentialsError();
    }

    const isPasswordValid = this.hasherPort.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UserInvalidCredentialsError();
    }

    return user;
  }

  private async updateChallenge(challenge: ChallengeEntity): Promise<void> {
    await this.challengeRepository.update(Object.assign(challenge, {updatedAt: new Date()}));
    if (challenge.status === ChallengeStatusEnum.COMPLETED) {
      await this.challengeStore.delete(challenge.userId);
    }
  }

  private async publishWalletSeedRevealedEvent(
    correlationId: string,
    occurredAt: Date,
    wallet: WalletEntity,
    deviceId: DeviceEntity['id']
  ): Promise<void> {
    await this.brokerPort.publish(
      new WalletSeedRevealedEvent(correlationId, occurredAt, {
        userId: wallet.userId,
        deviceId,
        walletId: wallet.id,
      })
    );
  }

  async execute(command: RevealWalletSeedCommand): Promise<RevealWalletSeedCommandResult> {
    const challenge = await this.getChallengeById(command.challengeId, command.userId, command.otp);
    try {
      const [wallet, device] = await Promise.all([
        this.getWalletById(command.walletId, command.userId),
        this.getDeviceByUserId(command.userId, command.fingerprint),
        this.verifyUserPassword(command.userId, command.password),
      ]);

      const mnemonic = this.cipherPort.decrypt(wallet.seedEncrypted!);

      await Promise.all([
        this.updateChallenge(Object.assign(challenge, {status: ChallengeStatusEnum.COMPLETED, verifiedAt: new Date()})),
        this.publishWalletSeedRevealedEvent(command.correlationId, command.occurredAt, wallet, device.id),
      ]);

      return RevealWalletSeedCommandResult.new({mnemonic, walletId: wallet.id});
    } catch (error) {
      await this.updateChallenge(Object.assign(challenge, {status: ChallengeStatusEnum.EXPIRED}));
      throw error;
    }
  }
}
