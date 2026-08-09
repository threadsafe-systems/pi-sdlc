# Dispatch prompt — spec_review round 1 (stamped values)

Agent: `pi-sdlc-spec-review` (project, stamped from `prompts/adversary-spec.prompt.md`); per-task model overrides `google/gemini-3.1-pro-preview:xhigh` and `openai-codex/gpt-5.6-luna:xhigh`. Async workflow `call_b049b9f66aec4f108579b89f`.

Placeholder values supplied in the task:

- `<REPO_PATH>` = `/home/neil/code/threadsafe/pi-sdlc`
- `<COMMIT_SHA>` = `3f596a0`
- `<SPEC_PATH>` = `docs/specs/2026-08-08-spec-artifact-skeleton.md`
- `<PLAN_PATH>` = `docs/plans/2026-08-08-spec-artifact-skeleton.md`

Round 1 = whole-spec review. Task additionally named the existing source to read (phase-spec.md §4, adversary-spec.prompt.md, frozen-surfaces.test.js, iteration-disposition.test.js incl. every ADVERSARY_PROMPTS use, normative-references.json + discovery roots, check-references.mjs, templates/sdlc-spec.md, system-reference.md glossary) and five special-attention instances: the 17/16 frozen-count arithmetic and IDV19 shape; SAS4/M4 distinguishability; the unfreeze/reconcile/re-freeze machinery's executability by a stateless agent + orchestrator; SAS12/SAS13 inspection gating; the self-demonstration circularity check; plan DoD 1–9 + In/Out satisfaction.
