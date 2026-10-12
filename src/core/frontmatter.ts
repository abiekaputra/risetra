import { parse, stringify } from "yaml";

import { artifactFrontmatterSchema } from "./schemas.js";
import type { Artifact, ArtifactFrontmatter } from "./types.js";

export function parseArtifact(source: string, relativePath: string): Artifact {
  const parsed = parseFrontmatter(source);
  const metadata = artifactFrontmatterSchema.parse(parsed.data);

  return {
    ...metadata,
    path: relativePath,
    body: parsed.body.trim(),
    version: createVersion(source),
  };
}

export function serializeArtifact(metadata: ArtifactFrontmatter, body: string): string {
  const normalizedBody = `${body.trim()}\n`;
  const header = stringify(metadata, { lineWidth: 0 }).trim();
  return `---\n${header}\n---\n${normalizedBody}`;
}

export function parseFrontmatter(source: string): {
  data: unknown;
  body: string;
} {
  if (!source.startsWith("---\n")) {
    throw new Error("Markdown file is missing YAML front matter.");
  }
  const end = source.indexOf("\n---\n", 4);
  if (end < 0) throw new Error("Markdown front matter is not closed.");
  const header = source.slice(4, end);
  return { data: parse(header), body: source.slice(end + 5) };
}

export function createVersion(source: string): string {
  let hash = 2166136261;

  for (const character of source) {
    hash ^= character.charCodeAt(0);
    hash = Math.imul(hash, 16777619);
  }

  return (hash >>> 0).toString(16).padStart(8, "0");
}
