# Consolidated plan panel — sdlc-adoption-bundle, 2026-07-13

- Artifact: `docs/plans/2026-07-13-sdlc-adoption-bundle.md` (working tree @ 65d2a55)
- Panel: openai-codex/gpt-5.6-sol:high, zai/glm-5.2:high,
  deepseek/deepseek-v4-pro:high (resolved by `resolve-panel.sh plan_review
  --author anthropic`; author vendor anthropic excluded)
- Orchestrating model: anthropic/claude (session author; consolidation and
  adjudication drafted by the author, human-adjudicated at the plan gate)
- Round: 1

## Deduped findings and adjudication

### F1 — `track: none` third declaration value (HIGH; 3/3 models)

sol (high): contradicts the locked two-track iron law; demands removal or
upstream approval. glm (medium): none-honesty is mechanically unguardable and
unnamed in Risks; falsifiability claim overstated. deepseek (medium):
auto-generated PRs (release/dependency bots) cannot author a reason and will
fail CI.

**Adjudication: partially incorporated; removal DISMISSED — owner decision.**
`track: none` was explicitly designed and approved by the human owner at the
brainstorm gate (2026-07-13): forcing exempt PRs (releases, dependency bumps,
trivia) through the reversible lifecycle was considered and rejected; without
an exemption value the checker either blocks automated PRs or gets disabled
and rots. `none` is an **exemption declaration, not a third lifecycle track**
— the iron law's two tracks are unchanged; the plan is amended to say so
explicitly. Incorporated: (a) falsifiability claim narrowed to declared-track
artifact conformance on the reversible/irreversible axis; (b) new Risks entry:
`none`-honesty is guarded by the PR panel (ADR 0011 prose law), not the
checker; (c) an explicit auto-generated-PR exemption rule (spec pins the
identification: author/label/branch pattern). The dismissal of removal is
presented to the human owner for ratification at the plan gate.

### F2 — Reversible PR review-constraint source and track-specific links missing (HIGH; sol + deepseek)

The stream's A3 assigns this child "the source of PR review constraints when
a Specification is absent" and "which links and declarations the PR must
carry"; the plan covered neither. **Incorporated:** new outcome — the PR
template links the governing docs per track (irreversible: plan+spec+build;
reversible: plan+build, never a spec); reversible-track PR review grounds on
the plan and build-plan docs; `adversary-review.prompt.md` and SKILL.md's PR
section updated to say so; DoD items added.

### F3 — Consumer CI workflow has no way to obtain the checker (HIGH; sol + deepseek)

A clean CI checkout has no git-installed pi package; sub-change 4 owns
invocation docs, so the offered workflow was a false promise.
**Incorporated:** the offered workflow acquires the checker via a
version-pinned secondary checkout of the pi-sdlc repository into a known
directory and invokes the direct Node entry point — self-contained path
resolution, no dependency on sub-change 4; upgrade = bump the pinned ref. DoD
gains a workflow-content fixture. Dogfood repo invokes its own in-repo
checker.

### F4 — Checker cannot detect semantic track misclassification (MEDIUM; sol)

**Incorporated:** outcome narrowed to declared-track artifact conformance;
semantic classification (is this diff truly reversible?) is explicitly
assigned to PR review judgement.

### F5 — "Runs the consumer's tests/lints" has no portable contract (MEDIUM; sol + glm)

**Incorporated:** the offered workflow ships the deterministic
lifecycle-check step plus a documented placeholder where the consumer adds
their own test/lint steps; no toolchain is assumed.

### F6 — Re-run upgrade conflicts with the existing `--force` config guard (MEDIUM; sol)

**Incorporated:** bundle-mode re-run retains an existing config and continues
provisioning the remaining assets; replacing the config itself still requires
`--force`; both paths get fixtures.

### F7 — Setup report surface lacks envelope/exit/partial-write semantics (MEDIUM; sol)

**Incorporated:** the spec must pin setup's report envelope, aggregate exit
mapping, and the preflight rule (resolve all sources before first write; a
refused asset does not abort remaining independent assets, and the report
says so); the frozen-surface ADR extends to setup's bundle-mode report.

### F8 — PR-body is untrusted input; extraction mechanism unpinned (MEDIUM; sol + glm-low)

