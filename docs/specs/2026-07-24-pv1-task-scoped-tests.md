# Specification: PV1 task-scoped test declaration (`scope` field)

- Date: 2026-07-24
- Governing Plan: `docs/plans/2026-07-24-pv1-task-scoped-tests.md`
- Programme: `docs/plans/2026-07-12-sdlc-lifecycle-hardening.md`
- Track: **irreversible** (tightens acceptance rules of a public contract —
  PV1 — that every adopting repo's committed manifests bind to; see §11).
- Amends: `docs/specs/2026-07-12-sdlc-portable-validator.md` (PV1 contract) —
  the explicit supersession list is §7.
- Human gate: Specification approved by Neil Chambers on 2026-07-24 (pending
  spec panel).
- Frozen surfaces:
  - Introduces one additive optional field, `scope`, to the PV1 `CommandCheck`
    shape; `schemaVersion` stays `1` (§11).
  - Adds two new manifest-acceptance rules (Rule A, Rule B) and one new
    per-check shape rule to `inspectManifest`; no PV2 runner, receipt, output,
    redaction, or exit contract changes.
  - Temporarily reopens exactly two ASD19-frozen surfaces
    (`skills/sdlc/schema/task-validation-manifest.schema.json`,
    `skills/sdlc/scripts/validate-task.mjs`); standing protection is restored
    by a mandatory follow-up PR (§8).

## 0. Summary

A PV1 manifest's `tests`-category checks today carry no declared semantic
role: nothing distinguishes the broad regression net from a task's specific
evidence, and no naming convention can reliably tell them apart. This slice
adds an explicit, optional, array-valued per-check field `scope: ("full" |
"task")[]` and two acceptance rules over it, so that (Rule A) a check
*declared* as the regression net is mechanically guaranteed present whenever
tests are required (its genuineness stays with the same human gate as the
evidence mapping, §9), and (Rule B) a scenario's test evidence must include at
least one check its author declared task-scoped.

The change is **structural, not judgemental**. `task_validate` stays purely
mechanistic (§9): it never checks that a declared task-scoped test actually
corresponds to the diff. It makes the right evidence — the exact argv and
stdout tail of the task-scoped check — land in the receipt for a human or the
PR panel to eyeball. It ships as a coordinated clean break with no migrator
(§11).

## 1. The `scope` field (PV1 shape, additive)

### 1.1 Shape

Each `checks[]` item gains one optional property:

```ts
type CommandCheck = {
  id: string;
  argv: [string, ...string[]];
  timeoutMs?: number;
  evidence: [string, ...string[]];
  scope?: ("full" | "task")[]; // non-empty, unique; added in this slice
};
```

- `scope` is **optional**. Omission is a legal shape (a check may serve
  neither declared role); whether omission is *accepted* is decided by Rules
  A/B (§2, §3), not by the shape layer.
- When present, `scope` is a non-empty array whose entries are each exactly
  `"full"` or `"task"`, with no duplicates. Any other value — non-array,
  empty array, unknown string, non-string entry, or duplicate entry — is a
  manifest error.
- No other PV1 field, category, or the `schemaVersion` value changes.

### 1.2 Semantics of the two tags

- `"full"` declares the check to be (or to include) the broad regression net —
  the check that runs the whole relevant suite, not a task-narrowed selection.
- `"task"` declares the check to be this task's specific test evidence — the
  check whose argv names the tests this task introduced or exercises.
- A single check may legitimately be **both**. A small task where the full
  suite *is* the task-specific evidence tags one check `scope: ["full",
  "task"]` and satisfies both Rule A and Rule B with no duplicate check. This
  array-valued design exists specifically to avoid forcing a meaningless
  duplicate check with identical argv (the failure mode a single-valued field
  would create).

### 1.3 Enforcement point

`scope`'s shape is validated by `inspectManifest` **directly**, alongside the
existing per-check `id`/`argv`/`timeoutMs`/`evidence` validations — not
delegated to the JSON Schema file. `runManifest` (the PV2 runtime path) calls
only `inspectManifest` and never loads the schema at runtime; the schema file
is the documented, externally-consumable mirror of the same rule, validated
against `inspectManifest` only in this repo's own dev/test suite (Ajv). A
malformed `scope` must therefore be rejected by `inspectManifest` on its own,
independent of the schema file.

The schema file
(`skills/sdlc/schema/task-validation-manifest.schema.json`) adds `scope` as
`{"type": "array", "items": {"enum": ["full", "task"]}, "minItems": 1,
"uniqueItems": true}` on each `checks[]` item, purely additively, and keeps
`additionalProperties: false` satisfied by naming the new property.

## 2. Rule A — a declared regression net is mechanically present

**Rule A (manifest-level, unconditional whenever tests apply):** when
`categories.tests.applicability === "required"`, at least one of the checks
referenced by that category's `checkIds` must have a `scope` array that
includes `"full"`.

- Rule A does **not** depend on whether scenarios are required. It fires
  whenever the `tests` category is `required`, scenarios or not.
- A check whose `id` merely *looks* like a full-suite check (e.g. literally
  named `tests.full`) but carries no `scope: [..."full"...]` does **not**
  satisfy Rule A. The field carries the meaning; the spelling never does.
- Rule A guarantees a check is *declared* the regression net; whether its
  `argv` genuinely runs a broad suite is **not** mechanically checked — that
  stays with the same human gate that owns the evidence mapping (§9).
- Only a manifest with `categories.tests.applicability === "n/a"` is exempt
  from Rule A.

## 3. Rule B — scenario test-evidence is task-declared

**Rule B (scenario-level, evidence-mapping):** when
`categories.scenarios.applicability === "required"`, for each owned scenario's
evidence array, restrict it to the ids also referenced by the `tests`
category's `checkIds`. If that restricted set is non-empty, at least one of
those checks must have a `scope` array that includes `"task"`.

- Rule B is evaluated **per owned scenario** and is vacuous for any scenario
  whose restricted set is empty — a scenario evidenced purely by non-`tests`
  categories (e.g. only a `static`-category check) never triggers Rule B, even
  when the `tests` category is required elsewhere in the manifest.
- Rule B and Rule A do not turn off together: Rule B being vacuous for one
  scenario does not exempt the manifest from Rule A. Rule A is a manifest-level
  constraint; Rule B is scenario-level.

## 4. Degradations (normative)

- **`categories.tests: n/a`** — exempt from both Rule A and Rule B.
- **Zero owned scenarios** (`categories.scenarios: n/a`) — exempt from Rule B
  (never asked to declare or cite a `"task"` check), but still subject to Rule
  A whenever `tests: required`.
- **`scope` absent, or a check simply not referenced by the relevant
  category** — satisfies neither rule; it is invisible to both counts and is
  not itself an error. Errors arise only when a rule that *does* fire finds no
  qualifying tagged check.
- **Evaluation under co-occurring errors.** Rule A and Rule B consider only
  *declared* checks reachable through the relevant category's `checkIds`; a
  check whose `scope` is shape-invalid counts as **absent** for both rules (it
  contributes no valid `"full"`/`"task"` tag). Rules A/B always evaluate and
  **stack** their errors with any co-occurring reference/shape errors rather
  than suppressing or being suppressed by them — e.g. a required `tests`
  category whose only check is both dangling and, once declared, untagged
  yields both the dangling-check error and the Rule A error. The accumulated
  errors are then ordered by §5's single lexicographic sort.

## 5. Error reporting: pointers and deterministic ordering

The three new error conditions route through `inspectManifest`'s existing
`add(pointer, message)` / `sortAndFormat()` mechanism — the same path every
existing rule uses — never a parallel or bespoke reporter. `sortAndFormat`
sorts the accumulated errors by a single **pure lexicographic** order over
`(pointer, message)`. There is no non-lexicographic "display order" override.

Pointers for the new conditions:

| Condition | Pointer |
|---|---|
| `scope` shape error on check `i` | `/checks/<i>/scope` |
| Rule A failure (no `"full"` among required `tests` checks) | `/categories/tests` |
| Rule B failure for scenario `S` | `/categories/scenarios/evidence/<escaped-S>` |

These mirror the existing per-check field pointers
(`/checks/<i>/id`, `/checks/<i>/argv`, …), the existing category
applicability/reference pointer (`/categories/<name>`), and the existing
"scenario mapped to non-required check" pointer
(`/categories/scenarios/evidence/<escaped-id>`) respectively.

**Ordering clarification (binds the base spec's §2.5 prose, superseded by
§7 here).** The base spec's "fixed rule order and pointer" list is a
**rule-to-pointer catalog** — documentation of which rule emits which pointer
string — **not** a display-order override. The only ordering rule, both within
and across pointers, is the plain lexicographic sort over `(pointer, message)`
that `sortAndFormat` already implements. "Within one pointer, messages sort
lexicographically" describes that single rule, not a narrower carve-out of a
broader non-lexicographic order. The Spec amendment (§7) states this
explicitly so no future reader can reconstruct the earlier ambiguity.

## 6. `task_validate` mandate: unchanged

No change to `skills/sdlc/prompts/validator-task.prompt.md`'s mandate. The
validator subagent stays a mechanistic checklist reporter; it does not judge
whether a `"task"`-tagged check corresponds to the diff — that is the PR
panel's job (§9). The task-scoped check's argv and stdout tail are captured in
the runner's report — written to the receipt via the validator's existing
`--report` invocation, not the validator's markdown summary (which reports only
each check's `id`/status) — where the PR panel reads them. No new mandate text
is needed.

## 7. Amendment to the portable-validator Specification (`2026-07-12`)

This slice does not silently ship a second, contradictory normative document.
`docs/specs/2026-07-12-sdlc-portable-validator.md` gains an explicit amendment
section naming and superseding exactly the following, on the same
extend-not-overwrite pattern the ADR 0013 amendment uses for its base ADR:

1. **§1.2 `CommandCheck` type** — add the optional `scope` member as in §1.1
   here.
2. **§1.2 "No additional properties are allowed at any level in PV1 schema
   version 1"** — this line becomes false as written; the amendment restates
   it as "no additional properties beyond the additive optional `scope`
   member on each `checks[]` item".
3. **§1.2 worked-example manifest** (lines 52–103) — its single unscoped
   `tests.contract` check does double duty as the sole `tests` check and the
   sole scenario evidence, failing both Rule A and Rule B under the new rules.
   The example is corrected to tag that check `scope: ["full", "task"]` so the
   normative example is itself a valid manifest. Correcting it necessarily
   makes it diverge from the still-committed `pv-t1.json` and from all
   pre-law historical manifests — this divergence is the **expected, ratified**
   shape of a clean break (§11), not a defect to reconcile; the historical
   population is explicitly **not** reauthored (§13).
4. **§1.3–1.5 constraint prose** — add the `scope` field constraint (§1.1),
   Rule A (§2), Rule B (§3), and the degradations (§4).
5. **§2.5 error rule-order & pointer scheme** — extend to the three new
   error types (§5) and restate the ordering as pure lexicographic per §5's
   clarification.

The amendment names the exact lines/sections it supersedes; it does not
rewrite the base spec's unrelated PV2 runner, receipt, redaction, or exit
contracts, which are unchanged.

## 8. Frozen-surface reopening and the mandatory follow-up PR

`test/frozen-surfaces.test.js`'s `FROZEN` array (ASD19) currently lists both
`skills/sdlc/schema/task-validation-manifest.schema.json` and
`skills/sdlc/scripts/validate-task.mjs`. ASD19 diffs those paths against the
merge-base with `main`, mechanically blocking this slice's edits.

- This PR removes **exactly those two entries** (no others —
  `validate-task.sh` and `verify-task-receipt.mjs` stay frozen; this slice
  never touches them), with an inline comment naming this Plan/Spec as the
  deliberate reopening, and updates the file's own header comment so the prose
  does not contradict the array's new contents.
- **Removal is not the end state.** ASD19 diffs against the `main` merge-base,
  which only advances once this PR merges; the two entries therefore cannot be
  re-added within this same PR (any content difference from `main` — this PR's
  own purpose — would re-fail ASD19). A small, immediate, single-purpose
  **follow-up PR**, opened right after this one merges and touching only
  `test/frozen-surfaces.test.js`, re-adds both entries, restoring standing
  protection. Leaving the surface permanently unguarded is not an acceptable
  end state; the slice is not complete until that follow-up PR has **merged**.
- The base spec's and config-versioning spec's own "explicitly unchanged
  (frozen)" sections are **not** amended — they are accurate point-in-time
  scope declarations for their own already-merged changes, not a standing law;
  the live definition of what is frozen is the `FROZEN` array alone.

## 9. Documentation surface

- `skills/sdlc/references/phase-tasks.md` and
  `skills/sdlc/references/phase-implement.md` document the `scope` field
  (array-valued, both tags allowed on one check), Rule A, Rule B, and both
  degradations, as Build manifest-authoring guidance.
- The documentation cites the existing authority model without amending it:
  ADR 0013 and the base Spec §1.1/§1.4 already make the scenario-evidence
  mapping Build-canonical and human-gated ("**Human Build approval owns the
  semantic judgement**"), instantiated today as PR-panel review of the
  committed manifest. `scope` adds machine-checkable **data** to a judgement
  that gate already governs; it creates no new decision point and moves none.
  A *mistagged* check is caught by the same human review that already catches a
  *miswired* evidence mapping. No ADR 0013 or base-Spec §1.1/§1.4 authority
  amendment is made (contrast §7, which amends manifest **shape**, not
  authority).
- `README.md`'s manifest-authoring section (lines 84–107, currently silent on
  `scope`) gains a brief `scope`/Rule A/Rule B summary or a link to the fuller
  reference guidance, so a consumer reading only the public README does not
  author a manifest that silently fails the new rules.

## 10. Release signal

`check-schema-break.mjs` does not watch PV1 by prior design (config-schema
only), so the automated guard emits no signal for this change. Under this
repo's squash-merge workflow inner commit footers are discarded, so the only
release-channel signal is the landing **PR title/body**, read by the
`conventionalcommits` semantic-release preset (`.releaserc.json`). Under that
preset — and this repo's `commit-lint` (`scripts/check-commit-messages.mjs`,
which accepts the `!` marker) — two placements are valid breaking signals: a
`type(scope)!:`/`type!:` marker in the **PR title**, or a
`BREAKING CHANGE:`/`BREAKING-CHANGE:` footer line in the **PR body**. (A literal
`BREAKING CHANGE:` *text string in the title* is NOT a signal — the title is
parsed as a header, where only the `!` marker means breaking.) **Either placement
satisfies this change's release-signal requirement** (owner-ratified
2026-07-25). This is a PR-open-time requirement, not merely a commit-authoring
one.

