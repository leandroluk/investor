import {TokenPort} from '#/domain/_shared/port';
import {CanActivate, ExecutionContext, Injectable, UnauthorizedException} from '@nestjs/common';
import {FastifyRequest} from 'fastify';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly tokenPort: TokenPort) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<FastifyRequest>();
    const authorization = request.headers.authorization;

    if (!authorization) {
      throw new UnauthorizedException('Missing authorization header');
    }

    const [type, token] = authorization.split(' ');

    if (type !== 'Bearer' || !token) {
      throw new UnauthorizedException('Invalid authorization header format');
    }

    try {
      const decoded = await this.tokenPort.decode(token);

      if (decoded.kind !== 'access') {
        throw new UnauthorizedException('Invalid token usage');
      }

      request['user'] = decoded;
      return true;
    } catch {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }
}
