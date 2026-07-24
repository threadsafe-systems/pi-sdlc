# Plan: PV1 task-scoped test declaration + scenario-evidence tightening

- **Track:** irreversible (PV1 is a portable validator contract every adopting
  repo's committed manifests bind to; tightening its acceptance rules changes
  what an already-committed manifest means on skill upgrade — see Brainstorm
  Finding 1).
- **Slug:** `pv1-task-scoped-tests`
- **Brainstorm:** approved 2026-07-24 (human:neil), with two corrections
  ratified in-session: (1) track reclassified reversible→irreversible; (2) the
  validator's job stays purely mechanistic — no diff-correspondence judgement
  in `task_validate` — visibility is achieved structurally instead (see
  Rationale).
- **Plan panel, round 1** (gemini-3.1-pro-preview, gpt-5.6-luna): 1 high + 1
  low, both incorporated (fix-wave commit `7dc5c50`).
- **Plan panel, round 2** (same two reviewers): 2 more findings (1 high from
  gemini proving the round-1 fix was itself still wrong; 1 low) plus 4 medium
  from luna. All six converged on one root cause and drove a design pivot
  from a naming-convention rule to an explicit schema field (fix-wave commit
  `389ec6f`).
- **Plan panel, round 3** (same two reviewers): 1 high from gemini (the
  single-valued field still forces dummy duplicate checks in the overlap
  case) + 2 high from luna (schema-only enforcement is not runtime
  enforcement; same-schemaVersion hides a breaking acceptance-rule change).
  All three incorporated below; the schemaVersion finding also produced an
  ADR 0013 amendment, **ratified 2026-07-24 (human:neil)**.
- **Plan panel, round 4** (same two reviewers): gemini reported CLEAR across
  the board (fully resolved, no new findings). luna found 3 more: 1 high (the
  ADR amendment's own consequence text self-contradicted the Plan's
  compatibility note), 2 medium (Objective wording overclaimed correspondence
  the design deliberately doesn't provide; the pre-existing PV1 Specification
  needs an explicit amendment, not a silent second document). All three
  incorporated (fix-wave commit, this commit).
- **Plan panel, round 5** (same two reviewers): gemini reported CLEAR again.
  luna found 3 more, the most operationally serious yet: 1 high (this
  slice's target files are in `test/frozen-surfaces.test.js`'s `FROZEN`
  array — the entire implementation is mechanically blocked by ASD19 as
  written), 1 medium (existing `test/telemetry-side-effects.test.js`
  fixtures would regress from PASS/FAIL to manifest-errors under the new
  rules), 1 low (Objective baseline description imprecise). All three
  verified directly and incorporated (fix-wave commit, this commit).
- **Plan panel, round 6** (same two reviewers): 1 high from gemini (the PV1
  contract test suite's own root fixture, `baseManifest()` in
  `test/validator-contract.test.js`, has the identical fixture-regression
  shape round 5 found elsewhere — even higher blast radius, 15+ call sites).
  luna found 2 medium (no explicit release-signal requirement, given
  `check-schema-break.mjs` deliberately excludes PV1; new error types not
  slotted into the existing deterministic pointer/rule-order contract) and 1
  low (ASD19's header comment would contradict its own edited array). All
  four verified directly and incorporated (fix-wave commit `fac770d`).
- **Plan panel, round 7** (same two reviewers): gemini reports genuinely
  clean, including independently confirming no other repo fixture regresses
  (matching my own direct check). luna found 1 high (ADR 0027, as literally
  written, covers only "config-schema shape breaks" — citing it for a PV1
  manifest break was a scope misapplication; same underlying rationale
  applies, extended via a second ADR 0027 amendment, **ratified 2026-07-24,
  human:neil**) and 2 medium (the Spec amendment requirement didn't cover
  the Spec's own now-invalid worked example or its §1.3–1.5 prose; the
  Objective's zero-scenario wording overclaimed "unaffected" instead of
  "unaffected by requirement (b) only"). All three verified directly and
  incorporated (fix-wave commit, this commit).

## Objective

Today a PV1 manifest's `tests`-category checks (there may be one or several —
e.g. `docs/validation/sdlc-lifecycle-telemetry/lt-t5.json` already declares
three) carry **no declared semantic role**: nothing distinguishes "this is
the broad regression net" from "this is this task's specific evidence,"
regardless of count. The validator's only inference is "did the suite run" —
there is no visibility into *which* checks a task's author *declared* as its
task-specific tests, and no *mechanically reliable* way to tell a
declared-broad check apart from a declared-narrow one by naming convention
alone (round 2 finding). This slice adds that role declaration; it does not,
and cannot, verify that the declared tests actually correspond to the diff —
that stays a human/PR-panel judgement, deliberately (Brainstorm Finding 2,
restated below).

