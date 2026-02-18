import {Auditable} from '#/domain/_shared/decorators';
import {DomainEvent} from '#/domain/_shared/events';
import {Injectable} from '@nestjs/common';
import {type ICommand, Saga} from '@nestjs/cqrs';
import {type Observable} from 'rxjs';
import {filter, map} from 'rxjs/operators';
import {RegisterActivityCommand} from './command';

@Injectable()
export class AuditSaga {
  @Saga()
  public isAuditableEvent(events$: Observable<any>): Observable<ICommand> {
    return events$.pipe(
      filter((event: DomainEvent<any>) => Boolean(Auditable.getMetadata(event.constructor))),
      map((event: DomainEvent<any>) => {
        const metadata = Auditable.getMetadata(event.constructor)!;
        return RegisterActivityCommand.new({
          action: metadata.action,
          metadata: event.payload,
          correlationId: event.correlationId,
          occurredAt: event.occurredAt,
        });
      })
    );
  }
}
