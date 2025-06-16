from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI()

products = []


class Product(BaseModel):
    id: int
    name: str


@app.get('/products')
async def list_products():
    return products


@app.post('/products')
async def add_product(product: Product):
    products.append(product)
    return product


@app.get('/health')
async def health():
    return {'status': 'ok'}
