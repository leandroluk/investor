import {LinkUserWalletCommand, LinkUserWalletCommandResult} from '#/application/user/command';
import {createDTO} from '../../_shared/factories';

export class LinkUserWalletBodyDTO extends createDTO(
  LinkUserWalletCommand.schema.pick({
    address: true,
    signature: true,
    message: true,
    name: true,
  })
) {}

export class LinkUserWalletResultDTO extends createDTO(LinkUserWalletCommandResult) {}
