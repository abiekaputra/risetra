# Authoring research modules

Every module is a small Markdown file with front matter:

```yaml
id: method-example
version: 0.1.0
status: DRAFT
applies_to: example
dependencies: [chapter-3-methodology]
```

## Required content

A module states its purpose, applicability, required reasoning, prohibited shortcuts,
output expectations, and a check the student can explain. Examples and counterexamples
belong beside the decision they clarify.

## Review states

- `DRAFT`: editable and excluded from a release bundle.
- `REVIEWED`: checked for scope, wording, and consistency but awaiting owner approval.
- `APPROVED`: eligible for a release bundle at the recorded version.

Changing approved guidance requires a version change and a new review. The repository
does not infer approval from passing automated checks.

Run `risetra modules` after editing metadata or dependencies.
