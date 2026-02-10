import {SendRecoverCommand} from '#/application/auth/command';
import {createDTO} from '../../_shared/factories';

export class SendRecoverBodyDTO extends createDTO(
  SendRecoverCommand.schema.omit({
    correlationId: true,
    occurredAt: true,
  })
) {}
