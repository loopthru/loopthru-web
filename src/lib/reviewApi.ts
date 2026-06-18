import type {
  ReviewRequest,
  ReviewRequestInput,
  ReviewRequestStatus,
  ReviewStatus,
} from '../types/review';

type StoredReviewRequest = ReviewRequest & {
  pollCount: number;
};

const requests = new Map<string, StoredReviewRequest>();

const statusTimeline: Array<Pick<ReviewStatus, 'status' | 'message' | 'progress'>> = [
  {
    status: 'queued',
    message: 'Your request is queued and ready for intake.',
    progress: 12,
  },
  {
    status: 'in_review',
    message: 'A reviewer is analyzing the submission details.',
    progress: 48,
  },
  {
    status: 'in_review',
    message: 'Findings are being organized into a review packet.',
    progress: 76,
  },
  {
    status: 'complete',
    message: 'The review packet is ready to share.',
    progress: 100,
  },
];

function wait(milliseconds: number) {
  return new Promise((resolve) => {
    window.setTimeout(resolve, milliseconds);
  });
}

function createId() {
  return `rev_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

export function resetReviewRequests() {
  requests.clear();
}

export function isTerminalStatus(status: ReviewRequestStatus) {
  return status === 'complete' || status === 'failed';
}

export async function createReviewRequest(input: ReviewRequestInput): Promise<ReviewRequest> {
  await wait(300);

  const request: StoredReviewRequest = {
    ...input,
    id: createId(),
    createdAt: new Date().toISOString(),
    status: 'queued',
    pollCount: 0,
  };

  requests.set(request.id, request);

  return request;
}

export async function getReviewRequestStatus(id: string): Promise<ReviewStatus> {
  await wait(250);

  const request = requests.get(id);

  if (!request) {
    return {
      id,
      status: 'failed',
      message: 'We could not find that request. Submit a new review request to restart.',
      progress: 100,
      updatedAt: new Date().toISOString(),
    };
  }

  const nextStatus = statusTimeline[Math.min(request.pollCount, statusTimeline.length - 1)];
  request.pollCount += 1;
  request.status = nextStatus.status;
  requests.set(id, request);

  return {
    id,
    ...nextStatus,
    updatedAt: new Date().toISOString(),
  };
}