## 11. `schemaVersion`, track, and the clean break

- **`schemaVersion` stays `1`.** Per the ratified ADR 0013 amendment
  (`docs/adr/0013-task-validation-manifest-pv1.md`, 2026-07-24, human:neil),
  `schemaVersion` tracks manifest **shape** (field/category presence, type,
  cardinality) only; acceptance-**rule** strictness is governed by the ordinary
  lifecycle (Plan + Spec + panel), not a manifest-embedded integer. `scope` is
  an additive optional field, so shape is unchanged and `schemaVersion` stays
  `1` correctly, even though the acceptance-rule change is real and breaking.
- **Track is irreversible.** Tightening `inspectManifest`'s rules means a
  manifest that validated cleanly under the old rules can begin failing (a
  `manifest-error`, not a check failure) after a skill upgrade with no change
  to the manifest itself — a breaking change to a public contract adopting
  repos commit to.
- **Coordinated clean break, no migrator.** Per the ratified ADR 0027
  amendment (`docs/adr/0027-pre-adoption-clean-break-policy.md`, 2026-07-24,
  human:neil), the policy extends from config-schema breaks to PV1 manifest
  breaks: the affected population is this repo plus the hand-authorable
  co-owned dogfood repos `threadsafe/case` and `threadsafe/pi-notion`; a
  migrator for that population is disproportionate. This repo hand-authors the
  landing change; each co-owned repo re-authors its own manifests as a
  follow-up while pinning the pre-break skill release until it does.
