#!/usr/bin/env node
import path from "node:path";
import fs from "node:fs";
import {
  loadConfigOrDefault,
  validateConfig,
  runTriage,
  normalizePayload,
} from "./index";
import { devinListSessions } from "./devin/v1";
import { startWebhookServer } from "./webhook/server";
import type { IncidentPayload } from "./signals/types";

// Load .env if present
try {
  require("dotenv").config();
} catch {
  // dotenv optional
}

const DEMO_SCENARIOS = ["high-error-rate", "latency-spike", "deploy-failure"];

function getFixturesRoot(): string {
  return path.resolve(process.cwd(), "fixtures");
}

function listFixtureNames(): string[] {
  const root = path.join(getFixturesRoot(), "signals");
  if (!fs.existsSync(root)) return [];
  const names: string[] = [];
  for (const sub of fs.readdirSync(root)) {
    const subPath = path.join(root, sub);
    if (!fs.statSync(subPath).isDirectory()) continue;
    for (const f of fs.readdirSync(subPath)) {
      if (f.endsWith(".json")) {
        names.push(f.replace(/\.json$/, ""));
      }
    }
  }
  return [...new Set(names)].sort();
}

function findFixturePayload(name: string): { raw: unknown; logsScenario: string } | null {
  const signalsRoot = path.join(getFixturesRoot(), "signals");
  if (!fs.existsSync(signalsRoot)) return null;
  for (const sub of fs.readdirSync(signalsRoot)) {
    const f = path.join(signalsRoot, sub, `${name}.json`);
    if (fs.existsSync(f)) {
      const raw = JSON.parse(fs.readFileSync(f, "utf8"));
      return { raw, logsScenario: name };
    }
  }
  return null;
}

function getDemoPayload(name: string): { raw: unknown; logsScenario: string } | null {
  const map: Record<string, string> = {
    "high-error-rate": "prometheus",
    "latency-spike": "prometheus",
    "deploy-failure": "deploy",
  };
  const sub = map[name];
  if (!sub) return null;
  const fixtureName =
    name === "deploy-failure" ? "vercel-build-failure" : name;
  const p = path.join(getFixturesRoot(), "signals", sub, `${fixtureName}.json`);
  if (!fs.existsSync(p)) return null;
  const raw = JSON.parse(fs.readFileSync(p, "utf8"));
  return { raw, logsScenario: name };
}

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const command = args[0];

  if (command === "validate") {
    const configPath = args[1] ?? "incident-triage.yaml";
    try {
      validateConfig(configPath);
      console.log("Config is valid.");
    } catch (err) {
      console.error(err);
      process.exit(1);
    }
    return;
  }

  if (command === "run") {
    let fixtureName: string | undefined;
    let demoName: string | undefined;
    let payloadPath: string | undefined;
    for (let i = 1; i < args.length; i++) {
      if (args[i] === "--fixture" && args[i + 1]) {
        fixtureName = args[++i];
      } else if (args[i] === "--demo") {
        demoName = args[i + 1];
        if (demoName?.startsWith("--")) demoName = undefined;
        else if (demoName) i++;
      } else if (args[i] === "--payload" && args[i + 1]) {
        payloadPath = args[++i];
      }
    }

    if (payloadPath) {
      const raw = JSON.parse(fs.readFileSync(path.resolve(payloadPath), "utf8"));
      const githubEvent = process.env.GITHUB_EVENT;
      const incident = normalizePayload(raw, {
        githubEvent,
      });
      if (!incident) {
        console.error("Could not parse payload.");
        process.exit(1);
      }
      await runTriageWithIncident(incident, undefined);
      return;
    }

    if (demoName !== undefined) {
      if (!DEMO_SCENARIOS.includes(demoName)) {
        console.error(
          `Unknown demo: ${demoName}. Available: ${DEMO_SCENARIOS.join(", ")}`
        );
        process.exit(1);
      }
      const demo = getDemoPayload(demoName);
      if (!demo) {
        console.error(`Demo payload not found for: ${demoName}`);
        process.exit(1);
      }
      const incident = normalizePayload(demo.raw);
      if (!incident) {
        console.error("Could not parse demo payload.");
        process.exit(1);
      }
      await runTriageWithIncident(incident, demo.logsScenario);
      return;
    }

    if (fixtureName !== undefined) {
      const found = findFixturePayload(fixtureName);
      if (!found) {
        console.error(`Fixture not found: ${fixtureName}`);
        console.error("Available fixtures:", listFixtureNames().join(", "));
        process.exit(1);
      }
      const incident = normalizePayload(found.raw);
      if (!incident) {
        console.error("Could not parse fixture payload.");
        process.exit(1);
      }
      await runTriageWithIncident(incident, found.logsScenario);
      return;
    }

    // --demo without name: list
    if (args.includes("--demo") && !demoName) {
      console.log("Available demos:", DEMO_SCENARIOS.join(", "));
      return;
    }

    // --fixture without name: list
    if (args.includes("--fixture") && fixtureName === undefined) {
      const list = listFixtureNames();
      console.log("Available fixtures:", list.length ? list.join(", ") : "(none)");
      return;
    }

    console.error("Usage: incident-triage run --fixture <name> | --demo [name] | --payload <path>");
    process.exit(1);
  }

  if (command === "status") {
    const apiKey = process.env.DEVIN_API_KEY;
    if (!apiKey) {
      console.error("DEVIN_API_KEY is required.");
      process.exit(1);
    }
    try {
      const sessions = await devinListSessions(apiKey, {
        tag: "incident-triage",
        limit: 20,
      });
      console.log("Recent incident-triage sessions:");
      for (const s of sessions) {
        console.log(`  ${s.session_id} ${s.url ?? ""}`);
      }
    } catch (err) {
      console.error(err);
      process.exit(1);
    }
    return;
  }

  if (command === "webhook-server") {
    let port = 3000;
    const portIdx = args.indexOf("--port");
    if (portIdx >= 0 && args[portIdx + 1]) {
      port = parseInt(args[portIdx + 1], 10);
    }
    startWebhookServer(port);
    return;
  }

  console.log(`Usage: incident-triage <validate|run|status|webhook-server>`);
  console.log("  validate [configPath]");
  console.log("  run --fixture <name>   (list if name omitted)");
  console.log("  run --demo [name]      (list if name omitted)");
  console.log("  run --payload <path>");
  console.log("  status --since 24h");
  console.log("  webhook-server [--port 3000]");
  process.exit(1);
}

async function runTriageWithIncident(
  incident: IncidentPayload,
  logsScenario?: string
): Promise<void> {
  const apiKey = process.env.DEVIN_API_KEY;
  if (!apiKey) {
    console.error("DEVIN_API_KEY is required. Add it to .env or the environment.");
    process.exit(1);
  }
  try {
    const result = await runTriage(incident, apiKey, { logsScenario });
    console.log("Session:", result.sessionUrl);
    if (result.reportPath) console.log("Report:", result.reportPath);
    if (result.prUrl) console.log("PR:", result.prUrl);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
