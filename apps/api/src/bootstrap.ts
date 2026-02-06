import {NestFactory} from '@nestjs/core';
import {EventEmitter2} from '@nestjs/event-emitter';
import {FastifyAdapter, type NestFastifyApplication} from '@nestjs/platform-fastify';
import {DocumentBuilder, SwaggerModule} from '@nestjs/swagger';
import helmet from 'helmet';
import uuid from 'uuid';
import {AppConfig} from './app.config';
import {AppLogger} from './app.logger';
import {AppModule} from './app.module';

export async function bootstrap(): Promise<void> {
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

  const [logger, config] = await Promise.all([app.resolve(AppLogger), app.resolve(AppConfig)]);

  app.setGlobalPrefix(config.prefix);
  app.useLogger(logger);
  app.use(helmet({contentSecurityPolicy: false}));
  app.enableCors({origin: config.origin.includes('*') ? true : config.origin});

  app
    .getHttpAdapter()
    .getInstance()
    .addHook('onRequest', (req, _, done) => {
      Object.assign(req, {
        startTime: new Date(),
        fingerprint: req.headers['x-fingerprint'] || 'unknown',
      });
      done();
    })
    .addHook('onSend', (req, rpl, value, done) => {
      rpl.header('x-request-id', req.id);
      done(null, value);
    });

  const document = SwaggerModule.createDocument(
    app,
    new DocumentBuilder()
      .setTitle(config.openapi.title)
      .setDescription(config.openapi.description)
      .setContact(config.openapi.contact.name, config.openapi.contact.url, config.openapi.contact.email)
      .setLicense(config.openapi.license.name, config.openapi.license.url)
      .setVersion(config.openapi.version)
      .addBearerAuth()
      .build()
  );

  SwaggerModule.setup(config.prefix, app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      docExpansion: 'none',
      defaultModelExpandDepth: 0,
    },
    customCss: '.topbar{display:none}',
  });

  (globalThis as any).eventEmitter = app.get(EventEmitter2);

  await app.listen(config.port, '0.0.0.0');
  logger.log(`🚀 running on port ${config.port}`);
}
