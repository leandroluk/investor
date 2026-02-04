import {CanActivate, ExecutionContext, ForbiddenException, Injectable} from '@nestjs/common';
import {FastifyRequest} from 'fastify';

@Injectable()
export class FingerprintGuard implements CanActivate {
  private readonly headerDeviceKey = 'x-device-id';

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<FastifyRequest>();
    const fingerprint = request.headers[this.headerDeviceKey] as string | undefined;

    if (!fingerprint) {
      throw new ForbiddenException('Device Fingerprint Required');
    }

    return true;
  }
}
