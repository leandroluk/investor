import {Authorize2FACommand} from '#/application/auth/command';
import {createDTO} from '../../_shared/factories';

export class Authorize2FABodyDTO extends createDTO(
  Authorize2FACommand.schema.omit({
    correlationId: true,
    occurredAt: true,
  })
) {}
