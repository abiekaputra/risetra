import { useState } from "react";

import { StatusBadge } from "./StatusBadge";
import type { Copy } from "../i18n";
import type { Artifact, ReviewStatus } from "../types";

type Props = {
  artifact: Artifact;
  busy: boolean;
  onSave: (body: string) => Promise<void>;
  onReview: (status: ReviewStatus, reviewer: string, note: string) => Promise<void>;
  copy: Copy;
};

export function ArtifactEditor({ artifact, busy, onSave, onReview, copy }: Props) {
  const [body, setBody] = useState(artifact.body);
  const [reviewer, setReviewer] = useState(artifact.reviewer ?? "");
  const [note, setNote] = useState(artifact.reviewNote ?? "");
  const [reviewOpen, setReviewOpen] = useState(false);

  const changed = body !== artifact.body;

  async function submitReview(status: ReviewStatus) {
    await onReview(status, reviewer, note);
    setReviewOpen(false);
  }

  return (
    <main className="editor-panel">
      <div className="editor-heading">
        <div>
          <span className="eyebrow">
            {copy.kinds[artifact.kind] ?? artifact.kind.replaceAll("-", " ")}
          </span>
          <h2>{artifact.title}</h2>
        </div>
        <StatusBadge status={artifact.status} copy={copy} />
      </div>

      <div className="editor-toolbar">
        <span>
          {copy.markdownSource} · {artifact.version}
        </span>
        <div>
          <button
            className="button button--ghost"
            onClick={() => setReviewOpen((value) => !value)}
          >
            {copy.review}
          </button>
          <button
            className="button button--primary"
            disabled={!changed || busy}
            onClick={() => onSave(body)}
          >
            {busy ? copy.saving : changed ? copy.saveDraft : copy.saved}
          </button>
        </div>
      </div>

      {reviewOpen && (
        <section className="review-form">
          <label>
            {copy.reviewer}
            <input
              value={reviewer}
              onChange={(event) => setReviewer(event.target.value)}
              placeholder={copy.reviewerPlaceholder}
            />
          </label>
          <label>
            {copy.reviewNote}
            <input
              value={note}
              onChange={(event) => setNote(event.target.value)}
              placeholder={copy.notePlaceholder}
            />
          </label>
          <div className="review-actions">
            <button
              className="button button--secondary"
              disabled={reviewer.length < 2 || note.length < 3 || busy}
              onClick={() => submitReview("REVIEWED")}
            >
              {copy.markReviewed}
            </button>
            <button
              className="button button--primary"
              disabled={reviewer.length < 2 || note.length < 3 || busy}
              onClick={() => submitReview("APPROVED")}
            >
              {copy.approve}
            </button>
          </div>
        </section>
      )}

      <textarea
        className="markdown-editor"
        value={body}
        onChange={(event) => setBody(event.target.value)}
        spellCheck
        aria-label={`${artifact.title} Markdown editor`}
      />
      <footer className="editor-footer">
        <span>
          {body.split(/\s+/).filter(Boolean).length} {copy.words}
        </span>
        <span>
          {copy.updated} {new Date(artifact.updatedAt).toLocaleString()}
        </span>
      </footer>
    </main>
  );
}
