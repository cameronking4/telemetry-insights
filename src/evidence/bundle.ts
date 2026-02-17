import path from "node:path";
import type { IncidentPayload } from "../signals/types";
import { execCommand } from "../utils/exec";
import { writeJsonFile } from "../utils/fs";

export interface EvidenceBundleResult {
  bundleDir: string;
  archivePath: string;
  manifestPath: string;
}

/**
 * Add manifest to an existing evidence dir and create a tar.gz archive.
 */
export async function buildEvidenceBundle(
  dirPath: string,
  incident: IncidentPayload
): Promise<EvidenceBundleResult> {
  const manifestPath = path.join(dirPath, "manifest.json");
  writeJsonFile(manifestPath, {
    incidentId: incident.id,
    trigger: incident.trigger,
    startsAt: incident.startsAt,
    timestamp: new Date().toISOString(),
  });

  const parent = path.dirname(dirPath);
  const name = path.basename(dirPath);
  const archivePath = `${dirPath}.tar.gz`;

  const tarResult = await execCommand(
    `tar -czf ${JSON.stringify(archivePath)} -C ${JSON.stringify(parent)} ${JSON.stringify(name)}`
  );
  if (tarResult.exitCode !== 0) {
    throw new Error(
      `Failed to create evidence archive: ${tarResult.stderr || tarResult.stdout}`
    );
  }

  return {
    bundleDir: dirPath,
    archivePath,
    manifestPath,
  };
}
