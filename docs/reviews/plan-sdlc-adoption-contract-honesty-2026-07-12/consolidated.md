# Consolidated plan review — adoption and contract honesty stream

- Target: `docs/plans/2026-07-12-sdlc-adoption-contract-honesty.md`
- Panel: `zai/glm-5.2:high`, `anthropic/claude-opus-4-8:high`,
  `moonshotai/kimi-k2.6:high` (three vendors; OpenAI excluded as author)
- Orchestrating model: OpenAI

## High

### H1 — The child remained too broad for one Specification

Two reviewers rated the bundled readiness, setup, checking, invocation, path,
reference, and track-contract work high; the third considered it thematically
coherent but still identified surface-boundary overlap.

**Adjudication: incorporated.** The artifact is now a stream plan with four
ordered, independently gated sub-changes: readiness semantics; adoption bundle
and lifecycle checking; normative-reference honesty; and invocation/path
plumbing. It does not proceed directly to one Specification or Build.

### H2 — Hook-order tests contradicted ADR 0011

Two reviewers rated this high. The DoD claimed automated proof of live hook and
human-gate ordering although hooks remain agent-executed prose.

**Adjudication: incorporated.** This stream now tests only internal track-
contract coherence. Live hook execution stays transcript-only under ADR 0011;
programme child 3 alone may re-open that boundary. Transition presentation and
Brainstorm recap are explicitly owned by programme child 2.

### H3 — Readiness changed ADR 0010 without a decision

One reviewer rated this high and two medium. “Adopted but not ready” had no
pinned exit semantics and was misclassified against ADR 0005/FS5.

**Adjudication: incorporated.** The stream fixes the contract: 0 ready, 1 not
adopted (including untracked/ignored-only manifest), 2 invalid/error, 3 adopted
but not ready. It explicitly supersedes ADR 0010 and requires migration; ADR
0005 is not claimed to govern `sdlc-status`.

## Medium

### M1 — FS7 and prompt overrides were omitted

**Adjudication: incorporated.** FS7 is named. The normative inventory covers
generic package prompts; whole-file consumer overrides are reported as
consumer-owned and semantically unverified rather than falsely certified.

### M2 — O2 ownership overlapped the Brainstorm recap and child-2 transitions

**Adjudication: incorporated.** This stream owns only O2's track/PR contracts.
Child 2 exclusively owns the plain-Brainstorm recap and transition-sequence
authoring presentation.

### M3 — Documentation honesty was an unfalsifiable universal negative

**Adjudication: incorporated.** The outcome and DoD now operate over a pinned,
finite inventory of normative references and mandatory-facility mappings, with
independent mutation fixtures.

### M4 — Invocation depended on an unverified binary mechanism

**Adjudication: incorporated after checking Pi's complete `docs/packages.md`
and `docs/skills.md`.** Pi explicitly resolves relative skill assets/scripts
from the skill directory; it does not expose package scripts as binaries. The
stream now uses skill-relative in-harness instructions and a resolved package-
root/direct-Node headless and Windows fallback.

### M5 — Author-model files could bleed into child 4

**Adjudication: incorporated.** Model files in this stream mean existing FS2
`sdlc.models.json` only; child 4 owns the new author preference surface.

### M6 — Aggregate diagnostics used “where practical”

**Adjudication: incorporated.** The bounded requirement is now all blockers that
do not depend on fixing another blocker in one run.

### M7 — Local lifecycle checker surface was left to the Specification

**Adjudication: incorporated through decomposition.** It is now isolated in the
adoption-bundle/lifecycle-checking sub-change, whose own Plan must choose whether
the checker is a new surface or an explicit extension before its Specification.

## Low

- Path retention is now presented as this stream's proposed decision, ratified
  only by human approval rather than misattributed to the programme.
- POSIX-only wrappers now have a direct-Node cross-platform fallback outcome.

## Stop condition

No high or medium finding survives adjudication in the revised stream plan. The
next gate is human approval of its four-way decomposition and fixed readiness,
invocation, ownership, and compatibility decisions. No sub-change
Specification, Build, tracker mutation, or implementation begins before that
approval.