Add an explicit, optional per-check manifest field, **`scope: ("full" |
"task")[]`** — a non-empty array of tags, not a single value (round 3
finding: a check can legitimately be both). Require: (a) whenever a
manifest's `tests` category is required, at least one of its declared checks'
`scope` includes `"full"` — a regression net is mechanically guaranteed
present, not inferred from a naming pattern; (b) whenever an owned scenario's
evidence cites any `tests`-category check at all, at least one of the cited
checks' `scope` must include `"task"` — scenario evidence can no longer rest
solely on a check that isn't tagged task-scoped. A single check that
legitimately serves both roles (e.g. a small task where the full suite *is*
the task-specific evidence) tags `scope: ["full", "task"]` and satisfies both
requirements without duplication. A scenario evidenced purely by non-test
categories, or a manifest with `tests: n/a`, is unaffected by both
requirements. A manifest with **no owned scenarios** is unaffected by
requirement (b) only — it is never asked to declare or cite a `"task"`-tagged
check — but requirement (a) still applies whenever `tests` is required,
scenarios or not: a `"full"`-tagged check must be present regardless.

## Rationale

- **Structural, not judgement-based.** `task_validate`'s mandate
  (`skills/sdlc/prompts/validator-task.prompt.md`) is explicitly mechanistic —
  no quality opinions, no diff review, judgement is the PR panel's job. This
  slice does not ask the validator to check that the declared task-scoped
  tests *correspond* to the diff. It makes the right evidence land in the
  receipt for free: a `"task"`-tagged check's exact argv and stdout tail
  (naming the specific tests that ran) is already captured by the existing
  evidence-bounding/redaction pipeline once the check is declared. A human, or
  the PR panel (which *is* mandated to judge), can eyeball it.
- **Why an explicit field, not a naming convention (the round-2 pivot).** The
  original design (fix-wave 1) used a reserved id prefix
  (`/^tests\.task(?:[.-]|$)/`) and inferred "the broader check" as "whatever
  isn't prefixed that way." Two independent reviewers, across two rounds,
  converged on why that's unsound:
  - **Round 2, gemini:** the task-scoped requirement (then "Rule A2," fired
    whenever both `tests` and `scenarios` were required) forced a task-scoped
    check to exist even for scenarios evidenced *purely by static/lint
    checks* — a task doing an unrelated test-modifying chore alongside a
    static-only scenario would be forced to invent a meaningless dummy
    `tests.task*` check. The evidence-mapping rule (now "Rule B") already
    implies existence exactly when actually needed — a scenario can't cite an
    undeclared check id — making the separate existence rule both redundant
    and, in that edge case, actively wrong.
  - **Round 2, luna:** proved with a real committed manifest
    (`docs/validation/portable-validator/pv-t1.json:9-10`, check id
    `tests.contract`, running `node --test test/validator-contract.test.js
    test/extraction.test.js test/docs.test.js`) that "does not match the
    task-prefix pattern" is **not** the same claim as "is the full/broad
    suite" — `tests.contract` is itself a narrow, specific test selection
    that simply happens not to be named with the reserved prefix.
  - Both findings share one root cause: inferring semantic role from an id's
    *spelling* is unreliable. An explicit field removes the inference
    entirely: the author states the scope directly, `inspectManifest` reads
    it directly. This also cleanly resolves gemini's redundant-rule finding:
    dropping the separate existence rule (former Rule A2) in favor of Rule B
    alone is only safe once existence is unambiguous — the field makes it so.
  - **Portability preserved.** The field, not the id, carries meaning — a
    consuming repo names its checks however its own tooling dictates.
