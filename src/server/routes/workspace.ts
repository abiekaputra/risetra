import type { FastifyInstance } from "fastify";

import {
  alignmentSchema,
  exportProposalFile,
  loadWorkspace,
  recordActivity,
  saveAlignment,
  saveSources,
  sourcesSchema,
  summarizeWorkspace,
  validateWorkspace,
} from "../../core/index.js";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { z } from "zod";

const exportQuerySchema = z.object({
  format: z.enum(["md", "docx", "pdf"]),
  allowReviewed: z.enum(["true", "false"]).default("false"),
});

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

  app.put("/api/sources", async (request) => {
    const input = z.object({ sources: sourcesSchema }).parse(request.body);
    await saveSources(app.risetra.workspaceRoot, input.sources);
    await recordActivity(app.risetra.workspaceRoot, {
      action: "sources.saved",
      detail: `${input.sources.length} source records saved.`,
    });
    return { sources: input.sources };
  });

  app.put("/api/alignment", async (request) => {
    const input = z.object({ alignment: alignmentSchema }).parse(request.body);
    await saveAlignment(app.risetra.workspaceRoot, input.alignment);
    await recordActivity(app.risetra.workspaceRoot, {
      action: "alignment.saved",
      detail: `${input.alignment.length} alignment rows saved.`,
    });
    return { alignment: input.alignment };
  });

  app.post("/api/export", async (request, reply) => {
    const query = exportQuerySchema.parse(request.query);
    const snapshot = await loadWorkspace(app.risetra.workspaceRoot);
    const filename = await exportProposalFile(
      snapshot,
      query.format,
      query.allowReviewed === "true",
    );
    const mediaTypes = {
      md: "text/markdown; charset=utf-8",
      docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      pdf: "application/pdf",
    };
    return reply
      .type(mediaTypes[query.format])
      .header("Content-Disposition", `attachment; filename=${path.basename(filename)}`)
      .send(await readFile(filename));
  });
}
