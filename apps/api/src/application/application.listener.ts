import {LoggerPort} from '#/domain/_shared/ports';
import {Injectable} from '@nestjs/common';
import {OnEvent} from '@nestjs/event-emitter';
import ms from 'ms';

@Injectable()
export class ApplicationListener {
  constructor(private readonly loggerPort: LoggerPort) {}

  @OnEvent('monitor.trace')
  handleTrace(payload: {className: string; methodName: string; duration: number; timestamp: Date}): void {
    const duration = ms(Number(payload.duration.toFixed(2)));
    const message = `[Trace] ${payload.className}.${payload.methodName} took ${duration}`;

    this.loggerPort.info(message, {
      context: 'Performance',
      labels: {category: 'performance', interface: payload.className, method: payload.methodName},
      ...payload,
      duration,
    });
  }

  @OnEvent('monitor.retry')
  handleRetry(payload: {className: string; methodName: string; attempt: number; error: any}): void {
    const message = `[Retry] ${payload.className}.${payload.methodName} - Attempt ${payload.attempt + 1}`;
    const errorMessage = payload.error?.message || 'Unknown error';

    this.loggerPort.warn(`${message} due to error: ${errorMessage}`, {
      context: 'Resiliency',
      labels: {category: 'resiliency', attempt: (payload.attempt + 1).toString()},
      ...payload,
      error_details: errorMessage,
    });
  }

  @OnEvent('infrastructure.broker.error')
  handleInfrastructureBrokerError(payload: any): void {
    const error = payload instanceof Error ? payload : new Error('Infrastructure broker error');

    this.loggerPort.error('Infrastructure broker error', error, {
      context: 'Infrastructure',
      labels: {interface: 'Broker', category: 'infrastructure'},
      ...payload,
    });
  }
}
