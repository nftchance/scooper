import { render, screen } from '@testing-library/react';
import App from './App';

test('renders recover now button', () => {
  render(<App />);
  const linkElement = screen.getByText(/recover now/i);
  expect(linkElement).toBeInTheDocument();
});
