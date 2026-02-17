import path from "node:path";
import fs from "node:fs";
import type { DevinSession } from "../devin/v1";

export interface TriageReportParsed {
  status?: string;
  impactedServices?: string[];
  rootCauseHypothesis?: string;
  confidence?: number;
  suggestedAction?: string;
  missingTelemetry?: string[];
  telemetryImprovements?: Array<{
    target?: string;
    change?: string;
    rationale?: string;
  }>;
  pr?: { url?: string; title?: string };
}

function parseStructuredOutput(session: DevinSession): TriageReportParsed {
  const raw =
    session.structured_output ??
    (session.data as { structured_output?: unknown } | undefined)?.structured_output;
  if (!raw || typeof raw !== "object") return {};
  return raw as TriageReportParsed;
}

/**
 * Render structured output as markdown.
 */
export function renderTriageReportMarkdown(
  parsed: TriageReportParsed,
  incidentId: string,
  sessionUrl?: string
): string {
  const lines: string[] = [
    `# Incident Triage Report: ${incidentId}`,
    "",
    "## Summary",
    "",
    `- **Status:** ${parsed.status ?? "—"}`,
    `- **Impacted services:** ${(parsed.impactedServices ?? []).join(", ") || "—"}`,
    `- **Root cause hypothesis:** ${parsed.rootCauseHypothesis ?? "—"}`,
    `- **Confidence:** ${parsed.confidence != null ? parsed.confidence : "—"}`,
    `- **Suggested action:** ${parsed.suggestedAction ?? "—"}`,
    "",
  ];

  if (sessionUrl) {
    lines.push(`**Devin session:** ${sessionUrl}`, "");
  }

  if (parsed.pr?.url) {
    lines.push(`**Pull request:** ${parsed.pr.url}`, "");
  }

  if ((parsed.missingTelemetry ?? []).length > 0) {
    lines.push("## Missing telemetry", "");
    for (const t of parsed.missingTelemetry!) {
      lines.push(`- ${t}`);
    }
    lines.push("");
  }

  if ((parsed.telemetryImprovements ?? []).length > 0) {
    lines.push("## Telemetry improvements", "");
    for (const t of parsed.telemetryImprovements!) {
      lines.push(`- **${t.target}**: ${t.change} — ${t.rationale ?? ""}`);
    }
    lines.push("");
  }

  return lines.join("\n");
}

/**
 * Parse session structured output and write markdown report to reportPath.
 */
export function writeTriageReport(
  session: DevinSession,
  incidentId: string,
  reportPath: string
): { reportFilePath: string; parsed: TriageReportParsed } {
  const parsed = parseStructuredOutput(session);
  const markdown = renderTriageReportMarkdown(
    parsed,
    incidentId,
    session.url
  );

  fs.mkdirSync(path.dirname(reportPath), { recursive: true });
  const reportFilePath = path.join(reportPath, `${incidentId}.md`);
  fs.writeFileSync(reportFilePath, markdown, "utf8");

  return { reportFilePath, parsed };
}
