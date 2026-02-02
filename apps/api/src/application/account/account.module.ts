import {Module} from '@nestjs/common';
import * as command from './command';
import * as query from './query';

@Module({
  providers: Array().concat(Object.values(command), Object.values(query)),
})
export class AccountModule {}
