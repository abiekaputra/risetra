# Architecture

## Boundary

Risetra is a local product. Codex or Claude Code supplies reasoning; Risetra supplies
research context, files, deterministic checks, review state, and a user-facing control
surface.

## Components

| Component        | Responsibility                                                       |
| ---------------- | -------------------------------------------------------------------- |
| CLI              | Initialize, validate, inspect modules, export, and start the product |
| Core             | Parse schemas, protect paths, load workspaces, validate, and export  |
| Local API        | Mediate bounded reads, writes, review transitions, and validation    |
| Dashboard        | Present artifacts, progress, editing, review, and integrity results  |
| Research modules | Express small, reviewable academic workflows                         |
| Agent adapters   | Point different coding agents to the same canonical rules            |

## Data flow

1. The student or agent edits a Markdown artifact or structured record.
2. The API uses artifact IDs loaded from the workspace rather than accepting raw paths.
3. A save compares the client's version with the current file and rejects stale writes.
4. Any content edit resets the artifact to `DRAFT`.
5. Validation checks structure and traceability without pretending to judge academic
   truth.
6. A human records the review decision and rationale.
7. Export includes only chapters meeting the selected review threshold.

## Source of truth

The dashboard has no hidden authoring database. `risetra.json`, `artifacts/*.md`, and
`records/*.json` can be inspected, versioned, and moved without the UI. This choice makes
the research trail portable and keeps agent behavior auditable.

Onboarding answers are stored in `risetra.json`. Institution guidelines and initial
research materials are stored under `inputs/` with attachment metadata in the same
configuration. These files are intake material, not verified citations; verified source
records remain in `records/sources.json`.

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
