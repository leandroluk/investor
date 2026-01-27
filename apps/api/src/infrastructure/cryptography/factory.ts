// infrastructure/cryptography/factory.ts
import {factory, Factory} from '@/core/di';
import {Cryptography} from '@/port';
import {CryptographyStdResolver} from './std/resolver';

export enum CryptographyProvider {
  STD = 'std',
}

@factory(Cryptography, (process.env.API_CRYPTOGRAPHY_PROVIDER ?? CryptographyProvider.STD) as CryptographyProvider, {
  [CryptographyProvider.STD]: CryptographyStdResolver,
})
export class CryptographyFactory extends Factory<Cryptography, CryptographyProvider> {}
