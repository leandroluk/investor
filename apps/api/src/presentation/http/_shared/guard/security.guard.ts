import {ChallengeStore, DeviceStore} from '#/domain/account/store';
import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  PreconditionFailedException,
} from '@nestjs/common';
import {FastifyReply, FastifyRequest} from 'fastify';

@Injectable()
export class SecurityGuard implements CanActivate {
  private readonly headerDeviceKey = 'x-device-id';
  private readonly headerChallengeKey = 'x-challenge-id';

  constructor(
    private readonly challengeStore: ChallengeStore,
    private readonly deviceStore: DeviceStore
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<FastifyRequest>();
    const reply = context.switchToHttp().getRequest<FastifyReply>();
    const user = request['user'] as {id: string} | undefined;
    const fingerprint = request.headers[this.headerDeviceKey] as string | undefined;

    if (!user || !user.id) {
      return true;
    }

    const challenge = await this.challengeStore.get(user.id);
    if (challenge) {
      reply.header(this.headerChallengeKey, challenge.id);
      throw new PreconditionFailedException('Precondition Required');
    }

    if (!fingerprint) {
      throw new ForbiddenException('Device Fingerprint Required');
    }

    const isDeviceAuthorized = await this.deviceStore.has(user.id, fingerprint);
    if (!isDeviceAuthorized) {
      throw new ForbiddenException('Device Not Authorized');
    }

    return true;
  }
}
