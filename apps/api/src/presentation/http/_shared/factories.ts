import {type ZodDomainStatic} from '#/domain/_shared/factories';
import {type Type} from '@nestjs/common';
import {ApiProperty, type ApiPropertyOptions} from '@nestjs/swagger';
import uuid from 'uuid';
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
  class NestedDTO {} // NOSONAR

  let uniqueName = `Nested${uuid.v7().split('-')[0]}DTO`;
  if (parentName && fieldName) {
    uniqueName = `${parentName.replace(/DTO$/, '')}${capitalize(fieldName)}DTO`;
  }

  Object.defineProperty(NestedDTO, 'name', {value: uniqueName});

  const shape = schema.shape;
  for (const key of Object.keys(shape)) {
    const options = extractMetadata(shape[key], uniqueName, key);
    ApiProperty(options)(NestedDTO.prototype, key);
  }
  return NestedDTO;
}

function extractMetadata(schema: z.ZodTypeAny, parentName?: string, fieldName?: string): ApiPropertyOptions {
  const options: ApiPropertyOptions = {required: true};
  const {curr, def, type} = unwrapSchema(schema, options);
  resolveType(curr, def, type, options, parentName, fieldName);
  applyValidationChecks(def, type, options);
  if (!options.type && !options.enum) {
    options.type = String;
  }
  return options;
}

function unwrapSchema(schema: any, options: ApiPropertyOptions): {curr: any; def: any; type: any} {
  let curr = schema;
  let def = curr.def || curr._def;
  let type = def?.type || def?.typeName;

  while (curr) {
    def = curr.def || curr._def;
    if (!def) {
      break;
    }

    type = def.type || def.typeName;

    if (def.description) {
      options.description = def.description;
    }

    extractCustomMeta(curr, def, options);

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

  def = curr?.def || curr?._def;
  type = def?.type || def?.typeName;

  return {curr, def, type};
}

function extractCustomMeta(curr: any, def: any, options: ApiPropertyOptions): void {
  const meta = def.meta || curr.meta;
  if (!meta) {
    return;
  }

  if (typeof meta === 'function') {
    try {
      Object.assign(options, meta.call(curr));
    } catch {
      /* ignore */
    }
  } else {
    Object.assign(options, meta);
  }
}

function resolveType(
  curr: any,
  def: any,
  type: string,
  options: ApiPropertyOptions,
  parentName?: string,
  fieldName?: string
): void {
  if (!type) {
    return;
  }

  if (primitiveMap[type]) {
    options.type = primitiveMap[type];
    return;
  }

  switch (type) {
    case 'object': {
      options.type = createNestedDTO(curr as z.ZodObject<any>, parentName || '', fieldName || '');
      break;
    }
    case 'array': {
      options.isArray = true;
      if (curr.element) {
        const inner = extractMetadata(curr.element, parentName, fieldName);
        options.type = inner.type as any;
        if (inner.enum) {
          options.enum = inner.enum;
        }
      }
      break;
    }
    case 'enum': {
      const values = def.values || def.entries;
      if (!options.enum && values) {
        options.enum = Object.values(values);
      }
      options.type = String;
      break;
    }
    case 'any':
    case 'unknown': {
      options.type = Object;
      break;
    }
    case 'date': {
      options.format = 'date-time';
      break;
    }
  }
}

function applyValidationChecks(def: any, type: string, options: ApiPropertyOptions): void {
  if (!def?.checks?.length) {
    return;
  }

  if (type === 'string') {
    applyStringChecks(def.checks, options);
  } else if (type === 'number') {
    applyNumberChecks(def.checks, options);
  }
}

function applyStringChecks(checks: any[], options: ApiPropertyOptions): void {
  for (const check of checks) {
    switch (check.kind) {
      case 'email':
      case 'uuid':
        options.format = check.kind;
        break;
      case 'min':
        options.minLength = check.value;
        break;
      case 'max':
        options.maxLength = check.value;
        break;
    }
  }
}

function applyNumberChecks(checks: any[], options: ApiPropertyOptions): void {
  for (const check of checks) {
    switch (check.kind) {
      case 'min':
        options.minimum = check.value;
        break;
      case 'max':
        options.maximum = check.value;
        break;
      case 'int':
        options.type = 'integer';
        break;
    }
  }
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
    ParentClass = class {}; // NOSONAR
    Schema = input;
  }

  class DTO extends ParentClass {
    static readonly schema = Schema;

    static create(data: any): any {
      const parsed = Schema.parse(data);
      const instance = new DTO();
      Object.assign(instance, parsed);
      return instance;
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
