# Plan review — sdlc-lifecycle-telemetry (glm-5.2)

Reviewer model: glm-5.2. Scope: adversarial plan review only. Findings are
grounded in the plan text (`docs/plans/2026-07-17-sdlc-lifecycle-telemetry.md`)
and the shipped framework cited as `file:line`.

### FS1 `paths` contradiction: Out forbids what Context offers, and "additive" is false against the shipped validator

- severity: medium
- confidence: high
- location: `docs/plans/2026-07-17-sdlc-lifecycle-telemetry.md:166` (Out) vs `:281-282` (Context) vs `:296` (Context for Spec author)
- defect: The plan's Out line excludes "config schema (FS1/FS2) changes" (`:166`), yet the Context section presents extending FS1 `paths` as a live option the Spec author may pick ("adding keys is FS1-additive territory and the spec must say whether v1 hardcodes or extends `paths`", `:281-282`; "the FS1 `paths` question", `:296`). These contradict: the Out line forecloses the very option the Context leaves open, and the plan's premise that adding a `paths` key is "FS1-additive" is factually wrong against the shipped surface.
- evidence: The config schema freezes `paths` with `"additionalProperties": false` and only `plans/specs/reviews/agents` (`skills/sdlc/schema/sdlc.config.schema.json:30-32`). The hand-rolled validator in `skills/sdlc/scripts/lib.mjs:191` hard-codes `const pathKeys = new Set(["plans", "specs", "reviews", "agents"])` and emits `unknown paths key` (`lib.mjs:194`), so a `paths.retros`/`paths.runs` key is rejected at v1. Adding it therefore requires both a schema edit and a validator edit — it is a surface change, not an additive one — contradicting the "FS1-additive" framing and the Out line.
- impact: A Spec author who trusts the Context's "additive" framing will propose `paths.retros`/`paths.runs` and hit a hard validator/test failure at Build (unknown-key rejection), having violated the Out scope. The plan is incoherent on a load-bearing config decision: where the run store and the committed retro actually live.
- fix: Resolve in the plan, not the spec: state "v1 hardcodes `.pi/sdlc/runs/` and `docs/retros/`; extending FS1 `paths` is out of scope this round" and remove the either/or from Context and the open "FS1 `paths` question" from the Spec-author checklist.

### FS11 normative-reference inventory coverage for the new `sdlc-retro` skill is unnamed

- severity: medium
- confidence: high
- location: `docs/plans/2026-07-17-sdlc-lifecycle-telemetry.md:132` (R5 FS11 claim), `:126` (new skill); ADR 0019; `skills/sdlc/assets/normative-references.json`
- defect: R5 claims "Docs claim only what ships (normative-reference honesty, FS11 discipline)" (`:132`) while introducing a new skill `skills/sdlc-retro/` (`:126`) that will itself carry normative references (to `record-run-event`, `collect`, `render`, the new ADR, the run-store layout). The plan never names that those references must be added to the FS11 inventory, and without them the new skill's broken self-references go undetected.
- evidence: ADR 0019 makes the inventory the discipline ("inventory covers every normative reference in the enumerated generic source files; package-owned targets must exist and occur exactly once"). The shipped inventory (`skills/sdlc/assets/normative-references.json`) enumerates only `skills/sdlc/*` and `README.md` references; it is hand-maintained and the checker verifies only listed entries (it cannot detect omitted sources). The plan's In-scope list (`:147-152`) names the new skill, scripts, and ADR but not an inventory extension.
- impact: A `sdlc-retro/SKILL.md` pointing at a renamed or missing script would ship green under `check-references`, directly undermining the FS11 honesty the plan promises. This is a real dependency the spec/build will hit and the plan does not surface.
- fix: Add to In-scope and DoD: "extend `skills/sdlc/assets/normative-references.json` (additive; no FS11 schema/report-version bump) to cover every package-owned reference in `skills/sdlc-retro/*`; `check-references` passes with the new skill inventoried."

### Five subsystems and two frozen shapes in one spec, with no decomposition signal

- severity: low
- confidence: medium
- location: `docs/plans/2026-07-17-sdlc-lifecycle-telemetry.md` R1–R5 (`:28-152`) and Track header (`:3-7`)
- defect: The plan freezes two stored-record shapes (`events.jsonl` manifest and `run.json`) and spans five subsystems — emitter + run store, harvest step, collector (joining ≥5 sources with LLM classification), deterministic 7-section renderer, plus a new skill, SKILL.md prose hooks, an ADR, and a dogfood retro — each with independent fixtures and error modes, and gives the Spec/Build no sizing or decomposition guidance ("must not choose task boundaries", `:298`).
- impact: The spec will be oversized and the build will decompose ad hoc. Not a blocker — the boundary is coherent — but it is the kind of plan that strains a single spec and warrants a stated intent.
- fix: Either affirm single-spec intent with a sizing note, or flag the collector (R3) and renderer (R4) as separable later phases so Build has a defensible cut.

### "per-model panel precision" depends on parsing prose adjudications with no defined structure

