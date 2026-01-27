// infrastructure/jwt/jose/resolver.ts
import {Resolver} from '@/core/di';
import {type Jwt} from '@/port';
import z from 'zod';
import {JoseAdapter} from './adapter';

export class JwtJoseResolver extends Resolver<Jwt> {
  private readonly schema = z.object({
    privateKey: z.string().min(1),
    publicKey: z.string().min(1),
    algorithm: z.enum(['RS256', 'HS256']).default('RS256'),
    issuer: z.string().min(1).default('investor'),
    audience: z.string().min(1).default('investor'),
    accessTTL: z.coerce.number().min(1).default(3600),
    refreshTTL: z.coerce.number().min(1).default(86400),
  });

  async resolve(): Promise<Jwt> {
    const config = await this.schema.parseAsync({
      privateKey: process.env.API_JWT_JOSE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      publicKey: process.env.API_JWT_JOSE_PUBLIC_KEY?.replace(/\\n/g, '\n'),
      algorithm: process.env.API_JWT_JOSE_ALGORITHM ?? 'RS256',
      issuer: process.env.API_JWT_JOSE_ISSUER ?? 'investor',
      audience: process.env.API_JWT_JOSE_AUDIENCE ?? 'investor',
      accessTTL: Number(process.env.API_JWT_JOSE_ACCESS_TTL) || 3600,
      refreshTTL: Number(process.env.API_JWT_JOSE_REFRESH_TTL) || 86400,
    });
    return new JoseAdapter(config);
  }
}
