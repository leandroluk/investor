import {type Type} from '@nestjs/common';
import {ApiProperty, type ApiPropertyOptions} from '@nestjs/swagger';

export function ApiPropertyOf(
  reference: (new () => object) | (abstract new () => object) | Type<any>,
  fieldProperty: string,
  options: ApiPropertyOptions = {}
): PropertyDecorator {
  return (target: object, propertyKey: string | symbol) => {
    const metadata = Reflect.getMetadata('swagger/apiModelProperties', reference.prototype, fieldProperty) || {};
    ApiProperty({...metadata, ...options})(target, propertyKey);
  };
}
