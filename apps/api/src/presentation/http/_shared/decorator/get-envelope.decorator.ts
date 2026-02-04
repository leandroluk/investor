import {type Envelope} from '#/application/_shared/bus';
import {createParamDecorator, type ExecutionContext} from '@nestjs/common';
import {HEADER_FINGERPRINT_KEY} from '../contant';

export type GetEnvelope = Envelope & {fingerprint: string};

export const GetEnvelope = createParamDecorator((_data: unknown, ctx: ExecutionContext): GetEnvelope => {
  const request = ctx.switchToHttp().getRequest();
  const {id: correlationId, startTime: occurredAt = new Date()} = request;
  const fingerprint = request.headers[HEADER_FINGERPRINT_KEY] as string;
  return {correlationId, occurredAt, fingerprint};
});
