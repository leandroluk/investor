import 'fastify';

declare module 'fastify' {
  interface FastifyRequest {
    startTime: Date;
    fingerprint: string;
  }
}
