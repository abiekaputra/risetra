import { mkdtemp, readFile, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";

import { initializeWorkspace, loadWorkspace } from "../src/core/index.js";

const temporaryRoots: string[] = [];

afterEach(async () => {
  await Promise.all(
    temporaryRoots.splice(0).map((root) => rm(root, { recursive: true })),
  );
});

describe("workspace initialization", () => {
  it("creates a cross-discipline workspace with explicit language settings", async () => {
    const parent = await mkdtemp(path.join(os.tmpdir(), "risetra-init-"));
    temporaryRoots.push(parent);
    const target = path.join(parent, "proposal");
    await initializeWorkspace({
      target,
      projectName: "Community archive access",
      studentName: "Example Student",
      institution: "Example University",
      discipline: "History",
      methodology: "Archival research",
      proposalLanguage: "id-ID",
    });

    const workspace = await loadWorkspace(target);
    expect(workspace.config.discipline).toBe("History");
    expect(workspace.config.languages.proposal).toBe("id-ID");
    expect(workspace.config.setup?.completed).toBe(false);
    expect(workspace.artifacts.map((artifact) => artifact.id)).toContain("chapter-3");
    expect(await readFile(path.join(target, ".gitignore"), "utf8")).toContain(
      "inputs/",
    );
    expect(await readFile(path.join(target, "AGENTS.md"), "utf8")).toContain(
      "Never invent a source",
    );
    expect(
      await readFile(
        path.join(target, ".risetra", "modules", "core", "academic-integrity.md"),
        "utf8",
      ),
    ).toContain("academic-integrity");
  });
});
