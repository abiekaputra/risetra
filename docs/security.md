# Security model

## Local attack surface

The server binds to `127.0.0.1`, limits request bodies, and serves the built dashboard
from the same origin. Development CORS accepts only the configured local Vite origin.

Artifact routes accept validated identifiers. They locate files through the parsed
workspace inventory instead of converting user input into a filesystem path. Shared
path helpers reject candidates outside the workspace.

Onboarding uploads accept only PDF, DOC/DOCX, Markdown, text, CSV, and spreadsheet
extensions. Each file is limited to 10 MiB, receives a generated storage name, and stays
inside the workspace `inputs/` directory. PDF, DOCX, Markdown, text, and CSV receive a
bounded plain-text extract; legacy DOC and spreadsheet files remain available to the
workspace but are not automatically extracted.

New workspaces ignore `inputs/`, exported output, the agent session, and the activity log
by default so uploaded research material and local review history are not committed
accidentally.

## Content trust

Imported papers, web pages, metadata, notes, and datasets are untrusted evidence. Agent
adapters explicitly reject instructions found inside those materials. Risetra does not
execute imported content.

Uploaded guidelines and source files remain untrusted intake material. Uploading a file
never verifies its claims or registers it as citable evidence.

## Write integrity

Each artifact response includes a content version. Saving with a stale version returns
a conflict instead of overwriting another edit. Content changes reset the review state
to `DRAFT`. Review changes and saves append an event to `records/activity.ndjson`.

Codex starts with the proposal directory as its working root and the `workspace-write`
sandbox. Risetra never uses a full-access or sandbox-bypass flag. The runtime passes
prompts through stdin without a shell, validates the final response against a strict JSON
schema, bounds stored messages, and provides explicit stop and session-reset controls.

Codex authentication remains owned by the installed Codex CLI. Risetra checks login
status but does not read, copy, or store the user's token.

## Data handling

Risetra has no account, telemetry, billing, remote storage, or central Risetra model API.
Starting guidance uses the student's authenticated Codex service. Relevant prompt and
workspace context may therefore be processed according to that Codex account and its
data controls. Students must not upload identifiable or restricted participant material
unless their institution permits that processing. They remain responsible for consent,
retention, ethics, and data minimization.

Literature discovery sends only the entered search terms and optional starting year to
the public Crossref REST API. Search results enter the workspace as unverified metadata;
Risetra does not treat Crossref metadata as proof that a publication supports a claim.

Report vulnerabilities privately through the repository security advisory feature.
