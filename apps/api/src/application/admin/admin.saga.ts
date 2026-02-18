import {DocumentStatusEnum} from '#/domain/account/enums';
import {DocumentReviewedEvent} from '#/domain/account/events';
import {Injectable} from '@nestjs/common';
import {ICommand, ofType, Saga} from '@nestjs/cqrs';
import {filter, map, Observable} from 'rxjs';
import {ConsolidateKycStatusCommand} from './command';

@Injectable()
export class AdminSaga {
  @Saga()
  public documentReviewed(events$: Observable<any>): Observable<ICommand> {
    return events$.pipe(
      ofType(DocumentReviewedEvent),
      filter(event => event.payload.documentStatus === DocumentStatusEnum.APPROVED),
      map(event => {
        return ConsolidateKycStatusCommand.new({
          userId: event.payload.documentUserId,
          correlationId: event.correlationId,
          occurredAt: event.occurredAt,
        });
      })
    );
  }
}
