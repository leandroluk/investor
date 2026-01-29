import {Module} from '@nestjs/common';
import {CqrsModule} from '@nestjs/cqrs';
import {HealthQueryHandler} from './application/query/health.query';
import {SupportController} from './presentation/http/controller/support.controller';

@Module({
  imports: [CqrsModule],
  controllers: [SupportController],
  providers: [HealthQueryHandler],
})
export class SupportModule {}
