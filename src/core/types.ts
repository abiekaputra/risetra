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

export type IntakeAttachment = {
  id: string;
  category: "guideline" | "source";
  originalName: string;
  storedPath: string;
  extractedPath?: string;
  mediaType: string;
  size: number;
  uploadedAt: string;
};

export type SourceLead = {
  id: string;
  title: string;
  url: string;
  note: string;
};

export type ResearchSetup = {
  completed: boolean;
  degreeLevel: string;
  context: {
    topic: string;
    problem: string;
    researchObject: string;
    location: string;
    motivation: string;
  };
  constraints: {
    timeline: string;
    budget: string;
    participants: string;
    dataAccess: string;
    equipment: string;
  };
  supervisorGuidance: string;
  sourceLeads: SourceLead[];
  attachments: IntakeAttachment[];
  completedAt?: string;
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
  setup?: ResearchSetup;
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

export type LiteratureCandidate = Omit<SourceRecord, "id" | "verified" | "note"> & {
  provider: "Crossref";
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

export const researchStages = [
  "foundation",
  "questions",
  "evidence",
  "chapter-1",
  "chapter-2",
  "chapter-3",
  "readiness",
] as const;
export type ResearchStage = (typeof researchStages)[number];

export type AgentDecision = {
  label: string;
  value: string;
  reason: string;
};

export type AgentMessage = {
  id: string;
  role: "student" | "agent" | "system";
  body: string;
  createdAt: string;
  question?: string;
  explanation?: string;
  decisions?: AgentDecision[];
  evidenceNeeded?: string[];
  changedArtifacts?: string[];
};

export type AgentSessionState = {
  schemaVersion: 1;
  provider: "codex";
  threadId?: string;
  status: "idle" | "running" | "waiting" | "failed" | "complete";
  stage: ResearchStage;
  activity: string;
  messages: AgentMessage[];
  lastError?: string;
  updatedAt: string;
};

export type AgentTurnOutput = {
  summary: string;
  explanation: string;
  question: string;
  stage: ResearchStage;
  stageStatus: "waiting_input" | "ready_for_review" | "complete";
  decisions: AgentDecision[];
  evidenceNeeded: string[];
  changedArtifacts: string[];
};
