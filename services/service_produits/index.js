const express = require('express');
const { createKafkaClient } = require('../../libs/kafka/js-client');

let MongoClient;
try {
  ({ MongoClient } = require('mongodb'));
} catch {}

const app = express();
const port = process.env.PORT || 3002;

app.use(express.json());

let products = [];
let mongo;
let collection;
let producer;

async function init() {
  if (process.env.MONGODB_URI && MongoClient) {
    mongo = new MongoClient(process.env.MONGODB_URI);
    await mongo.connect();
    const db = mongo.db();
    collection = db.collection('products');
  }

  if (process.env.KAFKA_BROKER) {
    const kafka = createKafkaClient(process.env.KAFKA_BROKER);
    if (kafka) {
      producer = kafka.producer();
      await producer.connect();
      const consumer = kafka.consumer({ groupId: 'products-service' });
      await consumer.connect();
      await consumer.subscribe({ topic: 'orders-topic', fromBeginning: true });
      await consumer.run({
        eachMessage: async ({ message }) => {
          console.log(`products service received: ${message.value}`);
        },
      });
    }
  }
}

app.get('/products', async (_req, res) => {
  if (collection) {
    const docs = await collection.find().toArray();
    res.json(docs);
  } else {
    res.json(products);
  }
});

app.post('/products', async (req, res) => {
  const { id, name } = req.body;
  let product;
  if (collection) {
    product = { id, name };
    await collection.insertOne(product);
  } else {
    product = { id, name };
    products.push(product);
  }

  if (producer) {
    await producer.send({
      topic: 'products-topic',
      messages: [{ value: JSON.stringify({ type: 'product-created', payload: product }) }],
    });
  }

  res.status(201).json(product);
});

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

if (require.main === module) {
  init().then(() => {
    app.listen(port, () => {
      console.log(`service_produits listening on port ${port}`);
    });
  });
}

module.exports = app;
