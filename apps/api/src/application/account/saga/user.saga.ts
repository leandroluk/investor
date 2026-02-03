import {UserRegisteredEvent} from '#/domain/account/event';
import {Injectable} from '@nestjs/common';
import {ICommand, ofType, Saga} from '@nestjs/cqrs';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';
import {SendActivationEmailCommand} from '../command';

@Injectable()
export class UserSaga {
  @Saga()
  public userRegistered(events$: Observable<any>): Observable<ICommand> {
    return events$.pipe(
      ofType(UserRegisteredEvent),
      map(event => {
        return new SendActivationEmailCommand({
          email: event.payload.userEmail,
          correlationId: event.correlationId,
          occurredAt: event.occurredAt,
        });
      })
    );
  }
}