- **Why an array, not a single value (the round-3 gemini fix).** A strict
  single-valued `scope` (`"full"` **xor** `"task"`) directly contradicts this
  plan's own stated goal of eliminating meaningless dummy checks: a task where
  the full suite legitimately *is* the correct scenario evidence (small repo,
  comprehensive refactor) would be forced to declare two check entries with
  identical argv, one tagged each way, purely to satisfy both rules on paper.
  An array lets one check honestly declare both roles when both are true,
  with no duplication and no dummy checks — the exact failure mode the pivot
  was meant to prevent, closed for the field-based design too, not just the
  abandoned regex design.
- **Enforcement lives in `inspectManifest`, not the schema file (the round-3
  luna fix).** `runManifest` (the actual PV2 runtime path) calls only
  `inspectManifest` — it never loads or validates against
  `schema/task-validation-manifest.schema.json` at runtime; Ajv is used only
  in this repo's own test suite to keep the schema and `inspectManifest` in
  sync for external consumers who might validate independently. Treating "add
  it to the schema" as sufficient enforcement was a real gap: a malformed
  `scope` value (wrong type, unknown string, empty array) would pass the
  actual runtime validator silently if only the schema file constrained it.
  Fix: `inspectManifest` directly validates `scope` when present — must be a
  non-empty array, every entry one of `"full"`/`"task"`, no duplicates —
  exactly like every other per-check field (`id`, `argv`, `timeoutMs`,
  `evidence`) is already independently validated by `inspectManifest` itself,
  never delegated to the schema file. The schema stays the *documented,
  externally-consumable* mirror of the same rule (unchanged intent from
  round 2), not the enforcement point.
- **schemaVersion and the round-3 luna finding this plan cannot self-resolve.**
  Luna's sharpest finding: keeping `schemaVersion: 1` while `scope` becomes
  *conditionally* load-bearing for acceptance (Rule A/B) means a manifest's
  `schemaVersion` field can no longer tell a consumer which acceptance rules
  apply — both the old and new rule-sets read `schemaVersion: 1` identically,
  and ADR 0013's original text ("a new required field or category is a major
  bump") did not anticipate a rules-only tightening with no shape change at
  all. This is a genuine gap in ADR 0013, not just this plan, and is answered
  by a **proposed** ADR 0013 amendment (already drafted in
  `docs/adr/0013-task-validation-manifest-pv1.md`, ratified 2026-07-24):
  `schemaVersion` tracks manifest
  *shape* (field/category presence, type, cardinality — what an old,
  unmodified manifest can and cannot satisfy no matter what rules run), while
  acceptance-*rule* strictness is tracked by the ordinary lifecycle (Plan +
  Spec + panel review, exactly this process) rather than a manifest-embedded
  integer. Under that reading, `scope` being an optional field keeps
  `schemaVersion` at 1 correctly; the acceptance-rule change is real,
  breaking, and irreversible-classified regardless (Brainstorm Finding 1
  already established that), just not schemaVersion-signalled.
