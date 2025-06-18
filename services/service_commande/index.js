const express = require('express');
const { createKafkaClient } = require('../../libs/kafka/js-client');

let Pool;
try {
  ({ Pool } = require('pg'));
} catch {}

const app = express();
const port = process.env.PORT || 3001;
app.use(express.json());

let orders = [];
let pool;
let producer;

async function init() {
  if (process.env.DATABASE_URL && Pool) {
    pool = new Pool({ connectionString: process.env.DATABASE_URL });
    await pool.query(
      'CREATE TABLE IF NOT EXISTS orders (id SERIAL PRIMARY KEY, clientId INT, productId INT)'
    );
  }

  if (process.env.KAFKA_BROKER) {
    const kafka = createKafkaClient(process.env.KAFKA_BROKER);
    if (kafka) {
      producer = kafka.producer();
      await producer.connect();
      const consumer = kafka.consumer({ groupId: 'orders-service' });
      await consumer.connect();
      await consumer.subscribe({ topic: 'products-topic', fromBeginning: true });
      await consumer.subscribe({ topic: 'customers-topic', fromBeginning: true });
      await consumer.run({
        eachMessage: async ({ message }) => {
          console.log(`orders service received: ${message.value}`);
        },
      });
    }
  }
}

app.get('/orders', async (_req, res) => {
  if (pool) {
    const { rows } = await pool.query('SELECT * FROM orders ORDER BY id');
    res.json(rows);
  } else {
    res.json(orders);
  }
});

app.post('/orders', async (req, res) => {
  const { clientId, productId } = req.body;
  let order;
  if (pool) {
    const result = await pool.query(
      'INSERT INTO orders(clientId, productId) VALUES($1,$2) RETURNING id, clientId, productId',
      [clientId, productId]
    );
    order = result.rows[0];
  } else {
    order = { id: orders.length + 1, clientId, productId };
    orders.push(order);
  }

  if (producer) {
    await producer.send({
      topic: 'orders-topic',
      messages: [{ value: JSON.stringify({ type: 'order-created', payload: order }) }],
    });
  }

  res.status(201).json(order);
});

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

if (require.main === module) {
  init().then(() => {
    app.listen(port, () => {
      console.log(`service_commande listening on port ${port}`);
    });
  });
}

module.exports = app;
