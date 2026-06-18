export type ReviewRequestStatus =
  | 'evidence_saved'
  | 'agents_running'
  | 'summarized'
  | 'failed';

export type ReviewRequestInput = {
  name: string;
  iacTool: 'terraform';
  cloudProvider: 'aws';
  code: string;
};

export type ReviewRequest = ReviewRequestInput & {
  id: string;
  sessionUid: string;
  createdAt: string;
  status: ReviewRequestStatus;
};

export type ReviewFinding = {
  title: string;
  summary: string;
  severity: string;
  categories?: string[];
  frameworks?: string[];
  reported_by?: string[];
  required_fix?: string;
  evidence_paths?: string[];
};

export type ReviewResourceSummary = {
  name: string;
  resource?: string;
  decision?: string;
  findings: ReviewFinding[];
};

export type ReviewSummary = {
  summary: string;
  decision: string;
  resources: ReviewResourceSummary[];
  top_risks?: string[];
  risk_score?: number;
  agent_decisions?: Array<{
    agent: string;
    decision: string;
  }>;
  agents_consulted?: string[];
  approval_conditions?: string[];
};

export type ReviewStatus = {
  id: string;
  status: ReviewRequestStatus;
  message: string;
  progress: number;
  updatedAt: string;
  summary?: ReviewSummary;
};
