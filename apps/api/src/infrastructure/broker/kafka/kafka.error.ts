export class BrokerKafkaError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'BrokerKafkaError';
  }
}
