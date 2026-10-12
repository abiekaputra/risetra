import { writeFile } from "node:fs/promises";
import path from "node:path";

import { ensureOutputDirectory } from "./workspace.js";
import type { WorkspaceSnapshot } from "./types.js";

const chapterKinds = new Set(["chapter-1", "chapter-2", "chapter-3"]);

export async function exportProposal(
  snapshot: WorkspaceSnapshot,
  allowReviewed: boolean,
): Promise<string> {
  const acceptedStatuses = allowReviewed
    ? new Set(["REVIEWED", "APPROVED"])
    : new Set(["APPROVED"]);
  const chapters = snapshot.artifacts.filter(
    (artifact) =>
      chapterKinds.has(artifact.kind) && acceptedStatuses.has(artifact.status),
  );

  if (chapters.length !== 3) {
    throw new Error(
      "Export requires Chapters 1, 2, and 3 to pass the selected review threshold.",
    );
  }

  const outputDirectory = await ensureOutputDirectory(snapshot.root);
  const target = path.join(outputDirectory, "proposal.md");
  const content = [
    `# ${snapshot.config.projectName}`,
    "",
    `> Exported by Risetra on ${new Date().toISOString()}.`,
    "",
    ...chapters.flatMap((chapter) => [
      `<!-- ${chapter.id}: ${chapter.status} -->`,
      chapter.body,
      "",
    ]),
  ].join("\n");
  await writeFile(target, content, "utf8");
  return target;
}
