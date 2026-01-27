// presentation/http/decorator/index.ts
import {type OpenAPIV3} from 'openapi-types';
import 'reflect-metadata';
import {
  CONTROLLER_METADATA_KEY,
  type ControllerMetadata,
  type HttpMethod,
  ROUTE_METADATA_KEY,
  type RouteMetadata,
} from '../metadata';

export function Controller(prefix: string, tags: string[] = []): ClassDecorator {
  return function (target: any) {
    const metadata: ControllerMetadata = {prefix, tags};
    Reflect.defineMetadata(CONTROLLER_METADATA_KEY, metadata, target);
  };
}

function createRouteDecorator(method: HttpMethod) {
  return function (path: string, schema?: OpenAPIV3.OperationObject): MethodDecorator {
    return function (target: any, propertyKey: string | symbol, descriptor: PropertyDescriptor) {
      if (!descriptor) {
        return;
      }

      const routes: RouteMetadata[] = Reflect.getMetadata(ROUTE_METADATA_KEY, target.constructor) || [];

      routes.push({
        method,
        path,
        schema,
        handlerName: propertyKey,
      });

      Reflect.defineMetadata(ROUTE_METADATA_KEY, routes, target.constructor);
    };
  };
}

export const Get = createRouteDecorator('get');
export const Post = createRouteDecorator('post');
export const Put = createRouteDecorator('put');
export const Delete = createRouteDecorator('delete');
export const Patch = createRouteDecorator('patch');
