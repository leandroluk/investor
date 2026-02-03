import {type TokenPort} from '#/domain/_shared/port';
import {createParamDecorator, type ExecutionContext} from '@nestjs/common';
import {type FastifyRequest} from 'fastify';

export const GetUser = createParamDecorator((_data: unknown, ctx: ExecutionContext): TokenPort.Decoded => {
  const request = ctx.switchToHttp().getRequest<FastifyRequest>();
  const user = request['user'] as TokenPort.Decoded | undefined;
  return user!;
});
