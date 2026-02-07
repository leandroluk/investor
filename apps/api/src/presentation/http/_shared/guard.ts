import {BrokerPort, HasherPort, TokenPort} from '#/domain/_shared/port';
import {AuthUnauthorizedError} from '#/domain/account/error';
import {UserRequestChallengeEvent} from '#/domain/account/event';
import {ChallengeStore} from '#/domain/account/store';
import {CanActivate, ExecutionContext, Injectable, PreconditionFailedException} from '@nestjs/common';
import {FastifyReply, FastifyRequest} from 'fastify';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly hasherPort: HasherPort,
    private readonly brokerPort: BrokerPort,
    private readonly tokenPort: TokenPort
  ) {}

  private getToken(request: FastifyRequest): string {
    const {authorization} = request.headers;
    if (!authorization) {
      throw new AuthUnauthorizedError('Missing authorization header');
    }

    const [type, token] = authorization.split(' ');

    if (type !== 'Bearer' || !token) {
      throw new AuthUnauthorizedError('Invalid authorization header format');
    }
    return token;
  }

  private decodeUser(token: string): TokenPort.Decoded {
    const decoded = this.tokenPort.decode(token);

    if (decoded.kind !== 'access') {
      throw new AuthUnauthorizedError('Invalid token usage');
    }

    return decoded;
  }

  private async compareFingerprint(request: FastifyRequest, claims: TokenPort.Claims): Promise<void> {
    const sameHash = this.hasherPort.compare(request.fingerprint, claims.hash);
    if (!sameHash) {
      void this.brokerPort.publish(
        new UserRequestChallengeEvent(request.id, request.startTime, {
          userId: claims.id,
          userEmail: claims.email,
        })
      );
      throw new AuthUnauthorizedError('Fingerprint mismatch');
    }
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<FastifyRequest>();
    const token = this.getToken(request);
    const decoded = this.decodeUser(token);
    await this.compareFingerprint(request, decoded.claims);
    request['user'] = decoded;
    return true;
  }
}

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
