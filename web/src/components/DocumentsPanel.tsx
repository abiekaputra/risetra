import { ArtifactEditor } from "./ArtifactEditor";
import { ArtifactList } from "./ArtifactList";
import { EmptyState } from "./EmptyState";
import type { Copy } from "../i18n";
import type { Artifact, ReviewStatus } from "../types";

type Props = {
  artifacts: Artifact[];
  selected?: Artifact;
  busy: boolean;
  copy: Copy;
  onSelect: (artifact: Artifact) => void;
  onSave: (body: string) => Promise<void>;
  onReview: (status: ReviewStatus, reviewer: string, note: string) => Promise<void>;
};

export function DocumentsPanel({
  artifacts,
  selected,
  busy,
  copy,
  onSelect,
  onSave,
  onReview,
}: Props) {
  return (
    <div className="document-grid">
      <ArtifactList
        artifacts={artifacts}
        selectedId={selected?.id}
        onSelect={onSelect}
        copy={copy}
      />
      {selected ? (
        <ArtifactEditor
          key={selected.id}
          artifact={selected}
          busy={busy}
          onSave={onSave}
          onReview={onReview}
          copy={copy}
        />
      ) : (
        <EmptyState />
      )}
    </div>
  );
}
