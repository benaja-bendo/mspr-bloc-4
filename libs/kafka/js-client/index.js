const { Kafka } = require('kafkajs');

function createKafkaClient(broker) {
  return new Kafka({ brokers: [broker] });
}

module.exports = { createKafkaClient };
