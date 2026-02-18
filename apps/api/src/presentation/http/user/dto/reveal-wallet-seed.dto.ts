import {RevealWalletSeedCommand, RevealWalletSeedCommandResult} from '#/application/user/command';
import {createDTO} from '../../_shared/factories';

export class RevealWalletSeedParamDTO extends createDTO(
  RevealWalletSeedCommand.schema.pick({
    walletId: true,
  })
) {}

export class RevealWalletSeedBodyDTO extends createDTO(
  RevealWalletSeedCommand.schema.pick({
    challengeId: true,
    password: true,
    otp: true,
  })
) {}

export class RevealWalletSeedResultDTO extends createDTO(RevealWalletSeedCommandResult) {}
