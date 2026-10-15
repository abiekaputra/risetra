# Codex adapter

Risetra v1 starts Codex from the local dashboard through the stable `codex exec`
interface. The generated workspace includes `AGENTS.md` and a local copy of the research
modules, so students do not need to install or invoke the skill manually.

The standalone skill remains available for maintainers who deliberately work from the
Codex CLI:

```text
Use the Risetra skill. Read the workspace state, explain the current research decision,
and identify which evidence is missing before proposing edits.
```

The canonical research rules remain in `modules/`. The adapter must not duplicate or
silently override them.
