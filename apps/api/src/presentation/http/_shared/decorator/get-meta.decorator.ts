import {type Envelope} from '#/application/_shared/bus';
import {createParamDecorator, type ExecutionContext} from '@nestjs/common';
import {type FastifyRequest} from 'fastify/types/request';

export type GetMeta = Envelope & {fingerprint: string};

export const GetMeta = createParamDecorator((_data: unknown, ctx: ExecutionContext): GetMeta => {
  const {id, startTime, fingerprint} = ctx.switchToHttp().getRequest<FastifyRequest>();
  return {
    correlationId: id,
    occurredAt: startTime,
    fingerprint,
  };
});
