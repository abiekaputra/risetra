import type { ValidationReport } from "../core/index.js";

const colors = {
  cyan: "\u001b[36m",
  green: "\u001b[32m",
  red: "\u001b[31m",
  yellow: "\u001b[33m",
  reset: "\u001b[0m",
};

export function heading(value: string): void {
  console.log(`${colors.cyan}${value}${colors.reset}`);
}

export function success(value: string): void {
  console.log(`${colors.green}✓${colors.reset} ${value}`);
}

export function failure(value: string): void {
  console.error(`${colors.red}✗${colors.reset} ${value}`);
}

function issueMessage(code: string, fallback: string, artifactId?: string): string {
  const messages: Record<string, string> = {
    ARTIFACT_DRAFT: `Artefak ${artifactId ?? "ini"} masih memerlukan tinjauan manusia.`,
    SOURCE_UNKNOWN: "Sitasi tidak ditemukan dalam inventaris sumber.",
    SOURCE_UNVERIFIED: "Sumber belum diverifikasi secara mandiri.",
    ALIGNMENT_EMPTY: "Pemetaan pertanyaan, tujuan, metode, dan bukti belum tersedia.",
  };
  return messages[code] ?? fallback;
}

export function printValidation(report: ValidationReport, locale = "en-US"): void {
  const indonesian = locale.toLowerCase().startsWith("id");
  heading(indonesian ? "Validasi Risetra" : "Risetra validation");
  console.log(
    indonesian
      ? `${report.counts.error} galat · ${report.counts.warning} peringatan · ${report.counts.info} catatan tinjauan`
      : `${report.counts.error} errors · ${report.counts.warning} warnings · ${report.counts.info} review notes`,
  );
  for (const issue of report.issues) {
    const marker =
      issue.severity === "error"
        ? `${colors.red}ERROR${colors.reset}`
        : issue.severity === "warning"
          ? `${colors.yellow}WARN${colors.reset}`
          : "INFO";
    const message = indonesian
      ? issueMessage(issue.code, issue.message, issue.artifactId)
      : issue.message;
    console.log(`${marker} ${issue.code}: ${message}`);
  }
}
