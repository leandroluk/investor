import {GenerateUserWalletCommand, GenerateUserWalletResult} from '#/application/user/command';
import {createDTO} from '#/presentation/http/_shared/factories';

export class GenerateUserWalletBodyDTO extends createDTO(
  GenerateUserWalletCommand.schema.pick({
    name: true,
  })
) {}

export class GenerateUserWalletResultDTO extends createDTO(GenerateUserWalletResult.schema) {}
