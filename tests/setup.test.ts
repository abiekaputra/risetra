import { mkdtemp, readFile, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";

import { afterEach, describe, expect, it } from "vitest";

import { initializeWorkspace, loadWorkspace } from "../src/core/index.js";
import { createServer } from "../src/server/app.js";

const temporaryRoots: string[] = [];
const servers: Awaited<ReturnType<typeof createServer>>[] = [];

async function createTestWorkspace() {
  const parent = await mkdtemp(path.join(os.tmpdir(), "risetra-setup-"));
  temporaryRoots.push(parent);
  const root = path.join(parent, "proposal");
  await initializeWorkspace({
    target: root,
    projectName: "Initial proposal",
    studentName: "Example Student",
    institution: "Example University",
    discipline: "Education",
    methodology: "Undecided",
    proposalLanguage: "id-ID",
  });
  const app = await createServer({ workspaceRoot: root, logger: false });
  servers.push(app);
  return { app, root };
}

afterEach(async () => {
  await Promise.all(servers.splice(0).map((server) => server.close()));
  await Promise.all(
    temporaryRoots.splice(0).map((root) => rm(root, { recursive: true })),
  );
});

describe("research setup API", () => {
  it("saves onboarding answers and creates the first research charter", async () => {
    const { app, root } = await createTestWorkspace();
    const response = await app.inject({
      method: "PUT",
      url: "/api/setup",
      payload: {
        projectName: "Literasi informasi mahasiswa baru",
        studentName: "Mahasiswa Contoh",
        institution: "Universitas Contoh",
        discipline: "Pendidikan",
        methodology: "Belum ditentukan",
        language: "id-ID",
        degreeLevel: "Sarjana",
        context: {
          topic: "Literasi informasi",
          problem:
            "Mahasiswa baru kesulitan mengevaluasi sumber yang layak digunakan dalam tugas akademik.",
          researchObject: "Mahasiswa baru",
          location: "Universitas Contoh",
          motivation:
            "Penelitian dibutuhkan untuk memahami bentuk kesulitan sebelum merancang dukungan pembelajaran.",
        },
        constraints: {
          timeline: "Satu semester",
          budget: "Terbatas",
          participants: "Satu kelas mahasiswa baru",
          dataAccess: "Wawancara dan dokumen tugas dengan izin",
          equipment: "Perekam suara dan laptop",
        },
        supervisorGuidance: "Jangan menyimpulkan penyebab sebelum data tersedia.",
        sourceLeads: [
          {
            title: "Portal jurnal pendidikan",
            url: "https://example.org/journal",
            note: "Titik awal penelusuran, belum diverifikasi.",
          },
        ],
      },
    });

    expect(response.statusCode).toBe(200);
    const workspace = await loadWorkspace(root);
    expect(workspace.config.setup?.completed).toBe(true);
    expect(workspace.config.languages.interaction).toBe("id-ID");
    expect(workspace.config.setup?.sourceLeads).toHaveLength(1);
    expect(
      workspace.artifacts.find((artifact) => artifact.id === "research-charter")?.body,
    ).toContain("Mahasiswa baru kesulitan mengevaluasi sumber");
  });

  it("stores and removes supported onboarding attachments", async () => {
    const { app, root } = await createTestWorkspace();
    const upload = await app.inject({
      method: "POST",
      url: "/api/setup/attachments?category=guideline",
      headers: {
        "content-type": "application/octet-stream",
        "x-risetra-filename": encodeURIComponent("pedoman kampus.pdf"),
        "x-risetra-media-type": "application/pdf",
      },
      payload: Buffer.from("%PDF-demo"),
    });

    expect(upload.statusCode).toBe(200);
    const attachment = upload.json().attachment;
    expect(await readFile(path.join(root, attachment.storedPath), "utf8")).toBe(
      "%PDF-demo",
    );

    const remove = await app.inject({
      method: "DELETE",
      url: `/api/setup/attachments/${attachment.id}`,
    });
    expect(remove.statusCode).toBe(204);
    expect((await loadWorkspace(root)).config.setup?.attachments).toHaveLength(0);
  });

  it("rejects executable uploads", async () => {
    const { app } = await createTestWorkspace();
    const response = await app.inject({
      method: "POST",
      url: "/api/setup/attachments?category=source",
      headers: {
        "content-type": "application/octet-stream",
        "x-risetra-filename": "malware.exe",
      },
      payload: Buffer.from("not-an-executable"),
    });

    expect(response.statusCode).toBe(415);
    expect(response.json().error).toBe("UNSUPPORTED_FILE_TYPE");
  });
});
