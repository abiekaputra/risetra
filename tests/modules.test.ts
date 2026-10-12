import path from "node:path";
import { readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";

import { loadResearchModules, validateModuleGraph } from "../src/core/index.js";

describe("research modules", () => {
  it("have valid metadata and dependency references", async () => {
    const modules = await loadResearchModules(path.resolve("modules"));
    expect(modules.length).toBeGreaterThanOrEqual(10);
    expect(validateModuleGraph(modules)).toEqual([]);
  });

  it("remain in human-reviewable draft status", async () => {
    const modules = await loadResearchModules(path.resolve("modules"));
    expect(modules.every((module) => module.status === "DRAFT")).toBe(true);
  });

  it("provides every method pack required by the initial evaluation cases", async () => {
    const modules = await loadResearchModules(path.resolve("modules"));
    const cases = JSON.parse(
      await readFile(path.resolve("evals/cases/method-routing.json"), "utf8"),
    ) as { expectedPack: string }[];
    const ids = new Set(modules.map((module) => module.id));

    expect(cases.every((item) => ids.has(item.expectedPack))).toBe(true);
  });
});
