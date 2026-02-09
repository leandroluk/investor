import {ApiPropertyOf} from '#/application/_shared/decorators';
import {GetSsoRedirectQuery} from '#/application/sso/query';
import {PickType} from '@nestjs/swagger';

export class GetSsoRedirectParamsDTO extends PickType(GetSsoRedirectQuery, ['provider']) {}

export class GetSsoRedirectQueryDTO {
  @ApiPropertyOf(GetSsoRedirectQuery, 'callbackUrl', {required: true})
  callback_url!: string;
}
