import path from "node:path";
import fs from "node:fs";
import type { IncidentPayload } from "../signals/types";
import type { CommitInfo } from "./commits";
import type { LogsResult } from "./logs";
import { writeJsonFile } from "../utils/fs";

export interface EvidencePackage {
  incident: IncidentPayload;
  commits: string[];
  diffSummary: string;
  baseSha: string;
  headSha: string;
  logs: LogsResult;
}

export interface PackageResult {
  /** Path to the directory containing evidence.json (for attachment) */
  dirPath: string;
  /** Path to evidence.json */
  evidencePath: string;
  evidence: EvidencePackage;
}

/**
 * Build evidence JSON and write to a temp dir. Returns paths for attachment.
 */
export function buildEvidencePackage(
  incident: IncidentPayload,
  commitInfo: CommitInfo,
  logs: LogsResult,
  outDir: string
): PackageResult {
  const evidence: EvidencePackage = {
    incident,
    commits: commitInfo.commits,
    diffSummary: commitInfo.diffSummary,
    baseSha: commitInfo.baseSha,
    headSha: commitInfo.headSha,
    logs,
  };

  fs.mkdirSync(outDir, { recursive: true });
  const evidencePath = path.join(outDir, "evidence.json");
  writeJsonFile(evidencePath, evidence);

  return {
    dirPath: outDir,
    evidencePath,
    evidence,
  };
}
