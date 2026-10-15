import { access, cp, mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { workspaceConfigSchema } from "./schemas.js";

export type InitializeOptions = {
  target: string;
  projectName: string;
  studentName: string;
  institution: string;
  discipline: string;
  methodology: string;
  proposalLanguage: string;
};

async function pathExists(pathname: string): Promise<boolean> {
  try {
    await access(pathname);
    return true;
  } catch {
    return false;
  }
}

function packageRoot(): string {
  const currentDirectory = path.dirname(fileURLToPath(import.meta.url));
  return path.resolve(currentDirectory, "..", "..");
}

async function findTemplate(): Promise<string> {
  const candidates = [
    path.resolve(process.cwd(), "templates", "starter"),
    path.resolve(packageRoot(), "templates", "starter"),
  ];

  for (const candidate of candidates) {
    if (await pathExists(candidate)) return candidate;
  }
  throw new Error("The Risetra starter template could not be located.");
}

export async function initializeWorkspace(options: InitializeOptions): Promise<string> {
  const target = path.resolve(options.target);
  const configPath = path.join(target, "risetra.json");

  if (await pathExists(configPath)) {
    throw new Error(`A Risetra workspace already exists at ${target}.`);
  }

  await mkdir(target, { recursive: true });
  await cp(await findTemplate(), target, { recursive: true, errorOnExist: true });
  const bundledModules = path.resolve(packageRoot(), "modules");
  if (await pathExists(bundledModules)) {
    await cp(bundledModules, path.join(target, ".risetra", "modules"), {
      recursive: true,
      errorOnExist: true,
    });
  }
  const starter = JSON.parse(await readFile(configPath, "utf8")) as Record<
    string,
    unknown
  >;
  const config = workspaceConfigSchema.parse({
    ...starter,
    projectName: options.projectName,
    studentName: options.studentName,
    institution: options.institution,
    discipline: options.discipline,
    methodology: options.methodology,
    demoMode: false,
    languages: {
      ...(starter.languages as Record<string, unknown>),
      proposal: options.proposalLanguage,
    },
    createdAt: new Date().toISOString(),
  });
  await writeFile(configPath, `${JSON.stringify(config, null, 2)}\n`, "utf8");
  return target;
}
