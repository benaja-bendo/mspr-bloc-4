import express, { Request, Response } from 'express';

interface Client {
  id: number;
  name: string;
}

const app = express();
const port = process.env.PORT || 3000;
app.use(express.json());

let clients: Client[] = [];

app.get('/clients', (_req: Request, res: Response) => {
  res.json(clients);
});

app.post('/clients', (req: Request, res: Response) => {
  const { name } = req.body;
  const client: Client = { id: clients.length + 1, name };
  clients.push(client);
  res.status(201).json(client);
});

app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok' });
});

if (import.meta.url === `file://${process.argv[1]}`) {
  app.listen(port, () => {
    console.log(`service_clients listening on port ${port}`);
  });
}

export default app;