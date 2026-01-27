// core/di/metadata.ts
import {type Token} from '../type';
// Circular dependency? container -> metadata -> container.
// metadata.ts only imports TYPE BindingType from container. This is usually fine in TS if using `import type`.
// But to be safe, maybe I should move BindingType to types.ts?  But the user asked me to fix imports, not refactor types blindly.
// I will keep it as is for now: import type from ./container.
import {type BindingType} from './container';

// core/di/metadata.ts
export const FACTORY_METADATA_KEY = Symbol('factory');
export const RESOLVER_METADATA_KEY = Symbol('resolver');
export const SINGLETON_METADATA_KEY = Symbol('singleton');
export const TRANSIENT_METADATA_KEY = Symbol('transient');
export const INJECT_METADATA_KEY = Symbol('inject');

export interface FactoryMetadata {
  token: Token<any>;
}

export interface ResolverMetadata {
  token: Token<any>;
  bindingType: BindingType;
}

export interface InjectionMetadata {
  index: number;
  token: any;
  multiple: boolean;
}
