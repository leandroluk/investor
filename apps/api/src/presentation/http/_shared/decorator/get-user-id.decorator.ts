import {type TokenPort} from '#/domain/_shared/port';
import {createParamDecorator, type ExecutionContext} from '@nestjs/common';
import {type FastifyRequest} from 'fastify';

export type GetUserId = TokenPort.Decoded['claims']['id'];

export const GetUserId = createParamDecorator((_data: unknown, ctx: ExecutionContext): GetUserId => {
  const request = ctx.switchToHttp().getRequest<FastifyRequest>();
  const user = request['user'] as TokenPort.Decoded | undefined;
  return user!.claims.id;
});
