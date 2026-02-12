import {DomainError} from '#/domain/_shared/errors';
import {LoggerPort} from '#/domain/_shared/ports';
import {
  applyDecorators,
  ArgumentsHost,
  Catch,
  createParamDecorator,
  ExceptionFilter,
  HttpStatus,
  Injectable,
  UseFilters,
  type ExecutionContext,
  type Type,
} from '@nestjs/common';
import {ApiResponse} from '@nestjs/swagger';
import {FastifyReply} from 'fastify';
import {type FastifyRequest} from 'fastify/types/request';
import z, {ZodError} from 'zod';
import {ErrorDTO} from './dtos';

// #region GetMeta
export type GetMeta = {
  correlationId: string;
  occurredAt: Date;
  fingerprint: string;
  userId: string;
};
export const GetMeta = createParamDecorator((_data: unknown, ctx: ExecutionContext): GetMeta => {
  const {id, startTime, fingerprint, user = {claims: {}} as any} = ctx.switchToHttp().getRequest<FastifyRequest>();
  return {
    correlationId: id,
    occurredAt: startTime,
    fingerprint: fingerprint,
    userId: user.claims.id,
  };
});
// #endregion

// #region MapDomainError
export const MapDomainError = Object.assign(
  (...mappings: Array<[errorClass: Type<Error> | Function, status: HttpStatus]>): ClassDecorator & MethodDecorator => {
    const mappingMap = mappings.reduce(
      (acc, [errorClass, status]) => {
        acc[errorClass.name] = status;
        return acc;
      },
      {} as Record<string, number>
    );

    const errorByStatus = mappings.reduce(
      (acc, [errorClass, status]) => {
        acc[status] ??= [];
        acc[status].push(`\`${errorClass.name}\``);
        return acc;
      },
      {} as Record<number, string[]>
    );

    const swaggerDecorators = Object.entries(errorByStatus).map(([status, errors]) =>
      ApiResponse({
        status: Number(status),
        description: `Domain Error: ${errors.join(' ')}`,
        type: ErrorDTO,
      })
    );

    swaggerDecorators.push(
      ApiResponse({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
        description: 'Validation Error',
        type: ErrorDTO,
      })
    );
    return applyDecorators(UseFilters(MapDomainError.makeFilter(mappingMap)), ...swaggerDecorators);
  },
  {
    makeFilter: (mappings: Record<string, number>): Type<ExceptionFilter> => {
      @Injectable()
      @Catch(DomainError, ZodError)
      class GeneratedFilter implements ExceptionFilter {
        constructor(private readonly loggerPort: LoggerPort) {}

        public catch(exception: DomainError | ZodError, host: ArgumentsHost): void {
          const ctx = host.switchToHttp();
          const reply = ctx.getResponse<FastifyReply>();
          const request = ctx.getRequest<FastifyRequest>();
          const {name: errorName} = exception.constructor;

          const status = exception instanceof ZodError ? HttpStatus.UNPROCESSABLE_ENTITY : mappings[errorName];

          if (!status) {
            throw exception;
          }

          if (status >= 500) {
            this.loggerPort.error(`[${errorName}] ${request.method} ${request.url}`, exception);
          }

          const payload = {
            correlationId: request.id,
            code: exception instanceof ZodError ? 'request.validation_error' : (exception as any).code || errorName,
            message: exception.message,
            occurredAt: new Date().toISOString(),
            ...(exception instanceof ZodError && {details: z.treeifyError(exception)}),
          };

          reply.code(status).send(payload);
        }
      }

      return GeneratedFilter;
    },
  }
);
// #endregion
