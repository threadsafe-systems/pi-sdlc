# PR panel — e2e integration harness — consolidated (round 3, final)

- Date: 2026-07-18
- Branch/commit reviewed: `feat/e2e-integration-harness` @ 30d4220
- Track: reversible (plan + build plan only; no Specification demanded)
- Panel: anthropic/claude-fable-5:high, openai-codex/gpt-5.6-sol:high,
  google/gemini-3.1-pro-preview:high
- Orchestrating/adjudicating model: anthropic/claude-opus-4-8

Round 3 verified every round-1 and round-2 fix as RESOLVED. gemini returned a
clean GO (no high/medium). fable and sol independently found the SAME real gap.

## Surviving findings (all incorporated; fixes landed post-30d4220)

- **RH3-followup — scenario G's nonzero-exit guard was a dead regex** (fable
  medium, sol high; same defect). `/(exit(ed)? (code )?[1-9]/i` never matches pi
  0.80.10's actual bash-failure text `Command exited with code N` (the `with`
  defeats it), so a hook that prints its marker then fails (`exit 3`) still
  passed G. **INCORPORATED + verified falsifiable**: guard is now
  `mustNotMatch: [/Command exited with code \d+/, /Command timed out/, /Command aborted/]`
  (matches pi's `dist/core/tools/bash.js`). Repro now fails G as required.
- **RH-new — NC did not verify WHICH gate locked** (sol high). `runNegativeMode`
  accepted any `PUPPET_LOCKED`, so a mutated-sentinel control could in principle
  be satisfied by a discovery-gate lock rather than the sentinel gate.
  **INCORPORATED**: the puppet records a lock `reason`; `runNegativeMode` now
  asserts the mode-specific gate fired (mutated-sentinel ⇒ "sentinel not
  observed"; skill-removed ⇒ "skill location not observed"/discovery), and the
  reason is carried into the determinism manifest.
- **RM-new — teardown sha256 excludes .git/node_modules/.ruff_cache** (sol
  medium). **INCORPORATED (honest scoping)**: the exclusion is deliberate
  (tool-managed / VCS-internal, huge, not a checkout-relative-path leak target);
  the SNAPSHOT_IGNORE comment and README now state the scan covers the checkout
  *source tree*, not git internals or installed deps. Reviewer explicitly offered
  "narrow the governing no-write claim explicitly" as an acceptable resolution.

## LOW (all incorporated)

- Stale `snapshotTree` docstring updated to sha256; the read `catch` now
  rethrows non-ENOENT (an unreadable planted file fails loudly). (fable/gemini)
- L1 discovery path assertion uses `sandbox.staged + sep` (no sibling-prefix
  admission). (fable)
- `assertPinnedPi` now compares the exact version token (rejects `0.80.100`).
  (fable)
- teardown `(removed)`-prefix stripped before the sandbox-path exclusion. (fable)
- `runL2Positive` isolates each scenario (one failure no longer aborts the rest
  or the leak scan); `runNegativeControl` has a `.catch`. (fable/gemini)
- `scenarios/index.mjs` teardown-scans all three sandboxes (parity with run.mjs).
  (fable)

## Verdict

After the above fixes: **no high or medium finding survives.** gemini's round-3
verdict was already a clean GO; fable's sole medium and sol's two highs are the
two defects fixed above (both re-verified — G repro fails, NC asserts the gate,
full `--determinism` byte-identical incl. NC reasons, 217 unit tests, biome
clean). The panel has converged. **GO to open the PR.**

## Accepted-by-design (unchanged from round 2, panel concurs)

L2 proves install/discovery/load/config plumbing and config-driven script
behaviour via the discovery + sentinel gates and real tool results/ordering — it
does not prove model *judgment* (an inverted SKILL announce rule cannot fail the
scripted puppet). That is L3's remit, explicitly out of scope for this stream.
