import {applyDecorators} from '@nestjs/common';
import {ApiResponse} from '@nestjs/swagger';
import {ERROR_MAPPING} from '../constant';
import {ErrorResult} from '../result';

export function ApiDomainResponse(...errors: Function[]): MethodDecorator & ClassDecorator {
  const statusGroup = errors.reduce(
    (acc, error) => {
      const status = ERROR_MAPPING[error.name] || 400;
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
      type: ErrorResult,
    })
  );

  return applyDecorators(...decorators);
}
