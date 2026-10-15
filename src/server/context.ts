import type { FastifyInstance } from "fastify";

import type { CodexRuntime } from "./agent/codex-runtime.js";

export type ServerContext = {
  workspaceRoot: string;
  agent: CodexRuntime;
};

declare module "fastify" {
  interface FastifyInstance {
    risetra: ServerContext;
  }
}

export function attachContext(app: FastifyInstance, context: ServerContext): void {
  app.decorate("risetra", context);
}
