import * as account from '#/domain/account/error';
import * as system from '#/domain/system/error';
import {HttpStatus} from '@nestjs/common';
import {ZodError} from 'zod';

export const ERROR_MAPPING: Record<string, number> = {
  [account.EmailAlreadyInUseError.name]: HttpStatus.CONFLICT,
  [system.UnhealthyError.name]: HttpStatus.SERVICE_UNAVAILABLE,
  [ZodError.name]: HttpStatus.UNPROCESSABLE_ENTITY,
};
