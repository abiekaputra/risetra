import { chmod, cp, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";

import { CodexRuntime } from "../src/server/agent/codex-runtime.js";

const temporaryRoots: string[] = [];
const originalBinary = process.env.RISETRA_CODEX_BIN;

afterEach(async () => {
  if (originalBinary) process.env.RISETRA_CODEX_BIN = originalBinary;
  else delete process.env.RISETRA_CODEX_BIN;
  await Promise.all(
    temporaryRoots.splice(0).map((root) => rm(root, { recursive: true })),
  );
});

async function fakeCodex(root: string): Promise<string> {
  const filename = path.join(root, "fake-codex.mjs");
  await writeFile(
    filename,
    `#!/usr/bin/env node
import { writeFileSync } from "node:fs";
const args = process.argv.slice(2);
if (args[0] === "--version") { console.log("codex-cli test"); process.exit(0); }
if (args[0] === "login") { console.log("Logged in using test"); process.exit(0); }
let input = "";
for await (const chunk of process.stdin) input += chunk;
const outputIndex = args.indexOf("--output-last-message");
const output = {
  summary: "Fondasi penelitian sudah dibaca.",
  explanation: "Pertanyaan awal memastikan masalah dapat dibuktikan.",
  question: "Bukti apa yang menunjukkan masalah ini terjadi?",
  stage: "foundation",
  stageStatus: "waiting_input",
  decisions: [],
  evidenceNeeded: ["Bukti kondisi aktual"],
  changedArtifacts: []
};
writeFileSync(args[outputIndex + 1], JSON.stringify(output));
console.log(JSON.stringify({ type: "thread.started", thread_id: "11111111-1111-4111-8111-111111111111" }));
`,
    "utf8",
  );
  await chmod(filename, 0o755);
  return filename;
}

async function waitForTurn(runtime: CodexRuntime) {
  for (let attempt = 0; attempt < 30; attempt += 1) {
    const state = await runtime.state();
    if (state.status !== "running") return state;
    await new Promise((resolve) => setTimeout(resolve, 50));
  }
  throw new Error("Fake Codex turn did not complete.");
}

describe("Codex research runtime", () => {
  it("starts and resumes a structured research conversation", async () => {
    const root = await mkdtemp(path.join(os.tmpdir(), "risetra-agent-"));
    temporaryRoots.push(root);
    await cp(path.resolve("examples/demo"), root, { recursive: true });
    process.env.RISETRA_CODEX_BIN = await fakeCodex(root);
    const runtime = new CodexRuntime(root);

    await runtime.start("Mulai bimbingan");
    const first = await waitForTurn(runtime);
    expect(first.status).toBe("waiting");
    expect(first.threadId).toBe("11111111-1111-4111-8111-111111111111");
    expect(first.messages).toHaveLength(2);
    expect(first.messages[1]?.question).toContain("Bukti apa");

    await runtime.start("Saya memiliki laporan awal.");
    const second = await waitForTurn(runtime);
    expect(second.messages).toHaveLength(4);
    expect(
      JSON.parse(await readFile(path.join(root, "records/agent-session.json"), "utf8")),
    ).toMatchObject({ status: "waiting" });
  });
});
