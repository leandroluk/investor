// infrastructure/logger/factory.ts
import {factory, Factory} from '@/core/di';
import {Logger} from '@/port';
import {LoggerJsonResolver} from './json/resolver';

export enum LoggerProvider {
  JSON = 'json',
}

@factory(Logger, (process.env.API_LOGGER_PROVIDER ?? LoggerProvider.JSON) as LoggerProvider, {
  [LoggerProvider.JSON]: LoggerJsonResolver,
})
export class LoggerFactory extends Factory<Logger, LoggerProvider> {}
