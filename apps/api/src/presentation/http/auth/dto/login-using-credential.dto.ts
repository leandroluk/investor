import {LoginUsingCredentialCommand} from '#/application/auth/command';
import {createDTO} from '../../_shared/factories';

export class LoginUsingCredentialBodyDTO extends createDTO(
  LoginUsingCredentialCommand.schema.pick({
    email: true,
    password: true,
  })
) {}
