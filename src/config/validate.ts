import { loadConfig } from "./load";

/**
 * Validate incident-triage.yaml. Throws if invalid or missing.
 */
export function validateConfig(configPath = "incident-triage.yaml"): void {
  loadConfig(configPath);
}
