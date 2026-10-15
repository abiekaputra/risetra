import { useState } from "react";

import { ValidationPanel } from "./ValidationPanel";
import type { Copy } from "../i18n";
import type { ValidationReport } from "../types";

type ExportFormat = "md" | "docx" | "pdf";
type Action = "validate" | ExportFormat;
type Feedback = {
  tone: "success" | "error" | "info";
  title: string;
  body: string;
};

type Props = {
  report: ValidationReport;
  locale: string;
  copy: Copy;
  onValidate: () => Promise<ValidationReport>;
  onExport: (format: ExportFormat, allowReviewed: boolean) => Promise<string>;
};

function messageFrom(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

export function ChecksPanel({ report, locale, copy, onValidate, onExport }: Props) {
  const [allowReviewed, setAllowReviewed] = useState(true);
  const [action, setAction] = useState<Action>();
  const [feedback, setFeedback] = useState<Feedback>();
  const isId = locale.toLowerCase().startsWith("id");

  async function validate() {
    setAction("validate");
    setFeedback({
      tone: "info",
      title: isId ? "Sedang memeriksa proposal…" : "Checking the proposal…",
      body: isId
        ? "Risetra memeriksa struktur, sitasi, dan keselarasan Bab 1–3."
        : "Risetra is checking the structure, citations, and alignment of Chapters 1–3.",
    });
    try {
      const result = await onValidate();
      const summary = isId
        ? `${result.counts.error} galat · ${result.counts.warning} peringatan · ${result.counts.info} catatan tinjauan.`
        : `${result.counts.error} errors · ${result.counts.warning} warnings · ${result.counts.info} review notes.`;
      setFeedback({
        tone: result.valid ? "success" : "error",
        title: result.valid
          ? isId
            ? "Pemeriksaan selesai"
            : "Checks completed"
          : isId
            ? "Proposal masih diblokir"
            : "The proposal is still blocked",
        body: result.valid
          ? `${summary} ${isId ? "Draf dapat diekspor setelah Bab 1–3 berstatus DITINJAU." : "The draft can be exported after Chapters 1–3 reach REVIEWED status."}`
          : summary,
      });
    } catch (error) {
      setFeedback({
        tone: "error",
        title: isId ? "Pemeriksaan gagal" : "Checks failed",
        body: messageFrom(error),
      });
    } finally {
      setAction(undefined);
    }
  }

  async function exportFile(format: ExportFormat) {
    setAction(format);
    const label = format.toUpperCase();
    setFeedback({
      tone: "info",
      title: isId ? `Sedang menyiapkan ${label}…` : `Preparing ${label}…`,
      body: isId
        ? "File akan diunduh oleh browser dan salinannya disimpan di folder output/."
        : "The browser will download the file and keep a copy under output/.",
    });
    try {
      const filename = await onExport(format, allowReviewed);
      setFeedback({
        tone: "success",
        title: isId ? `${label} berhasil dibuat` : `${label} created`,
        body: isId
          ? `${filename} telah diunduh dan disimpan lokal di output/${filename}.`
          : `${filename} was downloaded and saved locally at output/${filename}.`,
      });
    } catch (error) {
      setFeedback({
        tone: "error",
        title: isId ? `${label} gagal dibuat` : `${label} export failed`,
        body: messageFrom(error),
      });
    } finally {
      setAction(undefined);
    }
  }

  const busy = action !== undefined;
  return (
    <div className="checks-layout">
      <ValidationPanel report={report} copy={copy} />
      <section className="export-panel">
        <span className="eyebrow">{isId ? "Hasil akhir" : "Final output"}</span>
        <h2>
          {isId ? "Validasi dan ekspor proposal" : "Validate and export proposal"}
        </h2>
        <p>
          {isId
            ? "Risetra hanya mengekspor Bab 1–3 yang sudah ditinjau. Pilih persetujuan penuh untuk naskah final."
            : "Risetra only exports reviewed Chapters 1–3. Require full approval for a final manuscript."}
        </p>
        <button
          className="button button--secondary"
          disabled={busy}
          onClick={() => void validate()}
        >
          {action === "validate" ? copy.checking : copy.runChecks}
        </button>
        {feedback && (
          <div
            className={`export-feedback export-feedback--${feedback.tone}`}
            role={feedback.tone === "error" ? "alert" : "status"}
            aria-live="polite"
          >
            <strong>{feedback.title}</strong>
            <span>{feedback.body}</span>
          </div>
        )}
        <label className="checkbox-row">
          <input
            type="checkbox"
            checked={allowReviewed}
            onChange={(event) => setAllowReviewed(event.target.checked)}
          />
          {isId
            ? "Izinkan status DITINJAU untuk draf pratinjau"
            : "Allow REVIEWED status for a preview draft"}
        </label>
        <div className="export-actions">
          <button
            className="button button--primary"
            disabled={busy}
            onClick={() => void exportFile("docx")}
          >
            {action === "docx" ? "Menyiapkan DOCX…" : "DOCX"}
          </button>
          <button
            className="button button--primary"
            disabled={busy}
            onClick={() => void exportFile("pdf")}
          >
            {action === "pdf" ? "Menyiapkan PDF…" : "PDF"}
          </button>
          <button
            className="button button--secondary"
            disabled={busy}
            onClick={() => void exportFile("md")}
          >
            {action === "md" ? "Menyiapkan Markdown…" : "Markdown"}
          </button>
        </div>
        <small>
          {isId
            ? "Semua file disimpan lokal di folder output/ dan langsung diunduh oleh browser."
            : "Every file stays local under output/ and is downloaded by your browser."}
        </small>
      </section>
    </div>
  );
}
