import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';
import App from './App';

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

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
        name: /should this infrastructure.*change be deployed/i,
      }),
    ).toBeInTheDocument();
    expect(screen.getAllByRole('link', { name: /run a review/i })[0]).toHaveAttribute(
      'href',
      '/demo',
    );
  });

  it('renders the demo IaC review console', () => {
    renderApp('/demo');

    expect(screen.getByRole('heading', { name: /review infrastructure change/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /summary will appear here/i })).toBeInTheDocument();
    expect(screen.queryByText(/the request button stays disabled/i)).not.toBeInTheDocument();
    expect(screen.getByText(/hackathon scope:/i)).toBeInTheDocument();
    expect(screen.getByText(/terraform-based aws s3 changes/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/IaC tool/i)).toHaveValue('terraform');
    expect(screen.getByLabelText(/cloud provider/i)).toHaveValue('aws');
    expect(screen.queryByLabelText(/work email/i)).not.toBeInTheDocument();
    expect((screen.getByLabelText(/terraform plan json/i) as HTMLTextAreaElement).value).toContain(
      'aws_s3_bucket',
    );
    expect(screen.getByRole('button', { name: /review infrastructure change/i })).toBeInTheDocument();
  });

  it('submits an IaC review request from the demo console', async () => {
    vi.spyOn(globalThis.crypto, 'randomUUID').mockReturnValue(
      '00000000-0000-4000-8000-000000000000',
    );
    vi.stubGlobal(
      'fetch',
      vi
        .fn()
        .mockResolvedValueOnce(new Response(null, { status: 200 }))
        .mockResolvedValueOnce(new Response(null, { status: 200 }))
        .mockResolvedValueOnce(new Response(null, { status: 202 }))
        .mockResolvedValueOnce(Response.json({ status: 'agents_running' })),
    );
    const user = userEvent.setup();
    renderApp('/demo');

    await user.click(screen.getByRole('button', { name: /review infrastructure change/i }));

    expect(await screen.findByText(/agents running 68%/i)).toBeInTheDocument();
    expect(fetch).toHaveBeenNthCalledWith(1, 'https://evidence-engine.onrender.com/health', {
      method: 'GET',
    });
    expect(fetch).toHaveBeenNthCalledWith(2, 'https://band-of-agents.onrender.com/health', {
      method: 'GET',
    });
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /review infrastructure change/i })).toBeDisabled();
  });

  it('renders the summarized review and resets the active session', async () => {
    const scrollIntoView = vi.fn();
    Object.defineProperty(Element.prototype, 'scrollIntoView', {
      configurable: true,
      value: scrollIntoView,
    });
    vi.spyOn(globalThis.crypto, 'randomUUID').mockReturnValue(
      '00000000-0000-4000-8000-000000000000',
    );
    vi.stubGlobal(
      'fetch',
      vi
        .fn()
        .mockResolvedValueOnce(new Response(null, { status: 200 }))
        .mockResolvedValueOnce(new Response(null, { status: 200 }))
        .mockResolvedValueOnce(new Response(null, { status: 202 }))
        .mockResolvedValueOnce(
          Response.json({
            status: 'summarized',
            summary: {
              summary: 'Block deployment: S3 bucket controls are incomplete.',
              decision: 'block',
              risk_score: 80,
              resources: [
                {
                  name: 'loopthru-demo-app-logs',
                  resource: 'aws_s3_bucket.app_logs',
                  decision: 'block',
                  findings: [
                    {
                      title: 'Server-side encryption is not configured',
                      summary: 'No server-side encryption is defined for the bucket.',
                      severity: 'high',
                      frameworks: ['CIS AWS', 'SOC 2', 'ISO 27001'],
                      reported_by: ['security-agent', 'compliance-agent'],
                      required_fix: 'Configure default server-side encryption.',
                      evidence_paths: [
                        'resource_changes[0].change.after.server_side_encryption_configuration',
                      ],
                    },
                  ],
                },
              ],
              top_risks: ['Server-side encryption not configured'],
              agent_decisions: [{ agent: 'security-agent', decision: 'warn' }],
              agents_consulted: ['security-agent', 'compliance-agent'],
              approval_conditions: ['Enable server-side encryption on the bucket.'],
            },
          }),
        ),
    );
    const user = userEvent.setup();
    renderApp('/demo');

    await user.click(screen.getByRole('button', { name: /review infrastructure change/i }));

    expect(await screen.findByRole('heading', { name: /review summary/i })).toBeInTheDocument();
    expect(screen.getByText(/block deployment: s3 bucket controls are incomplete/i)).toBeInTheDocument();
    expect(screen.getByText(/server-side encryption is not configured/i)).toBeInTheDocument();
    expect(screen.getByText('CIS AWS')).toBeInTheDocument();
    expect(screen.getByText('SOC 2')).toBeInTheDocument();
    expect(screen.getByText('ISO 27001')).toBeInTheDocument();
    expect(screen.getByText('security-agent')).toBeInTheDocument();
    expect(screen.getByText('compliance-agent')).toBeInTheDocument();
    expect(scrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth', block: 'start' });

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /review infrastructure change/i })).toBeEnabled();
      expect(screen.queryByText(/Session UID/i)).not.toBeInTheDocument();
    });
  });
});
