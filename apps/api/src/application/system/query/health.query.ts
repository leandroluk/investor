import {Envelope, Query} from '#/application/_shared/bus';
import {BlockchainPort, BrokerPort, CachePort, DatabasePort} from '#/domain/_shared/port';
import {UnhealthyError} from '#/domain/system/error';
import {IQueryHandler, QueryHandler} from '@nestjs/cqrs';
import {ApiProperty} from '@nestjs/swagger';
import ms from 'ms';

export class HealthQuery extends Query<Envelope> {
  constructor(payload) {
    super(payload);
  }
}

export class HealthQueryResult {
  @ApiProperty({
    description: 'Application uptime', example: '10m 30s'
  })
  uptime!: string;
}

@QueryHandler(HealthQuery)
export class HealthQueryHandler implements IQueryHandler<HealthQuery, HealthQueryResult> {
  constructor(
    private readonly blockchainPort: BlockchainPort,
    private readonly brokerPort: BrokerPort,
    private readonly cachePort: CachePort,
    private readonly databasePort: DatabasePort
  ) {}

  async execute(): Promise<HealthQueryResult> {
    const services = [this.blockchainPort, this.brokerPort, this.cachePort, this.databasePort];

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
