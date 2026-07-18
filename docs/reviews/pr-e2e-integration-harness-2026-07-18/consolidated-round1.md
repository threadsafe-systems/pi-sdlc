# PR panel — e2e integration harness — consolidated (round 1)

- Date: 2026-07-18
- Branch/commit under review: `feat/e2e-integration-harness` @ f1155b2
- Track: reversible (plan + build plan only; no Specification demanded)
- Panel (resolve-panel pr_review, author excluded): anthropic/claude-fable-5:high,
  openai-codex/gpt-5.6-sol:high, google/gemini-3.1-pro-preview:high
- Orchestrating/adjudicating model: anthropic/claude-opus-4-8

Reviewer output is ~80% right and overreaches; each high/medium below is either
incorporated or dismissed with a one-line reason.

## HIGH

- **H1 — L2 loader reads a hardcoded staged path, so L2 does not prove
  discovery/skill-surfacing** (fable, sol, gemini; cross-model). The loader read
  targeted `installedResource(...SKILL.md)` regardless of whether pi surfaced the
  skill in the system prompt; the skill-removed twin only tested file deletion.
  **INCORPORATED.** Added a *discovery gate*: the puppet requires the staged
  skill `<location>` (an install-root path pi emits in `<available_skills>`) to
  appear in the request before the loader fires. If pi does not surface the skill
  (not discovered, or checkout-relative path), the loader never fires → locked.
  Also tightened L1 discovery to assert the pi-listed skill path
  `startsWith(sandbox.staged)`.
- **H2 — negative-control blanket `catch { ok: true }` makes the anti-vacuity
  checker itself vacuous** (fable, sol). Any infra error (port collision, puppet
  not ready) was scored as a pass, including in mutated-sentinel mode.
  **INCORPORATED.** Single strict `runNegativeMode` (exported, deduped): a mode
  passes only when `record.locked` is true; any thrown error is a FAIL.
- **H3 — scenarios E and G assert their own scripting, not config-driven
  behaviour** (gemini; fable/sol on G). **INCORPORATED.** E now asserts the
  committed `shape.publishToTracker` dial; G asserts the committed hook config and
  the real `implement-output.txt` write effect (a pi-driven effect), and derives
  the marker text from the configured hook.

## MEDIUM

- **M1 — puppet port race / readiness flake** (fable, sol; 1/2 observed flake).
  **INCORPORATED.** Server binds port 0 and reports the bound port via the ready
  file; added an `error` handler; stderr surfaced on failure.
- **M2 — teardown scan misses deletions** (fable, sol). **INCORPORATED.**
  `diffSnapshots` now reports removed paths too; a deletion case added to the
  guard self-test.
- **M3 — pi exit code / timeout never asserted** (sol, fable). **INCORPORATED.**
  `runScenario` fails a positive run on nonzero exit or timeout.
- **M4 — positive runs don't reject trigger miss / locked / incomplete step
  consumption** (sol). **INCORPORATED.** `runScenario` fails a positive run on any
  `miss`/`locked` emission and when not every declared step was consumed.
- **M5 — `matchedSteps` always empty; determinism ignores assistant text**
  (fable, sol, gemini). **INCORPORATED.** `record.matchedSteps` is populated from
  the ordered scenario emission contents and flows into the normalized manifest.
- **M6 — negative-control runner duplicated across three files** (fable).
  **INCORPORATED.** One exported `runNegativeMode`; `run.mjs` and
  `scenarios/index.mjs` call it.

## LOW (recorded; addressed opportunistically)

- **L1 — `--scenario` no-match reports success** (fable). INCORPORATED: zero
  selected scenarios now fails.
- **L2 — `installGhStub` permanently downgrades the deny-stub** (fable).
  INCORPORATED: the deny-stub is restored per scenario unless `ghStub` is set.
- **L3 — extensionless ESM gh shim needs Node ≥22.7** (fable). INCORPORATED:
  shim rewritten as CommonJS (`require`), portable across Node versions.
- **L4 — `skipLoader` dead code** (gemini). INCORPORATED: removed; the discovery
  gate is the skill-absent mechanism.

## Adjudication summary

All surviving high and medium findings incorporated in round 1; no high/medium
dismissed. Re-review in round 2.
