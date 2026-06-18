import { useMutation } from '@tanstack/react-query';
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  Cloud,
  Layers3,
  Loader2,
  ShieldCheck,
} from 'lucide-react';
import { FormEvent, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useReviewStatus } from '../hooks/useReviewStatus';
import { checkEvidenceEngineHealth, createReviewRequest, isTerminalStatus } from '../lib/reviewApi';
import type { ReviewRequest, ReviewRequestInput, ReviewStatus, ReviewSummary } from '../types/review';

const defaultTerraformCode = JSON.stringify(
  {
    format_version: '1.2',
    terraform_version: '1.7.5',
    resource_changes: [
      {
        address: 'aws_s3_bucket.app_logs',
        mode: 'managed',
        type: 'aws_s3_bucket',
        name: 'app_logs',
        change: {
          actions: ['create'],
          after: {
            bucket: 'loopthru-demo-app-logs',
          },
        },
      },
      {
        address: 'aws_s3_bucket_public_access_block.app_logs',
        mode: 'managed',
        type: 'aws_s3_bucket_public_access_block',
        name: 'app_logs',
        change: {
          actions: ['create'],
          after: {
            block_public_acls: true,
            block_public_policy: true,
            ignore_public_acls: true,
            restrict_public_buckets: true,
          },
        },
      },
    ],
  },
  null,
  2,
);

const initialForm: ReviewRequestInput = {
  name: 'Demo User',
  iacTool: 'terraform',
  cloudProvider: 'aws',
  code: defaultTerraformCode,
};

type SubmitPhase = 'idle' | 'initializing' | 'submitting';

function wait(milliseconds: number) {
  return new Promise((resolve) => {
    window.setTimeout(resolve, milliseconds);
  });
}

async function waitForEvidenceEngine() {
  while (true) {
    try {
      await checkEvidenceEngineHealth();
      return;
    } catch {
      await wait(2_500);
    }
  }
}

