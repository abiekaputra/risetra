export const reviewStatuses = ["DRAFT", "REVIEWED", "APPROVED"] as const;
export type ReviewStatus = (typeof reviewStatuses)[number];

export type LanguageSettings = {
  dashboard: string;
  interaction: string;
  proposal: string;
  sources: string[];
  citationLocale: string;
  quotation: "preserve" | "translate-with-label";
};

export type WorkspaceConfig = {
  schemaVersion: 1;
  projectName: string;
  studentName: string;
  institution: string;
  discipline: string;
  methodology: string;
  demoMode: boolean;
  languages: LanguageSettings;
  createdAt: string;
};

export type ArtifactFrontmatter = {
  id: string;
  title: string;
  kind: string;
  status: ReviewStatus;
  order: number;
  updatedAt: string;
  reviewer?: string;
  reviewNote?: string;
};

export type Artifact = ArtifactFrontmatter & {
  path: string;
  body: string;
  version: string;
};

export type SourceRecord = {
  id: string;
  title: string;
  authors: string[];
  year: number;
  type: "journal" | "book" | "report" | "dataset" | "demo";
  doi?: string;
  url?: string;
  verified: boolean;
  note?: string;
};

export type AlignmentItem = {
  questionId: string;
  question: string;
  objectiveId: string;
  objective: string;
  method: string;
  evidenceOutput: string;
};

export type ValidationSeverity = "error" | "warning" | "info";

export type ValidationIssue = {
  code: string;
  severity: ValidationSeverity;
  message: string;
  artifactId?: string;
  path?: string;
};

export type ValidationReport = {
  valid: boolean;
  generatedAt: string;
  counts: Record<ValidationSeverity, number>;
  issues: ValidationIssue[];
};

export type WorkspaceSnapshot = {
  root: string;
  config: WorkspaceConfig;
  artifacts: Artifact[];
  sources: SourceRecord[];
  alignment: AlignmentItem[];
};

export type WorkspaceSummary = {
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