- **Historical receipts are not retroactively invalidated.** Already-merged
  receipts are hash-verified against their own recorded content
  (`verify-task-receipt.mjs`), never re-run through `inspectManifest`; a past
  PASS stays a past PASS.

## 12. Non-functional requirements and verification cost budget

- **Runtime dependency envelope unchanged.** No new runtime dependency; `scope`
  validation and Rules A/B are pure in-process logic in `inspectManifest`.
- **No new command execution.** All three new checks run at manifest-validation
  time, **before** any declared command is executed; they spawn no child
  process, make no network or model call, and touch no file. The PV2 execution,
  redaction, evidence-bounding, and exit contracts are untouched.
- **Verification cost budget (proportionality).** The `scope`-shape and
  Rule-A/Rule-B logic exercised by §14's scenarios is pure, in-process
  `inspectManifest`/Ajv assertion on an in-memory manifest — no network, no
  model call. The negative scenarios that additionally assert an end-to-end
  *verdict* and *zero commands executed* (TST4, TST5) exercise the thin
  `runManifest`/CLI wrapper on a temp-dir manifest: bounded local file I/O with
  **no** task-command execution and no spawn beyond the existing PV3
  CLI-fixture pattern already in the corpus. TST13 and TST19 are the existing
  corpus-level `npm test`/`npm run lint` gate, unchanged in cost. No scenario
  runs a full external suite as its own gate; the batch adds a bounded,
  negligible increment and introduces **no** new CI-gated or release-time
  expensive path.
