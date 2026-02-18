import {KycStatusEnum} from '#/domain/account/enums';
import {UserActivatedEvent, UserKycStatusChangedEvent, WalletLinkedEvent} from '#/domain/account/events';
import {Injectable} from '@nestjs/common';
import {ICommand, ofType, Saga} from '@nestjs/cqrs';
import {filter, map, Observable} from 'rxjs';
import {CompleteOnboardCommand, SendKycApprovedCommand, SendKycNoneCommand, SendWelcomeCommand} from './command';

@Injectable()
export class UserSaga {
  @Saga()
  public userActivated(events$: Observable<any>): Observable<ICommand> {
    return events$.pipe(
      ofType(UserActivatedEvent),
      map(event => {
        return [
          SendWelcomeCommand.new({
            userId: event.payload.userId,
            correlationId: event.correlationId,
            occurredAt: event.occurredAt,
          }),
          SendKycNoneCommand.new({
            userId: event.payload.userId,
            correlationId: event.correlationId,
            occurredAt: event.occurredAt,
          }),
        ];
      })
    );
  }

  @Saga()
  public kycApproved(events$: Observable<any>): Observable<ICommand> {
    return events$.pipe(
      ofType(UserKycStatusChangedEvent),
      filter(event => event.payload.status === KycStatusEnum.APPROVED),
      map(event => {
        return SendKycApprovedCommand.new({
          userId: event.payload.userId,
          correlationId: event.correlationId,
          occurredAt: event.occurredAt,
        });
      })
    );
  }

  @Saga()
  public walletLinked(events$: Observable<any>): Observable<ICommand> {
    return events$.pipe(
      ofType(WalletLinkedEvent),
      map(event => {
        return CompleteOnboardCommand.new({
          userId: event.payload.userId,
          correlationId: event.correlationId,
          occurredAt: event.occurredAt,
        });
      })
    );
  }
}
