import {ApiPropertyOf} from '#/application/_shared/decorator';
import {GetSsoRedirectQuery} from '#/application/account/query';
import {PickType} from '@nestjs/swagger';

export class GetSsoRedirectParamsDTO extends PickType(GetSsoRedirectQuery, ['provider']) {}

export class GetSsoRedirectQueryDTO {
  @ApiPropertyOf(GetSsoRedirectQuery, 'callbackUrl', {required: true})
  callback_url!: string;
}
