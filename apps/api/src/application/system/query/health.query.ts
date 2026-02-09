import {Query} from '#/application/_shared/bus';
import {createClass} from '#/domain/_shared/factories';
import {BlockchainPort, BrokerPort, CachePort, DatabasePort} from '#/domain/_shared/ports';
import {UnhealthyError} from '#/domain/system/errors';
import {IQueryHandler, QueryHandler} from '@nestjs/cqrs';
import ms from 'ms';
import z from 'zod';

export class HealthQuery extends Query {}

export class HealthQueryResult extends createClass(
  z.object({
    uptime: z.string().meta({
      description: 'Application uptime',
      example: '10m 30s',
    }),
  })
) {}

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
