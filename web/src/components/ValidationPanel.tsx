import type { ValidationReport } from "../types";
import type { Copy } from "../i18n";

export function ValidationPanel({
  report,
  copy,
}: {
  report: ValidationReport;
  copy: Copy;
}) {
  return (
    <section className="validation-panel">
      <div className="panel-title">
        <span>{copy.integrityChecks}</span>
        <span className={report.valid ? "check-ok" : "check-error"}>
          {report.valid ? copy.pass : `${report.counts.error} ${copy.blocked}`}
        </span>
      </div>
      <div className="validation-counts">
        <span>
          <strong>{report.counts.error}</strong> {copy.errors}
        </span>
        <span>
          <strong>{report.counts.warning}</strong> {copy.warnings}
        </span>
        <span>
          <strong>{report.counts.info}</strong> {copy.reviews}
        </span>
      </div>
      <div className="issue-list">
        {report.issues.slice(0, 5).map((issue, index) => (
          <article
            key={`${issue.code}-${index}`}
            className={`issue issue--${issue.severity}`}
          >
            <span>{issue.code}</span>
            <p>{copy.issueMessages[issue.code] ?? issue.message}</p>
          </article>
        ))}
        {report.issues.length === 0 && <p className="empty-copy">{copy.noIssues}</p>}
      </div>
    </section>
  );
}
