import path from "node:path";
import fs from "node:fs";
import { readJsonFile } from "../utils/fs";

export interface LogEntry {
  timestamp?: string;
  level?: string;
  message?: string;
  service?: string;
  [key: string]: unknown;
}

export interface LogsResult {
  entries: LogEntry[];
}

const defaultLogs: LogsResult = { entries: [] };

/**
 * File-based logs adapter: load from fixtures/logs/{scenario}.json or a given path.
 */
export function loadLogsFromFile(
  scenarioOrPath: string,
  fixturesRoot: string
): LogsResult {
  const asPath = path.resolve(scenarioOrPath);
  if (fs.existsSync(asPath)) {
    return readJsonFile(asPath, defaultLogs);
  }
  const fixturePath = path.join(
    fixturesRoot,
    "logs",
    `${scenarioOrPath}.json`
  );
  return readJsonFile(fixturePath, defaultLogs);
}
