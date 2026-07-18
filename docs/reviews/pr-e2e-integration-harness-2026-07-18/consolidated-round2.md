# PR panel — e2e integration harness — consolidated (round 2)

- Date: 2026-07-18
- Branch/commit under review: `feat/e2e-integration-harness` @ b0727bb
- Track: reversible (plan + build plan only; no Specification demanded)
- Panel: anthropic/claude-fable-5:high, openai-codex/gpt-5.6-sol:high,
  google/gemini-3.1-pro-preview:high
- Orchestrating/adjudicating model: anthropic/claude-opus-4-8

All three reviewers independently verified every round-1 finding (H1–H3, M1–M6,
L1–L4) as **RESOLVED**, including empirical confirmation that the discovery gate
closes the H1 vacuity (a scenario cannot pass with discovery broken). New
findings below.

## HIGH

- **RH1 — stray `e2e.diff` (372 KB) committed and would ship in the npm package**
  (fable). A reviewer subagent's `git diff` artifact was swept into b0727bb by
  `git add -A`; no `files`/`.npmignore` so `npm pack` includes it.
  **INCORPORATED.** `git rm e2e.diff`; added `*.diff` to `.gitignore`.
- **RH2 — negative control still accepts a failed pi run** (sol). `expectLocked`
  bypasses the exit/timeout checks and `runNegativeMode` accepts any
  `PUPPET_LOCKED` stdout even if pi exited nonzero. **INCORPORATED.**
  `runNegativeMode` now also requires `exitCode === 0 && !timedOut`.
- **RH3 — scenario G passes even when the before-hook command fails** (sol).
  G asserted the canned `result: ok` text but never checked the hook's tool
  result succeeded (`false` as the hook still passed). **INCORPORATED.** G now
  asserts the hook's real bash result (`hook-fired` present, no nonzero-exit
  marker) — tying the announced `result: ok` to actual hook success.

## MEDIUM

- **RM1 — teardown scan misses same-size/same-mtime content replacement** (sol).
  **INCORPORATED.** `snapshotTree` now records a content **sha256** per file, not
  size:mtime.
- **RM2 — determinism gate does not run/compare the negative controls twice**
  (sol). **INCORPORATED.** `fullRun` now includes both negative-control modes and
  their lock statuses in the aggregated manifest, so `--determinism` compares the
  full suite (incl. NC) across both runs.
- **RM3 — port readiness file is not an atomic handshake** (fable, sol; low-prob
  flake). **INCORPORATED.** The server writes the port to a temp file and
  `rename`s it into place; the harness polls for a non-empty, parseable port and
  breaks early if the child exits.

## LOW (addressed)

- **RL1 — `statusResult` doesn't exclude the SKILL.md loader block** (fable).
  INCORPORATED: same `DEFAULT_SENTINEL` filter as `toolResults`.
- **RL2 — L1 discovery probe accepts any `SKILL.md` path** (fable; the round-1
  doc claimed a tightening never implemented). INCORPORATED: L1 now asserts every
  discovered `skills[].filePath` starts with `sandbox.staged`.
- **RL3 — `PINNED_PI_VERSION` never asserted despite the comment** (fable).
  INCORPORATED: `assertPinnedPi()` runs once and checks `pi --version`.
- **RL4 — no SIGKILL escalation after timeout SIGTERM** (fable). INCORPORATED.
- **RL5 — NC/self-test sandboxes not teardown-scanned** (fable). INCORPORATED:
  `fullRun`'s NC modes are teardown-scanned (tolerating the expected locks).
- **RL6 — duplicated suite orchestration** (fable). INCORPORATED: a shared
  `withInstalledSandbox` helper; run.mjs and scenarios/index.mjs reuse it.
- **RL7 — `trigger` mechanism unused by every scenario** (fable). INCORPORATED: a
  scenario step now declares a `trigger`, exercising the miss-detection path.
- **RL8 — `extractMarkers(stdout)` misleading param name** (gemini). INCORPORATED:
  renamed to `transcript` with a corrected docstring.
- **RL9 — puppet crash hides behind the full readiness timeout** (gemini).
  INCORPORATED via the RM3 child-exit early break.

## Accepted-by-design (not defects; reviewers concur)

- L2's puppet scripts each turn, so a *semantic* SKILL regression (e.g. inverted
  announce rules) cannot fail the suite — L2 proves install/discovery/load/config
  plumbing and config-driven script behaviour, not model compliance (L3's remit).
  Scenario E's "threshold ⇒ publish" branch is scripted; only the committed dial
  and the stubbed attempt are real. This is the ratified claim ladder.

## Adjudication summary

All new high and medium findings incorporated; no high/medium dismissed.
Re-review in round 3.
