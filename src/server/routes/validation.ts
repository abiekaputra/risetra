import type { FastifyInstance } from "fastify";

import { loadWorkspace, validateWorkspace } from "../../core/index.js";

export async function registerValidationRoutes(app: FastifyInstance): Promise<void> {
  app.post("/api/validate", async () => {
    const snapshot = await loadWorkspace(app.risetra.workspaceRoot);
    return { validation: validateWorkspace(snapshot) };
  });
}
