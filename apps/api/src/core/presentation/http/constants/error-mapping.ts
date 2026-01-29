import {UnhealthyError} from '#/context/support/domain/error/unhealty.error';
import {HttpStatus} from '@nestjs/common';
import {ZodError} from 'zod';

export const DOMAIN_ERROR_HTTP_MAP: Record<string, number> = {
  /**
   * Catalog
   */

  /**
   * IAM
   */

  /**
   * Portfólio
   */

  /**
   * Support
   */
  [UnhealthyError.name]: HttpStatus.SERVICE_UNAVAILABLE,

  /**
   * Treasure
   */

  /**
   * Generic errors
   */
  [ZodError.name]: HttpStatus.UNPROCESSABLE_ENTITY,
};
