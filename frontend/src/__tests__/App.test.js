// frontend/src/__tests__/App.test.js
import { render, screen } from '@testing-library/react';
import App from '../App';

test('renders header text', () => {
  render(<App />);
  expect(screen.getByText(/Welcome/i)).toBeInTheDocument();
});
