import { mkdtemp, readFile, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";

import { exportProposal, loadWorkspace } from "../src/core/index.js";

const temporaryRoots: string[] = [];

afterEach(async () => {
  await Promise.all(
    temporaryRoots.splice(0).map((root) => rm(root, { recursive: true })),
  );
});

describe("proposal export", () => {
  it("exports all reviewed chapters when explicitly allowed", async () => {
    const root = await mkdtemp(path.join(os.tmpdir(), "risetra-export-"));
    temporaryRoots.push(root);
    const snapshot = await loadWorkspace(path.resolve("examples/demo"));
    snapshot.root = root;

    const target = await exportProposal(snapshot, true);
    const output = await readFile(target, "utf8");
    expect(output).toContain("Bab 1 · Pendahuluan");
    expect(output).toContain("Bab 3 · Metodologi");
  });

  it("blocks export when chapters have not reached the threshold", async () => {
    const snapshot = await loadWorkspace(path.resolve("examples/demo"));
    await expect(exportProposal(snapshot, false)).rejects.toThrow("requires Chapters");
  });
});
