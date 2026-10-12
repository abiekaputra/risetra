import type { Artifact, ValidationReport, WorkspaceOverview } from "./types";

async function request<T>(pathname: string, options?: RequestInit): Promise<T> {
  const headers = new Headers(options?.headers);
  if (options?.body) headers.set("Content-Type", "application/json");
  const response = await fetch(pathname, {
    ...options,
    headers,
  });
  const payload = (await response.json()) as T & { message?: string };
  if (!response.ok) throw new Error(payload.message ?? "Risetra request failed.");
  return payload;
}

export async function getWorkspace(): Promise<WorkspaceOverview> {
  return request<WorkspaceOverview>("/api/workspace");
}

export async function getArtifacts(): Promise<Artifact[]> {
  const payload = await request<{ artifacts: Artifact[] }>("/api/artifacts");
  return payload.artifacts;
}

export async function saveArtifact(
  artifact: Artifact,
  body: string,
): Promise<Artifact> {
  const payload = await request<{ artifact: Artifact }>(
    `/api/artifacts/${artifact.id}`,
    {
      method: "PUT",
      body: JSON.stringify({ body, expectedVersion: artifact.version }),
    },
  );
  return payload.artifact;
}

export async function reviewArtifact(
  artifact: Artifact,
  status: Artifact["status"],
  reviewer: string,
  note: string,
): Promise<Artifact> {
  const payload = await request<{ artifact: Artifact }>(
    `/api/artifacts/${artifact.id}/review`,
    { method: "POST", body: JSON.stringify({ status, reviewer, note }) },
  );
  return payload.artifact;
}

export async function runValidation(): Promise<ValidationReport> {
  const payload = await request<{ validation: ValidationReport }>("/api/validate", {
    method: "POST",
  });
  return payload.validation;
}
