import path from "node:path";
import { describe, expect, it } from "vitest";

import { loadWorkspace, validateWorkspace } from "../src/core/index.js";

const demoRoot = path.resolve("examples/demo");

describe("workspace validation", () => {
  it("accepts the traceable synthetic demo", async () => {
    const snapshot = await loadWorkspace(demoRoot);
    const report = validateWorkspace(snapshot);

    expect(report.valid).toBe(true);
    expect(report.counts.error).toBe(0);
    expect(report.counts.info).toBe(1);
  });

  it("rejects citations absent from the source inventory", async () => {
    const snapshot = await loadWorkspace(demoRoot);
    snapshot.artifacts[0]!.body += "\nUnsupported [SRC-UNKNOWN].";
    const report = validateWorkspace(snapshot);

    expect(report.valid).toBe(false);
    expect(report.issues).toContainEqual(
      expect.objectContaining({
        code: "SOURCE_UNKNOWN",
        artifactId: "research-charter",
      }),
    );
  });

  it("rejects duplicate question mappings", async () => {
    const snapshot = await loadWorkspace(demoRoot);
    snapshot.alignment.push({ ...snapshot.alignment[0]! });
    const report = validateWorkspace(snapshot);

    expect(report.issues.map((issue) => issue.code)).toContain("QUESTION_DUPLICATE");
    expect(report.issues.map((issue) => issue.code)).toContain("OBJECTIVE_DUPLICATE");
  });
});
