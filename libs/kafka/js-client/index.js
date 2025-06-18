let Kafka;
try {
  const kafkajs = await import('kafkajs');
  Kafka = kafkajs.Kafka;
} catch {
  // Kafka library is optional during tests
}

export function createKafkaClient(broker) {
  if (!Kafka) return null;
  return new Kafka({ brokers: [broker] });
}
