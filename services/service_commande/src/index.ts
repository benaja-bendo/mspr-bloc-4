import express, { Request, Response } from "express";
import { createKafkaClient } from "../../../libs/kafka/js-client/index.js";

let Pool: typeof import("pg").Pool | undefined;
try {
  ({ Pool } = await import("pg").then((m) => ({ Pool: (m as any).Pool })));
} catch {
  // pg optional
}

interface Order {
  id: number;
  clientId: number;
  productId: number;
}

const app = express();
const port = process.env.PORT || 3001;
app.use(express.json());

let orders: Order[] = [];
let pool: import("pg").Pool | undefined;
let producer: any;

async function init() {
  if (process.env.DATABASE_URL && Pool) {
    pool = new Pool({ connectionString: process.env.DATABASE_URL });
    await pool.query(
      "CREATE TABLE IF NOT EXISTS orders (id SERIAL PRIMARY KEY, clientId INT, productId INT)"
    );
  }

  if (process.env.KAFKA_BROKER) {
    const kafka = createKafkaClient(process.env.KAFKA_BROKER);
    if (kafka) {
      producer = kafka.producer();
      await producer.connect();
      const consumer = kafka.consumer({ groupId: "orders-service" });
      await consumer.connect();
      await consumer.subscribe({
        topic: "products-topic",
        fromBeginning: true,
      });
      await consumer.subscribe({
        topic: "customers-topic",
        fromBeginning: true,
      });
      await consumer.run({
        eachMessage: async ({ message }) =>
          console.log(`orders service received: ${message.value}`),
      });
    }
  }
}

app.get("/orders", async (_req: Request, res: Response) => {
  if (pool) {
    const { rows } = await pool.query("SELECT * FROM orders ORDER BY id");
    res.json(rows);
  } else {
    res.json(orders);
  }
});

app.post("/orders", async (req: Request, res: Response) => {
  const { clientId, productId } = req.body;
  let order: Order;
  if (pool) {
    const result = await pool.query(
      "INSERT INTO orders(clientId, productId) VALUES($1,$2) RETURNING id, clientId, productId",
      [clientId, productId]
    );
    order = result.rows[0];
  } else {
    order = { id: orders.length + 1, clientId, productId };
    orders.push(order);
  }

  if (producer) {
    await producer.send({
      topic: "orders-topic",
      messages: [
        { value: JSON.stringify({ type: "order-created", payload: order }) },
      ],
    });
  }

  res.status(201).json(order);
});

app.get("/health", (_req: Request, res: Response) => {
  res.json({ status: "ok" });
});

if (import.meta.url === `file://${process.argv[1]}`) {
  init().then(() => {
    app.listen(port, () => {
      console.log(`service_commande listening on port ${port}`);
    });
  });
}

export default app;
