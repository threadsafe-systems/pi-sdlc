# Plan: adoption bundle and lifecycle checking

- Date: 2026-07-13
- Programme: `docs/plans/2026-07-12-sdlc-lifecycle-hardening.md`
- Parent stream: `docs/plans/2026-07-12-sdlc-adoption-contract-honesty.md`
- Owns stream outcome: the remaining (non-readiness) portion of A2, plus the
  track/PR-contract portion of A3
- Track: **irreversible**. This ships a new PR declaration contract consumers
  bind to, a new checker CLI surface with frozen exits, setup provisioning
  behaviour that writes consumer files, and CI integration. Each is a shape
  other repos, workflows, and reviewers commit to.
- Author vendor: anthropic
- Brainstorm gate: design approved by Neil Chambers on 2026-07-13.
- Plan panel: rounds 1–2 adjudicated, zero surviving high/medium —
  `docs/reviews/plan-sdlc-adoption-bundle-2026-07-13/consolidated.md`
  (this is revision 3: rev 2 incorporated F2–F15 and the accepted portions
  of F1; rev 3 incorporated the four round-2 lows; round 2 ran
  vendor-degraded per the consolidated record).
- Human gate: Plan approved by Neil Chambers on 2026-07-13, including
  ratification of the F1 dismissal (`track: none` retained as an exemption
  declaration, not a third lifecycle track).

## Objective

Make the adoption bundle real and the two-track lifecycle contract checkable:
after setup, a consumer repository actually has (or has verified equivalents
of) every asset the skill's PR contract names — a PR track declaration, a
local lifecycle checker usable by developers and CI, and optional GitHub
Actions integration — and the skill stops claiming CI enforcement that is not
configured. The dogfooding repository itself adopts the full bundle.

## Required outcomes

### R1 — PRs carry a minimal, parseable track declaration

Every PR in an adopted repository declares exactly one track in a minimal,
machine-parseable block provided by the shipped PR template:

- `track: irreversible` — the checker requires committed plan, spec, and
  build-plan artifacts for the declared feature slug;
- `track: reversible` — the checker requires committed plan and build-plan
  artifacts and never demands a Specification;
- `track: none` — the change is exempt from the lifecycle (releases,
  dependency bumps, trivia); a one-line reason is required and no artifact is
  demanded. The reason keeps exemption honest and reviewable.

`none` is an **exemption declaration, not a third lifecycle track**: the iron
law's two tracks are unchanged, and a `none` PR claims to be outside the
lifecycle, not on a lighter path through it. Whether that claim is honest is
guarded by the PR panel (prose law, ADR 0011), not by the checker — see
Risks.

**Auto-generated PRs** (release automation, dependency bots) cannot author a
template. The contract includes an explicit exemption rule — identification
by author, label, or branch pattern, pinned by the Specification. Precedence
is a single rule: a present, valid declaration always dominates; the
exemption applies only when an exempt-matching PR carries no valid
declaration, in which case it passes as `none`. Exemption identification is
part of the frozen contract, not checker discretion.

A feature slug is **required when track ≠ none** — the checker needs it to
locate artifacts. It conventionally matches the branch name but may be
declared independently. The template links the governing docs **per track**:
irreversible links plan, spec, and build plan; reversible links plan and
build plan and never asks for a spec.

**Reversible-track PR review grounding (A3):** when no Specification exists,
the PR panel's review constraints derive from the committed plan and
build-plan documents — the plan's definition of done and the build plan's
per-task checks and scenario ids are the grounding inputs. The
`adversary-review.prompt.md` inputs and SKILL.md's PR section — which today
have no track awareness at all — **will be edited** to say this explicitly
instead of assuming a spec universally.

The declaration lives in the PR body for this child. Migrating `track:` into
plan-doc front matter (doc as source of truth) is recorded as a candidate
evolution for programme child 2, not built here.

### R2 — A local lifecycle checker makes the track contract falsifiable

A new script pair (`.mjs` + `.sh` wrapper, existing FS5 house pattern)
verifies, read-only and offline:

- the declaration parses to exactly one valid track (+ reason when `none`,
  - slug when not `none`), or the PR matches the auto-generated exemption
  rule;
- for the declared track, the required artifact docs for the slug exist as
  **committed** content (plan/spec/build per R1), resolved through the
  configured FS1 `paths` — new code consumes configured paths from day one;
