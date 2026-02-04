import {TokenPort} from '#/domain/_shared/port';
import {ChallengeStore, DeviceStore} from '#/domain/account/store';
import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  PreconditionFailedException,
} from '@nestjs/common';
import {FastifyReply, FastifyRequest} from 'fastify';
import {HEADER_CHALLENGE_KEY, HEADER_FINGERPRINT_KEY} from '../contant';

@Injectable()
export class DeviceGuard implements CanActivate {
  constructor(
    private readonly challengeStore: ChallengeStore,
    private readonly deviceStore: DeviceStore
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<FastifyRequest>();
    const reply = context.switchToHttp().getRequest<FastifyReply>();
    const user = request['user'] as TokenPort.Decoded;
    const fingerprint = request.headers[HEADER_FINGERPRINT_KEY] as string;

    const challenge = await this.challengeStore.get(user.claims.subject);
    if (challenge) {
      reply.header(HEADER_CHALLENGE_KEY, challenge.id);
      throw new PreconditionFailedException('Precondition Required');
    }

    const isDeviceAuthorized = await this.deviceStore.has(user.claims.subject, fingerprint).catch(() => false);
    if (!isDeviceAuthorized) {
      throw new ForbiddenException('Device Not Authorized');
    }

    return true;
  }
}
