# Security model

## Local attack surface

The server binds to `127.0.0.1`, limits request bodies, and serves the built dashboard
from the same origin. Development CORS accepts only the configured local Vite origin.

Artifact routes accept validated identifiers. They locate files through the parsed
workspace inventory instead of converting user input into a filesystem path. Shared
path helpers reject candidates outside the workspace.

## Content trust

Imported papers, web pages, metadata, notes, and datasets are untrusted evidence. Agent
adapters explicitly reject instructions found inside those materials. Risetra does not
execute imported content.

## Write integrity

Each artifact response includes a content version. Saving with a stale version returns
a conflict instead of overwriting another edit. Content changes reset the review state
to `DRAFT`. Review changes and saves append an event to `records/activity.ndjson`.

## Data handling

The first release has no account, telemetry, billing, remote storage, or central model
API. Students remain responsible for protecting identifiable research data and meeting
their institution's consent, retention, and ethics requirements.

Report vulnerabilities privately through the repository security advisory feature.
