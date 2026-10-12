import type { ReviewStatus } from "../types";
import type { Copy } from "../i18n";

export function StatusBadge({ status, copy }: { status: ReviewStatus; copy: Copy }) {
  return (
    <span className={`status status--${status.toLowerCase()}`}>
      {copy.statuses[status]}
    </span>
  );
}
