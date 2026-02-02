import {DomainError} from '#/domain/_shared/error';
import {LoggerPort} from '#/domain/_shared/port';
import {
  applyDecorators,
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
  Injectable,
  Type,
  UseFilters,
} from '@nestjs/common';
import {ApiResponse} from '@nestjs/swagger';
import {FastifyReply, FastifyRequest} from 'fastify';
import z, {ZodError} from 'zod';
import {ErrorResult} from '../result';

export type ErrorMapping = [errorClass: Type<Error> | Function, status: HttpStatus];

export function createDomainExceptionFilter(mappings: Record<string, number>): Type<ExceptionFilter> {
  @Injectable()
  @Catch(DomainError, ZodError)
  class GeneratedFilter implements ExceptionFilter {
    constructor(private readonly loggerPort: LoggerPort) {}

    public catch(exception: DomainError | ZodError, host: ArgumentsHost): void {
      const ctx = host.switchToHttp();
      const reply = ctx.getResponse<FastifyReply>();
      const request = ctx.getRequest<FastifyRequest>();
      const {name: errorName} = exception.constructor;

      const status: number =
        exception instanceof ZodError
          ? HttpStatus.UNPROCESSABLE_ENTITY
          : (mappings[errorName] ?? HttpStatus.BAD_REQUEST);

      if (status >= 500) {
        this.loggerPort.error(`[${errorName}] ${request.method} ${request.url}`, exception);
      }

      const payload = {
        correlationId: request.id,
        code: exception instanceof ZodError ? 'VALIDATION_ERROR' : (exception as any).code || errorName,
        message: exception.message,
        occurredAt: new Date().toISOString(),
        ...(exception instanceof ZodError && {details: z.treeifyError(exception)}),
      };

      reply.code(status).send(payload);
    }
  }

  return GeneratedFilter;
}

export function DomainException(...mappings: ErrorMapping[]): ClassDecorator & MethodDecorator {
  const mappingMap = mappings.reduce(
    (acc, [errorClass, status]) => {
      acc[errorClass.name] = status;
      return acc;
    },
    {} as Record<string, number>
  );

  const swaggerDecorators = mappings.map(([errorClass, status]) =>
    ApiResponse({
      status,
      description: `Domain Error: ${errorClass.name}`,
      type: ErrorResult,
    })
  );

  return applyDecorators(UseFilters(createDomainExceptionFilter(mappingMap)), ...swaggerDecorators);
}
