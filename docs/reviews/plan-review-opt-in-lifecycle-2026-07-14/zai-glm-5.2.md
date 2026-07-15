# Plan review — `docs/plans/2026-07-14-opt-in-lifecycle.md` (commit 0703e76)

Judged as a plan against the ratified brainstorm (#34–#42 + amendments on #35/#36/#41), the shipped FS9/FS10/FS8 code, and ADRs 0016/0017/0018/0019/0020. Findings only, most severe first.

### The headline non-regression DoD is self-contradictory; its own stated falsifier fails

- severity: high
- confidence: high
- location: "Definition of done" item 1; "Compatibility constraints" (`FS9 v1 fixtures stay green unmodified`)
- defect: DoD 1 asserts a no-`lifecycle`-block repo "behaves byte-for-byte as today across `check-lifecycle` (v2) … falsifiable via existing FS9 v1 fixtures remaining green unmodified", while DoD 4 and scope-in 6 assert the v2 checker "enforces `evidence.manifest`/`evidence.scenarios`/`evidence.channels`". These are mutually exclusive for any repo that ships PV1 manifests, and the plan never reconciles them.
- evidence: The repo has PV1 manifests with non-empty `ownedScenarios` at `docs/validation/sdlc-adoption-bundle/ab-t1.json … ab-t5.json` (e.g. `ab-t1.json` owns `["AB1","AB2","AB7"]`) and **no** `evidence.channels.json` anywhere. The existing fixture `test/check-lifecycle.test.js:37-42` ("flags mode accepts a reversible declaration") runs `--track reversible --slug sdlc-adoption-bundle` against the repo root and asserts `state === "pass"`, `status === 0`. Under v2, #41 §1 applicability + #40 §3a ("evidence … run at every profile") demand `evidence.manifest` on this reversible PR (non-empty PV1 union) and it would `fail` (manifest absent) → exit 1, flipping the fixture from pass to fail. Even in the benign case the report gains new `evidence.*` check lines, so "byte-for-byte" is false by construction. The upstream research is itself inconsistent: #36 §3 says "a v2 checker reading a config with no `lifecycle` block behaves identically to v1 … safe-by-default", while #40 §3a says evidence "runs at every profile".
- impact: The DoD's named falsifier (v1 fixtures green unmodified) would *demonstrate non-conformance*; a Spec author inherits two contradictory requirements and an undefined migration boundary (does the evidence surface fire on no-`lifecycle`-block repos, or is it gated by the `__PI_SDLC_REF__` pin only?). This is the load-bearing compatibility guarantee for the whole stream and it is currently unfalsifiable.
- fix: Add one binding decision: either (a) evidence.* checks are gated on `lifecycle`-block presence (then restate DoD 1 accordingly and weaken #40's "every profile" claim), or (b) evidence always fires and the migration is purely pin-based — in which case DoD 1 must be rewritten to "v1 check ids and their results are unchanged; appended `evidence.*` ids are additive and gated by the `__PI_SDLC_REF__` pin", and the "fixtures green unmodified" falsifier must be scoped to a v1-pinned run.

### The irreversible-track rationale misstates a locked decision (the declaration does not widen)

- severity: medium
- confidence: high
- location: plan header, "Track: **irreversible** (… widens the FS9 declaration/checker contract to schemaVersion 2 …)"
- defect: The Track justification says the stream "widens the FS9 declaration/checker contract". The ratified decision (#40 resolution/headline) and the plan's own scope-in 6 ("the PR declaration grammar does NOT widen") freeze the declaration grammar v1 byte-for-byte; only the *checker* widens (schemaVersion 2). The slash-joined phrasing implies the declaration widens, which is the one thing #40 exists to forbid.
- evidence: #40 resolution headline: "the per-PR declaration does **not** widen — `track`/`slug` stays FS9 v1 grammar". Plan scope-in 6: "the checker consumes the `lifecycle` block from its existing `config.valid` parse (the PR declaration grammar does NOT widen)". ADR 0017 freezes the `sdlc` declaration grammar at v1.
- impact: A reader (especially the Spec author) may scope a declaration-grammar change that contradicts a ratified, ADR-frozen decision; the irreversibility justification is overstated against the wrong surface.
- fix: Reword to "widens the FS9 *checker* contract to schemaVersion 2 (declaration grammar v1 frozen)" so the Track rationale cites the actually-frozen irreversible shapes (lifecycle config vocabulary + FS9 checker report/`shape` + ratified kernel text).

### Unstated CI dependency: base-branch-tip reading needs a workflow fetch step the plan never names

- severity: medium
- confidence: high
- location: "Definition of done" item 4 ("reads the shape from the base-branch tip in CI mode … error-not-fallback on an unreadable base")
- defect: The shape-of-record rule requires the offline checker to `git show <base-tip>:.pi/sdlc.config.json`. The shipped `skills/sdlc/assets/sdlc-lifecycle.yml` runs two `actions/checkout@v4` steps with no `fetch-depth`, so the checkout is depth-1 and the base-branch-tip object is absent from the local store — every PR would hit "unreadable base" → exit 2. The plan flags the *behaviour* but not the *workflow input* it depends on, nor that `sdlc-lifecycle.yml` is consumer-owned (ADR 0020) so setup must teach the fetch, not just ship it.
- evidence: `sdlc-lifecycle.yml:13-14` — bare `actions/checkout@v4` (default `fetch-depth: 1`). ADR 0017:18 — checker is "read-only, offline" (no GitHub-API fallback for the base). #42 resolution chose base-branch-tip, *not* merge-base, so `git merge-base` is not a substitute.
- impact: DoD 4's CI clause is unimplementable against the shipped workflow as-is; without a stated fetch requirement the Spec will either ship a checker that errors on every PR or silently weaken to HEAD-read (reopening the self-loosening loophole #42 was ratified to close).
- fix: Add to scope-in/compatibility: the shipped workflow (and setup's `ci-workflow` asset) must fetch the base ref (e.g. `fetch-depth: 0` or `git fetch origin "$BASE"` from the event payload) before invoking the checker; name this as a consumer-owned-file change under ADR 0020.

### Scope coherence: 7 deliverables across 6 frozen surfaces with no Spec decomposition or ordering

- severity: medium
- confidence: medium
- location: "What this delivers (scope in)" items 1–7; "Context for the next agent (Spec phase)"
- defect: The plan bundles the kernel rewrite, a new FS1 config schema + validator, the profile matrix, six standalone entrypoints, the evidence-ladder format + 3 new check ids, the FS9 v2 checker widening + base-shape-of-record, and a full SKILL.md restructure with four new assets — yet treats "the next agent (Spec phase)" as singular and names no dependency ordering or spec split. The directly comparable prior stream (`2026-07-12-sdlc-adoption-contract-honesty.md`) explicitly decomposed four sub-changes because it was "still too large for one coherent Specification"; this plan is larger and does not.
- evidence: Prior stream plan header: "The plan panel found this stream still too large for one coherent Specification. It is therefore split into four independently gated sub-changes". This plan's "Context for the next agent" names only a scenario-id convention, not decomposition. Real dependencies exist and are unordered here: SKILL.md (#39) depends on the schema/profiles existing; `evidence.*` checks depend on the `evidence.channels.json` format; shape-of-record depends on the `lifecycle` config read; the enum-growth seam (#36 amendment) depends on the gate-mode modelling.
- impact: Risk of a single overloaded Spec, or uncoordinated parallel Specs that re-open frozen surfaces out of order; the irreversible/track classification cannot be applied per-deliverable if they ship in one undifferentiated Spec.
- fix: Add a short decomposition/sequencing note (e.g. schema+validator → checker v2 widening → evidence surface → entrypoints → SKILL.md restructure) and state which deliverables may bundle into one Spec vs. need their own gates.

### The #36 amendment's binding enum-growth constraint is not carried as a falsifiable DoD item

- severity: low
- confidence: medium
- location: "What this delivers" item 2 (gate `mode` modelled as reviewer × arbiter); "Definition of done" (no item for it)
- defect: The #36 amendment is an implementation-level mandate — "Implementation must model the enum so a fifth value is enum growth (validator change + pinned-ref bump), not a remodel. Do not implement `panel`'s human-approval coupling anywhere other than the mode's own semantics." The plan carries this only conceptually ("modelled as reviewer × arbiter … designated additive extension point") with no DoD item a Spec scenario could falsify, so a flat-enum implementation would pass every other DoD while welding the #43 seam shut.
- evidence: #36 amendment clause 1 (binding "must model the enum so a fifth value is enum growth, not a remodel"). Plan DoD 1–8 contain no item asserting the gate-mode validator is structurally decomposed (reviewer × arbiter) such that adding the mechanically-adjudicated quadrant is enum growth.
- impact: The future-proofing clause the amendment exists to enforce is not testable in this stream; a later #43 unattended lane becomes a remodel (public schema/kernel churn) instead of additive growth.
- fix: Add a DoD item (or explicit Spec scenario) asserting the gate-mode validator decomposes reviewer × arbiter so the panel-reviewed/blocking/mechanically-adjudicated quadrant is additive enum growth, and that `panel`'s human-approval coupling lives only in `panel`'s own semantics.

CLEAR: B — every stated outcome maps to a falsifiable DoD item (modulo the high finding above on DoD 1/4); objectives are concrete and measurable.
CLEAR: F — the **irreversible** classification is correct: the plan genuinely freezes the `lifecycle` config vocabulary consumers commit to, the FS9 checker schemaVersion 2 + report `shape` field, and ratified kernel text. The track is right; finding 2 is a justification-wording defect, not a misclassification.
