import { z } from "zod";

import { reviewStatuses } from "./types.js";

export const languageSettingsSchema = z.object({
  dashboard: z.string().min(2),
  interaction: z.string().min(2),
  proposal: z.string().min(2),
  sources: z.array(z.string().min(2)).min(1),
  citationLocale: z.string().min(2),
  quotation: z.enum(["preserve", "translate-with-label"]),
});

export const intakeAttachmentSchema = z.object({
  id: z.string().regex(/^[a-z0-9-]+$/),
  category: z.enum(["guideline", "source"]),
  originalName: z.string().min(1).max(180),
  storedPath: z.string().min(1).max(300),
  mediaType: z.string().min(1).max(120),
  size: z
    .number()
    .int()
    .positive()
    .max(10 * 1024 * 1024),
  uploadedAt: z.iso.datetime(),
});

export const sourceLeadSchema = z.object({
  id: z.string().regex(/^[a-z0-9-]+$/),
  title: z.string().min(3).max(300),
  url: z.url(),
  note: z.string().max(1_000),
});

export const researchSetupSchema = z.object({
  completed: z.boolean(),
  degreeLevel: z.string().max(100),
  context: z.object({
    topic: z.string().max(300),
    problem: z.string().max(3_000),
    researchObject: z.string().max(500),
    location: z.string().max(500),
    motivation: z.string().max(3_000),
  }),
  constraints: z.object({
    timeline: z.string().max(1_000),
    budget: z.string().max(1_000),
    participants: z.string().max(1_000),
    dataAccess: z.string().max(1_000),
    equipment: z.string().max(1_000),
  }),
  supervisorGuidance: z.string().max(5_000),
  sourceLeads: z.array(sourceLeadSchema).max(50),
  attachments: z.array(intakeAttachmentSchema).max(50),
  completedAt: z.iso.datetime().optional(),
});

export const workspaceConfigSchema = z.object({
  schemaVersion: z.literal(1),
  projectName: z.string().min(3),
  studentName: z.string().min(2),
  institution: z.string().min(2),
  discipline: z.string().min(2),
  methodology: z.string().min(2),
  demoMode: z.boolean(),
  languages: languageSettingsSchema,
  setup: researchSetupSchema.optional(),
  createdAt: z.iso.datetime(),
});

export const artifactFrontmatterSchema = z.object({
  id: z.string().regex(/^[a-z0-9-]+$/),
  title: z.string().min(2),
  kind: z.string().min(2),
  status: z.enum(reviewStatuses),
  order: z.coerce.number().int().nonnegative(),
  updatedAt: z.iso.datetime(),
  reviewer: z.string().min(2).optional(),
  reviewNote: z.string().min(3).optional(),
});

export const sourceRecordSchema = z.object({
  id: z.string().regex(/^SRC-[A-Z0-9-]+$/),
  title: z.string().min(3),
  authors: z.array(z.string().min(2)).min(1),
  year: z.number().int().min(1500).max(2100),
  type: z.enum(["journal", "book", "report", "dataset", "demo"]),
  doi: z.string().min(6).optional(),
  url: z.url().optional(),
  verified: z.boolean(),
  note: z.string().optional(),
});

export const alignmentItemSchema = z.object({
  questionId: z.string().regex(/^RQ-[0-9]+$/),
  question: z.string().min(8),
  objectiveId: z.string().regex(/^OBJ-[0-9]+$/),
  objective: z.string().min(8),
  method: z.string().min(3),
  evidenceOutput: z.string().min(3),
});

export const alignmentSchema = z.array(alignmentItemSchema);
export const sourcesSchema = z.array(sourceRecordSchema);
