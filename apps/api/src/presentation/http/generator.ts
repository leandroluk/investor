// presentation/http/generator.ts
import {type OpenAPIV3} from 'openapi-types';
import 'reflect-metadata';
import {type Constructor} from '../../core/type';
import {CONTROLLER_METADATA_KEY, type ControllerMetadata, ROUTE_METADATA_KEY, type RouteMetadata} from './metadata';

export class OpenApiGenerator {
  generate(controllers: Constructor<any>[]): OpenAPIV3.Document {
    const paths: OpenAPIV3.PathsObject = {};
    const tags: Set<string> = new Set();

    for (const controller of controllers) {
      const controllerMeta: ControllerMetadata = Reflect.getMetadata(CONTROLLER_METADATA_KEY, controller);
      const routes: RouteMetadata[] = Reflect.getMetadata(ROUTE_METADATA_KEY, controller) || [];

      if (!controllerMeta) {
        continue;
      }

      if (controllerMeta.tags) {
        controllerMeta.tags.forEach(t => tags.add(t));
      }

      for (const route of routes) {
        const fullPath = this.normalizePath(`${controllerMeta.prefix}${route.path}`);

        if (!paths[fullPath]) {
          paths[fullPath] = {};
        }

        const operation: OpenAPIV3.OperationObject = {
          tags: controllerMeta.tags,
          ...route.schema,
          responses: route.schema?.responses || {
            200: {description: 'Successful Response'},
          },
        };

        (paths[fullPath] as any)[route.method] = operation;
      }
    }

    return {
      openapi: '3.0.0',
      info: {
        title: 'Investor API',
        version: '1.0.0',
      },
      paths,
      tags: Array.from(tags).map(name => ({name})),
      components: {
        securitySchemes: {
          bearerAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT',
          },
        },
      },
    };
  }

  private normalizePath(path: string): string {
    return path.replace(/\/+/g, '/').replace(/\/$/, '') || '/';
  }
}
