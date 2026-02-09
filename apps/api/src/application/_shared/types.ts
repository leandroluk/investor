import z from 'zod';

export const authorizationTokenSchema = z.object({
  tokenType: z.string().meta({
    description: 'Token type',
    example: 'Bearer',
  }),
  accessToken: z.string().meta({
    description: 'Access token',
    example: 'eyJhbGci...',
  }),
  expiresIn: z.number().meta({
    description: 'Expires in',
    example: 3600,
  }),
  refreshToken: z.string().optional().meta({
    description: 'Refresh token',
    example: 'eyJhbGci...',
  }),
});
