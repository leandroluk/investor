// presentation/http/plugin/cors.ts
import cors from '@fastify/cors';
import {type FastifyInstance} from 'fastify';
import fastifyPlugin from 'fastify-plugin';

export const corsPlugin = fastifyPlugin(async (app: FastifyInstance) => {
  await app.register(cors);
});