export default function DemoPage() {
  const [form, setForm] = useState(initialForm);
  const [request, setRequest] = useState<ReviewRequest | null>(null);
  const [sessionUid, setSessionUid] = useState('');
  const [completedStatus, setCompletedStatus] = useState<ReviewStatus | null>(null);
  const [submitPhase, setSubmitPhase] = useState<SubmitPhase>('idle');
  const summarySectionRef = useRef<HTMLElement>(null);
  const statusQuery = useReviewStatus(request?.id);

  const createRequest = useMutation({
    mutationFn: async ({ input, sessionUid }: { input: ReviewRequestInput; sessionUid: string }) => {
      setSubmitPhase('initializing');
      await waitForEvidenceEngine();
      setSubmitPhase('submitting');
      return createReviewRequest({ input, sessionUid });
    },
    onSuccess: (createdRequest) => {
      setRequest(createdRequest);
      setSubmitPhase('idle');
    },
    onError: () => {
      setSubmitPhase('idle');
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
    const nextSessionUid = crypto.randomUUID();

    setCompletedStatus(null);
    setSessionUid(nextSessionUid);
    setRequest(null);
    createRequest.mutate({ input: form, sessionUid: nextSessionUid });
  }

  const status = statusQuery.data;
  useEffect(() => {
    if (!status || !isTerminalStatus(status.status)) {
      return;
    }

    setCompletedStatus(status);
    setRequest(null);
    setSessionUid('');
    summarySectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [status]);

  const visibleStatus =
    status ??
    (request
      ? {
          id: request.id,
          status: request.status,
          message: 'Terraform plan received. Preparing review agents.',
          progress: 38,
          updatedAt: request.createdAt,
        }
      : undefined);
  const isReviewActive =
    createRequest.isPending || Boolean(visibleStatus?.status && !isTerminalStatus(visibleStatus.status));
  const reviewSummary = completedStatus?.summary ?? status?.summary;
  const progressSummary = getProgressSummary({
    isInitializing: submitPhase === 'initializing',
    isSubmitting: submitPhase === 'submitting',
    status: visibleStatus,
  });

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

        <section className="mt-8">
          <div className="w-full">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#42776c]">
              LoopThru Demo
            </p>
            <div className="max-w-4xl">
              <h1 className="mt-3 text-4xl font-semibold leading-tight md:text-5xl">
                Know Before You Deploy
              </h1>
              <p className="mt-4 text-base leading-7 text-[#5b6d62]">
                Submit a Terraform plan and receive an AI-powered governance review with security, compliance, reliability, and cost insights.
              </p>
            </div>
            <p className="mt-5 w-full rounded-md border border-[#cbdad2] bg-[#eef7f3] px-5 py-4 text-sm leading-6 text-[#3f5549] shadow-sm">
              <span className="font-semibold text-[#173f35]">Hackathon scope:</span> LoopThru focuses on Terraform-based AWS S3 changes to demonstrate an end-to-end governance workflow powered by Band.
            </p>
          </div>
        </section>

        <form className="mt-8 rounded-md border border-[#dbe3d7] bg-white shadow-sm" onSubmit={handleSubmit}>
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#e6ece4] p-5">
            <h2 className="text-lg font-semibold text-[#172019]">Review Infrastructure Change</h2>
            {isReviewActive ? <ProgressPill label={progressSummary.label} progress={progressSummary.progress} /> : null}
          </div>

          <div className="grid gap-5 p-5 lg:grid-cols-[minmax(220px,0.34fr)_minmax(420px,0.66fr)]">
            <div className="grid content-start gap-4">
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

              <button
                type="submit"
                disabled={isReviewActive}
                className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-[#173f35] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#0f2d27] disabled:cursor-not-allowed disabled:bg-[#8fa39a]"
              >
                {isReviewActive ? (
                  <Loader2 size={17} className="animate-spin" aria-hidden="true" />
                ) : (
                  <ShieldCheck size={17} aria-hidden="true" />
                )}
                Review Infrastructure Change
              </button>
              <p className="text-sm leading-6 text-[#617066]">
                First-time initialization may take a few moments while review services start.
              </p>

              {createRequest.error ? (
                <p className="text-sm font-medium text-[#a23b2a]">
                  {createRequest.error.message}
                </p>
              ) : null}
            </div>

            <Field label="Terraform plan JSON" htmlFor="code">
              <textarea
                id="code"
                required
                rows={18}
                value={form.code}
                onChange={(event) => updateField('code', event.target.value)}
                className="input min-h-[360px] resize-y bg-[#101815] font-mono text-sm leading-6 text-[#e7efe9] placeholder:text-[#7f9188]"
                spellCheck={false}
              />
            </Field>
          </div>
        </form>

        <section ref={summarySectionRef} className="mt-6 scroll-mt-6">
          <SummaryPanel summary={reviewSummary} />
        </section>
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

function getProgressSummary({
  isInitializing,
  isSubmitting,
  status,
}: {
  isInitializing: boolean;
  isSubmitting: boolean;
  status?: ReviewStatus;
}) {
  if (isInitializing) {
    return { label: 'Initializing instance', progress: 12 };
  }

  if (isSubmitting) {
    return { label: 'Submitting', progress: 24 };
  }

  return {
    label: status?.status.replace('_', ' ') ?? 'Checking',
    progress: status?.progress ?? 8,
  };
}

function ProgressPill({ label, progress }: { label: string; progress: number }) {
  return (
    <span className="inline-flex items-center rounded-full bg-[#dceee8] px-3 py-1.5 text-xs font-semibold capitalize text-[#173f35]">
      {label} {progress}%
    </span>
  );
}

function SummaryPanel({ summary }: { summary?: ReviewSummary }) {
  if (!summary) {
    return (
      <div className="grid min-h-[250px] place-items-center rounded-md border border-dashed border-[#b8c7be] bg-white p-8 text-center">
        <div>
          <span className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-[#dceee8] text-[#173f35]">
            <CheckCircle2 size={20} aria-hidden="true" />
          </span>
          <h2 className="mt-3 text-xl font-semibold text-[#172019]">Summary will appear here</h2>
          <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-[#617066]">
            Once the review finishes, this section will show the decision, risk score, findings,
            compliance violations, reporting agents, and approval conditions.
          </p>
        </div>
      </div>
    );
  }

  const findings = summary.resources.flatMap((resource) =>
    resource.findings.map((finding) => ({
      ...finding,
      resourceName: resource.name,
      resourceAddress: resource.resource,
    })),
  );

  return (
    <section className="overflow-hidden rounded-md border border-[#dbe3d7] bg-white shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-[#e6ece4] p-5">
        <div>
          <h2 className="text-lg font-semibold text-[#172019]">Review summary</h2>
          <p className="mt-1 text-sm leading-6 text-[#617066]">
            Summary is preserved after the active session resets, so a new request can start.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <DecisionBadge decision={summary.decision} />
          {typeof summary.risk_score === 'number' ? (
            <span className="rounded-full bg-[#fff3c4] px-3 py-1 text-xs font-semibold text-[#6c4a00]">
              Risk {summary.risk_score}
            </span>
          ) : null}
        </div>
      </div>

      <div className="space-y-5 p-5">
        <div className="rounded-md border-l-4 border-[#a23b2a] bg-[#fff7f4] px-4 py-3 text-sm leading-6 text-[#3e2b24]">
          {summary.summary}
        </div>

        {summary.top_risks?.length ? (
          <div className="grid gap-3 sm:grid-cols-3">
            {summary.top_risks.map((risk) => (
              <div key={risk} className="rounded-md border border-[#e1d6c1] bg-[#fffdf8] p-3">
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#705f3d]">
                  Top risk
                </p>
                <p className="mt-2 text-sm leading-5 text-[#24352c]">{risk}</p>
              </div>
            ))}
          </div>
        ) : null}

        <div className="divide-y divide-[#e6ece4]">
          {findings.map((finding) => (
            <article key={`${finding.resourceName}-${finding.title}`} className="grid gap-3 py-4 sm:grid-cols-[84px_1fr]">
              <span className={severityClassName(finding.severity)}>{finding.severity}</span>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#617066]">
                  {finding.resourceAddress ?? finding.resourceName}
                </p>
                <h3 className="mt-1 text-base font-semibold text-[#172019]">{finding.title}</h3>
                <p className="mt-1 text-sm leading-6 text-[#617066]">{finding.summary}</p>
                {finding.required_fix ? (
                  <p className="mt-2 text-sm font-semibold leading-6 text-[#24352c]">
                    Fix: {finding.required_fix}
                  </p>
                ) : null}

                <FindingChips label="Compliance violated" items={finding.frameworks} tone="compliance" />
                <FindingChips label="Reviewed by" items={finding.reported_by} tone="agent" />
              </div>
            </article>
          ))}
        </div>

        {summary.approval_conditions?.length ? (
          <div className="border-t border-[#e6ece4] pt-4">
            <h3 className="text-base font-semibold text-[#172019]">Approval conditions</h3>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm leading-6 text-[#4f5f55]">
              {summary.approval_conditions.map((condition) => (
                <li key={condition}>{condition}</li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>
    </section>
  );
}

function DecisionBadge({ decision }: { decision: string }) {
  const isBlock = decision.toLowerCase() === 'block';

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold capitalize ${
        isBlock ? 'bg-[#fee8e1] text-[#8a2f1d]' : 'bg-[#dceee8] text-[#173f35]'
      }`}
    >
      {isBlock ? <AlertTriangle size={13} aria-hidden="true" /> : <CheckCircle2 size={13} aria-hidden="true" />}
      {isBlock ? 'Block deployment' : decision}
    </span>
  );
}

function FindingChips({
  items,
  label,
  tone,
}: {
  items?: string[];
  label: string;
  tone: 'agent' | 'compliance';
}) {
  if (!items?.length) {
    return null;
  }

  const chipClassName =
    tone === 'compliance'
      ? 'border-[#f0d0c7] bg-[#fff7f4] text-[#8a2f1d]'
      : 'border-[#c9ded5] bg-[#edf7f3] text-[#275f51]';

  return (
    <div className="mt-3 flex flex-wrap items-center gap-2">
      <span className="min-w-[126px] text-xs font-semibold text-[#617066]">{label}</span>
      {items.map((item) => (
        <span
          key={item}
          className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${chipClassName}`}
        >
          {item}
        </span>
      ))}
    </div>
  );
}

function severityClassName(severity: string) {
  const normalizedSeverity = severity.toLowerCase();
  const tone =
    normalizedSeverity === 'high'
      ? 'bg-[#fee8e1] text-[#8a2f1d]'
      : normalizedSeverity === 'medium'
        ? 'bg-[#fff3c4] text-[#6c4a00]'
        : 'bg-[#dceee8] text-[#173f35]';

  return `h-fit w-fit rounded-full px-2.5 py-1 text-xs font-bold uppercase ${tone}`;
}
