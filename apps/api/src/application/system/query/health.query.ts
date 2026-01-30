import {Envelope, Query} from '#/application/_shared/bus';
import {Blockchain, Broker, Cache, Database} from '#/domain/_shared/port';
import {UnhealthyError} from '#/domain/system/error';
import {IQueryHandler, QueryHandler} from '@nestjs/cqrs';
import {ApiProperty} from '@nestjs/swagger';
import ms from 'ms';

export class HealthQuery extends Query {
  constructor(payload: Envelope) {
    super(payload);
  }
}

export class HealthQueryResult {
  @ApiProperty({description: 'Application uptime', example: '10m 30s'})
  uptime!: string;
}

@QueryHandler(HealthQuery)
export class HealthQueryHandler implements IQueryHandler<HealthQuery, HealthQueryResult> {
  constructor(
    private readonly blockchain: Blockchain,
    private readonly broker: Broker,
    private readonly cache: Cache,
    private readonly database: Database
  ) {}

  async execute(): Promise<HealthQueryResult> {
    const services = [this.blockchain, this.broker, this.cache, this.database];

    const results = await Promise.allSettled(services.map(service => service.ping()));

    const failureMessage = results.reduce((acc, result) => {
      if (result.status === 'rejected') {
        return acc + `, ${result.reason.message}`;
      }
      return acc;
    }, '');

    if (failureMessage) {
      throw new UnhealthyError(failureMessage);
    }

    return {
      uptime: ms(process.uptime()),
    };
  }
}
