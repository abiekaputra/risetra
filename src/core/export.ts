import { writeFile } from "node:fs/promises";
import path from "node:path";

import { Document, HeadingLevel, Packer, Paragraph, TextRun } from "docx";
import PDFDocument from "pdfkit";

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

type ExportFormat = "md" | "docx" | "pdf";

function acceptedChapters(snapshot: WorkspaceSnapshot, allowReviewed: boolean) {
  const accepted = allowReviewed
    ? new Set(["REVIEWED", "APPROVED"])
    : new Set(["APPROVED"]);
  const chapters = snapshot.artifacts.filter(
    (artifact) => chapterKinds.has(artifact.kind) && accepted.has(artifact.status),
  );
  if (chapters.length !== 3) {
    throw Object.assign(
      new Error("Review Chapters 1, 2, and 3 before exporting the proposal."),
      { statusCode: 409 },
    );
  }
  return chapters;
}

function plainText(markdown: string): string {
  return markdown
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/^[-*]\s+/gm, "• ")
    .replace(/\[([^\]]+)]\([^)]+\)/g, "$1")
    .replace(/[*_`]/g, "")
    .trim();
}

function markdownParagraphs(markdown: string): Paragraph[] {
  return markdown.split("\n").map((line) => {
    const heading = /^(#{1,3})\s+(.+)$/.exec(line);
    if (heading) {
      const levels = [
        HeadingLevel.HEADING_1,
        HeadingLevel.HEADING_2,
        HeadingLevel.HEADING_3,
      ];
      return new Paragraph({
        text: heading[2] ?? "",
        heading: levels[(heading[1]?.length ?? 3) - 1] ?? HeadingLevel.HEADING_3,
      });
    }
    const bullet = /^[-*]\s+(.+)$/.exec(line);
    if (bullet) return new Paragraph({ text: bullet[1], bullet: { level: 0 } });
    return new Paragraph({ children: [new TextRun(line)] });
  });
}

async function writeDocx(
  target: string,
  snapshot: WorkspaceSnapshot,
  markdown: string,
): Promise<void> {
  const document = new Document({
    creator: "Risetra",
    title: snapshot.config.projectName,
    sections: [
      {
        properties: {},
        children: markdownParagraphs(markdown),
      },
    ],
  });
  await writeFile(target, await Packer.toBuffer(document));
}

async function writePdf(
  target: string,
  snapshot: WorkspaceSnapshot,
  markdown: string,
): Promise<void> {
  const document = new PDFDocument({
    size: "A4",
    margins: { top: 64, bottom: 64, left: 64, right: 64 },
  });
  const chunks: Buffer[] = [];
  document.on("data", (chunk: Buffer) => chunks.push(chunk));
  const completed = new Promise<Buffer>((resolve, reject) => {
    document.on("end", () => resolve(Buffer.concat(chunks)));
    document.on("error", reject);
  });
  document.info.Title = snapshot.config.projectName;
  for (const line of markdown.split("\n")) {
    const heading = /^(#{1,3})\s+(.+)$/.exec(line);
    if (heading) {
      document
        .moveDown(0.6)
        .font("Helvetica-Bold")
        .fontSize(18 - (heading[1]?.length ?? 3) * 2)
        .text(heading[2] ?? "");
    } else {
      document.font("Helvetica").fontSize(11).text(plainText(line), { lineGap: 4 });
    }
  }
  document.end();
  await writeFile(target, await completed);
}

export async function exportProposalFile(
  snapshot: WorkspaceSnapshot,
  format: ExportFormat,
  allowReviewed: boolean,
): Promise<string> {
  const chapters = acceptedChapters(snapshot, allowReviewed);
  const markdown = [
    `# ${snapshot.config.projectName}`,
    "",
    `**${snapshot.config.studentName} · ${snapshot.config.institution}**`,
    "",
    ...chapters.flatMap((chapter) => [chapter.body, ""]),
  ].join("\n");
  const output = await ensureOutputDirectory(snapshot.root);
  const target = path.join(output, `proposal.${format}`);
  if (format === "md") await writeFile(target, markdown, "utf8");
  if (format === "docx") await writeDocx(target, snapshot, markdown);
  if (format === "pdf") await writePdf(target, snapshot, markdown);
  return target;
}
