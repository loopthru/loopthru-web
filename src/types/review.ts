export type ReviewRequestStatus =
  | 'queued'
  | 'in_review'
  | 'needs_input'
  | 'complete'
  | 'failed';

export type ReviewRequestInput = {
  name: string;
  email: string;
  url: string;
  notes: string;
};

export type ReviewRequest = ReviewRequestInput & {
  id: string;
  createdAt: string;
  status: ReviewRequestStatus;
};

export type ReviewStatus = {
  id: string;
  status: ReviewRequestStatus;
  message: string;
  progress: number;
  updatedAt: string;
};
