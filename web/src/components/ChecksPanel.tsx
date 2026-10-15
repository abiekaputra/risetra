import { useState } from "react";

import { ValidationPanel } from "./ValidationPanel";
import type { Copy } from "../i18n";
import type { ValidationReport } from "../types";

type Props = {
  report: ValidationReport;
  busy: boolean;
  locale: string;
  copy: Copy;
  onValidate: () => Promise<void>;
  onExport: (format: "md" | "docx" | "pdf", allowReviewed: boolean) => Promise<void>;
};

export function ChecksPanel({
  report,
  busy,
  locale,
  copy,
  onValidate,
  onExport,
}: Props) {
  const [allowReviewed, setAllowReviewed] = useState(false);
  const isId = locale.toLowerCase().startsWith("id");
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
          onClick={onValidate}
        >
          {busy ? copy.checking : copy.runChecks}
        </button>
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
            onClick={() => onExport("docx", allowReviewed)}
          >
            DOCX
          </button>
          <button
            className="button button--primary"
            onClick={() => onExport("pdf", allowReviewed)}
          >
            PDF
          </button>
          <button
            className="button button--secondary"
            onClick={() => onExport("md", allowReviewed)}
          >
            Markdown
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
