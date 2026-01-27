// presentation/http/plugin/security.ts
import helmet from '@fastify/helmet';
import {type FastifyInstance} from 'fastify';
import fastifyPlugin from 'fastify-plugin';

export const securityPlugin = fastifyPlugin(async (app: FastifyInstance) => {
  await app.register(helmet, {
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'", 'unpkg.com'], // Allow Swagger UI
        styleSrc: ["'self'", "'unsafe-inline'", 'unpkg.com'], // Allow Swagger UI
        imgSrc: ["'self'", 'data:', 'fastify.dev'],
      },
    },
  });
});
