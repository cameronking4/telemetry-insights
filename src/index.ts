import { loadConfig, loadConfigOrDefault } from "./config/load";
import { validateConfig } from "./config/validate";
import { normalizePayload } from "./signals/normalize";
import { normalize } from "./normalizer";
import {
  devinUploadAttachment,
  devinCreateSession,
  pollUntilTerminal,
} from "./devin/v1";
import { TriageReportSchema } from "./devin/schemas";
import { buildTriagePlaybookPrompt } from "./devin/prompts";
import { writeTriageReport } from "./outputs/triage-report";
import { buildEvidenceBundle } from "./evidence/bundle";
import type { IncidentPayload } from "./signals/types";
import type { IncidentTriageConfig } from "./config/schema";

export { loadConfig, loadConfigOrDefault, validateConfig };
export type { IncidentTriageConfig } from "./config/schema";
export type { IncidentPayload } from "./signals/types";
export { normalizePayload } from "./signals/normalize";

export interface RunTriageOptions {
  config?: IncidentTriageConfig;
  configPath?: string;
  /** For fixture/demo: scenario name for logs (e.g. high-error-rate) */
  logsScenario?: string;
}

export interface RunTriageResult {
  incidentId: string;
  sessionUrl: string;
  reportPath?: string;
  prUrl?: string;
}

/**
 * Run full triage: normalize payload -> evidence -> Devin session -> report.
 */
export async function runTriage(
  incident: IncidentPayload,
  apiKey: string,
  options: RunTriageOptions = {}
): Promise<RunTriageResult> {
  const config =
    options.config ??
    (options.configPath
      ? loadConfig(options.configPath)
      : loadConfigOrDefault());

  const { evidencePath, dirPath, evidence } = await normalize(incident, {
    commitDepth: config.normalizer.commitDepth,
    logsScenario:
      options.logsScenario ?? incident.labels?.service ?? "high-error-rate",
  });

  const { archivePath } = await buildEvidenceBundle(dirPath, incident);
  const attachmentUrl = await devinUploadAttachment(apiKey, archivePath);

  const prompt = buildTriagePlaybookPrompt({
    incident,
    evidence,
    attachmentUrls: [attachmentUrl],
    repoUrl: config.services[0]?.repo
      ? `https://github.com/${config.services[0].repo}`
      : undefined,
    createPatchPr: config.outputs.createPatchPr,
    createTelemetryPr: config.outputs.createTelemetryPr,
  });

  const session = await devinCreateSession(apiKey, {
    prompt,
    unlisted: config.devin.unlisted,
    max_acu_limit: config.devin.maxAcuLimit,
    tags: [...new Set([...(config.devin.tags ?? []), "incident-triage"])],
    attachments: [attachmentUrl],
    structured_output: { schema: TriageReportSchema },
    metadata: {
      incidentId: incident.id,
      trigger: incident.trigger,
    },
  });

  const finalSession = await pollUntilTerminal(apiKey, session.session_id);

  const reportDir = config.outputs.reportPath;
  const { reportFilePath, parsed } = writeTriageReport(
    finalSession,
    incident.id,
    reportDir
  );

  const prUrl =
    parsed.pr?.url ??
    (finalSession as { pull_request_url?: string }).pull_request_url ??
    (finalSession as { pr_url?: string }).pr_url;

  return {
    incidentId: incident.id,
    sessionUrl: session.url,
    reportPath: reportFilePath,
    prUrl,
  };
}
