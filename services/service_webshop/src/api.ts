const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export async function fetchClients() {
  const res = await fetch(`${API_BASE_URL}/clients`);
  return res.json();
}

export async function createClient(data: { id: number; name: string }) {
  const res = await fetch(`${API_BASE_URL}/clients`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  return res.json();
}
