import {Retry, Throws, Trace} from '#/application/_shared/decorator';
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
  private readonly kafka: Kafka;
  private readonly producer: Producer;
  private readonly consumer: Consumer;

  constructor(
    private readonly config: BrokerKafkaConfig,
    private readonly eventEmitter: EventEmitter2
  ) {
    /** @see https://kafka.js.org/docs/migration-guide-v2.0.0#producer-new-default-partitioner for details */
    process.env.KAFKAJS_NO_PARTITIONER_WARNING = '1';
    this.kafka = new Kafka({
      brokers: this.config.brokers,
      clientId: this.config.clientId,
      requestTimeout: this.config.requestTimeout,
      enforceRequestTimeout: this.config.enforceRequestTimeout,
      retry: {initialRetryTime: 300, retries: 8, factor: 0.2, multiplier: 2},
      logCreator: () => {
        return ({level, log}): void => {
          if (level === logLevel.ERROR) {
            /**
             * For some reason Kafka does not emit errors or warnings, it uses an internal log.
             * To avoid a dependency on the logger port, the event emitter is used to dispatch
             * the error, which is then captured via monitoring in the application layer.
             */
            this.eventEmitter.emit('infrastructure.broker.error', log);
          }
        };
      },
    });
    this.producer = this.kafka.producer();
    this.consumer = this.kafka.consumer({groupId: this.config.groupId});
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

  @Trace()
  @Retry({attempts: 3, delay: 1000})
  async publish<TPayload extends object = any>(event: DomainEvent<TPayload>): Promise<void> {
    await this.producer.send({
      topic: event.constructor.name,
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
    await this.consumer.subscribe({topics, fromBeginning: true});
  }

  async consume<TPayload extends object = any>(handler: (event: DomainEvent<TPayload>) => void): Promise<void> {
    await this.consumer.run({
      autoCommit: false,
      eachMessage: async ({topic, partition, message}) => {
        try {
          handler(
            Object.assign(new DomainEvent<TPayload>(), {
              name: topic,
              payload: message.value ? JSON.parse(message.value.toString()) : undefined,
              correlationId: message.key ? message.key.toString() : undefined,
              occurredAt: message.timestamp ? new Date(Number(message.timestamp)) : undefined,
            })
          );
          await this.consumer.commitOffsets([{topic, partition, offset: (BigInt(message.offset) + 1n).toString()}]);
        } catch (error) {
          this.eventEmitter.emit('infrastructure.broker.error', error);
        }
      },
    });
  }
}
