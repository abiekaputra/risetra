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
  id?: string;
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

export type SetupPayload = Omit<
  ResearchSetup,
  "completed" | "attachments" | "completedAt"
> & {
  projectName: string;
  studentName: string;
  institution: string;
  discipline: string;
  methodology: string;
  language: string;
};

export type WorkspaceOverview = {
  config: {
    projectName: string;
    studentName: string;
    institution: string;
    discipline: string;
    methodology: string;
    demoMode: boolean;
    setup?: ResearchSetup;
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

export type ResearchStage =
  | "foundation"
  | "questions"
  | "evidence"
  | "chapter-1"
  | "chapter-2"
  | "chapter-3"
  | "readiness";

export type AgentMessage = {
  id: string;
  role: "student" | "agent" | "system";
  body: string;
  createdAt: string;
  question?: string;
  explanation?: string;
  decisions?: { label: string; value: string; reason: string }[];
  evidenceNeeded?: string[];
  changedArtifacts?: string[];
};

export type AgentSession = {
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

export type AgentOverview = {
  availability: {
    installed: boolean;
    authenticated: boolean;
    version?: string;
    message: string;
  };
  state: AgentSession;
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

export type WorkspaceTab =
  "guidance" | "documents" | "sources" | "alignment" | "checks";
