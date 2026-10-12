import path from "node:path";

export function resolveWorkspaceRoot(input: string): string {
  return path.resolve(input);
}

export function assertInsideWorkspace(root: string, candidate: string): string {
  const normalizedRoot = path.resolve(root);
  const normalizedCandidate = path.resolve(candidate);
  const relative = path.relative(normalizedRoot, normalizedCandidate);

  if (relative.startsWith("..") || path.isAbsolute(relative)) {
    throw new Error("Path escapes the Risetra workspace.");
  }

  return normalizedCandidate;
}

export function workspacePath(root: string, ...segments: string[]): string {
  return assertInsideWorkspace(root, path.join(root, ...segments));
}
