import {type Envelope} from '#/application/_shared/bus';
import {createParamDecorator, type ExecutionContext} from '@nestjs/common';

export type GetEnvelope = Envelope;

export const GetEnvelope = createParamDecorator((_data: unknown, ctx: ExecutionContext): Envelope => {
  const {id: correlationId, startTime: occurredAt = new Date()} = ctx.switchToHttp().getRequest();
  return {correlationId, occurredAt};
});