**Incorporated:** constraint added — CI mode reads the declaration from a
non-interpolated channel (`$GITHUB_EVENT_PATH` event payload, never shell
interpolation of the body); injection/metacharacter fixtures required; note
that an API-based path would need `pull-requests: read` permissions, so the
event-payload path is the default.

### F9 — R3 asset-verification has no DoD and an unstated sub-3 boundary (MEDIUM; glm)

**Incorporated:** DoD fixture added (setup reports resolution of the package
assets it references); boundary stated — setup verifies only the assets the
bundle references; the full normative-reference inventory remains sub-3.

### F10 — Documentation DoD clause not falsifiable (MEDIUM; glm)

**Incorporated:** replaced with enumerated doc-presence assertions (three
track values, slug rule, reason rule, local+CI invocation, setup semantics)
backed by mutation-style doc tests.

### F11 — CI-offer negative branch untested (MEDIUM; glm)

**Incorporated:** DoD fixture — a repo with an existing CI marker gets no new
workflow file (creation suppression, not just no-edit) and receives the
instruction snippet.

### F12 — Structural acceptance for the PR template under-defined (MEDIUM; deepseek)

**Incorporated:** concrete sketch added — acceptance means the file contains
a contiguous, parseable declaration block (a line matching
`track: (irreversible|reversible|none)` with its conditional `reason:`/
`slug:` companions) regardless of surrounding content; the spec refines
within that boundary.

### F13 — SKILL.md transitional coherence gap (MEDIUM; deepseek)

**Incorporated:** R5 expanded — the PR-phase text ("track declared, plan and
spec linked, checklist complete") is updated to match the shipped template
and track-specific links, not just the CI-claim sentence.

### F14 — Prompt-copy staleness (LOW; glm)

**Incorporated:** Risks entry + documented refresh action (delete and
re-copy); noted that sub-3 will report copies as consumer-owned overrides.

### F15 — Exit-convention naming ambiguous (LOW; deepseek)

**Incorporated:** pinned to `validate-task`'s 0 PASS / 1 FAIL / 2 ERROR
convention (ADR 0014 style).

## Cross-model CLEARs (signal, not findings)

All reviewers: track classification **irreversible** is correct (F). glm +
deepseek: no reopening of FS8/ADR 0016, ADR 0015, ADR 0011, ADR 0005; FS1/FS2
unchanged (D).

## Round 2 (delta review of rev 2, owner-requested)

Dispatched to the same three-model panel. **openai-codex/gpt-5.6-sol and
zai/glm-5.2 failed to launch: their credentials disappeared from the local
auth store mid-session (`~/.pi/agent/auth.json` rewritten 13:48, anthropic
OAuth only; `resolve-panel` confirms both dropped for "no credentials",
panel floor 2 vendors unreachable).** deepseek/deepseek-v4-pro:high
completed:

- All 14 round-1 incorporations (F2–F15) verified present and coherent in
  rev 2, item by item.
- F1 adjudication assessed internally consistent as recorded (exemption
  declaration, not a third track; PR-panel prose-law guard; auto-PR rule).
- Six CLEARs (falsifiable DoD, verification paths, scope boundaries, no
  locked decision reopened, risk coverage, irreversible classification).
- Four NEW low findings, all incorporated into rev 3:
  - L1 exemption-precedence ambiguity → single rule: a present valid
    declaration always dominates; exemption applies only with no valid
    declaration; DoD fixture added.
  - L2 present-tense claim about `adversary-review.prompt.md` → restated as
    a future edit of a currently track-unaware prompt.
  - L3 no structural sketch for the offered workflow → one-line boundary
    added (pinned checkout step + node checker invocation).
  - L4 `--force` vs non-config assets unstated → constraint added:
    refuse-and-instruct regardless of `--force`; asset-level force deferred
    (manual path: delete-then-re-run).

## Stop-condition status

Round 1: 3 highs, 10 mediums, 2 lows — all incorporated into rev 2 except
F1's removal demand, dismissed with recorded reason pending human
ratification at the plan gate. Round 2 (degraded to one vendor by the
credential outage): zero high/medium; 4 lows incorporated into rev 3.
Surviving high/medium findings after adjudication: 0. The round-2 vendor
degradation is disclosed to the human owner at the gate; re-running the two
failed reviewers requires restored openai-codex/zai logins.
