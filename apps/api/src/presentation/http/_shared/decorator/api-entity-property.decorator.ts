import {ApiProperty, type ApiPropertyOptions} from '@nestjs/swagger';

export function ApiEntityProperty(
  entity: Function,
  field: string,
  options: ApiPropertyOptions = {}
): PropertyDecorator {
  return (target: object, propertyKey: string | symbol) => {
    const metadata = Reflect.getMetadata('swagger/apiModelProperties', entity.prototype, field) || {};
    ApiProperty({...metadata, ...options})(target, propertyKey);
  };
}
