import { useCallback, useEffect, useState } from "react";

import {
  getArtifacts,
  getWorkspace,
  reviewArtifact,
  runValidation,
  saveArtifact,
} from "./api";
import { ArtifactEditor } from "./components/ArtifactEditor";
import { ArtifactList } from "./components/ArtifactList";
import { EmptyState } from "./components/EmptyState";
import { ValidationPanel } from "./components/ValidationPanel";
import { WorkspaceHeader } from "./components/WorkspaceHeader";
import { SetupWizard } from "./components/setup/SetupWizard";
import { copyFor } from "./i18n";
import type {
  Artifact,
  ReviewStatus,
  ValidationReport,
  WorkspaceOverview,
} from "./types";

export function App() {
  const [workspace, setWorkspace] = useState<WorkspaceOverview>();
  const [artifacts, setArtifacts] = useState<Artifact[]>([]);
  const [selectedId, setSelectedId] = useState<string>();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string>();
  const [error, setError] = useState<string>();
  const [setupOpen, setSetupOpen] = useState(false);
  const copy = copyFor(workspace?.config.languages.dashboard ?? "en-US");

  const selected = artifacts.find((artifact) => artifact.id === selectedId);

  const refresh = useCallback(async () => {
    const [nextWorkspace, nextArtifacts] = await Promise.all([
      getWorkspace(),
      getArtifacts(),
    ]);
    setWorkspace(nextWorkspace);
    setArtifacts(nextArtifacts);
    setSelectedId((current) => current ?? nextArtifacts[0]?.id);
  }, []);

  useEffect(() => {
    let active = true;
    Promise.all([getWorkspace(), getArtifacts()])
      .then(([nextWorkspace, nextArtifacts]) => {
        if (!active) return;
        setWorkspace(nextWorkspace);
        setArtifacts(nextArtifacts);
        setSelectedId(nextArtifacts[0]?.id);
        setSetupOpen(nextWorkspace.config.setup?.completed !== true);
      })
      .catch((caught: unknown) => {
        if (!active) return;
        setError(
          caught instanceof Error ? caught.message : "Unable to load workspace.",
        );
      });
    return () => {
      active = false;
    };
  }, []);

  async function execute(action: () => Promise<void>, successMessage: string) {
    setBusy(true);
    setError(undefined);
    setMessage(undefined);
    try {
      await action();
      setMessage(successMessage);
      await refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "The operation failed.");
    } finally {
      setBusy(false);
    }
  }

  async function handleSave(body: string) {
    if (!selected) return;
    await execute(async () => {
      const saved = await saveArtifact(selected, body);
      setArtifacts((items) =>
        items.map((item) => (item.id === saved.id ? saved : item)),
      );
    }, copy.draftSaved);
  }

  async function handleReview(status: ReviewStatus, reviewer: string, note: string) {
    if (!selected) return;
    await execute(async () => {
      const reviewed = await reviewArtifact(selected, status, reviewer, note);
      setArtifacts((items) =>
        items.map((item) => (item.id === reviewed.id ? reviewed : item)),
      );
    }, copy.artifactMarked(copy.statuses[status]));
  }

  async function handleValidation() {
    await execute(async () => {
      const report: ValidationReport = await runValidation();
      setWorkspace((current) =>
        current ? { ...current, validation: report } : current,
      );
    }, copy.checksComplete);
  }

  async function handleSetupComplete(successMessage: string) {
    await refresh();
    setSetupOpen(false);
    setError(undefined);
    setMessage(successMessage);
  }

  if (error && !workspace) {
    return (
      <div className="fatal-state">
        <strong>{copy.fatal}</strong>
        <p>{error}</p>
      </div>
    );
  }
  if (!workspace) return <div className="loading-state">{copy.loading}</div>;

  return (
    <div className="app-shell">
      <div className="brand-bar">
        <img src="/risetra-logo.png" alt="Risetra" />
        <span>{copy.tagline}</span>
        <span className="local-badge">{copy.localWorkspace}</span>
      </div>
      {setupOpen ? (
        <SetupWizard
          workspace={workspace}
          onComplete={handleSetupComplete}
          onCancel={
            workspace.config.setup?.completed ? () => setSetupOpen(false) : undefined
          }
        />
      ) : (
        <>
          <WorkspaceHeader
            workspace={workspace}
            onValidate={handleValidation}
            onSetup={() => setSetupOpen(true)}
            validating={busy}
            copy={copy}
          />
          {(message || error) && (
            <div className={`toast ${error ? "toast--error" : "toast--success"}`}>
              {error ?? message}
            </div>
          )}
          <div className="workspace-grid">
            <ArtifactList
              artifacts={artifacts}
              selectedId={selectedId}
              onSelect={(artifact) => setSelectedId(artifact.id)}
              copy={copy}
            />
            {selected ? (
              <ArtifactEditor
                key={selected.id}
                artifact={selected}
                busy={busy}
                onSave={handleSave}
                onReview={handleReview}
                copy={copy}
              />
            ) : (
              <EmptyState />
            )}
            <ValidationPanel report={workspace.validation} copy={copy} />
          </div>
        </>
      )}
    </div>
  );
}
