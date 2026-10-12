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
