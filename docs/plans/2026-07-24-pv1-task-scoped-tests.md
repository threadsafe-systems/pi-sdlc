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
  from luna. All six converge on one root cause — see Rationale — and are
  incorporated below as a design pivot, not another patch.

## Objective

Today a PV1 manifest satisfies its `tests` category and any scenario's test
evidence by pointing at a single whole-suite check. The validator's only
inference is "did the suite run" — there is no visibility into *which* tests a
task actually introduced or modified to earn its scenario evidence, and (round
2 finding) no *mechanically reliable* way to tell a broad regression check
apart from a narrow one by naming convention alone.

Add an explicit, optional per-check manifest field, `scope: "full" | "task"`.
Require: (a) whenever a manifest's `tests` category is required, at least one
of its declared checks carries `scope: "full"` — a regression net is
mechanically guaranteed present, not inferred from a naming pattern; (b)
whenever an owned scenario's evidence cites any `tests`-category check at all,
at least one of the cited checks must carry `scope: "task"` — scenario
evidence can no longer rest solely on the full-suite check. A scenario
evidenced purely by non-test categories, or a manifest with no owned
scenarios, or a manifest with `tests: n/a`, is unaffected.

## Rationale

- **Structural, not judgement-based.** `task_validate`'s mandate
  (`skills/sdlc/prompts/validator-task.prompt.md`) is explicitly mechanistic —
  no quality opinions, no diff review, judgement is the PR panel's job. This
  slice does not ask the validator to check that the declared task-scoped
  tests *correspond* to the diff. It makes the right evidence land in the
  receipt for free: the `scope: "task"` check's exact argv and stdout tail
  (naming the specific tests that ran) is already captured by the existing
  evidence-bounding/redaction pipeline once the check is declared. A human, or
  the PR panel (which *is* mandated to judge), can eyeball it.
- **Why an explicit field, not a naming convention (the round-2 pivot).** The
  original design (v1, fix-wave 1) used a reserved id prefix
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
    that simply happens not to be named with the reserved prefix. A rule
    inferring "broader check present" from mere absence-of-prefix is
    satisfiable by another narrow check under a different name, which proves
    nothing about regression coverage.
  - Both findings share one root cause: inferring semantic role (full vs.
    task-scoped) from an id's *spelling* is unreliable — a manifest author's
    naming choices, not the check's actual scope, drive whether the law's
    intent is honored. An explicit field removes the inference entirely: the
    author states the scope directly, `inspectManifest` reads it directly, no
    naming convention to satisfy by accident or violate by accident. This
    also cleanly resolves gemini's redundant-rule finding: dropping the
    separate existence rule (former Rule A2) in favor of Rule B alone (now
    keyed on `scope: "task"` instead of a regex) is *only* safe once
    existence is unambiguous — with a spelling-based rule, dropping A2 would
    have reopened a gap the field closes for free (Rule B's own "must cite a
    `scope: "task"` check" already forces existence exactly when a scenario
    needs it, no separate rule required).
  - **Portability preserved.** The field, not the id, carries meaning — a
    consuming repo names its checks however its own tooling dictates
    (`tests.contract`, `unit-fast`, `pytest-marked-foo`, anything); it only
    needs to add `"scope": "full"` or `"scope": "task"` to the relevant check
    objects. This is the same portability goal the original naming-prefix
    design was reaching for, achieved with a mechanism that can't be
    accidentally satisfied or violated by an unrelated id.
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
  agree. Per ADR 0027's already-established policy this ships as a
  **coordinated clean break with no migrator**: this repo hand-authors the
  landing change; each co-owned repo re-authors its own manifests as a
  follow-up while pinning the pre-break skill release until it does. That
  coordinated re-author — not a forced lockstep bump in this PR — is the
  policy's own "equivalently honest forward path"; no new coordination
  mechanism is invented here.

## Scope

