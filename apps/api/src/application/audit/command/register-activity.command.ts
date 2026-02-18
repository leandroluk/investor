import {Command} from '#/application/_shared/bus';
import {createClass} from '#/domain/_shared/factories';
import {LoggerPort} from '#/domain/_shared/ports';
import {ActivityEntity} from '#/domain/account/entities';
import {ActivityRepository} from '#/domain/account/repositories';
import {CommandHandler, ICommandHandler} from '@nestjs/cqrs';
import z from 'zod';

export class RegisterActivityCommand extends createClass(
  Command,
  z.object({
    action: ActivityEntity.schema.shape.action,
    metadata: ActivityEntity.schema.shape.metadata,
  })
) {}

@CommandHandler(RegisterActivityCommand)
export class RegisterActivityCommandHandler implements ICommandHandler<RegisterActivityCommand> {
  constructor(
    private readonly activityRepository: ActivityRepository,
    private readonly loggerPort: LoggerPort
  ) {}

  async execute(command: RegisterActivityCommand): Promise<void> {
    try {
      await this.activityRepository.create(
        ActivityEntity.new({
          id: command.correlationId,
          createdAt: command.occurredAt,
          action: command.action,
          metadata: command.metadata,
        })
      );
    } catch (error) {
      this.loggerPort.error('failed to register activity', error as Error);
    }
  }
}
