import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import App from '../src/App';

// Avoid real network calls during tests
vi.mock('../src/api', () => ({
  fetchClients: vi.fn().mockResolvedValue([]),
  createClient: vi.fn().mockResolvedValue({ id: 1, name: 'Test' })
}));

describe('webshop', () => {
  it('renders', () => {
    const { getByText } = render(<App />);
    expect(getByText('Webshop')).toBeTruthy();
  });
});
