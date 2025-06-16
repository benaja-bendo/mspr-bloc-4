const express = require('express');
const app = express();
const port = process.env.PORT || 3002;

app.use(express.json());

let products = [];

app.get('/products', (req, res) => {
  res.json(products);
});

app.post('/products', (req, res) => {
  const { id, name } = req.body;
  const product = { id, name };
  products.push(product);
  res.status(201).json(product);
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

if (require.main === module) {
  app.listen(port, () => {
    console.log(`service_produits listening on port ${port}`);
  });
}

module.exports = app;
