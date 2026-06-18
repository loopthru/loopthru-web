import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  checkEvidenceEngineHealth,
  createReviewRequest,
  getReviewRequestStatus,
  isTerminalStatus,
} from './reviewApi';

describe('reviewApi', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('checks evidence engine and review agent health before starting a review', async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(null, { status: 200 }));
    vi.stubGlobal('fetch', fetchMock);

    await checkEvidenceEngineHealth();

    expect(fetchMock).toHaveBeenNthCalledWith(1, 'https://evidence-engine.onrender.com/health', {
      method: 'GET',
    });
    expect(fetchMock).toHaveBeenNthCalledWith(2, 'https://band-of-agents.onrender.com/health', {
      method: 'GET',
    });
  });

  it('posts the editor JSON as the terraform plan without changing it', async () => {
    const terraformPlan = {
      format_version: '1.2',
      resource_changes: [{ address: 'aws_s3_bucket.app_logs', mode: 'managed' }],
    };
    const fetchMock = vi.fn().mockResolvedValue(new Response(null, { status: 202 }));
    vi.stubGlobal('fetch', fetchMock);

    const request = await createReviewRequest({
      sessionUid: 'session-123',
      input: {
        name: 'Rina',
        iacTool: 'terraform',
        cloudProvider: 'aws',
        code: JSON.stringify(terraformPlan, null, 2),
      },
    });

    expect(fetchMock).toHaveBeenCalledWith(
      'https://evidence-engine.onrender.com/v1/evidence/terraform-plan',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_uid: 'session-123',
          terraform_plan: terraformPlan,
        }),
      },
    );
    expect(request).toMatchObject({
      id: 'session-123',
      status: 'evidence_saved',
    });
  });

  it('rejects invalid Terraform plan JSON before posting', async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);

    await expect(
      createReviewRequest({
        sessionUid: 'session-123',
        input: {
          name: 'Rina',
          iacTool: 'terraform',
          cloudProvider: 'aws',
          code: '{ invalid json',
        },
      }),
    ).rejects.toThrow(/valid terraform plan json/i);

    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('reads review status from the evidence engine', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      Response.json({
        status: 'agents_running',
      }),
    );
    vi.stubGlobal('fetch', fetchMock);

    await expect(getReviewRequestStatus('session-123')).resolves.toMatchObject({
      id: 'session-123',
      status: 'agents_running',
      progress: 68,
    });
    expect(fetchMock).toHaveBeenCalledWith(
      'https://evidence-engine.onrender.com/v1/evidence/status/session-123',
      { method: 'GET' },
    );
  });

  it('keeps the evidence summary on summarized status responses', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
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
                  evidence_paths: ['resource_changes[0].change.after.server_side_encryption_configuration'],
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
    );
    vi.stubGlobal('fetch', fetchMock);

    await expect(getReviewRequestStatus('session-123')).resolves.toMatchObject({
      id: 'session-123',
      status: 'summarized',
      progress: 100,
      summary: {
        decision: 'block',
        risk_score: 80,
        resources: [
          {
            findings: [
              {
                frameworks: ['CIS AWS', 'SOC 2', 'ISO 27001'],
                reported_by: ['security-agent', 'compliance-agent'],
              },
            ],
          },
        ],
      },
    });
  });

  it('identifies terminal statuses', () => {
    expect(isTerminalStatus('summarized')).toBe(true);
    expect(isTerminalStatus('failed')).toBe(true);
    expect(isTerminalStatus('evidence_saved')).toBe(false);
    expect(isTerminalStatus('agents_running')).toBe(false);
  });
});
