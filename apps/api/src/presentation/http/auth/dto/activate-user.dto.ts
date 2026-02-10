import {ActivateUserCommand} from '#/application/auth/command';
import {createDTO} from '../../_shared/factories';

export class ActivateUserBodyDTO extends createDTO(
  ActivateUserCommand.schema.omit({
    correlationId: true,
    occurredAt: true,
  })
) {}
