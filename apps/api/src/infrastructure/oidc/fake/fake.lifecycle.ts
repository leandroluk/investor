import {TokenPort} from '#/domain/_shared/ports';
import {HttpStatus, Injectable, Logger, OnModuleDestroy, OnModuleInit} from '@nestjs/common';
import * as http from 'node:http';
import {OidcFakeConfig} from './fake.config';

@Injectable()
export class OidcFakeLifecycle implements OnModuleInit, OnModuleDestroy {
  private server?: http.Server;
  private readonly logger = new Logger(OidcFakeLifecycle.name);

  // Initial state that can be modified via POST by the ROBOT
  private state = {
    tokens: {
      accessToken: 'fake_access',
      refreshToken: 'fake_refresh',
    },
    info: {
      id: '019c247b-93e1-76bb-9d0a-d13a572c8af8',
      email: 'ada.lovelace@email.com',
      name: 'Ada Lovelace',
      language: 'en-US',
      timezone: 'UTC',
      hash: 'hash',
    } satisfies TokenPort.Claims,
    picture: Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==',
      'base64'
    ),
  };

  constructor(private readonly oidcFakeConfig: OidcFakeConfig) {}

  onModuleInit(): void {
    this.server = http.createServer(async (req, res) => {
      const {method, url} = req;
      const fullURL = new URL(url || '', `http://localhost:${this.oidcFakeConfig.port}`);

      // --- REDIRECT (Simulates Provider Auth) ---
      if (fullURL.pathname === '/auth') {
        const base64State = fullURL.searchParams.get('state');
        if (base64State) {
          const {provider} = JSON.parse(Buffer.from(base64State, 'base64url').toString('utf8'));
          const redirectPath = {
            google: this.oidcFakeConfig.googleCallback,
            microsoft: this.oidcFakeConfig.microsoftCallback,
          }[provider];
          const redirectURL = `http://localhost:${this.oidcFakeConfig.serverPort}/${redirectPath}?code=fake_code&state=${base64State}`;
          res.statusCode = HttpStatus.TEMPORARY_REDIRECT;
          res.setHeader('Location', redirectURL);
          return res.end();
        }
      }

      // --- CONFIGURATION ROUTES (POST) ---
      if (method === 'POST') {
        const body = await this.getRequestBody(req);
        if (fullURL.pathname === '/token') {
          this.state.tokens = {...this.state.tokens, ...JSON.parse(body)};
          return this.jsonResponse(res, {message: 'Tokens updated'});
        }
        if (fullURL.pathname === '/info') {
          this.state.info = {...this.state.info, ...JSON.parse(body)};
          return this.jsonResponse(res, {message: 'Info updated'});
        }
      }

      // --- CONSUMPTION ROUTES (GET) ---
      if (fullURL.pathname === '/token') {
        return this.jsonResponse(res, this.state.tokens);
      }
      if (fullURL.pathname === '/info') {
        return this.jsonResponse(res, this.state.info);
      }
      if (fullURL.pathname === '/picture') {
        res.setHeader('Content-Type', 'image/png');
        return res.end(this.state.picture);
      }

      res.statusCode = 404;
      res.end();
    });

    this.server.listen(this.oidcFakeConfig.port, () => {
      this.logger.log(`🤖 OIDC Stateful Server running on http://localhost:${this.oidcFakeConfig.port}`);
    });
  }

  onModuleDestroy(): void {
    this.server?.close();
  }

  private jsonResponse(res: http.ServerResponse, data: any): void {
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(data));
  }

  private getRequestBody(req: http.IncomingMessage): Promise<string> {
    return new Promise(res => {
      let b = '';
      req.on('data', c => (b += c));
      req.on('end', () => res(b));
    });
  }
}
