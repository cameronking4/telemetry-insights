import type { IncidentPayload } from "./types";
import { createIncidentId } from "./types";

interface PostHogWebhookPayload {
  source?: string;
  funnel_id?: string;
  drop_pct?: number;
  [key: string]: unknown;
}

/**
 * Parse PostHog-style funnel regression webhook (e.g. from Zapier/Make).
 */
export function parsePostHogPayload(raw: unknown): IncidentPayload | null {
  const body = raw as PostHogWebhookPayload;
  if (!body || typeof body !== "object") return null;
  if (String(body.source) !== "posthog") return null;

  const funnelId = body.funnel_id != null ? String(body.funnel_id) : "unknown";
  const dropPct = typeof body.drop_pct === "number" ? body.drop_pct : 0;

  return {
    id: createIncidentId(),
    trigger: "posthog",
    startsAt: new Date().toISOString(),
    labels: { funnel_id: funnelId },
    annotations: { drop_pct: String(dropPct) },
    raw,
  };
}