- distinct, stable exits matching `validate-task`'s convention (ADR 0014
  style): 0 PASS, 1 FAIL (contract violation), 2 ERROR (operational/usage).

It must run identically for a developer pre-PR (declaration supplied via
flags or file) and in CI (declaration extracted from the PR body). In CI the
declaration is read from a **non-interpolated channel** — the
`$GITHUB_EVENT_PATH` event payload file, never shell interpolation of the
body — because the PR body is untrusted input (see Risks); this path also
needs no permissions beyond `contents: read`.

The checker's claim is **declared-track artifact conformance** on the
reversible/irreversible axis: an irreversible declaration missing its spec
fails; a reversible declaration never demands one. Without a declaration,
plan+build-no-spec is indistinguishable between a correct reversible change
and an iron-law violation; the declaration is what makes this axis
falsifiable. Two judgements remain explicitly with PR review, not the
checker: whether a `reversible` declaration is semantically honest (does the
diff freeze a consumer-bound shape?), and whether a `none` exemption is
honest.

The checker is a **separate surface** from `sdlc-status`. FS8/ADR 0016 stays
frozen at schema version 1: readiness semantics, check ids, exits, and
envelopes are untouched by this child. Bundle verification at readiness time
(an FS8 v2) is explicitly deferred until the bundle's shape has been proven
in use.

### R3 — Setup provisions or verifies the complete bundle

`setup-sdlc` grows from config+models to the full bundle:

- writes the PR template (`.github/pull_request_template.md`) containing the
  R1 declaration block;
- **recognise / refuse / instruct** for consumer-authored equivalents: an
  existing file that already structurally satisfies the requirement is
  recognised and retained; one that does not is refused — never merged,
  never overwritten — with instructions for the human to add the required
  block. For the PR template, structural satisfaction means the file
  contains a contiguous, parseable declaration block — a line matching
  `track: (irreversible|reversible|none)` together with its conditional
  `reason:`/`slug:` companion lines — regardless of surrounding content; the
  Specification refines within that boundary and pins the acceptance check
  per asset;
- **bundle-mode re-run**: an existing config is retained and provisioning
  continues for the remaining assets; replacing the config itself still
  requires the existing `--force` (the current guard at
  `setup-sdlc.mjs:157-162` is preserved, not weakened). Both paths are
  tested;
- optionally copies package prompts into `.pi/sdlc/prompts/` to seed the
  existing FS5 override resolution (`ensure-panel-agent.mjs` already prefers
  that path); default remains referencing the installed package, and no new
  override mechanism is introduced. A copy becomes consumer-owned: setup
  never refreshes it (see Risks), and the documented refresh action is
  delete-and-re-copy;
- verifies the package assets **the bundle references** (prompts, schemas,
  scripts named by the shipped template/workflow/skill entry points) resolve
  from the installed package, and reports the result; the full
  normative-reference inventory remains sub-change 3;
- offers a basic GitHub Actions workflow **only when the repository has no CI
  configuration at all** (R4); never edits existing workflows and never
  creates a workflow alongside existing CI;
- is safe to re-run: idempotent, and reports each asset as created, retained
  (recognised equivalent), upgraded, or refused. The Specification pins the
  report envelope, the aggregate exit mapping, and the preflight rule:
  resolve every source before the first write, and a refused asset does not
  abort provisioning of remaining independent assets — the report says what
  happened to each.

### R4 — GitHub Actions integration is real where offered, optional overall

- The offered consumer workflow ships the deterministic **lifecycle-check
  step** plus a clearly documented placeholder where the consumer adds their
  own test/lint steps. No toolchain is assumed or prescribed.
- The workflow **acquires the checker self-containedly**: a version-pinned
  secondary checkout of the pi-sdlc repository into a known directory,
  invoking the direct Node entry point. No dependency on the consumer's
  pi-package install being present in CI, and no dependency on sub-change
  4's invocation documentation; upgrading = bumping the pinned ref. The
  workflow's own structural boundary (for fixtures and recognition): a
  checkout step pinning the pi-sdlc repository at a fixed ref, followed by a
  `node` invocation of the checker entry point — the spec refines within
  that sketch, mirroring the PR template's boundary in R3.
