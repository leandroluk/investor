// presentation/http/metadata.ts
import {type OpenAPIV3} from 'openapi-types';

export const CONTROLLER_METADATA_KEY = Symbol('controller');
export const ROUTE_METADATA_KEY = Symbol('route');

export type HttpMethod = 'get' | 'post' | 'put' | 'delete' | 'patch' | 'options' | 'head';

export interface ControllerMetadata {
  prefix: string;
  tags?: string[];
}

export interface RouteMetadata {
  method: HttpMethod;
  path: string;
  schema?: OpenAPIV3.OperationObject; // partial schema
  handlerName: string | symbol;
}
