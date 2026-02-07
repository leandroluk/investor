import {Injectable} from '@nestjs/common';
import {Algorithm} from 'jsonwebtoken';
import z from 'zod';

@Injectable()
export class TokenJwtConfig {
  static readonly schema = z.object({
    algorithm: z.enum(['HS256', 'RS256']).default('HS256'),
    issuer: z.string().default('http://localhost:3000'),
    audience: z.string().default('http://localhost:3000'),
    privateKey: z.string().default('secret'),
    publicKey: z.string().default('secret'),
    accessTTL: z.coerce.number().default(60 * 60 * 24),
    refreshTTL: z.coerce.number().default(60 * 60 * 24 * 7),
  });

  constructor() {
    Object.assign(
      this,
      TokenJwtConfig.schema.parse({
        algorithm: process.env.API_TOKEN_JWT_ALGORITHM,
        issuer: process.env.API_TOKEN_JWT_ISSUER,
        audience: process.env.API_TOKEN_JWT_AUDIENCE,
        privateKey: process.env.API_TOKEN_JWT_PRIVATE_KEY,
        publicKey: process.env.API_TOKEN_JWT_PUBLIC_KEY,
        accessTTL: process.env.API_TOKEN_JWT_ACCESS_TTL,
        refreshTTL: process.env.API_TOKEN_JWT_REFRESH_TTL,
      })
    );
  }

  algorithm!: Algorithm;
  issuer!: string;
  audience!: string;
  privateKey!: string;
  publicKey!: string;
  accessTTL!: number;
  refreshTTL!: number;
}
