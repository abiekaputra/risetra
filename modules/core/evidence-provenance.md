---
id: core-evidence-provenance
version: 0.1.0
status: DRAFT
applies_to: all
dependencies: [core-academic-integrity]
---

# Evidence provenance

## Purpose

Create a visible chain from a proposal statement back to the source and search decision
that supports it.

## Workflow

1. Record the search question before choosing a database or query.
2. Record each query, filter, date, and result count in the search log.
3. Capture candidate sources without claiming relevance prematurely.
4. Verify bibliographic metadata against the publisher or trusted index.
5. Extract evidence with context, location, and an explicit relevance note.
6. Map the evidence identifier to a claim only after the student reads the source.

## Weak-result signals

- One source carries several unrelated claims.
- Sources are selected only because their titles match the topic.
- A claim is more specific than the evidence excerpt.
- Contradictory findings disappear from the synthesis.

## Output contract

Every material claim uses a registered `SRC-*` identifier. A validator must fail when a
referenced identifier is absent or when synthetic sources appear outside demo mode.
