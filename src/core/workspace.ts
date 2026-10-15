import { mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";

import { parseArtifact, serializeArtifact } from "./frontmatter.js";
import { alignmentSchema, sourcesSchema, workspaceConfigSchema } from "./schemas.js";
import type {
  AlignmentItem,
  Artifact,
  ArtifactFrontmatter,
  SourceRecord,
  WorkspaceConfig,
  WorkspaceSnapshot,
  WorkspaceSummary,
} from "./types.js";
import { workspacePath } from "./paths.js";

const requiredConfigFile = "risetra.json";

async function readJson(pathname: string): Promise<unknown> {
  return JSON.parse(await readFile(pathname, "utf8")) as unknown;
}

export async function saveSources(
  root: string,
  sources: SourceRecord[],
): Promise<void> {
  const validated = sourcesSchema.parse(sources);
  await writeFile(
    workspacePath(root, "records", "sources.json"),
    `${JSON.stringify(validated, null, 2)}\n`,
    "utf8",
  );
}

export async function saveAlignment(
  root: string,
  alignment: AlignmentItem[],
): Promise<void> {
  const validated = alignmentSchema.parse(alignment);
  await writeFile(
    workspacePath(root, "records", "alignment.json"),
    `${JSON.stringify(validated, null, 2)}\n`,
    "utf8",
  );
}

async function collectMarkdownFiles(directory: string): Promise<string[]> {
  const entries = await readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(
    entries.map(async (entry) => {
      const entryPath = path.join(directory, entry.name);
      if (entry.isDirectory()) return collectMarkdownFiles(entryPath);
      return entry.isFile() && entry.name.endsWith(".md") ? [entryPath] : [];
    }),
  );
  return nested.flat();
}

export async function loadWorkspace(root: string): Promise<WorkspaceSnapshot> {
  const config = workspaceConfigSchema.parse(
    await readJson(workspacePath(root, requiredConfigFile)),
  );
  const artifactRoot = workspacePath(root, "artifacts");
  const artifactFiles = await collectMarkdownFiles(artifactRoot);
  const artifacts = await Promise.all(
    artifactFiles.map(async (filename) => {
      const source = await readFile(filename, "utf8");
      const relativePath = path.relative(root, filename);
      return parseArtifact(source, relativePath);
    }),
  );
  const sources = sourcesSchema.parse(
    await readJson(workspacePath(root, "records", "sources.json")),
  );
  const alignment = alignmentSchema.parse(
    await readJson(workspacePath(root, "records", "alignment.json")),
  );

  return {
    root,
    config,
    artifacts: artifacts.sort((left, right) => left.order - right.order),
    sources,
    alignment,
  };
}

export function summarizeWorkspace(snapshot: WorkspaceSnapshot): WorkspaceSummary {
  const counts = snapshot.artifacts.reduce(
    (result, artifact) => {
      result[artifact.status] += 1;
      return result;
    },
    { DRAFT: 0, REVIEWED: 0, APPROVED: 0 },
  );
  const progressUnits = counts.APPROVED + counts.REVIEWED * 0.5;

  return {
    projectName: snapshot.config.projectName,
    discipline: snapshot.config.discipline,
    methodology: snapshot.config.methodology,
    proposalLanguage: snapshot.config.languages.proposal,
    progress:
      snapshot.artifacts.length === 0
        ? 0
        : Math.round((progressUnits / snapshot.artifacts.length) * 100),
    approved: counts.APPROVED,
    reviewed: counts.REVIEWED,
    draft: counts.DRAFT,
    total: snapshot.artifacts.length,
  };
}

export async function saveArtifact(
  root: string,
  artifact: Artifact,
  body: string,
  expectedVersion: string,
): Promise<Artifact> {
  const filename = workspacePath(root, artifact.path);
  const currentSource = await readFile(filename, "utf8");
  const current = parseArtifact(currentSource, artifact.path);

  if (current.version !== expectedVersion) {
    throw new Error("Artifact changed on disk. Reload it before saving.");
  }

  const metadata: ArtifactFrontmatter = {
    id: current.id,
    title: current.title,
    kind: current.kind,
    status: "DRAFT",
    order: current.order,
    updatedAt: new Date().toISOString(),
  };
  const nextSource = serializeArtifact(metadata, body);
  await writeFile(filename, nextSource, "utf8");
  return parseArtifact(nextSource, artifact.path);
}

export async function updateArtifactReview(
  root: string,
  artifact: Artifact,
  input: { status: "DRAFT" | "REVIEWED" | "APPROVED"; reviewer: string; note: string },
): Promise<Artifact> {
  const filename = workspacePath(root, artifact.path);
  const currentSource = await readFile(filename, "utf8");
  const current = parseArtifact(currentSource, artifact.path);
  const metadata: ArtifactFrontmatter = {
    id: current.id,
    title: current.title,
    kind: current.kind,
    status: input.status,
    order: current.order,
    updatedAt: new Date().toISOString(),
    reviewer: input.reviewer,
    reviewNote: input.note,
  };
  const nextSource = serializeArtifact(metadata, current.body);
  await writeFile(filename, nextSource, "utf8");
  return parseArtifact(nextSource, artifact.path);
}

export async function ensureOutputDirectory(root: string): Promise<string> {
  const output = workspacePath(root, "output");
  await mkdir(output, { recursive: true });
  return output;
}

export async function writeConfig(
  root: string,
  config: WorkspaceConfig,
): Promise<void> {
  await writeFile(
    workspacePath(root, requiredConfigFile),
    `${JSON.stringify(config, null, 2)}\n`,
    "utf8",
  );
}
