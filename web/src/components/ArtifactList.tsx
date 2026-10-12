import { StatusBadge } from "./StatusBadge";
import type { Copy } from "../i18n";
import type { Artifact } from "../types";

type Props = {
  artifacts: Artifact[];
  selectedId?: string;
  onSelect: (artifact: Artifact) => void;
  copy: Copy;
};

export function ArtifactList({ artifacts, selectedId, onSelect, copy }: Props) {
  return (
    <aside className="artifact-panel" aria-label="Proposal artifacts">
      <div className="panel-title">
        <span>{copy.researchTrail}</span>
        <strong>{artifacts.length}</strong>
      </div>
      <nav className="artifact-list">
        {artifacts.map((artifact) => (
          <button
            key={artifact.id}
            className={`artifact-item ${selectedId === artifact.id ? "is-active" : ""}`}
            onClick={() => onSelect(artifact)}
          >
            <span className="artifact-number">
              {String(artifact.order).padStart(2, "0")}
            </span>
            <span className="artifact-copy">
              <strong>{artifact.title}</strong>
              <small>
                {copy.kinds[artifact.kind] ?? artifact.kind.replaceAll("-", " ")}
              </small>
            </span>
            <StatusBadge status={artifact.status} copy={copy} />
          </button>
        ))}
      </nav>
    </aside>
  );
}
