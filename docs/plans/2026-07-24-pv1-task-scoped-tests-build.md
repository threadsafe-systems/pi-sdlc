# Build: PV1 task-scoped test declaration (`scope` field)

Upstream: `docs/plans/2026-07-24-pv1-task-scoped-tests.md` (Plan) +
`docs/specs/2026-07-24-pv1-task-scoped-tests.md` (Spec, approved 2026-07-25,
human:neil). Irreversible track, separate Spec. Scenario ids `TST1`–`TST19` are
the acceptance surface, pulled from the Spec, never re-derived here.

Three tasks — at/above `shape.publishToTracker` (2) → published as a tracker
epic + 3 sub-issues on board 5. The committed doc stays canonical.

## Cut-over note (bootstrap, mirrors base Spec §5.1)

**T1 is the cut-over task.** Once its offline checks pass, the in-worktree
`inspectManifest` enforces Rule A/Rule B. From that point every task manifest in
this slice (T1's own included, dispatched after its code lands, and T2/T3) must
carry `scope` tags and satisfy Rule A/Rule B — this slice **dogfoods** the field
it introduces. Each task therefore declares a `scope: ["full"]` regression check
and tags its task-specific test check `scope: ["task"]` (or one check
`scope: ["full","task"]` where the full suite is the task evidence).

## Ownership map (every Spec scenario is owned or explicitly PR-phase)

- **T1:** TST1, TST2, TST3, TST4, TST5, TST6, TST7, TST8, TST9, TST10, TST11, TST12, TST14
- **T2:** TST13, TST18, TST19
- **T3:** TST15, TST16
- **PR phase (not a Build task):** TST17 — the PR-body/title breaking signal is a
  PR-open-time action, not a runner-checkable per-task scenario (Spec §10; Plan
  DoD 11). Carried to `phase-pr-review` and asserted at PR open, deliberately
  unowned by a task manifest (same class as base-spec PV12's process scenario).

## T1 — validator core: FROZEN reopening, schema field, Rules A/B

**Objective:** implement Spec §1–§5 (the `scope` field, its shape validation,
Rule A, Rule B, the degradations, and the deterministic pointers/ordering) and
DoD 1–5, 10. This is one cohesive unit: the schema and `validate-task.mjs` are
the two ASD19-frozen surfaces, so reopening them and editing them belong
together in one task.

**Scope of work:**
- `test/frozen-surfaces.test.js`: remove **exactly** the two entries
  `skills/sdlc/schema/task-validation-manifest.schema.json` and
  `skills/sdlc/scripts/validate-task.mjs` from `FROZEN` (no others), with an
  inline comment naming this Plan/Spec as the deliberate reopening; update the
  file header comment so its prose matches the array (Spec §8; TST14).
- `skills/sdlc/schema/task-validation-manifest.schema.json`: add optional
  `scope` to each `checks[]` item —
  `{"type":"array","items":{"enum":["full","task"]},"minItems":1,"uniqueItems":true}`
  (Spec §1.1; TST12). `additionalProperties:false` stays satisfied by naming it.
- `skills/sdlc/scripts/validate-task.mjs` (`inspectManifest`): read via
  `read_symbol` first. Add `"scope"` to the per-check unknown-property allowlist
  (currently `["id","argv","timeoutMs","evidence"]`). Add, via the existing
  `add(pointer,message)`/`sortAndFormat()` path only:
  - **scope shape** at `/checks/<i>/scope`: non-empty array, entries each
    `"full"`/`"task"`, unique (Spec §1.1; TST10).
  - **Rule A** at `/categories/tests`: when `tests` required, ≥1 referenced
    check has `scope` including `"full"` (Spec §2; TST1, TST4, TST9).
  - **Rule B** at `/categories/scenarios/evidence/<escaped-id>`: when
    `scenarios` required, per owned scenario, restrict evidence to `tests`
    `checkIds`; if non-empty, ≥1 must include `"task"` (Spec §3; TST2, TST5).
  - **Co-occurring-error predicate** (Spec §4): shape-invalid `scope` counts as
    absent; Rules A/B always evaluate and stack, never suppress (TST11).
  - **Degradations** (Spec §4): `tests:n/a` exempt from both; zero scenarios
    exempt from Rule B only (TST6, TST7, TST8).
- `test/validator-contract.test.js` (PV1 contract suite — not frozen): add the
  new-rule tests — TST1/2/3 positive, TST4/5 negative (lead with in-process
  `inspectManifest` `manifestErrors` assertions; the verdict/zero-command
  corollary via the CLI wrapper is a bounded temp-dir add-on per Spec §12),
  TST6/7/8 degradations, TST9 spelling-vs-field, TST10 shape table, TST11
  **golden multi-error ordering** (scope-shape + Rule A + dangling-check
  co-occurring; byte-exact array in pure lexicographic `(pointer,message)`
  order, pinning the §4 predicate).

**Checks (manifest, dogfooding `scope`):**
- `tests.full` `scope:["full"]` — `npm test` (the regression net, satisfies Rule A).
- `tests.scope` `scope:["task"]` — `node --test test/validator-contract.test.js` (T1's new scenarios).
- `tests.frozen` `scope:["task"]` — `node --test test/frozen-surfaces.test.js` (TST14, ASD19).
- `static.lint` — `npx biome check` on the touched files.

**Scenario ids:** TST1, TST2, TST3, TST4, TST5, TST6, TST7, TST8, TST9, TST10,
TST11, TST12, TST14. Evidence: TST1–TST12 → `tests.scope`; TST14 → `tests.frozen`
(TST12's schema-layer assertion co-runs in the same suite).

## T2 — fixture reconciliation, version guard, full corpus green

**Objective:** implement Spec §11 (schemaVersion stays 1) verification and DoD 8,
12; keep the whole corpus green under the new rules. **Blocked by T1** (the rules
must exist before fixtures regress).

**Scope of work:**
- `test/telemetry-side-effects.test.js`: tag the dual-role check in
  `passManifest()`/`failManifest()` `scope:["full","task"]` (Spec §10 fixture
  case; Plan Scope 7) so LT8 stays PASS/FAIL, not manifest-error.
- `test/validator-contract.test.js`: tag `baseManifest()`'s dual-role check (and
  any inline `checks`-redefining variants) `scope:["full","task"]` (Plan Scope 8)
  so the contract suite stays green.
- Confirm no other corpus fixture regresses (`test/reference-contract.test.js`
  and any manifest-constructing test) — Spec §11/§13 say the 53 historical
  `docs/validation/*` manifests are never re-validated by the corpus; verify.
- Verify `schemaVersion` stays `1` in every produced/edited manifest (TST18).

**Checks (manifest):**
- `tests.full` `scope:["full"]` — `npm test` (whole corpus green; TST13, TST19).
- `static.lint` `scope:["task"]`? no — `static.lint` — `npm run lint` (TST19 biome-clean).
- `standards.version` `scope:["task"]` — a grep asserting `"schemaVersion": 1`
  across this slice's manifests and the schema (TST18), or n/a with reason if
  folded into the contract suite.

**Scenario ids:** TST13, TST18, TST19. Evidence: TST13/TST19 → `tests.full`;
TST18 → `standards.version` (or `tests.full` if the schemaVersion assertion is a
contract-suite test).

## T3 — documentation & normative reconciliation

**Objective:** implement Spec §7 and §9 and DoD 6, 9, 13. Docs-only; can run in
parallel with T1/T2 (no frozen-surface or code dependency), though its cited
rule text should match the landed §1–§5 behaviour.

**Scope of work:**
- `docs/specs/2026-07-12-sdlc-portable-validator.md`: add an explicit amendment
  section (extend-not-overwrite, mirroring the ADR 0013 amendment) naming and
  superseding: (a) §1.2 `CommandCheck` type (+ optional `scope`); (b) §1.2 "no
  additional properties" line; (c) §1.2 worked-example manifest (tag its
  `tests.contract` check `scope:["full","task"]`); (d) §1.3–1.5 constraint prose
  (add `scope`, Rule A, Rule B, degradations); (e) §2.5 error rule-order &
  pointer scheme (extend to the three new error types; restate ordering as pure
  lexicographic) (Spec §7; TST15).
- `skills/sdlc/references/phase-tasks.md` + `phase-implement.md`: document the
  `scope` field (array-valued, both tags on one check), Rule A/B, both
  degradations, citing the existing "Build human gate" (PR-panel review of the
  manifest) — no new/relocated authority (Spec §9; TST16).
- `README.md` manifest-authoring section (lines 84–107): brief `scope`/Rule A/
  Rule B summary or link to the reference guidance (Spec §9; TST16).

**Checks (manifest):**
- `static.docs` `scope:["full","task"]` — a deterministic grep/link check
  asserting the base-spec amendment section exists and names its five sub-items,
  and that `phase-tasks.md`/`phase-implement.md`/`README.md` each mention
  `scope`/Rule A/Rule B (TST15, TST16). `tests` is `n/a` (docs-only task, reason:
  no behavioural execution), so Rule A does not apply to this manifest.
- `static.lint` — `npx biome check` on any touched non-markdown (likely n/a).

**Scenario ids:** TST15, TST16. Evidence: both → `static.docs`. (Rule B does not
fire: evidence cites a `static`-category check, not a `tests` one — Spec §3/§4;
exercises the TST8 degradation for real.)

## Post-merge follow-up (tracked, NOT part of this PR)

Immediately after this PR merges, open a single-purpose **follow-up PR** touching
only `test/frozen-surfaces.test.js` that re-adds the two removed `FROZEN` entries
(Spec §8; Plan DoD 7). ASD19 diffs against the `main` merge-base, so the re-add
is mechanically impossible within this PR. The slice is **not complete** until
that follow-up PR has merged. Track it as a tracker issue at PR-open time.

## Assumptions (accrue here as Implement proceeds)

- New rule tests are homed in `test/validator-contract.test.js` (the existing PV1
  contract suite), which is not frozen — confirmed the PV1/PV2 tests live there,
  not a `test/portable-validator.test.js` (Plan Scope 13 left the exact file to
  Build).
- `static.lint` per-task scopes to touched files (`npx biome check <files>`)
  rather than repo-wide, to avoid absorbing any unrelated pre-existing repo lint
  debt; T2's `tests.full`/`npm test` still proves whole-corpus green.
- T1's own validation receipt is produced after its code lands (cut-over §5.1
  pattern), so T1's manifest is the first validated under the new Rule A/B.
