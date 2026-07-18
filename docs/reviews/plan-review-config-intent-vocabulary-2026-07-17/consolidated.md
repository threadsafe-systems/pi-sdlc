# Consolidated plan review — config intent vocabulary (2026-07-17)

- Artifact: `docs/plans/2026-07-17-config-intent-vocabulary.md` (rev 1)
- Panel: `openai-codex/gpt-5.6-sol:high` (→ `gpt-5.6-sol.md`),
  `zai/glm-5.2:high` (→ `glm-5.2.md`) — capped at 2 by owner instruction;
  floor ≥2 distinct vendors met; author vendor (anthropic) excluded.
- Orchestrating model: anthropic/claude (session agent); adjudication below,
  final adjudicator: project owner (gate approval).
- Outcome: **7 consolidated findings (5 high, 2 medium after merge), all
  incorporated into rev 2. None dismissed.** Stop condition met pending
  owner approval of the rev-2 adjudication decisions.

## Consolidated findings and adjudication

### C1 (high) — no-`lifecycle`-block migration unspecified; `minVendor` deletion breaks the first fixture

sol #1 + glm #1 + glm #2 (strongest cross-model agreement). The repo's own
config has no `lifecycle` block, so `minVendor` (vendor axis,
`resolve-panel.mjs:164,296`) is the *live* floor — `pr_review.minVendor: 3`
would silently fall to a default `panelSize: 2`, and the mapping table has no
row synthesising explicit v3 dials from an absent block.
**Adjudication: incorporated.** Rev 2: `minVendor` maps to
`panels.phases.<phase>.panelSize` (integer preserved); an explicit
absent-block synthesis row enumerates the full default expansion in v3
vocabulary; the vendor→model-identity axis change is named, with the Spec
required to prove outcome-equivalence for the migrated roster or refuse.

### C2 (high) — `review.design` cannot express `plan_review ≠ spec_review` on the same track

sol #2 + glm #6. Valid v2 shape (`lib.mjs:407-414`) with no v3 home;
track-keyed overrides don't restore per-gate splits.
**Adjudication: incorporated as a refusing residue, not a new key.**
Splitting the dial back into per-gate homes would resurrect the complexity
v3 exists to remove; no preset ever produces the divergent shape. Rev 2
names it in the binding refusal enumeration with its remediation. (Owner may
overrule toward per-gate overrides at the gate.)

### C3 (high) — the evidence opt-in bit is erased before OL-B can read it

sol #3. OL plan's Binding migration decision keys evidence obligations to
lifecycle-block *presence*; v3's always-explicit shape destroys that bit
before OL-B ships, and the plan forbids provenance keys.
**Adjudication: incorporated.** Rev 2: v3 defines an explicit `evidence`
opt-in key (exact grammar an IC-A Spec decision); migration writes it from
lifecycle-block presence; OL-B completes its semantics. The key is
load-bearing from day one (checker-facing), not provenance.

### C4 (high) — the CONFIG.md drift check cannot be an appended FS9 check id this stream

sol #4. ADR 0017 freezes FS9 ids behind an explicit schema bump owned by
OL-B; rev 1 proposed appending anyway while scoping FS9 v2 out.
**Adjudication: incorporated.** Rev 2: the sync check is a standalone
non-FS9 surface (`setup-sdlc --check-explain`, plus an optional CI snippet);
`check-lifecycle` is untouched this stream; OL-B may fold it into FS9 v2 on
ADR 0017's terms later.

### C5 (high) — "every key load-bearing" vs keys whose only reader is SKILL prose

sol #5 + glm #4. `publishToTracker` (and kin) are read only by
validation/setup (`lib.mjs:357-359`); the operative behaviour is hardcoded
SKILL prose ("two or more tasks", `SKILL.md:202`), and OL-C is scoped out —
so DoD 2 as written rejects keys the plan preserves.
**Adjudication: incorporated.** Rev 2: the audit table admits exactly two
reader kinds — mechanical (script:line) and prose-law (a SKILL sentence that
instructs reading the committed value) — and IC-A includes the minimal,
surgical prose re-pointing (hardcoded constants → config values) needed so
every v3 key has a real reader. This is not the OL-C restructure; the
boundary is stated in scope.

### C6 (medium) — preset application via whole-file `--force` loses consumer-owned keys; `overrides.none` hole

sol #6 + sol #7 (merged: both are "the amendment/sketch under-specifies a
guardrail"). `assembleConfig` + `--force` rewrites the whole file
(`setup-sdlc.mjs:111-123,555-574`); the override grammar never forbids a
`none` key.
**Adjudication: incorporated.** Rev 2: preset application on an existing
valid config patches only the intent blocks (`review`/`shape`/`overrides`),
preserving identity/integration/`panels` keys — `--force` whole-file
replacement remains a separate, explicit act. Override keys are bound to
exactly `irreversible`/`reversible`; DoD gains the negative fixture
(`overrides.none` ⇒ `config.valid` error, exit 2).

### C7 (medium) — vestigial `excludeAuthorVendor`; missing `task_validate` floor row; telemetry call-site coupling

glm #3 + glm #5 + glm #7 (merged: mapping-table/risk completeness). The
lifecycle branch never reads `excludeAuthorVendor` (`resolve-panel.mjs:165`
vs `:257`); the OL-A fixed-1 `task_validate` floor (`resolve-panel.mjs:233-237`)
has no mapping row; lt-t2 will embed `record-run-event` calls in the very
scripts IC-A rewrites.
**Adjudication: incorporated.** Rev 2: `excludeAuthorVendor` deleted with no
successor (exclusion stays derived from floor ≥ 2) and added to the DoD 1
purge; a `task_validate` mapping row preserves the fixed-1 rule
(`minVendor: 1` → `panels.phases.task_validate.panelSize: 1`); the telemetry
risk names the embedded call-site contract for whichever stream lands second.

## Reviewer CLEAR notes (recorded, no action)

Both reviewers independently confirmed: track classification correct
(irreversible, package major, ADR 0021 guard exists and recognises the
`BREAKING CHANGE:` footer); kernel safety structurally holds (no `review.*`
key on the merge gate; `defaultTrack` excludes `none`); ADR 0022 semantics
preserved under the rename.
