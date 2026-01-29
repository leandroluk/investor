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

    const request = ctx.getRequest<FastifyRequest>();
    const response = ctx.getResponse<FastifyReply>();

    const errorName: string = exception.constructor.name;
    const status: number = DOMAIN_ERROR_HTTP_MAP[errorName] ?? HttpStatus.BAD_REQUEST;

    if (status >= 500) {
      this.logger.error(`[${errorName}] ${request.method} ${request.url}`, exception);
    }

    const payload: any = {messageId: (request.raw as any).message};
    if (exception instanceof ZodError) {
      payload.code = 'VALIDATION_ERROR';
      payload.message = 'Payload validation failed';
      payload.details = z.treeifyError(exception);
      payload.occurredAt = new Date().toISOString();
    } else {
      payload.code = exception.code;
      payload.message = exception.message;
      payload.occurredAt = exception.occurredAt.toISOString();
    }

    void response.status(status).send(payload);
  }
}
