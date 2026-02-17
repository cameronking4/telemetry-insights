import type { IncidentPayload } from "./types";
import { createIncidentId } from "./types";

/** GitHub deployment_status webhook */
interface DeploymentStatusPayload {
  action?: string;
  deployment_status?: {
    state?: string;
    target_url?: string;
    description?: string;
    created_at?: string;
  };
  deployment?: { ref?: string; sha?: string };
  repository?: { full_name?: string };
}

/** GitHub check_run webhook */
interface CheckRunPayload {
  action?: string;
  check_run?: {
    conclusion?: string;
    name?: string;
    html_url?: string;
    output?: { title?: string; summary?: string };
    completed_at?: string;
  };
  repository?: { full_name?: string };
}

/** GitHub workflow_run webhook */
interface WorkflowRunPayload {
  action?: string;
  workflow_run?: {
    conclusion?: string;
    name?: string;
    html_url?: string;
    created_at?: string;
  };
  repository?: { full_name?: string };
}

function repoFullName(payload: {
  repository?: { full_name?: string };
}): string {
  return payload.repository?.full_name ?? "unknown/unknown";
}

/**
 * Parse GitHub deployment_status. Trigger when state is error or failure.
 */
export function parseGitHubDeploymentStatus(raw: unknown): IncidentPayload | null {
  const body = raw as DeploymentStatusPayload;
  if (!body?.deployment_status) return null;
  const state = String(body.deployment_status.state).toLowerCase();
  if (state !== "error" && state !== "failure") return null;

  const ds = body.deployment_status;
  return {
    id: createIncidentId(),
    trigger: "github",
    startsAt: ds.created_at ?? new Date().toISOString(),
    labels: {
      repo: repoFullName(body),
      event: "deployment_status",
      state,
    },
    annotations: {
      target_url: ds.target_url ?? "",
      description: ds.description ?? "",
    },
    raw,
  };
}

/**
 * Parse GitHub check_run. Trigger when conclusion is failure.
 */
export function parseGitHubCheckRun(raw: unknown): IncidentPayload | null {
  const body = raw as CheckRunPayload;
  if (!body?.check_run) return null;
  const conclusion = String(body.check_run.conclusion).toLowerCase();
  if (conclusion !== "failure" && conclusion !== "cancelled") return null;

  const cr = body.check_run;
  return {
    id: createIncidentId(),
    trigger: "github",
    startsAt: cr.completed_at ?? new Date().toISOString(),
    labels: {
      repo: repoFullName(body),
      event: "check_run",
      check_name: cr.name ?? "unknown",
    },
    annotations: {
      html_url: cr.html_url ?? "",
      summary: cr.output?.summary ?? cr.output?.title ?? "",
    },
    raw,
  };
}

/**
 * Parse GitHub workflow_run. Trigger when conclusion is failure.
 */
export function parseGitHubWorkflowRun(raw: unknown): IncidentPayload | null {
  const body = raw as WorkflowRunPayload;
  if (!body?.workflow_run) return null;
  const conclusion = String(body.workflow_run.conclusion).toLowerCase();
  if (conclusion !== "failure" && conclusion !== "cancelled") return null;

  const wr = body.workflow_run;
  return {
    id: createIncidentId(),
    trigger: "github",
    startsAt: wr.created_at ?? new Date().toISOString(),
    labels: {
      repo: repoFullName(body),
      event: "workflow_run",
      workflow: wr.name ?? "unknown",
    },
    annotations: {
      html_url: wr.html_url ?? "",
    },
    raw,
  };
}

export type GitHubEventType = "deployment_status" | "check_run" | "workflow_run";

const parsers: Record<
  GitHubEventType,
  (raw: unknown) => IncidentPayload | null
> = {
  deployment_status: parseGitHubDeploymentStatus,
  check_run: parseGitHubCheckRun,
  workflow_run: parseGitHubWorkflowRun,
};

/**
 * Parse GitHub webhook by event type (X-GitHub-Event header).
 */
export function parseGitHubPayload(
  raw: unknown,
  event: string
): IncidentPayload | null {
  const key = event as GitHubEventType;
  const parse = parsers[key];
  if (!parse) return null;
  return parse(raw);
}
