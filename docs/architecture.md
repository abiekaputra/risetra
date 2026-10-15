# Architecture

## Boundary

Risetra is a local product. Codex or Claude Code supplies reasoning; Risetra supplies
research context, files, deterministic checks, review state, and a user-facing control
surface.

## Components

| Component        | Responsibility                                                         |
| ---------------- | ---------------------------------------------------------------------- |
| CLI              | Initialize, validate, inspect modules, export, and start the product   |
| Core             | Parse schemas, protect paths, load workspaces, validate, and export    |
| Local API        | Mediate bounded reads, writes, review transitions, and validation      |
| Dashboard        | Guide sessions, review evidence, edit artifacts, validate, and export  |
| Codex runtime    | Start or resume a sandboxed research turn and return structured output |
| Research modules | Express small, reviewable academic workflows                           |
| Agent adapters   | Point different coding agents to the same canonical rules              |

## Data flow

1. The student completes onboarding and starts guidance from the dashboard.
2. The API launches `codex exec` with `workspace-write`, a strict response schema, and
   the proposal workspace as its only working root.
3. Codex reads the local research context, may update DRAFT artifacts or records, and
   returns a pedagogical summary, one question, decisions, and missing evidence.
4. The dashboard polls local state and renders the result without exposing hidden model
   reasoning.
5. The student or agent edits a Markdown artifact or structured record.
6. The API uses artifact IDs loaded from the workspace rather than accepting raw paths.
7. A save compares the client's version with the current file and rejects stale writes.
8. Any content edit resets the artifact to `DRAFT`.
9. Validation checks structure and traceability without pretending to judge academic
   truth.
10. A human records the review decision and rationale.
11. Export includes only chapters meeting the selected review threshold.

## Source of truth

The dashboard has no hidden authoring database. `risetra.json`, `artifacts/*.md`, and
`records/*.json` can be inspected, versioned, and moved without the UI. This choice makes
the research trail portable and keeps agent behavior auditable.

Onboarding answers are stored in `risetra.json`. Institution guidelines and initial
research materials are stored under `inputs/` with attachment metadata in the same
configuration. PDF, DOCX, and plain-text material receives a bounded local text extract
under `inputs/extracted/` for the agent to inspect. Both the original and extract remain
untrusted intake material, not verified citations; source records remain in
`records/sources.json`.

Agent state is stored locally in `records/agent-session.json` and excluded from Git by
default because it may contain private research discussion. Codex owns its authenticated
thread record; Risetra stores only the thread identifier and the student-facing structured
turn summaries required to restore the dashboard.

## Configuration precedence

Academic integrity cannot be overridden. Universal modules precede discipline and
method packs, institution rules, language rules, workspace preferences, and session
preferences. A more specific rule may format or refine output, but it cannot remove
provenance, alignment, or review requirements.

## Language boundaries

Dashboard, agent interaction, proposal output, accepted source languages, citation
locale, and quotation behavior are independent configuration values. The interface uses
the dashboard locale. Agents use the interaction locale. Chapters inherit the proposal
locale, while quotations preserve their source language unless a reviewed rule permits
a visibly labeled translation.
