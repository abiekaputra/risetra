import { ProgressRing } from "./ProgressRing";
import type { Copy } from "../i18n";
import type { WorkspaceOverview } from "../types";

type Props = {
  workspace: WorkspaceOverview;
  onValidate: () => void;
  onSetup: () => void;
  validating: boolean;
  copy: Copy;
};

export function WorkspaceHeader({
  workspace,
  onValidate,
  onSetup,
  validating,
  copy,
}: Props) {
  return (
    <header className="workspace-header">
      <div>
        <span className="eyebrow">{copy.proposalWorkspace}</span>
        <h1>{workspace.config.projectName}</h1>
        <p>
          {workspace.config.discipline} · {workspace.config.methodology} ·{" "}
          {workspace.config.institution}
        </p>
      </div>
      <div className="header-actions">
        <button className="button button--ghost button--on-dark" onClick={onSetup}>
          {copy.setupResearch}
        </button>
        <button className="button button--secondary" onClick={onValidate}>
          {validating ? copy.checking : copy.runChecks}
        </button>
        <ProgressRing value={workspace.summary.progress} label={copy.reviewed} />
      </div>
    </header>
  );
}
