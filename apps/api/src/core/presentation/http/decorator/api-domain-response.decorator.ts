import {applyDecorators} from '@nestjs/common';
import {ApiResponse} from '@nestjs/swagger';
import {DOMAIN_ERROR_HTTP_MAP} from '../constants/error-mapping';
import {ErrorResponseDto} from '../dto/error-response.dto';

export function ApiDomainResponse(...errors: Function[]): MethodDecorator & ClassDecorator {
  const statusGroup = errors.reduce(
    (acc, error) => {
      const status = DOMAIN_ERROR_HTTP_MAP[error.name] || 400;
      if (!acc[status]) {
        acc[status] = [];
      }
      acc[status].push(error.name);
      return acc;
    },
    {} as Record<number, string[]>
  );

  const decorators = Object.entries(statusGroup).map(([status, names]) =>
    ApiResponse({
      status: Number(status),
      description: `Potential Domain Errors: ${names.join(', ')}`,
      type: ErrorResponseDto,
    })
  );

  return applyDecorators(...decorators);
}
