import {ApiPropertyOf} from '#/application/_shared/decorator';
import {GetSsoRedirectQuery} from '#/application/account/query';

export class GetSsoRedirectParamsDTO {
  @ApiPropertyOf(GetSsoRedirectQuery, 'provider', {required: true})
  provider!: 'google' | 'microsoft';
}

export class GetSsoRedirectQueryDTO {
  @ApiPropertyOf(GetSsoRedirectQuery, 'callbackUrl', {required: true})
  callback_url!: string;
}
