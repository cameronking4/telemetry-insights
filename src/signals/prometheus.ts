import type { IncidentPayload } from "./types";
import { createIncidentId } from "./types";

/** Alertmanager v4 webhook payload shape */
interface PrometheusWebhookPayload {
  version?: string;
  status?: string;
  groupKey?: string;
  alerts?: Array<{
    status?: string;
    labels?: Record<string, string>;
    annotations?: Record<string, string>;
    startsAt?: string;
    endsAt?: string;
    generatorURL?: string;
  }>;
  commonLabels?: Record<string, string>;
  commonAnnotations?: Record<string, string>;
}

/**
 * Parse Prometheus Alertmanager v4 webhook. Only triggers on status === "firing".
 */
export function parsePrometheusPayload(
  raw: unknown,
  labelFilters?: Record<string, string>
): IncidentPayload | null {
  const body = raw as PrometheusWebhookPayload;
  if (!body || typeof body !== "object") return null;
  if (String(body.status) !== "firing") return null;

  const alerts = Array.isArray(body.alerts) ? body.alerts : [];
  const firingAlerts = alerts.filter(
    (a) => String(a?.status) === "firing" && a.startsAt
  );
  if (firingAlerts.length === 0) return null;

  for (const filter of Object.entries(labelFilters ?? {})) {
    const [key, value] = filter;
    const match = firingAlerts.some(
      (a) => a.labels && String(a.labels[key]) === value
    );
    if (!match) return null;
  }

  const first = firingAlerts[0];
  const startsAt = first.startsAt ?? new Date().toISOString();
  const labels = { ...body.commonLabels, ...first.labels } as Record<
    string,
    string
  >;
  const annotations = {
    ...body.commonAnnotations,
    ...first.annotations,
  } as Record<string, string>;

  return {
    id: createIncidentId(),
    trigger: "prometheus",
    startsAt,
    labels,
    annotations,
    raw,
  };
}
