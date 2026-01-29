// src/core/presentation/http/fastify.setup.ts
import {type NestFastifyApplication} from '@nestjs/platform-fastify';

export function setupFastifyDrivingAdapter(app: NestFastifyApplication): void {
  const instance = app.getHttpAdapter().getInstance();

  instance.addHook('onRequest', (request, _reply, done) => {
    (request as any).startTime = new Date();
    done();
  });

  instance.addHook('onSend', (request, reply, payload, done) => {
    reply.header('x-request-id', request.id);
    done(null, payload);
  });
}