- severity: low
- confidence: medium
- location: `docs/plans/2026-07-17-sdlc-lifecycle-telemetry.md:91` (precision measure), `:274` (parse-ability claim); DoD `:239-241`
- defect: R3 derives "per-model panel precision (findings incorporated ÷ raised)" (`:91`) from `consolidated.md`, whose format is freeform per-finding adjudication prose; the plan asserts the 40+ existing directories are "consistent enough to parse" (`:274`) without pinning a structure, and the DoD tests rollups exist but not precision-parsing fidelity.
- impact: Precision may be uncomputable or silently wrong across the 40+ legacy retros with varying formats. It is soft data but is listed alongside hard rollups; the legacy corpus can silently produce NaN/zero precision.
- fix: Either downgrade precision to "best-effort, coverage-marked when unparseable" in R3, or pin a minimal structured adjudication format the collector can rely on going forward, with a coverage marker for legacy retros.

---

CLEAR: A — every DoD item is mechanically falsifiable (append/interleave fixture, side-effect fixture, doc-presence grep, harvest fixture, schema-validated collect + coverage-marker assertion, byte-identical render, git-ignore + no-network assertion); no DoD item is a bare opinion.
CLEAR: B — each of R1–R5 has a concrete verification path the spec can turn into a falsifiable scenario (events on disk, harvested artifacts under `.pi/sdlc/runs/`, committed `run.json` validated by a JSON schema, self-contained deterministic HTML, committed `docs/retros/<slug>/` artifacts).
CLEAR: D — no ratified brainstorm decision is re-opened; the regenerate-don't-migrate, always-on-tiered-harvest, dashboard-not-deck, and "LLM output is data" decisions are taken as locked inputs. The FS1 tension above is a scope/contradiction defect (Finding 1), not a re-opened ADR.
CLEAR: F — track classification is correct. The plan freezes two stored-record shapes (`events.jsonl` under `.pi/sdlc/runs/` and the distilled `docs/retros/<slug>/run.json`) that downstream tooling binds to; per SKILL.md's iron law (`skills/sdlc/SKILL.md`, "A change is irreversible if it freezes a shape... stored-record shapes") irreversible is the right track, and it correctly mandates plan + spec panels.

```acceptance-report
{
  "criteriaSatisfied": [
    {
      "id": "criterion-1",
      "status": "satisfied",
      "evidence": "Delivered an in-scope adversarial plan review only: 4 ranked findings grounded in plan line numbers and shipped code (lib.mjs:191/194, sdlc.config.schema.json:30-32, ADR 0019, normative-references.json) plus CLEAR lines for attack surfaces A/B/D/F. No scope widening, no implementation, no edits to the plan or codebase."
    }
  ],
  "changedFiles": [
    "docs/reviews/plan-sdlc-lifecycle-telemetry-2026-07-17/glm-5.2.md"
  ],
  "testsAddedOrUpdated": [],
  "commandsRun": [
    {
      "command": "read plan + SKILL.md + ADRs 0001/0016/0019/0020 + lib.mjs + resolve-panel/ensure-panel-agent/validate-task scripts + sdlc.config.schema.json + check-references.mjs + normative-references.json",
      "result": "passed",
      "summary": "Grounded every finding against the shipped framework with file:line citations"
    },
    {
      "command": "grep -n pathKeys / FS1-additive / FS11 / precision parse claims across plan, lib.mjs, schema",
      "result": "passed",
      "summary": "Confirmed FS1 paths hard-codes reject unknown keys (lib.mjs:191-194) and 'additive' framing is false; confirmed FS11 inventory is hand-maintained and does not cover a new skill"
    },
    {
      "command": "git status --porcelain",
      "result": "passed",
      "summary": "Only the new review artifact is untracked; nothing staged, no plan/code edits"
    }
  ],
  "validationOutput": [
    "Review artifact written to authoritative runtime path docs/reviews/plan-sdlc-lifecycle-telemetry-2026-07-17/glm-5.2.md",
    "4 findings: 2 medium (FS1 paths contradiction; FS11 inventory gap), 2 low (single-spec sizing; precision-from-prose). No high/blocker findings.",
    "CLEAR recorded for attack surfaces A (DoD falsifiable), B (outcomes verifiable), D (no locked decision re-opened), F (irreversible track correct)"
  ],
  "residualRisks": [
    "Finding 1 (FS1 paths) and Finding 2 (FS11 inventory) are medium and should be resolved before the Spec gate, but neither blocks the plan from proceeding to spec"
  ],
  "noStagedFiles": true,
  "diffSummary": "Added one review artifact (glm-5.2.md) under docs/reviews/plan-sdlc-lifecycle-telemetry-2026-07-17/; the plan under review and the codebase were left unchanged (review-only/no-edit wins over any progress-writing instructions).",
  "reviewFindings": [
    "medium (high confidence): plan:166 vs :281-282/:296 — FS1 paths Out-vs-Context contradiction plus false 'FS1-additive' premise (shipped validator lib.mjs:191-194 rejects unknown paths keys)",
    "medium (high confidence): plan:132/:126 + ADR 0019 — FS11 normative-reference inventory coverage for the new sdlc-retro skill is unnamed; broken refs would ship green",
    "low (medium confidence): plan R1-R5 — five subsystems + two frozen shapes in one spec with no decomposition signal",
    "low (medium confidence): plan:91/:274 — per-model panel precision relies on parsing freeform consolidated.md prose with no defined structure or fidelity test"
  ],
  "manualNotes": "Reviewer task is read-only on the repo; the sole write is the review artifact at its authoritative runtime path. Findings were derived independently from the plan + shipped code (not from peer review files). Two findings independently corroborate concerns visible in sibling reviewer artifacts, raising confidence. No blockers; recommend the human owner resolve Finding 1 and Finding 2 at the plan panel before the Spec gate."
}
```
