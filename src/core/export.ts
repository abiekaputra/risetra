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

function tableCells(line: string): string[] | undefined {
  const trimmed = line.trim();
  if (!trimmed.startsWith("|") || !trimmed.endsWith("|")) return undefined;
  if (/^\|(?:\s*:?-+:?\s*\|)+$/.test(trimmed)) return [];
  return trimmed
    .slice(1, -1)
    .split("|")
    .map((cell) => plainText(cell.trim()));
}

function markdownParagraphs(markdown: string): Paragraph[] {
  return markdown.split("\n").flatMap((line) => {
    const cells = tableCells(line);
    if (cells?.length === 0) return [];
    if (cells) {
      return [
        new Paragraph({
          children: [new TextRun({ text: cells.join("  ·  "), size: 19 })],
          spacing: { after: 90 },
        }),
      ];
    }
    const heading = /^(#{1,3})\s+(.+)$/.exec(line);
    if (heading) {
      const levels = [
        HeadingLevel.HEADING_1,
        HeadingLevel.HEADING_2,
        HeadingLevel.HEADING_3,
      ];
      return [
        new Paragraph({
          text: heading[2] ?? "",
          heading: levels[(heading[1]?.length ?? 3) - 1] ?? HeadingLevel.HEADING_3,
        }),
      ];
    }
    const bullet = /^[-*]\s+(.+)$/.exec(line);
    if (bullet) {
      return [
        new Paragraph({ text: plainText(bullet[1] ?? ""), bullet: { level: 0 } }),
      ];
    }
    return [
      new Paragraph({
        children: [new TextRun(plainText(line))],
        spacing: { after: line ? 100 : 0 },
      }),
    ];
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
    bufferPages: true,
  });
  const chunks: Buffer[] = [];
  document.on("data", (chunk: Buffer) => chunks.push(chunk));
  const completed = new Promise<Buffer>((resolve, reject) => {
    document.on("end", () => resolve(Buffer.concat(chunks)));
    document.on("error", reject);
  });
  document.info.Title = snapshot.config.projectName;
  document
    .fillColor("#0a5f62")
    .font("Helvetica-Bold")
    .fontSize(11)
    .text("RISETRA · DRAF PROPOSAL", { align: "center" })
    .moveDown(3)
    .fillColor("#14233b")
    .fontSize(21)
    .text(snapshot.config.projectName, { align: "center", lineGap: 6 })
    .moveDown(2)
    .font("Helvetica")
    .fontSize(12)
    .text(snapshot.config.studentName, { align: "center" })
    .moveDown(0.4)
    .text(snapshot.config.institution, { align: "center" })
    .moveDown(3)
    .fillColor("#5f6f85")
    .fontSize(10)
    .text("Bab 1–3 · Draf ditinjau untuk konsultasi dosen", { align: "center" })
    .moveDown(0.4)
    .text(new Intl.DateTimeFormat("id-ID", { dateStyle: "long" }).format(new Date()), {
      align: "center",
    });
  document.addPage();

  for (const line of markdown.split("\n").slice(4)) {
    const cells = tableCells(line);
    if (cells?.length === 0) continue;
    if (cells) {
      document
        .fillColor("#26364f")
        .font("Helvetica")
        .fontSize(9)
        .text(cells.join("  •  "), { indent: 10, lineGap: 3 })
        .moveDown(0.25);
      continue;
    }
    const heading = /^(#{1,3})\s+(.+)$/.exec(line);
    if (heading) {
      document
        .moveDown(0.6)
        .fillColor("#14233b")
        .font("Helvetica-Bold")
        .fontSize(18 - (heading[1]?.length ?? 3) * 2)
        .text(heading[2] ?? "");
    } else {
      document
        .fillColor("#1e293b")
        .font("Helvetica")
        .fontSize(11)
        .text(plainText(line), { lineGap: 4 });
    }
  }

  const range = document.bufferedPageRange();
  for (let index = range.start; index < range.start + range.count; index += 1) {
    document.switchToPage(index);
    const bottomMargin = document.page.margins.bottom;
    document.page.margins.bottom = 0;
    document
      .fillColor("#7a879a")
      .font("Helvetica")
      .fontSize(8)
      .text(`Risetra · ${index + 1} / ${range.count}`, 64, document.page.height - 36, {
        align: "center",
        width: 467,
        lineBreak: false,
      });
    document.page.margins.bottom = bottomMargin;
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
