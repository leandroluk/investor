import {Logger} from '#/core/port/logger';
import {Injectable} from '@nestjs/common';
import {OnEvent} from '@nestjs/event-emitter';
import * as Sentry from '@sentry/node';

@Injectable()
export class MonitorListener {
  constructor(private readonly logger: Logger) {}

  @OnEvent('monitor.trace')
  handleTrace(payload: {className: string; methodName: string; duration: number; timestamp: Date}): void {
    const message = `[Trace] ${payload.className}.${payload.methodName} took ${payload.duration.toFixed(2)}ms`;

    Sentry.captureMessage(message, {
      level: 'info',
      extra: {...payload},
      tags: {
        interface: payload.className,
        method: payload.methodName,
        category: 'performance',
      },
    });

    this.logger.info(message, {context: 'Performance', ...payload});
  }

  @OnEvent('monitor.retry')
  handleRetry(payload: {className: string; methodName: string; attempt: number; error: any}): void {
    const message = `[Retry] ${payload.className}.${payload.methodName} - Attempt ${payload.attempt + 1}`;

    Sentry.addBreadcrumb({
      category: 'resiliency',
      message: `${message} due to: ${payload.error.message}`,
      level: 'warning',
      data: {
        attempt: payload.attempt + 1,
        error: payload.error.message,
      },
    });

    this.logger.warn(`${message} due to error: ${payload.error.message}`, {context: 'Resiliency', ...payload});
  }

  @OnEvent('infrastructure.broker.error')
  handleInfrastructureBrokerError(payload: any): void {
    Sentry.captureException(payload, {
      level: 'error',
      extra: {...payload},
      tags: {
        interface: 'Broker',
        method: 'Error',
        category: 'infrastructure',
      },
    });

    this.logger.error('Infrastructure broker error', {context: 'Infrastructure', ...payload});
  }
}
