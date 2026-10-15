import { randomUUID } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";

import { agentSessionSchema } from "./schemas.js";
import type { AgentMessage, AgentSessionState, AgentTurnOutput } from "./types.js";
import { workspacePath } from "./paths.js";

const stateFile = "records/agent-session.json";

export function emptyAgentSession(): AgentSessionState {
  return {
    schemaVersion: 1,
    provider: "codex",
    status: "idle",
    stage: "foundation",
    activity: "Ready to begin",
    messages: [],
    updatedAt: new Date().toISOString(),
  };
}

export async function loadAgentSession(root: string): Promise<AgentSessionState> {
  try {
    const source = await readFile(workspacePath(root, stateFile), "utf8");
    const state = agentSessionSchema.parse(JSON.parse(source));
    return state.status === "running"
      ? { ...state, status: "failed", lastError: "The previous run was interrupted." }
      : state;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return emptyAgentSession();
    throw error;
  }
}

export async function saveAgentSession(
  root: string,
  state: AgentSessionState,
): Promise<AgentSessionState> {
  const next = agentSessionSchema.parse({
    ...state,
    messages: state.messages.slice(-500),
    updatedAt: new Date().toISOString(),
  });
  await writeFile(
    workspacePath(root, stateFile),
    `${JSON.stringify(next, null, 2)}\n`,
    "utf8",
  );
  return next;
}

export function studentMessage(body: string): AgentMessage {
  return {
    id: randomUUID(),
    role: "student",
    body,
    createdAt: new Date().toISOString(),
  };
}

export function agentMessage(output: AgentTurnOutput): AgentMessage {
  return {
    id: randomUUID(),
    role: "agent",
    body: output.summary,
    explanation: output.explanation,
    question: output.question || undefined,
    decisions: output.decisions,
    evidenceNeeded: output.evidenceNeeded,
    changedArtifacts: output.changedArtifacts,
    createdAt: new Date().toISOString(),
  };
}
