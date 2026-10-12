import type {
  Artifact,
  IntakeAttachment,
  SetupPayload,
  ValidationReport,
  WorkspaceOverview,
} from "./types";

async function request<T>(pathname: string, options?: RequestInit): Promise<T> {
  const headers = new Headers(options?.headers);
  if (typeof options?.body === "string" && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
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

export async function saveSetup(payload: SetupPayload): Promise<void> {
  await request("/api/setup", {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export async function uploadAttachment(
  file: File,
  category: IntakeAttachment["category"],
): Promise<IntakeAttachment> {
  const response = await fetch(`/api/setup/attachments?category=${category}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/octet-stream",
      "X-Risetra-Filename": encodeURIComponent(file.name),
      "X-Risetra-Media-Type": file.type || "application/octet-stream",
    },
    body: file,
  });
  const payload = (await response.json()) as {
    attachment?: IntakeAttachment;
    message?: string;
  };
  if (!response.ok || !payload.attachment) {
    throw new Error(payload.message ?? "The attachment could not be uploaded.");
  }
  return payload.attachment;
}

export async function removeAttachment(id: string): Promise<void> {
  const response = await fetch(`/api/setup/attachments/${id}`, { method: "DELETE" });
  if (response.ok) return;
  const payload = (await response.json()) as { message?: string };
  throw new Error(payload.message ?? "The attachment could not be removed.");
}
