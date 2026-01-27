// main.ts
import dotenvx from '@dotenvx/dotenvx';
import * as Sentry from '@sentry/node';
import 'reflect-metadata';

import './application';
import {container} from './core/di';
import './domain';
import './infrastructure';
import './port';
import {HttpServer} from './presentation';

dotenvx.config({path: ['../../.env', '.env'], ignore: ['MISSING_ENV_FILE'], quiet: true});

Sentry.init({dsn: process.env.API_TRACE_URL, sendDefaultPii: true});

async function bootstrap(): Promise<void> {
  const server = await container.resolve(HttpServer);
  await server.start(Number(process.env.API_PORT) || 3000);
}

bootstrap().catch(err => [console.error(err), process.exit(1)]);
