# Reviewer: deepseek/deepseek-v4-pro:high — plan_review, 2026-07-13

## Missing A3 contractual element: reversible-track PR review constraint source

- severity: high
- confidence: high
- location: Plan header "Owns stream outcome" / Stream plan A3
- defect: The stream plan's A3 explicitly requires defining "the source of PR
  review constraints when a Specification is absent" for each track. This
  plan claims to own "the track/PR-contract portion of A3" but nowhere
  addresses what grounds the PR panel's adversarial review of a
  reversible-track change that has no Specification.
- evidence: Stream plan A3: "the source of PR review constraints when a
  Specification is absent" is a required contract element. The
  adversary-review prompt at `skills/sdlc/prompts/adversary-review.prompt.md`
  has zero mentions of "reversible", "track", or alternative grounding
  sources. The bundle plan's R1-R6 and "Context for the Specification author"
  list no item covering this.
- impact: After this child ships, a reversible-track PR's adversarial review
  has no defined grounding document — recreating the exact problem A3 exists
  to fix.
- fix: Either add an outcome stating that for reversible-track PRs the review
  grounds on the plan + build-plan documents (and update the adversary-review
  prompt accordingly), or explicitly defer this element with a
  cross-reference so it doesn't fall through the cracks.

## Consumer CI workflow depends on unresolved invocation path (sub-change 4 ordering)

- severity: high
- confidence: high
- location: R4 / Risks section ("Sub-change 4 overlap")
- defect: The plan ships a GitHub Actions workflow that invokes the lifecycle
  checker. For consumers, the checker lives at the skill's git-install path,
  whose consumer-visible contract sub-change 4 (A5) must define. The plan
  acknowledges the overlap but only says "this child documents invocation
  minimally"; it does not state that the consumer CI workflow offer must
  wait for sub-change 4's path contract.
- evidence: Plan Risks "Sub-change 4 overlap"; stream plan A5/A6 owned by
  sub-change 4; `ci.yml` currently runs only repo-local commands.
- impact: A consumer adopting the shipped CI workflow before sub-change 4
  defines path resolution gets a workflow step that fails with a broken
  path — a false promise of consumer CI integration.
- fix: Either define the checker's consumer-invocation path in scope for this
  child (so the shipped workflow is correct), or gate the consumer CI
  workflow offer behind sub-change 4 completion and state the dependency
  explicitly.

## Auto-generated PRs cannot satisfy `track: none` reason requirement

- severity: medium
- confidence: high
- location: R1 / "track: none" definition
- defect: The plan requires a one-line reason for every `track: none`
  declaration and lists releases/dependency bumps as canonical none-track
  cases, but release and dependency-bump PRs are machine-generated — they
  cannot fill a PR template. Once the checker is in CI, every automated PR
  fails the declaration parse.
- evidence: Plan R1; `README.md` confirms semantic-release; `ci.yml` runs on
  `pull_request: branches: [main]`.
- impact: Automated release or dependency PRs fail CI, blocking the pipeline
  or forcing human editing of machine-generated PR bodies.
- fix: Add an explicit exemption rule: auto-generated PRs (identified by
  author, label, or branch pattern — spec pins it) are exempt from the
  checker, or `track: none` with a programmatically-generated reason is
  accepted.

## PR template structural-acceptance check dangerously under-defined

- severity: medium
- confidence: high
- location: R3 / "recognise / refuse / instruct"
- defect: The plan defers the structural-acceptance check to the
  Specification entirely, providing zero guidance on what structural
  satisfaction means for the PR template. The gap between too-loose and
  too-strict is the stream's named risk and the single most consequential
  design decision for consumer trust.
- evidence: Plan R3; Plan Risks "Equivalence too loose/too strict"; stream
  plan "Consumer-owned equivalents" risk.
- impact: The Specification author must invent the boundary from scratch,
  risking a design that either fails to enforce the contract or refuses
  legitimate consumer templates.
- fix: Add a concrete sketch of the structural check to the plan (e.g. the
  template body must contain a contiguous declaration block with a line
  matching `track: (irreversible|reversible|none)` plus conditional `reason:`
  / `slug:` lines; such a block passes structural acceptance regardless of
  surrounding content).

## SKILL.md transitional coherency gap after narrow R5 edit

- severity: medium
- confidence: high
- location: R5 / "Context for the Specification author"
- defect: After this child, SKILL.md line 329 still says "Open the PR with
  `.github/pull_request_template.md` filled in (track declared, plan and
  spec linked, checklist complete)" — yet the shipped template per R1 has
  only the declaration block. The skill will mix new truthful content with
  old false content until sub-change 3.
- evidence: `skills/sdlc/SKILL.md:329` and `:79`; plan R5 scoping to "a
  single coherence edit".
- impact: An agent reading SKILL.md between this child and sub-change 3 sees
  a mix of true and false claims, undermining the "truthful adoption" goal.
- fix: Expand R5's SKILL.md editing scope to also update the PR-phase text to
  reflect the actual shipped template content.

## Exit code convention naming is ambiguous

- severity: low
- confidence: high
- location: R2 ("distinct, stable exits")
- defect: "Matching the sibling CLI convention" is ambiguous: `sdlc-status`
  uses 0/1/2/3, `validate-task` 0 PASS / 1 FAIL / 2 ERROR, `resolve-panel`
  0 ok / 1 under-panel / 2 bad input.
- evidence: ADR 0005, ADR 0014, ADR 0016; plan R2.
- impact: Low — numbers match, but the spec author should know which surface
  to align with for output-envelope conventions.
- fix: Replace with "matching `validate-task`'s 0 PASS / 1 FAIL / 2 ERROR
  convention".

CLEAR: A — all DoD items are falsifiable through offline fixture tests.
CLEAR: B — all six outcomes have plausible verification paths.
CLEAR: D — the plan respects ADR 0015, ADR 0016, ADR 0005, ADR 0011; FS1 and
FS2 schemas explicitly unchanged.
CLEAR: F — track classification as irreversible is correct.
