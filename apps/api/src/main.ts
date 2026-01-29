import dotenvx from '@dotenvx/dotenvx';
import {NestFactory} from '@nestjs/core';
import {EventEmitter2} from '@nestjs/event-emitter';
import {FastifyAdapter, type NestFastifyApplication} from '@nestjs/platform-fastify';
import helmet from 'helmet';
import uuid from 'uuid';
import {AppLogger} from './app.logger';
import {AppModule} from './app.module';
import {setupFastifyDrivingAdapter} from './core/presentation/http/fastify.setup';
import {DomainExceptionFilter} from './core/presentation/http/filter/domain-exception.filter';

dotenvx.config({path: ['.env', '../.env', '../../.env'], ignore: ['MISSING_ENV_FILE'], quiet: true});

const port = process.env.API_PORT || process.env.PORT || 3000;
const prefix = process.env.API_PREFIX || '/';

async function bootstrap(): Promise<void> {
  const adapter = new FastifyAdapter({
    requestIdHeader: 'x-request-id',
    routerOptions: {ignoreTrailingSlash: true},
    genReqId: (req): string => {
      const incomingId = req.headers['x-request-id'];
      return (Array.isArray(incomingId) ? incomingId[0] : incomingId) || uuid.v7();
    },
  });
  const app = await NestFactory.create<NestFastifyApplication>(AppModule, adapter, {
    logger: ['error', 'warn'],
  });
  const logger = await app.resolve(AppLogger);

  app.setGlobalPrefix(prefix);
  app.useLogger(logger);
  app.useGlobalFilters(new DomainExceptionFilter());
  app.use(helmet({contentSecurityPolicy: false}));

  setupFastifyDrivingAdapter(app);

  (globalThis as any).eventEmitter = app.get(EventEmitter2);

  await app.listen(port);
  logger.log(`🚀 running on port ${port}`);
}
void bootstrap();
