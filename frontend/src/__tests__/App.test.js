import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import App from '../App';

test('renders home page with header', () => {
  render(
    <MemoryRouter initialEntries={['/']}>
      <App />
    </MemoryRouter>
  );

  // Match the header text in Home.js
  expect(screen.getByText(/schemaläggningssystem/i)).toBeInTheDocument();
});
