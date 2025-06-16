from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_health():
    resp = client.get('/health')
    assert resp.status_code == 200
    assert resp.json() == {'status': 'ok'}

def test_add_product():
    resp = client.post('/products', json={'id': 1, 'name': 'Coffee'})
    assert resp.status_code == 200
    assert resp.json()['name'] == 'Coffee'
    list_resp = client.get('/products')
    assert len(list_resp.json()) == 1
