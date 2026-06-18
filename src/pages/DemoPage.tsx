import { useMutation } from '@tanstack/react-query';
import { ArrowLeft, Cloud, Code2, Layers3, Loader2, Send, ShieldCheck } from 'lucide-react';
import { FormEvent, useState } from 'react';
import { Link } from 'react-router-dom';
import { useReviewStatus } from '../hooks/useReviewStatus';
import { createReviewRequest } from '../lib/reviewApi';
import type { ReviewRequest, ReviewRequestInput } from '../types/review';

const defaultTerraformCode = `terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = "ap-southeast-1"
}

resource "aws_s3_bucket" "app_logs" {
  bucket = "loopthru-demo-app-logs"
}

resource "aws_s3_bucket_public_access_block" "app_logs" {
  bucket = aws_s3_bucket.app_logs.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}`;

const initialForm: ReviewRequestInput = {
  name: 'Demo User',
  email: '',
  iacTool: 'terraform',
  cloudProvider: 'aws',
  code: defaultTerraformCode,
};

export default function DemoPage() {
  const [form, setForm] = useState(initialForm);
  const [request, setRequest] = useState<ReviewRequest | null>(null);
  const statusQuery = useReviewStatus(request?.id);

  const createRequest = useMutation({
    mutationFn: createReviewRequest,
    onSuccess: (createdRequest) => {
      setRequest(createdRequest);
      setForm((current) => ({ ...current, email: '' }));
    },
  });

  function updateField<FieldName extends keyof ReviewRequestInput>(
    field: FieldName,
    value: ReviewRequestInput[FieldName],
  ) {
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
              IaC review demo
            </p>
            <h1 className="mt-3 text-4xl font-semibold leading-tight md:text-5xl">
              Request an IaC review.
            </h1>
            <p className="mt-4 max-w-xl text-base leading-7 text-[#5b6d62]">
              Choose the IaC stack, paste Terraform, and watch the mocked review status move from
              queued to complete.
            </p>

            <div className="mt-8 space-y-3">
              <div className="rounded-md border border-[#dbe3d7] bg-white p-5">
                <div className="flex items-center gap-3">
                  <ShieldCheck size={22} className="text-[#2f7d68]" aria-hidden="true" />
                  <div>
                    <h2 className="text-base font-semibold">Demo-safe workflow</h2>
                    <p className="text-sm text-[#617066]">
                      The Terraform review runs in the browser with mocked status polling.
                    </p>
                  </div>
                </div>
              </div>
              <div className="rounded-md border border-[#dbe3d7] bg-white p-5">
                <div className="flex items-start gap-3">
                  <Code2 size={22} className="mt-0.5 text-[#2f7d68]" aria-hidden="true" />
                  <div>
                    <h2 className="text-base font-semibold">Initial checks</h2>
                    <p className="mt-1 text-sm leading-6 text-[#617066]">
                      This first demo frames the review around security posture, public exposure,
                      and cloud configuration hygiene.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="space-y-5">
            <form className="rounded-md border border-[#dbe3d7] bg-white p-5 shadow-sm" onSubmit={handleSubmit}>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="IaC tool" htmlFor="iacTool">
                  <div className="relative">
                    <Layers3
                      size={17}
                      className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#617066]"
                      aria-hidden="true"
                    />
                    <select
                      id="iacTool"
                      value={form.iacTool}
                      onChange={(event) => updateField('iacTool', event.target.value as 'terraform')}
                      className="input pl-10"
                    >
                      <option value="terraform">Terraform</option>
                    </select>
                  </div>
                </Field>

                <Field label="Cloud provider" htmlFor="cloudProvider">
                  <div className="relative">
                    <Cloud
                      size={17}
                      className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#617066]"
                      aria-hidden="true"
                    />
                    <select
                      id="cloudProvider"
                      value={form.cloudProvider}
                      onChange={(event) => updateField('cloudProvider', event.target.value as 'aws')}
                      className="input pl-10"
                    >
                      <option value="aws">AWS</option>
                    </select>
                  </div>
                </Field>
              </div>

              <div className="mt-4">
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
              </div>

              <div className="mt-4">
                <Field label="Terraform configuration" htmlFor="code">
                  <textarea
                    id="code"
                    required
                    rows={18}
                    value={form.code}
                    onChange={(event) => updateField('code', event.target.value)}
                    className="input min-h-[420px] resize-y bg-[#101815] font-mono text-sm leading-6 text-[#e7efe9] placeholder:text-[#7f9188]"
                    spellCheck={false}
                  />
                </Field>
              </div>

              <button
                type="submit"
                disabled={createRequest.isPending}
                className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-md bg-[#173f35] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#0f2d27] disabled:cursor-not-allowed disabled:bg-[#8fa39a]"
              >
                {createRequest.isPending ? (
                  <Loader2 size={17} className="animate-spin" aria-hidden="true" />
                ) : (
                  <Send size={17} aria-hidden="true" />
                )}
                Request IaC review
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
      <div className="rounded-md border border-dashed border-[#b8c7be] bg-white p-4 text-sm text-[#5b6d62]">
        Request an IaC review to see status polling.
      </div>
    );
  }

  return (
    <div className="rounded-md border border-[#dbe3d7] bg-white p-4">
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