- **Track (Brainstorm Finding 1).** PV1/PV2 is consumed by every repo that has
  adopted the sdlc skill — this repo, and the co-owned dogfood repos
  `threadsafe/case` and `threadsafe/pi-notion` (both named in ADR 0027's
  amendment). Their committed manifests are validated against whatever
  `inspectManifest` rules ship in the pinned skill version; tightening those
  rules means a manifest that validated cleanly under the old rules can start
  failing (a `manifest-error`, not a check failure) after a skill upgrade with
  no change to the manifest itself. That is a breaking change to a public
  contract other repos commit to — the SKILL.md iron law's own definition of
  irreversible, and its own tiebreaker (`shape.defaultTrack: irreversible`),
  agree. ADR 0027's coordinated-clean-break-with-no-migrator policy was
  written to cover only "config-schema shape breaks"; a **ratified amendment**
  (2026-07-24, human:neil, drafted in
  `docs/adr/0027-pre-adoption-clean-break-policy.md`) extends its decision to
  cover PV1 manifests too, on the same underlying rationale (pre-external-
  adoption, the whole affected population is this repo plus hand-authorable
  co-owned repos, a migration for that population is disproportionate
  ceremony). This ships as a **coordinated clean break with no migrator**:
  this repo hand-authors the landing change; each co-owned repo re-authors
  its own manifests as a follow-up while pinning the pre-break skill release
  until it does.

## Scope

**In:**
1. `skills/sdlc/schema/task-validation-manifest.schema.json`: add an optional
   `scope` property to each `checks[]` item —
   `{"type": "array", "items": {"enum": ["full", "task"]}, "minItems": 1,
   "uniqueItems": true}`. Purely additive (an optional array-of-enum field).
   Documents the same rule `inspectManifest` enforces (see Rationale); the
   schema is not itself the enforcement point.
2. `inspectManifest` (`validate-task.mjs`):
   - **New per-check field validation**, alongside the existing `id`/`argv`/
     `timeoutMs`/`evidence` checks: when `checks[i].scope` is present, it must
     be a non-empty array of unique strings, each exactly `"full"` or
     `"task"` — a manifest error otherwise (wrong type, unknown value,
     duplicate, or empty array).
   - **Rule A** (unconditional whenever tests apply, scenarios or not): when
     `categories.tests.applicability === "required"`, at least one of the
     checks referenced by that category's `checkIds` must have a `scope`
     array including `"full"`.
   - **Rule B** (evidence-mapping, gated on owning scenarios): when
     `categories.scenarios.applicability === "required"`, for every owned
     scenario's evidence array, restrict to ids that are also referenced by
     the `tests` category's `checkIds`; if that restricted set is non-empty,
     at least one of those checks must have a `scope` array including
     `"task"`. (A scenario evidenced purely by non-test categories is
     unaffected — the restricted set is empty, so the rule is vacuous for it
     by construction.)
   - Degradation: a manifest with **zero owned scenarios** is unaffected by
     Rule B, but remains subject to Rule A whenever `tests: required`. A
     manifest with `categories.tests: n/a` is unaffected by both rules.
     `scope` absent (or a check simply not referenced) satisfies neither rule
     — invisible to both counts, never an error on its own.
3. `references/phase-tasks.md` / `references/phase-implement.md` (both under
   `skills/sdlc/`): document the `scope` field (array-valued, both tags
   allowed on one check), Rules A/B, and both degradations, as part of
   Build's manifest authoring guidance.
4. `skills/sdlc/prompts/validator-task.prompt.md`: no mandate change
   (confirmed unnecessary per Rationale) — confirm in Build whether its
   "Checks" list needs a one-line note (likely not; it already reports every
   command by id regardless of `scope`).
5. `docs/adr/0013-task-validation-manifest-pv1.md`: the ratified amendment
   distinguishing shape-versioning from acceptance-rule strictness — see
   Rationale. No further edit needed; `schemaVersion` stays 1.
