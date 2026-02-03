import {Module} from '@nestjs/common';
import {AccountConfig} from './account.config';
import * as command from './command';
import * as query from './query';
import * as saga from './saga';

@Module({
  providers: Array().concat(
    AccountConfig, //
    Object.values(command),
    Object.values(query),
    Object.values(saga)
  ),
})
export class AccountModule {}
