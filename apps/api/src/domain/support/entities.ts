import z from 'zod';
import {createClass} from '../_shared/factories';
import {creatableSchema, indexableSchema, updatableSchema} from '../_shared/types';
import {TicketStatusEnum} from './enums';

export class TicketEntity extends createClass(
  indexableSchema
    .extend(creatableSchema.shape)
    .extend(updatableSchema.shape)
    .extend({
      userId: z.uuid().meta({
        example: '018f3b5e-1234-7000-8000-000000000000',
        description: 'The user who opened the ticket',
        format: 'uuid',
      }),
      subject: z.string().meta({
        example: 'Unable to withdraw funds',
        description: 'Subject of the support request',
        maxLength: 150,
      }),
      message: z.string().meta({
        example: 'I am getting an error when trying to confirm my 2FA code during withdrawal.',
        description: 'Detailed description of the issue or feedback',
      }),
      status: z.enum(TicketStatusEnum).meta({
        example: 'OPEN',
        description: 'Current status of the support request',
        maxLength: 20,
      }),
    })
) {}
