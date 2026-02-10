import {SsoCallbackCommand} from '#/application/sso/command';
import {createDTO} from '../../_shared/factories';

export class SsoCallbackQueryDTO extends createDTO(
  SsoCallbackCommand.schema.omit({
    correlationId: true,
    occurredAt: true,
  })
) {}