6. **`test/frozen-surfaces.test.js`'s `FROZEN` array (ASD19) currently lists
   both `skills/sdlc/schema/task-validation-manifest.schema.json` and
   `skills/sdlc/scripts/validate-task.mjs`** — verified directly: this slice's
   entire Scope items 1–2 are mechanically blocked by that test as it stands
   (`ASD19: frozen surfaces are byte-identical to the branch base` diffs the
   branch against the main merge-base for exactly those paths). This is the
   live, per-branch enforcement of the same "don't touch without deliberate
   intent" discipline this Plan already satisfies via the irreversible track
   and the ratified ADR 0013 amendment — not a newly-discovered blocker, but
   its mechanical trip-wire. Build must remove exactly those two entries from
   `FROZEN` (no others — `validate-task.sh` and `verify-task-receipt.mjs` stay
   frozen; this slice never touches them) with an inline comment naming this
   Plan as the deliberate reopening, mirroring how the surface was originally
   frozen with a named rationale. The file's own header comment (currently
   "the PV1/PV2 validator... [is] untouched") is updated in the same edit so
   the prose doesn't contradict the array's new contents. Do **not**
   additionally amend
   `docs/specs/2026-07-18-sdlc-agent-self-documentation.md` or
   `docs/specs/2026-07-16-config-versioning-migration.md`'s own
   "explicitly unchanged (frozen)" sections — those are accurate, point-in-
   time scope declarations for *their own*, already-merged changes, not a
   standing law that accumulates amendments; the live, operative definition
   of what's frozen is the `FROZEN` array itself, and only that needs
   updating.
7. `test/telemetry-side-effects.test.js`'s `passManifest()`/`failManifest()`
   fixtures (verified directly, lines 188–212) declare `tests: required` with
   a single check (`tests.ok` / `tests.bad`) that is *also* the scenario
   LT8's sole evidence — exactly the single-check-serves-both-roles case this
   Plan's array-valued `scope` design exists for. Without an update these
   fixtures regress from their expected PASS/FAIL outcomes to manifest-errors
   under the new Rules A/B, breaking the full test corpus (contradicts DoD
   item 8). Fix: tag that one check `"scope": ["full", "task"]` in both
   fixture functions — satisfies Rule A and Rule B simultaneously with no
   fixture restructuring, and doubles as the DoD-4 regression case's real
   usage in already-existing test infrastructure rather than only a new,
   synthetic one.
8. `test/validator-contract.test.js`'s `baseManifest()` fixture (verified
   directly — the root fixture behind 15+ direct call sites and every
   composed variant in the file; `checks: [{id: "tests.ok", ...}]` is both
   `tests: required`'s sole check and PV1 scenario's sole evidence) has the
   identical single-check-serves-both-roles shape as Scope item 7's fixture,
   at even greater blast radius — this is the PV1 contract test suite itself.
   Tag `tests.ok` (and any inline-redefined equivalents, e.g. a `withMarker`-
   style override that replaces `checks`) `"scope": ["full", "task"]` so the
   existing contract suite stays green under the new rules.
9. **The upcoming Specification must explicitly amend/supersede
   `docs/specs/2026-07-12-sdlc-portable-validator.md`** in full, not only its
   normative type — verified, three distinct locations need it: (a) §1's
   `CommandCheck` TypeScript type and its "No additional properties are
   allowed at any level in PV1 schema version 1" line (neither currently
   mentions `scope`, and the latter is literally false once `scope` ships);
   (b) **the worked example manifest** (§1, lines 52–103) — its single check
   `tests.contract` is, by construction, exactly the same manifest as
   `docs/validation/portable-validator/pv-t1.json` (round 2's counter-
   example) and fails both Rule A and Rule B unchanged; a "normative" example
   presenting an invalid manifest is incoherent; (c) §1.3–1.5's field/
   scenario/category constraint prose, which currently has nothing to say
   about `scope`, Rule A, or Rule B. Leaving any of the three uncorrected
   would commit two contradictory normative documents — the Spec phase must
   add an explicit amendment section (mirroring how the ADR 0013 amendment
   above extends rather than silently overrides its base document) naming
   exactly which lines/sections it supersedes, not a silent second document.
