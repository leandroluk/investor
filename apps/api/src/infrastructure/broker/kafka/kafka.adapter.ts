import {Retry, Throws} from '#/application/_shared/decorator';
import {DomainEvent} from '#/domain/_shared/event';
import {BrokerPort} from '#/domain/_shared/port';
import {InjectableExisting} from '#/infrastructure/_shared/decorator';
import {EventEmitter2} from '@nestjs/event-emitter';
import {Kafka, logLevel, type Consumer, type Producer} from 'kafkajs';
import {BrokerKafkaConfig} from './kafka.config';
import {BrokerKafkaError} from './kafka.error';

@Throws(BrokerKafkaError)
@InjectableExisting(BrokerPort)
export class BrokerKafkaAdapter implements BrokerPort {
  private readonly ignoredMessagesPattern = [/.*SyncGroup\(.*/];
  private readonly kafka: Kafka;
  private readonly producer: Producer;
  private readonly consumer: Consumer;

  constructor(
    private readonly brokerKafkaConfig: BrokerKafkaConfig,
    private readonly eventEmitter: EventEmitter2
  ) {
    /** @see https://kafka.js.org/docs/migration-guide-v2.0.0#producer-new-default-partitioner for details */
    process.env.KAFKAJS_NO_PARTITIONER_WARNING = '1';
    this.kafka = new Kafka({
      brokers: this.brokerKafkaConfig.brokers,
      clientId: this.brokerKafkaConfig.clientId,
      requestTimeout: this.brokerKafkaConfig.requestTimeout,
      enforceRequestTimeout: this.brokerKafkaConfig.enforceRequestTimeout,
      retry: {initialRetryTime: 300, retries: 8, factor: 0.2, multiplier: 2},
      logCreator: () => {
        return ({level, log}): void => {
          if (level === logLevel.ERROR) {
            /**
             * For some reason Kafka does not emit errors or warnings, it uses an internal log.
             * To avoid a dependency on the logger port, the event emitter is used to dispatch
             * the error, which is then captured via monitoring in the application layer.
             */
            if (this.ignoredMessagesPattern.some(pattern => pattern.test(log.message))) {
              return;
            }
            this.eventEmitter.emit('infrastructure.broker.error', log);
          }
        };
      },
    });
    this.producer = this.kafka.producer();
    this.consumer = this.kafka.consumer({groupId: this.brokerKafkaConfig.groupId});
  }

  private async ensureTopicsExist(...topics: string[]): Promise<void> {
    const admin = this.kafka.admin();
    try {
      await admin.connect();

      const existingTopics = await admin.listTopics();
      const topicsToCreate = topics.filter(topic => !existingTopics.includes(topic));

      if (topicsToCreate.length > 0) {
        await admin.createTopics({
          topics: topicsToCreate.map(topic => ({
            topic,
            numPartitions: 3,
            replicationFactor: 1,
          })),
        });

        /**
         * Kafka does not emit errors or warnings, it uses an internal log.
         * To avoid a dependency on the logger port, the event emitter is used to dispatch
         * the error, which is then captured via monitoring in the application layer.
         */
        for (let attempt = 0; attempt < 10; attempt++) {
          try {
            await admin.fetchTopicMetadata({topics: topicsToCreate});
            return;
          } catch {
            if (attempt === 9) {
              throw new Error(`Topics ${topicsToCreate.join(', ')} were not available after 10 attempts`);
            }
            await new Promise(resolve => setTimeout(resolve, 100));
          }
        }
      }
    } finally {
      await admin.disconnect();
    }
  }

  async ping(): Promise<void> {
    const admin = this.kafka.admin();
    await admin.connect();
    await admin.listTopics();
    await admin.disconnect();
  }

  async connect(): Promise<void> {
    await Promise.all([this.producer.connect(), this.consumer.connect()]);
  }

  async close(): Promise<void> {
    await Promise.all([this.producer.disconnect(), this.consumer.disconnect()]);
  }

  @Retry({attempts: 3, delay: 1000})
  async publish<TPayload extends object = any>(event: DomainEvent<TPayload>): Promise<void> {
    const topic = event.constructor.name;
    await this.ensureTopicsExist(topic);

    await this.producer.send({
      topic,
      messages: [
        {
          key: event.correlationId,
          timestamp: event.occurredAt.getTime().toString(),
          value: JSON.stringify(event.payload),
        },
      ],
    });
  }

  async subscribe(...topics: string[]): Promise<void> {
    await this.ensureTopicsExist(...topics);
    await this.consumer.subscribe({topics, fromBeginning: true});
  }

  async consume<TPayload extends object = any>(handler: (event: DomainEvent<TPayload>) => void): Promise<void> {
    await this.consumer.run({
      autoCommit: false,
      eachMessage: async ({topic, partition, message: {key, timestamp, value, offset}}) => {
        try {
          handler(
            new DomainEvent<TPayload>(
              key?.toString() ?? undefined,
              new Date(Number(timestamp)),
              value ? JSON.parse(value?.toString()) : undefined,
              topic
            )
          );
          await this.consumer.commitOffsets([{topic, partition, offset: (BigInt(offset) + 1n).toString()}]);
        } catch (error) {
          this.eventEmitter.emit('infrastructure.broker.error', error);
        }
      },
    });
  }
}
