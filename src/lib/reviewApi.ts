import type {
  ReviewRequest,
  ReviewRequestInput,
  ReviewRequestStatus,
  ReviewSummary,
  ReviewStatus,
} from '../types/review';

const EVIDENCE_ENGINE_BASE_URL = 'https://evidence-engine.onrender.com';
const REVIEW_AGENTS_BASE_URL = 'https://band-of-agents.onrender.com';

const reviewReadinessChecks = [
  {
    url: `${EVIDENCE_ENGINE_BASE_URL}/health`,
    errorMessage: 'Evidence engine is not ready yet.',
  },
  {
    url: `${REVIEW_AGENTS_BASE_URL}/health`,
    errorMessage: 'Review agents are not ready yet.',
  },
];

const statusDetails: Record<ReviewRequestStatus, Pick<ReviewStatus, 'message' | 'progress'>> = {
  evidence_saved: {
    message: 'Terraform plan received. Preparing review agents.',
    progress: 38,
  },
  agents_running: {
    message: 'Review agents are analyzing the Terraform plan.',
    progress: 68,
  },
  summarized: {
    message: 'Evidence summary is ready.',
    progress: 100,
  },
  failed: {
    message: 'The review could not be completed. Please try again.',
    progress: 100,
  },
};

type CreateReviewRequestArgs = {
  sessionUid: string;
  input: ReviewRequestInput;
};

type EvidenceStatusResponse = {
  status?: ReviewRequestStatus;
  message?: string;
  summary?: ReviewSummary;
};

export async function checkEvidenceEngineHealth() {
  for (const check of reviewReadinessChecks) {
    const response = await fetch(check.url, {
      method: 'GET',
    });

    if (!response.ok) {
      throw new Error(check.errorMessage);
    }
  }
}

export function isTerminalStatus(status: ReviewRequestStatus) {
  return status === 'summarized' || status === 'failed';
}

export async function createReviewRequest({
  input,
  sessionUid,
}: CreateReviewRequestArgs): Promise<ReviewRequest> {
  let terraformPlan: unknown;

  try {
    terraformPlan = JSON.parse(input.code);
  } catch {
    throw new Error('Paste a valid Terraform plan JSON before requesting review.');
  }

  const response = await fetch(`${EVIDENCE_ENGINE_BASE_URL}/v1/evidence/terraform-plan`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      session_uid: sessionUid,
      terraform_plan: terraformPlan,
    }),
  });

  if (!response.ok) {
    throw new Error('Could not submit the Terraform plan. Please try again.');
  }

  return {
    ...input,
    id: sessionUid,
    sessionUid,
    createdAt: new Date().toISOString(),
    status: 'evidence_saved',
  };
}

export async function getReviewRequestStatus(sessionUid: string): Promise<ReviewStatus> {
  const response = await fetch(
    `${EVIDENCE_ENGINE_BASE_URL}/v1/evidence/status/${encodeURIComponent(sessionUid)}`,
    { method: 'GET' },
  );

  if (!response.ok) {
    throw new Error('Could not read review status.');
  }

  const data = (await response.json()) as EvidenceStatusResponse;
  const status = data.status ?? 'agents_running';
  const details = statusDetails[status] ?? statusDetails.agents_running;

  return {
    id: sessionUid,
    status,
    message: data.message ?? details.message,
    progress: details.progress,
    updatedAt: new Date().toISOString(),
    summary: data.summary,
  };
}