- **Determinism.** New error output is fully deterministic under
  `sortAndFormat`'s lexicographic order (§5) and is golden-testable.
- **Formatting.** All touched files stay biome-clean.

## 13. Out of scope

- Any diff-correspondence judgement capability in `task_validate` (§9).
- A full inventory/audit of historical manifests under `docs/validation/` —
  the classification is uniform (none declare `scope`), so no per-file audit
  discovers anything.
- Reauthoring, archiving, or removing any of the existing historical manifest
  files under `docs/validation/` — explicitly declined; doing so would be
  migration effort on the historical population, contradicting the ADR 0027
  clean-break extension. Only the base Spec's worked example (§7) and
  forward-facing guidance (§9) are corrected.
- Any new, separate Build-time gate/ceremony/field for `scope`, and any ADR
  0013 / base-Spec §1.1/§1.4 authority-model amendment (§9).
- Any change to `schemaVersion` (§11).
- Coordinating simultaneous changes to `threadsafe/case` or
  `threadsafe/pi-notion` beyond what ADR 0027's existing policy prescribes.
- A migration path for any artifact of the abandoned naming-convention design
  (it never shipped past the Plan doc).
- Inventing a distinct acceptance-rule version axis (ADR 0013 amendment
  declines to build it speculatively).

## 14. Verification scenarios (falsifiable; `TST<n>`)

