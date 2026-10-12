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

export const workspaceConfigSchema = z.object({
  schemaVersion: z.literal(1),
  projectName: z.string().min(3),
  studentName: z.string().min(2),
  institution: z.string().min(2),
  discipline: z.string().min(2),
  methodology: z.string().min(2),
  demoMode: z.boolean(),
  languages: languageSettingsSchema,
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
