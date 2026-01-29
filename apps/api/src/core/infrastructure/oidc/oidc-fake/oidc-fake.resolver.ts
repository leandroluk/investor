import {OidcAdapter, OidcResolver} from '#/core/port/oidc';
import {Injectable} from '@nestjs/common';
import {OidcFakeAdapter} from './oidc-fake.adapter';

@Injectable()
export class OidcFakeResolver implements OidcResolver {
  constructor(private readonly adapter: OidcFakeAdapter) {}

  getAdapter(_provider: 'microsoft' | 'google'): OidcAdapter {
    return this.adapter;
  }
}
