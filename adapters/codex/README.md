# Codex adapter

Copy `skills/risetra/` into the Codex skills directory used by the student, or ask Codex
to follow the repository skill in place while working inside a Risetra workspace.

Start with:

```text
Use the Risetra skill. Read the workspace state, explain the current research decision,
and identify which evidence is missing before proposing edits.
```

The canonical research rules remain in `modules/`. The adapter must not duplicate or
silently override them.
