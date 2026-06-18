import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import App from './App';

function renderApp(path = '/') {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[path]}>
        <App />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe('App', () => {
  it('renders the landing page', () => {
    renderApp('/');

    expect(
      screen.getByRole('heading', {
        name: /turn review requests into a trackable workflow/i,
      }),
    ).toBeInTheDocument();
    expect(screen.getAllByRole('link', { name: /request a review/i })[0]).toHaveAttribute(
      'href',
      '/demo',
    );
  });

  it('renders the demo review request form', () => {
    renderApp('/demo');

    expect(
      screen.getByRole('heading', { name: /submit a review request/i }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText(/work email/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /submit request/i })).toBeInTheDocument();
  });
});