10. **The same Specification amendment must also extend §6's fixed
    cross-field error rule-order and pointer scheme** (`docs/specs/2026-07-
    12-sdlc-portable-validator.md`, the "JSON Schema errors use AJV-compatible
    instance pointers... fixed rule order and pointer" paragraph, verified
    directly) to the three new error types, so `manifestErrors` ordering and
    pointers stay deterministic and golden-testable rather than
    implementation-defined. Starting point for Spec to finalize (not this
    Plan's to fix precisely — exact wording is Spec-level normative detail):
    `scope` shape errors at `/checks/<i>/scope` (per-check field, consistent
    with existing `id`/`argv`/`timeoutMs`/`evidence` pointers); Rule A
    failures at `/categories/tests` (category-level, consistent with the
    existing "category applicability/reference" pointer); Rule B failures at
    `/categories/scenarios/evidence/<escaped-id>` per offending scenario
    (consistent with the existing "scenario mapped to non-required check"
    pointer, since Rule B is conceptually the same shape — a scenario mapped
    to a check that doesn't fulfil its evidentiary role).
11. **The landing PR/commit carries a `BREAKING CHANGE:` footer** (this
    repo's existing conventional-commits release signal, ADR 0012). Verified:
    `check-schema-break.mjs`'s own comment explicitly and deliberately
    excludes `task-validation-manifest.schema.json` from its automated guard
    ("PV1... an independent frozen surface under ADR 0013/0014 with its own
    version axis") — by prior design, PV1 breaks are not caught by dedicated
    tooling the way config-schema breaks are; the general commit-footer
    convention is the only release-channel signal this change gets, so it
    must not be silently omitted. This is a Build-time requirement (the
    commit itself), stated here so it isn't lost between Plan and PR.
12. Compatibility note for **existing** manifests in this repo
    (`docs/validation/*/*.json`): the `scope` field does not exist before this
    change, so **no historical manifest declares it** — every manifest with
    `tests: required` fails Rule A the moment it is re-validated under the new
    rules, old or newly-authored alike, unconditionally, with no partial-
    compliance exceptions to hunt for. This is a clean break exactly as ADR
    0027 anticipates. What does *not* happen: retroactive invalidation of
    already-merged historical receipts — those are hash-verified against
    their own recorded content (`verify-task-receipt.mjs`), never re-run
    through `inspectManifest`, so a past PASS stays a past PASS on record
    (matching the corrected ADR 0013 amendment wording).
13. Regression tests in `test/portable-validator.test.js` (or wherever PV1/PV2
    tests live — confirm exact file in Build) for: both rules positive
   (a compliant manifest with a `scope: ["full"]` check; one with separate
   `["full"]` and `["task"]` checks; one with a single `["full", "task"]`
   check satisfying both roles at once); both rules negative (Rule A: `tests:
   required` with checks but none tagged `"full"`; Rule B: a scenario's
   evidence citing only an unscoped or `"full"`-only check); the zero-
   scenario and `tests: n/a` degradations; the spelling-vs-field case (an
   unscoped check literally named `tests.full` must **not** satisfy Rule A);
   and the new `scope` shape-validation itself (wrong type, empty array,
   duplicate entry, unknown string value — each a manifest error).

**Out:**
- Any diff-correspondence judgement capability in `task_validate` (rejected in
  Brainstorm Finding 2).
- A full inventory/audit of every historical manifest under `docs/validation/`
  classified against the new rules (the compatibility note's classification
  is uniform — none declare `scope` — so no per-file audit has anything to
  discover).
- Any change to `schemaVersion` (stays 1 per the ratified ADR 0013 amendment
  — `scope` is an additive optional field).
- Coordinating a simultaneous change to `threadsafe/case` or
  `threadsafe/pi-notion` beyond what ADR 0027's existing coordinated-clean-
  break policy already prescribes.
- A migration path for `TESTS_TASK_RE` or any other artifact of the
  abandoned round-1 naming-convention design — it never shipped past this
  Plan doc.
- Inventing a distinct acceptance-rule version axis (an idea the ADR 0013
  amendment explicitly declines to build speculatively) — out of scope unless
  a future need proves the shape/strictness split insufficient.

## Definition of done

1. `skills/sdlc/schema/task-validation-manifest.schema.json` accepts an
   optional `scope` array property (`"full"`/`"task"`, non-empty, unique) on
   each `checks[]` item, rejects any other shape, and requires nothing new of
   manifests that omit it.
2. `inspectManifest` independently validates `scope`'s shape when present
   (not relying on the schema file) and rejects a manifest with
   `categories.tests: required` whose referenced checks include no check
   tagged `"full"` (Rule A) — including the case where an unscoped or
   wrongly-tagged check merely has a name that looks like a full-suite check.
3. `inspectManifest` rejects a manifest with `categories.scenarios: required`
   where any scenario's evidence cites a `tests`-category check but none of
   those cited checks is tagged `"task"` (Rule B).
4. A single check tagged `scope: ["full", "task"]` satisfies both Rule A and
   Rule B without a second, duplicate check (regression-tested).
5. A manifest with `categories.tests: n/a` is unaffected by both rules; a
   manifest with zero owned scenarios is unaffected by Rule B but remains
   subject to Rule A (regression-tested, including the spelling-vs-field
   case from Scope item 13).
6. `references/phase-tasks.md`/`phase-implement.md` document the `scope`
   field (array-valued) and both rules, including both degradations, for
   Build authors.
7. `test/frozen-surfaces.test.js`'s `FROZEN` array drops exactly the schema
   and `validate-task.mjs` entries and its header comment is updated (Scope
   item 6), with `ASD19` passing and every other listed frozen surface still
   byte-identical to the branch base.
8. `test/telemetry-side-effects.test.js`'s and `test/validator-contract.
   test.js`'s existing fixtures are updated with `scope` tags (Scope items 7
   and 8) and the full corpus passes with no other fixture regressed.
9. **`docs/specs/2026-07-12-sdlc-portable-validator.md` carries an explicit
   amendment section** naming and superseding its old `CommandCheck` type,
   "no additional properties" line, and extending its fixed cross-field
   error rule-order/pointer scheme to the three new error types (Scope items
   9–10) — the repo never holds two silently-contradictory normative
   Specifications, and `manifestErrors` stays deterministic and
   golden-testable.
10. The landing PR/commit carries a `BREAKING CHANGE:` footer (Scope item 11)
    — the only release-channel signal this change gets, since
    `check-schema-break.mjs` deliberately excludes PV1 by prior design.
11. Full test corpus green; touched files biome-clean; `schemaVersion` stays 1
    per the ratified ADR 0013 amendment.
12. A Specification exists (irreversible track) with falsifiable scenarios
    covering DoD 1–10, reviewed by a plan panel (this doc, converged clean)
    and a spec panel (the Spec doc), both clean before Build.

## Context for the next agent

- Core file: `skills/sdlc/scripts/validate-task.mjs`, `inspectManifest`
  function (read via `read_symbol` before editing — do not re-derive its
  structure from memory; it has five interacting category branches already).
- The design went through **three** plan-panel rounds: round 1 fixed
  scenario-gating; round 2 pivoted from a naming convention (`TESTS_TASK_RE`)
  to an explicit field after both reviewers independently proved the regex
  approach unsound; round 3 fixed the field to be array-valued (not
  single-valued) and clarified enforcement lives in `inspectManifest`, not
  the schema file. Do not resurrect prefix-matching or a single-valued
  `scope` as a "simpler" alternative without re-reading this Plan's
  Rationale in full — every simplification attempted so far has had a real,
  reviewer-proven counter-example.
- The ADR 0013 amendment is ratified (2026-07-24, human:neil): `schemaVersion`
  tracks shape only, stays 1 for this change; acceptance-rule strictness is
  lifecycle-governed, not version-signalled. Do not re-litigate this in Spec
  or Build.
- `docs/validation/*/*.json` under this repo are **uniformly pre-law**: none
  declare `scope` (the field didn't exist), so all fail Rule A once
  re-validated with `tests: required`. Unambiguous — no need to spot-check
  individual files for partial compliance.
- Irreversible track: `review.design: panel` (no reversible override applies)
  → both a Plan panel and a Spec panel run before Build.
- Co-owned dogfood repos affected by this break: `threadsafe/case` and
  `threadsafe/pi-notion` (ADR 0027 amendment) — both pin pre-break and
  re-author as their own coordinated follow-up; neither is this slice's job.
