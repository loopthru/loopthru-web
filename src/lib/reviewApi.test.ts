import { describe, expect, it, vi } from 'vitest';
import {
  createReviewRequest,
  getReviewRequestStatus,
  isTerminalStatus,
  resetReviewRequests,
} from './reviewApi';

describe('reviewApi', () => {
  it('creates a review request in the queued state', async () => {
    resetReviewRequests();

    const request = await createReviewRequest({
      name: 'Rina',
      email: 'rina@example.com',
      url: 'https://example.com',
      notes: 'Review our onboarding flow.',
    });

    expect(request.id).toMatch(/^rev_/);
    expect(request.status).toBe('queued');
    expect(request.email).toBe('rina@example.com');
  });

  it('advances status as polling continues', async () => {
    vi.useFakeTimers();
    resetReviewRequests();

    const requestPromise = createReviewRequest({
      name: 'Rina',
      email: 'rina@example.com',
      url: 'https://example.com',
      notes: 'Review our onboarding flow.',
    });
    await vi.advanceTimersByTimeAsync(300);
    const request = await requestPromise;

    const queuedStatusPromise = getReviewRequestStatus(request.id);
    await vi.advanceTimersByTimeAsync(250);
    expect(await queuedStatusPromise).toMatchObject({
      status: 'queued',
      progress: 12,
    });

    const inReviewStatusPromise = getReviewRequestStatus(request.id);
    await vi.advanceTimersByTimeAsync(250);
    expect(await inReviewStatusPromise).toMatchObject({
      status: 'in_review',
      progress: 48,
    });

    const secondInReviewStatusPromise = getReviewRequestStatus(request.id);
    await vi.advanceTimersByTimeAsync(250);
    expect(await secondInReviewStatusPromise).toMatchObject({
      status: 'in_review',
      progress: 76,
    });

    const completeStatusPromise = getReviewRequestStatus(request.id);
    await vi.advanceTimersByTimeAsync(250);
    expect(await completeStatusPromise).toMatchObject({
      status: 'complete',
      progress: 100,
    });

    vi.useRealTimers();
  });

  it('identifies terminal statuses', () => {
    expect(isTerminalStatus('complete')).toBe(true);
    expect(isTerminalStatus('failed')).toBe(true);
    expect(isTerminalStatus('queued')).toBe(false);
    expect(isTerminalStatus('in_review')).toBe(false);
    expect(isTerminalStatus('needs_input')).toBe(false);
  });
});