- Repositories with existing CI get documented instructions (a snippet
  invoking the checker the same way) rather than any automatic edit.
- CI integration is **not mandatory** for the bundle to be complete; local
  checking is canonical (stream locked decision). A consumer not on GitHub
  is a first-class citizen.
- This repository dogfoods the deliverable: `ci.yml` gains the
  lifecycle-check step (invoking the in-repo checker) and the repo gets the
  shipped PR template, fixing A7 known-failure 1 for the package itself.

### R5 — Documentation matches shipped reality

- `SKILL.md`'s claim "CI checks the declared track's artifacts are committed"
  is softened to conditional-on-configuration and now points at a real,
  shipped mechanism. This coherence edit is folded into this child because
  shipping the checker while leaving a false universal claim about it would
  be self-defeating; the full normative-reference inventory remains
  sub-change 3.
- SKILL.md's PR-phase text is updated to match the shipped template: track
  declared, **track-specific** doc links (plan+spec+build vs plan+build),
  and the reversible-review grounding rule — replacing the current
  unconditional "plan and spec linked, checklist complete" wording.
- SKILL.md/README state, as enumerated assertions each backed by a
  mutation-style doc test: the three declaration values, the
  reason-when-none rule, the slug-when-not-none rule, the auto-generated
  exemption rule, the checker's local and CI invocation, and setup's
  recognise/refuse/instruct + re-run semantics.
- An ADR records the PR-declaration + checker contract (values, slug rule,
  exemption rule, exits) and setup's bundle-mode report surface as frozen,
  with their own versioning.

### R6 — Existing consumers receive an explicit, non-destructive upgrade

- Re-running setup is the documented upgrade path to acquire the bundle;
  nothing consumer-authored is destructively rewritten (R3 semantics).
- `sdlc-status` results for existing consumers are **unchanged** — no repo is
  reclassified not-ready by this child, because readiness (FS8 v1) does not
  gain bundle checks here.
- Fixtures represent an existing config+models consumer before and after the
  upgrade re-run.

## Scope

### In

- PR template with the minimal track declaration block; declaration grammar
  and the auto-generated-PR exemption rule.
- Track-specific PR links and the reversible-track PR review grounding rule,
  including the `adversary-review.prompt.md` input change.
- The lifecycle checker CLI (local + CI modes), its exit contract and ADR.
- `setup-sdlc` bundle provisioning, structural recognition, refuse/instruct,
  bundle-mode re-run and report envelope, optional prompt copying,
  referenced-asset verification, and the conditional CI-workflow offer.
- Shipped GitHub Actions workflow content, including the pinned-checkout
  checker acquisition; this repo's own `ci.yml` step and PR template
  (dogfooding).
- SKILL.md/README edits scoped to the above, including the CI-claim
  softening and PR-phase text.
- Existing-consumer upgrade fixtures and offline tests for all of the above.

### Out

- Readiness/`sdlc-status` changes of any kind; FS8 stays at schema v1
  (sub-change 1 shipped it; a v2 bump is future work).
- The full normative-reference inventory and mandatory-claim checking
  (sub-change 3 / A4+A7), beyond R5's scoped edits.
- Skill-relative invocation documentation and end-to-end `paths` plumbing for
  existing surfaces (sub-change 4 / A5+A6); the new checker consuming
  configured paths is in scope because it is new code, and the offered
  workflow's pinned-checkout acquisition is self-contained rather than
  depending on sub-4's contract.
- Plan-doc front-matter `track:` (recorded candidate for programme child 2).
- Authoring/transition templates, Brainstorm recap (programme child 2).
- Durable run receipts, hook enforcement (programme child 3).
- Author-model dispatch (child 4); tracker semantics (child 5).
- Any non-GitHub CI provider integration (stream locked decision).
- Live network or paid-model calls anywhere, including tests.

## Constraints and locked decisions

- FS8/ADR 0016 (status surface) and ADR 0015 (readiness policy) are untouched.
- FS1 config and FS2 models schemas are unchanged; the checker reads existing
  `paths` only.
- Consumer-authored files: recognise structurally valid equivalents, refuse
  everything else with instructions — no merge, no overwrite. The existing
  `--force` guard applies to setup's own config file and is not weakened;
  bundle-mode re-run does not require it. `--force` does NOT extend to
  non-config bundle assets: refuse-and-instruct applies to them regardless
  of `--force`; an asset-level force is explicitly deferred (the manual path
  is delete-then-re-run).
