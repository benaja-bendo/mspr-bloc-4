import express, { Request, Response } from 'express';
import { createKafkaClient } from '../../libs/kafka/js-client/index.js';

let MongoClient: any;
try {
  ({ MongoClient } = await import('mongodb').then(m => ({ MongoClient: (m as any).MongoClient })));
} catch {
  // mongodb optional
}

interface Product {
  id: number;
  name: string;
}

const app = express();
const port = process.env.PORT || 3002;
app.use(express.json());

let products: Product[] = [];
let client: any;
let collection: any;
let producer: any;

async function init() {
  if (process.env.MONGODB_URI && MongoClient) {
    client = new MongoClient(process.env.MONGODB_URI);
    await client.connect();
    const db = client.db();
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
      await consumer.run({ eachMessage: async ({ message }) => console.log(`products service received: ${message.value}`) });
    }
  }
}

app.get('/products', async (_req: Request, res: Response) => {
  if (collection) {
    const docs = await collection.find().toArray();
    res.json(docs);
  } else {
    res.json(products);
  }
});

app.post('/products', async (req: Request, res: Response) => {
  const { id, name } = req.body;
  let product: Product = { id, name };
  if (collection) {
    await collection.insertOne(product);
  } else {
    products.push(product);
  }

  if (producer) {
    await producer.send({ topic: 'products-topic', messages: [{ value: JSON.stringify({ type: 'product-created', payload: product }) }] });
  }

  res.status(201).json(product);
});

app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok' });
});

if (import.meta.url === `file://${process.argv[1]}`) {
  init().then(() => {
    app.listen(port, () => {
      console.log(`service_produits listening on port ${port}`);
    });
  });
}

export default app;
