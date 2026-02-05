import {TokenPort} from '#/domain/_shared/port';
import {ChallengeStore} from '#/domain/account/store';
import {CanActivate, ExecutionContext, Injectable, PreconditionFailedException} from '@nestjs/common';
import {FastifyReply, FastifyRequest} from 'fastify';

@Injectable()
export class ChallengeGuard implements CanActivate {
  constructor(private readonly challengeStore: ChallengeStore) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<FastifyRequest>();
    const reply = context.switchToHttp().getResponse<FastifyReply>();
    const user = request['user'] as TokenPort.Decoded;

    const challenge = await this.challengeStore.get(user.claims.id);
    if (challenge) {
      reply.header('x-challenge-id', challenge.id);
      throw new PreconditionFailedException('Precondition Required');
    }

    return true;
  }
}
