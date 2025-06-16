const express = require('express');
const app = express();
const port = process.env.PORT || 3001;
app.use(express.json());

let orders = [];

app.get('/orders', (req, res) => {
  res.json(orders);
});

app.post('/orders', (req, res) => {
  const { clientId, productId } = req.body;
  const order = { id: orders.length + 1, clientId, productId };
  orders.push(order);
  res.status(201).json(order);
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

if (require.main === module) {
  app.listen(port, () => {
    console.log(`service_commande listening on port ${port}`);
  });
}

module.exports = app;