All scenarios below are offline and deterministic. `TST1`–`TST3` and
`TST6`–`TST12` assert on `inspectManifest`'s in-process output
(sub-millisecond, no I/O). `TST4`/`TST5` primarily assert `inspectManifest`'s
returned `manifestErrors`, with an end-to-end verdict/zero-command corollary via
the `runManifest`/CLI wrapper on a temp-dir manifest (bounded local file I/O, no
task-command spawn). `TST13` and `TST19` are the existing corpus-level
`npm test`/`npm run lint` gate. `TST14`–`TST18` are artifact/process acceptance
criteria verified by inspection at their named point in the lifecycle (§12).

### TST1 — Rule A satisfied by a `"full"` check
A manifest with `tests: required` whose referenced check carries `scope:
["full"]` passes `inspectManifest` with no `manifestErrors`.
**Falsify:** a `manifestErrors` entry appears, or Rule A fails despite a
`"full"`-tagged check.

### TST2 — separate `"full"` and `"task"` checks satisfy both rules
A manifest with `tests: required` and `scenarios: required`, one check tagged
`["full"]` and a distinct check tagged `["task"]`, an owned scenario citing the
`["task"]` check as evidence — passes with no `manifestErrors`.
**Falsify:** either rule fails when both tags are present on distinct checks.

### TST3 — one `["full","task"]` check satisfies both rules (DoD 4)
A manifest whose single `tests` check is tagged `scope: ["full", "task"]` and
is both the `tests` category's only check and an owned scenario's only evidence
passes with no `manifestErrors` and **no** duplicate check.
**Falsify:** the single dual-tagged check is rejected, or a second duplicate
check is required to pass.

