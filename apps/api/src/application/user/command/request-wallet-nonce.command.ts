import {Command} from '#/application/_shared/bus';
import {createClass} from '#/domain/_shared/factories';
import {NonceStore} from '#/domain/account/stores';
import {CommandHandler, ICommandHandler} from '@nestjs/cqrs';
import {randomUUID} from 'crypto';
import z from 'zod';

export class RequestWalletNonceCommand extends createClass(
  Command,
  z.object({
    userId: z.uuid(),
  })
) {}

export class RequestWalletNonceCommandResult extends createClass(
  z.object({
    nonce: z.string(),
  })
) {}

@CommandHandler(RequestWalletNonceCommand)
export class RequestWalletNonceHandler implements ICommandHandler<
  RequestWalletNonceCommand,
  RequestWalletNonceCommandResult
> {
  constructor(private readonly nonceStore: NonceStore) {}

  async execute(command: RequestWalletNonceCommand): Promise<RequestWalletNonceCommandResult> {
    const nonce = `Sign this message to prove you own this wallet: ${randomUUID()}`;
    await this.nonceStore.save({
      userId: command.userId,
      nonce,
    });
    return {nonce};
  }
}
