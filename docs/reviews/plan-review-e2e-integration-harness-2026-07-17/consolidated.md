# Consolidated plan review — e2e integration harness (2026-07-17)

- Artifact: `docs/plans/2026-07-17-e2e-integration-harness.md` (rev 1)
- Panel (owner-requested advisory on a reversible-track plan):
  `openai-codex/gpt-5.6-sol:high` (→ `gpt-5.6-sol.md`),
  `deepseek/deepseek-v4-pro:high` (→ `deepseek-v4-pro.md`).
- Orchestrating model: anthropic/claude; final adjudicator: project owner.
- Outcome: **10 consolidated findings — 9 incorporated into rev 2, 1
  partially dismissed with reason (stale evidence) while surfacing a real
  spec-drift in PR #92, fixed there.**

## Consolidated findings and adjudication

### E1 (high; sol#1) — env-based sandbox cannot enforce the promised isolation

Redirected HOME + cleared vars don't block network egress or out-of-scratch
writes; pi phones home unless offline. **Incorporated:** DoD narrowed to
enumerated observed guards (allowlisted child env, `PI_OFFLINE=1`, no `gh`,
credential denial list, teardown scan); the container variant is named as the
only *confinement* boundary and stays optional.

### E2 (high; sol#2) — local-path `pi install` doesn't copy, so "installed-path

fidelity" as claimed is impossible. **Incorporated:** the harness stages a
package copy into a scratch install root and installs *that*; claim renamed
"install-root fidelity" (still guards the checkout-relative-path bug class).

### E3 (high; sol#3) — L2 vacuous pass: a scripted puppet can emit every

expected marker without the skill ever loading. **Incorporated:** the puppet
protocol must observe the installed SKILL content in the request stream
before unlocking scenario steps, and every scenario gains a harness-level
negative control (skill removed/marker mutated ⇒ scenario must fail).

### E4 (high; sol#4) — scenario D "assumes a refusal that doesn't exist" —

**partially dismissed (stale evidence), real drift found.** The reviewer read
main + the pre-#92 spec; PR #92's panel round 1 (M1) added the `self` refusal
to `resolve-panel` with test coverage, so scenario D matches shipped
behaviour. However the audit surfaced that #92's spec §4.3/ICA14 prose still
names only `off` — a genuine spec/impl drift, fixed with a docs-only commit
on the open #92 branch. Scenario D stands.

### E5 (high; sol#5) — publishToTracker can't be covered at L1 (no actor)

**Incorporated:** scenario E moves to L2 with a logging `gh` stub and
positive/negative twins (threshold reached ⇒ attempt logged; `never` ⇒ none).

### E6 (high; deepseek#2) — puppet extension discovery path unspecified

**Incorporated:** ratified mechanism: `pi -e <harness puppet dir>` per
invocation — explicit, ephemeral, cannot leak into the production package
manifest.

### E7 (high; deepseek#3) — negative assertions don't fit a forward-only

trigger format. **Incorporated:** the scenario format gains a post-exit
assertion phase (must-match / must-not-match over the session JSONL and
effects), distinct from the in-loop triggers.

### E8 (high/med; deepseek#1 + sol#8) — determinism DoD unfalsifiable or

flaky as written. **Incorporated:** each run starts from a fresh sandbox and
emits a normalized run manifest (matched steps, ordered tool calls, markers,
file hashes; volatile fields stripped); CI byte-compares manifests across two
runs, not just verdicts.

### E9 (med; sol#7 + deepseek#4) — provider/install hinge imprecision

new providers need `models` + `apiKey`; `-e` and `-l` are mutually exclusive
modes. **Incorporated:** puppet binds a full zero-cost model declaration +
dummy key + exact `--provider puppet --model` invocation; install wording
corrected to `pi install <staged-copy> -l`.

### E10 (med; sol#9 + deepseek#6 + sol#6 + deepseek#5/#7) — under-specified

gates: CI budget a guess and not in DoD; B/G markers not pinned; credential
denial list unnamed; B needs multi-turn scripting note. **Incorporated:** T1
spike measures a baseline and the DoD gets a measured threshold + job
timeout; B redefined by ordered effects (phase-entry blocked vs permitted),
G pinned to the exact `[sdlc hook]` use/result lines and their ordering;
explicit credential denial list + glob catch-all + escape hatch; B noted as
multi-turn (trigger → bash tool call → trigger on tool result).

## Reviewer CLEARs (recorded)

Both confirm the reversible-track classification (no frozen surface) and the
claim-ladder scoping; deepseek additionally cleared DoD falsifiability for
items 1/4/5/6/7 and the sequencing after #92.
