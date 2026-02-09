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
      title: z.string().meta({
        example: 'Investment Confirmed',
        description: 'Title of the notification',
        maxLength: 150,
      }),
      isRead: z.boolean().meta({
        example: false,
        description: 'Read status of the message',
      }),
    })
) {}
