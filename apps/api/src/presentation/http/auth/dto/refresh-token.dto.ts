import {RefreshTokenCommand, RefreshTokenCommandResult} from '#/application/auth/command';
import {createDTO} from '../../_shared/factories';

export class RefreshTokenBodyDTO extends createDTO(
  RefreshTokenCommand.schema.omit({
    correlationId: true,
    occurredAt: true,
    fingerprint: true,
  })
) {}

export class RefreshTokenResultDTO extends createDTO(RefreshTokenCommandResult) {}
