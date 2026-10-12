import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { z } from "zod";

import { parseFrontmatter } from "./frontmatter.js";

const moduleMetadataSchema = z.object({
  id: z.string().regex(/^[a-z0-9-]+$/),
  version: z.string().regex(/^\d+\.\d+\.\d+$/),
  status: z.enum(["DRAFT", "REVIEWED", "APPROVED"]),
  applies_to: z.string().min(2),
  dependencies: z.array(z.string()),
});

export type ResearchModule = z.infer<typeof moduleMetadataSchema> & {
  path: string;
  body: string;
};

async function collectModules(root: string): Promise<string[]> {
  const entries = await readdir(root, { withFileTypes: true });
  const nested = await Promise.all(
    entries.map(async (entry) => {
      const pathname = path.join(root, entry.name);
      if (entry.isDirectory()) return collectModules(pathname);
      return entry.isFile() && entry.name.endsWith(".md") ? [pathname] : [];
    }),
  );
  return nested.flat();
}

export async function loadResearchModules(root: string): Promise<ResearchModule[]> {
  const files = await collectModules(root);
  return Promise.all(
    files.map(async (filename) => {
      const parsed = parseFrontmatter(await readFile(filename, "utf8"));
      return {
        ...moduleMetadataSchema.parse(parsed.data),
        path: path.relative(root, filename),
        body: parsed.body.trim(),
      };
    }),
  );
}

export function validateModuleGraph(modules: ResearchModule[]): string[] {
  const ids = new Set<string>();
  const errors: string[] = [];

  for (const module of modules) {
    if (ids.has(module.id)) errors.push(`Duplicate module id: ${module.id}`);
    ids.add(module.id);
    if (module.body.length < 100) errors.push(`Module ${module.id} is too short.`);
  }

  for (const module of modules) {
    for (const dependency of module.dependencies) {
      if (!ids.has(dependency)) {
        errors.push(`${module.id} depends on missing module ${dependency}.`);
      }
    }
  }
  return errors;
}
