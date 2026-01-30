import {Injectable, Logger, OnModuleDestroy, OnModuleInit} from '@nestjs/common';
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
      subject: 'sub_123',
      email: 'dev@todo4dev.io',
      givenName: 'Leandro',
      familyName: 'Luk',
      custom: {},
    },
    picture: Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==',
      'base64'
    ),
  };

  constructor(private readonly config: OidcFakeConfig) {}

  onModuleInit(): void {
    this.server = http.createServer(async (req, res) => {
      const {method, url} = req;
      const fullUrl = new URL(url || '', `http://localhost:${this.config.port}`);

      // --- REDIRECT (Simulates Provider Auth) ---
      if (fullUrl.pathname === '/auth') {
        const base64State = fullUrl.searchParams.get('state');
        if (base64State) {
          const decoded = JSON.parse(Buffer.from(base64State, 'base64url').toString('utf8'));
          res.statusCode = 302;
          res.setHeader('Location', `${decoded.callbackURL}?code=fake_code&state=${base64State}`);
          return res.end();
        }
      }

      // --- CONFIGURATION ROUTES (POST) ---
      if (method === 'POST') {
        const body = await this.getRequestBody(req);
        if (fullUrl.pathname === '/token') {
          this.state.tokens = {...this.state.tokens, ...JSON.parse(body)};
          return this.jsonResponse(res, {message: 'Tokens updated'});
        }
        if (fullUrl.pathname === '/info') {
          this.state.info = {...this.state.info, ...JSON.parse(body)};
          return this.jsonResponse(res, {message: 'Info updated'});
        }
      }

      // --- CONSUMPTION ROUTES (GET) ---
      if (fullUrl.pathname === '/token') {
        return this.jsonResponse(res, this.state.tokens);
      }
      if (fullUrl.pathname === '/info') {
        return this.jsonResponse(res, this.state.info);
      }
      if (fullUrl.pathname === '/picture') {
        res.setHeader('Content-Type', 'image/png');
        return res.end(this.state.picture);
      }

      res.statusCode = 404;
      res.end();
    });

    this.server.listen(this.config.port, () => {
      this.logger.log(`🤖 OIDC Stateful Server running on http://localhost:${this.config.port}`);
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
