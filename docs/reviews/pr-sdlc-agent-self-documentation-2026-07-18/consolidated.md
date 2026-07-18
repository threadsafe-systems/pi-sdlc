# Consolidated PR panel — agent self-documentation

- Feature: `sdlc-agent-self-documentation` (track: **irreversible**)
- Branch: `feat/sdlc-agent-self-documentation` @ `674d96c`
- Date: 2026-07-18
- Orchestrating model: `anthropic/claude-opus-4-8` (author; excluded from the panel)
- Panel (floor 3, `pr_review`): `anthropic/claude-fable-5:high`,
  `openai-codex/gpt-5.6-sol:high`, `deepseek/deepseek-v4-pro:high`.
  `google/gemini-3.1-pro-preview:high` was the 4th `prefer` entry but is
  credit-depleted (HTTP 429); per the reviewer-dispatch-recovery contract the
  panel advanced to `deepseek/deepseek-v4-pro:high` to hold the floor of 3.

This is the durable internal sense-check artifact; it is not posted to the PR.

## Rounds

- **Round 1** (fable, sol; gemini 429): 2 HIGH + several MEDIUM. Fixed in wave 1
  (CLI guards → `fileURLToPath`; entrypoints stop on not-ready; phase-plan/spec
  name the correct reviewer prompt; config-doc CRLF/BOM + unreadable-companion +
  reversible-track summary + untruncated keys; setup hard-stop + readiness
  wording; FS11 discovery required; ASD5 grounded).
- **main integration** (merge): telemetry #104 + completion-gate #103 absorbed;
  telemetry section → `system-reference.md` §12, completion gate →
  `phase-pr-review.md`, worker dispatch → `phase-implement.md` §10, stall →
  `system-reference.md` §13, panel recovery → `phase-pr-review.md`; ADR
  renumbered **0028 → 0029** (main owns 0028 = telemetry).
- **Round 2** (fable, deepseek; sol harness error): all round-1 fixes confirmed
  RESOLVED. New: 1 MEDIUM (FS13 telemetry lost its load trigger) + 1 HIGH
  (ledger silent on merge-relocated sections). Fixed in wave 2 (kernel telemetry
  load trigger + `run.started` at startup; ledger M01–M03).
- **Round 3** (fable, deepseek, sol): fable + deepseek clean. sol raised 1 HIGH
  (config-doc followed symlinks) + 4 MEDIUM (panel-floor reporting, FS11 surface
  coverage, ledger completion-gate row, `parseSentinelSafe` read-safety). Fixed
  in wave 3 (symlink guard; `panelFloors`; FS11 rows for CONFIG.md + delegated +
  runtime-tool + hooks/tracker; ledger M04; read-safety).
- **Round 4** (sol, fable, deepseek): fable + deepseek clean. sol: dangling
  symlink bypassed the guard (HIGH) + panelFloors still incomplete (MEDIUM).
  Fixed in wave 4 (isSymlink guard before `existsSync`; `panelFloors` replicates
  `resolve-panel` `floorFor` per-track incl `task_validate`→1).
- **Round 5** (convergence): **fable + deepseek report no surviving high/medium.**
  sol raised one further HIGH — see the adjudication below.

## Surviving finding — adjudicated

**Ancestor-directory symlink is still followed by `config-doc write`**
(`skills/sdlc/scripts/config-doc.mjs`). sol (round 5): if a consumer's whole
`.pi/sdlc` directory is a symlink to an external directory that already contains
a valid `sdlc.config.json`, `writeCompanion` follows it and writes `CONFIG.md`
into the link target. The final-component `CONFIG.md`-symlink attack (the planted
link that clobbers an arbitrary external file) **is fixed** (wave 3/4); this is
the residual ancestor-directory case.

**Adjudication: dismissed as residual risk (proposed; awaiting human
ratification).** Reasons:

1. **Reviewer split, not consensus.** 2 of 3 round-5 reviewers report no
   surviving high/medium; `deepseek/deepseek-v4-pro` explicitly classified the
   ancestor-symlink case as **low / out of scope**: "a symlinked parent directory
   is still followed … Consistent with the repo's ratified local-layout trust
   boundary (local repo layout/git config outside sdlc tooling's threat model)."
2. **Within the ratified trust boundary.** For any write to occur, `loadConfig`
   must first succeed against a **valid `sdlc.config.json` at the same symlinked
   location** — i.e. the consumer has deliberately relocated their own `.pi/sdlc`.
   `CONFIG.md` is then written **beside the config it just read**, in the
   consumer's own chosen location, not at an arbitrary attacker-controlled path.
   Adoption and readiness (`sdlc-status`) already follow that same symlink to read
   the authoritative config. This is the same class of residual risk as the
   PR #17 finding-11 dismissal (git clean-filter smuggling — local repo layout
   outside the trust boundary), which the owner ratified.
3. **A containment fix has real false-positive risk.** Rejecting symlinked
   ancestors via `realpathSync` containment would break legitimate symlinked
   layouts — notably macOS `/tmp` → `/private/tmp` (which this repo's own tests
   use via `mkdtempSync`) and some git-worktree/CI checkouts — turning a
   trust-boundary edge case into broken behaviour for ordinary users.

The final-component symlink vulnerability (the exploitable one) is fixed and
regression-tested (`test/config-doc.test.js` symlink + dangling-symlink cases).

## Everything else — RESOLVED

All round-1..4 findings confirmed resolved by the round-5 panel. Full
`node --test` corpus 393 pass; `biome check` clean; FS11 reference check green;
`sdlc-status` ready; committed `.pi/sdlc/CONFIG.md` `current`; `SKILL.md` 208
lines / 12019 bytes (under the 220/16384 ceiling); frozen surfaces byte-identical
to `main` (ASD19). Additive **feature** release (no breaking installed-interface
change; no `BREAKING CHANGE:` footer).
