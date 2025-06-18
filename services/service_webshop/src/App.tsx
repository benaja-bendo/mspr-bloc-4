import { useEffect, useState } from 'react';
import { fetchClients, createClient } from './api';

interface Client {
  id: number;
  name: string;
}

export default function App() {
  const [clients, setClients] = useState<Client[]>([]);
  const [name, setName] = useState('');

  useEffect(() => {
    fetchClients().then(setClients);
  }, []);

  const addClient = async () => {
    if (!name) return;
    const client = await createClient({ id: Date.now(), name });
    setClients([...clients, client]);
    setName('');
  };

  return (
    <div>
      <h1>Webshop</h1>
      <input value={name} onChange={e => setName(e.target.value)} placeholder="Client name" />
      <button onClick={addClient}>Add Client</button>
      <ul>
        {clients.map(c => (
          <li key={c.id}>{c.name}</li>
        ))}
      </ul>
    </div>
  );
}
