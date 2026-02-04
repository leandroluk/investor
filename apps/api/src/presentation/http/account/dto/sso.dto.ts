import {ApiPropertyOf} from '#/application/_shared/decorator';
import {SsoCallbackCommand} from '#/application/account/command';
import {GetSsoRedirectQuery} from '#/application/account/query';
import {PickType} from '@nestjs/swagger';

// #region GetSsoRedirect
export class GetSsoRedirectParamsDTO extends PickType(GetSsoRedirectQuery, ['provider']) {}

export class GetSsoRedirectQueryDTO {
  @ApiPropertyOf(GetSsoRedirectQuery, 'callbackUrl', {required: true})
  callback_url!: string;
}
// #endregion

// #region SsoCallback
export class SsoCallbackQueryDTO extends SsoCallbackCommand {}
// #endregion
