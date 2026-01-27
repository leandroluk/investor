// infrastructure/jwt/factory.ts
import {factory, Factory} from '@/core/di';
import {Jwt} from '@/port';
import {JwtJoseResolver} from './jose/resolver';

export enum JwtProvider {
  JOSE = 'jose',
}

@factory(Jwt, (process.env.API_JWT_PROVIDER ?? JwtProvider.JOSE) as JwtProvider, {
  [JwtProvider.JOSE]: JwtJoseResolver,
})
export class JwtFactory extends Factory<Jwt, JwtProvider> {}
