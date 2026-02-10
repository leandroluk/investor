import {RegisterUserCommand} from '#/application/auth/command';
import {createDTO} from '../../_shared/factories';

export class RegisterUserBodyDTO extends createDTO(
  RegisterUserCommand.schema.omit({
    correlationId: true,
    occurredAt: true,
  })
) {}
