import {ApiPropertyOf} from '#/application/_shared/decorator/api-property-of.decorator';
import {Authorize2FACommand} from '#/application/account/command';

export class Authorize2FABodyDTO {
  @ApiPropertyOf(Authorize2FACommand, 'challengeId')
  challengeId!: string;

  @ApiPropertyOf(Authorize2FACommand, 'code')
  code!: string;
}
