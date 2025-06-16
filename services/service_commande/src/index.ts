import express, { Request, Response } from 'express';

interface Order {
  id: number;
  clientId: number;
  productId: number;
}

const app = express();
const port = process.env.PORT || 3001;
app.use(express.json());

let orders: Order[] = [];

app.get('/orders', (_req: Request, res: Response) => {
  res.json(orders);
});

app.post('/orders', (req: Request, res: Response) => {
  const { clientId, productId } = req.body;
  const order: Order = { id: orders.length + 1, clientId, productId };
  orders.push(order);
  res.status(201).json(order);
});

app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok' });
});

if (import.meta.url === `file://${process.argv[1]}`) {
  app.listen(port, () => {
    console.log(`service_commande listening on port ${port}`);
  });
}

export default app;