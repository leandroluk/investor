import {ResetPasswordCommand} from '#/application/auth/command';
import {createDTO} from '../../_shared/factories';

export class ResetPasswordBodyDTO extends createDTO(
  ResetPasswordCommand.schema.omit({
    correlationId: true,
    occurredAt: true,
  })
) {}
