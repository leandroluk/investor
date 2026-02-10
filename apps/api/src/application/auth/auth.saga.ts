import {UserRegisteredEvent, UserRequestChallengeEvent} from '#/domain/account/events';
import {Injectable} from '@nestjs/common';
import {type ICommand, ofType, Saga} from '@nestjs/cqrs';
import {type Observable} from 'rxjs';
import {map} from 'rxjs/operators';
import {Send2FACommand, SendActivateCommand} from './command';

@Injectable()
export class AuthSaga {
  @Saga()
  public userRegistered(events$: Observable<any>): Observable<ICommand> {
    return events$.pipe(
      ofType(UserRegisteredEvent),
      map(event => {
        return SendActivateCommand.new({
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
        return Send2FACommand.new({
          email: event.payload.userEmail,
          correlationId: event.correlationId,
          occurredAt: event.occurredAt,
        });
      })
    );
  }
}
