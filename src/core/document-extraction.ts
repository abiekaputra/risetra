import path from "node:path";

import JSZip from "jszip";
import { PDFParse } from "pdf-parse";

const textExtensions = new Set([".csv", ".md", ".txt"]);
const maxExtractedCharacters = 300_000;

function decodeXml(value: string): string {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'");
}

async function extractDocx(body: Buffer): Promise<string> {
  const archive = await JSZip.loadAsync(body);
  const document = archive.file("word/document.xml");
  if (!document) throw new Error("The DOCX document has no readable main content.");
  const xml = await document.async("text");
  return decodeXml(
    xml
      .replace(/<w:tab\s*\/>/g, "\t")
      .replace(/<w:br\s*\/>/g, "\n")
      .replace(/<\/w:p>/g, "\n")
      .replace(/<[^>]+>/g, ""),
  );
}

async function extractPdf(body: Buffer): Promise<string> {
  const parser = new PDFParse({ data: new Uint8Array(body) });
  try {
    return (await parser.getText()).text;
  } finally {
    await parser.destroy();
  }
}

export async function extractDocumentText(
  filename: string,
  body: Buffer,
): Promise<string | undefined> {
  const extension = path.extname(filename).toLowerCase();
  let text: string | undefined;
  if (textExtensions.has(extension)) text = body.toString("utf8");
  if (extension === ".docx") text = await extractDocx(body);
  if (extension === ".pdf") text = await extractPdf(body);
  if (!text) return undefined;
  return text.replace(/\r\n/g, "\n").trim().slice(0, maxExtractedCharacters);
}
