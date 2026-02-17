import type { IncidentPayload } from "../signals/types";
import type { EvidencePackage } from "../normalizer/package";

function attachmentBlock(attachmentUrls: string[]): string {
  return attachmentUrls
    .map((url, i) => `- ATTACHMENT ${i + 1}: ${url}`)
    .join("\n");
}

export interface TriagePlaybookInput {
  incident: IncidentPayload;
  evidence: EvidencePackage;
  attachmentUrls: string[];
  repoUrl?: string;
  createPatchPr: boolean;
  createTelemetryPr: boolean;
}

/**
 * Build deterministic triage playbook prompt for Devin.
 */
export function buildTriagePlaybookPrompt(input: TriagePlaybookInput): string {
  const { incident, evidence, attachmentUrls, repoUrl } = input;
  const lines: string[] = [
    "You are Devin. Task: perform incident triage using the attached evidence.",
    "",
    "EVIDENCE (attachments):",
    attachmentBlock(attachmentUrls),
    "",
    "INCIDENT CONTEXT:",
    `- Trigger: ${incident.trigger}`,
    `- Started: ${incident.startsAt}`,
    `- Labels: ${JSON.stringify(incident.labels)}`,
    `- Annotations: ${JSON.stringify(incident.annotations)}`,
    "",
    "EVIDENCE SUMMARY (from attachment):",
    `- Recent commits (${evidence.commits.length}): ${evidence.commits.slice(0, 5).join(", ")}${evidence.commits.length > 5 ? " ..." : ""}`,
    `- Diff summary: ${evidence.diffSummary.slice(0, 500)}${evidence.diffSummary.length > 500 ? "..." : ""}`,
    `- Log entries: ${evidence.logs.entries.length}`,
    "",
    "PLAYBOOK (deterministic):",
    "1. Identify impacted services from the incident labels and log entries.",
    "2. Correlate recent commits (in the attachment) with the time window of the incident.",
    "3. Search the log entries in the attachment for errors, timeouts, or exceptions.",
    "4. Propose a root cause hypothesis and assign a confidence score (0-1).",
    "5. Suggest an action: patch (if you can propose a fix), rollback (if recent deploy likely caused it), investigate (if unclear), or none.",
    "6. List missing telemetry (counters, spans, logs) that would have made triage easier.",
    "7. If createPatchPr is true and you have a clear fix: open a single pull request with the patch. Include root cause and hypothesis in the PR description.",
    "8. If createTelemetryPr is true: list telemetry improvements in structured output; you may open a second PR for observability improvements.",
    "",
    "Structured Output:",
    "Maintain the provided JSON schema. Update status as you progress (ANALYZING → HYPOTHESIS → PATCH_PROPOSED or BLOCKED → DONE). If you open a PR, set pr.url.",
    "",
    "Goal: Produce a triage report (structured output) and optionally open PR(s) for patch and/or telemetry.",
  ];

  if (repoUrl) {
    lines.push("", `Repository (for opening PRs): ${repoUrl}`);
  }

  return lines.join("\n");
}
