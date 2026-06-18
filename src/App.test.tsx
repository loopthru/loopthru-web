import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
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

  it('renders the demo IaC review console', () => {
    renderApp('/demo');

    expect(screen.getByRole('heading', { name: /request an IaC review/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/IaC tool/i)).toHaveValue('terraform');
    expect(screen.getByLabelText(/cloud provider/i)).toHaveValue('aws');
    expect((screen.getByLabelText(/terraform configuration/i) as HTMLTextAreaElement).value).toContain(
      'resource "aws_s3_bucket"',
    );
    expect(screen.getByRole('button', { name: /request IaC review/i })).toBeInTheDocument();
  });

  it('submits an IaC review request from the demo console', async () => {
    const user = userEvent.setup();
    renderApp('/demo');

    await user.type(screen.getByLabelText(/work email/i), 'avery@example.com');
    await user.click(screen.getByRole('button', { name: /request IaC review/i }));

    expect(await screen.findByText(/request rev_/i)).toBeInTheDocument();
    expect(await screen.findByText(/terraform review request is queued/i)).toBeInTheDocument();
  });
});
