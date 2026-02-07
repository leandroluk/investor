import 'fastify';

declare module 'fastify' {
  interface FastifyRequest {
    startTime: Date;
    fingerprint: string;
    user?: {claims: {id: string}};
  }
}
