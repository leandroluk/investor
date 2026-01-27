// presentation/http/plugin/swagger-json.ts
import {type FastifyInstance} from 'fastify';
import fastifyPlugin from 'fastify-plugin';
import {type OpenAPIV3} from 'openapi-types';

interface SwaggerJsonOptions {
  basePath: string;
  spec: OpenAPIV3.Document;
}

export const swaggerJsonPlugin = fastifyPlugin(async (app: FastifyInstance, opts: SwaggerJsonOptions) => {
  const {basePath, spec} = opts;

  app.get(basePath, async (_req, _reply) => {
    const enrichedSpec = {
      ...spec,
      info: {
        title: process.env.API_OPENAPI_TITLE || 'API',
        description: process.env.API_OPENAPI_DESCRIPTION,
        version: process.env.API_OPENAPI_VERSION || '1.0.0',
        contact: {
          name: process.env.API_OPENAPI_CONTACT_NAME,
          url: process.env.API_OPENAPI_CONTACT_URL,
          email: process.env.API_OPENAPI_CONTACT_EMAIL,
        },
        license: {
          name: process.env.API_OPENAPI_LICENSE_NAME || 'MIT',
          url: process.env.API_OPENAPI_LICENSE_URL,
        },
      },
      servers: [{url: process.env.API_URL || 'http://localhost:3000'}],
    };
    return enrichedSpec;
  });
});
