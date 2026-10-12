import path from "node:path";
import { describe, expect, it } from "vitest";

import { assertInsideWorkspace, workspacePath } from "../src/core/index.js";

describe("workspace path protection", () => {
  it("allows files inside the workspace", () => {
    const root = path.resolve("examples/demo");
    expect(workspacePath(root, "artifacts", "10-chapter-1.md")).toContain(root);
  });

  it("blocks path traversal", () => {
    const root = path.resolve("examples/demo");
    expect(() => assertInsideWorkspace(root, path.resolve(root, "../secret"))).toThrow(
      "escapes",
    );
  });
});
