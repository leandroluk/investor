import {type Envelope} from '#/application/_shared/bus';
import {createParamDecorator, type ExecutionContext} from '@nestjs/common';

export const GetEnvelope = createParamDecorator((_data: unknown, ctx: ExecutionContext): Envelope => {
  const {id: messageId, startTime: occurredAt = new Date()} = ctx.switchToHttp().getRequest();
  return {messageId, occurredAt};
});
