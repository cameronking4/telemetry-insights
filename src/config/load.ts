import fs from "node:fs";
import path from "node:path";
import yaml from "js-yaml";
import { incidentTriageConfigSchema, type IncidentTriageConfig } from "./schema";

export function loadConfig(
  configPath = "incident-triage.yaml"
): IncidentTriageConfig {
  const resolved = path.resolve(configPath);
  if (!fs.existsSync(resolved)) {
    throw new Error(`Config file not found: ${resolved}`);
  }

  const parsed = yaml.load(fs.readFileSync(resolved, "utf8"));
  const result = incidentTriageConfigSchema.safeParse(parsed);
  if (!result.success) {
    const message = result.error.errors
      .map((e) => `${e.path.join(".") || "root"}: ${e.message}`)
      .join("\n");
    throw new Error(`Invalid config:\n${message}`);
  }

  return result.data;
}

/** Load config if file exists; otherwise return defaults (for demo/fixture runs). */
export function loadConfigOrDefault(
  configPath = "incident-triage.yaml"
): IncidentTriageConfig {
  const resolved = path.resolve(configPath);
  if (!fs.existsSync(resolved)) {
    return incidentTriageConfigSchema.parse({ version: 1 });
  }
  return loadConfig(configPath);
}
