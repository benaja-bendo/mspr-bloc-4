export interface KafkaClient {
  producer: (...args: any[]) => any;
  consumer: (...args: any[]) => any;
}
export function createKafkaClient(broker: string): KafkaClient | null;
