import {UserActivatedEvent} from '#/domain/account/events';
import {Injectable} from '@nestjs/common';
import {ICommand, ofType, Saga} from '@nestjs/cqrs';
import {map, Observable} from 'rxjs';
import {SendKycNoneCommand} from './command';

@Injectable()
export class UserSaga {
  @Saga()
  public userRegistered(events$: Observable<any>): Observable<ICommand> {
    return events$.pipe(
      ofType(UserActivatedEvent),
      map(event => {
        return SendKycNoneCommand.new({
          userId: event.payload.userId,
          correlationId: event.correlationId,
          occurredAt: event.occurredAt,
        });
      })
    );
  }
}
