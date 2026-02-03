import {ApiPropertyOf} from '#/application/_shared/decorator';
import {SendRecoverCommand} from '#/application/account/command';

export class SendRecoverBodyDTO {
  @ApiPropertyOf(SendRecoverCommand, 'email')
  email!: string;
}
