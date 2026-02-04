import {TokenPort} from '#/domain/_shared/port';
import {AuthUnauthorizedError} from '#/domain/account/error';
import {CanActivate, ExecutionContext, Injectable} from '@nestjs/common';
import {FastifyRequest} from 'fastify';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly tokenPort: TokenPort) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<FastifyRequest>();
    const authorization = request.headers.authorization;

    if (!authorization) {
      throw new AuthUnauthorizedError('Missing authorization header');
    }

    const [type, token] = authorization.split(' ');

    if (type !== 'Bearer' || !token) {
      throw new AuthUnauthorizedError('Invalid authorization header format');
    }

    try {
      const decoded = await this.tokenPort.decode(token);

      if (decoded.kind !== 'access') {
        throw new AuthUnauthorizedError('Invalid token usage');
      }

      request['user'] = decoded;
      return true;
    } catch {
      throw new AuthUnauthorizedError('Invalid or expired token');
    }
  }
}