- The checker is read-only, offline, deterministic, and never a paid call.
- CI mode reads the PR body from a non-interpolated channel
  (`$GITHUB_EVENT_PATH`); the body is treated as untrusted input end to end.
- Local checking is canonical; GitHub Actions is an integration of it, not
  its definition.
- `track: none` requires a reason; track ≠ none requires a slug; `none` is an
  exemption declaration, not a third lifecycle track.
- Checker exits follow `validate-task`'s 0 PASS / 1 FAIL / 2 ERROR (ADR 0014
  style).
- The package remains a git-installed pi package (no npm publication).

## Risks and dependencies

- **Track honesty is prose-law territory:** the checker verifies
  declared-track artifact conformance only. A dishonest `reversible` (on a
  shape-freezing diff) or dishonest `none` (on a substantive change) passes
  mechanically and is caught, if at all, by the PR panel under ADR 0011.
  The plan deliberately does not claim mechanical enforcement of track
  semantics; docs must not either.
- **PR-body parsing fragility and injection:** GitHub renders/edits PR
  bodies, and the body is attacker-controlled input. Mitigation: an explicit
  comment-delimited block with a strict line grammar, extraction via the
  event payload file (never shell interpolation), and spec scenarios
  covering malformed, duplicated, and metacharacter/injection cases.
- **Checker acquisition in consumer CI:** a clean CI runner has no installed
  pi package. Mitigation: the offered workflow's pinned secondary checkout
  (R4); the fixture asserts the generated workflow contains the pinned
  acquisition and the placeholder, and documents the ref-bump upgrade path.
- **Slug→artifact resolution:** artifact docs are `<date>-<slug>` named; the
  checker must match without knowing the date, and ambiguous multiple
  matches need defined semantics (spec pins glob and collision behaviour).
- **Equivalence too loose/too strict:** structural acceptance (R3) is the
  stream's named risk; the plan pins the boundary sketch for the PR template
  and the spec refines per asset, so a consumer template with a valid block
  passes and a lookalike without one is refused.
- **CI detection:** "repository has no CI configuration" needs a precise,
  testable definition (spec pins the probe, e.g. `.github/workflows/*`
  presence and any other recognised CI markers), with both positive
  (provision) and negative (creation suppressed, snippet emitted) fixtures.
- **Prompt-copy staleness:** a copied prompt is consumer-owned; setup never
  refreshes it, so consumers who opt in drift from upstream reviewer prompts
  with no detection until sub-change 3's inventory reports overrides as
  consumer-owned and unverified. Docs pin the delete-and-re-copy refresh.
- **Bootstrapping the dogfood repo:** this PR itself must pass the new
  check once the CI step lands in the same change; ordering within the PR
  (template + declaration + checker + workflow step together) must be
  arranged so CI is green at merge.
- **Checker vs `validate-task` confusion:** two checker-like CLIs now exist;
  naming and docs must keep lifecycle checking (PR/track) clearly distinct
  from per-task validation (PV1/PV2).

## Definition of done

- [ ] The shipped PR template contains a parseable declaration block; the
      checker accepts all three track values and rejects a missing/ambiguous
      declaration, a missing reason for `none`, and a missing slug for
      lifecycle tracks — each with a distinct diagnostic in offline fixtures.
- [ ] A fixture PR matching the auto-generated exemption rule passes without
      a declaration; one not matching it fails without one; an
      exempt-matching PR carrying a valid declaration is checked against
      that declaration (declaration dominates).
- [ ] Irreversible fixtures: complete plan+spec+build for the slug passes;
      each missing artifact fails with a stable id naming the missing doc.
- [ ] Reversible fixtures: plan+build passes with no spec present; the
      checker never requests a Specification on the reversible track.
- [ ] `track: none` with a reason passes with zero artifact demands; without
      a reason it fails.
- [ ] Artifacts are verified as committed content, honouring configured
      `paths.plans`/`paths.specs` in a non-default-paths fixture.
- [ ] The checker exits 0/1/2 with pinned machine-readable output; identical
      verdicts local (flags) and CI (event-payload) modes on the same
      fixture; a PR body containing shell metacharacters/injection payloads
      is handled inertly.
