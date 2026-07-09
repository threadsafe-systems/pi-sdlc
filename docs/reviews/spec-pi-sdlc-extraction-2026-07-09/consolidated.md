# Spec panel — pi-sdlc extraction (wave 1)

- Phase: spec_review (irreversible track)
- Spec reviewed: `docs/specs/2026-07-09-pi-sdlc-extraction.md` @ v1 (`ad26925`)
- Orchestrating model: `anthropic/claude` (this session)
- Panel (author anthropic excluded, PONG-smoked): openai-codex/gpt-5.5,
  deepseek/deepseek-v4-pro, zai-coding-cn/glm-5.2 — 3/3 completed (moonshot in the
  resolved set but only 3 dispatched to keep the panel to 3 vendors of signal).

All findings re-verified against the committed loom scripts before adjudication.
All incorporated into spec v2.

## HIGH

### The stamped `description` `assets/` path + template move breaks byte-identity (3/3) — INCORPORATED
`ensure-panel-agent.sh:93` writes `Stamped from assets/${TEMPLATE_BASE}.prompt.md`;
v1 §4 omitted `assets/` and the template moves to `prompts/` on extraction, so the
description can never be byte-identical. v2 §4 regenerates the `description` as a
fixed generic line and scopes S4 byte-identity to `name`+`tools`+**body** (the
behavioural surface); the description is disclosed as non-behavioural metadata.

### The §6 "complete" substitution inventory was incomplete + REVIEWER_TAG not frozen (2/3) — INCORPORATED
Missed `resolve-panel.sh:2`, `resolve-panel.mjs:3`, `ensure-panel-agent.sh:2,6,8,
12,29,83`, `tracker-ops.md:135` (RunDriver), `tracker-ops.md:232` (sdlc-artifacts).
v2 §6 reframes: the authoritative clearance is the S2 grep over the WHOLE tree
(scripts included); the site list is guidance, not a closed set; the missed sites
are added and the exact REVIEWER_TAG literal is frozen.

## MEDIUM (all incorporated)

- Models schema allowed missing phases → v2 FS2 requires exactly the four v1 phase
  keys.
- No-manifest mode had no model roster → v2: no built-in roster; `resolve-panel`
  requires `.pi/sdlc/sdlc.models.json` and errors clearly if absent; S7 narrowed.
- Stubbed-cred harness not isolated/under-specified (3/3) → v2 §9 pins isolated
  `HOME`, fixture `auth.json`, cleared ambient env, no `--pong`, a one-time golden.
- S9 cross-repo git ancestry is not falsifiable (2/3) → v2 S9 uses a committed
  loom artefact (`discovery-verified.md`) with same-repo ancestry vs the deletion.
- `--config` file-vs-dir ambiguity (3/3) → v2: `--config <dir>`/`--repo-root <dir>`
  are directories; config = `<dir>/.pi/sdlc/sdlc.config.json`; diagnostic fixed.
- Script-level validation vs NFR2 (no ajv) → v2 §5: hand-rolled structural
  validation, no runtime dep; S3 split into S3 (schema validates example) + S3b
  (script rejects mutated manifest, exit 2).
- Exit-code contract under-enumerated → v2 §5 lists exit 2 on bad args / unknown
  phase / unreadable/unparseable/invalid models or config.
- Prompt override resolution order unspecified → v2 §5: consumer
  `.pi/sdlc/prompts/` first, then skill `prompts/`.
- FS7 required sections not enumerated → v2 §7 lists the exact `##` headings per
  prompt.

## LOW (incorporated)

- `schemaVersion` new scope / "reject unknown major" under-defined → v2 §1 pins
  "accepts 1 only, rejects others non-zero, no-manifest treated as v1"; flagged as
  a spec-author compat-gate addition for Neil to bless.

## Stop condition

Wave 1 surfaced 2 high + 8 medium + 1 low, all valid, all incorporated into v2.
A confirming wave 2 follows; Neil is the final adjudicator on the spec.
