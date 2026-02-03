import {ApiPropertyOf} from '#/application/_shared/decorator/api-property-of.decorator';
import {SsoCallbackCommand} from '#/application/account/command';

export class SsoCallbackQueryDTO {
  @ApiPropertyOf(SsoCallbackCommand, 'provider', {required: true})
  provider!: 'google' | 'microsoft';

  @ApiPropertyOf(SsoCallbackCommand, 'code', {required: true})
  code!: string;

  @ApiPropertyOf(SsoCallbackCommand, 'state', {required: true})
  state!: string;
}
