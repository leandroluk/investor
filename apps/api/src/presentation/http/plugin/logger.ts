// presentation/http/plugin/logger.ts
import {type FastifyInstance} from 'fastify';
import fastifyPlugin from 'fastify-plugin';
import {type Logger} from '../../../port/logger';

interface LoggerPluginOptions {
  logger: Logger;
}

export const loggerPlugin = fastifyPlugin(async (app: FastifyInstance, opts: LoggerPluginOptions) => {
  const {logger} = opts;

  app.addHook('onRequest', async req => {
    logger.info(`[HTTP] Incoming Request: ${req.method} ${req.url}`, {
      method: req.method,
      url: req.url,
      ip: req.ip,
      userAgent: req.headers['user-agent'],
    });
  });

  app.addHook('onResponse', async (req, reply) => {
    logger.info(`[HTTP] Request Completed: ${req.method} ${req.url} ${reply.statusCode}`, {
      method: req.method,
      url: req.url,
      statusCode: reply.statusCode,
      duration: reply.elapsedTime,
    });
  });

  app.addHook('onError', async (req, reply, error) => {
    logger.error(`[HTTP] Request Error: ${req.method} ${req.url}`, error, {
      method: req.method,
      url: req.url,
      stack: error.stack,
    });
  });
});
