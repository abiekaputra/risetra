import { useState } from "react";

import { removeAttachment, saveSetup, uploadAttachment } from "../../api";
import type { IntakeAttachment, SetupPayload, WorkspaceOverview } from "../../types";
import { ConstraintsStep, ContextStep, MaterialsStep, ProfileStep } from "./SetupSteps";
import { setupCopyFor } from "./setupCopy";

type Props = {
  workspace: WorkspaceOverview;
  onComplete: (message: string) => Promise<void>;
  onCancel?: () => void;
};

function initialDraft(workspace: WorkspaceOverview): SetupPayload {
  const setup = workspace.config.setup;
  return {
    projectName: workspace.config.projectName,
    studentName: workspace.config.studentName,
    institution: workspace.config.institution,
    discipline: workspace.config.discipline,
    methodology: workspace.config.methodology,
    language: workspace.config.languages.proposal,
    degreeLevel: setup?.degreeLevel ?? "",
    context: setup?.context ?? {
      topic: "",
      problem: "",
      researchObject: "",
      location: "",
      motivation: "",
    },
    constraints: setup?.constraints ?? {
      timeline: "",
      budget: "",
      participants: "",
      dataAccess: "",
      equipment: "",
    },
    supervisorGuidance: setup?.supervisorGuidance ?? "",
    sourceLeads: setup?.sourceLeads ?? [],
  };
}

export function SetupWizard({ workspace, onComplete, onCancel }: Props) {
  const [step, setStep] = useState(0);
  const [draft, setDraft] = useState(() => initialDraft(workspace));
  const [attachments, setAttachments] = useState<IntakeAttachment[]>(
    workspace.config.setup?.attachments ?? [],
  );
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string>();
  const copy = setupCopyFor(draft.language);
  const update = (patch: Partial<SetupPayload>) =>
    setDraft((current) => ({ ...current, ...patch }));

  async function handleUpload(files: FileList, category: IntakeAttachment["category"]) {
    setBusy(true);
    setError(undefined);
    try {
      for (const file of Array.from(files)) {
        const attachment = await uploadAttachment(file, category);
        setAttachments((current) => [...current, attachment]);
      }
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Upload failed.");
    } finally {
      setBusy(false);
    }
  }

  async function handleRemoveAttachment(id: string) {
    setBusy(true);
    setError(undefined);
    try {
      await removeAttachment(id);
      setAttachments((current) => current.filter((item) => item.id !== id));
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Remove failed.");
    } finally {
      setBusy(false);
    }
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (step < 3) {
      setStep((current) => current + 1);
      return;
    }
    setBusy(true);
    setError(undefined);
    try {
      await saveSetup(draft);
      await onComplete(copy.saved);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Setup failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="setup-shell">
      <div className="setup-intro">
        <span className="eyebrow">{copy.eyebrow}</span>
        <h1>{copy.title}</h1>
        <p>{copy.description}</p>
      </div>
      <ol className="setup-progress">
        {copy.steps.map((label, index) => (
          <li
            key={label}
            className={index === step ? "is-current" : index < step ? "is-done" : ""}
          >
            <span>{index + 1}</span>
            {label}
          </li>
        ))}
      </ol>
      <form className="setup-card" onSubmit={handleSubmit}>
        {step === 0 && <ProfileStep draft={draft} update={update} copy={copy} />}
        {step === 1 && <ContextStep draft={draft} update={update} copy={copy} />}
        {step === 2 && (
          <MaterialsStep
            draft={draft}
            update={update}
            copy={copy}
            attachments={attachments}
            uploading={busy}
            onUpload={handleUpload}
            onRemoveAttachment={handleRemoveAttachment}
          />
        )}
        {step === 3 && <ConstraintsStep draft={draft} update={update} copy={copy} />}
        {error && <div className="setup-error">{error}</div>}
        <footer className="setup-actions">
          <div>
            {onCancel && (
              <button type="button" className="button button--ghost" onClick={onCancel}>
                {copy.cancel}
              </button>
            )}
          </div>
          <div>
            {step > 0 && (
              <button
                type="button"
                className="button button--secondary"
                onClick={() => setStep((current) => current - 1)}
              >
                {copy.back}
              </button>
            )}
            <button type="submit" className="button button--primary" disabled={busy}>
              {step === 3 ? copy.finish : copy.next}
            </button>
          </div>
        </footer>
      </form>
    </main>
  );
}
