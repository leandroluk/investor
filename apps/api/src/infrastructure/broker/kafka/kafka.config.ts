import {Injectable} from '@nestjs/common';
import z from 'zod';

@Injectable()
export class BrokerKafkaConfig {
  static readonly schema = z.object({
    brokers: z
      .string()
      .default('localhost:9092')
      .transform(v => v.split(',').filter(Boolean)),
    clientId: z.string().default('investor'),
    groupId: z.string().default('investor'),
    requestTimeout: z.coerce.number().default(30000),
    enforceRequestTimeout: z.preprocess(v => ['true', '1'].includes(v as any), z.boolean()).default(true),
  });

  constructor() {
    Object.assign(
      this,
      BrokerKafkaConfig.schema.parse({
        brokers: process.env.API_BROKER_KAFKA_BROKERS,
        clientId: process.env.API_BROKER_KAFKA_CLIENT_ID,
        groupId: process.env.API_BROKER_KAFKA_GROUP_ID,
        requestTimeout: process.env.API_BROKER_KAFKA_REQUEST_TIMEOUT,
        enforceRequestTimeout: process.env.API_BROKER_KAFKA_ENFORCE_REQUEST_TIMEOUT,
      })
    );
  }

  readonly brokers!: string[];
  readonly clientId!: string;
  readonly groupId!: string;
  readonly requestTimeout!: number;
  readonly enforceRequestTimeout!: boolean;
}
