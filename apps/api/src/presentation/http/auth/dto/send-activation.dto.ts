import {SendActivateCommand} from '#/application/auth/command';
import {createDTO} from '../../_shared/factories';

export class SendActivationBodyDTO extends createDTO(
  SendActivateCommand.schema.omit({
    correlationId: true,
    occurredAt: true,
  })
) {}
