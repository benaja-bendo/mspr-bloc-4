import express, { Request, Response } from 'express';

interface Product {
  id: number;
  name: string;
}

const app = express();
const port = process.env.PORT || 3002;

app.use(express.json());

let products: Product[] = [];

app.get('/products', (_req: Request, res: Response) => {
  res.json(products);
});

app.post('/products', (req: Request, res: Response) => {
  const { id, name } = req.body;
  const product: Product = { id, name };
  products.push(product);
  res.status(201).json(product);
});

app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok' });
});

if (import.meta.url === `file://${process.argv[1]}`) {
  app.listen(port, () => {
    console.log(`service_produits listening on port ${port}`);
  });
}

export default app;