const express = require('express');
const app = express();
const port = process.env.PORT || 3000;
app.use(express.json());

let clients = [];

app.get('/clients', (req, res) => {
  res.json(clients);
});

app.post('/clients', (req, res) => {
  const { name } = req.body;
  const client = { id: clients.length + 1, name };
  clients.push(client);
  res.status(201).json(client);
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

if (require.main === module) {
  app.listen(port, () => {
    console.log(`service_clients listening on port ${port}`);
  });
}

module.exports = app;
