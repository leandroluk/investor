// presentation/http/plugin/swagger-ui.ts
import {type FastifyInstance} from 'fastify';
import fp from 'fastify-plugin';

interface SwaggerUiOptions {
  basePath: string;
  jsonPath: string;
}

export const swaggerUiPlugin = fp(async (app: FastifyInstance, opts: SwaggerUiOptions) => {
  const {basePath, jsonPath} = opts;

  app.get(basePath, async (_req, reply) => {
    reply.type('text/html');
    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>${process.env.API_OPENAPI_TITLE || 'SwaggerUI'}</title>
        <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@5.11.0/swagger-ui.css" />
      </head>
      <body>
        <div id="swagger-ui"></div>
        <script src="https://unpkg.com/swagger-ui-dist@5.11.0/swagger-ui-bundle.js" crossorigin></script>
        <script>
          window.onload = () => {
            window.ui = SwaggerUIBundle({url: '${jsonPath}', dom_id: '#swagger-ui'});
          };
        </script>
      </body>
      </html>`;
  });
});
