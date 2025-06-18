import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import App from '../src/App';

describe('webshop', () => {
  it('renders', () => {
    const { getByText } = render(<App />);
    expect(getByText('Webshop')).toBeTruthy();
  });
});
