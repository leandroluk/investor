import {type z} from 'zod';

type Mask<T> = Record<Exclude<keyof T, string | number | symbol>, never>;

type Constructor<T extends z.ZodType> = new (data: z.infer<T>) => z.infer<T>;

type Meta<T extends z.ZodType> = {schema: T} & Parameters<z.ZodObject<any, any>['meta']>[0];

export interface Cls<T extends z.ZodObject<any, any>> extends Constructor<T> {
  schema: T;
  parse(data: unknown): z.infer<T>;
  safeParse(data: unknown): z.ZodSafeParseResult<z.infer<T>>;
  pick<Mask extends Record<string, true>>(mask: Mask): Cls<ReturnType<T['pick']>>;
  omit<Mask extends Record<string, true>>(mask: Mask): Cls<ReturnType<T['omit']>>;
  partial(): Cls<ReturnType<T['partial']>>;
  extend<Augmentation extends z.ZodRawShape>(augmentation: Augmentation): Cls<ReturnType<T['extend']>>;
  merge<Incoming extends z.ZodObject<any, any>>(merging: Incoming): Cls<ReturnType<T['merge']>>;
}

export function cls<T extends z.ZodObject<any, any>>({schema, ...meta}: Meta<T>): Cls<T> {
  class SchemaHolder {
    static schema = schema;
    constructor(data: z.infer<T>) {
      Object.assign(this, data);
      SchemaHolder.schema.meta(meta);
    }
    static parse(data: unknown): z.infer<T> {
      return new SchemaHolder(schema.parse(data)) as unknown as z.infer<T>;
    }
    static safeParse(data: unknown): z.ZodSafeParseResult<z.infer<T>> {
      const {success, data: value, error} = schema.safeParse(data);
      return success ? {success, data: new SchemaHolder(value) as unknown as z.infer<T>} : {success, error};
    }
    static pick<U extends Mask<U>>(mask: U, meta?: Meta<T>): Cls<ReturnType<T['pick']>> {
      return cls({schema: schema.pick(mask), ...meta}) as any;
    }
    static omit<U extends Mask<U>>(mask: U, meta?: Meta<T>): Cls<ReturnType<T['omit']>> {
      return cls({schema: schema.omit(mask), ...meta}) as any;
    }
    static partial(meta?: Meta<T>): Cls<ReturnType<T['partial']>> {
      return cls({schema: schema.partial(), ...meta}) as any;
    }
    static extend<U extends z.ZodRawShape>(augmentation: U): Cls<ReturnType<T['extend']>> {
      return cls({schema: schema.extend(augmentation), ...meta}) as any;
    }
  }
  if (meta.id) {
    Object.defineProperty(SchemaHolder, 'name', {value: meta.id});
  }
  return SchemaHolder as any as Cls<T>;
}
