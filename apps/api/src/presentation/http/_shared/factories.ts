import {type ZodDomainStatic} from '#/domain/_shared/factories';
import {type Type} from '@nestjs/common';
import {ApiProperty, type ApiPropertyOptions} from '@nestjs/swagger';
import {v7 as uuidv7} from 'uuid';
import {type z} from 'zod';

const primitiveMap: Record<string, any> = {
  string: String,
  number: Number,
  boolean: Boolean,
  date: String,
  bigint: Number,
};

function capitalize(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function createNestedDTO(schema: z.ZodObject<any>, parentName: string, fieldName: string): Type<any> {
  class NestedDto {}

  let uniqueName = `Nested${uuidv7().split('-')[0]}DTO`;
  if (parentName && fieldName) {
    uniqueName = `${parentName.replace(/DTO$/, '')}${capitalize(fieldName)}DTO`;
  }

  Object.defineProperty(NestedDto, 'name', {value: uniqueName});

  const shape = schema.shape;
  for (const key of Object.keys(shape)) {
    const options = extractMetadata(shape[key], uniqueName, key);
    ApiProperty(options)(NestedDto.prototype, key);
  }
  return NestedDto;
}

function extractMetadata(schema: z.ZodTypeAny, parentName?: string, fieldName?: string): ApiPropertyOptions {
  const options: ApiPropertyOptions = {required: true};
  let curr = schema as any;

  while (curr) {
    const def = curr.def || curr._def;
    if (!def) {
      break;
    }

    const type = def.type || def.typeName;

    if (def.description) {
      options.description = def.description;
    }

    const meta = def.meta || (curr._def && curr._def.meta) || curr.meta;
    if (meta) {
      if (typeof meta === 'function') {
        try {
          Object.assign(options, meta.call(curr));
        } catch {
          // no need catch it
        }
      } else {
        Object.assign(options, meta);
      }
    }

    if (['optional', 'nullable'].includes(type)) {
      options.required = false;
      curr = curr.unwrap();
    } else if (type === 'default') {
      curr = def.innerType;
    } else if (type === 'effect') {
      curr = def.schema;
    } else if (type === 'pipeline') {
      curr = def.in;
    } else if (['branded', 'readonly', 'catch'].includes(type)) {
      curr = curr.unwrap ? curr.unwrap() : def.innerType || def.schema;
    } else {
      break;
    }
  }

  const def = curr?.def || curr?._def;
  const type = def?.type || def?.typeName;

  if (type && primitiveMap[type]) {
    options.type = primitiveMap[type];
  } else if (type === 'object') {
    options.type = createNestedDTO(curr as z.ZodObject<any>, parentName || '', fieldName || '');
  } else if (type === 'array') {
    options.isArray = true;
    if (curr.element) {
      const innerOptions = extractMetadata(curr.element, parentName, fieldName);
      options.type = innerOptions.type as any;
      if (innerOptions.enum) {
        options.enum = innerOptions.enum;
      }
    }
  } else if (type === 'enum') {
    const values = def.values || def.entries;
    if (!options.enum && values) {
      options.enum = Object.values(values);
    }
    options.type = String;
  } else if (['any', 'unknown'].includes(type)) {
    options.type = Object;
  }

  if (type === 'date') {
    options.format = 'date-time';
  } else if (type === 'string') {
    for (const check of def.checks || []) {
      if (check.kind === 'email') {
        options.format = 'email';
      }
      if (check.kind === 'uuid') {
        options.format = 'uuid';
      }
      if (check.kind === 'min') {
        options.minLength = check.value;
      }
      if (check.kind === 'max') {
        options.maxLength = check.value;
      }
    }
  } else if (type === 'number') {
    for (const check of def.checks || []) {
      if (check.kind === 'min') {
        options.minimum = check.value;
      }
      if (check.kind === 'max') {
        options.maximum = check.value;
      }
      if (check.kind === 'int') {
        options.type = 'integer';
      }
    }
  }

  if (!options.type && !options.enum) {
    options.type = String;
  }

  return options;
}

export function createDTO<T extends ZodDomainStatic<any>>(parent: T): T;
export function createDTO<T extends z.ZodObject<any>>(schema: T): ZodDomainStatic<T>;
export function createDTO(input: any): any {
  let Schema: z.ZodObject<any>;
  let ParentClass: any;

  if ('schema' in input && typeof input === 'function') {
    ParentClass = input;
    Schema = input.schema;
  } else {
    ParentClass = class {};
    Schema = input;
  }

  class DTO extends ParentClass {
    static schema = Schema;

    static create(data: any): any {
      const parsed = Schema.parse(data);
      const instance = new DTO();
      Object.assign(instance, parsed);
      return instance;
    }

    constructor(...args: any[]) {
      super(...args);
    }
  }

  const nameBase = ParentClass.name && ParentClass.name !== 'ParentClass' ? ParentClass.name : 'Generated';
  const dtoName = `${nameBase}DTO`;

  Object.defineProperty(DTO, 'name', {value: dtoName});

  if (!Schema || !('shape' in Schema)) {
    return DTO;
  }

  const shape = Schema.shape;
  for (const key of Object.keys(shape)) {
    const fieldSchema = shape[key];
    const options = extractMetadata(fieldSchema, dtoName, key);
    ApiProperty(options)(DTO.prototype, key);
  }

  return DTO;
}
