import {UnhealthyError} from '#/context/support/domain/error/unhealty.error';
import {MessageMetadata} from '#/core/application/bus/message-metadata';
import {Query} from '#/core/application/bus/query';
import {Blockchain} from '#/core/port/blockchain';
import {Broker} from '#/core/port/broker';
import {Cache} from '#/core/port/cache';
import {Database} from '#/core/port/database';
import {IQueryHandler, QueryHandler} from '@nestjs/cqrs';
import {ApiProperty} from '@nestjs/swagger';
import ms from 'ms';

export class HealthQuery extends Query<MessageMetadata> {
  constructor(payload: MessageMetadata) {
    super(payload);
  }
}

export class HealthQueryResult {
  @ApiProperty()
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
