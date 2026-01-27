// presentation/http/plugin/compress.ts
import compress from '@fastify/compress';
import {type FastifyInstance} from 'fastify';
import fastifyPlugin from 'fastify-plugin';

export const compressPlugin = fastifyPlugin(async (app: FastifyInstance) => {
  await app.register(compress);
});
