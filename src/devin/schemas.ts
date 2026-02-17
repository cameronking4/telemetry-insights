/** JSON Schema for Devin structured output: triage report + optional PR + telemetry improvements */
export const TriageReportSchema = {
  type: "object",
  additionalProperties: false,
  required: [
    "status",
    "impactedServices",
    "rootCauseHypothesis",
    "confidence",
    "suggestedAction",
    "missingTelemetry",
  ],
  properties: {
    status: {
      type: "string",
      enum: ["ANALYZING", "HYPOTHESIS", "PATCH_PROPOSED", "BLOCKED", "DONE"],
    },
    impactedServices: {
      type: "array",
      items: { type: "string" },
    },
    rootCauseHypothesis: { type: "string" },
    confidence: { type: "number", minimum: 0, maximum: 1 },
    suggestedAction: {
      type: "string",
      enum: ["patch", "rollback", "investigate", "none"],
    },
    missingTelemetry: {
      type: "array",
      items: { type: "string" },
    },
    telemetryImprovements: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          target: { type: "string" },
          change: { type: "string" },
          rationale: { type: "string" },
        },
      },
    },
    pr: {
      type: "object",
      additionalProperties: false,
      properties: {
        url: { type: "string" },
        title: { type: "string" },
      },
    },
  },
} as const;