**In:**
1. `skills/sdlc/schema/task-validation-manifest.schema.json`: add an optional
   `scope` property to each `checks[]` item, `enum: ["full", "task"]`. Purely
   additive at the JSON Schema level (an optional enum field), consistent with
   PV1 staying `schemaVersion: 1`. This is a genuine shape addition (unlike
   the round-1 design's regex rules, which were cross-field semantics that
   don't belong in a shape schema) and is added to the schema directly, not
   deferred — resolves round-2 luna's "schema enforcement left unresolved"
   finding by making the split explicit: `scope` is schema-enforced shape;
   the counting/mapping rules below (which checks' scopes satisfy which
   category) stay `inspectManifest`-only, matching the existing precedent
   that every other cross-category rule in `inspectManifest` (e.g. "every
   declared check referenced by at least one required category") is
   inspect-only, not schema-expressed.
2. `inspectManifest` (`validate-task.mjs`): two structural rules (down from
   three — the round-1 "Rule A2" is deleted per Rationale, not replaced).
   - **Rule A** (unconditional whenever tests apply, scenarios or not): when
     `categories.tests.applicability === "required"`, at least one of the
     checks referenced by that category's `checkIds` must have
     `scope === "full"`.
   - **Rule B** (evidence-mapping, gated on owning scenarios): when
     `categories.scenarios.applicability === "required"`, for every owned
     scenario's evidence array, restrict to ids that are also referenced by
     the `tests` category's `checkIds`; if that restricted set is non-empty,
     at least one of those *checks* must have `scope === "task"`. (A scenario
     evidenced purely by non-test categories is unaffected — the restricted
     set is empty, so the rule is vacuous for it, by construction, not by a
     special-cased exemption.)
   - Degradation: a manifest with **zero owned scenarios** is unaffected by
     Rule B entirely (never asked to declare or cite a `scope: "task"`
     check), but remains subject to Rule A whenever `tests: required`. A
     manifest with `categories.tests: n/a` is unaffected by both rules.
     `scope` is optional and absent-by-default; an unclassified check
     (`scope` omitted) satisfies neither rule — it is simply invisible to
     both counts, never an error on its own.
3. `references/phase-tasks.md` / `references/phase-implement.md` (both under
   `skills/sdlc/`): document the `scope` field and Rules A/B, including the
   zero-scenario and `tests: n/a` degradations, as part of Build's manifest
   authoring guidance.
4. `skills/sdlc/prompts/validator-task.prompt.md`: no mandate change
   (confirmed unnecessary per Rationale) — confirm in Build whether its
   "Checks" list needs a one-line note that a `scope: "task"` check's result
   is reported the same as any other declared check (it already reports every
   command by id; likely no change needed).
5. Compatibility note for **existing** manifests in this repo
   (`docs/validation/*/*.json`), stated honestly this time: the `scope` field
   does not exist before this change, so **no historical manifest declares
   it** — every manifest with `tests: required` fails Rule A on its first
   re-validation after upgrade, unconditionally, with no partial-compliance
   exceptions to hunt for. This is a clean break exactly as ADR 0027
   anticipates: unambiguous, not a spectrum of edge cases. Historical receipts
   are not retroactively re-validated (`verify-task-receipt.mjs` only
   hash-checks self-consistency, never re-runs `inspectManifest`), so nothing
   already merged is affected; the law applies to manifests authored from this
   change forward.
6. Regression tests in `test/portable-validator.test.js` (or wherever PV1/PV2
   tests live — confirm exact file in Build) for both rules: positive
   (a compliant manifest with a `scope: "full"` check, and separately one
   with both `scope: "full"` and `scope: "task"` checks plus scenario
   evidence citing the task-scoped one, both pass); negative (Rule A: `tests:
   required` with checks but none `scope: "full"`; Rule B: a scenario's
   evidence citing only a `scope: "full"` or unscoped check); the zero-
   scenario degradation (Rule B doesn't fire, Rule A still does); the `tests:
   n/a` degradation (neither fires); and the case that motivated the pivot —
   an unscoped or `scope`-mismatched check with a name that *looks* like it
   should count (e.g. an unscoped check literally named `tests.full`) must
   **not** satisfy Rule A — only the field counts, never the spelling.

**Out:**
- Any diff-correspondence judgement capability in `task_validate` (rejected in
  Brainstorm Finding 2).
- A full inventory/audit of every historical manifest under
  `docs/validation/` classified against the new rules (per the corrected
  compatibility note, the classification is now uniform — none declare
  `scope` — so no per-file audit has anything to discover).
- Any change to `schemaVersion` (stays 1 — `scope` is an additive optional
  field; the manifest *shape* is backward compatible even though the
  *acceptance rules* built on top of it are not — Spec should state this
  distinction precisely, as it is the crux of the irreversible
  classification).
- Coordinating a simultaneous change to `threadsafe/case` or
  `threadsafe/pi-notion` beyond what ADR 0027's existing coordinated-clean-
  break policy already prescribes (see Rationale) — no new coordination
  mechanism is invented here.
- A migration path for `TESTS_TASK_RE` or any other artifact of the
  abandoned round-1 naming-convention design — it never shipped past this
  Plan doc, so there is nothing to migrate away from.

## Definition of done

1. `skills/sdlc/schema/task-validation-manifest.schema.json` accepts an
   optional `scope: "full" | "task"` property on each `checks[]` item, rejects
   any other value, and requires nothing new of manifests that omit it.
2. `inspectManifest` rejects a manifest with `categories.tests: required`
   whose referenced checks include no `scope === "full"` check (Rule A) —
   including the case where an unscoped or wrongly-scoped check merely has a
   name that looks like a full-suite check.
3. `inspectManifest` rejects a manifest with `categories.scenarios: required`
   where any scenario's evidence cites a `tests`-category check but none of
   those cited checks has `scope === "task"` (Rule B).
4. A manifest with `categories.tests: n/a` is unaffected by both rules; a
   manifest with zero owned scenarios is unaffected by Rule B but remains
   subject to Rule A (regression-tested, including the spelling-vs-field
   case from Scope item 6).
5. `references/phase-tasks.md`/`phase-implement.md` document the `scope`
   field and both rules, including both degradations, for Build authors.
6. Full test corpus green; touched files biome-clean; `schemaVersion` stays 1.
7. A Specification exists (irreversible track) with falsifiable scenarios
   covering DoD 1–4, reviewed by a plan panel (this doc, converged clean) and
   a spec panel (the Spec doc), both clean before Build.

## Context for the next agent

- Core file: `skills/sdlc/scripts/validate-task.mjs`, `inspectManifest`
  function (read via `read_symbol` before editing — do not re-derive its
  structure from memory; it has five interacting category branches already).
- The design landed here after two plan-panel rounds pivoted away from a
  naming-convention approach (`TESTS_TASK_RE`) that both reviewers
  independently proved unsound — do not resurrect prefix-matching as a
  "simpler" alternative in Spec/Build without re-reading this Plan's
  Rationale; the counter-examples (`pv-t1.json`'s `tests.contract`, and the
  static-scenario redundancy case) are real and already verified against this
  repo's own history.
- `docs/validation/*/*.json` under this repo are **uniformly pre-law**: none
  declare `scope` (the field didn't exist), so all fail Rule A once
  re-validated with `tests: required`. This is now unambiguous — no need to
  spot-check individual files for partial compliance as earlier drafts of
  this Plan incorrectly assumed.
- Irreversible track: `review.design: panel` (no reversible override applies)
  → both a Plan panel and a Spec panel run before Build.
- Co-owned dogfood repos affected by this break: `threadsafe/case` and
  `threadsafe/pi-notion` (ADR 0027 amendment) — both pin pre-break and
  re-author as their own coordinated follow-up; neither is this slice's job.
