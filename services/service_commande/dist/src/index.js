import express from 'express';
const app = express();
const port = process.env.PORT || 3001;
app.use(express.json());
let orders = [];
app.get('/orders', (_req, res) => {
    res.json(orders);
});
app.post('/orders', (req, res) => {
    const { clientId, productId } = req.body;
    const order = { id: orders.length + 1, clientId, productId };
    orders.push(order);
    res.status(201).json(order);
});
app.get('/health', (_req, res) => {
    res.json({ status: 'ok' });
});
if (import.meta.url === `file://${process.argv[1]}`) {
    app.listen(port, () => {
        console.log(`service_commande listening on port ${port}`);
    });
}
export default app;
//# sourceMappingURL=index.js.map