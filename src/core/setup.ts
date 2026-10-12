import { mkdir, unlink, writeFile } from "node:fs/promises";
import path from "node:path";

import { saveArtifact, writeConfig } from "./workspace.js";
import type {
  IntakeAttachment,
  ResearchSetup,
  WorkspaceConfig,
  WorkspaceSnapshot,
} from "./types.js";
import { workspacePath } from "./paths.js";

export const emptyResearchSetup = (): ResearchSetup => ({
  completed: false,
  degreeLevel: "",
  context: { topic: "", problem: "", researchObject: "", location: "", motivation: "" },
  constraints: {
    timeline: "",
    budget: "",
    participants: "",
    dataAccess: "",
    equipment: "",
  },
  supervisorGuidance: "",
  sourceLeads: [],
  attachments: [],
});

export function setupFor(config: WorkspaceConfig): ResearchSetup {
  return config.setup ?? emptyResearchSetup();
}

function charterBody(setup: ResearchSetup, language: string): string {
  if (!language.toLowerCase().startsWith("id")) {
    return `# Research charter\n\n## Observed situation\n\n${setup.context.problem}\n\n## Research context\n\nTopic: ${setup.context.topic}\n\nObject: ${setup.context.researchObject}\n\nLocation: ${setup.context.location}\n\n## Why this matters\n\n${setup.context.motivation}\n\n## Practical constraints\n\n- Timeline: ${setup.constraints.timeline}\n- Budget: ${setup.constraints.budget}\n- Participants: ${setup.constraints.participants}\n- Data access: ${setup.constraints.dataAccess}\n- Equipment: ${setup.constraints.equipment}\n\n## Supervisor guidance\n\n${setup.supervisorGuidance || "No guidance recorded yet."}`;
  }

  return `# Piagam penelitian\n\n## Situasi yang diamati\n\n${setup.context.problem}\n\n## Konteks penelitian\n\nTopik: ${setup.context.topic}\n\nObjek: ${setup.context.researchObject}\n\nLokasi: ${setup.context.location}\n\n## Alasan penelitian\n\n${setup.context.motivation}\n\n## Keterbatasan praktis\n\n- Waktu: ${setup.constraints.timeline}\n- Biaya: ${setup.constraints.budget}\n- Partisipan: ${setup.constraints.participants}\n- Akses data: ${setup.constraints.dataAccess}\n- Peralatan: ${setup.constraints.equipment}\n\n## Arahan dosen\n\n${setup.supervisorGuidance || "Belum ada arahan yang dicatat."}`;
}

export async function saveResearchSetup(
  snapshot: WorkspaceSnapshot,
  config: WorkspaceConfig,
): Promise<void> {
  const wasCompleted = snapshot.config.setup?.completed === true;
  await writeConfig(snapshot.root, config);
  if (wasCompleted || !config.setup?.completed) return;

  const charter = snapshot.artifacts.find(
    (artifact) => artifact.id === "research-charter",
  );
  if (!charter) return;
  await saveArtifact(
    snapshot.root,
    charter,
    charterBody(config.setup, config.languages.proposal),
    charter.version,
  );
}

export async function storeIntakeAttachment(
  root: string,
  attachment: IntakeAttachment,
  body: Buffer,
): Promise<void> {
  const directory = workspacePath(root, "inputs", `${attachment.category}s`);
  await mkdir(directory, { recursive: true });
  await writeFile(workspacePath(root, attachment.storedPath), body, { flag: "wx" });
}

export async function removeIntakeAttachment(
  root: string,
  attachment: IntakeAttachment,
): Promise<void> {
  await unlink(workspacePath(root, attachment.storedPath)).catch((error: unknown) => {
    const code = (error as NodeJS.ErrnoException).code;
    if (code !== "ENOENT") throw error;
  });
}

export function attachmentPath(
  category: IntakeAttachment["category"],
  filename: string,
) {
  return path.posix.join("inputs", `${category}s`, filename);
}
