import type { IncidentPayload } from "./types";
import { createIncidentId } from "./types";

interface DeployWebhookPayload {
  source?: string;
  provider?: string;
  deployment_id?: string;
  repo?: string;
  branch?: string;
  error_message?: string;
  [key: string]: unknown;
}

/**
 * Parse generic deploy failure webhook (Vercel/GHA manual POST, etc.).
 */
export function parseDeployPayload(raw: unknown): IncidentPayload | null {
  const body = raw as DeployWebhookPayload;
  if (!body || typeof body !== "object") return null;
  if (String(body.source) !== "deploy") return null;

  const labels: Record<string, string> = {};
  if (body.provider) labels.provider = String(body.provider);
  if (body.repo) labels.repo = String(body.repo);
  if (body.branch) labels.branch = String(body.branch);
  if (body.deployment_id) labels.deployment_id = String(body.deployment_id);

  const annotations: Record<string, string> = {};
  if (body.error_message) annotations.error_message = String(body.error_message);

  return {
    id: createIncidentId(),
    trigger: "deploy",
    startsAt: new Date().toISOString(),
    labels,
    annotations,
    raw,
  };
}
