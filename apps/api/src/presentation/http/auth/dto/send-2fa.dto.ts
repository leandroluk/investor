import {Send2FACommand} from '#/application/auth/command';
import {createDTO} from '../../_shared/factories';

export class Send2FABodyDTO extends createDTO(
  Send2FACommand.schema.omit({
    correlationId: true,
    occurredAt: true,
  })
) {}
