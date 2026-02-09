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

@QueryHandler(ListActiveDeviceQuery)
export class ListActiveDeviceHandler implements IQueryHandler<ListActiveDeviceQuery, DeviceEntity[]> {
  constructor(private readonly deviceRepository: DeviceRepository) {}

  async execute(query: ListActiveDeviceQuery): Promise<DeviceEntity[]> {
    const result = await this.deviceRepository.listActiveByUserId(query.userId);
    return result;
  }
}
