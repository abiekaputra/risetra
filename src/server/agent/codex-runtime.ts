import { spawn, type ChildProcessWithoutNullStreams } from "node:child_process";
import { randomUUID } from "node:crypto";
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";

import {
  agentMessage,
  agentOutputJsonSchema,
  agentTurnOutputSchema,
  buildAgentPrompt,
  emptyAgentSession,
  loadAgentSession,
  loadWorkspace,
  recordActivity,
  saveAgentSession,
  studentMessage,
  type AgentSessionState,
} from "../../core/index.js";

export type AgentAvailability = {
  installed: boolean;
  authenticated: boolean;
  version?: string;
  message: string;
};

export class CodexRuntime {
  private active?: ChildProcessWithoutNullStreams;
  private readonly cancelled = new WeakSet<ChildProcessWithoutNullStreams>();
  private current?: AgentSessionState;
  private availabilityCache?: AgentAvailability;

  constructor(private readonly root: string) {}

  async state(): Promise<AgentSessionState> {
    this.current ??= await loadAgentSession(this.root);
    return this.current;
  }

  async availability(): Promise<AgentAvailability> {
    if (this.availabilityCache) return this.availabilityCache;
    const executable = process.env.RISETRA_CODEX_BIN ?? "codex";
    const version = await this.capture(executable, ["--version"]);
    if (!version.ok) {
      return (this.availabilityCache = {
        installed: false,
        authenticated: false,
        message: "Codex CLI is not installed or is not available on PATH.",
      });
    }
    const auth = await this.capture(executable, ["login", "status"]);
    return (this.availabilityCache = {
      installed: true,
      authenticated: auth.ok && /logged in/i.test(`${auth.stdout}\n${auth.stderr}`),
      version: version.stdout.trim().split("\n").at(-1),
      message: auth.ok
        ? "Codex is ready."
        : "Sign in with `codex login` before starting research guidance.",
    });
  }

  async start(studentInput: string): Promise<AgentSessionState> {
    const availability = await this.availability();
    if (!availability.installed || !availability.authenticated) {
      throw Object.assign(new Error(availability.message), { statusCode: 503 });
    }
    const current = await this.state();
    if (this.active || current.status === "running") {
      throw Object.assign(new Error("Codex is already working on this proposal."), {
        statusCode: 409,
      });
    }
    const snapshot = await loadWorkspace(this.root);
    if (!snapshot.config.setup?.completed) {
      throw Object.assign(new Error("Complete the research setup first."), {
        statusCode: 409,
      });
    }
    const input = studentInput.trim();
    const next = await saveAgentSession(this.root, {
      ...current,
      status: "running",
      activity: "Codex is reading the research workspace…",
      lastError: undefined,
      messages: [...current.messages, studentMessage(input)],
    });
    this.current = next;
    void this.execute(snapshot, next, input);
    return next;
  }

  async stop(): Promise<AgentSessionState> {
    if (this.active) {
      this.cancelled.add(this.active);
      this.active.kill("SIGTERM");
    }
    this.active = undefined;
    const current = await this.state();
    this.current = await saveAgentSession(this.root, {
      ...current,
      status: "waiting",
      activity: "Stopped by the student",
      lastError: undefined,
    });
    return this.current;
  }

  async reset(): Promise<AgentSessionState> {
    if (this.active)
      throw Object.assign(new Error("Stop Codex before resetting."), {
        statusCode: 409,
      });
    this.current = await saveAgentSession(this.root, emptyAgentSession());
    return this.current;
  }

