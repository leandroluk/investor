import {DomainError} from '#/domain/_shared/error';
import {Logger} from '#/domain/_shared/port';
import {ArgumentsHost, Catch, ExceptionFilter, HttpStatus, Injectable} from '@nestjs/common';
import {FastifyReply, FastifyRequest} from 'fastify';
import z, {ZodError} from 'zod';
import {ERROR_MAPPING} from '../constant';

@Injectable()
@Catch(DomainError, ZodError)
export class DomainExceptionFilter implements ExceptionFilter {
  constructor(private readonly logger: Logger) {}

  public catch(exception: DomainError | ZodError, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const reply = ctx.getResponse<FastifyReply>();
    const request = ctx.getRequest<FastifyRequest>();

    const errorName = exception.constructor.name;
    const status = ERROR_MAPPING[errorName] ?? HttpStatus.BAD_REQUEST;

    if (status >= 500) {
      this.logger.error(`[${errorName}] ${request.method} ${request.url}`, exception);
    }

    const payload = {
      messageId: request.id,
      code: exception instanceof ZodError ? 'VALIDATION_ERROR' : exception.code,
      message: exception.message,
      occurredAt: new Date().toISOString(),
      ...(exception instanceof ZodError && {details: z.treeifyError(exception)}),
    };

    reply.code(status).send(payload);
  }
}
