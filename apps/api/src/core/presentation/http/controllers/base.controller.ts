import {Inject} from '@nestjs/common';
import {CommandBus, QueryBus} from '@nestjs/cqrs';

export abstract class BaseController {
  @Inject(CommandBus)
  protected readonly commandBus!: CommandBus;

  @Inject(QueryBus)
  protected readonly queryBus!: QueryBus;
}
