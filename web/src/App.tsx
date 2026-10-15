import { useCallback, useEffect, useState } from "react";

import {
  exportProposal,
  getAgent,
  getAlignment,
  getArtifacts,
  getSources,
  getWorkspace,
  resetAgent,
  reviewArtifact,
  runValidation,
  saveAlignment,
  saveArtifact,
  saveSources,
  sendAgentMessage,
  startAgent,
  stopAgent,
} from "./api";
import { AgentPanel } from "./components/AgentPanel";
import { AlignmentPanel } from "./components/AlignmentPanel";
import { ChecksPanel } from "./components/ChecksPanel";
import { DocumentsPanel } from "./components/DocumentsPanel";
import { ResearchNav } from "./components/ResearchNav";
import { SourcesPanel } from "./components/SourcesPanel";
import { WorkspaceHeader } from "./components/WorkspaceHeader";
import { SetupWizard } from "./components/setup/SetupWizard";
import { copyFor } from "./i18n";
import { errorMessage } from "./errors";
import type {
  AgentOverview,
  AlignmentItem,
  Artifact,
  ReviewStatus,
  SourceRecord,
  ValidationReport,
  WorkspaceOverview,
  WorkspaceTab,
} from "./types";

export function App() {
  const [workspace, setWorkspace] = useState<WorkspaceOverview>();
  const [artifacts, setArtifacts] = useState<Artifact[]>([]);
  const [agent, setAgent] = useState<AgentOverview>();
  const [sources, setSources] = useState<SourceRecord[]>([]);
  const [alignment, setAlignment] = useState<AlignmentItem[]>([]);
  const [selectedId, setSelectedId] = useState<string>();
  const [activeTab, setActiveTab] = useState<WorkspaceTab>("guidance");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string>();
  const [error, setError] = useState<string>();
  const [setupOpen, setSetupOpen] = useState(false);
  const copy = copyFor(workspace?.config.languages.dashboard ?? "en-US");
  const selected = artifacts.find((artifact) => artifact.id === selectedId);

  const refresh = useCallback(async () => {
    const [nextWorkspace, nextArtifacts, nextAgent, nextSources, nextAlignment] =
      await Promise.all([
        getWorkspace(),
        getArtifacts(),
        getAgent(),
        getSources(),
        getAlignment(),
      ]);
    setWorkspace(nextWorkspace);
    setArtifacts(nextArtifacts);
    setAgent(nextAgent);
    setSources(nextSources);
    setAlignment(nextAlignment);
    setSelectedId((current) => current ?? nextArtifacts[0]?.id);
  }, []);

  useEffect(() => {
    let active = true;
    Promise.all([
      getWorkspace(),
      getArtifacts(),
      getAgent(),
      getSources(),
      getAlignment(),
    ])
      .then(([nextWorkspace, nextArtifacts, nextAgent, nextSources, nextAlignment]) => {
        if (!active) return;
        setWorkspace(nextWorkspace);
        setArtifacts(nextArtifacts);
        setAgent(nextAgent);
        setSources(nextSources);
        setAlignment(nextAlignment);
        setSelectedId(nextArtifacts[0]?.id);
        setSetupOpen(nextWorkspace.config.setup?.completed !== true);
      })
      .catch((caught: unknown) => {
        if (active) setError(errorMessage(caught));
      });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (agent?.state.status !== "running") return;
    const timer = window.setInterval(() => {
      getAgent()
        .then((next) => {
          setAgent(next);
          if (next.state.status !== "running") void refresh();
        })
        .catch((caught: unknown) => setError(errorMessage(caught)));
    }, 1_500);
    return () => window.clearInterval(timer);
  }, [agent?.state.status, refresh]);

  async function execute(action: () => Promise<void>, success: string) {
    setBusy(true);
    setError(undefined);
    setMessage(undefined);
    try {
      await action();
      setMessage(success);
      await refresh();
    } catch (caught) {
      setError(errorMessage(caught));
    } finally {
      setBusy(false);
    }
  }

  async function handleAgentMessage(input: string) {
    setError(undefined);
    try {
      if ((agent?.state.messages.length ?? 0) === 0) await startAgent(input);
      else await sendAgentMessage(input);
      setAgent(await getAgent());
    } catch (caught) {
      setError(errorMessage(caught));
    }
  }

  async function handleSetupComplete(success: string) {
    await refresh();
    setSetupOpen(false);
    setActiveTab("guidance");
    setMessage(success);
    await handleAgentMessage(
      "Mulai bimbingan berdasarkan persiapan penelitian saya. Ajukan satu pertanyaan paling penting terlebih dahulu.",
    );
  }

  if (error && !workspace) {
    return (
      <div className="fatal-state">
        <strong>{copy.fatal}</strong>
        <p>{error}</p>
      </div>
    );
  }
  if (!workspace || !agent) return <div className="loading-state">{copy.loading}</div>;
  const locale = workspace.config.languages.dashboard;

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
            onValidate={() => setActiveTab("checks")}
            onSetup={() => setSetupOpen(true)}
            validating={busy}
            copy={copy}
          />
          <ResearchNav active={activeTab} locale={locale} onChange={setActiveTab} />
          {(message || error) && (
            <div className={`toast ${error ? "toast--error" : "toast--success"}`}>
              {error ?? message}
            </div>
          )}
          {activeTab === "guidance" && (
            <AgentPanel
              agent={agent}
              locale={locale}
              onSend={handleAgentMessage}
              onStop={async () => {
                await stopAgent();
                setAgent(await getAgent());
              }}
              onReset={async () => {
                if (
                  window.confirm("Mulai sesi baru dan hapus percakapan lokal saat ini?")
                ) {
                  await resetAgent();
                  setAgent(await getAgent());
                }
              }}
            />
          )}
          {activeTab === "documents" && (
            <DocumentsPanel
              artifacts={artifacts}
              selected={selected}
              busy={busy}
              copy={copy}
              onSelect={(artifact) => setSelectedId(artifact.id)}
              onSave={(body) =>
                execute(async () => {
                  if (!selected) return;
                  const saved = await saveArtifact(selected, body);
                  setArtifacts((items) =>
                    items.map((item) => (item.id === saved.id ? saved : item)),
                  );
                }, copy.draftSaved)
              }
              onReview={(status: ReviewStatus, reviewer, note) =>
                execute(async () => {
                  if (!selected) return;
                  const reviewed = await reviewArtifact(
                    selected,
                    status,
                    reviewer,
                    note,
                  );
                  setArtifacts((items) =>
                    items.map((item) => (item.id === reviewed.id ? reviewed : item)),
                  );
                }, copy.artifactMarked(copy.statuses[status]))
              }
            />
          )}
          {activeTab === "sources" && (
            <SourcesPanel
              sources={sources}
              busy={busy}
              locale={locale}
              onChange={setSources}
              onSave={() =>
                execute(
                  () => saveSources(sources),
                  locale.startsWith("id") ? "Sumber tersimpan." : "Sources saved.",
                )
              }
            />
          )}
          {activeTab === "alignment" && (
            <AlignmentPanel
              alignment={alignment}
              busy={busy}
              locale={locale}
              onChange={setAlignment}
              onSave={() =>
                execute(
                  () => saveAlignment(alignment),
                  locale.startsWith("id")
                    ? "Keselarasan tersimpan."
                    : "Alignment saved.",
                )
              }
            />
          )}
          {activeTab === "checks" && (
            <ChecksPanel
              report={workspace.validation}
              busy={busy}
              locale={locale}
              copy={copy}
              onValidate={() =>
                execute(async () => {
                  const report: ValidationReport = await runValidation();
                  setWorkspace((current) =>
                    current ? { ...current, validation: report } : current,
                  );
                }, copy.checksComplete)
              }
              onExport={(format, allowReviewed) =>
                execute(
                  () => exportProposal(format, allowReviewed),
                  locale.startsWith("id")
                    ? "Proposal berhasil diekspor."
                    : "Proposal exported.",
                )
              }
            />
          )}
        </>
      )}
    </div>
  );
}
