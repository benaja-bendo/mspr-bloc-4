import express, { Request, Response } from 'express';
import { createKafkaClient } from '../../../libs/kafka/js-client/index.js';

let Pool: typeof import('pg').Pool | undefined;
try {
  ({ Pool } = await import('pg').then(m => ({ Pool: (m as any).Pool })));
} catch {
  // pg optional
}

interface Category {
  id: number;
  name: string;
}

interface Product {
  id: number;
  name: string;
  categoryId: number;
  stock: number;
  reserved: number;
}

const LOW_STOCK_THRESHOLD = 5;

const app = express();
const port = process.env.PORT || 3002;
app.use(express.json());

let products: Product[] = [];
let categories: Category[] = [];
let pool: import('pg').Pool | undefined;
let producer: any;

async function init() {
  if (process.env.DATABASE_URL && Pool) {
    pool = new Pool({ connectionString: process.env.DATABASE_URL });
    await pool.query(
      'CREATE TABLE IF NOT EXISTS categories (id SERIAL PRIMARY KEY, name TEXT)'
    );
    await pool.query(
      'CREATE TABLE IF NOT EXISTS products (id SERIAL PRIMARY KEY, name TEXT, category_id INT REFERENCES categories(id), stock INT DEFAULT 0, reserved INT DEFAULT 0)'
    );
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
          if (!message.value) return;
          try {
            const evt = JSON.parse(message.value.toString());
            if (evt.type === 'order.created') {
              await reserveStock(evt.payload.productId, evt.payload.quantity);
            } else if (evt.type === 'order.canceled') {
              await releaseStock(evt.payload.productId, evt.payload.quantity);
            }
          } catch (e) {
            console.error('kafka message error', e);
          }
        }
      });
    }
  }
}

async function publish(type: string, payload: any) {
  if (producer) {
    await producer.send({ topic: 'products-topic', messages: [{ value: JSON.stringify({ type, payload }) }] });
  }
}

async function getProducts() {
  if (pool) {
    const { rows } = await pool.query('SELECT * FROM products ORDER BY id');
    return rows;
  }
  return products;
}

async function getProduct(id: number): Promise<Product | undefined> {
  if (pool) {
    const { rows } = await pool.query('SELECT * FROM products WHERE id=$1', [id]);
    return rows[0];
  }
  return products.find(p => p.id === id);
}

async function saveProduct(p: Omit<Product, 'id'> & { id?: number }): Promise<Product> {
  if (pool) {
    if (p.id) {
      const result = await pool.query(
        'UPDATE products SET name=$1, category_id=$2, stock=$3, reserved=$4 WHERE id=$5 RETURNING *',
        [p.name, p.categoryId, p.stock, p.reserved, p.id]
      );
      return result.rows[0];
    } else {
      const result = await pool.query(
        'INSERT INTO products(name, category_id, stock, reserved) VALUES($1,$2,$3,$4) RETURNING *',
        [p.name, p.categoryId, p.stock, p.reserved]
      );
      return result.rows[0];
    }
  }
  if (p.id) {
    const idx = products.findIndex(pr => pr.id === p.id);
    products[idx] = { ...(products[idx] || {}), ...p } as Product;
    return products[idx];
  } else {
    const product: Product = { id: products.length + 1, ...p } as Product;
    products.push(product);
    return product;
  }
}

async function listCategories() {
  if (pool) {
    const { rows } = await pool.query('SELECT * FROM categories ORDER BY id');
    return rows;
  }
  return categories;
}

async function saveCategory(c: Omit<Category, 'id'> & { id?: number }): Promise<Category> {
  if (pool) {
    if (c.id) {
      const result = await pool.query('UPDATE categories SET name=$1 WHERE id=$2 RETURNING *', [c.name, c.id]);
      return result.rows[0];
    } else {
      const result = await pool.query('INSERT INTO categories(name) VALUES($1) RETURNING *', [c.name]);
      return result.rows[0];
    }
  }
  if (c.id) {
    const idx = categories.findIndex(cat => cat.id === c.id);
    categories[idx] = { ...(categories[idx] || {}), ...c } as Category;
    return categories[idx];
  } else {
    const cat: Category = { id: categories.length + 1, ...c } as Category;
    categories.push(cat);
    return cat;
  }
}

async function reserveStock(productId: number, quantity: number) {
  const product = await getProduct(productId);
  if (!product) return;
  if (product.stock - product.reserved < quantity) return;
  product.reserved += quantity;
  await saveProduct(product);
  await publish('product.updated', product);
  if (product.stock - product.reserved < LOW_STOCK_THRESHOLD) {
    await publish('stock.low', { productId: product.id, available: product.stock - product.reserved });
  }
}

async function releaseStock(productId: number, quantity: number) {
  const product = await getProduct(productId);
  if (!product) return;
  product.reserved = Math.max(0, product.reserved - quantity);
  await saveProduct(product);
  await publish('product.updated', product);
}

async function commitStock(productId: number, quantity: number) {
  const product = await getProduct(productId);
  if (!product) return;
  if (product.reserved < quantity) return;
  product.reserved -= quantity;
  product.stock = Math.max(0, product.stock - quantity);
  await saveProduct(product);
  await publish('product.updated', product);
  if (product.stock - product.reserved < LOW_STOCK_THRESHOLD) {
    await publish('stock.low', { productId: product.id, available: product.stock - product.reserved });
  }
}

app.get('/products', async (_req: Request, res: Response) => {
  res.json(await getProducts());
});

app.get('/products/:id', async (req: Request, res: Response) => {
  const product = await getProduct(Number(req.params.id));
  if (!product) return res.sendStatus(404);
  res.json(product);
});

app.post('/products', async (req: Request, res: Response) => {
  const { name, categoryId, stock = 0 } = req.body;
  const product = await saveProduct({ name, categoryId, stock, reserved: 0 });
  await publish('product.updated', product);
  res.status(201).json(product);
});

app.patch('/products/:id', async (req: Request, res: Response) => {
  const current = await getProduct(Number(req.params.id));
  if (!current) return res.sendStatus(404);
  const updated = await saveProduct({ ...current, ...req.body, id: current.id });
  await publish('product.updated', updated);
  res.json(updated);
});

app.post('/stocks/reserve', async (req: Request, res: Response) => {
  const { productId, quantity } = req.body;
  await reserveStock(productId, quantity);
  const product = await getProduct(productId);
  res.json(product);
});

app.post('/stocks/release', async (req: Request, res: Response) => {
  const { productId, quantity } = req.body;
  await releaseStock(productId, quantity);
  const product = await getProduct(productId);
  res.json(product);
});

app.post('/stocks/commit', async (req: Request, res: Response) => {
  const { productId, quantity } = req.body;
  await commitStock(productId, quantity);
  const product = await getProduct(productId);
  res.json(product);
});

app.get('/categories', async (_req: Request, res: Response) => {
  res.json(await listCategories());
});

app.post('/categories', async (req: Request, res: Response) => {
  const cat = await saveCategory({ name: req.body.name });
  res.status(201).json(cat);
});

app.patch('/categories/:id', async (req: Request, res: Response) => {
  const currentList = await listCategories();
  const cat = currentList.find(c => c.id === Number(req.params.id));
  if (!cat) return res.sendStatus(404);
  const updated = await saveCategory({ ...cat, ...req.body, id: cat.id });
  res.json(updated);
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
