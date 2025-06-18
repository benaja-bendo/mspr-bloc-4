const express = require('express');
const { createKafkaClient } = require('../../libs/kafka/js-client');

let Pool;
try {
  ({ Pool } = require('pg'));
} catch {}

const app = express();
const port = process.env.PORT || 3000;
app.use(express.json());

let clients = [];
let pool;
let producer;

async function init() {
  if (process.env.DATABASE_URL && Pool) {
    pool = new Pool({ connectionString: process.env.DATABASE_URL });
    await pool.query(
      'CREATE TABLE IF NOT EXISTS clients (id SERIAL PRIMARY KEY, name TEXT)'
    );
  }

  if (process.env.KAFKA_BROKER) {
    const kafka = createKafkaClient(process.env.KAFKA_BROKER);
    if (kafka) {
      producer = kafka.producer();
      await producer.connect();
      const consumer = kafka.consumer({ groupId: 'clients-service' });
      await consumer.connect();
      await consumer.subscribe({ topic: 'orders-topic', fromBeginning: true });
      await consumer.run({
        eachMessage: async ({ message }) => {
          console.log(`clients service received: ${message.value}`);
        },
      });
    }
  }
}

app.get('/clients', async (_req, res) => {
  if (pool) {
    const { rows } = await pool.query('SELECT * FROM clients ORDER BY id');
    res.json(rows);
  } else {
    res.json(clients);
  }
});

app.post('/clients', async (req, res) => {
  const { name } = req.body;
  let client;
  if (pool) {
    const result = await pool.query(
      'INSERT INTO clients(name) VALUES($1) RETURNING id, name',
      [name]
    );
    client = result.rows[0];
  } else {
    client = { id: clients.length + 1, name };
    clients.push(client);
  }

  if (producer) {
    await producer.send({
      topic: 'customers-topic',
      messages: [{ value: JSON.stringify({ type: 'customer-created', payload: client }) }],
    });
  }

  res.status(201).json(client);
});

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

if (require.main === module) {
  init().then(() => {
    app.listen(port, () => {
      console.log(`service_clients listening on port ${port}`);
    });
  });
}

module.exports = app;
