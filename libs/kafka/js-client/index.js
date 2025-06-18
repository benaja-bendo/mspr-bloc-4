let Kafka;
try {
  ({ Kafka } = require('kafkajs'));
} catch {
  // Kafka library is optional during tests
}

function createKafkaClient(broker) {
  if (!Kafka) return null;
  return new Kafka({ brokers: [broker] });
}

module.exports = { createKafkaClient };
