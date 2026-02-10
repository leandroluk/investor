import {z} from 'zod';

export type ZodConstructor<T extends z.ZodTypeAny> = new (...args: any[]) => z.output<T>;

export interface ZodDomainStatic<T extends z.ZodTypeAny> extends ZodConstructor<T> {
  schema: T;
  ['new'](input: z.input<T>): z.output<T>;
}

function getUnderlyingObject(schema: z.ZodTypeAny): z.ZodObject<any> {
  let curr = schema as any;
  while (true) {
    const def = curr.def;
    if (!def) {
      throw new Error('createClass: Schema definition missing.');
    }

    const type = def.type || def.typeName;

    if (type === 'object' || type === 'ZodObject') {
      return curr as z.ZodObject<any>;
    } else if (type === 'effect' || type === 'ZodEffects' || type === 'ZodEffect') {
      curr = def.schema;
    } else {
      throw new Error(`createClass: Invalid schema type: ${type}`);
    }
  }
}

export function createClass<T extends z.ZodTypeAny>(schema: T): ZodDomainStatic<T>;

export function createClass<Base extends ZodDomainStatic<z.ZodObject<any>>, Extension extends z.ZodObject<any>>(
  parent: Base,
  schema: Extension
): ZodDomainStatic<z.ZodObject<Base['schema']['shape'] & Extension['shape']>>;

export function createClass(schemaOrParent: any, maybeSchema: any = z.object({})): any {
  let finalSchema: z.ZodObject<any>;
  let ParentClass: any = Object;

  if (typeof schemaOrParent === 'function' && 'schema' in schemaOrParent) {
    ParentClass = schemaOrParent;
    const baseObject = getUnderlyingObject(ParentClass.schema);
    finalSchema = baseObject.extend(maybeSchema.shape);
  } else {
    finalSchema = schemaOrParent;
  }

  class GeneratedClass extends ParentClass {
    static readonly schema = finalSchema;

    static new(input: any): any {
      const parsed = finalSchema.parse(input);
      const instance = new this();
      Object.assign(instance, parsed);
      return instance;
    }
  }

  return GeneratedClass;
}
