import {Injectable} from '@nestjs/common';
import z from 'zod';

@Injectable()
export class AppConfig {
  static readonly schema = z.object({
    name: z.string().default('investor-api'),
    port: z.coerce.number().default(20000),
    prefix: z.string().default('/'),
    origin: z
      .string()
      .transform(v => v.split(',').map(origin => origin.trim()))
      .default(['*']),
    host: z.string().default('http://localhost'),
    url: z.string().default('${API_HOST}: ${API_PORT}${API_PREFIX}'),
    openapi: z.object({
      enable: z.preprocess(v => ['true', '1'].includes(v as any), z.boolean()).default(true),
      uiPath: z.string().default('/docs'),
      jsonPath: z.string().default('/openapi.json'),
      title: z.string().default('Investor API'),
      description: z.string().default('Investor API for managing resources and configurations of the Investor system.'),
      contact: z.object({
        name: z.string().default('Leandro Santiago Gomes'),
        url: z.string().default('https://github.com/leandroluk'),
        email: z.string().default('leandroluk@gmail.com'),
      }),
      license: z.object({
        name: z.string().default('MIT'),
        url: z.string().default('https://opensource.org/licenses/MIT'),
      }),
      version: z.string().default('1.0.0'),
    }),
  });

  constructor() {
    Object.assign(
      this,
      AppConfig.schema.parse({
        name: process.env.API_NAME,
        port: process.env.API_PORT,
        prefix: process.env.API_PREFIX,
        origin: process.env.API_ORIGIN,
        host: process.env.API_HOST,
        url: process.env.API_URL,
        openapi: {
          enable: process.env.API_OPENAPI_ENABLE,
          uiPath: process.env.API_OPENAPI_UI_PATH,
          jsonPath: process.env.API_OPENAPI_JSON_PATH,
          title: process.env.API_OPENAPI_TITLE,
          description: process.env.API_OPENAPI_DESCRIPTION,
          contact: {
            name: process.env.API_OPENAPI_CONTACT_NAME,
            url: process.env.API_OPENAPI_CONTACT_URL,
            email: process.env.API_OPENAPI_CONTACT_EMAIL,
          },
          license: {
            name: process.env.API_OPENAPI_LICENSE_NAME,
            url: process.env.API_OPENAPI_LICENSE_URL,
          },
          version: process.env.API_OPENAPI_VERSION,
        },
      })
    );
  }

  name!: string;
  port!: number;
  prefix!: string;
  origin!: string[];
  host!: string;
  url!: string;
  openapi!: {
    enable: boolean;
    uiPath: string;
    jsonPath: string;
    title: string;
    description: string;
    contact: {name: string; url: string; email: string};
    license: {name: string; url: string};
    version: string;
  };
}