- [ ] Fresh-repo fixture: one setup run provisions the full bundle (config,
      models, PR template; CI workflow when no CI exists) and reports each
      asset per the pinned envelope; a second run is idempotent and reports
      retained; a refused asset does not abort remaining independent assets.
- [ ] Bundle-mode re-run over an existing config retains it and continues;
      config replacement still requires `--force`; both paths tested.
- [ ] Consumer-equivalents fixtures: an existing PR template with a valid
      block is recognised/retained; one without is refused with instructions
      and left byte-identical.
- [ ] CI-offer fixtures: a no-CI repo receives the workflow containing the
      pinned checker acquisition, the lifecycle-check step, and the
      documented tests/lints placeholder; a repo with an existing CI marker
      receives **no new workflow file** and gets the instruction snippet;
      existing workflows are never edited.
- [ ] Setup reports resolution of every package asset the bundle references;
      a fixture with a broken reference reports it.
- [ ] Prompt-copy option seeds `.pi/sdlc/prompts/` and `ensure-panel-agent`
      resolves the copy; without the option the package prompt resolves.
- [ ] Existing config+models consumer fixture upgrades via re-run without any
      destructive rewrite, and its `sdlc-status` results are byte-identical
      before and after this child (readiness untouched).
- [ ] This repo has the PR template and a CI lifecycle-check step; the PR
      shipping this child passes its own check.
- [ ] SKILL.md no longer claims unconditional CI enforcement; its PR-phase
      text matches the shipped template with track-specific links and the
      reversible-review grounding rule; doc-presence tests fail when any of
      the enumerated assertions (three track values, reason rule, slug rule,
      exemption rule, local+CI invocation, setup semantics) is removed.
- [ ] `adversary-review.prompt.md` accepts plan+build grounding for
      reversible-track PRs and never demands a spec for them.
- [ ] An ADR freezes the declaration/checker contract and setup's bundle-mode
      report surface.
- [ ] No test performs network access or invokes a model; `npm test` and
      `npm run lint` pass.
- [ ] Plan, Specification, and PR panels reach no surviving high or medium
      findings with recorded adjudication.

## Context for the Specification author

Observed reality to build from (verified 2026-07-13):

- `setup-sdlc.mjs` writes only `sdlc.config.json` (+ optional models example
  copy via `--with-models`); `--force` guards only its own config file
  (`setup-sdlc.mjs:157-162`, pinned by `test/setup-sdlc.test.js:27-45`);
  exits 0 written / 1 declined / 2 error.
- `.github/pull_request_template.md` does not exist — in consumers or in this
  repo. `ci.yml` runs `npm test` + biome only, with
  `permissions: contents: read`.
- `SKILL.md` states "Every PR declares its track (see
  `.github/pull_request_template.md`). CI checks the declared track's
  artifacts are committed." — both currently false everywhere. Its PR
  section says "plan and spec linked, checklist complete" unconditionally.
- `adversary-review.prompt.md` assumes a spec among its inputs and never
  mentions tracks.
- Prompt override resolution already exists: `ensure-panel-agent.mjs` prefers
  `.pi/sdlc/prompts/<base>.prompt.md` over the package prompt (FS5).
- Sibling CLI conventions: `.sh` wrapper + `.mjs` entry, `--repo-root`/
  `--config` root resolution (FS3 via `lib.mjs resolveRoot`), `--format
  text|json` envelopes (FS8 style), `validate-task` exits 0/1/2 (ADR 0014).
- Committed-content checking precedent: `sdlc-status.mjs` reads `HEAD` blobs
  and compares index/working tree (`cleanAgainstHead`), using `:(top)`
  pathspecs.

The Specification must pin: the declaration grammar and its stable scenario
ids; the auto-generated exemption identification; slug→artifact glob and
collision semantics; per-asset structural acceptance checks; the CI-absence
probe; the checker output envelope and its ADR; setup's report envelope,
aggregate exit mapping, and preflight/partial-provisioning rule; the pinned
checkout mechanics of the offered workflow; the event-payload extraction; and
the exact SKILL.md/prompt sentences changed. It must not add readiness
checks, touch FS8, or choose implementation task boundaries (Build owns
those).