### TST4 — Rule A negative (DoD 2)
A manifest with `tests: required` whose referenced checks include **no**
`"full"`-tagged check makes `inspectManifest` return a manifest error at pointer
`/categories/tests` (asserted in-process on the returned `manifestErrors`);
end-to-end this is verdict ERROR with zero commands executed.
**Falsify:** the manifest passes, or the error is emitted at a different
pointer, or a command runs.

### TST5 — Rule B negative (DoD 3)
A manifest with `scenarios: required` where an owned scenario's evidence cites
a `tests`-category check but **none** of those cited checks is `"task"`-tagged
(e.g. cites only a `["full"]`-only check) makes `inspectManifest` return a
manifest error at `/categories/scenarios/evidence/<escaped-id>` for that
scenario (asserted in-process on `manifestErrors`); end-to-end verdict ERROR.
**Falsify:** the manifest passes, or the error pointer is wrong, or a command
runs.

### TST6 — `tests: n/a` degradation (DoD 5)
A manifest with `categories.tests.applicability === "n/a"` is unaffected by
both Rule A and Rule B and passes on its other merits.
**Falsify:** Rule A or Rule B fires when `tests` is N/A.

### TST7 — zero-scenario degradation (DoD 5)
A manifest with `scenarios: n/a` (zero owned scenarios) and `tests: required`
passes when a referenced check is `["full"]`-tagged (Rule A only), and fails
Rule A at `/categories/tests` when none is.
**Falsify:** Rule B fires with no owned scenarios, or Rule A is skipped when
scenarios are N/A.

### TST8 — static-only scenario does not trigger Rule B
A manifest with `tests: required` (satisfied by a `["full"]` check, so Rule A
passes) and an owned scenario whose evidence cites **only** a `static`-category
check (no `tests`-category id) **passes** — Rule B is vacuous for that scenario
and must not fire merely because `tests` is required elsewhere.
**Falsify:** Rule B fires for a scenario with no `tests`-category evidence.

### TST9 — spelling never satisfies Rule A (field, not name)
A manifest with `tests: required` whose only referenced check is literally
named `tests.full` but has **no** `scope` tag fails Rule A at
`/categories/tests`.
**Falsify:** a check named `tests.full` (untagged) satisfies Rule A.

### TST10 — `scope` shape validation (DoD 1/2)
For a check, each of these `scope` values is a manifest error at
`/checks/<i>/scope`: a non-array value; an empty array `[]`; an array with a
duplicate entry (`["full","full"]`); an array with an unknown string
(`["broad"]`); an array with a non-string entry.
**Falsify:** any malformed `scope` passes `inspectManifest`, or the error is
emitted at a non-`/checks/<i>/scope` pointer.

### TST11 — golden multi-error ordering (DoD 10)
A single manifest carrying a `scope`-shape error, a Rule A error, and a
pre-existing dangling-check error yields a `manifestErrors` array whose exact
contents and order equal the pure lexicographic sort over `(pointer, message)`.
The golden pins the §4 co-occurring-error predicate: the shape-invalid `scope`
counts as absent for Rule A, and the Rule A error stacks with (neither
suppresses nor is suppressed by) the dangling-check error. The assertion is a
byte-exact golden on the returned array.
**Falsify:** the array order deviates from lexicographic `(pointer, message)`
order, or the co-occurring errors do not stack as the §4 predicate specifies.
(That the new-rule errors route through `add()`/`sortAndFormat()` rather than a
parallel reporter is a code-review property of §5/DoD 10, verified by
inspection — a byte-identical string from any reporter yields the same array,
so it is not gated by this golden.)

### TST12 — schema-layer permissiveness and rejection (DoD 1)
Ajv (dev/test only) accepts a `checks[]` item with a valid `scope` array,
accepts an item omitting `scope`, and rejects `scope` values that are
non-array, empty, non-unique, or contain an out-of-enum string — matching
`inspectManifest`'s independent judgement.
**Falsify:** schema and `inspectManifest` disagree on any `scope` shape case.

### TST13 — existing fixtures updated, corpus green (DoD 8)
`test/telemetry-side-effects.test.js`'s `passManifest()`/`failManifest()` and
`test/validator-contract.test.js`'s `baseManifest()` (and its inline
`checks`-redefining variants) tag their dual-role check `scope: ["full",
"task"]`; the full `npm test` corpus passes with no other fixture regressed
from its prior PASS/FAIL outcome.
**Falsify:** any pre-existing fixture regresses to a manifest error, or the
corpus is not green.

