import type { ReviewStatus } from "./types";

export type Copy = {
  proposalWorkspace: string;
  runChecks: string;
  checking: string;
  reviewed: string;
  researchTrail: string;
  integrityChecks: string;
  pass: string;
  blocked: string;
  errors: string;
  warnings: string;
  reviews: string;
  noIssues: string;
  markdownSource: string;
  review: string;
  saved: string;
  saving: string;
  saveDraft: string;
  reviewer: string;
  reviewerPlaceholder: string;
  reviewNote: string;
  notePlaceholder: string;
  markReviewed: string;
  approve: string;
  words: string;
  updated: string;
  loading: string;
  fatal: string;
  localWorkspace: string;
  tagline: string;
  draftSaved: string;
  artifactMarked: (status: string) => string;
  checksComplete: string;
  issueMessages: Record<string, string>;
  statuses: Record<ReviewStatus, string>;
  kinds: Record<string, string>;
};

const en: Copy = {
  proposalWorkspace: "Proposal workspace",
  runChecks: "Run checks",
  checking: "Checking…",
  reviewed: "reviewed",
  researchTrail: "Research trail",
  integrityChecks: "Integrity checks",
  pass: "PASS",
  blocked: "BLOCKED",
  errors: "errors",
  warnings: "warnings",
  reviews: "reviews",
  noIssues: "No integrity issue was found.",
  markdownSource: "Markdown source",
  review: "Review",
  saved: "Saved",
  saving: "Saving…",
  saveDraft: "Save draft",
  reviewer: "Reviewer",
  reviewerPlaceholder: "Your name",
  reviewNote: "Review note",
  notePlaceholder: "What did you verify?",
  markReviewed: "Mark reviewed",
  approve: "Approve artifact",
  words: "words",
  updated: "Updated",
  loading: "Loading research trail…",
  fatal: "Risetra could not start.",
  localWorkspace: "LOCAL WORKSPACE",
  tagline: "Build research you can defend.",
  draftSaved: "Draft saved. Review status returned to DRAFT.",
  artifactMarked: (status) => `Artifact marked ${status.toLowerCase()}.`,
  checksComplete: "Integrity checks completed.",
  issueMessages: {},
  statuses: { DRAFT: "DRAFT", REVIEWED: "REVIEWED", APPROVED: "APPROVED" },
  kinds: {},
};

const id: Copy = {
  proposalWorkspace: "Ruang kerja proposal",
  runChecks: "Periksa proposal",
  checking: "Memeriksa…",
  reviewed: "ditinjau",
  researchTrail: "Jejak penelitian",
  integrityChecks: "Pemeriksaan integritas",
  pass: "LOLOS",
  blocked: "TERHAMBAT",
  errors: "galat",
  warnings: "peringatan",
  reviews: "tinjauan",
  noIssues: "Tidak ditemukan masalah integritas.",
  markdownSource: "Sumber Markdown",
  review: "Tinjau",
  saved: "Tersimpan",
  saving: "Menyimpan…",
  saveDraft: "Simpan draf",
  reviewer: "Peninjau",
  reviewerPlaceholder: "Nama peninjau",
  reviewNote: "Catatan tinjauan",
  notePlaceholder: "Apa yang sudah Anda periksa?",
  markReviewed: "Tandai ditinjau",
  approve: "Setujui artefak",
  words: "kata",
  updated: "Diperbarui",
  loading: "Memuat jejak penelitian…",
  fatal: "Risetra tidak dapat dimulai.",
  localWorkspace: "RUANG KERJA LOKAL",
  tagline: "Bangun riset yang dapat Anda pertahankan.",
  draftSaved: "Draf tersimpan. Status tinjauan dikembalikan menjadi DRAF.",
  artifactMarked: (status) => `Artefak ditandai ${status.toLowerCase()}.`,
  checksComplete: "Pemeriksaan integritas selesai.",
  issueMessages: {
    ARTIFACT_DRAFT: "Artefak ini masih memerlukan tinjauan manusia.",
    SOURCE_UNKNOWN: "Sitasi tidak ditemukan dalam inventaris sumber.",
    SOURCE_UNVERIFIED: "Sumber belum diverifikasi secara mandiri.",
    ALIGNMENT_EMPTY: "Pemetaan pertanyaan, tujuan, metode, dan bukti belum tersedia.",
  },
  statuses: { DRAFT: "DRAF", REVIEWED: "DITINJAU", APPROVED: "DISETUJUI" },
  kinds: {
    planning: "perencanaan",
    alignment: "keselarasan",
    "chapter-1": "bab 1",
    "chapter-2": "bab 2",
    "chapter-3": "bab 3",
    readiness: "kesiapan",
  },
};

export function copyFor(locale: string): Copy {
  return locale.toLowerCase().startsWith("id") ? id : en;
}
