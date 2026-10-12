import type { ValidationIssue, ValidationReport, WorkspaceSnapshot } from "./types.js";

const requiredArtifactIds = [
  "research-charter",
  "research-questions",
  "chapter-1",
  "chapter-2",
  "chapter-3",
  "seminar-readiness",
];

const citationPattern = /\[(SRC-[A-Z0-9-]+)\]/g;

function validateRequiredArtifacts(snapshot: WorkspaceSnapshot): ValidationIssue[] {
  const available = new Set(snapshot.artifacts.map((artifact) => artifact.id));
  return requiredArtifactIds
    .filter((id) => !available.has(id))
    .map((id) => ({
      code: "ARTIFACT_REQUIRED",
      severity: "error",
      message: `Required artifact '${id}' is missing.`,
      artifactId: id,
    }));
}

function validateCitations(snapshot: WorkspaceSnapshot): ValidationIssue[] {
  const sourceIds = new Set(snapshot.sources.map((source) => source.id));
  const issues: ValidationIssue[] = [];

  for (const artifact of snapshot.artifacts) {
    for (const match of artifact.body.matchAll(citationPattern)) {
      const sourceId = match[1];
      if (sourceId && !sourceIds.has(sourceId)) {
        issues.push({
          code: "SOURCE_UNKNOWN",
          severity: "error",
          message: `Citation ${sourceId} is absent from the source inventory.`,
          artifactId: artifact.id,
          path: artifact.path,
        });
      }
    }
  }

  for (const source of snapshot.sources) {
    if (!source.verified && !snapshot.config.demoMode) {
      issues.push({
        code: "SOURCE_UNVERIFIED",
        severity: "warning",
        message: `${source.id} has not been independently verified.`,
      });
    }
    if (source.type === "demo" && !snapshot.config.demoMode) {
      issues.push({
        code: "DEMO_SOURCE_FORBIDDEN",
        severity: "error",
        message: `${source.id} is synthetic and cannot be used outside demo mode.`,
      });
    }
  }

  return issues;
}

function validateReviews(snapshot: WorkspaceSnapshot): ValidationIssue[] {
  return snapshot.artifacts.flatMap((artifact) => {
    const issues: ValidationIssue[] = [];
    if (artifact.status !== "DRAFT" && (!artifact.reviewer || !artifact.reviewNote)) {
      issues.push({
        code: "REVIEW_EVIDENCE_MISSING",
        severity: "error",
        message: "Reviewed artifacts require a reviewer and review note.",
        artifactId: artifact.id,
        path: artifact.path,
      });
    }
    if (artifact.status === "DRAFT") {
      issues.push({
        code: "ARTIFACT_DRAFT",
        severity: "info",
        message: `${artifact.title} still needs human review.`,
        artifactId: artifact.id,
        path: artifact.path,
      });
    }
    return issues;
  });
}

function validateAlignment(snapshot: WorkspaceSnapshot): ValidationIssue[] {
  if (snapshot.alignment.length === 0) {
    return [
      {
        code: "ALIGNMENT_EMPTY",
        severity: "error",
        message:
          "At least one question, objective, method, and output mapping is required.",
      },
    ];
  }

  const questionIds = new Set<string>();
  const objectiveIds = new Set<string>();
  const issues: ValidationIssue[] = [];
  for (const item of snapshot.alignment) {
    if (questionIds.has(item.questionId)) {
      issues.push({
        code: "QUESTION_DUPLICATE",
        severity: "error",
        message: `${item.questionId} appears more than once.`,
      });
    }
    if (objectiveIds.has(item.objectiveId)) {
      issues.push({
        code: "OBJECTIVE_DUPLICATE",
        severity: "error",
        message: `${item.objectiveId} appears more than once.`,
      });
    }
    questionIds.add(item.questionId);
    objectiveIds.add(item.objectiveId);
  }
  return issues;
}

export function validateWorkspace(snapshot: WorkspaceSnapshot): ValidationReport {
  const issues = [
    ...validateRequiredArtifacts(snapshot),
    ...validateCitations(snapshot),
    ...validateReviews(snapshot),
    ...validateAlignment(snapshot),
  ];
  const counts = issues.reduce(
    (result, issue) => {
      result[issue.severity] += 1;
      return result;
    },
    { error: 0, warning: 0, info: 0 },
  );

  return {
    valid: counts.error === 0,
    generatedAt: new Date().toISOString(),
    counts,
    issues,
  };
}
