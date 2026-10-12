import { randomUUID } from "node:crypto";
import path from "node:path";

import type { FastifyInstance } from "fastify";
import { z } from "zod";

import {
  attachmentPath,
  loadWorkspace,
  recordActivity,
  removeIntakeAttachment,
  saveResearchSetup,
  setupFor,
  storeIntakeAttachment,
  writeConfig,
} from "../../core/index.js";
import type { IntakeAttachment } from "../../core/index.js";

const maxUploadBytes = 10 * 1024 * 1024;
const allowedExtensions = new Set([
  ".csv",
  ".doc",
  ".docx",
  ".md",
  ".pdf",
  ".txt",
  ".xls",
  ".xlsx",
]);

const sourceLeadInputSchema = z.object({
  id: z
    .string()
    .regex(/^[a-z0-9-]+$/)
    .optional(),
  title: z.string().min(3).max(300),
  url: z.url(),
  note: z.string().max(1_000),
});

const setupInputSchema = z.object({
  projectName: z.string().min(3).max(300),
  studentName: z.string().min(2).max(200),
  institution: z.string().min(2).max(300),
  discipline: z.string().min(2).max(200),
  methodology: z.string().min(2).max(200),
  language: z.string().min(2).max(20),
  degreeLevel: z.string().min(2).max(100),
  context: z.object({
    topic: z.string().min(3).max(300),
    problem: z.string().min(20).max(3_000),
    researchObject: z.string().min(2).max(500),
    location: z.string().min(2).max(500),
    motivation: z.string().min(20).max(3_000),
  }),
  constraints: z.object({
    timeline: z.string().min(2).max(1_000),
    budget: z.string().min(2).max(1_000),
    participants: z.string().min(2).max(1_000),
    dataAccess: z.string().min(2).max(1_000),
    equipment: z.string().min(2).max(1_000),
  }),
  supervisorGuidance: z.string().max(5_000),
  sourceLeads: z.array(sourceLeadInputSchema).max(50),
});

const uploadQuerySchema = z.object({ category: z.enum(["guideline", "source"]) });
const attachmentParamsSchema = z.object({ id: z.string().uuid() });

function safeOriginalName(encodedName: string): string {
  const decoded = decodeURIComponent(encodedName);
  const basename = path.basename(decoded).slice(0, 180);
  if (!basename || basename === "." || basename === "..") {
    throw new Error("The uploaded file name is invalid.");
  }
  const extension = path.extname(basename).toLowerCase();
  if (!allowedExtensions.has(extension)) {
    throw Object.assign(new Error("This file type is not supported."), {
      statusCode: 415,
      code: "UNSUPPORTED_FILE_TYPE",
    });
  }
  return basename;
}

function storedFilename(id: string, originalName: string): string {
  const extension = path.extname(originalName).toLowerCase();
  const stem = path
    .basename(originalName, extension)
    .normalize("NFKD")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 70);
  return `${id}-${stem || "document"}${extension}`;
}

export async function registerSetupRoutes(app: FastifyInstance): Promise<void> {
  app.put("/api/setup", async (request) => {
    const input = setupInputSchema.parse(request.body);
    const snapshot = await loadWorkspace(app.risetra.workspaceRoot);
    const currentSetup = setupFor(snapshot.config);
    const completedAt = new Date().toISOString();
    const config = {
      ...snapshot.config,
      projectName: input.projectName,
      studentName: input.studentName,
      institution: input.institution,
      discipline: input.discipline,
      methodology: input.methodology,
      languages: {
        ...snapshot.config.languages,
        dashboard: input.language,
        interaction: input.language,
        proposal: input.language,
        citationLocale: input.language,
      },
      setup: {
        completed: true,
        degreeLevel: input.degreeLevel,
        context: input.context,
        constraints: input.constraints,
        supervisorGuidance: input.supervisorGuidance,
        sourceLeads: input.sourceLeads.map((source) => ({
          ...source,
          id: source.id ?? randomUUID(),
        })),
        attachments: currentSetup.attachments,
        completedAt,
      },
    };
    await saveResearchSetup(snapshot, config);
    await recordActivity(snapshot.root, {
      action: "research.setup.completed",
      detail: `Research setup saved for ${input.studentName}.`,
    });
    return { config };
  });

  app.post(
    "/api/setup/attachments",
    { bodyLimit: maxUploadBytes },
    async (request, reply) => {
      const { category } = uploadQuerySchema.parse(request.query);
      const filenameHeader = request.headers["x-risetra-filename"];
      const mediaTypeHeader = request.headers["x-risetra-media-type"];
      if (typeof filenameHeader !== "string" || !Buffer.isBuffer(request.body)) {
        return reply.status(400).send({
          error: "INVALID_UPLOAD",
          message: "A file name and binary file body are required.",
        });
      }
      if (request.body.length === 0) {
        return reply.status(400).send({
          error: "EMPTY_UPLOAD",
          message: "The uploaded file is empty.",
        });
      }

      const originalName = safeOriginalName(filenameHeader);
      const id = randomUUID();
      const filename = storedFilename(id, originalName);
      const attachment: IntakeAttachment = {
        id,
        category,
        originalName,
        storedPath: attachmentPath(category, filename),
        mediaType:
          typeof mediaTypeHeader === "string"
            ? mediaTypeHeader.slice(0, 120)
            : "application/octet-stream",
        size: request.body.length,
        uploadedAt: new Date().toISOString(),
      };

      const snapshot = await loadWorkspace(app.risetra.workspaceRoot);
      await storeIntakeAttachment(snapshot.root, attachment, request.body);
      const config = {
        ...snapshot.config,
        setup: {
          ...setupFor(snapshot.config),
          attachments: [...setupFor(snapshot.config).attachments, attachment],
        },
      };
      await writeConfig(snapshot.root, config);
      await recordActivity(snapshot.root, {
        action: "research.attachment.added",
        detail: `${category}: ${originalName}`,
      });
      return { attachment };
    },
  );

  app.delete("/api/setup/attachments/:id", async (request, reply) => {
    const { id } = attachmentParamsSchema.parse(request.params);
    const snapshot = await loadWorkspace(app.risetra.workspaceRoot);
    const setup = setupFor(snapshot.config);
    const attachment = setup.attachments.find((item) => item.id === id);
    if (!attachment) {
      return reply.status(404).send({
        error: "ATTACHMENT_NOT_FOUND",
        message: "The attachment was not found.",
      });
    }
    await removeIntakeAttachment(snapshot.root, attachment);
    await writeConfig(snapshot.root, {
      ...snapshot.config,
      setup: {
        ...setup,
        attachments: setup.attachments.filter((item) => item.id !== id),
      },
    });
    await recordActivity(snapshot.root, {
      action: "research.attachment.removed",
      detail: `${attachment.category}: ${attachment.originalName}`,
    });
    return reply.status(204).send();
  });
}
