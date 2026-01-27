// presentation/http/server.ts
import {container, singleton} from '@/core/di/index';
import {Logger} from '@/port';
import Fastify, {type FastifyInstance} from 'fastify';
import * as controllerList from './controller';
import {OpenApiGenerator} from './generator';
import {CONTROLLER_METADATA_KEY, type ControllerMetadata, ROUTE_METADATA_KEY, type RouteMetadata} from './metadata';
import {
  compressPlugin,
  corsPlugin,
  loggerPlugin,
  securityPlugin,
  swaggerJsonPlugin,
  swaggerUiPlugin,
} from './plugin/index';

@singleton()
export class HttpServer {
  private app: FastifyInstance;
  private generator = new OpenApiGenerator();
  private controllers: any[] = Object.values(controllerList);

  constructor(private readonly logger: Logger) {
    this.app = Fastify();
  }

  register(controllers: any[]): void {
    this.controllers.push(...controllers);
  }

  async start(port: number): Promise<void> {
    const openApiSpec = this.generator.generate(this.controllers);

    for (const controllerClass of this.controllers) {
      const controllerInstance = await container.resolve(controllerClass);
      const meta: ControllerMetadata = Reflect.getMetadata(CONTROLLER_METADATA_KEY, controllerClass);
      const routes: RouteMetadata[] = Reflect.getMetadata(ROUTE_METADATA_KEY, controllerClass) || [];

      if (meta) {
        for (const route of routes) {
          const url = `${meta.prefix}${route.path}`.replace(/\/+/g, '/').replace(/\/$/, '') || '/';
          this.app.route({
            method: route.method.toUpperCase() as any,
            url,
            handler: (controllerInstance as any)[route.handlerName].bind(controllerInstance),
          });
        }
      }
    }

    const uiPath = process.env.API_OPENAPI_UI_PATH || '/docs';
    const jsonPath = uiPath + (process.env.API_OPENAPI_JSON_PATH || '/openapi.json');
    const swaggerEnable = ['true', '1'].includes(process.env.API_OPENAPI_ENABLE!);

    await this.app.register(loggerPlugin, {logger: this.logger});
    await this.app.register(securityPlugin);
    await this.app.register(corsPlugin);
    await this.app.register(compressPlugin);
    if (swaggerEnable) {
      await this.app.register(swaggerUiPlugin, {basePath: uiPath, jsonPath});
      await this.app.register(swaggerJsonPlugin, {basePath: jsonPath, spec: openApiSpec});
    }

    try {
      await this.app.listen({port, host: '0.0.0.0'});
      this.logger.info(`Server listening on port ${port}`);
      if (swaggerEnable) {
        this.logger.info(`Swagger UI available at http://localhost:${port}${uiPath}`);
      }
    } catch (error) {
      console.error(error);
      process.exit(1);
    }
  }
}
