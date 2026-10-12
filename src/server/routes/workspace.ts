import type { FastifyInstance } from "fastify";

import {
  loadWorkspace,
  summarizeWorkspace,
  validateWorkspace,
} from "../../core/index.js";

export async function registerWorkspaceRoutes(app: FastifyInstance): Promise<void> {
  app.get("/api/health", async () => ({ status: "ok", product: "Risetra" }));

  app.get("/api/workspace", async () => {
    const snapshot = await loadWorkspace(app.risetra.workspaceRoot);
    return {
      config: snapshot.config,
      summary: summarizeWorkspace(snapshot),
      validation: validateWorkspace(snapshot),
    };
  });

  app.get("/api/sources", async () => {
    const snapshot = await loadWorkspace(app.risetra.workspaceRoot);
    return { sources: snapshot.sources };
  });

  app.get("/api/alignment", async () => {
    const snapshot = await loadWorkspace(app.risetra.workspaceRoot);
    return { alignment: snapshot.alignment };
  });
}
