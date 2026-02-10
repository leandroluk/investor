import {Query} from '#/application/_shared/bus';
import {createClass} from '#/domain/_shared/factories';
import {DeviceEntity} from '#/domain/account/entities';
import {DeviceRepository} from '#/domain/account/repositories';
import {IQueryHandler, QueryHandler} from '@nestjs/cqrs';
import z from 'zod';

export class ListActiveDeviceQuery extends createClass(
  Query,
  z.object({
    userId: z.uuid(),
  })
) {}

export class ListActiveDeviceQueryResult extends createClass(
  z.object({
    items: z.array(DeviceEntity.schema),
  })
) {}

@QueryHandler(ListActiveDeviceQuery)
export class ListActiveDeviceHandler implements IQueryHandler<ListActiveDeviceQuery, ListActiveDeviceQueryResult> {
  constructor(private readonly deviceRepository: DeviceRepository) {}

  async execute(query: ListActiveDeviceQuery): Promise<ListActiveDeviceQueryResult> {
    return ListActiveDeviceQueryResult.new({items: await this.deviceRepository.listActiveByUserId(query.userId)});
  }
}
