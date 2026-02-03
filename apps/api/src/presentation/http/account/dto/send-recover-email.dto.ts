import {ApiPropertyOf} from '#/application/_shared/decorator/api-property-of.decorator';
import {RequestPasswordResetCommand} from '#/application/account/command';

export class RequestPasswordResetBodyDTO {
  @ApiPropertyOf(RequestPasswordResetCommand, 'email')
  email!: string;
}
