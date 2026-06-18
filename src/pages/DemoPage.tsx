import { useMutation } from '@tanstack/react-query';
import { ArrowLeft, Loader2, Send, ShieldCheck } from 'lucide-react';
import { FormEvent, useState } from 'react';
import { Link } from 'react-router-dom';
import { useReviewStatus } from '../hooks/useReviewStatus';
import { createReviewRequest } from '../lib/reviewApi';
import type { ReviewRequest, ReviewRequestInput } from '../types/review';

const initialForm: ReviewRequestInput = {
  name: '',
  email: '',
  url: '',
  notes: '',
};

export default function DemoPage() {
  const [form, setForm] = useState(initialForm);
  const [request, setRequest] = useState<ReviewRequest | null>(null);
  const statusQuery = useReviewStatus(request?.id);

  const createRequest = useMutation({
    mutationFn: createReviewRequest,
    onSuccess: (createdRequest) => {
      setRequest(createdRequest);
      setForm(initialForm);
    },
  });

  function updateField(field: keyof ReviewRequestInput, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    createRequest.mutate(form);
  }

  const status = statusQuery.data;

  return (
    <main className="min-h-screen bg-[#f8faf7] text-[#172019]">
      <div className="mx-auto max-w-6xl px-5 py-8">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm font-semibold text-[#2c6559] hover:text-[#173f35]"
        >
          <ArrowLeft size={16} aria-hidden="true" />
          Back to landing
        </Link>

        <div className="mt-8 grid gap-8 lg:grid-cols-[0.95fr_1.05fr]">
          <section>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#42776c]">
              Live demo
            </p>
            <h1 className="mt-3 text-4xl font-semibold leading-tight md:text-5xl">
              Submit a review request.
            </h1>
            <p className="mt-4 max-w-xl text-base leading-7 text-[#5b6d62]">
              Use the form to create a mock request. The status panel polls automatically until the
              review reaches a final state.
            </p>

            <div className="mt-8 rounded-md border border-[#dbe3d7] bg-white p-5">
              <div className="flex items-center gap-3">
                <ShieldCheck size={22} className="text-[#2f7d68]" aria-hidden="true" />
                <div>
                  <h2 className="text-base font-semibold">Demo-safe workflow</h2>
                  <p className="text-sm text-[#617066]">No external data is sent from this page.</p>
                </div>
              </div>
            </div>
          </section>

          <section className="rounded-md border border-[#dbe3d7] bg-white p-5 shadow-sm">
            <form className="space-y-4" onSubmit={handleSubmit}>
              <Field label="Full name" htmlFor="name">
                <input
                  id="name"
                  required
                  value={form.name}
                  onChange={(event) => updateField('name', event.target.value)}
                  className="input"
                  placeholder="Avery Stone"
                />
              </Field>

              <Field label="Work email" htmlFor="email">
                <input
                  id="email"
                  required
                  type="email"
                  value={form.email}
                  onChange={(event) => updateField('email', event.target.value)}
                  className="input"
                  placeholder="avery@company.com"
                />
              </Field>

              <Field label="URL to review" htmlFor="url">
                <input
                  id="url"
                  required
                  type="url"
                  value={form.url}
                  onChange={(event) => updateField('url', event.target.value)}
                  className="input"
                  placeholder="https://company.com/launch"
                />
              </Field>

              <Field label="Review notes" htmlFor="notes">
                <textarea
                  id="notes"
                  required
                  rows={5}
                  value={form.notes}
                  onChange={(event) => updateField('notes', event.target.value)}
                  className="input resize-none"
                  placeholder="Share context, goals, launch timing, or risk areas."
                />
              </Field>

              <button
                type="submit"
                disabled={createRequest.isPending}
                className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-[#173f35] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#0f2d27] disabled:cursor-not-allowed disabled:bg-[#8fa39a]"
              >
                {createRequest.isPending ? (
                  <Loader2 size={17} className="animate-spin" aria-hidden="true" />
                ) : (
                  <Send size={17} aria-hidden="true" />
                )}
                Submit request
              </button>
            </form>

            <StatusPanel
              requestId={request?.id}
              isLoading={Boolean(request?.id) && statusQuery.isLoading}
              status={status}
            />
          </section>
        </div>
      </div>
    </main>
  );
}

function Field({
  children,
  htmlFor,
  label,
}: {
  children: React.ReactNode;
  htmlFor: string;
  label: string;
}) {
  return (
    <label className="block" htmlFor={htmlFor}>
      <span className="mb-2 block text-sm font-semibold text-[#24352c]">{label}</span>
      {children}
    </label>
  );
}

function StatusPanel({
  isLoading,
  requestId,
  status,
}: {
  isLoading: boolean;
  requestId?: string;
  status?: {
    status: string;
    message: string;
    progress: number;
  };
}) {
  if (!requestId) {
    return (
      <div className="mt-6 rounded-md border border-dashed border-[#b8c7be] bg-[#f8faf7] p-4 text-sm text-[#5b6d62]">
        Submit the form to see request status polling.
      </div>
    );
  }

  return (
    <div className="mt-6 rounded-md border border-[#dbe3d7] bg-[#f8faf7] p-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-[#173f35]">Request {requestId}</p>
          <p className="mt-1 text-sm text-[#5b6d62]">
            {isLoading ? 'Checking status...' : status?.message}
          </p>
        </div>
        <span className="rounded-md bg-[#dceee8] px-3 py-1 text-xs font-semibold capitalize text-[#173f35]">
          {status?.status.replace('_', ' ') ?? 'queued'}
        </span>
      </div>
      <div className="mt-4 h-2 overflow-hidden rounded-full bg-[#d9e5db]">
        <div
          className="h-full rounded-full bg-[#2f7d68] transition-all"
          style={{ width: `${status?.progress ?? 8}%` }}
        />
      </div>
    </div>
  );
}
