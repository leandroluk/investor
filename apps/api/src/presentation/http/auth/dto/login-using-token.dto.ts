import {LoginUsingTokenCommand} from '#/application/auth/command';
import {createDTO} from '../../_shared/factories';

export class LoginUsingTokenBodyDTO extends createDTO(
  LoginUsingTokenCommand.schema.pick({
    token: true,
  })
) {}
