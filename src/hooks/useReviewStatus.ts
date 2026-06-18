import { useQuery } from '@tanstack/react-query';
import { getReviewRequestStatus, isTerminalStatus } from '../lib/reviewApi';
import type { ReviewStatus } from '../types/review';

export function useReviewStatus(requestId?: string) {
  return useQuery<ReviewStatus>({
    queryKey: ['review-status', requestId],
    queryFn: () => getReviewRequestStatus(requestId ?? ''),
    enabled: Boolean(requestId),
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      return status && isTerminalStatus(status) ? false : 3_000;
    },
  });
}
