import {Module} from '@nestjs/common';
import {CheckEmailQueryHandler} from './query';

@Module({
  providers: [CheckEmailQueryHandler],
})
export class AccountModule {}
