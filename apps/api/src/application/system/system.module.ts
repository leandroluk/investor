import {Module} from '@nestjs/common';
import {HealthQueryHandler} from './query';

@Module({
  providers: [HealthQueryHandler],
})
export class SystemModule {}
