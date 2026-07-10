# Build plan: repo opt-in + local workflow hooks

- Date: 2026-07-10
- Derives from: `docs/specs/2026-07-10-sdlc-opt-in-and-hooks.md` (v2, approved)
- Track: irreversible. Tracker publish: N/A (this repo's config has no
  `tracker` block; the committed doc is canonical).
- Implementation home: feature branch `feat/sdlc-opt-in-hooks`, in a worktree
  (this repo's preference; session enters via create-then-enter).

## T1 — FS1 `hooks` + `readConfig` strict mode (schema, lib, tests)

Add `hooks` to `skills/sdlc/schema/sdlc.config.schema.json` (per spec §1.1
fragment, incl. single-line `run`/`do` patterns) and to
`sdlc.config.example.json`; extend `validateConfig` in
`skills/sdlc/scripts/lib.mjs` (allowed set + §1.1 hand-rolled rules); add
`readConfig(root, { requireManifest: true })`.

- Scenarios: OH1, OH2, OH11
- Checks: `npm test` (new cases: OH1 mutation table incl. `hooks:{}` and
  multi-line strings, both schema-level via ajv in tests and validateConfig
  exit codes; OH2 both paths); `node --check` on touched mjs.

## T2 — `sdlc-status` CLI

New `skills/sdlc/scripts/sdlc-status.sh` + `.mjs` per spec §3 (exact stdout
keys/order, exits 0/1/2, FS3 root resolution via lib.mjs).

- Scenarios: OH3, OH10
- Checks: `npm test` (temp-repo cases: opted-in with hooks counts,
  manifest-less exit 1, corrupt config exit 2); manual: run at this repo's
  root → exit 0.

## T3 — `setup-sdlc` scaffolder + `/setup-sdlc` template

New `skills/sdlc/scripts/setup-sdlc.sh` + `.mjs` per spec §5.1 (flag table,
hook-flag grammar with the 4th-colon rule, argv-order stability, tracker
all-or-none, self-validation, `--force`, trust warning on stderr, exit 0/1/2,
TTY rule). New `templates/setup-sdlc.md`; `package.json` gains
`"pi": { …, "prompts": ["./templates"] }`.

- Scenarios: OH4, OH5, OH6
- Checks: `npm test` (mkdtemp repos; parse-table cases from OH5 verbatim;
  stderr warning capture; overwrite refusal byte-identity); grep package.json
  for `"prompts"`.

## T4 — SKILL.md + README + ADRs

SKILL.md per spec §6 items 1–7 (opt-in gate section + `### Advisory mode`,
`## Hooks (local workflow)` with §1.4 block verbatim, Implement row reword,
create-then-enter warning, workflow.md rules, two red flags, announce routes
through sdlc-status). README per OH12. Two ADRs: `0010-opt-in-semantics.md`,
`0011-hooks-surface.md`.

- Scenarios: OH7, OH8, OH9, OH12
- Checks: the OH7/OH8/OH12 greps as test assertions (`npm test`); ADR files
  present with context/decision/consequences.

## T5 — Integration + dogfood

Full suite green; `sdlc-status` exits 0 at this repo's root (dogfood config
already committed); confirm no `pi-worktree` reference anywhere in shipped
surfaces; per-task validator run over T1–T5 checks.

- Scenarios: OH10, OH11 (+ re-run all OH greps)
- Checks: `npm test`; `rg -i "pi-worktree" skills/ templates/ README.md`
  returns nothing.

Task order: T1 → T2/T3 (parallel-safe) → T4 → T5. Each task ends with the
per-task validator (checklist executor; preference deepseek/deepseek-v4-flash,
fallback anthropic/claude-haiku-4-5).
