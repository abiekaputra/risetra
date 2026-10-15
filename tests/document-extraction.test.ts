import { Document, Packer, Paragraph } from "docx";
import PDFDocument from "pdfkit";
import { describe, expect, it } from "vitest";

import { extractDocumentText } from "../src/core/index.js";

async function samplePdf(): Promise<Buffer> {
  const document = new PDFDocument();
  const chunks: Buffer[] = [];
  document.on("data", (chunk: Buffer) => chunks.push(chunk));
  const completed = new Promise<Buffer>((resolve) => {
    document.on("end", () => resolve(Buffer.concat(chunks)));
  });
  document.text("Pedoman proposal penelitian");
  document.end();
  return completed;
}

describe("document extraction", () => {
  it("extracts text from DOCX intake material", async () => {
    const document = new Document({
      sections: [{ children: [new Paragraph("Aturan seminar proposal")] }],
    });
    const result = await extractDocumentText(
      "pedoman.docx",
      await Packer.toBuffer(document),
    );
    expect(result).toContain("Aturan seminar proposal");
  });

  it("extracts text from PDF intake material", async () => {
    const result = await extractDocumentText("pedoman.pdf", await samplePdf());
    expect(result).toContain("Pedoman proposal penelitian");
  });
});
