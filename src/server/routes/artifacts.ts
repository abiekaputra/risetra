import type { FastifyInstance } from "fastify";
import { z } from "zod";

import {
  loadWorkspace,
  recordActivity,
  saveArtifact,
  updateArtifactReview,
} from "../../core/index.js";

const artifactParamsSchema = z.object({ id: z.string().regex(/^[a-z0-9-]+$/) });
const saveBodySchema = z.object({
  body: z.string().max(200_000),
  expectedVersion: z.string().min(1),
});
const reviewBodySchema = z.object({
  status: z.enum(["DRAFT", "REVIEWED", "APPROVED"]),
  reviewer: z.string().min(2).max(100),
  note: z.string().min(3).max(1_000),
});

async function findArtifact(app: FastifyInstance, id: string) {
  const snapshot = await loadWorkspace(app.risetra.workspaceRoot);
  const artifact = snapshot.artifacts.find((item) => item.id === id);
  if (!artifact) throw new Error(`Artifact '${id}' was not found.`);
  return artifact;
}

export async function registerArtifactRoutes(app: FastifyInstance): Promise<void> {
  app.get("/api/artifacts", async () => {
    const snapshot = await loadWorkspace(app.risetra.workspaceRoot);
    return { artifacts: snapshot.artifacts };
  });

  app.get("/api/artifacts/:id", async (request) => {
    const { id } = artifactParamsSchema.parse(request.params);
    return { artifact: await findArtifact(app, id) };
  });

  app.put("/api/artifacts/:id", async (request) => {
    const { id } = artifactParamsSchema.parse(request.params);
    const input = saveBodySchema.parse(request.body);
    const artifact = await findArtifact(app, id);
    const saved = await saveArtifact(
      app.risetra.workspaceRoot,
      artifact,
      input.body,
      input.expectedVersion,
    );
    await recordActivity(app.risetra.workspaceRoot, {
      action: "artifact.saved",
      artifactId: id,
      detail: "Content changed; review status reset to DRAFT.",
    });
    return { artifact: saved };
  });

  app.post("/api/artifacts/:id/review", async (request) => {
    const { id } = artifactParamsSchema.parse(request.params);
    const input = reviewBodySchema.parse(request.body);
    const artifact = await findArtifact(app, id);
    const reviewed = await updateArtifactReview(
      app.risetra.workspaceRoot,
      artifact,
      input,
    );
    await recordActivity(app.risetra.workspaceRoot, {
      action: "artifact.reviewed",
      artifactId: id,
      detail: `${input.status} by ${input.reviewer}: ${input.note}`,
    });
    return { artifact: reviewed };
  });
}