  private async execute(
    snapshot: Awaited<ReturnType<typeof loadWorkspace>>,
    state: AgentSessionState,
    input: string,
  ): Promise<void> {
    const runtimeDirectory = path.join(this.root, ".risetra");
    await mkdir(runtimeDirectory, { recursive: true });
    const runId = randomUUID();
    const schemaPath = path.join(runtimeDirectory, `${runId}.schema.json`);
    const outputPath = path.join(runtimeDirectory, `${runId}.output.json`);
    await writeFile(schemaPath, JSON.stringify(agentOutputJsonSchema), "utf8");

    const executable = process.env.RISETRA_CODEX_BIN ?? "codex";
    const common = [
      "--json",
      "--output-schema",
      schemaPath,
      "--output-last-message",
      outputPath,
      "--skip-git-repo-check",
    ];
    const args = state.threadId
      ? ["exec", "resume", state.threadId, ...common, "-"]
      : ["exec", "--cd", this.root, "--sandbox", "workspace-write", ...common, "-"];
    const child = spawn(executable, args, {
      cwd: this.root,
      env: process.env,
      stdio: ["pipe", "pipe", "pipe"],
    });
    this.active = child;
    let stdout = "";
    let stderr = "";
    child.stdout.on("data", (chunk: Buffer) => {
      stdout += chunk.toString("utf8");
      this.captureThreadId(stdout);
    });
    child.stderr.on("data", (chunk: Buffer) => {
      stderr = `${stderr}${chunk.toString("utf8")}`.slice(-4_000);
    });
    child.stdin.end(buildAgentPrompt(snapshot, state, input));

    const exitCode = await new Promise<number | null>((resolve) => {
      child.once("close", resolve);
    });
    this.active = undefined;
    if (this.cancelled.has(child)) {
      await Promise.all([
        rm(schemaPath, { force: true }),
        rm(outputPath, { force: true }),
      ]);
      return;
    }
    try {
      if (exitCode !== 0) throw new Error(stderr || `Codex exited with ${exitCode}.`);
      const output = agentTurnOutputSchema.parse(
        JSON.parse(await readFile(outputPath, "utf8")),
      );
      const current = await this.state();
      this.current = await saveAgentSession(this.root, {
        ...current,
        threadId: this.findThreadId(stdout) ?? current.threadId,
        stage: output.stage,
        status: output.stageStatus === "complete" ? "complete" : "waiting",
        activity:
          output.stageStatus === "complete"
            ? "Proposal guidance complete"
            : "Waiting for your response",
        messages: [...current.messages, agentMessage(output)],
      });
      await recordActivity(this.root, {
        action: "agent.turn.completed",
        detail: `${output.stage}: ${output.summary}`.slice(0, 1_000),
      });
    } catch (error) {
      const current = await this.state();
      const message = error instanceof Error ? error.message : "Codex failed.";
      this.current = await saveAgentSession(this.root, {
        ...current,
        status: "failed",
        activity: "Codex needs attention",
        lastError: message.slice(0, 4_000),
      });
    } finally {
      await Promise.all([
        rm(schemaPath, { force: true }),
        rm(outputPath, { force: true }),
      ]);
    }
  }

  private captureThreadId(source: string): void {
    const threadId = this.findThreadId(source);
    if (threadId && this.current && !this.current.threadId) {
      this.current = { ...this.current, threadId };
    }
  }

  private findThreadId(source: string): string | undefined {
    for (const line of source.split("\n")) {
      try {
        const event = JSON.parse(line) as Record<string, unknown>;
        const candidate = event.thread_id ?? event.session_id;
        if (typeof candidate === "string") return candidate;
      } catch {
        // A partial JSONL line is expected while the process is still streaming.
      }
    }
    return undefined;
  }

  private capture(
    executable: string,
    args: string[],
  ): Promise<{ ok: boolean; stdout: string; stderr: string }> {
    return new Promise((resolve) => {
      const child = spawn(executable, args, { stdio: ["ignore", "pipe", "pipe"] });
      let stdout = "";
      let stderr = "";
      child.stdout.on("data", (chunk: Buffer) => (stdout += chunk.toString("utf8")));
      child.stderr.on("data", (chunk: Buffer) => (stderr += chunk.toString("utf8")));
      child.once("error", () => resolve({ ok: false, stdout, stderr }));
      child.once("close", (code) => resolve({ ok: code === 0, stdout, stderr }));
    });
  }
}
