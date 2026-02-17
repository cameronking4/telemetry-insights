import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="flex flex-col justify-center text-center flex-1 px-6">
      <h1 className="text-4xl font-bold mb-4 tracking-tight">
        Incident Triage
      </h1>
      <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
        Turn production alerts into AI-driven triage. One flow: webhook or fixture → structured evidence → Devin → root-cause report and optional patch/telemetry PRs. Human always approves.
      </p>
      <div className="flex flex-wrap gap-4 justify-center">
        <Link
          href="/docs"
          className="inline-flex items-center justify-center rounded-lg bg-primary px-6 py-3 text-primary-foreground font-medium hover:opacity-90"
        >
          Documentation
        </Link>
        <Link
          href="/docs/quick-start"
          className="inline-flex items-center justify-center rounded-lg border border-border px-6 py-3 font-medium hover:bg-accent"
        >
          Quick Start
        </Link>
        <Link
          href="/docs/cli-reference"
          className="inline-flex items-center justify-center rounded-lg border border-border px-6 py-3 font-medium hover:bg-accent"
        >
          CLI Reference
        </Link>
      </div>
      <p className="mt-12 text-sm text-muted-foreground max-w-xl mx-auto">
        POC-first. Fixture-driven. No production traffic required to run. Built with Devin, TypeScript, and Fumadocs.
      </p>
    </div>
  );
}
