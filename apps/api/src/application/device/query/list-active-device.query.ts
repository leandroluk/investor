import {Query} from '#/application/_shared/bus';
import {ApiPropertyOf} from '#/application/_shared/decorator';
import {DeviceEntity} from '#/domain/account/entity';
import {DeviceRepository} from '#/domain/account/repository';
import {IQueryHandler, QueryHandler} from '@nestjs/cqrs';
import z from 'zod';

const querySchema = z.object({
  userId: z.uuid(),
});

type QuerySchema = z.infer<typeof querySchema>;

export class ListActiveDeviceQuery extends Query<QuerySchema> {
  @ApiPropertyOf(DeviceEntity, 'userId')
  readonly userId!: string;

  constructor(payload: ListActiveDeviceQuery) {
    super(payload, querySchema);
  }
}

@QueryHandler(ListActiveDeviceQuery)
export class ListActiveDeviceHandler implements IQueryHandler<ListActiveDeviceQuery, DeviceEntity[]> {
  constructor(private readonly deviceRepository: DeviceRepository) {}

  async execute(query: ListActiveDeviceQuery): Promise<DeviceEntity[]> {
    const result = await this.deviceRepository.listActiveByUserId(query.userId);
    return result;
  }
}
