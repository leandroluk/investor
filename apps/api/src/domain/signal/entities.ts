import z from 'zod';
import {createClass} from '../_shared/factories';
import {creatableSchema, indexableSchema} from '../_shared/types';

export class NoticeEntity extends createClass(
  indexableSchema //
    .extend(creatableSchema.shape)
    .extend({
      userId: z.uuid().meta({
        example: '018f3b5e-1234-7000-8000-000000000000',
        description: 'The recipient of the notice',
        format: 'uuid',
      }),
      type: z.string().meta({
        example: 'ALERT',
        description: 'Type of notification (INFO, ALERT, etc)',
        maxLength: 20,
      }),
      title: z.string().meta({
        example: 'Investment Confirmed',
        description: 'Title of the notification',
        maxLength: 150,
      }),
      content: z.string().meta({
        example: 'Your investment of 1000 USDC was confirmed.',
        description: 'Body content of the notification',
      }),
      isRead: z.boolean().default(false).meta({
        example: false,
        description: 'Read status of the message',
      }),
    })
) {}
