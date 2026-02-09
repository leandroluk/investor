import {UserRegisteredEvent, UserRequestChallengeEvent} from '#/domain/account/events';
import {Injectable} from '@nestjs/common';
import {ICommand, ofType, Saga} from '@nestjs/cqrs';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';
import {Send2FACommand, SendActivateCommand} from '../command';

@Injectable()
export class UserSaga {
  @Saga()
  public userRegistered(events$: Observable<any>): Observable<ICommand> {
    return events$.pipe(
      ofType(UserRegisteredEvent),
      map(event => {
        return new SendActivateCommand({
          email: event.payload.userEmail,
          correlationId: event.correlationId,
          occurredAt: event.occurredAt,
        });
      })
    );
  }

  @Saga()
  public challengeRequested(events$: Observable<any>): Observable<ICommand> {
    return events$.pipe(
      ofType(UserRequestChallengeEvent),
      map(event => {
        return new Send2FACommand({
          email: event.payload.userEmail,
          correlationId: event.correlationId,
          occurredAt: event.occurredAt,
        });
      })
    );
  }
}
