import {GetSsoRedirectQuery} from '#/application/sso/query';
import {createDTO} from '../../_shared/factories';

export class GetSsoRedirectParamsDTO extends createDTO(
  GetSsoRedirectQuery.schema.pick({
    provider: true,
  })
) {}

export class GetSsoRedirectQueryDTO extends createDTO(
  GetSsoRedirectQuery.schema.pick({
    callback_url: true,
  })
) {}
