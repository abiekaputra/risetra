import { useEffect, useRef, useState, type FormEvent } from "react";

import type { AgentOverview, ResearchStage } from "../types";

type Props = {
  agent: AgentOverview;
  locale: string;
  onSend: (message: string) => Promise<void>;
  onStop: () => Promise<void>;
  onReset: () => Promise<void>;
};

const stages: ResearchStage[] = [
  "foundation",
  "questions",
  "evidence",
  "chapter-1",
  "chapter-2",
  "chapter-3",
  "readiness",
];

const stageLabels: Record<ResearchStage, { id: string; en: string }> = {
  foundation: { id: "Fondasi", en: "Foundation" },
  questions: { id: "Pertanyaan", en: "Questions" },
  evidence: { id: "Bukti", en: "Evidence" },
  "chapter-1": { id: "Bab 1", en: "Chapter 1" },
  "chapter-2": { id: "Bab 2", en: "Chapter 2" },
  "chapter-3": { id: "Bab 3", en: "Chapter 3" },
  readiness: { id: "Seminar", en: "Seminar" },
};

export function AgentPanel({ agent, locale, onSend, onStop, onReset }: Props) {
  const [message, setMessage] = useState("");
  const endRef = useRef<HTMLDivElement>(null);
  const isId = locale.toLowerCase().startsWith("id");
  const running = agent.state.status === "running";
  const ready = agent.availability.installed && agent.availability.authenticated;

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [agent.state.messages.length, running]);

  async function submit(event: FormEvent) {
    event.preventDefault();
    const input = message.trim();
    if (!input) return;
    setMessage("");
    await onSend(input);
  }

  const begin = isId
    ? "Mulai bimbingan. Pelajari konteks saya dan tanyakan satu hal terpenting yang perlu dipastikan terlebih dahulu."
    : "Start the guidance. Study my context and ask the single most important question to clarify first.";

  return (
    <div className="agent-layout">
      <aside className="stage-panel">
        <span className="eyebrow">{isId ? "Jalur proposal" : "Proposal path"}</span>
        <ol className="stage-list">
          {stages.map((stage, index) => {
            const current = stages.indexOf(agent.state.stage);
            return (
              <li
                key={stage}
                className={
                  index === current ? "is-current" : index < current ? "is-done" : ""
                }
              >
                <span>{index < current ? "✓" : index + 1}</span>
                {isId ? stageLabels[stage].id : stageLabels[stage].en}
              </li>
            );
          })}
        </ol>
        <div className="agent-runtime">
          <strong>{ready ? "Codex ready" : "Codex unavailable"}</strong>
          <small>{agent.availability.version ?? agent.availability.message}</small>
        </div>
      </aside>

      <section className="conversation-panel">
        <header className="conversation-heading">
          <div>
            <span className="eyebrow">
              {isId ? "Mentor penelitian" : "Research mentor"}
            </span>
            <h2>
              {isId
                ? "Bangun keputusan, bukan sekadar paragraf"
                : "Build decisions, not just paragraphs"}
            </h2>
          </div>
          {agent.state.messages.length > 0 && !running && (
            <button className="button button--ghost" onClick={onReset}>
              {isId ? "Sesi baru" : "New session"}
            </button>
          )}
        </header>

        <div className="conversation-stream" aria-live="polite">
          {agent.state.messages.length === 0 && (
            <div className="agent-welcome">
              <strong>
                {isId
                  ? "Konteks penelitian sudah siap."
                  : "Your research context is ready."}
              </strong>
              <p>
                {isId
                  ? "Codex akan membaca bahan Anda, menjelaskan keputusan yang sedang dibuat, lalu mengajukan satu pertanyaan terarah setiap giliran."
                  : "Codex will read your materials, explain the current decision, and ask one focused question per turn."}
              </p>
              <small className="agent-privacy">
                {isId
                  ? "Memulai sesi memproses konteks penelitian yang relevan melalui akun Codex Anda. Hindari data partisipan yang terbatas atau dapat dikenali."
                  : "Starting a session processes relevant research context through your Codex account. Avoid restricted or identifiable participant data."}
              </small>
              <button
                className="button button--primary"
                disabled={!ready}
                onClick={() => onSend(begin)}
              >
                {isId ? "Mulai bimbingan" : "Start guidance"}
              </button>
            </div>
          )}
          {agent.state.messages.map((item) => (
            <article key={item.id} className={`message message--${item.role}`}>
              <span>
                {item.role === "student" ? (isId ? "Anda" : "You") : "Risetra · Codex"}
              </span>
              <p>{item.body}</p>
              {item.explanation && (
                <div className="message-explanation">{item.explanation}</div>
              )}
              {item.decisions && item.decisions.length > 0 && (
                <div className="decision-grid">
                  {item.decisions.map((decision) => (
                    <div key={`${item.id}-${decision.label}`}>
                      <strong>{decision.label}</strong>
                      <p>{decision.value}</p>
                      <small>{decision.reason}</small>
                    </div>
                  ))}
                </div>
              )}
              {item.evidenceNeeded && item.evidenceNeeded.length > 0 && (
                <div className="evidence-callout">
                  <strong>
                    {isId ? "Bukti yang masih diperlukan" : "Evidence still needed"}
                  </strong>
                  <ul>
                    {item.evidenceNeeded.map((evidence) => (
                      <li key={evidence}>{evidence}</li>
                    ))}
                  </ul>
                </div>
              )}
              {item.changedArtifacts && item.changedArtifacts.length > 0 && (
                <small>
                  {isId ? "Diperbarui: " : "Updated: "}
                  {item.changedArtifacts.join(", ")}
                </small>
              )}
              {item.question && <div className="agent-question">{item.question}</div>}
            </article>
          ))}
          {running && (
            <div className="agent-thinking">
              <span className="pulse" />
              <div>
                <strong>Codex</strong>
                <small>{agent.state.activity}</small>
              </div>
              <button className="text-button" onClick={onStop}>
                {isId ? "Hentikan" : "Stop"}
              </button>
            </div>
          )}
          {agent.state.lastError && (
            <div className="agent-error">{agent.state.lastError}</div>
          )}
          <div ref={endRef} />
        </div>

        <form className="message-composer" onSubmit={submit}>
          <textarea
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            disabled={!ready || running}
            placeholder={
              isId
                ? "Jawab pertanyaan Codex atau minta penjelasan…"
                : "Answer Codex or ask for clarification…"
            }
            rows={3}
          />
          <button
            className="button button--primary"
            disabled={!message.trim() || !ready || running}
          >
            {isId ? "Kirim jawaban" : "Send answer"}
          </button>
        </form>
      </section>
    </div>
  );
}
