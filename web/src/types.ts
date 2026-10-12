export type ReviewStatus = "DRAFT" | "REVIEWED" | "APPROVED";

export type Artifact = {
  id: string;
  title: string;
  kind: string;
  status: ReviewStatus;
  order: number;
  updatedAt: string;
  reviewer?: string;
  reviewNote?: string;
  path: string;
  body: string;
  version: string;
};

export type ValidationIssue = {
  code: string;
  severity: "error" | "warning" | "info";
  message: string;
  artifactId?: string;
};

export type ValidationReport = {
  valid: boolean;
  generatedAt: string;
  counts: { error: number; warning: number; info: number };
  issues: ValidationIssue[];
};

export type WorkspaceOverview = {
  config: {
    projectName: string;
    studentName: string;
    institution: string;
    discipline: string;
    methodology: string;
    demoMode: boolean;
    languages: {
      dashboard: string;
      interaction: string;
      proposal: string;
      sources: string[];
      citationLocale: string;
      quotation: string;
    };
  };
  summary: {
    projectName: string;
    discipline: string;
    methodology: string;
    proposalLanguage: string;
    progress: number;
    approved: number;
    reviewed: number;
    draft: number;
    total: number;
  };
  validation: ValidationReport;
};
