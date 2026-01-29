import {DomainError} from '#/core/domain/error/domain';
import {ArgumentsHost, Catch, ExceptionFilter, HttpStatus, Logger} from '@nestjs/common';
import {FastifyReply, FastifyRequest} from 'fastify';
import z, {ZodError} from 'zod';
import {DOMAIN_ERROR_HTTP_MAP} from '../constants/error-mapping';

@Catch(DomainError, ZodError)
export class DomainExceptionFilter implements ExceptionFilter {
  private readonly logger: Logger = new Logger(DomainExceptionFilter.name);

  public catch(exception: DomainError | ZodError, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const reply = ctx.getResponse<FastifyReply>();
    const request = ctx.getRequest<FastifyRequest>();

    const errorName = exception.constructor.name;
    const status = DOMAIN_ERROR_HTTP_MAP[errorName] ?? HttpStatus.BAD_REQUEST;

    if (status >= 500) {
      this.logger.error(`[${errorName}] ${request.method} ${request.url}`, exception.stack);
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
