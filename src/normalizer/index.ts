import path from "node:path";
import os from "node:os";
import type { IncidentPayload } from "../signals/types";
import { fetchCommitsFromGit, isGitRepo } from "./commits";
import { loadLogsFromFile } from "./logs";
import { buildEvidencePackage } from "./package";

export type { CommitInfo } from "./commits";
export type { LogsResult, LogEntry } from "./logs";
export type { EvidencePackage, PackageResult } from "./package";

export interface NormalizeOptions {
  /** Root directory for fixtures (default: project fixtures) */
  fixturesRoot?: string;
  /** Commit depth for git log */
  commitDepth?: number;
  /** Scenario name for logs (e.g. high-error-rate) */
  logsScenario?: string;
}

/**
 * Orchestrate: take incident payload, fetch commits + logs, package evidence.
 */
export async function normalize(
  incident: IncidentPayload,
  options: NormalizeOptions = {}
): Promise<{ evidencePath: string; dirPath: string; evidence: import("./package").EvidencePackage }> {
  const fixturesRoot =
    options.fixturesRoot ??
    path.resolve(process.cwd(), "fixtures");
  const commitDepth = options.commitDepth ?? 10;
  const logsScenario =
    options.logsScenario ?? incident.labels?.service ?? "high-error-rate";

  const cwd = process.cwd();
  let commitInfo: import("./commits").CommitInfo;

  if (isGitRepo(cwd)) {
    commitInfo = await fetchCommitsFromGit(cwd, commitDepth);
  } else {
    commitInfo = {
      commits: [],
      diffSummary: "(no git repo)",
      baseSha: "",
      headSha: "",
    };
  }

  const logs = loadLogsFromFile(logsScenario, fixturesRoot);
  const outDir = path.join(os.tmpdir(), `incident-triage-${incident.id}`);
  const result = buildEvidencePackage(incident, commitInfo, logs, outDir);
  return result;
}