### TST14 — FROZEN reopening and follow-up PR (DoD 7)
`test/frozen-surfaces.test.js`'s `FROZEN` array drops exactly the schema and
`validate-task.mjs` entries (no others), its header comment is updated, ASD19
passes, and every other listed frozen surface stays byte-identical to the
branch base. The slice is not complete until the single-purpose follow-up PR
re-adding both entries has **merged** (§8).
**Falsify:** any additional surface is dropped, ASD19 fails, the header
contradicts the array, or completion is claimed with the follow-up PR unmerged.

### TST15 — base Spec amended, not contradicted (DoD 9)
`docs/specs/2026-07-12-sdlc-portable-validator.md` carries an explicit
amendment section naming and superseding its `CommandCheck` type, its "no
additional properties" line, its worked-example manifest, and its §1.3–1.5
constraint prose, and extending its §2.5 error rule-order & pointer scheme
to the three new error types with the lexicographic-ordering clarification
(§5, §7).
**Falsify:** the repo holds two silently-contradictory normative specs, or any
of the four named sub-items or the error-order extension is missing.

### TST16 — documentation and README updated (DoD 6/13)
`references/phase-tasks.md`, `references/phase-implement.md` document `scope`,
Rule A, Rule B, and both degradations, correctly citing the existing "Build
human gate" (PR-panel review of the manifest) as the governing authority;
`README.md`'s manifest-authoring section gains the `scope`/Rule A/Rule B
summary or link.
**Falsify:** any of these documents is silent on `scope`, or misdescribes the
authority as a new/relocated gate.

### TST17 — release signal on the PR (DoD 11)
The landing PR carries a breaking signal in a form the `conventionalcommits`
preset honours: either a `type(scope)!:`/`type!:` marker in the **PR title**, or
a `BREAKING CHANGE:`/`BREAKING-CHANGE:` footer line in the **PR body**.
**Falsify:** no breaking signal in either honoured form; or the only "signal" is
a literal `BREAKING CHANGE:` *text string in the PR title* (a header, not a
footer note) or an inner commit footer discarded at squash.

### TST18 — `schemaVersion` and ADR amendments (DoD 12)
Every produced manifest keeps `schemaVersion: 1`; the ADR 0013 shape-vs-rule
amendment and the ADR 0027 PV1 clean-break extension are present and
ratified-marked.
**Falsify:** `schemaVersion` changes, or either ADR amendment is missing.

### TST19 — full regression, no paid/network calls (DoD 12)
`npm test` and `npm run lint` pass; all new tests are offline and deterministic
— apart from TST4/TST5's bounded temp-dir `runManifest`/CLI corollary (§12),
they are in-process `inspectManifest`/Ajv assertions; no automated test invokes
a model, network, or full external suite as its gate.
**Falsify:** any regression, lint failure, or paid/network test call.

## 15. Context for Build

- Core file: `skills/sdlc/scripts/validate-task.mjs`, `inspectManifest`
  (read via `read_symbol` before editing — five interacting category branches;
  the per-check unknown-property allowlist currently lists
  `["id","argv","timeoutMs","evidence"]` and must gain `"scope"`). All three
  new checks route through the existing `add(pointer, message)` /
  `sortAndFormat()` mechanism, never a parallel reporter.
- `scope` is decided at manifest-authoring time, reviewed by the existing Build
  human gate instantiated as PR-panel review of the committed manifest — it
  changes no authority (§9). Do not add a new Build gate or field.
- Do **not** resurrect prefix-matching or a single-valued `scope`; both have
  reviewer-proven counter-examples recorded in the Plan's Rationale.
- Do **not** merge this PR without opening the follow-up `FROZEN`-re-add PR the
  moment it lands (§8); the re-add cannot happen in the same PR.
- PV1/PV2 regression tests live under `test/` (`validator-contract.test.js`,
  `telemetry-side-effects.test.js`, and the PV1/PV2 suite — confirm the exact
  home for the new `scope` tests in Build).
