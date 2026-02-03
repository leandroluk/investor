import {UserRegisteredEvent, UserRequestChallengeEvent} from '#/domain/account/event';
import {Injectable} from '@nestjs/common';
import {ICommand, ofType, Saga} from '@nestjs/cqrs';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';
import uuid from 'uuid';
import {SendActivationEmailCommand, SendChallengeEmailCommand} from '../command';

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

  @Saga()
  public challengeRequested(events$: Observable<any>): Observable<ICommand> {
    return events$.pipe(
      ofType(UserRequestChallengeEvent),
      map(event => {
        return new SendChallengeEmailCommand({
          id: uuid.v7(),
          userId: event.payload.userId,
          email: event.payload.email,
          otp: event.payload.otp,
          correlationId: event.correlationId,
          occurredAt: event.occurredAt,
        });
      })
    );
  }
}
