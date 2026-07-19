Task: PR review of branch feat/sdlc-retro-panel-precision (HEAD) in repo root /home/neil/code/threadsafe/pi-sdlc.worktrees/feat-sdlc-retro-panel-precision. TRACK: reversible — a Specification does not exist and must NOT be demanded. Artifact under review: the full diff `git diff main...HEAD`. This closes #118 and reworks the sdlc-retro collector: wave-vs-round identity via harvest-panel.mjs --wave + meta.json sidecar; collect-run.mjs discoverPanels sidecar read + precision join regrouped by (panelPhase,wave,date); render-retro.mjs wave grouping; discoverReviewDirs + buildSoftData accept both <phase>-<slug>-<date> and <phase>-review-<slug>-<date>; optional wave added to telemetry payloads, event.schema.json, run.schema.json, and validateRunJson (allow-not-require). GOVERNING_DOCS: docs/plans/2026-07-19-sdlc-retro-panel-precision.md and docs/plans/2026-07-19-sdlc-retro-panel-precision-build.md. Named review input: pr-body.md incl. its 'Assumptions & discretionary calls' section — scrutinise the keep-both-round-and-wave call and the reversible/additive claim (no run.json v1->v2 bump). Grounding rule: cite file:line for any framework/repo claim; verify backward-compat claims against the actual validator/schema code. Required output: findings only (severity high/medium/low, file:line, one-line remediation) or PASS if none. Do not edit any files.
## Acceptance Contract
Acceptance level: attested
Completion is not accepted from prose alone. End with a structured acceptance report.
Criteria:
- criterion-1: Return concrete findings with file paths and severity when applicable
Required evidence: review-findings, residual-risks
Finish with a fenced JSON block tagged `acceptance-report` in this shape:
Use empty arrays when no items apply; array fields contain strings unless object entries are shown.
`criteriaSatisfied[].status` must be exactly one of: satisfied, not-satisfied, not-applicable.
`commandsRun[].result` must be exactly one of: passed, failed, not-run.
`manualNotes` and `notes` are optional strings; an empty string means no note and does not satisfy `manual-notes` evidence.
```acceptance-report
{
  "criteriaSatisfied": [
    {
      "id": "criterion-1",
      "status": "satisfied",
      "evidence": "specific proof"
    }
  ],
  "changedFiles": [
    "src/file.ts"
  ],
  "testsAddedOrUpdated": [
    "test/file.test.ts"
  ],
  "commandsRun": [
    {
      "command": "command",
      "result": "passed",
      "summary": "short result"
    }
  ],
  "validationOutput": [
    "validation output or concise summary"
  ],
  "residualRisks": [
    "none"
  ],
  "noStagedFiles": true,
  "diffSummary": "short description of the diff",
  "reviewFindings": [
    "blocker: file.ts:12 - issue found, or no blockers"
  ],
  "manualNotes": "anything else the parent should know"
}
```
read: /home/neil/code/threadsafe/pi-sdlc.worktrees/feat-sdlc-re...
read: /home/neil/code/threadsafe/pi-sdlc.worktrees/feat-sdlc-re...
bash: cd /home/neil/code/threadsafe/pi-sdlc.worktrees/feat-sdlc...
# Plan: Retro collector — logical review-wave identity + review-dir naming reconciliation
- **Slug:** `sdlc-retro-panel-precision`
- **Date:** 2026-07-19
- **Track:** reversible (ratified at the design gate; F4 dismissal human-ratified — see below)
- **Status:** rev2, awaiting design gate
- **Closes:** #118
- **Advisory review:** deepseek-v4-pro plan review (2026-07-19, beyond the
  reversible track's human-only gate, at the owner's request). Six findings;
  F1/F2/F3/F5 incorporated into this rev2, F4 dismissed with the owner's
  ratification (additive-narrowing adopted — track stays reversible, `run.json`
  stays v1 with `wave` an additive optional field).
## Objectives
1. **Preserve logical review-wave identity through the retro pipeline.** A run
   whose panel went through fix waves (multiple same-day harvest rounds,
   including infra-replacement dispatches) must retro to **one logical wave per
   review round**, with replacement dispatches attributed to their original
   wave — not counted as extra rounds and not silently dropped.
2. **Make the panel-precision join robust to multi-round streams.** Today the
   join requires exactly one harvested panel directory per `(panelPhase, date)`
   and emits `precision.unparsed` (dropping all precision) otherwise — which
   trips on *every* stream that needed a fix wave, the common case, not an edge
   case.
3. **Reconcile review-directory naming.** Widen the collector's discovery to
   accept both the historical `<phase>-<slug>-<date>` and the now-dominant
   `<phase>-review-<slug>-<date>` forms — in **both** `discoverReviewDirs`
   (directory listing) **and** `buildSoftData`'s phase extraction (the
   `startsWith` companion at `collect-run.mjs:885`, which fails on the
   `-review-` infix independently of the regex) — and add the `-review-` form
   to the spec and PR-review reference as an **explicitly-accepted alternative**
   (additive; the original naming line is preserved, not rewritten).
4. **Close the two recorded lows from #118**: the `<n>` placeholder that names
   two now-distinct numbers in the telemetry command templates, and the
   review-dir discovery pattern not matching a `-review-`-prefixed directory.
## Rationale
- The wave↔label mapping shipped by the `sdlc-question-discipline` stream lives
  only as prose in `consolidated.md`; the collector never consumes it, so a
  retro renders more apparent rounds than logical waves and — worse — the
  precision join's uniqueness requirement drops precision entirely for any
  multi-round day.
- Grounding (this session) established the join-uniqueness failure is the
  common case: `phase-pr-review.md` requires a fresh panel after each fix wave,
  and our own just-shipped stream produced four same-day harvest rounds — the
  exact failure shape.
- The naming mismatch has existed since before the collector was merged: the
  approved Specification (`docs/specs/2026-07-17-sdlc-lifecycle-telemetry.md`)
  and a locking test both fix `<phase>-<slug>-<date>`, while repo practice has
  used `<phase>-review-<slug>-<date>` since 2026-07-14. Both forms coexist in
  `docs/reviews/` today.
## Agreed design (carried from Brainstorm)
**Wave vs round, carried coherently through three stages** (all additive and
backward-compatible — the `panel.*` telemetry payloads already accept extra
optional keys without a schema-version bump, confirmed against
`event.schema.json` and `validatePayload`):
- `harvest-panel.mjs` gains an **optional `--wave <n>`** (a positive integer;
  defaults to the `--round` value when omitted, so every historical harvest and
  every single-round dispatch is unaffected). It writes a small **`meta.json`
  sidecar** — `{ "round": <n>, "wave": <n> }` — alongside `status.json` and
  `events.jsonl` in the harvest directory, and includes `wave` in the
  `panel.harvested` event payload (optional field).
- `collect-run.mjs` `discoverPanels()` reads the sidecar (**absent → `wave =
  round`**, so pre-sidecar harvests degrade cleanly) and carries **both `round`
  and `wave`** on each panel entry, threaded through the `hard` assembly's
  `panels.map` (`collect-run.mjs:1061`) and allowed in `validateRunJson`'s
  panels key guard (**allowed-but-not-required**, so existing `wave`-less v1
  records still validate). The precision join groups by `(panelPhase, wave,
  date)` per the algorithm below. `panelPrecision[]` entries carry `wave`.
  **Precision join algorithm** (resolving F3): for a review directory of a
  given `(panelPhase, date)`, collect its `datedPanels`; take the distinct
  `wave` values among them. If they **all share one wave**, attribute the
  directory's precision to `(panelPhase, wave)`. Emit `precision.unparsed`
  **only when the waves disagree** (a genuine multi-wave same-date ambiguity,
  a narrow edge case) — not, as today, whenever more than one round shares a
  date. A single-panel `(panelPhase, date)` keeps today's behaviour (its lone
  wave defaults to its round).
- `render-retro.mjs` groups dashboard sections by **wave**, collapsing
  same-wave harvest rounds into one section (e.g. "Wave 1" listing its
  constituent rounds as sub-detail) and joining precision on `(panelPhase,
  wave)` — requiring `wave` to be present on the `hard.panels[]` entries per
  the collector change above.
**Naming reconciliation:**
- `discoverReviewDirs`' regex widens to accept both `<phase>-<slug>-<date>` and
  `<phase>-review-<slug>-<date>`, **and** `buildSoftData`'s phase-extraction
  `startsWith` (`collect-run.mjs:885`) is widened to the same two forms —
  without this companion fix the regex widening is inert and every `-review-`
  directory silently yields `precision.unparsed` (F1).
- The spec's review-artifact naming line and `phase-pr-review.md` §5's
  `<phase>-<feat>-<date>` guidance **keep their original wording** and gain the
  `-review-` form as an explicitly-accepted alternative (additive, per the F4
  ratification); the `-review-` form is recommended going forward. Old-style
  directories remain valid and are not retrofitted.
**Doc low:** the telemetry command templates in `system-reference.md` §12 use
distinct placeholders — `<wave>` for the `panel.dispatched`/`panel.consolidated`
round field and the harvest `--wave`, and `<label>` for the harvest `--round`
allocation label — so the two numbers are never conflated in an example.
## Scope
**In:**
- `skills/sdlc/scripts/harvest-panel.mjs` — `--wave` flag, `meta.json` sidecar,
  `wave` in the `panel.harvested` payload.
- `skills/sdlc/scripts/telemetry.mjs` — `wave` as an **optional** payload field
  for `panel.dispatched`/`panel.harvested`/`panel.consolidated` (never added to
  a required list).
- `skills/sdlc-retro/scripts/collect-run.mjs` — `discoverPanels` sidecar read +
  `wave` on panel entries; `discoverReviewDirs` widened regex; **`buildSoftData`
  phase-extraction `startsWith` widened to the `-review-` form (F1)**; precision
  join regrouped by wave per the algorithm above; `wave` threaded through the
  `hard` `panels.map` (line ~1061) and onto `panelPrecision[]`;
  `validateRunJson` updated to allow (not require) `wave` on both `panels[]`
  and `panelPrecision[]` (F2).
- `skills/sdlc-retro/scripts/render-retro.mjs` — wave-grouped rendering.
- `skills/sdlc-retro/schema/event.schema.json` — optional `wave` on the three
  panel events (additive).
- `docs/specs/2026-07-17-sdlc-lifecycle-telemetry.md` — review-dir naming line
  gains the `-review-` form as an accepted alternative (original wording
  preserved, additive per F4); panel-artifact/`meta.json`, the optional `wave`
  field (additive to the **v1** record — no version bump), and the
  `panels.malformed_meta:<phase>` marker added to the closed v1 marker set (F5).
- `skills/sdlc/references/phase-pr-review.md` — §5 naming guidance; harvest
  paragraph gains `--wave`.
- `skills/sdlc/references/system-reference.md` — §12 placeholder split and
  `--wave` in the command templates.
- Tests: `test/telemetry-collect.test.js`, `test/telemetry-collect-soft.test.js`,
  `test/telemetry-render.test.js`, and any harvest-panel/telemetry emitter test.
**Out:**
- Retrofitting historical review directories or run stores to the new naming or
  the sidecar (regex + `wave=round` fallback handle them read-only).
- Any change to the `panel.dispatched`/`panel.consolidated` **required** payload
  fields, a telemetry `EVENT_SCHEMA_VERSION` bump, or a `run.json` **v1→v2**
  bump (the `wave` field is additive-optional to v1, human-ratified 2026-07-19).
- Wiring anything new into CI as a required check.
- The `render-retro` visual design beyond the wave-grouping change (no restyle).
## Definition of done
1. `harvest-panel.mjs --wave` works, defaults to `--round`, and writes
   `meta.json`; omitting it leaves behaviour byte-identical to today for a
   single dispatch.
2. A collector run over a fixture with an infra-replacement dispatch (two
   harvest rounds, one wave) and a multi-wave fix-wave sequence retros to one
   logical wave per review round; **no `precision.unparsed`** for a well-formed
   multi-round day; precision attributed to the correct wave. A well-formed
   multi-round same-wave day joins cleanly; only genuinely disagreeing waves on
   one date emit `precision.unparsed`.
3. `discoverReviewDirs` **and** `buildSoftData` phase-extraction match both
   naming forms; the LT15 discovery test is extended to assert both (and still
   excludes `task-validate-*`), and a fixture with a `-review-` directory
   produces non-empty precision (guarding F1).
4. `render-retro` renders one section per wave, collapsing same-wave rounds;
   `hard.panels[]` carries `wave` and the render join uses it (guarding F2).
5. Spec naming line + `phase-pr-review.md` §5 mandate `-review-`; the two
   telemetry-template placeholders are distinct in `system-reference.md`.
6. `npm test` and `npm run lint` (biome) clean; `validateRunJson` accepts the
   `wave`-bearing shape and the existing render consumer still parses.
## Context for the next agent (incl. parked questions)
- **Parked to Implement:** whether `panelPrecision[].round` is *retained
  alongside* `wave` or *replaced by* it — decide against the render join and the
  `validateRunJson`/`checkKeys` exact-key guard once the render change is
  written; keep both if `render-retro` still needs round-level sub-detail.
- **Parked to Implement:** exact `meta.json` schema-validation posture (a
  malformed sidecar should degrade to `wave=round` and emit the pre-registered
  `panels.malformed_meta:<phase>` coverage marker — F5 — not throw; mirror
  `discoverPanels`' existing tolerant status.json handling). The marker name is
  fixed here; only its emission mechanics are Implement's.
- The LT15 soft-test and the `docs/specs` naming line are the two "locked"
  surfaces this change deliberately re-opens; both are cited in the spec so the
  amendment is traceable.
## Assumptions ratified by approving this plan
1. **Track is reversible** (owner-ratified 2026-07-19 over deepseek's F4): every
   change is additive — optional `wave` (allowed-but-not-required on the v1
   `run.json` record, **no v2 bump**), a `meta.json` sidecar, a widened but
   backward-compatible regex, and an **additive** spec naming note that
   preserves the original frozen line. No persisted record shape is broken and
   every existing v1 record still validates. Under `overrides.reversible`,
   `review.design: human` — this human gate, no plan panel, no separate Spec
   (the spec-doc note is an Implement edit, not a re-gated Spec phase).
2. `wave` stays optional in all telemetry payloads; no dispatch call is forced
   to supply it.
3. Slug `sdlc-retro-panel-precision`; branch `feat/sdlc-retro-panel-precision`.
4. Four-task build (see build plan): harvest+telemetry fields → naming
   regex+spec → collector wave consumption → render-retro grouping.
# Build plan: retro wave-identity + review-dir naming (sdlc-retro-panel-precision)
- **Slug:** `sdlc-retro-panel-precision`
- **Date:** 2026-07-19
- **Track:** reversible — no Specification; tasks map to the approved Plan's DoD.
- **Governing plan:** `docs/plans/2026-07-19-sdlc-retro-panel-precision.md` (rev2,
  human-approved 2026-07-19; deepseek advisory review incorporated)
- **Branch:** `feat/sdlc-retro-panel-precision`
- **Closes:** #118
## Decomposition rationale (assumption-tier, stated inline)
Four tasks. The `wave` field must exist at harvest time (T1) before the
collector can consume it (T3); the naming fix (T2) and the wave consumption (T3)
both edit `buildSoftData`, so they are **sequenced, not parallel**, to keep one
writer per function; render (T4) needs `wave` on `hard.panels[]` from T3. Net
edges: T3 blockedBy T1 **and** T2; T4 blockedBy T3; T1 and T2 start immediately.
Object via a Build correction if this slicing is wrong.
## T1 — Harvest `--wave` flag, `meta.json` sidecar, optional telemetry field
**Objective.** `harvest-panel.mjs` gains an optional `--wave <n>` (positive
integer; **defaults to `--round`'s value**), writes a `meta.json` sidecar
`{ "round": <n>, "wave": <n> }` into the harvest directory, and includes `wave`
in the `panel.harvested` event payload. `telemetry.mjs` `EVENT_PAYLOADS` gains
`wave` as an **optional** field on `panel.dispatched`/`panel.harvested`/
`panel.consolidated` (never added to a required list; `validatePayload` only
checks required fields, so optionality is automatic). `event.schema.json` adds
optional `wave` to those three events (additive; payloads are not
`additionalProperties:false`).
**Satisfies plan DoD:** item 1.
**Checks:** `npm test`; `npm run lint`; `node --check` on the two scripts;
`harvest-panel.mjs --help` parses; a unit assertion that omitting `--wave`
writes `meta.json` with `wave === round` and behaviour is otherwise unchanged.
**Blocked by:** none.
## T2 — Review-dir naming reconciliation (regex + extraction + additive docs)
**Objective.** In `collect-run.mjs`: widen `discoverReviewDirs`' regex to accept
both `<phase>-<slug>-<date>` and `<phase>-review-<slug>-<date>`, **and** widen
`buildSoftData`'s phase-extraction `startsWith` (line ~885) to the same two
forms (F1 — the regex widening is inert without this). Docs (all additive,
per the F4 ratification — original wording preserved): the spec's review-dir
naming line and `phase-pr-review.md` §5 gain the `-review-` form as an
accepted alternative; `system-reference.md` §12 splits the `<n>` placeholder
into distinct `<wave>` / `<label>` and shows `--wave` in the command templates.
**Satisfies plan DoD:** items 3 (naming half), 5.
**Checks:** `npm test`; `npm run lint`; LT15 discovery test extended to assert
both naming forms and still exclude `task-validate-*`; a fixture with a
`-review-` directory yields non-empty precision (guarding F1); grep asserts the
spec/reference retain their original line and gain the `-review-` note.
**Blocked by:** none.
## T3 — Collector wave consumption + precision join regroup
**Objective.** In `collect-run.mjs`: `discoverPanels()` reads the `meta.json`
sidecar (**absent → `wave = round`**; a malformed sidecar degrades to
`wave=round` and emits the pre-registered `panels.malformed_meta:<phase>`
marker — F5 — never throws, mirroring the tolerant status.json handling) and
carries `round` **and** `wave` on each panel entry; thread `wave` through the
`hard` assembly `panels.map` (line ~1061) and onto `panelPrecision[]` (F2);
`validateRunJson` **allows (not requires)** `wave` on both `panels[]` and
`panelPrecision[]` so existing v1 records still validate. Regroup the precision
join by `(panelPhase, wave, date)` per the Plan's algorithm: attribute when the
dated panels share one wave; emit `precision.unparsed` **only when waves
disagree**.
**Satisfies plan DoD:** items 2, 3 (marker), 6.
**Checks:** `npm test`; `npm run lint`; a fixture with an infra-replacement
dispatch (two rounds, one wave) joins with no `precision.unparsed`; a
disagreeing-wave same-date fixture does emit it; a malformed-sidecar fixture
emits `panels.malformed_meta`; `validateRunJson` accepts both `wave`-bearing and
`wave`-less records.
**Blocked by:** T1, T2.
## T4 — render-retro wave grouping
**Objective.** `render-retro.mjs` groups dashboard sections by **wave**,
collapsing same-wave harvest rounds into one section (constituent rounds as
sub-detail) and joining precision on `(panelPhase, wave)` using the `wave`
now present on `hard.panels[]`.
**Satisfies plan DoD:** item 4.
**Checks:** `npm test`; `npm run lint`; a render test over a multi-round
one-wave fixture produces one section per wave (not per round) with the
precision joined.
**Blocked by:** T3.
## Assumptions (appendix — accrues during Implement; copied into the PR body)
- (build-time) Four-task slicing and the T3-blockedBy-{T1,T2}, T4-blockedBy-T3
  edges, per the decomposition rationale above.
## Tracker projection
Threshold met (4 tasks ≥ `shape.publishToTracker: 2`): one epic (`sdlc:epic`)
- four sub-issues (`sdlc:build-task`) on board 5, edges as above. This doc
remains canonical; the tracker is a projection.
 .../2026-07-19-sdlc-retro-panel-precision-build.md | 108 ++++
 .../plans/2026-07-19-sdlc-retro-panel-precision.md | 200 ++++++++
 .../generated-agent.md                             |  48 ++
 .../manifest.json                                  |  58 +++
 .../receipt.json                                   |  12 +
 .../runner-report.json                             | 178 +++++++
 .../validator.md                                   | 571 +++++++++++++++++++++
 .../generated-agent.md                             |  48 ++
 .../manifest.json                                  |  53 ++
 .../receipt.json                                   |  12 +
 .../runner-report.json                             | 157 ++++++
 .../validator.md                                   | 513 ++++++++++++++++++
 .../generated-agent.md                             |  48 ++
 .../manifest.json                                  |  58 +++
 .../receipt.json                                   |  12 +
 .../runner-report.json                             | 179 +++++++
 .../validator.md                                   | 569 ++++++++++++++++++++
 .../generated-agent.md                             |  48 ++
 .../manifest.json                                  |  48 ++
 .../receipt.json                                   |  12 +
 .../runner-report.json                             | 140 +++++
 .../validator.md                                   | 529 +++++++++++++++++++
 docs/specs/2026-07-17-sdlc-lifecycle-telemetry.md  |   5 +-
 docs/validation/sdlc-retro-panel-precision/t1.json |  58 +++
 docs/validation/sdlc-retro-panel-precision/t2.json |  53 ++
 docs/validation/sdlc-retro-panel-precision/t3.json |  58 +++
 docs/validation/sdlc-retro-panel-precision/t4.json |  48 ++
 skills/sdlc-retro/schema/event.schema.json         |  19 +-
 skills/sdlc-retro/schema/run.schema.json           |   2 +
 skills/sdlc-retro/scripts/collect-run.mjs          |  55 +-
 skills/sdlc-retro/scripts/render-retro.mjs         |  38 +-
 skills/sdlc/assets/normative-references.json       |   2 +-
 skills/sdlc/references/phase-pr-review.md          |   4 +-
 skills/sdlc/references/system-reference.md         |  24 +-
 skills/sdlc/scripts/harvest-panel.mjs              |  36 +-
 skills/sdlc/scripts/telemetry.mjs                  |  16 +
 test/telemetry-collect-soft.test.js                | 102 ++++
 test/telemetry-collect.test.js                     |  42 +-
 test/telemetry-harvest.test.js                     |  38 ++
 test/telemetry-render.test.js                      |  21 +
 40 files changed, 4176 insertions(+), 46 deletions(-)
bash: cd /home/neil/code/threadsafe/pi-sdlc.worktrees/feat-sdlc...
bash: cd /home/neil/code/threadsafe/pi-sdlc.worktrees/feat-sdlc...
+    }
+  ],
+  "categories": {
+    "tests": { "applicability": "required", "checkIds": ["tests.full"] },
+    "static": { "applicability": "required", "checkIds": ["static.lint", "static.check-harvest", "static.check-telemetry", "static.schema-valid"] },
+    "scenarios": { "applicability": "n/a", "reason": "Reversible track: no Specification; T1 maps to approved plan DoD item 1 per the build plan's T1 check table." },
+    "standards": { "applicability": "required", "checkIds": ["standards.wave-optional"] },
+    "bannedPatterns": { "applicability": "required", "checkIds": ["patterns.diff"] }
+  }
+}
diff --git a/docs/validation/sdlc-retro-panel-precision/t2.json b/docs/validation/sdlc-retro-panel-precision/t2.json
new file mode 100644
index 0000000..d695340
--- /dev/null
+++ b/docs/validation/sdlc-retro-panel-precision/t2.json
@@ -0,0 +1,53 @@
+{
+  "schemaVersion": 1,
+  "taskId": "t2",
+  "buildPlan": "docs/plans/2026-07-19-sdlc-retro-panel-precision-build.md",
+  "repoRoot": ".",
+  "ownedScenarios": [],
+  "checks": [
+    {
+      "id": "tests.full",
+      "argv": ["npm", "test"],
+      "timeoutMs": 300000,
+      "evidence": ["Full corpus green incl. extended LT15 both-forms discovery and the T2 -review- precision guard"]
+    },
+    {
+      "id": "static.lint",
+      "argv": ["npm", "run", "lint"],
+      "timeoutMs": 120000,
+      "evidence": ["Repository formatting and lint rules"]
+    },
+    {
+      "id": "static.check-collect",
+      "argv": ["node", "--check", "skills/sdlc-retro/scripts/collect-run.mjs"],
+      "evidence": ["collect-run.mjs parses with the widened regex and extraction"]
+    },
+    {
+      "id": "standards.references",
+      "argv": ["node", "skills/sdlc/scripts/check-references.mjs"],
+      "timeoutMs": 60000,
+      "evidence": ["Normative-reference inventory consistent after the §12 harvest-command update (plan DoD 5)"]
+    },
+    {
+      "id": "standards.spec-additive",
+      "argv": [
+        "node",
+        "-e",
+        "const fs=require('fs');const spec=fs.readFileSync('docs/specs/2026-07-17-sdlc-lifecycle-telemetry.md','utf8');if(!spec.includes('`docs/reviews/<phase>-<slug>-<date>/`')){console.error('spec must retain the original naming line');process.exit(1);}if(!spec.includes('<phase>-review-<slug>-<date>')){console.error('spec must gain the -review- alternative');process.exit(1);}const ref=fs.readFileSync('skills/sdlc/references/phase-pr-review.md','utf8');if(!ref.includes('<phase>-review-<feat>-<date>')){console.error('pr-review reference must gain the -review- note');process.exit(1);}"
+      ],
+      "evidence": ["Spec + PR-review reference keep the original naming line and gain the -review- alternative additively (plan DoD 3/5)"]
+    },
+    {
+      "id": "patterns.diff",
+      "argv": ["git", "diff", "--check", "HEAD"],
+      "evidence": ["No whitespace-error banned patterns in the task diff"]
+    }
+  ],
+  "categories": {
+    "tests": { "applicability": "required", "checkIds": ["tests.full"] },
+    "static": { "applicability": "required", "checkIds": ["static.lint", "static.check-collect"] },
+    "scenarios": { "applicability": "n/a", "reason": "Reversible track: no Specification; T2 maps to approved plan DoD items 3 (naming) and 5 per the build plan's T2 check table." },
+    "standards": { "applicability": "required", "checkIds": ["standards.references", "standards.spec-additive"] },
+    "bannedPatterns": { "applicability": "required", "checkIds": ["patterns.diff"] }
+  }
+}
diff --git a/docs/validation/sdlc-retro-panel-precision/t3.json b/docs/validation/sdlc-retro-panel-precision/t3.json
new file mode 100644
index 0000000..f3eafc4
--- /dev/null
+++ b/docs/validation/sdlc-retro-panel-precision/t3.json
@@ -0,0 +1,58 @@
+{
+  "schemaVersion": 1,
+  "taskId": "t3",
+  "buildPlan": "docs/plans/2026-07-19-sdlc-retro-panel-precision-build.md",
+  "repoRoot": ".",
+  "ownedScenarios": [],
+  "checks": [
+    {
+      "id": "tests.full",
+      "argv": ["npm", "test"],
+      "timeoutMs": 300000,
+      "evidence": ["Full corpus green incl. T3 meta/wave discoverPanels tests and the one-wave-joins / disagreeing-waves-unparse join tests"]
+    },
+    {
+      "id": "static.lint",
+      "argv": ["npm", "run", "lint"],
+      "timeoutMs": 120000,
+      "evidence": ["Repository formatting and lint rules"]
+    },
+    {
+      "id": "static.check-collect",
+      "argv": ["node", "--check", "skills/sdlc-retro/scripts/collect-run.mjs"],
+      "evidence": ["collect-run.mjs parses with sidecar read + wave-grouped join"]
+    },
+    {
+      "id": "static.schemas-valid",
+      "argv": ["node", "-e", "JSON.parse(require('fs').readFileSync('skills/sdlc-retro/schema/run.schema.json','utf8')); JSON.parse(require('fs').readFileSync('skills/sdlc-retro/schema/event.schema.json','utf8'));"],
+      "evidence": ["run.schema.json and event.schema.json remain valid JSON after additive wave"]
+    },
+    {
+      "id": "standards.wave-validator-optional",
+      "argv": [
+        "node",
+        "--input-type=module",
+        "-e",
+        "import { validateRunJson } from './skills/sdlc-retro/scripts/collect-run.mjs'; const base = () => ({ schemaVersion:1, slug:'s', coverage:[], sizeProxies:{ scenarios:0, tasks:0, diff:{files:0,insertions:0,deletions:0}, sessions:0, phases:[] }, hard:{ window:{start:'2026-07-19T00:00:00Z',end:'2026-07-19T00:00:01Z'}, phases:[], sessions:[], panels:[], models:[], rollups:{byModel:[],byPhase:[]}, rework:{artifactRevised:0,phaseBackward:0,fixWave:0}, totals:{tokens:0,cost:0,wallMs:0,agentMs:0,humanWaitMs:0} } }); const withWave = base(); withWave.hard.panels = [{ panelPhase:'pr_review', round:2, wave:1, dir:'d', models:[] }]; const i1 = validateRunJson(withWave); if (i1.length) { console.error('wave-bearing panels[] must validate: '+i1.join(';')); process.exit(1); } const noWave = base(); noWave.hard.panels = [{ panelPhase:'pr_review', round:1, dir:'d', models:[] }]; const i2 = validateRunJson(noWave); if (i2.length) { console.error('wave-less panels[] must still validate: '+i2.join(';')); process.exit(1); }"
+      ],
+      "evidence": ["validateRunJson accepts both wave-bearing and wave-less panels (allowed-not-required, plan DoD 6)"]
+    },
+    {
+      "id": "standards.marker-registered",
+      "argv": ["grep", "-q", "panels.malformed_meta:<phase>", "docs/specs/2026-07-17-sdlc-lifecycle-telemetry.md"],
+      "evidence": ["panels.malformed_meta marker registered in the spec's closed v1 marker set (F5)"]
+    },
+    {
+      "id": "patterns.diff",
+      "argv": ["git", "diff", "--check", "HEAD"],
+      "evidence": ["No whitespace-error banned patterns in the task diff"]
+    }
+  ],
+  "categories": {
+    "tests": { "applicability": "required", "checkIds": ["tests.full"] },
+    "static": { "applicability": "required", "checkIds": ["static.lint", "static.check-collect", "static.schemas-valid"] },
+    "scenarios": { "applicability": "n/a", "reason": "Reversible track: no Specification; T3 maps to approved plan DoD items 2, 3 (marker), 6 per the build plan's T3 check table." },
+    "standards": { "applicability": "required", "checkIds": ["standards.wave-validator-optional", "standards.marker-registered"] },
+    "bannedPatterns": { "applicability": "required", "checkIds": ["patterns.diff"] }
+  }
+}
diff --git a/docs/validation/sdlc-retro-panel-precision/t4.json b/docs/validation/sdlc-retro-panel-precision/t4.json
new file mode 100644
index 0000000..0034736
--- /dev/null
+++ b/docs/validation/sdlc-retro-panel-precision/t4.json
@@ -0,0 +1,48 @@
+{
+  "schemaVersion": 1,
+  "taskId": "t4",
+  "buildPlan": "docs/plans/2026-07-19-sdlc-retro-panel-precision-build.md",
+  "repoRoot": ".",
+  "ownedScenarios": [],
+  "checks": [
+    {
+      "id": "tests.full",
+      "argv": ["npm", "test"],
+      "timeoutMs": 300000,
+      "evidence": ["Full corpus green incl. the T4 wave-collapse render test and the retained LT20 bindings"]
+    },
+    {
+      "id": "static.lint",
+      "argv": ["npm", "run", "lint"],
+      "timeoutMs": 120000,
+      "evidence": ["Repository formatting and lint rules"]
+    },
+    {
+      "id": "static.check-render",
+      "argv": ["node", "--check", "skills/sdlc-retro/scripts/render-retro.mjs"],
+      "evidence": ["render-retro.mjs parses with the wave-grouped deep-dive"]
+    },
+    {
+      "id": "standards.wave-render-behaviour",
+      "argv": [
+        "node",
+        "--input-type=module",
+        "-e",
+        "import { renderDashboard } from './skills/sdlc-retro/scripts/render-retro.mjs'; const fx = { schemaVersion:1, slug:'s', coverage:[], sizeProxies:{scenarios:0,tasks:0,diff:{files:0,insertions:0,deletions:0},sessions:0,phases:[]}, hard:{ window:{start:'2026-07-19T00:00:00.000Z',end:'2026-07-19T00:00:01.000Z'}, phases:[], sessions:[], panels:[{panelPhase:'pr_review',round:1,wave:1,dir:'d1',models:[]},{panelPhase:'pr_review',round:2,wave:1,dir:'d2',models:[]}], models:[], rollups:{byModel:[],byPhase:[]}, rework:{artifactRevised:0,phaseBackward:0,fixWave:0}, totals:{tokens:0,cost:0,wallMs:0,agentMs:0,humanWaitMs:0} }, soft:{ attribution:{model:'m',provider:'p'}, narratives:[], steering:[], panelPrecision:[{panelPhase:'pr_review',round:1,wave:1,model:'x',raised:1,incorporated:1,dismissed:0}] } }; const html = renderDashboard(fx); const waves = (html.match(/data-wave=\\\"1\\\"/g)||[]).length; if (waves !== 1) { console.error('expected exactly one wave section, got '+waves); process.exit(1); } if (!(html.includes('data-round=\\\"1\\\"') && html.includes('data-round=\\\"2\\\"'))) { console.error('both constituent rounds must appear as sub-detail'); process.exit(1); } if (!html.includes('raised 1')) { console.error('precision must join on the wave'); process.exit(1); }"
+      ],
+      "evidence": ["render collapses same-wave rounds into one section with per-round sub-detail and joins precision on the wave (plan DoD 4)"]
+    },
+    {
+      "id": "patterns.diff",
+      "argv": ["git", "diff", "--check", "HEAD"],
+      "evidence": ["No whitespace-error banned patterns in the task diff"]
+    }
+  ],
+  "categories": {
+    "tests": { "applicability": "required", "checkIds": ["tests.full"] },
+    "static": { "applicability": "required", "checkIds": ["static.lint", "static.check-render"] },
+    "scenarios": { "applicability": "n/a", "reason": "Reversible track: no Specification; T4 maps to approved plan DoD item 4 per the build plan's T4 check table." },
+    "standards": { "applicability": "required", "checkIds": ["standards.wave-render-behaviour"] },
+    "bannedPatterns": { "applicability": "required", "checkIds": ["patterns.diff"] }
+  }
+}
diff --git a/skills/sdlc-retro/schema/event.schema.json b/skills/sdlc-retro/schema/event.schema.json
index 68db682..a6cfc51 100644
--- a/skills/sdlc-retro/schema/event.schema.json
+++ b/skills/sdlc-retro/schema/event.schema.json
@@ -62,13 +62,19 @@
     { "if": { "properties": { "event": { "const": "panel.agent_stamped" } } }, "then": { "properties": { "payload": { "type": "object", "required": ["panelPhase", "agent"], "properties": { "panelPhase": { "$ref": "#/definitions/panelPhase" }, "agent": { "$ref": "#/definitions/nonEmptyString" } } } } } },
     {
       "if": { "properties": { "event": { "const": "panel.dispatched" } } },
-      "then": { "properties": { "payload": { "type": "object", "required": ["panelPhase", "round", "models"], "properties": { "panelPhase": { "$ref": "#/definitions/panelPhase" }, "round": { "$ref": "#/definitions/posInt" }, "models": { "$ref": "#/definitions/stringArray" } } } } }
+      "then": {
+        "properties": { "payload": { "type": "object", "required": ["panelPhase", "round", "models"], "properties": { "panelPhase": { "$ref": "#/definitions/panelPhase" }, "round": { "$ref": "#/definitions/posInt" }, "models": { "$ref": "#/definitions/stringArray" }, "wave": { "$ref": "#/definitions/posInt" } } } }
+      }
     },
     {
       "if": { "properties": { "event": { "const": "panel.harvested" } } },
       "then": {
         "properties": {
-          "payload": { "type": "object", "required": ["panelPhase", "round", "dir", "missed"], "properties": { "panelPhase": { "$ref": "#/definitions/panelPhase" }, "round": { "$ref": "#/definitions/posInt" }, "dir": { "$ref": "#/definitions/nonEmptyString" }, "missed": { "$ref": "#/definitions/stringArray" } } }
+          "payload": {
+            "type": "object",
+            "required": ["panelPhase", "round", "dir", "missed"],
+            "properties": { "panelPhase": { "$ref": "#/definitions/panelPhase" }, "round": { "$ref": "#/definitions/posInt" }, "dir": { "$ref": "#/definitions/nonEmptyString" }, "missed": { "$ref": "#/definitions/stringArray" }, "wave": { "$ref": "#/definitions/posInt" } }
+          }
         }
       }
     },
@@ -79,7 +85,14 @@
           "payload": {
             "type": "object",
             "required": ["panelPhase", "round", "findings", "incorporated", "dismissed"],
-            "properties": { "panelPhase": { "$ref": "#/definitions/panelPhase" }, "round": { "$ref": "#/definitions/posInt" }, "findings": { "$ref": "#/definitions/findings" }, "incorporated": { "$ref": "#/definitions/nonNegInt" }, "dismissed": { "$ref": "#/definitions/nonNegInt" } }
+            "properties": {
+              "panelPhase": { "$ref": "#/definitions/panelPhase" },
+              "round": { "$ref": "#/definitions/posInt" },
+              "findings": { "$ref": "#/definitions/findings" },
+              "incorporated": { "$ref": "#/definitions/nonNegInt" },
+              "dismissed": { "$ref": "#/definitions/nonNegInt" },
+              "wave": { "$ref": "#/definitions/posInt" }
+            }
           }
         }
       }
diff --git a/skills/sdlc-retro/schema/run.schema.json b/skills/sdlc-retro/schema/run.schema.json
index dd18d90..2359964 100644
--- a/skills/sdlc-retro/schema/run.schema.json
+++ b/skills/sdlc-retro/schema/run.schema.json
@@ -95,6 +95,7 @@
             "properties": {
               "panelPhase": { "$ref": "#/definitions/panelPhase" },
               "round": { "$ref": "#/definitions/posInt" },
+              "wave": { "$ref": "#/definitions/posInt" },
               "dir": { "type": "string", "minLength": 1 },
               "models": {
                 "type": "array",
@@ -206,6 +207,7 @@
             "properties": {
               "panelPhase": { "$ref": "#/definitions/panelPhase" },
               "round": { "$ref": "#/definitions/posInt" },
+              "wave": { "$ref": "#/definitions/posInt" },
               "model": { "type": "string", "minLength": 1 },
               "raised": { "$ref": "#/definitions/nonNegInt" },
               "incorporated": { "$ref": "#/definitions/nonNegInt" },
diff --git a/skills/sdlc-retro/scripts/collect-run.mjs b/skills/sdlc-retro/scripts/collect-run.mjs
index f46d815..e28b6a2 100755
--- a/skills/sdlc-retro/scripts/collect-run.mjs
+++ b/skills/sdlc-retro/scripts/collect-run.mjs
@@ -203,6 +203,7 @@ export function discoverPanels(root, slug, events) {
 	const panels = [];
 	const foundPhases = new Set();
 	const partialPhases = new Set();
+	const malformedMetaPhases = new Set();
 	const byPhaseRound = new Map();
 	if (existsSync(panelsDir)) {
 		for (const name of readdirSync(panelsDir).sort()) {
@@ -231,7 +232,22 @@ export function discoverPanels(root, slug, events) {
 			if (complete) foundPhases.add(panelPhase);
 			else partialPhases.add(panelPhase);
 			const round = Number(roundStr);
-			const entry = { panelPhase, round, dir: `.pi/sdlc/runs/${slug}/panels/${name}`, models, date, complete };
+			// Logical review-wave from the meta.json sidecar (T1). Absent → wave=round
+			// (every pre-sidecar harvest degrades cleanly). Malformed → wave=round and
+			// a panels.malformed_meta marker; never throws (mirrors the tolerant
+			// status.json handling above).
+			let wave = round;
+			const metaPath = join(dir, "meta.json");
+			if (existsSync(metaPath)) {
+				try {
+					const meta = JSON.parse(readFileSync(metaPath, "utf8"));
+					if (isPosInt(meta.wave)) wave = meta.wave;
+					else malformedMetaPhases.add(panelPhase);
+				} catch {
+					malformedMetaPhases.add(panelPhase);
+				}
+			}
+			const entry = { panelPhase, round, wave, dir: `.pi/sdlc/runs/${slug}/panels/${name}`, models, date, complete };
 			// Dedupe by (panelPhase, round): a re-harvest of the same round across a
 			// date boundary must not double-count hard totals. Keep the latest date.
 			const key = `${panelPhase}#${round}`;
@@ -249,6 +265,7 @@ export function discoverPanels(root, slug, events) {
 	for (const phase of [...new Set([...expectedPhases, ...partialPhases])].sort()) {
 		if (!foundPhases.has(phase) || partialPhases.has(phase)) markers.push({ marker: `panels.missing:${phase}` });
 	}
+	for (const phase of [...malformedMetaPhases].sort()) markers.push({ marker: `panels.malformed_meta:${phase}` });
 	return { panels, markers };
 }
@@ -261,7 +278,10 @@ export function discoverPanels(root, slug, events) {
 // touches the live reviews path.
 export function discoverReviewDirs(root, slug, reviewsPath = "docs/reviews", { fromRaw = false } = {}) {
 	const rawListPath = join("reviews", "_dirs.json");
-	const re = new RegExp(`^(${LIFECYCLE_PHASES.join("|")})-${slug}-\\d{4}-\\d{2}-\\d{2}$`);
+	// Accept both the historical `<phase>-<slug>-<date>` and the now-dominant
+	// `<phase>-review-<slug>-<date>` naming (the `-review-` infix). Slugs match
+	// SLUG_RE (no regex-special chars), so interpolation is safe.
+	const re = new RegExp(`^(${LIFECYCLE_PHASES.join("|")})-(?:review-)?${slug}-\\d{4}-\\d{2}-\\d{2}$`);
 	if (fromRaw) {
 		if (!rawExists(root, slug, rawListPath)) return [];
 		try {
@@ -710,9 +730,9 @@ export function validateRunJson(raw) {
 	if (!Array.isArray(h.panels)) add("/hard/panels", "must be an array of {panelPhase, round, dir, models[]}");
 	else
 		h.panels.forEach((p, i) => {
-			if (!isPlainObject(p) || !PANEL_PHASES.includes(p.panelPhase) || !isPosInt(p.round) || typeof p.dir !== "string" || p.dir.length === 0 || !Array.isArray(p.models)) add(`/hard/panels/${i}`, "must be {panelPhase, round, dir, models[]}");
+			if (!isPlainObject(p) || !PANEL_PHASES.includes(p.panelPhase) || !isPosInt(p.round) || (p.wave !== undefined && !isPosInt(p.wave)) || typeof p.dir !== "string" || p.dir.length === 0 || !Array.isArray(p.models)) add(`/hard/panels/${i}`, "must be {panelPhase, round, dir, models[], wave?}");
 			else {
-				checkKeys(p, ["panelPhase", "round", "dir", "models"], `/hard/panels/${i}`, add);
+				checkKeys(p, ["panelPhase", "round", "wave", "dir", "models"], `/hard/panels/${i}`, add);
 				p.models.forEach((m, j) => {
 					if (
 						!isPlainObject(m) ||
@@ -770,8 +790,9 @@ export function validateRunJson(raw) {
 			if (!Array.isArray(sf.panelPrecision)) add("/soft/panelPrecision", "must be an array of {panelPhase, round, model, raised, incorporated, dismissed}");
 			else
 				sf.panelPrecision.forEach((p, i) => {
-					if (!isPlainObject(p) || !PANEL_PHASES.includes(p.panelPhase) || !isPosInt(p.round) || typeof p.model !== "string" || p.model.length === 0 || !isNonNegInt(p.raised) || !isNonNegInt(p.incorporated) || !isNonNegInt(p.dismissed)) add(`/soft/panelPrecision/${i}`, "must match the panelPrecision schema");
-					else checkKeys(p, ["panelPhase", "round", "model", "raised", "incorporated", "dismissed"], `/soft/panelPrecision/${i}`, add);
+					if (!isPlainObject(p) || !PANEL_PHASES.includes(p.panelPhase) || !isPosInt(p.round) || (p.wave !== undefined && !isPosInt(p.wave)) || typeof p.model !== "string" || p.model.length === 0 || !isNonNegInt(p.raised) || !isNonNegInt(p.incorporated) || !isNonNegInt(p.dismissed))
+						add(`/soft/panelPrecision/${i}`, "must match the panelPrecision schema");
+					else checkKeys(p, ["panelPhase", "round", "wave", "model", "raised", "incorporated", "dismissed"], `/soft/panelPrecision/${i}`, add);
 				});
 		}
 	}
@@ -880,17 +901,26 @@ function buildSoftData({ root, slug, llmCmd, noLlm, fromRaw, events, spans, sess
 	const panelPrecision = [];
 	for (const dir of reviewDirs) {
-		const lifecyclePhase = LIFECYCLE_PHASES.find((phase) => dir.startsWith(`${phase}-${slug}-`));
+		// Match both naming forms (see discoverReviewDirs): the `-review-` infix
+		// must be accepted here too, or every `-review-` directory silently yields
+		// no panelPhase and an unparsed precision marker.
+		const lifecyclePhase = LIFECYCLE_PHASES.find((phase) => dir.startsWith(`${phase}-${slug}-`) || dir.startsWith(`${phase}-review-${slug}-`));
 		const panelPhase = lifecyclePhase ? LIFECYCLE_TO_PANEL[lifecyclePhase] : undefined;
 		const reviewDate = dir.match(/-(\d{4}-\d{2}-\d{2})$/)?.[1];
 		const matchingPanels = panelPhase ? panels.filter((p) => p.panelPhase === panelPhase) : [];
 		const datedPanels = reviewDate ? matchingPanels.filter((p) => p.dir.endsWith(`-${reviewDate}`)) : matchingPanels;
-		const candidates = datedPanels.length > 0 ? datedPanels : matchingPanels.length === 1 ? matchingPanels : [];
-		const panel = candidates.length === 1 ? candidates[0] : undefined;
-		if (!panel) {
+		const candidates = datedPanels.length > 0 ? datedPanels : matchingPanels;
+		// Group by logical wave, not harvest round: multiple same-day rounds of one
+		// review wave (e.g. an infra-replacement dispatch) share a wave and join
+		// cleanly. precision.unparsed is emitted only when the candidates span more
+		// than one distinct wave (a genuine same-date ambiguity) or none match.
+		const waves = [...new Set(candidates.map((p) => p.wave))];
+		const wave = waves.length === 1 ? waves[0] : undefined;
+		if (candidates.length === 0 || wave === undefined) {
 			markers.push({ marker: `precision.unparsed:${dir}` });
 			continue;
 		}
+		const panel = candidates[0];
 		// Replay reads only raw/reviews/<dir>; it must not consult a mutated or
 		// deleted live reviews directory after the original collection.
@@ -933,7 +963,8 @@ function buildSoftData({ root, slug, llmCmd, noLlm, fromRaw, events, spans, sess
 			}
 			panelPrecision.push({
 				panelPhase: panel.panelPhase,
-				round: panel.round,
+				round: wave,
+				wave,
 				model,
 				raised: pm.raised,
 				incorporated: pm.incorporated,
@@ -1058,7 +1089,7 @@ export function collect({ root, slug, gitCmd = "git", baseRef = "main", ghCmd =
 		window: { start: windowStart, end: windowEnd },
 		phases: spans.map((s) => ({ phase: s.phase, start: s.start, end: s.end, exitExplicit: s.exitExplicit })),
 		sessions: hardSessions,
-		panels: panels.map((p) => ({ panelPhase: p.panelPhase, round: p.round, dir: p.dir, models: p.models })),
+		panels: panels.map((p) => ({ panelPhase: p.panelPhase, round: p.round, wave: p.wave, dir: p.dir, models: p.models })),
 		models: [...distinctModels].sort(),
 		rollups: {
 			byModel: [...byModelMap.entries()].map(([model, v]) => ({ model, tokens: v.tokens, cost: v.cost })).sort((a, b) => (a.model < b.model ? -1 : 1)),
diff --git a/skills/sdlc-retro/scripts/render-retro.mjs b/skills/sdlc-retro/scripts/render-retro.mjs
index fe9a8ac..3c4d8f1 100755
--- a/skills/sdlc-retro/scripts/render-retro.mjs
+++ b/skills/sdlc-retro/scripts/render-retro.mjs
@@ -87,10 +87,32 @@ function renderPanelDeepdive(run) {
 	const panels = run.hard.panels;
 	const precision = run.soft?.panelPrecision ?? [];
 	if (panels.length === 0) return `<section id="panel-deepdive"><h2>Panel deep-dive</h2><p class="coverage-notice">no harvested panel rounds</p></section>`;
-	const blocks = panels
-		.map((p) => {
-			const modelRows = p.models.map((m) => `<div class="panel-model-row" data-model="${esc(m.model)}"><span>${esc(m.model)}</span><span>${m.tokens ?? 0} tok</span><span>${esc(fmtCost(m.cost ?? 0))}</span><span>${esc(fmtMs(m.durationMs ?? 0))}</span><span>${m.turns ?? 0} turns</span></div>`).join("\n");
-			const findings = precision.filter((pr) => pr.panelPhase === p.panelPhase && pr.round === p.round);
+	// Group harvested rounds by logical wave (wave defaults to round for records
+	// predating the wave field), collapsing same-wave rounds (e.g. an
+	// infra-replacement dispatch) into one section with each round as sub-detail.
+	const groups = new Map();
+	for (const p of panels) {
+		const wave = p.wave ?? p.round;
+		const key = `${p.panelPhase}#${wave}`;
+		if (!groups.has(key)) groups.set(key, { panelPhase: p.panelPhase, wave, rounds: [] });
+		groups.get(key).rounds.push(p);
+	}
+	const ordered = [...groups.values()].sort((a, b) => (a.panelPhase < b.panelPhase ? -1 : a.panelPhase > b.panelPhase ? 1 : a.wave - b.wave));
+	const blocks = ordered
+		.map((g) => {
+			const roundBlocks = g.rounds
+				.slice()
+				.sort((a, b) => a.round - b.round)
+				.map((p) => {
+					const modelRows = p.models.map((m) => `<div class="panel-model-row" data-model="${esc(m.model)}"><span>${esc(m.model)}</span><span>${m.tokens ?? 0} tok</span><span>${esc(fmtCost(m.cost ?? 0))}</span><span>${esc(fmtMs(m.durationMs ?? 0))}</span><span>${m.turns ?? 0} turns</span></div>`).join("\n");
+					const roundLabel = p.round === g.wave ? `round ${p.round}` : `round ${p.round} (replacement)`;
+					return `<div class="panel-round" data-round="${p.round}">
+<h4>${esc(roundLabel)}</h4>
+${modelRows || '<p class="coverage-notice">no per-model metrics for this round</p>'}
+</div>`;
+				})
+				.join("\n");
+			const findings = precision.filter((pr) => pr.panelPhase === g.panelPhase && (pr.wave ?? pr.round) === g.wave);
 			const findingRows =
 				findings.length > 0
 					? findings
@@ -99,10 +121,10 @@ function renderPanelDeepdive(run) {
 									`<div class="panel-finding-row" data-soft="true" data-model="${esc(f.model)}"><span class="soft-attribution">soft (${esc(run.soft.attribution.model)})</span><span>${esc(f.model)}</span><span>raised ${f.raised}</span><span>incorporated ${f.incorporated}</span><span>dismissed ${f.dismissed}</span></div>`,
 							)
 							.join("\n")
-					: '<p class="coverage-notice">no precision figures for this round</p>';
-			return `<div class="panel-round" data-panel-phase="${esc(p.panelPhase)}" data-round="${p.round}">
-<h3>${esc(p.panelPhase)} round ${p.round}</h3>
-${modelRows}
+					: '<p class="coverage-notice">no precision figures for this wave</p>';
+			return `<div class="panel-wave" data-panel-phase="${esc(g.panelPhase)}" data-wave="${g.wave}">
+<h3>${esc(g.panelPhase)} wave ${g.wave}</h3>
+${roundBlocks}
 ${findingRows}
 </div>`;
 		})
diff --git a/skills/sdlc/assets/normative-references.json b/skills/sdlc/assets/normative-references.json
index d517fe1..8e2de29 100644
--- a/skills/sdlc/assets/normative-references.json
+++ b/skills/sdlc/assets/normative-references.json
@@ -757,7 +757,7 @@
     {
       "id": "sdlc.skill.harvest-panel-pointer",
       "source": "skills/sdlc/references/system-reference.md",
-      "assertion": "scripts/harvest-panel.sh --phase <panelPhase> --round <n> --from <asyncDir>`\n  (skill-relative; headless: `node <skill-dir>/scripts/harvest-panel.mjs`).",
+      "assertion": "scripts/harvest-panel.sh --phase <panelPhase> --round <label> --wave <wave> --from <asyncDir>`\n  (skill-relative; headless: `node <skill-dir>/scripts/harvest-panel.mjs`).",
       "targetKind": "command",
       "ownership": "package",
       "required": true,
diff --git a/skills/sdlc/references/phase-pr-review.md b/skills/sdlc/references/phase-pr-review.md
index 27a77e1..4475a8d 100644
--- a/skills/sdlc/references/phase-pr-review.md
+++ b/skills/sdlc/references/phase-pr-review.md
@@ -221,7 +221,9 @@ hand-copy a prompt per model.
 Save panel artifacts under `<configured paths.reviews>/<phase>-<feat>-<date>/`: one
 file per model, the shared `prompt.md`, and a `consolidated.md` carrying the
-adjudication and the orchestrating model.
+adjudication and the orchestrating model. The `<phase>-review-<feat>-<date>`
+form (a `-review-` infix) is equally accepted and recommended going forward;
+the retro collector discovers both.
 > **Under your configuration:** whether a Plan panel and a Spec panel run at all
 > depends on the effective track and `review.design`; the PR panel runs on both
diff --git a/skills/sdlc/references/system-reference.md b/skills/sdlc/references/system-reference.md
index 58b42e5..fcfd98b 100644
--- a/skills/sdlc/references/system-reference.md
+++ b/skills/sdlc/references/system-reference.md
@@ -308,19 +308,23 @@ event-type payload:
 - **Every human gate approval**: when the human approves a phase's gate —
   `record-run-event.sh gate.approved --payload '{"phase":"<phase>","artifact":"<path>","rev":<n>,"approver":"human:<slug>"}'`.
 - **Panel dispatch**: immediately after dispatching a design or PR panel —
-  `record-run-event.sh panel.dispatched --payload '{"panelPhase":"<panelPhase>","round":<n>,"models":[...]}'`
+  `record-run-event.sh panel.dispatched --payload '{"panelPhase":"<panelPhase>","round":<wave>,"models":[...]}'`
   — and, harvest-at-dispatch, immediately preserve its artifacts with
-  `scripts/harvest-panel.sh --phase <panelPhase> --round <n> --from <asyncDir>`
+  `scripts/harvest-panel.sh --phase <panelPhase> --round <label> --wave <wave> --from <asyncDir>`
   (skill-relative; headless: `node <skill-dir>/scripts/harvest-panel.mjs`).
-  The `<n>` in `panel.dispatched` and `panel.consolidated` is the **logical
-  review-wave counter**: a replacement dispatch for an infra-failed reviewer
-  belongs to its original wave and emits `panel.dispatched` with that wave's
-  `<n>`. The harvest `--round` is a **destination allocation label** that may
-  advance past the wave counter to avoid overwriting a prior snapshot (see
-  `references/phase-pr-review.md`, "Harvest-at-dispatch"); whenever the two
-  diverge, record the label↔wave mapping in that wave's `consolidated.md`.
+  Two distinct numbers appear here on purpose: `<wave>` is the **logical
+  review-wave counter** — a replacement dispatch for an infra-failed reviewer
+  belongs to its original wave and carries that wave's `<wave>` in the `round`
+  payload field of both the dispatch and consolidation events and in
+  `harvest-panel --wave`. `<label>` is the harvest `--round` **destination
+  allocation label**, which may advance past the wave to avoid overwriting a
+  prior snapshot (see `references/phase-pr-review.md`, "Harvest-at-dispatch");
+  it defaults to `<wave>` when omitted. `harvest-panel` records both in a
+  `meta.json` sidecar so the collector groups same-wave rounds without parsing
+  prose; still note any label↔wave divergence in that wave's `consolidated.md`
+  for human readers.
 - **Panel consolidation**: after adjudicating a round's findings —
-  `record-run-event.sh panel.consolidated --payload '{"panelPhase":"<panelPhase>","round":<n>,"findings":{"high":<n>,"medium":<n>,"low":<n>},"incorporated":<n>,"dismissed":<n>}'`.
+  `record-run-event.sh panel.consolidated --payload '{"panelPhase":"<panelPhase>","round":<wave>,"findings":{"high":<n>,"medium":<n>,"low":<n>},"incorporated":<n>,"dismissed":<n>}'`.
 - **Caller-side lifecycle-check recording**: right after running
   `check-lifecycle` (itself untouched, FS9) —
   `record-run-event.sh lifecycle.checked --payload '{"verdict":"<verdict>"}'`.
diff --git a/skills/sdlc/scripts/harvest-panel.mjs b/skills/sdlc/scripts/harvest-panel.mjs
index bbb3d2b..d524b8d 100755
--- a/skills/sdlc/scripts/harvest-panel.mjs
+++ b/skills/sdlc/scripts/harvest-panel.mjs
@@ -4,7 +4,7 @@
 // panel dispatch's async run directory into the consumer's run store, before
 // they evaporate.
 //
-// Usage: harvest-panel.mjs --phase PANEL_PHASE --round N --from DIR [--slug S]
+// Usage: harvest-panel.mjs --phase PANEL_PHASE --round N [--wave W] --from DIR [--slug S]
 //                          [--with-transcripts] [--format text|json]
 //                          [--config DIR | --repo-root DIR]
 //
@@ -12,12 +12,15 @@
 // events.jsonl at its top level (the shape of a pi-subagents asyncDir).
 // Harvest copies both into panels/<panelPhase>-round<N>-<date>/;
 // --with-transcripts additionally copies a top-level transcripts/
-// subdirectory (when present) into transcripts/ at the destination. A
-// missing/aborted source directory or file is a report, not a throw: exit 0,
+// subdirectory (when present) into transcripts/ at the destination. It also
+// writes a meta.json sidecar {round, wave}: --round is the destination
+// allocation label, --wave is the logical review-wave (defaults to --round
+// when omitted, so a replacement dispatch can share its original wave while
+// taking a fresh label). A missing/aborted source directory or file is a report, not a throw: exit 0,
 // missed[] populated, and the panel.harvested event records the gap. Exit 2
 // only for usage errors or an unwritable destination.
-import { cpSync, existsSync, mkdirSync, statSync } from "node:fs";
+import { cpSync, existsSync, mkdirSync, statSync, writeFileSync } from "node:fs";
 import { join, relative } from "node:path";
 import { inspectRoot } from "./lib.mjs";
 import { emitEvent, PANEL_PHASES, resolveRunSlug, runStoreDir } from "./telemetry.mjs";
@@ -38,6 +41,7 @@ function parseArgs(argv) {
 		};
 		if (a === "--phase") opts.phase = val("--phase");
 		else if (a === "--round") opts.round = val("--round");
+		else if (a === "--wave") opts.wave = val("--wave");
 		else if (a === "--from") opts.from = val("--from");
 		else if (a === "--slug") opts.slug = val("--slug");
 		else if (a === "--with-transcripts") opts.withTranscripts = true;
@@ -54,7 +58,7 @@ function parseArgs(argv) {
 }
 function usage() {
-	return "usage: harvest-panel.mjs --phase PANEL_PHASE --round N --from DIR [--slug S] [--with-transcripts] [--format text|json] [--config DIR|--repo-root DIR]";
+	return "usage: harvest-panel.mjs --phase PANEL_PHASE --round N [--wave W] --from DIR [--slug S] [--with-transcripts] [--format text|json] [--config DIR|--repo-root DIR]";
 }
 // Copy one file if present; return "copied" | "missed".
@@ -83,6 +87,10 @@ function main() {
 	if (!opts.round) bail(usage());
 	const round = Number(opts.round);
 	if (!Number.isInteger(round) || round <= 0) bail("--round must be a positive integer");
+	// The logical review-wave defaults to the allocation label when not given, so
+	// existing single-dispatch harvests are byte-identical in meaning (wave===round).
+	const wave = opts.wave === undefined ? round : Number(opts.wave);
+	if (!Number.isInteger(wave) || wave <= 0) bail("--wave must be a positive integer");
 	if (!opts.from) bail(usage());
 	const rootResult = inspectRoot({ config: opts.config, repoRoot: opts.repoRoot });
@@ -116,13 +124,25 @@ function main() {
 		if (status === "missed") missed.push("transcripts");
 	}
+	// meta.json sidecar records the {round, wave} distinction so the collector
+	// can group same-wave harvest rounds without parsing prose. Written after the
+	// copies; a failure here is not fatal to the harvest itself.
+	let metaWritten = false;
+	try {
+		writeFileSync(join(destDir, "meta.json"), `${JSON.stringify({ round, wave }, null, 2)}\n`);
+		metaWritten = true;
+	} catch {
+		missed.push("meta.json");
+	}
+	files.push({ name: "meta.json", status: metaWritten ? "copied" : "missed" });
+
 	const relDir = relative(root, destDir);
-	const report = { ok: true, phase: opts.phase, round, dir: relDir, files, missed };
+	const report = { ok: true, phase: opts.phase, round, wave, dir: relDir, files, missed };
 	if (opts.format === "json") {
 		console.log(JSON.stringify(report, null, 2));
 	} else {
-		console.log(`harvested ${opts.phase} round ${round} -> ${relDir}`);
+		console.log(`harvested ${opts.phase} round ${round} (wave ${wave}) -> ${relDir}`);
 		for (const f of files) console.log(`  ${f.name}: ${f.status}`);
 		if (missed.length > 0) console.log(`missed: ${missed.join(", ")}`);
 	}
@@ -131,7 +151,7 @@ function main() {
 		event: "panel.harvested",
 		slug,
 		by: "script:harvest-panel",
-		payload: { panelPhase: opts.phase, round, dir: relDir, missed },
+		payload: { panelPhase: opts.phase, round, wave, dir: relDir, missed },
 		root,
 	});
diff --git a/skills/sdlc/scripts/telemetry.mjs b/skills/sdlc/scripts/telemetry.mjs
index 5e6460f..c149c80 100644
--- a/skills/sdlc/scripts/telemetry.mjs
+++ b/skills/sdlc/scripts/telemetry.mjs
@@ -102,6 +102,16 @@ export const EVENT_PAYLOADS = Object.freeze({
 	],
 });
+// Optional, additive payload fields per event: type-checked when present, never
+// required (so emitting them is backward-compatible and omitting them is valid).
+// `wave` distinguishes the logical review-wave from the harvest allocation label
+// (`round`) on panel events; a replacement dispatch keeps its original wave.
+export const OPTIONAL_EVENT_PAYLOADS = Object.freeze({
+	"panel.dispatched": [["wave", "posInt"]],
+	"panel.harvested": [["wave", "posInt"]],
+	"panel.consolidated": [["wave", "posInt"]],
+});
+
 export const KNOWN_EVENTS = Object.keys(EVENT_PAYLOADS);
 function isPlainObject(v) {
@@ -167,6 +177,12 @@ export function validatePayload(event, payload) {
 		const problem = fieldIssue(`payload.${name}`, type, payload[name]);
 		if (problem) issues.push(problem);
 	}
+	// Optional fields: type-checked only when present; absence is never an issue.
+	for (const [name, type] of OPTIONAL_EVENT_PAYLOADS[event] ?? []) {
+		if (!(name in payload)) continue;
+		const problem = fieldIssue(`payload.${name}`, type, payload[name]);
+		if (problem) issues.push(problem);
+	}
 	return issues;
 }
diff --git a/test/telemetry-collect-soft.test.js b/test/telemetry-collect-soft.test.js
index 18911c0..11a9cc8 100644
--- a/test/telemetry-collect-soft.test.js
+++ b/test/telemetry-collect-soft.test.js
@@ -155,6 +155,108 @@ test("LT18: soft data carries attribution and matches the fixture LLM's scripted
 	}
 });
+test("T2: a -review- form review directory yields non-empty precision (F1 extraction guard)", () => {
+	const root = tmp();
+	const bin = tmp("sdlc-lt5-bin-");
+	try {
+		const slug = "t2-review";
+		seedManifest(root, slug);
+		const date = "2026-07-18";
+		// a harvested panel the review dir can join to
+		const panelDir = join(root, ".pi", "sdlc", "runs", slug, "panels", `pr_review-round1-${date}`);
+		mkdirSync(panelDir, { recursive: true });
+		writeFileSync(join(panelDir, "status.json"), JSON.stringify({ state: "completed" }));
+		writeFileSync(join(panelDir, "events.jsonl"), "");
+		// the review dir uses the -review- infix form (would silently unparse before F1)
+		const reviewDir = join(root, "docs", "reviews", `pr-review-${slug}-${date}`);
+		mkdirSync(reviewDir, { recursive: true });
+		writeFileSync(join(reviewDir, "consolidated.md"), "adjudication prose");
+		writeFileSync(join(reviewDir, "model-a.md"), "findings");
+		const llmCmd = mkLlmStub(bin);
+
+		const { runJson } = collect({ root, slug, gitCmd: "false", ghCmd: "false", noGithub: true, llmCmd });
+		const markers = runJson.coverage.map((c) => c.marker);
+		assert.ok(!markers.includes(`precision.unparsed:pr-review-${slug}-${date}`), `-review- dir must not unparse; got ${markers}`);
+		assert.ok(runJson.soft.panelPrecision.length > 0, "precision recorded for the -review- directory");
+		assert.equal(runJson.soft.panelPrecision[0].panelPhase, "pr_review");
+	} finally {
+		rmSync(root, { recursive: true, force: true });
+		rmSync(bin, { recursive: true, force: true });
+	}
+});
+
+test("T3: same-wave multi-round harvests (a replacement dispatch) join to one wave without precision.unparsed", () => {
+	const root = tmp();
+	const bin = tmp("sdlc-lt5-bin-");
+	try {
+		const slug = "t3-onewave";
+		seedManifest(root, slug);
+		const date = "2026-07-18";
+		// two harvested rounds on the same date, both logical wave 1 (round 2 is a replacement)
+		for (const [round, wave] of [
+			[1, 1],
+			[2, 1],
+		]) {
+			const pdir = join(root, ".pi", "sdlc", "runs", slug, "panels", `pr_review-round${round}-${date}`);
+			mkdirSync(pdir, { recursive: true });
+			writeFileSync(join(pdir, "status.json"), JSON.stringify({ state: "completed" }));
+			writeFileSync(join(pdir, "events.jsonl"), "");
+			writeFileSync(join(pdir, "meta.json"), JSON.stringify({ round, wave }));
+		}
+		const reviewDir = join(root, "docs", "reviews", `pr-review-${slug}-${date}`);
+		mkdirSync(reviewDir, { recursive: true });
+		writeFileSync(join(reviewDir, "consolidated.md"), "adjudication prose");
+		writeFileSync(join(reviewDir, "model-a.md"), "findings");
+		const llmCmd = mkLlmStub(bin);
+
+		const { runJson } = collect({ root, slug, gitCmd: "false", ghCmd: "false", noGithub: true, llmCmd });
+		const markers = runJson.coverage.map((c) => c.marker);
+		assert.ok(!markers.some((m) => m.startsWith("precision.unparsed")), `no unparse expected; got ${markers}`);
+		assert.ok(runJson.soft.panelPrecision.length > 0, "precision recorded for the one-wave review");
+		assert.ok(
+			runJson.soft.panelPrecision.every((p) => p.wave === 1 && p.round === 1),
+			"precision attributed to logical wave 1",
+		);
+	} finally {
+		rmSync(root, { recursive: true, force: true });
+		rmSync(bin, { recursive: true, force: true });
+	}
+});
+
+test("T3: harvests that disagree on wave for one review date emit precision.unparsed", () => {
+	const root = tmp();
+	const bin = tmp("sdlc-lt5-bin-");
+	try {
+		const slug = "t3-multiwave";
+		seedManifest(root, slug);
+		const date = "2026-07-18";
+		// two harvested rounds on the same date belonging to DIFFERENT waves
+		for (const [round, wave] of [
+			[1, 1],
+			[2, 2],
+		]) {
+			const pdir = join(root, ".pi", "sdlc", "runs", slug, "panels", `pr_review-round${round}-${date}`);
+			mkdirSync(pdir, { recursive: true });
+			writeFileSync(join(pdir, "status.json"), JSON.stringify({ state: "completed" }));
+			writeFileSync(join(pdir, "events.jsonl"), "");
+			writeFileSync(join(pdir, "meta.json"), JSON.stringify({ round, wave }));
+		}
+		const reviewDir = join(root, "docs", "reviews", `pr-review-${slug}-${date}`);
+		mkdirSync(reviewDir, { recursive: true });
+		writeFileSync(join(reviewDir, "consolidated.md"), "adjudication prose");
+		writeFileSync(join(reviewDir, "model-a.md"), "findings");
+		const llmCmd = mkLlmStub(bin);
+
+		const { runJson } = collect({ root, slug, gitCmd: "false", ghCmd: "false", noGithub: true, llmCmd });
+		const markers = runJson.coverage.map((c) => c.marker);
+		assert.ok(markers.includes(`precision.unparsed:pr-review-${slug}-${date}`), `expected wave-disagreement unparse; got ${markers}`);
+		assert.equal(runJson.soft.panelPrecision.length, 0, "no precision when waves disagree");
+	} finally {
+		rmSync(root, { recursive: true, force: true });
+		rmSync(bin, { recursive: true, force: true });
+	}
+});
+
 test("LT18: an unreadable review directory yields precision.unparsed:<dir> and no precision number", () => {
 	const root = tmp();
 	const home = tmp("sdlc-lt5-home-empty-");
diff --git a/test/telemetry-collect.test.js b/test/telemetry-collect.test.js
index 9b5a635..3122625 100644
--- a/test/telemetry-collect.test.js
+++ b/test/telemetry-collect.test.js
@@ -248,6 +248,42 @@ test("LT15: harvest adapter maps per-model fields correctly", () => {
 		assert.equal(panels[0].panelPhase, "pr_review");
 		assert.equal(panels[0].round, 1);
 		assert.deepEqual(panels[0].models, [{ model: "openai/gpt-5", tokens: 100, cost: 0.5, durationMs: 1000, turns: 3 }]);
+		assert.equal(panels[0].wave, 1, "wave defaults to round when no meta.json sidecar");
+	} finally {
+		rmSync(root, { recursive: true, force: true });
+	}
+});
+
+test("T3: discoverPanels reads the meta.json wave; malformed sidecar falls back to round with a marker", () => {
+	const root = tmp();
+	try {
+		const slug = "t3-meta";
+		seedManifest(root, slug);
+		const date = "2026-07-19";
+		const panelsRoot = join(root, ".pi", "sdlc", "runs", slug, "panels");
+		// round 2, logical wave 1 (a replacement dispatch) with a valid sidecar
+		const d1 = join(panelsRoot, `pr_review-round2-${date}`);
+		mkdirSync(d1, { recursive: true });
+		writeFileSync(join(d1, "status.json"), JSON.stringify({ state: "completed" }));
+		writeFileSync(join(d1, "events.jsonl"), "");
+		writeFileSync(join(d1, "meta.json"), JSON.stringify({ round: 2, wave: 1 }));
+		// a malformed sidecar on a plan_review round 1: wave falls back to round, marker emitted
+		const d2 = join(panelsRoot, `plan_review-round1-${date}`);
+		mkdirSync(d2, { recursive: true });
+		writeFileSync(join(d2, "status.json"), JSON.stringify({ state: "completed" }));
+		writeFileSync(join(d2, "events.jsonl"), "");
+		writeFileSync(join(d2, "meta.json"), "{ not valid json");
+		const { panels, markers } = discoverPanels(root, slug, []);
+		const pr = panels.find((p) => p.panelPhase === "pr_review");
+		const plan = panels.find((p) => p.panelPhase === "plan_review");
+		assert.equal(pr.round, 2);
+		assert.equal(pr.wave, 1, "valid sidecar wave is read");
+		assert.equal(plan.round, 1);
+		assert.equal(plan.wave, 1, "malformed sidecar falls back to wave=round");
+		assert.ok(
+			markers.some((m) => m.marker === "panels.malformed_meta:plan_review"),
+			`expected panels.malformed_meta marker; got ${JSON.stringify(markers)}`,
+		);
 	} finally {
 		rmSync(root, { recursive: true, force: true });
 	}
@@ -276,15 +312,17 @@ test("LT15: transcript usage/cost sums correctly and a version-4 transcript soft
 	}
 });
-test("LT15: review-dir discovery matches <phase>-<slug>-<date> naming", () => {
+test("LT15: review-dir discovery matches both <phase>-<slug>-<date> and <phase>-review-<slug>-<date> naming", () => {
 	const root = tmp();
 	try {
 		const slug = "lt15-review";
 		mkdirSync(join(root, "docs", "reviews", `spec-${slug}-2026-07-17`), { recursive: true });
 		mkdirSync(join(root, "docs", "reviews", `pr-${slug}-2026-07-18`), { recursive: true });
+		mkdirSync(join(root, "docs", "reviews", `pr-review-${slug}-2026-07-19`), { recursive: true }); // new -review- form
+		mkdirSync(join(root, "docs", "reviews", `plan-review-${slug}-2026-07-16`), { recursive: true }); // new -review- form
 		mkdirSync(join(root, "docs", "reviews", `task-validate-${slug}-lt-x-2026-07-17`), { recursive: true }); // must NOT match
 		const found = discoverReviewDirs(root, slug);
-		assert.deepEqual(found, [`pr-${slug}-2026-07-18`, `spec-${slug}-2026-07-17`]);
+		assert.deepEqual(found, [`plan-review-${slug}-2026-07-16`, `pr-${slug}-2026-07-18`, `pr-review-${slug}-2026-07-19`, `spec-${slug}-2026-07-17`]);
 	} finally {
 		rmSync(root, { recursive: true, force: true });
 	}
diff --git a/test/telemetry-harvest.test.js b/test/telemetry-harvest.test.js
index 0817cd6..8df7c6c 100644
--- a/test/telemetry-harvest.test.js
+++ b/test/telemetry-harvest.test.js
@@ -78,8 +78,46 @@ test("LT11: harvest copies status.json + events.jsonl and emits panel.harvested"
 		assert.equal(events[0].by, "script:harvest-panel");
 		assert.equal(events[0].payload.panelPhase, "pr_review");
 		assert.equal(events[0].payload.round, 1);
+		assert.equal(events[0].payload.wave, 1, "wave defaults to round when --wave omitted");
 		assert.deepEqual(events[0].payload.missed, []);
 		assert.ok(events[0].payload.dir.includes("panels"));
+		// meta.json sidecar records the {round, wave} distinction (default wave===round).
+		assert.deepEqual(JSON.parse(readFileSync(join(destDir, "meta.json"), "utf8")), { round: 1, wave: 1 });
+	} finally {
+		rmSync(root, { recursive: true, force: true });
+		rmSync(src, { recursive: true, force: true });
+	}
+});
+
+test("T1: --wave records a logical wave distinct from the round allocation label", () => {
+	const root = tmp("sdlc-lt3-root-");
+	const src = mkAsyncDir();
+	try {
+		// a replacement dispatch: fresh round label 2, but logical wave 1
+		const r = run(["--phase", "pr_review", "--round", "2", "--wave", "1", "--from", src, "--repo-root", root, "--slug", "t1-wave", "--format", "json"]);
+		assert.equal(r.status, 0, r.stderr);
+		const report = JSON.parse(r.stdout);
+		assert.equal(report.round, 2);
+		assert.equal(report.wave, 1);
+		const date = new Date().toISOString().slice(0, 10);
+		const destDir = join(root, ".pi", "sdlc", "runs", "t1-wave", "panels", `pr_review-round2-${date}`);
+		assert.deepEqual(JSON.parse(readFileSync(join(destDir, "meta.json"), "utf8")), { round: 2, wave: 1 });
+		const events = readEvents(root, "t1-wave");
+		assert.equal(events[0].payload.round, 2);
+		assert.equal(events[0].payload.wave, 1);
+	} finally {
+		rmSync(root, { recursive: true, force: true });
+		rmSync(src, { recursive: true, force: true });
+	}
+});
+
+test("T1: --wave must be a positive integer", () => {
+	const root = tmp("sdlc-lt3-root-");
+	const src = mkAsyncDir();
+	try {
+		const bad = run(["--phase", "pr_review", "--round", "1", "--wave", "0", "--from", src, "--repo-root", root]);
+		assert.equal(bad.status, 2);
+		assert.match(bad.stderr, /--wave must be a positive integer/);
 	} finally {
 		rmSync(root, { recursive: true, force: true });
 		rmSync(src, { recursive: true, force: true });
diff --git a/test/telemetry-render.test.js b/test/telemetry-render.test.js
index 6fc9d9d..6886ae3 100644
--- a/test/telemetry-render.test.js
+++ b/test/telemetry-render.test.js
@@ -120,6 +120,27 @@ test("LT20: full fixture renders all seven anchors with known-answer data bindin
 	assert.ok(/PR fix waves[\s\S]*?<span>1<\/span>/.test(html));
 });
+test("T4: same-wave harvest rounds collapse into one wave section with each round as sub-detail", () => {
+	const fx = fullFixture();
+	// two harvested rounds of one logical wave (round 2 a replacement dispatch)
+	fx.hard.panels = [
+		{ panelPhase: "pr_review", round: 1, wave: 1, dir: ".pi/sdlc/runs/lt20-run/panels/pr_review-round1-2026-07-18", models: [{ model: "openai/gpt-5", tokens: 100, cost: 0.5, durationMs: 1000, turns: 3 }] },
+		{ panelPhase: "pr_review", round: 2, wave: 1, dir: ".pi/sdlc/runs/lt20-run/panels/pr_review-round2-2026-07-18", models: [{ model: "deepseek/deepseek-v4-pro", tokens: 80, cost: 0.4, durationMs: 900, turns: 2 }] },
+	];
+	fx.soft.panelPrecision = [{ panelPhase: "pr_review", round: 1, wave: 1, model: "openai/gpt-5", raised: 2, incorporated: 1, dismissed: 1 }];
+	const html = renderDashboard(fx);
+	// exactly one wave section for pr_review wave 1
+	const waveSections = html.match(/data-wave="1"/g) ?? [];
+	assert.equal(waveSections.length, 1, "same-wave rounds collapse into one wave section");
+	assert.ok(html.includes('data-panel-phase="pr_review"'));
+	assert.ok(html.includes("wave 1"), "section titled by wave");
+	// both constituent rounds appear as sub-detail
+	assert.ok(html.includes('data-round="1"') && html.includes('data-round="2"'), "each round shown as sub-detail");
+	assert.ok(html.includes("(replacement)"), "a round whose label differs from the wave is marked a replacement");
+	// precision joined once on the wave
+	assert.ok(html.includes("raised 2") && html.includes("incorporated 1") && html.includes("dismissed 1"));
+});
+
 test("LT20: an empty-shell run.json fails to carry any pinned data binding", () => {
 	const html = renderDashboard(emptyFixture());
 	for (const anchor of SECTION_ANCHORS) assert.ok(html.includes(`id="${anchor}"`));
[Showing lines 3811-4705 of 4705 (50.0KB limit). Full output: /tmp/pi-bash-99e7130582b52ba1.log]
./pr-body.md
Not found at .pi/sdlc/pr-body.md
read: /home/neil/code/threadsafe/pi-sdlc.worktrees/feat-sdlc-re...
read: /home/neil/code/threadsafe/pi-sdlc.worktrees/feat-sdlc-re...
<!-- pi-sdlc lifecycle declaration: choose irreversible, reversible, or none. Non-none tracks require a slug; none requires a reason. Link the governing documents below. -->
```sdlc
track: reversible
slug: sdlc-retro-panel-precision
```
Makes the sdlc-retro collector preserve logical review-wave identity across
multi-round and infra-replacement panel harvests, and reconciles review-dir
naming so the collector actually discovers current-form directories.
Root problem (closes #118): the panel-precision join required exactly one
harvested panel directory per `(panelPhase, date)` — so any stream that ran a
fix wave (the common case) dropped all precision as `precision.unparsed`. And
`discoverReviewDirs` only matched `<phase>-<slug>-<date>`, silently ignoring
the `<phase>-review-<slug>-<date>` form the repo has used since 2026-07-14.
Design (all additive, reversible): `harvest-panel.mjs` gains an optional
`--wave` (defaults to `--round`) and writes a `{round,wave}` `meta.json`
sidecar; the collector reads it (absent → `wave=round`; malformed → fallback +
`panels.malformed_meta:<phase>` marker) and groups the precision join by
`(panelPhase, wave, date)`, emitting `precision.unparsed` only when waves
genuinely disagree; `render-retro` groups the deep-dive by wave, collapsing
same-wave rounds. The naming regex **and** `buildSoftData`'s phase extraction
now accept both forms; the spec and PR-review reference keep their original
naming line and gain `-review-` as an accepted alternative. `wave` is optional
on the `run.json` v1 record (validator + schema allow-not-require it), so every
existing record still validates — no v1→v2 bump.
## Governing documents
- Plan: `docs/plans/2026-07-19-sdlc-retro-panel-precision.md`
- Build plan: `docs/plans/2026-07-19-sdlc-retro-panel-precision-build.md`
- Reversible track — no Specification is required.
## Tracker references
- Epic: #120
- Tasks: Closes #121, Closes #122, Closes #123, Closes #124
- Board: pi-sdlc build board (org project 5)
## Assumptions & discretionary calls
Copied from the build-plan doc's "Assumptions" appendix:
- Four-task slicing (T1 harvest+telemetry → T2 naming → T3 collector consume →
  T4 render), with T3 blockedBy {T1,T2} and T4 blockedBy T3; T2 and T3 sequenced
  because both edit `buildSoftData`.
- `panelPrecision[]` carries both `round` and `wave` set to the wave value (the
  parked keep-vs-replace question, resolved "keep both"): `round` retained for
  `run.json` v1 validator compatibility, `wave` added for the render join.
- Validator model: `task_validate` primary `gpt-5.6-terra` deterministically
  echoed the acceptance-report template without running the runner (twice on
  T1); replaced with `anthropic/claude-haiku-4-5` per the dispatch-recovery
  rule for all four task validations.
#!/usr/bin/env node
// collect-run.mjs — the sdlc-retro post-mortem collector (spec §6). lt-t4
// built the hard, deterministic pipeline; lt-t5 (this revision) adds the LLM
// seam, soft data (narratives/steering/panelPrecision), the NF4 redaction/
// n-gram-containment pipeline, raw/ snapshotting of every non-manifest input,
// and --from-raw exclusive replay (spec §6.2/§6.4). Joins the FS13 run
// manifest, harvested panel artifacts, correlated pi session transcripts,
// discovered review directories, and injectable git/gh/llm seams into a
// schema-valid run.json (spec §7) with pinned derived-measure formulas
// (§6.3), uniform absence encoding, and the closed v1 coverage-marker set.
//
// Usage: collect-run.mjs --slug S [--out FILE] [--format text|json]
//                        [--from-raw] [--llm-cmd CMD | --no-llm]
//                        [--git-cmd CMD] [--base-ref BRANCH]
//                        [--gh-cmd CMD] [--no-github]
//                        [--sessions-dir DIR]... [--config DIR|--repo-root DIR]
// Exit: 0 success (run.json written, possibly with coverage markers);
//       1 nothing collectable (no manifest and no run store);
//       2 usage/operational error.
//
// sdlc-retro imports shared helpers from the sibling sdlc skill via
// package-relative paths (the package ships as one repository); it never
// resolves consumer paths through the skill root (spec §1).
import { execFileSync } from "node:child_process";
import { closeSync, existsSync, fsyncSync, mkdirSync, mkdtempSync, openSync, readdirSync, readFileSync, renameSync, rmSync, statSync, writeFileSync, writeSync } from "node:fs";
import { homedir } from "node:os";
import { basename, dirname, isAbsolute, join, resolve } from "node:path";
import { inspectRoot, readConfig } from "../../sdlc/scripts/lib.mjs";
import { buildRedactionValues, redact } from "../../sdlc/scripts/validate-task.mjs";
import { currentBranch, KNOWN_EVENTS, LIFECYCLE_PHASES, PANEL_PHASES, PANEL_TO_LIFECYCLE, runStoreDir, SLUG_RE, validateEnvelope, validatePayload } from "../../sdlc/scripts/telemetry.mjs";
// Reverse of PANEL_TO_LIFECYCLE: a review directory's <lifecycle-phase> prefix
// (spec §6.1 naming, e.g. "pr-<slug>-<date>") maps back to the panel phase
// whose harvested round it should be attributed to.
const LIFECYCLE_TO_PANEL = Object.fromEntries(Object.entries(PANEL_TO_LIFECYCLE).map(([panelPhase, lifecyclePhase]) => [lifecyclePhase, panelPhase]));
// NF4: committed soft strings are capped at 500 chars and rejected outright
// (never truncated) if they contain a >=12-consecutive-word verbatim
// substring of any correlated user message.
const SOFT_STRING_CAP = 500;
const NGRAM_LEN = 12;
const LLM_TIMEOUT_MS = 120000;
const STEERING_CLASSES = ["gate-approval", "correction", "scope-change", "unblock", "other"];
const PREFIX = "sdlc-telemetry:";
export const RUN_SCHEMA_VERSION = 1;
const HUMAN_WAIT_CAP_MS = 30 * 60 * 1000;
const SESSION_CORRELATION_BUFFER_MS = 60 * 60 * 1000;
function warn(msg) {
	process.stderr.write(`${PREFIX} ${msg}\n`);
}
// ---- raw/ snapshotting + --from-raw replay (spec §6.4) ---------------------
function rawDir(root, slug) {
	return join(runStoreDir(root, slug), "raw");
}
function snapshotRaw(root, slug, relPath, content) {
	const dest = join(rawDir(root, slug), relPath);
	mkdirSync(dirname(dest), { recursive: true });
	writeFileSync(dest, content);
}
function readRaw(root, slug, relPath) {
	return readFileSync(join(rawDir(root, slug), relPath), "utf8");
}
function rawExists(root, slug, relPath) {
	return existsSync(join(rawDir(root, slug), relPath));
}
function isPlainObject(v) {
	return typeof v === "object" && v !== null && !Array.isArray(v);
}
// ---- manifest adapter (spec §6.1.1) ---------------------------------------
// Reads events.jsonl; malformed/invalid lines are counted and skipped (never
// fatal). Returns { events, markers }. events are envelope objects sorted by
// ts (append order is already chronological; sorting is defense-in-depth).
export function readManifest(root, slug) {
	const path = join(runStoreDir(root, slug), "events.jsonl");
	if (!existsSync(path)) return { events: [], markers: [{ marker: "manifest.absent" }] };
	const raw = readFileSync(path, "utf8");
	const lines = raw.split("\n").filter((l) => l.length > 0);
	const events = [];
	let malformed = 0;
	for (const line of lines) {
		let obj;
		try {
			obj = JSON.parse(line);
		} catch {
			malformed++;
			continue;
		}
		const envIssues = validateEnvelope(obj);
		if (envIssues.length > 0 || !Number.isFinite(toMs(obj.ts))) {
			malformed++;
			continue;
		}
		// Unknown event types are tolerated structurally (not malformed) but
		// consumers MUST ignore them entirely (spec §3 forward-compat) — an
		// unrecognized future event type must never influence this collector's
		// window/measures. Only known-vocabulary payloads are checked and kept.
		if (!KNOWN_EVENTS.includes(obj.event)) continue;
		const payloadIssues = validatePayload(obj.event, obj.payload);
		if (payloadIssues.length > 0) {
			malformed++;
			continue;
		}
		events.push(obj);
	}
	// Compare by epoch value, not lexicographically: TS_RE admits both a bare
	// "...:00Z" and a fractional "...:00.500Z" second, which sort inverted as
	// strings ("Z" > "."). Real emitters always produce the fractional form,
	// but a hand-written record-run-event --payload line may not.
	events.sort((a, b) => new Date(a.ts).getTime() - new Date(b.ts).getTime());
	const markers = malformed > 0 ? [{ marker: "manifest.partial", detail: `${malformed} malformed line(s) skipped` }] : [];
	return { events, markers };
}
export function extractTitleTrack(events) {
	const started = events.find((e) => e.event === "run.started");
	if (!started) return {};
	return { title: started.payload.title, track: started.payload.track };
}
// ---- phase span derivation (spec §6.3) ------------------------------------
// A phase spans phase.entered.ts to its explicit phase.exited.ts when
// present, else the next phase.entered.ts, else the window end.
export function derivePhaseSpans(events, windowEnd) {
	const entries = events.filter((e) => e.event === "phase.entered" || e.event === "phase.exited");
	const spans = [];
	for (let i = 0; i < entries.length; i++) {
		const e = entries[i];
		if (e.event !== "phase.entered") continue;
		const phase = e.payload.phase;
		const explicitExit = entries.slice(i + 1).find((x) => x.event === "phase.exited" && x.payload.phase === phase);
		const nextEnter = entries.slice(i + 1).find((x) => x.event === "phase.entered");
		let end;
		let exitExplicit = false;
		if (explicitExit && (!nextEnter || toMs(explicitExit.ts) <= toMs(nextEnter.ts))) {
			end = explicitExit.ts;
			exitExplicit = true;
		} else if (nextEnter) {
			end = nextEnter.ts;
		} else {
			end = windowEnd;
		}
		spans.push({ phase, start: e.ts, end, exitExplicit });
	}
	return spans;
}
// Attribute a ts to the phase whose span contains it; "unattributed" when
// inside the window but outside every span; null when outside the window
// entirely (caller excludes it from per-phase figures).
export function attributePhase(spans, ts, windowStart, windowEnd) {
	const time = toMs(ts);
	if (time < toMs(windowStart) || time > toMs(windowEnd)) return null;
	for (const s of spans) {
		if (time >= toMs(s.start) && time <= toMs(s.end)) return s.phase;
	}
	return "unattributed";
}
// ---- panel harvest adapter (spec §6.1.2) ----------------------------------
const PANEL_DIR_RE = /^(plan_review|spec_review|pr_review|task_validate)-round(\d+)-(\d{4}-\d{2}-\d{2})$/;
// Tolerant extraction of per-model metrics from a pi-subagents status.json
// (lifecycleArtifactVersion 1 fields; unknown fields ignored, NF-forward
// compatible). A parallel/panel dispatch's per-child metrics live in
// `results[]`; a single-task status is treated as one implicit result.
function extractPanelModels(status) {
	if (!isPlainObject(status)) return [];
	const results = Array.isArray(status.results) ? status.results : [status];
	const models = [];
	for (const r of results) {
		if (!isPlainObject(r)) continue;
		const model = typeof r.model === "string" ? r.model : Array.isArray(r.attemptedModels) && typeof r.attemptedModels[0] === "string" ? r.attemptedModels[0] : undefined;
		if (!model) continue;
		const entry = { model };
		if (Number.isInteger(r.totalTokens) && r.totalTokens >= 0) entry.tokens = r.totalTokens;
		if (Number.isFinite(r.totalCost) && r.totalCost >= 0) entry.cost = r.totalCost;
		if (Number.isInteger(r.durationMs) && r.durationMs >= 0) entry.durationMs = r.durationMs;
		if (Number.isInteger(r.turnCount) && r.turnCount >= 0) entry.turns = r.turnCount;
		models.push(entry);
	}
	return models;
}
// Discover harvested panel directories on disk (spec §5 naming), independent
// of whether the manifest recorded a matching panel.harvested event (more
// resilient to a partially-instrumented run). Missing phases are derived by
// diffing panel-related manifest events against what is actually on disk.
export function discoverPanels(root, slug, events) {
	const panelsDir = join(runStoreDir(root, slug), "panels");
	const panels = [];
	const foundPhases = new Set();
	const partialPhases = new Set();
	const malformedMetaPhases = new Set();
	const byPhaseRound = new Map();
	if (existsSync(panelsDir)) {
		for (const name of readdirSync(panelsDir).sort()) {
			const m = PANEL_DIR_RE.exec(name);
			if (!m) continue;
			const [, panelPhase, roundStr, date] = m;
			const dir = join(panelsDir, name);
			if (!statSync(dir).isDirectory()) continue;
			const statusPath = join(dir, "status.json");
			const eventsPath = join(dir, "events.jsonl");
			if (!existsSync(statusPath) && !existsSync(eventsPath)) {
				partialPhases.add(panelPhase);
				continue;
			}
			let models = [];
			let statusValid = false;
			if (existsSync(statusPath)) {
				try {
					models = extractPanelModels(JSON.parse(readFileSync(statusPath, "utf8")));
					statusValid = true;
				} catch {
					// unparseable status.json: no per-model metrics for this round
				}
			}
			const complete = statusValid && existsSync(eventsPath);
			if (complete) foundPhases.add(panelPhase);
			else partialPhases.add(panelPhase);
			const round = Number(roundStr);
			// Logical review-wave from the meta.json sidecar (T1). Absent → wave=round
			// (every pre-sidecar harvest degrades cleanly). Malformed → wave=round and
			// a panels.malformed_meta marker; never throws (mirrors the tolerant
			// status.json handling above).
			let wave = round;
			const metaPath = join(dir, "meta.json");
			if (existsSync(metaPath)) {
				try {
					const meta = JSON.parse(readFileSync(metaPath, "utf8"));
					if (isPosInt(meta.wave)) wave = meta.wave;
					else malformedMetaPhases.add(panelPhase);
				} catch {
					malformedMetaPhases.add(panelPhase);
				}
			}
			const entry = { panelPhase, round, wave, dir: `.pi/sdlc/runs/${slug}/panels/${name}`, models, date, complete };
			// Dedupe by (panelPhase, round): a re-harvest of the same round across a
			// date boundary must not double-count hard totals. Keep the latest date.
			const key = `${panelPhase}#${round}`;
			const existing = byPhaseRound.get(key);
			if (!existing || (entry.complete && !existing.complete) || (entry.complete === existing.complete && date > existing.date)) byPhaseRound.set(key, entry);
		}
	}
	for (const { date, complete, ...entry } of byPhaseRound.values()) panels.push(entry);
	panels.sort((a, b) => (a.panelPhase < b.panelPhase ? -1 : a.panelPhase > b.panelPhase ? 1 : a.round - b.round));
	const expectedPhases = new Set();
	for (const e of events) {
		if (e.event === "panel.dispatched" || e.event === "panel.harvested" || e.event === "panel.consolidated") expectedPhases.add(e.payload.panelPhase);
	}
	const markers = [];
	for (const phase of [...new Set([...expectedPhases, ...partialPhases])].sort()) {
		if (!foundPhases.has(phase) || partialPhases.has(phase)) markers.push({ marker: `panels.missing:${phase}` });
	}
	for (const phase of [...malformedMetaPhases].sort()) markers.push({ marker: `panels.malformed_meta:${phase}` });
	return { panels, markers };
}
// ---- review-directory discovery (spec §6.1.4) -----------------------------
// Discovers panel-round review directories named <lifecycle-phase>-<slug>-<date>
// under the configured reviews path (default docs/reviews), and snapshots the
// discovered list into raw/ (spec §6.4: the directory listing itself is
// non-manifest input). --from-raw reads that snapshot exclusively and never
// touches the live reviews path.
export function discoverReviewDirs(root, slug, reviewsPath = "docs/reviews", { fromRaw = false } = {}) {
	const rawListPath = join("reviews", "_dirs.json");
	// Accept both the historical `<phase>-<slug>-<date>` and the now-dominant
	// `<phase>-review-<slug>-<date>` naming (the `-review-` infix). Slugs match
	// SLUG_RE (no regex-special chars), so interpolation is safe.
	const re = new RegExp(`^(${LIFECYCLE_PHASES.join("|")})-(?:review-)?${slug}-\\d{4}-\\d{2}-\\d{2}$`);
	if (fromRaw) {
		if (!rawExists(root, slug, rawListPath)) return [];
		try {
			const dirs = JSON.parse(readRaw(root, slug, rawListPath));
			return Array.isArray(dirs) ? dirs.filter((name) => typeof name === "string" && re.test(name)).sort() : [];
		} catch {
			return [];
		}
	}
	const base = join(root, reviewsPath);
	if (!existsSync(base)) {
		snapshotRaw(root, slug, rawListPath, "[]");
		return [];
	}
	const dirs = readdirSync(base)
		.filter((name) => re.test(name) && statSync(join(base, name)).isDirectory())
		.sort();
	snapshotRaw(root, slug, rawListPath, JSON.stringify(dirs));
	return dirs;
}
// ---- session adapter (spec §6.1.3) -----------------------------------------
// pi's on-disk session-directory naming convention: ~/.pi/agent/sessions/ +
// the absolute path with its leading '/' dropped, every '/' replaced by '-',
// wrapped as --<mapped>--.
function sessionDirFor(sessionsHome, absPath) {
	const mapped = absPath.replace(/^\//, "").replaceAll("/", "-");
	return join(sessionsHome, `--${mapped}--`);
}
// Candidate session directories: the consumer root and <root>.worktrees/*,
// under the observed pi convention, unless explicit --sessions-dir overrides
// are given (repeatable, and then used verbatim instead).
export function resolveSessionDirs(root, { sessionsDirOverrides = [], home = homedir() } = {}) {
	if (sessionsDirOverrides.length > 0) return { dirs: sessionsDirOverrides.filter((d) => existsSync(d)), markers: [] };
	const sessionsHome = join(home, ".pi", "agent", "sessions");
	const candidates = [sessionDirFor(sessionsHome, root)];
	const worktreesRoot = `${root}.worktrees`;
	if (existsSync(worktreesRoot)) {
		try {
			for (const name of readdirSync(worktreesRoot)) candidates.push(sessionDirFor(sessionsHome, join(worktreesRoot, name)));
		} catch {
			// unreadable worktrees root: fall through with what we have
		}
	}
	const dirs = candidates.filter((d) => existsSync(d));
	return { dirs, markers: dirs.length === 0 ? [{ marker: "sessions.dir_unresolved" }] : [] };
}
// Sniff + parse one top-level session JSONL file. Returns null (with a
// session.version:<file> marker pushed to `markers`) for a non-v3 header or
// an unreadable/empty file. `raw` is the verbatim file text, kept for §6.4
// snapshotting (never re-derived from the parsed entries).
function parseSessionFile(path, markers) {
	const name = basename(path);
	let raw;
	try {
		raw = readFileSync(path, "utf8");
	} catch {
		markers.push({ marker: `session.version:${name}` });
		return null;
	}
	const lines = raw.split("\n").filter(Boolean);
	if (lines.length === 0) {
		markers.push({ marker: `session.version:${name}` });
		return null;
	}
	let header;
	try {
		header = JSON.parse(lines[0]);
	} catch {
		markers.push({ marker: `session.version:${name}` });
		return null;
	}
	if (header.type !== "session" || header.version !== 3) {
		markers.push({ marker: `session.version:${name}` });
		return null;
	}
	const entries = [];
	for (const line of lines) {
		try {
			entries.push(JSON.parse(line));
		} catch {
			// a torn/malformed line within an otherwise-v3 file is skipped, not fatal
		}
	}
	return { file: name, entries, raw };
}
// --from-raw replay: every previously-snapshotted session file is trusted
// as already-correlated (it was only snapshotted because it correlated at
// original collect time); no live directory resolution or re-correlation.
function loadSessionsFromRaw(root, slug) {
	const dir = join(rawDir(root, slug), "sessions");
	if (!existsSync(dir)) return { sessions: [], markers: [{ marker: "sessions.none" }] };
	const markers = [];
	const sessions = [];
	for (const f of readdirSync(dir)
		.filter((f) => f.endsWith(".jsonl"))
		.sort()) {
		const parsed = parseSessionFile(join(dir, f), markers);
		if (parsed) sessions.push(parsed);
	}
	if (sessions.length === 0) markers.push({ marker: "sessions.none" });
	return { sessions, markers };
}
// A session is correlated iff at least one message entry's ts falls within
// [manifest first ts - 1h, manifest last ts + 1h].
function isCorrelated(session, windowStart, windowEnd) {
	for (const e of session.entries) {
		if (e.type !== "message" || typeof e.timestamp !== "string") continue;
		const time = toMs(e.timestamp);
		if (time >= toMs(windowStart) && time <= toMs(windowEnd)) return true;
	}
	return false;
}
export function discoverSessions(root, events, { sessionsDirOverrides = [], home, slug, fromRaw = false } = {}) {
	if (fromRaw) return loadSessionsFromRaw(root, slug);
	if (events.length === 0) return { sessions: [], markers: [{ marker: "sessions.none" }] };
	const first = events[0].ts;
	const last = events[events.length - 1].ts;
	const windowStart = new Date(new Date(first).getTime() - SESSION_CORRELATION_BUFFER_MS).toISOString();
	const windowEnd = new Date(new Date(last).getTime() + SESSION_CORRELATION_BUFFER_MS).toISOString();
	const { dirs, markers: dirMarkers } = resolveSessionDirs(root, { sessionsDirOverrides, home });
	const markers = [...dirMarkers];
	const sessions = [];
	for (const dir of dirs) {
		let files;
		try {
			files = readdirSync(dir).filter((f) => f.endsWith(".jsonl"));
		} catch {
			continue;
		}
		for (const f of files.sort()) {
			const parsed = parseSessionFile(join(dir, f), markers);
			if (!parsed) continue;
			if (!isCorrelated(parsed, windowStart, windowEnd)) continue;
			if (slug) snapshotRaw(root, slug, join("sessions", parsed.file), parsed.raw);
			sessions.push(parsed);
		}
	}
	if (sessions.length === 0) markers.push({ marker: "sessions.none" });
	return { sessions, markers };
}
// ---- derived hard measures (spec §6.3) ------------------------------------
function toMs(ts) {
	return new Date(ts).getTime();
}
// Agent time: Σ over assistant message entries of (assistant ts - ts of the
// immediately preceding JSONL entry in the same file; first entry contributes 0).
function agentTimeMs(session) {
	let total = 0;
	for (let i = 1; i < session.entries.length; i++) {
		const e = session.entries[i];
		if (e.type !== "message" || e.message?.role !== "assistant" || typeof e.timestamp !== "string") continue;
		const prev = session.entries[i - 1];
		if (typeof prev.timestamp !== "string") continue;
		const end = toMs(e.timestamp);
		const start = toMs(prev.timestamp);
		if (!Number.isFinite(end) || !Number.isFinite(start)) continue;
		total += Math.max(0, end - start);
	}
	return total;
}
// Human-wait: Σ over user entries of (user ts - ts of the immediately
// preceding entry) ONLY when that immediately preceding entry is an
// assistant message; each gap capped at 30 minutes, always a proxy.
function humanWaitMs(session) {
	let total = 0;
	for (let i = 1; i < session.entries.length; i++) {
		const e = session.entries[i];
		if (e.type !== "message" || e.message?.role !== "user" || typeof e.timestamp !== "string") continue;
		const prev = session.entries[i - 1];
		if (prev.type !== "message" || prev.message?.role !== "assistant" || typeof prev.timestamp !== "string") continue;
		const end = toMs(e.timestamp);
		const start = toMs(prev.timestamp);
		if (!Number.isFinite(end) || !Number.isFinite(start)) continue;
		const gap = Math.max(0, end - start);
		total += Math.min(gap, HUMAN_WAIT_CAP_MS);
	}
	return total;
}
function assistantEntries(session) {
	return session.entries.filter((e) => e.type === "message" && e.message?.role === "assistant");
}
// ---- git / github seams ----------------------------------------------------
export function gitDiffStats(gitCmd, root, baseRef) {
	try {
		const mergeBase = execFileSync(gitCmd, ["-C", root, "merge-base", baseRef, "HEAD"], { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] }).trim();
		const shortstat = execFileSync(gitCmd, ["-C", root, "diff", "--shortstat", `${mergeBase}...HEAD`], { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });
		const filesM = /(\d+) files? changed/.exec(shortstat);
		const insM = /(\d+) insertions?\(\+\)/.exec(shortstat);
		const delM = /(\d+) deletions?\(-\)/.exec(shortstat);
		return {
			diff: { files: filesM ? Number(filesM[1]) : 0, insertions: insM ? Number(insM[1]) : 0, deletions: delM ? Number(delM[1]) : 0 },
			markers: [],
		};
	} catch (err) {
		return { diff: undefined, markers: [{ marker: "git.error", detail: String(err?.message || err).slice(0, 200) }] };
	}
}
export function githubCheck(ghCmd, root, branch, noGithub) {
	if (noGithub) return { markers: [{ marker: "github.skipped" }] };
	try {
		const out = execFileSync(ghCmd, ["pr", "list", "--head", branch, "--json", "number"], { cwd: root, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });
		JSON.parse(out); // validated but not yet materialized into run.json (no v1 schema slot)
		return { markers: [] };
	} catch (err) {
		return { markers: [{ marker: "github.error", detail: String(err?.message || err).slice(0, 200) }] };
	}
}
// Raw-snapshotting/replay wrapper around gitDiffStats (spec §6.4): a live
// collect snapshots the raw command outputs into raw/git/diff.json;
// --from-raw reads that snapshot exclusively and never invokes --git-cmd.
function gitDiffStatsSeam(root, slug, gitCmd, baseRef, fromRaw) {
	const relPath = "git/diff.json";
	if (fromRaw) {
		if (!rawExists(root, slug, relPath)) return { diff: undefined, markers: [{ marker: "git.error", detail: "no raw/git/diff.json snapshot to replay" }] };
		try {
			const diff = JSON.parse(readRaw(root, slug, relPath));
			if (!isPlainObject(diff) || !isNonNegInt(diff.files) || !isNonNegInt(diff.insertions) || !isNonNegInt(diff.deletions) || Object.keys(diff).some((key) => !["files", "insertions", "deletions"].includes(key))) throw new Error("invalid diff shape");
			return { diff, markers: [] };
		} catch (err) {
			return { diff: undefined, markers: [{ marker: "git.error", detail: `corrupt raw/git/diff.json snapshot: ${err?.message || err}` }] };
		}
	}
	const result = gitDiffStats(gitCmd, root, baseRef);
	if (result.diff) snapshotRaw(root, slug, relPath, JSON.stringify(result.diff));
	return result;
}
// Same pattern for the github seam (spec §6.4): a live collect snapshots the
// raw response into raw/github/pr-list.json; --from-raw replays it and never
// invokes --gh-cmd. --no-github always short-circuits to github.skipped,
// live or replayed.
function githubCheckSeam(root, slug, ghCmd, branch, noGithub, fromRaw) {
	if (noGithub) return { markers: [{ marker: "github.skipped" }] };
	const relPath = "github/pr-list.json";
	if (fromRaw) {
		if (!rawExists(root, slug, relPath)) return { markers: [{ marker: "github.error", detail: "no raw/github/pr-list.json snapshot to replay" }] };
		return { markers: [] };
	}
	try {
		const out = execFileSync(ghCmd, ["pr", "list", "--head", branch, "--json", "number"], { cwd: root, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });
		JSON.parse(out);
		snapshotRaw(root, slug, relPath, out);
		return { markers: [] };
	} catch (err) {
		return { markers: [{ marker: "github.error", detail: String(err?.message || err).slice(0, 200) }] };
	}
}
// ---- LLM seam (spec §6.2) --------------------------------------------------
function validLlmResponse(response, request) {
	return isPlainObject(response) && response.kind === request.kind && typeof response.model === "string" && response.model.length > 0 && typeof response.provider === "string" && response.provider.length > 0 && isPlainObject(response.output);
}
function redactLlmValue(value, redactionValues) {
	if (typeof value === "string") return redact(value, redactionValues);
	if (Array.isArray(value)) return value.map((item) => redactLlmValue(item, redactionValues));
	if (isPlainObject(value)) return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, redactLlmValue(item, redactionValues)]));
	return value;
}
// One request per call, execFile-no-shell, one JSON request on stdin, one
// JSON response on stdout, default 120s timeout. Never throws; returns
// { ok:false, reason } on any failure (non-zero exit, timeout, invalid JSON,
// invalid response shape) so the caller can record the right marker.
export function callLlm(llmCmd, request, { timeoutMs = LLM_TIMEOUT_MS } = {}) {
	let out;
	try {
		out = execFileSync(llmCmd, [], { input: JSON.stringify(request), timeout: timeoutMs, encoding: "utf8", stdio: ["pipe", "pipe", "pipe"] });
	} catch (err) {
		return { ok: false, reason: err?.signal === "SIGTERM" || /ETIMEDOUT/.test(String(err?.message)) ? "timeout" : String(err?.message || err) };
	}
	let response;
	try {
		response = JSON.parse(out);
	} catch {
		return { ok: false, reason: "invalid JSON response" };
	}
	if (!validLlmResponse(response, request)) {
		return { ok: false, reason: "response missing/mismatched kind, model, provider, or object output" };
	}
	return { ok: true, response };
}
function validateNarrativeOutput(output) {
	return isPlainObject(output) && typeof output.summary === "string";
}
function validateSteeringOutput(output, expectedLength) {
	if (!isPlainObject(output) || !Array.isArray(output.classifications)) return false;
	if (output.classifications.length !== expectedLength) return false;
	return output.classifications.every((c) => isPlainObject(c) && Number.isInteger(c.index) && STEERING_CLASSES.includes(c.class));
}
function validatePrecisionOutput(output) {
	if (!isPlainObject(output) || !Array.isArray(output.perModel)) return false;
	return output.perModel.every((p) => isPlainObject(p) && typeof p.model === "string" && p.model.length > 0 && isNonNegInt(p.raised) && isNonNegInt(p.incorporated) && isNonNegInt(p.dismissed));
}
// ---- NF4: redaction + n-gram containment + 500-char cap ---------------------
// A committed soft string passes redaction, is rejected outright (not
// truncated) if it contains a >=12-consecutive-word verbatim substring of any
// correlated user message, then is capped at 500 chars. Returns the safe
// string or null (reject).
export function sanitizeSoftString(text, { redactionValues, userMessages }) {
	if (typeof text !== "string") return null;
	const afterRedaction = redact(text, redactionValues);
	if (containsUserNgram(afterRedaction, userMessages)) return null;
	return afterRedaction.length > SOFT_STRING_CAP ? afterRedaction.slice(0, SOFT_STRING_CAP) : afterRedaction;
}
function wordsOf(text) {
	return text.split(/\s+/).filter(Boolean);
}
// True iff `text` contains an NGRAM_LEN-consecutive-word verbatim substring of
// any string in `userMessages` (case-sensitive). Both sides are tokenized by
// the SAME whitespace split before comparison, so a newline or extra space
// anywhere inside the shared run of words cannot defeat the check (a raw
// substring match against un-normalized text would miss exactly that case).
export function containsUserNgram(text, userMessages) {
	const candidateWords = wordsOf(text);
	if (candidateWords.length < NGRAM_LEN) return false;
	const candidateGrams = new Set();
	for (let i = 0; i + NGRAM_LEN <= candidateWords.length; i++) candidateGrams.add(candidateWords.slice(i, i + NGRAM_LEN).join(" "));
	for (const msg of userMessages) {
		if (typeof msg !== "string") continue;
		const msgWords = wordsOf(msg);
		for (let i = 0; i + NGRAM_LEN <= msgWords.length; i++) {
			if (candidateGrams.has(msgWords.slice(i, i + NGRAM_LEN).join(" "))) return true;
		}
	}
	return false;
}
// Lighter NF4 pass for short LLM-controlled identifiers (attribution model/
// provider, per-model precision labels): redact + cap and prompt containment (these
// are still capped and checked for prompt containment, and an adversarial or
// misbehaving --llm-cmd must not be able to smuggle a secret into a committed
// identifier field).
const ATTRIBUTION_STRING_CAP = 200;
export function sanitizeAttributionString(value, redactionValues, userMessages = []) {
	if (typeof value !== "string") return null;
	const afterRedaction = redact(value, redactionValues);
	if (containsUserNgram(afterRedaction, userMessages)) return null;
	return afterRedaction.length > ATTRIBUTION_STRING_CAP ? afterRedaction.slice(0, ATTRIBUTION_STRING_CAP) : afterRedaction;
}
function safeAttribution(response, redactionValues, userMessages) {
	const model = sanitizeAttributionString(response.model, redactionValues, userMessages);
	const provider = sanitizeAttributionString(response.provider, redactionValues, userMessages);
	return model && provider ? { model, provider } : null;
}
// ---- run.json assembly ----------------------------------------------------
export function buildRunJson({ slug, title, track, coverage, sizeProxies, hard, soft }) {
	const out = { schemaVersion: RUN_SCHEMA_VERSION, slug, coverage, sizeProxies, hard };
	if (title !== undefined) out.title = title;
	if (track !== undefined) out.track = track;
	if (soft !== undefined) out.soft = soft;
	return out;
}
// ---- hand-rolled run.json validator (mirrors the committed schema, §7/NF2) -
function isNonNegInt(v) {
	return Number.isInteger(v) && v >= 0;
}
function isPosInt(v) {
	return Number.isInteger(v) && v > 0;
}
function isTs(v) {
	return typeof v === "string" && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?Z$/.test(v);
}
function checkKeys(obj, allowed, path, add) {
	if (!isPlainObject(obj)) return;
	for (const key of Object.keys(obj)) if (!allowed.includes(key)) add(path, `unknown property ${key}`);
}
export function validateRunJson(raw) {
	const issues = [];
	const add = (p, m) => issues.push(`${p}: ${m}`);
	if (!isPlainObject(raw)) return ["root: must be an object"];
	checkKeys(raw, ["schemaVersion", "slug", "title", "track", "coverage", "sizeProxies", "hard", "soft"], "/", add);
	if (raw.schemaVersion !== 1) add("/schemaVersion", "must be 1");
	if (typeof raw.slug !== "string" || !SLUG_RE.test(raw.slug)) add("/slug", "must match the slug grammar");
	if (raw.title !== undefined && (typeof raw.title !== "string" || raw.title.length === 0)) add("/title", "must be a non-empty string when present");
	if (raw.track !== undefined && (typeof raw.track !== "string" || raw.track.length === 0)) add("/track", "must be a non-empty string when present");
	if (!Array.isArray(raw.coverage)) add("/coverage", "must be an array");
	else
		raw.coverage.forEach((c, i) => {
			if (!isPlainObject(c) || typeof c.marker !== "string" || c.marker.length === 0 || (c.detail !== undefined && typeof c.detail !== "string")) add(`/coverage/${i}`, "must be {marker, detail?}");
			else checkKeys(c, ["marker", "detail"], `/coverage/${i}`, add);
		});
	const sp = raw.sizeProxies;
	if (!isPlainObject(sp)) add("/sizeProxies", "must be an object");
	else {
		checkKeys(sp, ["scenarios", "tasks", "diff", "sessions", "phases"], "/sizeProxies", add);
		if (!isNonNegInt(sp.scenarios)) add("/sizeProxies/scenarios", "must be a non-negative integer");
		if (!isNonNegInt(sp.tasks)) add("/sizeProxies/tasks", "must be a non-negative integer");
		if (!isNonNegInt(sp.sessions)) add("/sizeProxies/sessions", "must be a non-negative integer");
		if (!Array.isArray(sp.phases) || !sp.phases.every((p) => LIFECYCLE_PHASES.includes(p))) add("/sizeProxies/phases", "must be an array of lifecycle phases");
		if (sp.diff !== undefined && (!isPlainObject(sp.diff) || !isNonNegInt(sp.diff.files) || !isNonNegInt(sp.diff.insertions) || !isNonNegInt(sp.diff.deletions))) add("/sizeProxies/diff", "must be {files,insertions,deletions} when present");
		else if (sp.diff !== undefined) checkKeys(sp.diff, ["files", "insertions", "deletions"], "/sizeProxies/diff", add);
	}
	const h = raw.hard;
	if (!isPlainObject(h)) {
		add("/hard", "must be an object");
		return issues;
	}
	checkKeys(h, ["window", "phases", "sessions", "panels", "models", "rollups", "rework", "totals"], "/hard", add);
	if (!isPlainObject(h.window) || !isTs(h.window.start) || !isTs(h.window.end)) add("/hard/window", "must be {start, end} ISO timestamps");
	else checkKeys(h.window, ["start", "end"], "/hard/window", add);
	if (!Array.isArray(h.phases)) add("/hard/phases", "must be an array of {phase, start, end}");
	else
		h.phases.forEach((p, i) => {
			if (!isPlainObject(p) || !LIFECYCLE_PHASES.includes(p.phase) || !isTs(p.start) || !isTs(p.end) || (p.exitExplicit !== undefined && typeof p.exitExplicit !== "boolean")) add(`/hard/phases/${i}`, "must be {phase, start, end, exitExplicit?}");
			else checkKeys(p, ["phase", "start", "end", "exitExplicit"], `/hard/phases/${i}`, add);
		});
	if (!Array.isArray(h.sessions)) add("/hard/sessions", "must be an array of {file, start, end}");
	else
		h.sessions.forEach((s, i) => {
			if (!isPlainObject(s) || typeof s.file !== "string" || s.file.length === 0 || !isTs(s.start) || !isTs(s.end) || (s.models !== undefined && (!Array.isArray(s.models) || !s.models.every((m) => typeof m === "string" && m.length > 0)))) add(`/hard/sessions/${i}`, "must be {file, start, end, models[]?}");
			else checkKeys(s, ["file", "start", "end", "models"], `/hard/sessions/${i}`, add);
		});
	if (!Array.isArray(h.panels)) add("/hard/panels", "must be an array of {panelPhase, round, dir, models[]}");
	else
		h.panels.forEach((p, i) => {
			if (!isPlainObject(p) || !PANEL_PHASES.includes(p.panelPhase) || !isPosInt(p.round) || (p.wave !== undefined && !isPosInt(p.wave)) || typeof p.dir !== "string" || p.dir.length === 0 || !Array.isArray(p.models)) add(`/hard/panels/${i}`, "must be {panelPhase, round, dir, models[], wave?}");
			else {
				checkKeys(p, ["panelPhase", "round", "wave", "dir", "models"], `/hard/panels/${i}`, add);
				p.models.forEach((m, j) => {
					if (
						!isPlainObject(m) ||
						typeof m.model !== "string" ||
						m.model.length === 0 ||
						(m.tokens !== undefined && !isNonNegInt(m.tokens)) ||
						(m.cost !== undefined && (!Number.isFinite(m.cost) || m.cost < 0)) ||
						(m.durationMs !== undefined && !isNonNegInt(m.durationMs)) ||
						(m.turns !== undefined && !isNonNegInt(m.turns))
					)
						add(`/hard/panels/${i}/models/${j}`, "must match the panel model schema");
					else checkKeys(m, ["model", "tokens", "cost", "durationMs", "turns"], `/hard/panels/${i}/models/${j}`, add);
				});
			}
		});
	if (!Array.isArray(h.models) || !h.models.every((m) => typeof m === "string" && m.length > 0)) add("/hard/models", "must be an array of non-empty strings");
	if (!isPlainObject(h.rollups) || !Array.isArray(h.rollups.byModel) || !Array.isArray(h.rollups.byPhase)) add("/hard/rollups", "must be {byModel[], byPhase[]}");
	else {
		checkKeys(h.rollups, ["byModel", "byPhase"], "/hard/rollups", add);
		h.rollups.byModel.forEach((r, i) => {
			if (!isPlainObject(r) || typeof r.model !== "string" || r.model.length === 0 || !isNonNegInt(r.tokens) || !Number.isFinite(r.cost) || r.cost < 0) add(`/hard/rollups/byModel/${i}`, "must be {model, tokens, cost}");
			else checkKeys(r, ["model", "tokens", "cost"], `/hard/rollups/byModel/${i}`, add);
		});
		h.rollups.byPhase.forEach((r, i) => {
			if (!isPlainObject(r) || !LIFECYCLE_PHASES.includes(r.phase) || !isNonNegInt(r.tokens) || !Number.isFinite(r.cost) || r.cost < 0) add(`/hard/rollups/byPhase/${i}`, "must be {phase, tokens, cost}");
			else checkKeys(r, ["phase", "tokens", "cost"], `/hard/rollups/byPhase/${i}`, add);
		});
	}
	if (!isPlainObject(h.rework) || !isNonNegInt(h.rework.artifactRevised) || !isNonNegInt(h.rework.phaseBackward) || !isNonNegInt(h.rework.fixWave)) add("/hard/rework", "must be {artifactRevised,phaseBackward,fixWave}");
	else checkKeys(h.rework, ["artifactRevised", "phaseBackward", "fixWave"], "/hard/rework", add);
	const t = h.totals;
	if (!isPlainObject(t) || !isNonNegInt(t.tokens) || !Number.isFinite(t.cost) || t.cost < 0 || !isNonNegInt(t.wallMs) || !isNonNegInt(t.agentMs) || !isNonNegInt(t.humanWaitMs)) add("/hard/totals", "must be {tokens, cost, wallMs, agentMs, humanWaitMs}");
	else checkKeys(t, ["tokens", "cost", "wallMs", "agentMs", "humanWaitMs"], "/hard/totals", add);
	if (raw.soft !== undefined) {
		const sf = raw.soft;
		if (!isPlainObject(sf)) add("/soft", "must be an object when present");
		else {
			checkKeys(sf, ["attribution", "narratives", "steering", "panelPrecision"], "/soft", add);
			if (!isPlainObject(sf.attribution) || typeof sf.attribution.model !== "string" || sf.attribution.model.length === 0 || typeof sf.attribution.provider !== "string" || sf.attribution.provider.length === 0) add("/soft/attribution", "must be {model, provider}");
			else checkKeys(sf.attribution, ["model", "provider"], "/soft/attribution", add);
			if (!Array.isArray(sf.narratives)) add("/soft/narratives", "must be an array of {phase, summary<=500}");
			else
				sf.narratives.forEach((n, i) => {
					if (!isPlainObject(n) || !LIFECYCLE_PHASES.includes(n.phase) || typeof n.summary !== "string" || n.summary.length > 500) add(`/soft/narratives/${i}`, "must be {phase, summary<=500}");
					else checkKeys(n, ["phase", "summary"], `/soft/narratives/${i}`, add);
				});
			const steeringClasses = new Set(["gate-approval", "correction", "scope-change", "unblock", "other"]);
			if (!Array.isArray(sf.steering)) add("/soft/steering", "must be an array of {index, ts, class}");
			else
				sf.steering.forEach((s, i) => {
					if (!isPlainObject(s) || !isNonNegInt(s.index) || !isTs(s.ts) || !steeringClasses.has(s.class)) add(`/soft/steering/${i}`, "must be {index, ts, class}");
					else checkKeys(s, ["index", "ts", "class"], `/soft/steering/${i}`, add);
				});
			if (!Array.isArray(sf.panelPrecision)) add("/soft/panelPrecision", "must be an array of {panelPhase, round, model, raised, incorporated, dismissed}");
			else
				sf.panelPrecision.forEach((p, i) => {
					if (!isPlainObject(p) || !PANEL_PHASES.includes(p.panelPhase) || !isPosInt(p.round) || (p.wave !== undefined && !isPosInt(p.wave)) || typeof p.model !== "string" || p.model.length === 0 || !isNonNegInt(p.raised) || !isNonNegInt(p.incorporated) || !isNonNegInt(p.dismissed))
						add(`/soft/panelPrecision/${i}`, "must match the panelPrecision schema");
					else checkKeys(p, ["panelPhase", "round", "wave", "model", "raised", "incorporated", "dismissed"], `/soft/panelPrecision/${i}`, add);
				});
		}
	}
	return issues;
}
// ---- soft data assembly (spec §6.2) -----------------------------------------
function userText(entry) {
	if (entry?.type !== "message" || entry.message?.role !== "user") return "";
	const content = entry.message.content;
	if (!Array.isArray(content)) return "";
	return content
		.filter((b) => b?.type === "text" && typeof b.text === "string")
		.map((b) => b.text)
		.join("\n");
}
function turnsFor(session, spans, phase, windowStart, windowEnd) {
	return session.entries.filter((e) => e.type === "message" && e.message && typeof e.timestamp === "string" && attributePhase(spans, e.timestamp, windowStart, windowEnd) === phase).map((e) => ({ ts: e.timestamp, role: e.message.role, ...(e.message.model ? { model: e.message.model } : {}) }));
}
function eventsFor(events, phase, spans) {
	const phaseSpans = spans.filter((s) => s.phase === phase);
	if (phaseSpans.length === 0) return [];
	return events.filter((e) => phaseSpans.some((span) => toMs(e.ts) >= toMs(span.start) && toMs(e.ts) <= toMs(span.end)));
}
// One LLM call per phase/session/review-round respectively (call count is
// fixture-predictable, spec §6.2). fromRaw replays raw/llm/<name>.json pairs
// exclusively and never invokes llmCmd.
function llmCall(root, slug, name, request, llmCmd, fromRaw, timeoutMs, redactionValues) {
	const relPath = `llm/${name}.json`;
	if (fromRaw) {
		if (!rawExists(root, slug, relPath)) return { ok: false, reason: "no raw snapshot to replay" };
		try {
			const pair = JSON.parse(readRaw(root, slug, relPath));
			if (!isPlainObject(pair) || !validLlmResponse(pair.response, request)) return { ok: false, reason: "corrupt raw snapshot: invalid response" };
			return { ok: true, response: pair.response };
		} catch (err) {
			return { ok: false, reason: `corrupt raw snapshot: ${err?.message || err}` };
		}
	}
	const result = callLlm(llmCmd, request, { timeoutMs });
	if (result.ok) {
		const response = redactLlmValue(result.response, redactionValues);
		snapshotRaw(root, slug, relPath, JSON.stringify({ request, response }, null, 2));
	}
	return result;
}
function buildSoftData({ root, slug, llmCmd, noLlm, fromRaw, events, spans, sessions, panels, reviewDirs, windowStart, windowEnd, reviewsPath, llmTimeoutMs = LLM_TIMEOUT_MS }) {
	if (noLlm || (!llmCmd && !fromRaw)) return { soft: undefined, markers: [{ marker: "soft.absent" }] };
	// Live collection captures already-redacted LLM responses into raw/. Replay
	// must not consult a different process environment and redact benign words
	// differently, or byte-identical regeneration would be impossible.
	const redactionValues = fromRaw ? [] : buildRedactionValues(process.env);
	const allUserMessages = sessions.flatMap((s) => s.entries.map(userText).filter(Boolean));
	const markers = [];
	let attribution;
	let narrativeFailed = false;
	let steeringFailed = false;
	const narratives = [];
	for (const phase of [...new Set(spans.map((s) => s.phase))]) {
		const request = { kind: "narrative", slug, inputs: { phase, events: eventsFor(events, phase, spans), turns: sessions.flatMap((s) => turnsFor(s, spans, phase, windowStart, windowEnd)) } };
		const result = llmCall(root, slug, `narrative-${phase}`, request, llmCmd, fromRaw, llmTimeoutMs, redactionValues);
		if (!result.ok || !validateNarrativeOutput(result.response.output)) {
			narrativeFailed = true;
			continue;
		}
		const summary = sanitizeSoftString(result.response.output.summary, { redactionValues, userMessages: allUserMessages });
		const responseAttribution = safeAttribution(result.response, redactionValues, allUserMessages);
		if (summary === null || !responseAttribution) {
			narrativeFailed = true;
			continue;
		}
		attribution ??= responseAttribution;
		narratives.push({ phase, summary });
	}
	if (narrativeFailed) markers.push({ marker: "llm.error:narrative" });
	const steering = [];
	for (const s of sessions) {
		const userTurns = s.entries.filter((e) => e.type === "message" && e.message?.role === "user" && typeof e.timestamp === "string").map((e, i) => ({ index: i, ts: e.timestamp, text: userText(e) }));
		if (userTurns.length === 0) continue;
		const request = { kind: "steering", slug, inputs: { sessionId: s.file, userTurns: userTurns.map(({ index, ts, text }) => ({ index, ts, text })) } };
		const result = llmCall(root, slug, `steering-${s.file}`, request, llmCmd, fromRaw, llmTimeoutMs, redactionValues);
		if (!result.ok || !validateSteeringOutput(result.response.output, userTurns.length)) {
			steeringFailed = true;
			continue;
		}
		const responseAttribution = safeAttribution(result.response, redactionValues, allUserMessages);
		if (!responseAttribution) {
			steeringFailed = true;
			continue;
		}
		attribution ??= responseAttribution;
		for (const c of result.response.output.classifications) {
			const turn = userTurns[c.index];
			if (turn) steering.push({ index: c.index, ts: turn.ts, class: c.class });
		}
	}
	if (steeringFailed) markers.push({ marker: "llm.error:steering" });
	const panelPrecision = [];
	for (const dir of reviewDirs) {
		// Match both naming forms (see discoverReviewDirs): the `-review-` infix
		// must be accepted here too, or every `-review-` directory silently yields
		// no panelPhase and an unparsed precision marker.
		const lifecyclePhase = LIFECYCLE_PHASES.find((phase) => dir.startsWith(`${phase}-${slug}-`) || dir.startsWith(`${phase}-review-${slug}-`));
		const panelPhase = lifecyclePhase ? LIFECYCLE_TO_PANEL[lifecyclePhase] : undefined;
		const reviewDate = dir.match(/-(\d{4}-\d{2}-\d{2})$/)?.[1];
		const matchingPanels = panelPhase ? panels.filter((p) => p.panelPhase === panelPhase) : [];
		const datedPanels = reviewDate ? matchingPanels.filter((p) => p.dir.endsWith(`-${reviewDate}`)) : matchingPanels;
		const candidates = datedPanels.length > 0 ? datedPanels : matchingPanels;
		// Group by logical wave, not harvest round: multiple same-day rounds of one
		// review wave (e.g. an infra-replacement dispatch) share a wave and join
		// cleanly. precision.unparsed is emitted only when the candidates span more
		// than one distinct wave (a genuine same-date ambiguity) or none match.
		const waves = [...new Set(candidates.map((p) => p.wave))];
		const wave = waves.length === 1 ? waves[0] : undefined;
		if (candidates.length === 0 || wave === undefined) {
			markers.push({ marker: `precision.unparsed:${dir}` });
			continue;
		}
		const panel = candidates[0];
		// Replay reads only raw/reviews/<dir>; it must not consult a mutated or
		// deleted live reviews directory after the original collection.
		const dirPath = fromRaw ? join(rawDir(root, slug), "reviews", dir) : join(root, reviewsPath, dir);
		let consolidatedText = "";
		let findingsText = "";
		const modelFiles = [];
		try {
			for (const f of readdirSync(dirPath).sort()) {
				const text = readFileSync(join(dirPath, f), "utf8");
				if (!fromRaw) snapshotRaw(root, slug, join("reviews", dir, f), text);
				if (f === "consolidated.md") consolidatedText = text;
				else {
					modelFiles.push(f);
					findingsText += text;
				}
			}
		} catch {
			markers.push({ marker: `precision.unparsed:${dir}` });
			continue;
		}
		const request = { kind: "precision", slug, inputs: { reviewDir: dir, models: modelFiles, findingsText, consolidatedText } };
		const result = llmCall(root, slug, `precision-${dir}`, request, llmCmd, fromRaw, llmTimeoutMs, redactionValues);
		if (!result.ok || !validatePrecisionOutput(result.response.output)) {
			markers.push({ marker: `precision.unparsed:${dir}` });
			continue;
		}
		const responseAttribution = safeAttribution(result.response, redactionValues, allUserMessages);
		if (!responseAttribution) {
			markers.push({ marker: `precision.unparsed:${dir}` });
			continue;
		}
		attribution ??= responseAttribution;
		let precisionModelRejected = false;
		for (const pm of result.response.output.perModel) {
			const model = sanitizeAttributionString(pm.model, redactionValues, allUserMessages);
			if (!model) {
				precisionModelRejected = true;
				continue;
			}
			panelPrecision.push({
				panelPhase: panel.panelPhase,
				round: wave,
				wave,
				model,
				raised: pm.raised,
				incorporated: pm.incorporated,
				dismissed: pm.dismissed,
			});
		}
		if (precisionModelRejected) markers.push({ marker: `precision.unparsed:${dir}` });
	}
	if (!attribution) return { soft: undefined, markers: [...markers, { marker: "soft.absent" }] };
	return { soft: { attribution, narratives, steering, panelPrecision }, markers };
}
// ---- collection orchestration ----------------------------------------------
export function collect({ root, slug, gitCmd = "git", baseRef = "main", ghCmd = "gh", noGithub = false, sessionsDirOverrides = [], home, reviewsPath = "docs/reviews", llmCmd, noLlm = false, fromRaw = false, llmTimeoutMs = LLM_TIMEOUT_MS }) {
	const { events, markers: manifestMarkers } = readManifest(root, slug);
	const { title, track } = extractTitleTrack(events);
	const { panels, markers: panelMarkers } = discoverPanels(root, slug, events);
	const { sessions, markers: sessionMarkers } = discoverSessions(root, events, { sessionsDirOverrides, home, slug, fromRaw });
	const reviewDirs = discoverReviewDirs(root, slug, reviewsPath, { fromRaw });
	const { diff, markers: gitMarkers } = gitDiffStatsSeam(root, slug, gitCmd, baseRef, fromRaw);
	const branch = fromRaw || noGithub ? slug : currentBranch(root) || slug;
	const { markers: ghMarkers } = githubCheckSeam(root, slug, ghCmd, branch, noGithub, fromRaw);
	const windowStart = events.length > 0 ? events[0].ts : new Date(0).toISOString();
	const windowEnd = events.length > 0 ? events[events.length - 1].ts : new Date(0).toISOString();
	const spans = derivePhaseSpans(events, windowEnd);
	// rollups: sessions contribute per assistant-message tokens/cost attributed
	// by phase span; panels contribute their harvested per-model totals
	// attributed via the fixed panelPhase -> lifecycle mapping. Disjoint by
	// construction (nested child sessions are excluded from correlation).
	const byModelMap = new Map();
	const byPhaseMap = new Map();
	const addRollup = (model, phase, tokens, cost) => {
		if (model) {
			const cur = byModelMap.get(model) ?? { tokens: 0, cost: 0 };
			cur.tokens += tokens;
			cur.cost += cost;
			byModelMap.set(model, cur);
		}
		if (phase) {
			const cur = byPhaseMap.get(phase) ?? { tokens: 0, cost: 0 };
			cur.tokens += tokens;
			cur.cost += cost;
			byPhaseMap.set(phase, cur);
		}
	};
	let totalTokens = 0;
	let totalCost = 0;
	let totalAgentMs = 0;
	let totalHumanWaitMs = 0;
	const hardSessions = [];
	const distinctModels = new Set();
	for (const s of sessions) {
		const aEntries = assistantEntries(s);
		let sessStart;
		let sessEnd;
		const sessModels = new Set();
		for (const e of aEntries) {
			const ts = e.timestamp;
			if (typeof ts !== "string" || !Number.isFinite(toMs(ts))) continue;
			if (!sessStart || toMs(ts) < toMs(sessStart)) sessStart = ts;
			if (!sessEnd || toMs(ts) > toMs(sessEnd)) sessEnd = ts;
			const model = e.message?.model;
			const tokens = Number.isInteger(e.message?.usage?.totalTokens) ? e.message.usage.totalTokens : 0;
			const rawCost = e.message?.usage?.cost?.total;
			const cost = Number.isFinite(rawCost) && rawCost >= 0 ? rawCost : 0;
			totalTokens += tokens;
			totalCost += cost;
			if (model) {
				distinctModels.add(model);
				sessModels.add(model);
			}
			const phase = attributePhase(spans, ts, windowStart, windowEnd);
			addRollup(model, phase && phase !== "unattributed" ? phase : undefined, tokens, cost);
		}
		totalAgentMs += agentTimeMs(s);
		totalHumanWaitMs += humanWaitMs(s);
		if (sessStart && sessEnd) hardSessions.push({ file: s.file, start: sessStart, end: sessEnd, models: [...sessModels].sort() });
	}
	for (const p of panels) {
		const phase = PANEL_TO_LIFECYCLE[p.panelPhase];
		for (const m of p.models) {
			distinctModels.add(m.model);
			addRollup(m.model, phase, m.tokens ?? 0, m.cost ?? 0);
			totalTokens += m.tokens ?? 0;
			totalCost += m.cost ?? 0;
		}
	}
	const rework = {
		artifactRevised: events.filter((e) => e.event === "artifact.revised").length,
[Showing lines 1-1064 of 1236 (50.0KB limit). Use offset=1065 to continue.]
read: /home/neil/code/threadsafe/pi-sdlc.worktrees/feat-sdlc-re...
read: /home/neil/code/threadsafe/pi-sdlc.worktrees/feat-sdlc-re...
read: /home/neil/code/threadsafe/pi-sdlc.worktrees/feat-sdlc-re...
read: /home/neil/code/threadsafe/pi-sdlc.worktrees/feat-sdlc-re...
		phaseBackward: events.filter((e) => e.event === "phase.backward").length,
		fixWave: events.filter((e) => e.event === "pr.fix_wave").length,
	};
	const wallMs = events.length > 0 ? Math.max(0, toMs(windowEnd) - toMs(windowStart)) : 0;
	const taskEvents = events.filter((e) => e.event === "task.validated");
	const scenarioIds = new Set();
	const taskIds = new Set();
	for (const e of taskEvents) {
		taskIds.add(e.payload.task);
		for (const s of e.payload.scenarioIds) scenarioIds.add(s);
	}
	const phasesPresent = [...new Set(events.filter((e) => e.event === "phase.entered").map((e) => e.payload.phase))].sort((a, b) => LIFECYCLE_PHASES.indexOf(a) - LIFECYCLE_PHASES.indexOf(b));
	const sizeProxies = {
		scenarios: scenarioIds.size,
		tasks: taskIds.size,
		sessions: sessions.length,
		phases: phasesPresent,
	};
	if (diff) sizeProxies.diff = diff;
	const hard = {
		window: { start: windowStart, end: windowEnd },
		phases: spans.map((s) => ({ phase: s.phase, start: s.start, end: s.end, exitExplicit: s.exitExplicit })),
		sessions: hardSessions,
		panels: panels.map((p) => ({ panelPhase: p.panelPhase, round: p.round, wave: p.wave, dir: p.dir, models: p.models })),
		models: [...distinctModels].sort(),
		rollups: {
			byModel: [...byModelMap.entries()].map(([model, v]) => ({ model, tokens: v.tokens, cost: v.cost })).sort((a, b) => (a.model < b.model ? -1 : 1)),
			byPhase: [...byPhaseMap.entries()].map(([phase, v]) => ({ phase, tokens: v.tokens, cost: v.cost })).sort((a, b) => LIFECYCLE_PHASES.indexOf(a.phase) - LIFECYCLE_PHASES.indexOf(b.phase)),
		},
		rework,
		totals: { tokens: totalTokens, cost: totalCost, wallMs, agentMs: totalAgentMs, humanWaitMs: totalHumanWaitMs },
	};
	const { soft, markers: softMarkers } = buildSoftData({ root, slug, llmCmd, noLlm, fromRaw, events, spans, sessions, panels, reviewDirs, windowStart, windowEnd, reviewsPath, llmTimeoutMs });
	const coverage = [...manifestMarkers, ...panelMarkers, ...sessionMarkers, ...gitMarkers, ...ghMarkers, ...softMarkers];
	const runJson = buildRunJson({ slug, title, track, coverage, sizeProxies, hard, soft });
	return { runJson };
}
// ---- atomic write -----------------------------------------------------------
function atomicWriteJson(target, obj) {
	const parent = dirname(target);
	mkdirSync(parent, { recursive: true });
	const tmp = mkdtempSync(join(parent, ".collect-run-"));
	const tmpFile = join(tmp, "run.json");
	const json = `${JSON.stringify(obj, null, 2)}\n`;
	const fd = openSync(tmpFile, "w");
	try {
		writeSync(fd, json);
		fsyncSync(fd);
	} finally {
		closeSync(fd);
	}
	renameSync(tmpFile, target);
	rmSync(tmp, { recursive: true, force: true });
}
// ---- CLI --------------------------------------------------------------------
function parseArgs(argv) {
	const opts = { format: "text", sessionsDirOverrides: [], noGithub: false, gitCmd: "git", baseRef: "main", ghCmd: "gh" };
	for (let i = 0; i < argv.length; i++) {
		const a = argv[i];
		const val = () => {
			const v = argv[++i];
			if (v === undefined) throw new Error(`${a} requires a value`);
			return v;
		};
		if (a === "--slug") opts.slug = val();
		else if (a === "--out") opts.out = val();
		else if (a === "--format") {
			const f = val();
			if (f !== "text" && f !== "json") throw new Error("--format must be text or json");
			opts.format = f;
		} else if (a === "--git-cmd") opts.gitCmd = val();
		else if (a === "--base-ref") opts.baseRef = val();
		else if (a === "--gh-cmd") opts.ghCmd = val();
		else if (a === "--no-github") opts.noGithub = true;
		else if (a === "--sessions-dir") opts.sessionsDirOverrides.push(val());
		else if (a === "--llm-cmd") opts.llmCmd = val();
		else if (a === "--no-llm") opts.noLlm = true;
		else if (a === "--from-raw") opts.fromRaw = true;
		else if (a === "--config") opts.config = val();
		else if (a === "--repo-root") opts.repoRoot = val();
		else if (a === "-h" || a === "--help") opts.help = true;
		else throw new Error(`unexpected argument: ${a}`);
	}
	if (opts.llmCmd !== undefined && opts.noLlm) throw new Error("--llm-cmd and --no-llm are mutually exclusive");
	return opts;
}
function usage() {
	return "usage: collect-run.mjs --slug S [--out FILE] [--format text|json] [--from-raw] [--llm-cmd CMD | --no-llm] [--git-cmd CMD] [--base-ref BRANCH] [--gh-cmd CMD] [--no-github] [--sessions-dir DIR]... [--config DIR|--repo-root DIR]";
}
function main() {
	let opts;
	try {
		opts = parseArgs(process.argv.slice(2));
	} catch (e) {
		warn(String(e.message || e));
		process.exit(2);
	}
	if (opts.help) {
		console.log(usage());
		process.exit(0);
	}
	if (!opts.slug) {
		warn(usage());
		process.exit(2);
	}
	const rootResult = inspectRoot({ config: opts.config, repoRoot: opts.repoRoot });
	if (!rootResult.ok) {
		warn(`sdlc: ${rootResult.message}`);
		process.exit(2);
	}
	const root = rootResult.root;
	const cfg = readConfig(root);
	const reviewsPath = cfg.paths?.reviews ?? "docs/reviews";
	if (!existsSync(runStoreDir(root, opts.slug))) {
		warn(`nothing collectable for slug '${opts.slug}': no run store at ${runStoreDir(root, opts.slug)}`);
		process.exit(1);
	}
	const { runJson } = collect({
		root,
		slug: opts.slug,
		gitCmd: opts.gitCmd,
		baseRef: opts.baseRef,
		ghCmd: opts.ghCmd,
		noGithub: opts.noGithub,
		sessionsDirOverrides: opts.sessionsDirOverrides,
		reviewsPath,
		llmCmd: opts.llmCmd,
		noLlm: opts.noLlm ?? false,
		fromRaw: opts.fromRaw ?? false,
	});
	const issues = validateRunJson(runJson);
	if (issues.length > 0) {
		warn(`internal error: assembled run.json failed its own schema: ${issues.join("; ")}`);
		process.exit(2);
	}
	const outPath = opts.out ? (isAbsolute(opts.out) ? opts.out : resolve(root, opts.out)) : join(root, "docs", "retros", opts.slug, "run.json");
	try {
		atomicWriteJson(outPath, runJson);
	} catch (err) {
		warn(`cannot write ${outPath}: ${err?.message || err}`);
		process.exit(2);
	}
	const relOut = outPath.startsWith(`${root}/`) ? outPath.slice(root.length + 1) : outPath;
	const warnings = runJson.coverage.map((c) => c.marker);
	if (opts.format === "json") {
		console.log(JSON.stringify({ ok: true, out: relOut, coverage: warnings, warnings: [] }, null, 2));
	} else {
		console.log(`collected: ${relOut}`);
		for (const w of warnings) console.log(`  coverage: ${w}`);
	}
	process.exit(0);
}
if (import.meta.url === `file://${process.argv[1]}`) main();
#!/usr/bin/env node
// render-retro.mjs — the sdlc-retro dashboard renderer (spec §8, lt-t6).
// Turns one run.json into a single self-contained, offline, deterministic
// HTML dashboard: seven anchored sections, pinned per-section data bindings,
// soft-data flagging with attribution, coverage notices for absent inputs.
// Never invokes a model; embeds no generation-time values; consumes run.json
// alone.
//
// Usage: render-retro.mjs --run FILE [--out FILE] [--format text|json]
// Exit: 0 written; 1 --run unreadable/unparseable/schema-invalid;
//       2 usage error or an unwritable --out.
import { closeSync, existsSync, fsyncSync, mkdtempSync, openSync, readFileSync, renameSync, rmSync, statSync, writeSync } from "node:fs";
import { dirname, isAbsolute, join, resolve } from "node:path";
import { validateRunJson } from "./collect-run.mjs";
const PREFIX = "sdlc-telemetry:";
function warn(msg) {
	process.stderr.write(`${PREFIX} ${msg}\n`);
}
function esc(s) {
	return String(s ?? "")
		.replaceAll("&", "&amp;")
		.replaceAll("<", "&lt;")
		.replaceAll(">", "&gt;")
		.replaceAll('"', "&quot;")
		.replaceAll("'", "&#39;");
}
function fmtMs(ms) {
	if (!Number.isFinite(ms)) return "0ms";
	if (ms < 1000) return `${ms}ms`;
	const s = ms / 1000;
	if (s < 60) return `${s.toFixed(1)}s`;
	const m = s / 60;
	if (m < 60) return `${m.toFixed(1)}m`;
	return `${(m / 60).toFixed(2)}h`;
}
function fmtCost(cost) {
	return `$${Number(cost ?? 0).toFixed(4)}`;
}
// ---- section renderers (spec §8 pinned data bindings) ----------------------
function renderExecStrip(run) {
	const t = run.hard.totals;
	return `<section id="exec-strip">
<h2>Executive strip</h2>
<div class="strip">
<div class="metric" data-metric="tokens"><span class="label">Tokens</span><span class="value">${t.tokens}</span></div>
<div class="metric" data-metric="cost"><span class="label">Cost</span><span class="value">${esc(fmtCost(t.cost))}</span></div>
<div class="metric" data-metric="wallMs"><span class="label">Wall time</span><span class="value">${esc(fmtMs(t.wallMs))}</span></div>
<div class="metric" data-metric="agentMs"><span class="label">Agent time</span><span class="value">${esc(fmtMs(t.agentMs))}</span></div>
<div class="metric" data-metric="humanWaitMs"><span class="label">Human wait (proxy)</span><span class="value">${esc(fmtMs(t.humanWaitMs))}</span></div>
</div>
</section>`;
}
function renderPhaseSwimlane(run) {
	const phases = run.hard.phases;
	if (phases.length === 0) return `<section id="phase-swimlane"><h2>Phase swimlane</h2><p class="coverage-notice">no phase spans recorded in this run's manifest</p></section>`;
	const rows = phases.map((p) => `<div class="phase-row" data-phase="${esc(p.phase)}"><span class="phase-name">${esc(p.phase)}</span><span class="phase-start">${esc(p.start)}</span><span class="phase-end">${esc(p.end)}</span>${p.exitExplicit ? "" : '<span class="phase-derived">(derived end)</span>'}</div>`).join("\n");
	return `<section id="phase-swimlane">
<h2>Phase swimlane</h2>
${rows}
</section>`;
}
function renderCostBreakdown(run) {
	const { byModel, byPhase } = run.hard.rollups;
	if (byModel.length === 0 && byPhase.length === 0) return `<section id="cost-breakdown"><h2>Cost breakdown</h2><p class="coverage-notice">no rollup data (no correlated sessions or panel harvests)</p></section>`;
	const modelRows = byModel.map((m) => `<div class="rollup-row" data-model="${esc(m.model)}"><span class="rollup-key">${esc(m.model)}</span><span class="rollup-tokens">${m.tokens}</span><span class="rollup-cost">${esc(fmtCost(m.cost))}</span></div>`).join("\n");
	const phaseRows = byPhase.map((p) => `<div class="rollup-row" data-phase="${esc(p.phase)}"><span class="rollup-key">${esc(p.phase)}</span><span class="rollup-tokens">${p.tokens}</span><span class="rollup-cost">${esc(fmtCost(p.cost))}</span></div>`).join("\n");
	return `<section id="cost-breakdown">
<h2>Cost breakdown</h2>
<h3>By model</h3>
${modelRows || '<p class="coverage-notice">no by-model rollups</p>'}
<h3>By phase</h3>
${phaseRows || '<p class="coverage-notice">no by-phase rollups</p>'}
</section>`;
}
function renderPanelDeepdive(run) {
	const panels = run.hard.panels;
	const precision = run.soft?.panelPrecision ?? [];
	if (panels.length === 0) return `<section id="panel-deepdive"><h2>Panel deep-dive</h2><p class="coverage-notice">no harvested panel rounds</p></section>`;
	// Group harvested rounds by logical wave (wave defaults to round for records
	// predating the wave field), collapsing same-wave rounds (e.g. an
	// infra-replacement dispatch) into one section with each round as sub-detail.
	const groups = new Map();
	for (const p of panels) {
		const wave = p.wave ?? p.round;
		const key = `${p.panelPhase}#${wave}`;
		if (!groups.has(key)) groups.set(key, { panelPhase: p.panelPhase, wave, rounds: [] });
		groups.get(key).rounds.push(p);
	}
	const ordered = [...groups.values()].sort((a, b) => (a.panelPhase < b.panelPhase ? -1 : a.panelPhase > b.panelPhase ? 1 : a.wave - b.wave));
	const blocks = ordered
		.map((g) => {
			const roundBlocks = g.rounds
				.slice()
				.sort((a, b) => a.round - b.round)
				.map((p) => {
					const modelRows = p.models.map((m) => `<div class="panel-model-row" data-model="${esc(m.model)}"><span>${esc(m.model)}</span><span>${m.tokens ?? 0} tok</span><span>${esc(fmtCost(m.cost ?? 0))}</span><span>${esc(fmtMs(m.durationMs ?? 0))}</span><span>${m.turns ?? 0} turns</span></div>`).join("\n");
					const roundLabel = p.round === g.wave ? `round ${p.round}` : `round ${p.round} (replacement)`;
					return `<div class="panel-round" data-round="${p.round}">
<h4>${esc(roundLabel)}</h4>
${modelRows || '<p class="coverage-notice">no per-model metrics for this round</p>'}
</div>`;
				})
				.join("\n");
			const findings = precision.filter((pr) => pr.panelPhase === g.panelPhase && (pr.wave ?? pr.round) === g.wave);
			const findingRows =
				findings.length > 0
					? findings
							.map(
								(f) =>
									`<div class="panel-finding-row" data-soft="true" data-model="${esc(f.model)}"><span class="soft-attribution">soft (${esc(run.soft.attribution.model)})</span><span>${esc(f.model)}</span><span>raised ${f.raised}</span><span>incorporated ${f.incorporated}</span><span>dismissed ${f.dismissed}</span></div>`,
							)
							.join("\n")
					: '<p class="coverage-notice">no precision figures for this wave</p>';
			return `<div class="panel-wave" data-panel-phase="${esc(g.panelPhase)}" data-wave="${g.wave}">
<h3>${esc(g.panelPhase)} wave ${g.wave}</h3>
${roundBlocks}
${findingRows}
</div>`;
		})
		.join("\n");
	return `<section id="panel-deepdive">
<h2>Panel deep-dive</h2>
${blocks}
</section>`;
}
function renderSteeringMap(run) {
	const steering = run.soft?.steering ?? [];
	if (steering.length === 0) return `<section id="steering-map"><h2>Steering map</h2><p class="coverage-notice">no steering data (soft data absent or no user turns correlated)</p></section>`;
	const marks = steering.map((s) => `<div class="steering-mark" data-soft="true" data-class="${esc(s.class)}"><span class="soft-attribution">soft (${esc(run.soft.attribution.model)})</span><span class="steering-ts">${esc(s.ts)}</span><span class="steering-class">${esc(s.class)}</span></div>`).join("\n");
	return `<section id="steering-map">
<h2>Steering map</h2>
${marks}
</section>`;
}
function renderReworkPanel(run) {
	const r = run.hard.rework;
	return `<section id="rework-panel">
<h2>Rework</h2>
<div class="rework-row"><span>Artifact revisions</span><span>${r.artifactRevised}</span></div>
<div class="rework-row"><span>Phase backward moves</span><span>${r.phaseBackward}</span></div>
<div class="rework-row"><span>PR fix waves</span><span>${r.fixWave}</span></div>
</section>`;
}
function renderCoverage(run) {
	if (run.coverage.length === 0) return `<section id="coverage"><h2>Coverage</h2><p>full coverage: no gaps recorded for this run.</p></section>`;
	const rows = run.coverage.map((c) => `<div class="coverage-row" data-marker="${esc(c.marker)}"><span class="coverage-marker">${esc(c.marker)}</span>${c.detail ? `<span class="coverage-detail">${esc(c.detail)}</span>` : ""}</div>`).join("\n");
	return `<section id="coverage">
<h2>Coverage</h2>
${rows}
</section>`;
}
const CSS = `
body { font-family: system-ui, sans-serif; margin: 0; padding: 2rem; background: #0b0e14; color: #d6dbe5; line-height: 1.5; }
h1 { margin-top: 0; }
section { margin-bottom: 2.5rem; padding: 1.25rem; background: #131722; border-radius: 8px; }
.strip { display: flex; flex-wrap: wrap; gap: 1.5rem; }
.metric { display: flex; flex-direction: column; gap: 0.25rem; }
.metric .label { font-size: 0.8rem; color: #8892a6; text-transform: uppercase; letter-spacing: 0.05em; }
.metric .value { font-size: 1.5rem; font-weight: 600; }
.phase-row, .rollup-row, .panel-model-row, .panel-finding-row, .steering-mark, .rework-row, .coverage-row { display: flex; gap: 1rem; padding: 0.4rem 0; border-bottom: 1px solid #232838; }
[data-soft="true"] { background: rgba(255, 196, 0, 0.08); }
.soft-attribution { font-size: 0.75rem; color: #ffc400; }
.coverage-notice { color: #8892a6; font-style: italic; }
.panel-round { margin-bottom: 1.5rem; }
`;
export function renderDashboard(run) {
	return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>sdlc-retro: ${esc(run.title ?? run.slug)}</title>
<style>${CSS}</style>
</head>
<body>
<h1>${esc(run.title ?? run.slug)}${run.track ? ` <small>(${esc(run.track)})</small>` : ""}</h1>
<nav><a href="#exec-strip">Summary</a> · <a href="#phase-swimlane">Phases</a> · <a href="#cost-breakdown">Cost</a> · <a href="#panel-deepdive">Panels</a> · <a href="#steering-map">Steering</a> · <a href="#rework-panel">Rework</a> · <a href="#coverage">Coverage</a></nav>
${renderExecStrip(run)}
${renderPhaseSwimlane(run)}
${renderCostBreakdown(run)}
${renderPanelDeepdive(run)}
${renderSteeringMap(run)}
${renderReworkPanel(run)}
${renderCoverage(run)}
</body>
</html>
`;
}
// ---- CLI --------------------------------------------------------------------
function parseArgs(argv) {
	const opts = { format: "text" };
	for (let i = 0; i < argv.length; i++) {
		const a = argv[i];
		const val = () => {
			const v = argv[++i];
			if (v === undefined) throw new Error(`${a} requires a value`);
			return v;
		};
		if (a === "--run") opts.run = val();
		else if (a === "--out") opts.out = val();
		else if (a === "--format") {
			const f = val();
			if (f !== "text" && f !== "json") throw new Error("--format must be text or json");
			opts.format = f;
		} else if (a === "-h" || a === "--help") opts.help = true;
		else throw new Error(`unexpected argument: ${a}`);
	}
	return opts;
}
function usage() {
	return "usage: render-retro.mjs --run FILE [--out FILE] [--format text|json]";
}
function atomicWrite(target, content) {
	const parent = dirname(target);
	if (!existsSync(parent) || !statSync(parent).isDirectory()) throw new Error(`output parent directory does not exist: ${parent}`);
	const tmp = mkdtempSync(join(parent, ".render-retro-"));
	const tmpFile = join(tmp, "index.html");
	const fd = openSync(tmpFile, "w");
	try {
		writeSync(fd, content);
		fsyncSync(fd);
	} finally {
		closeSync(fd);
	}
	renameSync(tmpFile, target);
	rmSync(tmp, { recursive: true, force: true });
}
function main() {
	let opts;
	try {
		opts = parseArgs(process.argv.slice(2));
	} catch (e) {
		warn(String(e.message || e));
		process.exit(2);
	}
	if (opts.help) {
		console.log(usage());
		process.exit(0);
	}
	if (!opts.run) {
		warn(usage());
		process.exit(2);
	}
	let raw;
	try {
		raw = readFileSync(opts.run, "utf8");
	} catch (err) {
		warn(`cannot read --run file: ${err?.message || err}`);
		process.exit(1);
	}
	let run;
	try {
		run = JSON.parse(raw);
	} catch (err) {
		warn(`--run file is not valid JSON: ${err?.message || err}`);
		process.exit(1);
	}
	const issues = validateRunJson(run);
	if (issues.length > 0) {
		warn(`--run file fails run.json schema validation: ${issues.join("; ")}`);
		process.exit(1);
	}
	const outPath = opts.out ? (isAbsolute(opts.out) ? opts.out : resolve(opts.out)) : join(dirname(resolve(opts.run)), "index.html");
	const html = renderDashboard(run);
	try {
		atomicWrite(outPath, html);
	} catch (err) {
		warn(`cannot write ${outPath}: ${err?.message || err}`);
		process.exit(2);
	}
	if (opts.format === "json") {
		console.log(JSON.stringify({ ok: true, out: outPath, warnings: [] }, null, 2));
	} else {
		console.log(`rendered: ${outPath}`);
	}
	process.exit(0);
}
if (import.meta.url === `file://${process.argv[1]}`) main();
#!/usr/bin/env node
// harvest-panel.mjs — FS13 §5 harvest CLI: preserves pi-subagents lifecycle
// artifacts (status.json, events.jsonl, and optionally transcripts/) from a
// panel dispatch's async run directory into the consumer's run store, before
// they evaporate.
//
// Usage: harvest-panel.mjs --phase PANEL_PHASE --round N [--wave W] --from DIR [--slug S]
//                          [--with-transcripts] [--format text|json]
//                          [--config DIR | --repo-root DIR]
//
// Contract (spec §5): --from names a directory carrying status.json and
// events.jsonl at its top level (the shape of a pi-subagents asyncDir).
// Harvest copies both into panels/<panelPhase>-round<N>-<date>/;
// --with-transcripts additionally copies a top-level transcripts/
// subdirectory (when present) into transcripts/ at the destination. It also
// writes a meta.json sidecar {round, wave}: --round is the destination
// allocation label, --wave is the logical review-wave (defaults to --round
// when omitted, so a replacement dispatch can share its original wave while
// taking a fresh label). A missing/aborted source directory or file is a report, not a throw: exit 0,
// missed[] populated, and the panel.harvested event records the gap. Exit 2
// only for usage errors or an unwritable destination.
import { cpSync, existsSync, mkdirSync, statSync, writeFileSync } from "node:fs";
import { join, relative } from "node:path";
import { inspectRoot } from "./lib.mjs";
import { emitEvent, PANEL_PHASES, resolveRunSlug, runStoreDir } from "./telemetry.mjs";
function bail(msg) {
	process.stderr.write(`harvest-panel: ${msg}\n`);
	process.exit(2);
}
function parseArgs(argv) {
	const opts = { format: "text", withTranscripts: false };
	for (let i = 0; i < argv.length; i++) {
		const a = argv[i];
		const val = (name) => {
			const v = argv[++i];
			if (v === undefined || v.startsWith("-")) bail(`${name} requires a value`);
			return v;
		};
		if (a === "--phase") opts.phase = val("--phase");
		else if (a === "--round") opts.round = val("--round");
		else if (a === "--wave") opts.wave = val("--wave");
		else if (a === "--from") opts.from = val("--from");
		else if (a === "--slug") opts.slug = val("--slug");
		else if (a === "--with-transcripts") opts.withTranscripts = true;
		else if (a === "--format") {
			const f = val("--format");
			if (f !== "text" && f !== "json") bail("--format must be text or json");
			opts.format = f;
		} else if (a === "--config") opts.config = val("--config");
		else if (a === "--repo-root") opts.repoRoot = val("--repo-root");
		else if (a === "-h" || a === "--help") opts.help = true;
		else bail(`unexpected argument: ${a}`);
	}
	return opts;
}
function usage() {
	return "usage: harvest-panel.mjs --phase PANEL_PHASE --round N [--wave W] --from DIR [--slug S] [--with-transcripts] [--format text|json] [--config DIR|--repo-root DIR]";
}
// Copy one file if present; return "copied" | "missed".
function harvestFile(srcDir, name, destDir) {
	const src = join(srcDir, name);
	if (!existsSync(src) || !statSync(src).isFile()) return "missed";
	cpSync(src, join(destDir, name));
	return "copied";
}
function harvestTranscripts(srcDir, destDir) {
	const src = join(srcDir, "transcripts");
	if (!existsSync(src) || !statSync(src).isDirectory()) return "missed";
	cpSync(src, join(destDir, "transcripts"), { recursive: true });
	return "copied";
}
function main() {
	const opts = parseArgs(process.argv.slice(2));
	if (opts.help) {
		console.log(usage());
		process.exit(0);
	}
	if (!opts.phase) bail(usage());
	if (!PANEL_PHASES.includes(opts.phase)) bail(`unknown panel phase '${opts.phase}'. Known: ${PANEL_PHASES.join(", ")}`);
	if (!opts.round) bail(usage());
	const round = Number(opts.round);
	if (!Number.isInteger(round) || round <= 0) bail("--round must be a positive integer");
	// The logical review-wave defaults to the allocation label when not given, so
	// existing single-dispatch harvests are byte-identical in meaning (wave===round).
	const wave = opts.wave === undefined ? round : Number(opts.wave);
	if (!Number.isInteger(wave) || wave <= 0) bail("--wave must be a positive integer");
	if (!opts.from) bail(usage());
	const rootResult = inspectRoot({ config: opts.config, repoRoot: opts.repoRoot });
	if (!rootResult.ok) bail(`sdlc: ${rootResult.message}`);
	const root = rootResult.root;
	// Run identity is required to know where to harvest TO; unlike record-run-event
	// this is not a soft skip — an unresolvable identity leaves no destination.
	const resolved = resolveRunSlug({ slug: opts.slug, cwd: root });
	if (resolved.skip) bail(`sdlc-telemetry: ${resolved.skip}`);
	const slug = resolved.slug;
	const date = new Date().toISOString().slice(0, 10);
	const destDir = join(runStoreDir(root, slug), "panels", `${opts.phase}-round${round}-${date}`);
	try {
		mkdirSync(destDir, { recursive: true });
	} catch (err) {
		bail(`cannot create destination directory: ${err?.message || err}`);
	}
	const files = [];
	const missed = [];
	for (const name of ["status.json", "events.jsonl"]) {
		const status = harvestFile(opts.from, name, destDir);
		files.push({ name, status });
		if (status === "missed") missed.push(name);
	}
	if (opts.withTranscripts) {
		const status = harvestTranscripts(opts.from, destDir);
		files.push({ name: "transcripts", status });
		if (status === "missed") missed.push("transcripts");
	}
	// meta.json sidecar records the {round, wave} distinction so the collector
	// can group same-wave harvest rounds without parsing prose. Written after the
	// copies; a failure here is not fatal to the harvest itself.
	let metaWritten = false;
	try {
		writeFileSync(join(destDir, "meta.json"), `${JSON.stringify({ round, wave }, null, 2)}\n`);
		metaWritten = true;
	} catch {
		missed.push("meta.json");
	}
	files.push({ name: "meta.json", status: metaWritten ? "copied" : "missed" });
	const relDir = relative(root, destDir);
	const report = { ok: true, phase: opts.phase, round, wave, dir: relDir, files, missed };
	if (opts.format === "json") {
		console.log(JSON.stringify(report, null, 2));
	} else {
		console.log(`harvested ${opts.phase} round ${round} (wave ${wave}) -> ${relDir}`);
		for (const f of files) console.log(`  ${f.name}: ${f.status}`);
		if (missed.length > 0) console.log(`missed: ${missed.join(", ")}`);
	}
	emitEvent({
		event: "panel.harvested",
		slug,
		by: "script:harvest-panel",
		payload: { panelPhase: opts.phase, round, wave, dir: relDir, missed },
		root,
	});
	process.exit(0);
}
if (import.meta.url === `file://${process.argv[1]}`) main();
// telemetry.mjs — shared FS13 run-manifest event contract: the v1 event
// vocabulary, envelope/payload validators (hand-rolled, no runtime deps per
// NF2), run-identity resolution (§3.2), and run-store path helpers (§2).
//
// Consumed by the emitter (record-run-event.mjs), the FS5 side-effect emitters
// (resolve-panel/ensure-panel-agent/validate-task, lt-t2), and the collector
// (collect-run, lt-t4). The committed schema
// skills/sdlc-retro/schema/event.schema.json mirrors this file field-for-field.
import { execFileSync } from "node:child_process";
import { closeSync, mkdirSync, openSync, writeSync } from "node:fs";
import { dirname, join } from "node:path";
const TELEMETRY_PREFIX = "sdlc-telemetry:";
export const EVENT_SCHEMA_VERSION = 1;
// A serialized line INCLUDING its LF terminator must not exceed 32 KiB (§3).
export const MAX_EVENT_BYTES = 32 * 1024;
// Slug grammar: identical to validate-task.mjs TASK_RE (§2).
export const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
// `by` grammar (§3): script:<name> | agent | human:<slug>.
export const BY_RE = /^(script:[a-z][a-z0-9-]*|agent|human:[a-z0-9][a-z0-9-]*)$/;
// ISO-8601 UTC instant (trailing Z), optional fractional seconds.
export const TS_RE = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?Z$/;
// The six lifecycle phases (payload field `phase`).
export const LIFECYCLE_PHASES = ["brainstorm", "plan", "spec", "build", "implement", "pr"];
// The four panel phases (payload field `panelPhase`) — the existing FS5
// vocabulary, deliberately distinct from lifecycle `phase`.
export const PANEL_PHASES = ["plan_review", "spec_review", "pr_review", "task_validate"];
// Fixed collector mapping from panel phase to lifecycle phase (§3).
export const PANEL_TO_LIFECYCLE = Object.freeze({
	plan_review: "plan",
	spec_review: "spec",
	pr_review: "pr",
	task_validate: "implement",
});
// Payload field descriptors per event (§3 table). Each entry is [name, type].
// Field types mirror the normative "Payload field types" paragraph.
export const EVENT_PAYLOADS = Object.freeze({
	"run.started": [
		["title", "nonEmptyString"],
		["track", "nonEmptyString"],
	],
	"phase.entered": [["phase", "lifecyclePhase"]],
	"phase.exited": [["phase", "lifecyclePhase"]],
	"phase.backward": [
		["from", "nonEmptyString"],
		["to", "nonEmptyString"],
		["reason", "nonEmptyString"],
	],
	"gate.approved": [
		["phase", "lifecyclePhase"],
		["artifact", "nonEmptyString"],
		["rev", "posInt"],
		["approver", "nonEmptyString"],
	],
	"artifact.revised": [
		["artifact", "nonEmptyString"],
		["rev", "posInt"],
		["reason", "nonEmptyString"],
	],
	"panel.resolved": [
		["panelPhase", "panelPhase"],
		["models", "stringArray"],
		["authorExcluded", "string"],
	],
	"panel.agent_stamped": [
		["panelPhase", "panelPhase"],
		["agent", "nonEmptyString"],
	],
	"panel.dispatched": [
		["panelPhase", "panelPhase"],
		["round", "posInt"],
		["models", "stringArray"],
	],
	"panel.harvested": [
		["panelPhase", "panelPhase"],
		["round", "posInt"],
		["dir", "nonEmptyString"],
		["missed", "stringArray"],
	],
	"panel.consolidated": [
		["panelPhase", "panelPhase"],
		["round", "posInt"],
		["findings", "findings"],
		["incorporated", "nonNegInt"],
		["dismissed", "nonNegInt"],
	],
	"task.validated": [
		["task", "nonEmptyString"],
		["verdict", "nonEmptyString"],
		["scenarioIds", "stringArray"],
	],
	"lifecycle.checked": [["verdict", "nonEmptyString"]],
	"pr.opened": [["number", "posInt"]],
	"pr.fix_wave": [
		["number", "posInt"],
		["sha", "nonEmptyString"],
	],
});
// Optional, additive payload fields per event: type-checked when present, never
// required (so emitting them is backward-compatible and omitting them is valid).
// `wave` distinguishes the logical review-wave from the harvest allocation label
// (`round`) on panel events; a replacement dispatch keeps its original wave.
export const OPTIONAL_EVENT_PAYLOADS = Object.freeze({
	"panel.dispatched": [["wave", "posInt"]],
	"panel.harvested": [["wave", "posInt"]],
	"panel.consolidated": [["wave", "posInt"]],
});
export const KNOWN_EVENTS = Object.keys(EVENT_PAYLOADS);
function isPlainObject(v) {
	return typeof v === "object" && v !== null && !Array.isArray(v);
}
function isPosInt(v) {
	return Number.isInteger(v) && v > 0;
}
function isNonNegInt(v) {
	return Number.isInteger(v) && v >= 0;
}
// Validate a single field against its declared type. Returns an error string
// or null.
function fieldIssue(name, type, value) {
	switch (type) {
		case "string":
			return typeof value === "string" ? null : `${name} must be a string`;
		case "nonEmptyString":
			return typeof value === "string" && value.length > 0 ? null : `${name} must be a non-empty string`;
		case "lifecyclePhase":
			return LIFECYCLE_PHASES.includes(value) ? null : `${name} must be one of ${LIFECYCLE_PHASES.join("/")}`;
		case "panelPhase":
			return PANEL_PHASES.includes(value) ? null : `${name} must be one of ${PANEL_PHASES.join("/")}`;
		case "posInt":
			return isPosInt(value) ? null : `${name} must be a positive integer`;
		case "nonNegInt":
			return isNonNegInt(value) ? null : `${name} must be a non-negative integer`;
		case "stringArray":
			if (!Array.isArray(value)) return `${name} must be an array of non-empty strings`;
			return value.every((e) => typeof e === "string" && e.length > 0) ? null : `${name} entries must be non-empty strings`;
		case "findings":
			if (!isPlainObject(value)) return `${name} must be an object {high,medium,low}`;
			for (const k of ["high", "medium", "low"]) {
				if (!isNonNegInt(value[k])) return `${name}.${k} must be a non-negative integer`;
			}
			return null;
		default:
			return `${name} has an unknown declared type '${type}'`;
	}
}
// Validate a payload for a known event. Unknown fields are tolerated (payloads
// are additive-only; consumers ignore unknown fields, §3). Returns issues[].
// For an unknown event, only the generic payload-object constraint is applied;
// the caller decides whether the unknown event is a hard error (emitter) or a
// soft skip (collector).
export function validatePayload(event, payload) {
	const spec = EVENT_PAYLOADS[event];
	const issues = [];
	if (!isPlainObject(payload)) {
		issues.push("payload must be an object");
		return issues;
	}
	if (!spec) return issues;
	for (const [name, type] of spec) {
		if (!(name in payload)) {
			issues.push(`payload.${name} is required`);
			continue;
		}
		const problem = fieldIssue(`payload.${name}`, type, payload[name]);
		if (problem) issues.push(problem);
	}
	// Optional fields: type-checked only when present; absence is never an issue.
	for (const [name, type] of OPTIONAL_EVENT_PAYLOADS[event] ?? []) {
		if (!(name in payload)) continue;
		const problem = fieldIssue(`payload.${name}`, type, payload[name]);
		if (problem) issues.push(problem);
	}
	return issues;
}
// Validate the fixed v1 envelope (schemaVersion/ts/slug/event/by/payload). The
// envelope shape is frozen at v1 (unknown top-level keys are rejected); only
// event types and payload fields are forward-compatible. Returns issues[].
export function validateEnvelope(obj) {
	const issues = [];
	if (!isPlainObject(obj)) return ["record must be a JSON object"];
	const allowed = new Set(["schemaVersion", "ts", "slug", "event", "by", "payload"]);
	for (const k of Object.keys(obj)) if (!allowed.has(k)) issues.push(`unknown top-level field '${k}'`);
	if (obj.schemaVersion !== EVENT_SCHEMA_VERSION) issues.push(`schemaVersion must be ${EVENT_SCHEMA_VERSION}`);
	if (typeof obj.ts !== "string" || !TS_RE.test(obj.ts)) issues.push("ts must be an ISO-8601 UTC instant");
	if (typeof obj.slug !== "string" || !SLUG_RE.test(obj.slug)) issues.push("slug must match the slug grammar");
	if (typeof obj.event !== "string" || obj.event.length === 0) issues.push("event must be a non-empty string");
	if (typeof obj.by !== "string" || !BY_RE.test(obj.by)) issues.push("by must match script:<name>|agent|human:<slug>");
	if (!("payload" in obj)) issues.push("payload is required");
	else if (!isPlainObject(obj.payload)) issues.push("payload must be an object");
	return issues;
}
// Resolve the current git branch of `cwd`, or "" when unavailable (detached
// HEAD, not a repo). symbolic-ref exits non-zero on a detached HEAD.
export function currentBranch(cwd = process.cwd()) {
	try {
		return execFileSync("git", ["symbolic-ref", "--quiet", "--short", "HEAD"], {
			cwd,
			encoding: "utf8",
			stdio: ["ignore", "pipe", "ignore"],
		}).trim();
	} catch {
		return "";
	}
}
// §3.2 run-identity resolution: --slug flag -> SDLC_RUN_SLUG env -> current
// branch mapped to a slug. Returns { slug } on success or { skip: <reason> }
// when identity is unresolvable (a soft skip — never a thrown error). An
// explicit but non-conforming flag/env value is a skip, not a usage error
// (§3.1 lists neither as an exit-2 case).
export function resolveRunSlug({ slug, env = process.env, cwd = process.cwd() } = {}) {
	if (slug !== undefined) {
		return SLUG_RE.test(slug) ? { slug } : { skip: `--slug value '${slug}' is not a valid run slug` };
	}
	const envSlug = env.SDLC_RUN_SLUG;
	if (Object.hasOwn(env, "SDLC_RUN_SLUG")) {
		return typeof envSlug === "string" && SLUG_RE.test(envSlug) ? { slug: envSlug } : { skip: `SDLC_RUN_SLUG value '${envSlug ?? ""}' is not a valid run slug` };
	}
	const branch = currentBranch(cwd);
	if (!branch) return { skip: "run identity unresolvable: detached HEAD or no git branch" };
	if (branch === "main" || branch === "master") return { skip: `run identity unresolvable: on ${branch}` };
	// strip a single leading `<type>/` prefix, lowercase, map `/` to `-`
	const mapped = branch
		.replace(/^[^/]+\//, "")
		.toLowerCase()
		.replaceAll("/", "-");
	if (SLUG_RE.test(mapped)) return { slug: mapped };
	return { skip: `run identity unresolvable: branch '${branch}' does not map to a valid slug` };
}
// §2 run-store path helpers.
export function runStoreDir(root, slug) {
	return join(root, ".pi", "sdlc", "runs", slug);
}
export function runEventsPath(root, slug) {
	return join(runStoreDir(root, slug), "events.jsonl");
}
// Shared fail-soft stderr warning, one line, prefixed per §3.1/§3.3.
export function warnTelemetry(msg) {
	process.stderr.write(`${TELEMETRY_PREFIX} ${msg}\n`);
}
// §3.3 FS5 side-effect emission: best-effort emission for the frozen FS5 CLIs
// (resolve-panel, ensure-panel-agent, validate-task; later harvest-panel,
// lt-t3). Resolves run identity and appends one manifest line, but NEVER
// throws and NEVER exits the process — any failure (unresolvable identity,
// invalid payload, oversized line, I/O error) degrades to a single
// `sdlc-telemetry:`-prefixed stderr warning while the caller's primary
// stdout/exit-code contract stays byte-identical (NF3).
export function emitEvent({ event, slug, by, payload, root, cwd = root }) {
	try {
		const resolved = resolveRunSlug({ slug, cwd });
		if (resolved.skip) {
			warnTelemetry(`${resolved.skip} — skipping emission`);
			return;
		}
		if (typeof by !== "string" || !BY_RE.test(by)) {
			warnTelemetry(`--by value '${by}' violates the grammar script:<name>|agent|human:<slug> — skipping emission`);
			return;
		}
		const issues = validatePayload(event, payload);
		if (issues.length > 0) {
			warnTelemetry(`invalid payload for '${event}': ${issues.join("; ")} — skipping emission`);
			return;
		}
		const envelope = {
			schemaVersion: EVENT_SCHEMA_VERSION,
			ts: new Date().toISOString(),
			slug: resolved.slug,
			event,
			by,
			payload,
		};
		const line = `${JSON.stringify(envelope)}\n`;
		if (Buffer.byteLength(line, "utf8") > MAX_EVENT_BYTES) {
			warnTelemetry(`serialized event exceeds the ${MAX_EVENT_BYTES}-byte cap — skipping emission`);
			return;
		}
		const path = runEventsPath(root, resolved.slug);
		mkdirSync(dirname(path), { recursive: true });
		const fd = openSync(path, "a");
		try {
			const bytes = Buffer.from(line, "utf8");
			const written = writeSync(fd, bytes);
			if (written !== bytes.length) throw new Error(`short write: ${written} of ${bytes.length} bytes`);
		} finally {
			closeSync(fd);
		}
	} catch (err) {
		warnTelemetry(`I/O failure writing the run store: ${err?.message || err} — skipping emission`);
	}
}
read: /home/neil/code/threadsafe/pi-sdlc.worktrees/feat-sdlc-re...
read: /home/neil/code/threadsafe/pi-sdlc.worktrees/feat-sdlc-re...
read: /home/neil/code/threadsafe/pi-sdlc.worktrees/feat-sdlc-re...
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "https://github.com/threadsafe-systems/pi-sdlc/skills/sdlc-retro/schema/event.schema.json",
  "title": "sdlc-run-manifest-event",
  "description": "FS13 run-manifest event (one JSON object per JSONL line). Mirrors spec §3 field-for-field. Envelope is frozen at v1; payloads are additive-only and unknown payload fields are tolerated by consumers.",
  "type": "object",
  "additionalProperties": false,
  "required": ["schemaVersion", "ts", "slug", "event", "by", "payload"],
  "properties": {
    "schemaVersion": { "type": "integer", "const": 1 },
    "ts": { "type": "string", "pattern": "^\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}:\\d{2}(?:\\.\\d+)?Z$" },
    "slug": { "type": "string", "pattern": "^[a-z0-9]+(?:-[a-z0-9]+)*$" },
    "event": { "type": "string", "minLength": 1 },
    "by": { "type": "string", "pattern": "^(script:[a-z][a-z0-9-]*|agent|human:[a-z0-9][a-z0-9-]*)$" },
    "payload": { "type": "object" }
  },
  "definitions": {
    "lifecyclePhase": { "type": "string", "enum": ["brainstorm", "plan", "spec", "build", "implement", "pr"] },
    "panelPhase": { "type": "string", "enum": ["plan_review", "spec_review", "pr_review", "task_validate"] },
    "nonEmptyString": { "type": "string", "minLength": 1 },
    "stringArray": { "type": "array", "items": { "type": "string", "minLength": 1 } },
    "posInt": { "type": "integer", "minimum": 1 },
    "nonNegInt": { "type": "integer", "minimum": 0 },
    "findings": {
      "type": "object",
      "required": ["high", "medium", "low"],
      "properties": {
        "high": { "$ref": "#/definitions/nonNegInt" },
        "medium": { "$ref": "#/definitions/nonNegInt" },
        "low": { "$ref": "#/definitions/nonNegInt" }
      }
    }
  },
  "allOf": [
    { "if": { "properties": { "event": { "const": "run.started" } } }, "then": { "properties": { "payload": { "type": "object", "required": ["title", "track"], "properties": { "title": { "$ref": "#/definitions/nonEmptyString" }, "track": { "$ref": "#/definitions/nonEmptyString" } } } } } },
    { "if": { "properties": { "event": { "const": "phase.entered" } } }, "then": { "properties": { "payload": { "type": "object", "required": ["phase"], "properties": { "phase": { "$ref": "#/definitions/lifecyclePhase" } } } } } },
    { "if": { "properties": { "event": { "const": "phase.exited" } } }, "then": { "properties": { "payload": { "type": "object", "required": ["phase"], "properties": { "phase": { "$ref": "#/definitions/lifecyclePhase" } } } } } },
    {
      "if": { "properties": { "event": { "const": "phase.backward" } } },
      "then": { "properties": { "payload": { "type": "object", "required": ["from", "to", "reason"], "properties": { "from": { "$ref": "#/definitions/nonEmptyString" }, "to": { "$ref": "#/definitions/nonEmptyString" }, "reason": { "$ref": "#/definitions/nonEmptyString" } } } } }
    },
    {
      "if": { "properties": { "event": { "const": "gate.approved" } } },
      "then": {
        "properties": {
          "payload": {
            "type": "object",
            "required": ["phase", "artifact", "rev", "approver"],
            "properties": { "phase": { "$ref": "#/definitions/lifecyclePhase" }, "artifact": { "$ref": "#/definitions/nonEmptyString" }, "rev": { "$ref": "#/definitions/posInt" }, "approver": { "$ref": "#/definitions/nonEmptyString" } }
          }
        }
      }
    },
    {
      "if": { "properties": { "event": { "const": "artifact.revised" } } },
      "then": { "properties": { "payload": { "type": "object", "required": ["artifact", "rev", "reason"], "properties": { "artifact": { "$ref": "#/definitions/nonEmptyString" }, "rev": { "$ref": "#/definitions/posInt" }, "reason": { "$ref": "#/definitions/nonEmptyString" } } } } }
    },
    {
      "if": { "properties": { "event": { "const": "panel.resolved" } } },
      "then": { "properties": { "payload": { "type": "object", "required": ["panelPhase", "models", "authorExcluded"], "properties": { "panelPhase": { "$ref": "#/definitions/panelPhase" }, "models": { "$ref": "#/definitions/stringArray" }, "authorExcluded": { "type": "string" } } } } }
    },
    { "if": { "properties": { "event": { "const": "panel.agent_stamped" } } }, "then": { "properties": { "payload": { "type": "object", "required": ["panelPhase", "agent"], "properties": { "panelPhase": { "$ref": "#/definitions/panelPhase" }, "agent": { "$ref": "#/definitions/nonEmptyString" } } } } } },
    {
      "if": { "properties": { "event": { "const": "panel.dispatched" } } },
      "then": {
        "properties": { "payload": { "type": "object", "required": ["panelPhase", "round", "models"], "properties": { "panelPhase": { "$ref": "#/definitions/panelPhase" }, "round": { "$ref": "#/definitions/posInt" }, "models": { "$ref": "#/definitions/stringArray" }, "wave": { "$ref": "#/definitions/posInt" } } } }
      }
    },
    {
      "if": { "properties": { "event": { "const": "panel.harvested" } } },
      "then": {
        "properties": {
          "payload": {
            "type": "object",
            "required": ["panelPhase", "round", "dir", "missed"],
            "properties": { "panelPhase": { "$ref": "#/definitions/panelPhase" }, "round": { "$ref": "#/definitions/posInt" }, "dir": { "$ref": "#/definitions/nonEmptyString" }, "missed": { "$ref": "#/definitions/stringArray" }, "wave": { "$ref": "#/definitions/posInt" } }
          }
        }
      }
    },
    {
      "if": { "properties": { "event": { "const": "panel.consolidated" } } },
      "then": {
        "properties": {
          "payload": {
            "type": "object",
            "required": ["panelPhase", "round", "findings", "incorporated", "dismissed"],
            "properties": {
              "panelPhase": { "$ref": "#/definitions/panelPhase" },
              "round": { "$ref": "#/definitions/posInt" },
              "findings": { "$ref": "#/definitions/findings" },
              "incorporated": { "$ref": "#/definitions/nonNegInt" },
              "dismissed": { "$ref": "#/definitions/nonNegInt" },
              "wave": { "$ref": "#/definitions/posInt" }
            }
          }
        }
      }
    },
    {
      "if": { "properties": { "event": { "const": "task.validated" } } },
      "then": { "properties": { "payload": { "type": "object", "required": ["task", "verdict", "scenarioIds"], "properties": { "task": { "$ref": "#/definitions/nonEmptyString" }, "verdict": { "$ref": "#/definitions/nonEmptyString" }, "scenarioIds": { "$ref": "#/definitions/stringArray" } } } } }
    },
    { "if": { "properties": { "event": { "const": "lifecycle.checked" } } }, "then": { "properties": { "payload": { "type": "object", "required": ["verdict"], "properties": { "verdict": { "$ref": "#/definitions/nonEmptyString" } } } } } },
    { "if": { "properties": { "event": { "const": "pr.opened" } } }, "then": { "properties": { "payload": { "type": "object", "required": ["number"], "properties": { "number": { "$ref": "#/definitions/posInt" } } } } } },
    { "if": { "properties": { "event": { "const": "pr.fix_wave" } } }, "then": { "properties": { "payload": { "type": "object", "required": ["number", "sha"], "properties": { "number": { "$ref": "#/definitions/posInt" }, "sha": { "$ref": "#/definitions/nonEmptyString" } } } } } }
  ]
}
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "https://github.com/threadsafe-systems/pi-sdlc/skills/sdlc-retro/schema/run.schema.json",
  "title": "sdlc-retro-run-record",
  "description": "run.json v1 (spec §7): the distilled post-mortem record produced by collect-run from the FS13 run store. hard values are measured or absent (coverage-marked), never estimated; soft values are model-attributed and structurally separated so the renderer cannot conflate them.",
  "type": "object",
  "additionalProperties": false,
  "required": ["schemaVersion", "slug", "coverage", "sizeProxies", "hard"],
  "properties": {
    "schemaVersion": { "type": "integer", "const": 1 },
    "slug": { "type": "string", "pattern": "^[a-z0-9]+(?:-[a-z0-9]+)*$" },
    "title": { "type": "string", "minLength": 1 },
    "track": { "type": "string", "minLength": 1 },
    "coverage": {
      "type": "array",
      "items": {
        "type": "object",
        "additionalProperties": false,
        "required": ["marker"],
        "properties": {
          "marker": { "type": "string", "minLength": 1 },
          "detail": { "type": "string" }
        }
      }
    },
    "sizeProxies": {
      "type": "object",
      "additionalProperties": false,
      "required": ["scenarios", "tasks", "sessions", "phases"],
      "properties": {
        "scenarios": { "$ref": "#/definitions/nonNegInt" },
        "tasks": { "$ref": "#/definitions/nonNegInt" },
        "diff": {
          "type": "object",
          "additionalProperties": false,
          "required": ["files", "insertions", "deletions"],
          "properties": {
            "files": { "$ref": "#/definitions/nonNegInt" },
            "insertions": { "$ref": "#/definitions/nonNegInt" },
            "deletions": { "$ref": "#/definitions/nonNegInt" }
          }
        },
        "sessions": { "$ref": "#/definitions/nonNegInt" },
        "phases": { "type": "array", "items": { "$ref": "#/definitions/lifecyclePhase" } }
      }
    },
    "hard": {
      "type": "object",
      "additionalProperties": false,
      "required": ["window", "phases", "sessions", "panels", "models", "rollups", "rework", "totals"],
      "properties": {
        "window": {
          "type": "object",
          "additionalProperties": false,
          "required": ["start", "end"],
          "properties": {
            "start": { "$ref": "#/definitions/ts" },
            "end": { "$ref": "#/definitions/ts" }
          }
        },
        "phases": {
          "type": "array",
          "items": {
            "type": "object",
            "additionalProperties": false,
            "required": ["phase", "start", "end"],
            "properties": {
              "phase": { "$ref": "#/definitions/lifecyclePhase" },
              "start": { "$ref": "#/definitions/ts" },
              "end": { "$ref": "#/definitions/ts" },
              "exitExplicit": { "type": "boolean" }
            }
          }
        },
        "sessions": {
          "type": "array",
          "items": {
            "type": "object",
            "additionalProperties": false,
            "required": ["file", "start", "end"],
            "properties": {
              "file": { "type": "string", "minLength": 1 },
              "start": { "$ref": "#/definitions/ts" },
              "end": { "$ref": "#/definitions/ts" },
              "models": { "type": "array", "items": { "type": "string", "minLength": 1 } }
            }
          }
        },
        "panels": {
          "type": "array",
          "items": {
            "type": "object",
            "additionalProperties": false,
            "required": ["panelPhase", "round", "dir", "models"],
            "properties": {
              "panelPhase": { "$ref": "#/definitions/panelPhase" },
              "round": { "$ref": "#/definitions/posInt" },
              "wave": { "$ref": "#/definitions/posInt" },
              "dir": { "type": "string", "minLength": 1 },
              "models": {
                "type": "array",
                "items": {
                  "type": "object",
                  "additionalProperties": false,
                  "required": ["model"],
                  "properties": {
                    "model": { "type": "string", "minLength": 1 },
                    "tokens": { "$ref": "#/definitions/nonNegInt" },
                    "cost": { "type": "number", "minimum": 0 },
                    "durationMs": { "$ref": "#/definitions/nonNegInt" },
                    "turns": { "$ref": "#/definitions/nonNegInt" }
                  }
                }
              }
            }
          }
        },
        "models": { "type": "array", "items": { "type": "string", "minLength": 1 } },
        "rollups": {
          "type": "object",
          "additionalProperties": false,
          "required": ["byModel", "byPhase"],
          "properties": {
            "byModel": {
              "type": "array",
              "items": {
                "type": "object",
                "additionalProperties": false,
                "required": ["model", "tokens", "cost"],
                "properties": { "model": { "type": "string", "minLength": 1 }, "tokens": { "$ref": "#/definitions/nonNegInt" }, "cost": { "type": "number", "minimum": 0 } }
              }
            },
            "byPhase": {
              "type": "array",
              "items": {
                "type": "object",
                "additionalProperties": false,
                "required": ["phase", "tokens", "cost"],
                "properties": { "phase": { "$ref": "#/definitions/lifecyclePhase" }, "tokens": { "$ref": "#/definitions/nonNegInt" }, "cost": { "type": "number", "minimum": 0 } }
              }
            }
          }
        },
        "rework": {
          "type": "object",
          "additionalProperties": false,
          "required": ["artifactRevised", "phaseBackward", "fixWave"],
          "properties": {
            "artifactRevised": { "$ref": "#/definitions/nonNegInt" },
            "phaseBackward": { "$ref": "#/definitions/nonNegInt" },
            "fixWave": { "$ref": "#/definitions/nonNegInt" }
          }
        },
        "totals": {
          "type": "object",
          "additionalProperties": false,
          "required": ["tokens", "cost", "wallMs", "agentMs", "humanWaitMs"],
          "properties": {
            "tokens": { "$ref": "#/definitions/nonNegInt" },
            "cost": { "type": "number", "minimum": 0 },
            "wallMs": { "$ref": "#/definitions/nonNegInt" },
            "agentMs": { "$ref": "#/definitions/nonNegInt" },
            "humanWaitMs": { "$ref": "#/definitions/nonNegInt" }
          }
        }
      }
    },
    "soft": {
      "type": "object",
      "additionalProperties": false,
      "required": ["attribution", "narratives", "steering", "panelPrecision"],
      "properties": {
        "attribution": {
          "type": "object",
          "additionalProperties": false,
          "required": ["model", "provider"],
          "properties": { "model": { "type": "string", "minLength": 1 }, "provider": { "type": "string", "minLength": 1 } }
        },
        "narratives": {
          "type": "array",
          "items": {
            "type": "object",
            "additionalProperties": false,
            "required": ["phase", "summary"],
            "properties": { "phase": { "$ref": "#/definitions/lifecyclePhase" }, "summary": { "type": "string", "maxLength": 500 } }
          }
        },
        "steering": {
          "type": "array",
          "items": {
            "type": "object",
            "additionalProperties": false,
            "required": ["index", "ts", "class"],
            "properties": {
              "index": { "$ref": "#/definitions/nonNegInt" },
              "ts": { "$ref": "#/definitions/ts" },
              "class": { "type": "string", "enum": ["gate-approval", "correction", "scope-change", "unblock", "other"] }
            }
          }
        },
        "panelPrecision": {
          "type": "array",
          "items": {
            "type": "object",
            "additionalProperties": false,
            "required": ["panelPhase", "round", "model", "raised", "incorporated", "dismissed"],
            "properties": {
              "panelPhase": { "$ref": "#/definitions/panelPhase" },
              "round": { "$ref": "#/definitions/posInt" },
              "wave": { "$ref": "#/definitions/posInt" },
              "model": { "type": "string", "minLength": 1 },
              "raised": { "$ref": "#/definitions/nonNegInt" },
              "incorporated": { "$ref": "#/definitions/nonNegInt" },
              "dismissed": { "$ref": "#/definitions/nonNegInt" }
            }
          }
        }
      }
    }
  },
  "definitions": {
    "lifecyclePhase": { "type": "string", "enum": ["brainstorm", "plan", "spec", "build", "implement", "pr"] },
    "panelPhase": { "type": "string", "enum": ["plan_review", "spec_review", "pr_review", "task_validate"] },
    "ts": { "type": "string", "pattern": "^\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}:\\d{2}(?:\\.\\d+)?Z$" },
    "posInt": { "type": "integer", "minimum": 1 },
    "nonNegInt": { "type": "integer", "minimum": 0 }
  }
}
# Specification: lifecycle telemetry and post-mortem dashboard (sdlc-retro)
- Date: 2026-07-17
- Plan: `docs/plans/2026-07-17-sdlc-lifecycle-telemetry.md` (rev 2,
  panel-reviewed, human-approved 2026-07-17)
- Track: irreversible (freezes FS13: the run-manifest event contract and the
  `run.json` v1 retro record)
- Author vendor: anthropic
- Spec panel: rounds 1–2 adjudicated 2026-07-17 —
  `docs/reviews/spec-sdlc-lifecycle-telemetry-2026-07-17/consolidated.md`.
  This is revision 3: rev 2 incorporated SF1–SF19 (round 1, none
  dismissed); rev 3 incorporated the round-2 findings with one partial
  dismissal recorded in the consolidated file (schema files are Build
  deliverables mirroring these normative tables, not spec-time artifacts)
  for human ratification.
- Human gate: Spec rev 3 approved by Neil Chambers on 2026-07-17, including
  ratification of (a) the schemas-at-Build partial dismissal and (b) the
  optional-`phase.exited`-with-pinned-derivation shape (plan wording
  deviation recorded in §3).
## 1. Surfaces and homes
Two frozen stored-record shapes, together **FS13** (to be recorded as ADR
0021, a deliverable of this feature):
1. the run-manifest event contract (`events.jsonl` lines, §3);
2. the distilled retro record `run.json` (§6), pinned by a committed JSON
   schema.
Component homes (plan decision: hardcoded, no FS1 `paths` change):
| Component | Home | Committed? |
|---|---|---|
| Run store (manifest, harvests, raw snapshots) | `.pi/sdlc/runs/<slug>/` | no — git-ignored |
| Distilled retro record + dashboard | `docs/retros/<slug>/run.json`, `docs/retros/<slug>/index.html` | yes |
| Capture tooling (emitter, harvest) | `skills/sdlc/scripts/` (capture is part of the lifecycle skill) | package |
| Post-mortem tooling (collect, render) + schema | `skills/sdlc-retro/scripts/`, `skills/sdlc-retro/schema/` | package |
The repository `.gitignore` gains `.pi/sdlc/runs/`. Capture scripts are
invoked skill-relative per FS12 (`scripts/record-run-event.sh` from the sdlc
skill; `scripts/collect-run.sh` / `scripts/render-retro.sh` from the
sdlc-retro skill; direct-Node fallback `node <skill-dir>/scripts/<name>.mjs`).
sdlc-retro scripts may import shared helpers from the sibling skill via
package-relative paths (the package ships as one repository); they never
resolve consumer paths through the skill root.
## 2. Run store layout
```
.pi/sdlc/runs/<slug>/
  events.jsonl                          # the manifest (§3); append-only
  panels/<panelPhase>-round<N>-<YYYY-MM-DD>/ # harvested pi-subagents artifacts (§5)
    status.json
    events.jsonl
    [transcripts/...]                   # optional, --with-transcripts only
  raw/                                  # collect-time snapshots (§6.4)
    sessions/<session-file-name>.jsonl  # verbatim copies
    reviews/<review-dir>/...            # verbatim copies of consumed files
    git/<name>.json                     # captured git command outputs
    github/<name>.json                  # verbatim API responses
    llm/<name>.json                     # verbatim {request, response} pairs
```
`<slug>` matches the existing task-id grammar
`^[a-z0-9]+(?:-[a-z0-9]+)*$` (`validate-task.mjs` `TASK_RE`). The run store
is retained indefinitely; nothing in the package prunes it.
## 3. FS13 — run-manifest event contract
One JSON object per line, UTF-8, LF-terminated, appended atomically (single
write, O_APPEND; a serialized line including terminator MUST NOT exceed
32 KiB — the emitter rejects larger payloads).
Envelope (all fields required unless noted):
```json
{"schemaVersion":1,"ts":"<ISO-8601 UTC>","slug":"<slug>","event":"<type>",
 "by":"script:<name>"|"agent"|"human:<name>","payload":{...}}
```
`schemaVersion`, `ts`, `slug`, `event`, and `by` are required; `payload` is
event-specific and optional only where the table below shows none. `by` MUST
match `^(script:[a-z][a-z0-9-]*|agent|human:[a-z0-9][a-z0-9-]*)$` — human
identities are slug-style (`human:neil-chambers`), never free text with
spaces; auto-emitted events
set `by` to `script:<basename>` of the emitting CLI (`script:resolve-panel`,
`script:ensure-panel-agent`, `script:harvest-panel`,
`script:validate-task`). Payloads are additive-only. Consumers MUST ignore
unknown event types and unknown payload fields (forward compatibility). The
v1 vocabulary:
| Event | Emission | Payload (v1) |
|---|---|---|
| `run.started` | prose | `{title, track}` |
| `phase.entered` | prose | `{phase}` (brainstorm/plan/spec/build/implement/pr) |
| `phase.exited` | prose, optional | `{phase}` — MAY be emitted; when absent the collector derives the boundary (§6.3). Recorded decision: the plan's "phase enter/exit" is satisfied by mandatory enter + derived-or-explicit exit, minimising prose-emission burden |
| `phase.backward` | prose | `{from, to, reason}` |
| `gate.approved` | prose | `{phase, artifact, rev, approver}` |
| `artifact.revised` | prose | `{artifact, rev, reason}` |
| `panel.resolved` | auto (`resolve-panel`) | `{panelPhase, models[], authorExcluded}` |
[496 more lines in file. Use offset=101 to continue.]
bash: cd /home/neil/code/threadsafe/pi-sdlc.worktrees/feat-sdlc...
bash: cd /home/neil/code/threadsafe/pi-sdlc.worktrees/feat-sdlc...
257:4. **Review artifacts**: `docs/reviews/<phase>-<slug>-<date>/` per-model
258:   files and `consolidated.md`. The `<phase>-review-<slug>-<date>` form (a
367:            # panels.malformed_meta:<phase>,
503:  review-dir discovery matches `<phase>-<slug>-<date>` naming, git/GitHub
✔ LT3: concurrent emitters produce N complete, non-interleaved lines (111.45938ms)
✔ empty explicit identities do not fall through to another identity (64.367973ms)
✔ LT4: --slug beats env beats branch mapping (105.149506ms)
✔ LT5: unresolvable identity skips (exit 0, one warning, no write) (77.147862ms)
✔ LT26: .gitignore ignores the run store (3.412352ms)
✔ emitter: .sh wrapper delegates to .mjs identically (22.456949ms)
✔ vocabulary: every known event has a payload descriptor (0.175528ms)
✔ LT11: harvest copies status.json + events.jsonl and emits panel.harvested (34.098381ms)
✔ T1: --wave records a logical wave distinct from the round allocation label (27.704938ms)
✔ T1: --wave must be a positive integer (36.578407ms)
✔ LT11: --with-transcripts copies the transcripts/ subdirectory (29.108284ms)
✔ LT12: a missing source directory exits 0 with both files missed (29.760842ms)
✔ LT12: a partially-present source (status without events) reports one missed (34.566045ms)
✔ harvest-panel: unknown phase and non-positive round exit 2 (103.211216ms)
✔ harvest-panel.sh wrapper delegates to .mjs identically (33.59596ms)
✔ LT20: full fixture renders all seven anchors with known-answer data bindings (2.073726ms)
✔ T4: same-wave harvest rounds collapse into one wave section with each round as sub-detail (0.219713ms)
✔ LT20: an empty-shell run.json fails to carry any pinned data binding (0.121987ms)
✔ LT21: render-twice byte-identity and no generation-time values (0.310302ms)
✔ LT21 (CLI): rendering the same --run input twice via the CLI is byte-identical (71.155325ms)
✔ LT22: soft-data figures carry data-soft and visible attribution (0.28927ms)
✔ LT22: a soft-less run.json renders coverage notices, not fabricated numbers (0.144191ms)
✔ LT23: every coverage marker is rendered under #coverage (0.145061ms)
✔ render-retro CLI: unreadable/unparseable/schema-invalid --run exits 1; usage errors exit 2 (128.597266ms)
✔ render-retro CLI: default --out is index.html beside the input; --format json envelope (50.237322ms)
✔ LT6: resolve-panel emits panel.resolved; stdout/exit byte-identical with/without --slug (131.204982ms)
✔ LT7: ensure-panel-agent emits panel.agent_stamped; stdout/exit byte-identical (153.748014ms)
✔ LT8: validate-task emits task.validated on PASS with and without --report (200.301707ms)
✔ LT8: validate-task emits task.validated on FAIL (38.19511ms)
✔ LT8: validate-task emits task.validated on an ERROR fixture whose manifest parses (34.17669ms)
✔ LT8: an unparseable-manifest ERROR skips emission with the standard warning (30.544659ms)
✔ LT9: unwritable run store degrades to a warning; primary output unaffected (110.849243ms)
✔ nested --repo-root run stores are git-ignored too (gitignore anchoring) (2.462309ms)
✔ LT10: check-lifecycle.mjs and .sh are untouched by FS5 side-effect emission (0.850353ms)
✔ PV1: a valid JavaScript manifest runs only declared checks and passes (119.155867ms)
✔ PV2: only declared argv run; an undeclared tool command never executes (145.747913ms)
✔ PV3: schema and inspectManifest reject the mutation matrix before any command runs (62.769982ms)
✔ PV4: command outcomes are complete and deterministic; runner continues after failures (51.716656ms)
✔ PV4: a timeout is reported as FAIL with timedOut (1056.1517ms)
✔ PV5: category applicability is exact; injected n/a shapes are rejected (63.249363ms)
✔ PV6: scenario mapping gates the verdict (81.531098ms)
✔ PV7: standards and banned patterns are commands, not judgement (93.028977ms)
✔ PV8: evidence is bounded and secrets are redacted (74.410658ms)
✔ PV8 unit: boundStream and redaction name-matching are precise (231.370777ms)
✔ PV9: JSON/text/exit agree and JSON mode is order-independent (426.278389ms)
✔ PV9: --report writes the exact JSON bytes atomically (111.504036ms)
✔ PV9: --report outside the repo root is refused and clobbers nothing (111.690803ms)
✔ PV10: generic validator law and generated agent are portable (0.520243ms)
✔ PV11: receipt hash verification detects mutation of any stored file (5.914646ms)
✔ PV11: a FAIL runner-report cannot ride under runnerVerdict PASS (1.038933ms)
✔ parseArgs: recognises JSON anywhere and rejects bad flags (0.624275ms)
✔ PV13: renderText is a faithful projection of the report (74.726062ms)
ℹ tests 404
ℹ suites 0
ℹ pass 404
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 4907.715231
bash: cd /home/neil/code/threadsafe/pi-sdlc.worktrees/feat-sdlc...
bash: cd /home/neil/code/threadsafe/pi-sdlc.worktrees/feat-sdlc...
	const panelPrecision = [];
	for (const dir of reviewDirs) {
		const lifecyclePhase = LIFECYCLE_PHASES.find((phase) => dir.startsWith(`${phase}-${slug}-`));
		const panelPhase = lifecyclePhase ? LIFECYCLE_TO_PANEL[lifecyclePhase] : undefined;
		const reviewDate = dir.match(/-(\d{4}-\d{2}-\d{2})$/)?.[1];
		const matchingPanels = panelPhase ? panels.filter((p) => p.panelPhase === panelPhase) : [];
		const datedPanels = reviewDate ? matchingPanels.filter((p) => p.dir.endsWith(`-${reviewDate}`)) : matchingPanels;
		const candidates = datedPanels.length > 0 ? datedPanels : matchingPanels.length === 1 ? matchingPanels : [];
		const panel = candidates.length === 1 ? candidates[0] : undefined;
		if (!panel) {
			markers.push({ marker: `precision.unparsed:${dir}` });
			continue;
		}
		// Replay reads only raw/reviews/<dir>; it must not consult a mutated or
		// deleted live reviews directory after the original collection.
		const dirPath = fromRaw ? join(rawDir(root, slug), "reviews", dir) : join(root, reviewsPath, dir);
		let consolidatedText = "";
		let findingsText = "";
		const modelFiles = [];
		try {
			for (const f of readdirSync(dirPath).sort()) {
				const text = readFileSync(join(dirPath, f), "utf8");
				if (!fromRaw) snapshotRaw(root, slug, join("reviews", dir, f), text);
				if (f === "consolidated.md") consolidatedText = text;
				else {
					modelFiles.push(f);
					findingsText += text;
				}
			}
		} catch {
			markers.push({ marker: `precision.unparsed:${dir}` });
			continue;
		}
		const request = { kind: "precision", slug, inputs: { reviewDir: dir, models: modelFiles, findingsText, consolidatedText } };
		const result = llmCall(root, slug, `precision-${dir}`, request, llmCmd, fromRaw, llmTimeoutMs, redactionValues);
		if (!result.ok || !validatePrecisionOutput(result.response.output)) {
			markers.push({ marker: `precision.unparsed:${dir}` });
			continue;
		}
		const responseAttribution = safeAttribution(result.response, redactionValues, allUserMessages);
		if (!responseAttribution) {
			markers.push({ marker: `precision.unparsed:${dir}` });
			continue;
		}
		attribution ??= responseAttribution;
		let precisionModelRejected = false;
		for (const pm of result.response.output.perModel) {
			const model = sanitizeAttributionString(pm.model, redactionValues, allUserMessages);
			if (!model) {
				precisionModelRejected = true;
				continue;
			}
			panelPrecision.push({
				panelPhase: panel.panelPhase,
				round: panel.round,
				model,
				raised: pm.raised,
				incorporated: pm.incorporated,
				dismissed: pm.dismissed,
	const panels = run.hard.panels;
	const precision = run.soft?.panelPrecision ?? [];
	if (panels.length === 0) return `<section id="panel-deepdive"><h2>Panel deep-dive</h2><p class="coverage-notice">no harvested panel rounds</p></section>`;
	const blocks = panels
		.map((p) => {
			const modelRows = p.models.map((m) => `<div class="panel-model-row" data-model="${esc(m.model)}"><span>${esc(m.model)}</span><span>${m.tokens ?? 0} tok</span><span>${esc(fmtCost(m.cost ?? 0))}</span><span>${esc(fmtMs(m.durationMs ?? 0))}</span><span>${m.turns ?? 0} turns</span></div>`).join("\n");
			const findings = precision.filter((pr) => pr.panelPhase === p.panelPhase && pr.round === p.round);
			const findingRows =
				findings.length > 0
					? findings
							.map(
								(f) =>
									`<div class="panel-finding-row" data-soft="true" data-model="${esc(f.model)}"><span class="soft-attribution">soft (${esc(run.soft.attribution.model)})</span><span>${esc(f.model)}</span><span>raised ${f.raised}</span><span>incorporated ${f.incorporated}</span><span>dismissed ${f.dismissed}</span></div>`,
							)
							.join("\n")
					: '<p class="coverage-notice">no precision figures for this round</p>';
			return `<div class="panel-round" data-panel-phase="${esc(p.panelPhase)}" data-round="${p.round}">
<h3>${esc(p.panelPhase)} round ${p.round}</h3>
${modelRows}
${findingRows}
</div>`;
		})
		.join("\n");
	return `<section id="panel-deepdive">
<h2>Panel deep-dive</h2>
${blocks}
</section>`;
}
function renderSteeringMap(run) {
	const steering = run.soft?.steering ?? [];
	if (steering.length === 0) return `<section id="steering-map"><h2>Steering map</h2><p class="coverage-notice">no steering data (soft data absent or no user turns correlated)</p></section>`;
	const marks = steering.map((s) => `<div class="steering-mark" data-soft="true" data-class="${esc(s.class)}"><span class="soft-attribution">soft (${esc(run.soft.attribution.model)})</span><span class="steering-ts">${esc(s.ts)}</span><span class="steering-class">${esc(s.class)}</span></div>`).join("\n");
	return `<section id="steering-map">
read: /home/neil/code/threadsafe/pi-sdlc.worktrees/feat-sdlc-re...
read: /home/neil/code/threadsafe/pi-sdlc.worktrees/feat-sdlc-re...
response, and every LLM request/response pair — with deterministic names.
Re-running `collect --from-raw` reads exclusively from those snapshots
(§6) and reproduces the byte-identical run.json even after live sources are
pruned, rebased, or mutated. This is the regenerate-don't-migrate mechanism:
schema evolution is additive-only; a new collector regenerates from the
manifest + `raw/`; migrators are never written.
## 7. run.json v1
Pinned by committed schema `skills/sdlc-retro/schema/run.schema.json`
(validated in tests against all fixtures). Top level:
```
schemaVersion: 1
slug, title, track
coverage:   [ { marker, detail? } ]          # closed v1 marker set:
            # manifest.absent, manifest.partial, panels.missing:<phase>,
            # panels.malformed_meta:<phase>,
            # sessions.none, sessions.dir_unresolved, session.version:<file>,
            # github.skipped, github.error, git.error, llm.error:<kind>,
            # soft.absent, precision.unparsed:<dir>
sizeProxies:{ scenarios, tasks, diff{files,insertions,deletions},
              sessions, phases[] }
hard:       { window{start,end}, phases[], sessions[], panels[],
              models[], rollups{byModel[],byPhase[]}, rework{...},
              totals{tokens,cost,wallMs,agentMs,humanWaitMs} }
soft:       { attribution{model,provider}, narratives[], steering[],
              panelPrecision[] }             # optional as a whole
```
`hard` values are measured or absent (coverage-marked) — never estimated.
`soft` values are model-attributed. The schema separates them structurally so
the renderer cannot conflate them. The committed
`skills/sdlc-retro/schema/run.schema.json` pins every field name, type,
required/optional status, enum, and array item shape for this structure and
is the normative contract; the sketch above is its outline. Per NF2, schema
validation is **hand-rolled** (the `inspectManifest` precedent in
`validate-task.mjs`), never a schema library; tests assert the hand-rolled
validator and the committed schema file agree on every fixture, so the
schema cannot drift into decoration.
## 8. Renderer contract
`skills/sdlc-retro/scripts/render-retro.{mjs,sh}`:
```
render-retro.mjs --run FILE [--out FILE] [--format text|json]
```
Exit 0 written; 1 the `--run` input is unreadable, unparseable, or fails
[197 more lines in file. Use offset=400 to continue.]
// sdlc-retro collector core tests (lt-t4): manifest/panel/session/git/github
// adapters, derived hard measures, run.json v1 schema validity. Scenarios
// LT13 (hard portion), LT14, LT15, LT16. Offline/deterministic (NF1): git/gh
// are always injected fakes, no network, no model calls (the LLM seam is
// lt-t5's addition and does not exist yet in this file's collector).
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { chmodSync, existsSync, mkdirSync, mkdtempSync, readFileSync, realpathSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";
import Ajv from "ajv";
import { attributePhase, collect, derivePhaseSpans, discoverPanels, discoverReviewDirs, discoverSessions, gitDiffStats, githubCheck, readManifest, resolveSessionDirs, validateRunJson } from "../skills/sdlc-retro/scripts/collect-run.mjs";
const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = dirname(here);
const collectRunMjs = join(repoRoot, "skills", "sdlc-retro", "scripts", "collect-run.mjs");
function readRunSchema() {
	try {
		return JSON.parse(readFileSync(join(repoRoot, "skills", "sdlc-retro", "schema", "run.schema.json"), "utf8"));
	} catch (error) {
		assert.fail(`run schema is not valid JSON: ${error.message}`);
	}
}
const schemaValidate = new Ajv().compile(readRunSchema());
function tmp(prefix = "sdlc-lt4-") {
	return realpathSync(mkdtempSync(join(tmpdir(), prefix)));
}
function writeEvent(dir, slug, event, payload, ts, by = "agent") {
	const path = join(dir, ".pi", "sdlc", "runs", slug, "events.jsonl");
	mkdirSync(join(dir, ".pi", "sdlc", "runs", slug), { recursive: true });
	const line = `${JSON.stringify({ schemaVersion: 1, ts, slug, event, by, payload })}\n`;
	writeFileSync(path, existsSync(path) ? readFileSync(path, "utf8") + line : line, "utf8");
}
function isoAt(baseMs, offsetMs) {
	return new Date(baseMs + offsetMs).toISOString();
}
// A fixture executable (node script) usable as --git-cmd / --gh-cmd.
function mkStub(dir, name, body) {
	const p = join(dir, name);
	writeFileSync(p, `#!/usr/bin/env node\n${body}\n`);
	chmodSync(p, 0o755);
	return p;
}
const BASE = Date.parse("2026-07-17T10:00:00.000Z");
function seedManifest(root, slug) {
	writeEvent(root, slug, "run.started", { title: "Lifecycle telemetry", track: "irreversible" }, isoAt(BASE, 0));
	writeEvent(root, slug, "phase.entered", { phase: "plan" }, isoAt(BASE, 1000));
	writeEvent(root, slug, "phase.exited", { phase: "plan" }, isoAt(BASE, 5000));
	writeEvent(root, slug, "phase.entered", { phase: "implement" }, isoAt(BASE, 6000));
	writeEvent(root, slug, "task.validated", { task: "lt-x", verdict: "PASS", scenarioIds: ["S1", "S2"] }, isoAt(BASE, 7000));
	writeEvent(root, slug, "panel.harvested", { panelPhase: "pr_review", round: 1, dir: "x", missed: [] }, isoAt(BASE, 8000));
	writeEvent(root, slug, "artifact.revised", { artifact: "spec", rev: 2, reason: "panel finding" }, isoAt(BASE, 9000));
	writeEvent(root, slug, "phase.backward", { from: "build", to: "spec", reason: "gap found" }, isoAt(BASE, 10000));
	writeEvent(root, slug, "pr.fix_wave", { number: 1, sha: "abc1234" }, isoAt(BASE, 11000));
}
function seedPanel(root, slug, date) {
	const dir = join(root, ".pi", "sdlc", "runs", slug, "panels", `pr_review-round1-${date}`);
	mkdirSync(dir, { recursive: true });
	writeFileSync(join(dir, "status.json"), JSON.stringify({ lifecycleArtifactVersion: 1, results: [{ model: "openai/gpt-5", totalTokens: 100, totalCost: 0.5, durationMs: 1000, turnCount: 3 }] }));
	writeFileSync(join(dir, "events.jsonl"), `${JSON.stringify({ event: "subagent.run.started" })}\n`);
}
function seedSession(homeDir, root) {
	const mapped = root.replace(/^\//, "").replaceAll("/", "-");
	const sessDir = join(homeDir, ".pi", "agent", "sessions", `--${mapped}--`);
	mkdirSync(sessDir, { recursive: true });
	const lines = [
		{ type: "session", version: 3, id: "s1", timestamp: isoAt(BASE, 500) },
		{ type: "model_change", id: "a", parentId: null, timestamp: isoAt(BASE, 600), provider: "anthropic", modelId: "claude-x" },
		{ type: "message", id: "u1", parentId: "a", timestamp: isoAt(BASE, 700), message: { role: "user", content: [], timestamp: BASE + 700 } },
		{
			type: "message",
			id: "m1",
			parentId: "u1",
			timestamp: isoAt(BASE, 2700),
			message: { role: "assistant", content: [], provider: "anthropic", model: "anthropic/claude-x", usage: { totalTokens: 50, cost: { total: 0.1 } }, stopReason: "end_turn", timestamp: BASE + 2700 },
		},
		{ type: "message", id: "u2", parentId: "m1", timestamp: isoAt(BASE, 2800), message: { role: "user", content: [], timestamp: BASE + 2800 } },
		{
			type: "message",
			id: "m2",
			parentId: "u2",
			timestamp: isoAt(BASE, 6500),
			message: { role: "assistant", content: [], provider: "anthropic", model: "anthropic/claude-x", usage: { totalTokens: 20, cost: { total: 0.05 } }, stopReason: "end_turn", timestamp: BASE + 6500 },
		},
	];
	const path = join(sessDir, "2026-07-17T10-00-00-000Z_s1.jsonl");
	writeFileSync(path, `${lines.map((l) => JSON.stringify(l)).join("\n")}\n`);
	return sessDir;
}
// ---------------------------------------------------------------------------
// LT13 (hard portion) — a complete fixture run store produces a schema-valid
// run.json, with size proxies and by-model/by-phase rollups asserted against
// known answers.
// ---------------------------------------------------------------------------
test("LT13 (hard): complete fixture store -> schema-valid run.json with known-answer rollups", () => {
	const root = tmp();
	const home = tmp("sdlc-lt4-home-");
	const bin = tmp("sdlc-lt4-bin-");
	try {
		const slug = "lt13-run";
		seedManifest(root, slug);
		const date = new Date().toISOString().slice(0, 10);
		seedPanel(root, slug, date);
		seedSession(home, root);
		const gitCmd = mkStub(
			bin,
			"fake-git",
			`
const args = process.argv.slice(2);
if (args[2] === "merge-base") { process.stdout.write("deadbeef\\n"); process.exit(0); }
if (args[2] === "diff") { process.stdout.write(" 3 files changed, 40 insertions(+), 5 deletions(-)\\n"); process.exit(0); }
process.exit(1);
`,
		);
		const ghCmd = mkStub(bin, "fake-gh", 'process.stdout.write("[]\\n"); process.exit(0);');
		const { runJson } = collect({ root, slug, gitCmd, ghCmd, home });
		const issues = validateRunJson(runJson);
		assert.deepEqual(issues, [], `hand-rolled validator issues: ${issues.join("; ")}`);
		assert.equal(schemaValidate(runJson), true, `committed schema issues: ${JSON.stringify(schemaValidate.errors)}`);
		assert.equal(runJson.title, "Lifecycle telemetry");
		assert.equal(runJson.track, "irreversible");
		assert.equal(runJson.sizeProxies.scenarios, 2);
		assert.equal(runJson.sizeProxies.tasks, 1);
		assert.equal(runJson.sizeProxies.sessions, 1);
		assert.deepEqual(runJson.sizeProxies.diff, { files: 3, insertions: 40, deletions: 5 });
		// known-answer rollups: session tokens (50+20=70, cost 0.15) attributed to
		// implement (both assistant messages fall after phase.entered implement at
		// +6000ms... first assistant at +2700ms falls in the plan span (ends +5000ms)).
		const byModel = Object.fromEntries(runJson.hard.rollups.byModel.map((m) => [m.model, m]));
		assert.equal(byModel["anthropic/claude-x"].tokens, 70);
		assert.ok(Math.abs(byModel["anthropic/claude-x"].cost - 0.15) < 1e-9);
		assert.equal(byModel["openai/gpt-5"].tokens, 100);
		assert.equal(byModel["openai/gpt-5"].cost, 0.5);
		const byPhase = Object.fromEntries(runJson.hard.rollups.byPhase.map((p) => [p.phase, p]));
		assert.equal(byPhase.plan.tokens, 50, "first assistant message (+2700ms) falls within the plan span (1000-5000ms)");
		assert.equal(byPhase.implement.tokens, 20, "second assistant message (+6500ms) falls within the implement span");
		assert.equal(byPhase.pr.tokens, 100, "panel.harvested pr_review maps to lifecycle phase pr");
		assert.deepEqual(runJson.hard.rework, { artifactRevised: 1, phaseBackward: 1, fixWave: 1 });
		assert.equal(runJson.hard.totals.tokens, 170);
		assert.ok(Math.abs(runJson.hard.totals.cost - 0.65) < 1e-9);
		// no --llm-cmd was passed: lt-t5 default is soft.absent (never invoke an
		// unconfigured LLM binary), so this is the only marker expected here.
		assert.deepEqual(runJson.coverage, [{ marker: "soft.absent" }]);
	} finally {
		rmSync(root, { recursive: true, force: true });
		rmSync(home, { recursive: true, force: true });
		rmSync(bin, { recursive: true, force: true });
	}
});
// ---------------------------------------------------------------------------
// LT14 — a gappy store (no panels dir, no correlatable sessions) produces a
// schema-valid run.json whose coverage markers name each gap and whose hard
// section contains no value derived from a missing source.
// ---------------------------------------------------------------------------
test("LT14: a gappy store names every gap and derives nothing from missing sources", () => {
	const root = tmp();
	const home = tmp("sdlc-lt4-home-empty-");
	const bin = tmp("sdlc-lt4-bin-");
	try {
		const slug = "lt14-run";
		seedManifest(root, slug);
		const ghCmd = mkStub(bin, "fake-gh", 'process.stdout.write("[]\\n"); process.exit(0);');
		const gitCmd = mkStub(bin, "fake-git-fail", "process.exit(1);");
		const { runJson } = collect({ root, slug, gitCmd, ghCmd, home, noGithub: false });
		const issues = validateRunJson(runJson);
		assert.deepEqual(issues, []);
		assert.equal(schemaValidate(runJson), true, JSON.stringify(schemaValidate.errors));
		const markers = runJson.coverage.map((c) => c.marker);
		assert.ok(markers.includes("sessions.dir_unresolved") || markers.includes("sessions.none"), `expected a session gap marker; got ${markers}`);
		assert.ok(markers.includes("panels.missing:pr_review"), `expected panels.missing:pr_review; got ${markers}`);
		assert.ok(markers.includes("git.error"), `expected git.error; got ${markers}`);
		assert.equal(runJson.sizeProxies.diff, undefined, "no diff proxy fabricated when git fails");
		assert.deepEqual(runJson.hard.panels, [], "no panel entries fabricated when the panels dir is missing");
		assert.deepEqual(runJson.hard.sessions, [], "no session entries fabricated when nothing correlates");
	} finally {
		rmSync(root, { recursive: true, force: true });
		rmSync(home, { recursive: true, force: true });
		rmSync(bin, { recursive: true, force: true });
	}
});
test("LT14: --no-github records github.skipped, not github.error", () => {
	const root = tmp();
	const home = tmp("sdlc-lt4-home-empty-");
	try {
		const slug = "lt14b-run";
		seedManifest(root, slug);
		const { runJson } = collect({ root, slug, gitCmd: "false", ghCmd: "false", home, noGithub: true });
		const markers = runJson.coverage.map((c) => c.marker);
		assert.ok(markers.includes("github.skipped"));
		assert.ok(!markers.includes("github.error"));
	} finally {
		rmSync(root, { recursive: true, force: true });
		rmSync(home, { recursive: true, force: true });
	}
});
// ---------------------------------------------------------------------------
// LT15 — per-adapter known-answer fixtures.
// ---------------------------------------------------------------------------
test("LT15: manifest adapter skips and counts malformed lines (manifest.partial)", () => {
	const root = tmp();
	try {
		const slug = "lt15-manifest";
		seedManifest(root, slug);
		const path = join(root, ".pi", "sdlc", "runs", slug, "events.jsonl");
		writeFileSync(path, `${readFileSync(path, "utf8")}not valid json at all\n`);
		const { events, markers } = readManifest(root, slug);
		assert.equal(events.length, 9, "malformed line excluded, all 9 valid lines kept");
		assert.deepEqual(markers, [{ marker: "manifest.partial", detail: "1 malformed line(s) skipped" }]);
	} finally {
		rmSync(root, { recursive: true, force: true });
	}
});
test("LT15: harvest adapter maps per-model fields correctly", () => {
	const root = tmp();
	try {
		const slug = "lt15-harvest";
		seedManifest(root, slug);
		const date = new Date().toISOString().slice(0, 10);
		seedPanel(root, slug, date);
		const { events } = readManifest(root, slug);
		const { panels, markers } = discoverPanels(root, slug, events);
		assert.deepEqual(markers, []);
		assert.equal(panels.length, 1);
		assert.equal(panels[0].panelPhase, "pr_review");
		assert.equal(panels[0].round, 1);
		assert.deepEqual(panels[0].models, [{ model: "openai/gpt-5", tokens: 100, cost: 0.5, durationMs: 1000, turns: 3 }]);
		assert.equal(panels[0].wave, 1, "wave defaults to round when no meta.json sidecar");
	} finally {
		rmSync(root, { recursive: true, force: true });
	}
});
test("T3: discoverPanels reads the meta.json wave; malformed sidecar falls back to round with a marker", () => {
	const root = tmp();
	try {
		const slug = "t3-meta";
		seedManifest(root, slug);
		const date = "2026-07-19";
		const panelsRoot = join(root, ".pi", "sdlc", "runs", slug, "panels");
		// round 2, logical wave 1 (a replacement dispatch) with a valid sidecar
		const d1 = join(panelsRoot, `pr_review-round2-${date}`);
		mkdirSync(d1, { recursive: true });
		writeFileSync(join(d1, "status.json"), JSON.stringify({ state: "completed" }));
		writeFileSync(join(d1, "events.jsonl"), "");
		writeFileSync(join(d1, "meta.json"), JSON.stringify({ round: 2, wave: 1 }));
		// a malformed sidecar on a plan_review round 1: wave falls back to round, marker emitted
		const d2 = join(panelsRoot, `plan_review-round1-${date}`);
		mkdirSync(d2, { recursive: true });
		writeFileSync(join(d2, "status.json"), JSON.stringify({ state: "completed" }));
		writeFileSync(join(d2, "events.jsonl"), "");
		writeFileSync(join(d2, "meta.json"), "{ not valid json");
		const { panels, markers } = discoverPanels(root, slug, []);
		const pr = panels.find((p) => p.panelPhase === "pr_review");
		const plan = panels.find((p) => p.panelPhase === "plan_review");
		assert.equal(pr.round, 2);
		assert.equal(pr.wave, 1, "valid sidecar wave is read");
		assert.equal(plan.round, 1);
		assert.equal(plan.wave, 1, "malformed sidecar falls back to wave=round");
		assert.ok(
			markers.some((m) => m.marker === "panels.malformed_meta:plan_review"),
			`expected panels.malformed_meta marker; got ${JSON.stringify(markers)}`,
		);
	} finally {
		rmSync(root, { recursive: true, force: true });
	}
});
test("LT15: transcript usage/cost sums correctly and a version-4 transcript soft-fails per-file", () => {
	const root = tmp();
	const home = tmp("sdlc-lt4-home-");
	try {
		const slug = "lt15-transcript";
		seedManifest(root, slug);
		seedSession(home, root);
		// a version-4 session file dropped alongside the v3 fixture: soft-fails, not fatal
		const mapped = root.replace(/^\//, "").replaceAll("/", "-");
		const sessDir = join(home, ".pi", "agent", "sessions", `--${mapped}--`);
		writeFileSync(join(sessDir, "v4.jsonl"), `${JSON.stringify({ type: "session", version: 4, id: "v4" })}\n`);
		const { events } = readManifest(root, slug);
		const { sessions, markers } = discoverSessions(root, events, { home });
		assert.equal(sessions.length, 1, "only the v3 session correlates");
		assert.ok(markers.some((m) => m.marker === "session.version:v4.jsonl"));
		assert.equal(sessions[0].file, "2026-07-17T10-00-00-000Z_s1.jsonl");
	} finally {
		rmSync(root, { recursive: true, force: true });
		rmSync(home, { recursive: true, force: true });
	}
});
test("LT15: review-dir discovery matches both <phase>-<slug>-<date> and <phase>-review-<slug>-<date> naming", () => {
	const root = tmp();
	try {
		const slug = "lt15-review";
		mkdirSync(join(root, "docs", "reviews", `spec-${slug}-2026-07-17`), { recursive: true });
		mkdirSync(join(root, "docs", "reviews", `pr-${slug}-2026-07-18`), { recursive: true });
		mkdirSync(join(root, "docs", "reviews", `pr-review-${slug}-2026-07-19`), { recursive: true }); // new -review- form
		mkdirSync(join(root, "docs", "reviews", `plan-review-${slug}-2026-07-16`), { recursive: true }); // new -review- form
		mkdirSync(join(root, "docs", "reviews", `task-validate-${slug}-lt-x-2026-07-17`), { recursive: true }); // must NOT match
		const found = discoverReviewDirs(root, slug);
		assert.deepEqual(found, [`plan-review-${slug}-2026-07-16`, `pr-${slug}-2026-07-18`, `pr-review-${slug}-2026-07-19`, `spec-${slug}-2026-07-17`]);
	} finally {
		rmSync(root, { recursive: true, force: true });
	}
});
test("LT15: git/GitHub adapters consume only the injected fakes", () => {
	const root = tmp();
	const bin = tmp("sdlc-lt4-bin-");
	try {
		const gitCmd = mkStub(
			bin,
			"record-git",
			'const fs=require("fs"); fs.writeFileSync(process.env.MARKER_FILE, process.argv.slice(2).join(" ")+"\\n", {flag:"a"}); if (process.argv[3]==="merge-base") process.stdout.write("base\\n"); else process.stdout.write(" 1 file changed, 2 insertions(+), 0 deletions(-)\\n"); process.exit(0);',
		);
		const ghCmd = mkStub(bin, "record-gh", 'const fs=require("fs"); fs.writeFileSync(process.env.MARKER_FILE, "gh "+process.argv.slice(2).join(" ")+"\\n", {flag:"a"}); process.stdout.write("[]\\n"); process.exit(0);');
		const markerFile = join(bin, "calls.log");
		writeFileSync(markerFile, "");
		process.env.MARKER_FILE = markerFile;
		const gitResult = gitDiffStats(gitCmd, root, "main");
		const ghResult = githubCheck(ghCmd, root, "some-branch", false);
		delete process.env.MARKER_FILE;
		assert.deepEqual(gitResult.diff, { files: 1, insertions: 2, deletions: 0 });
		assert.deepEqual(ghResult.markers, []);
		const calls = readFileSync(markerFile, "utf8");
		assert.ok(calls.includes("merge-base"), "git seam invoked for merge-base");
		assert.ok(calls.includes("diff"), "git seam invoked for diff");
		assert.ok(calls.includes("gh pr list"), "gh seam invoked for pr list");
	} finally {
		rmSync(root, { recursive: true, force: true });
		rmSync(bin, { recursive: true, force: true });
	}
});
// ---------------------------------------------------------------------------
// LT16 — derived-measure formulas against a hand-computed fixture.
// ---------------------------------------------------------------------------
test("LT16: phase attribution, agent time, capped human-wait, rework, window bounds", () => {
	const root = tmp();
	try {
		const slug = "lt16-measures";
		seedManifest(root, slug);
		const { events } = readManifest(root, slug);
		const windowStart = events[0].ts;
		const windowEnd = events[events.length - 1].ts;
		assert.equal(windowStart, isoAt(BASE, 0));
		assert.equal(windowEnd, isoAt(BASE, 11000));
		const spans = derivePhaseSpans(events, windowEnd);
		assert.deepEqual(
			spans.map((s) => [s.phase, s.start, s.end, s.exitExplicit]),
			[
				["plan", isoAt(BASE, 1000), isoAt(BASE, 5000), true],
				["implement", isoAt(BASE, 6000), windowEnd, false],
			],
		);
		assert.equal(attributePhase(spans, isoAt(BASE, 3000), windowStart, windowEnd), "plan");
		assert.equal(attributePhase(spans, isoAt(BASE, 5500), windowStart, windowEnd), "unattributed", "between plan's exit and implement's entry");
		assert.equal(attributePhase(spans, isoAt(BASE, -1), windowStart, windowEnd), null, "before the window is excluded entirely");
	} finally {
		rmSync(root, { recursive: true, force: true });
	}
});
test("LT16: a 3-hour gap contributes exactly 30 minutes to human-wait", () => {
	const root = tmp();
	const home = tmp("sdlc-lt4-home-");
	try {
		const slug = "lt16-humanwait";
		// window wide enough to correlate a session 3 hours long
		writeEvent(root, slug, "run.started", { title: "T", track: "reversible" }, isoAt(BASE, 0));
		writeEvent(root, slug, "phase.entered", { phase: "implement" }, isoAt(BASE, 1000));
		writeEvent(root, slug, "phase.exited", { phase: "implement" }, isoAt(BASE, 3 * 60 * 60 * 1000 + 20000));
		const sessDirBase = tmp("sdlc-lt4-sessdirbase-");
		const mapped = sessDirBase.replace(/^\//, "").replaceAll("/", "-");
		const sessDir = join(home, ".pi", "agent", "sessions", `--${mapped}--`);
		mkdirSync(sessDir, { recursive: true });
		const threeHoursMs = 3 * 60 * 60 * 1000;
		const lines = [
			{ type: "session", version: 3, id: "s2", timestamp: isoAt(BASE, 500) },
			{
				type: "message",
				id: "m1",
				parentId: null,
				timestamp: isoAt(BASE, 1500),
				message: { role: "assistant", content: [], model: "anthropic/claude-x", usage: { totalTokens: 1, cost: { total: 0 } }, timestamp: BASE + 1500 },
			},
			{ type: "message", id: "u1", parentId: "m1", timestamp: isoAt(BASE, 1500 + threeHoursMs), message: { role: "user", content: [], timestamp: BASE + 1500 + threeHoursMs } },
			{
				type: "message",
				id: "m2",
				parentId: "u1",
				timestamp: isoAt(BASE, 1600 + threeHoursMs),
				message: { role: "assistant", content: [], model: "anthropic/claude-x", usage: { totalTokens: 1, cost: { total: 0 } }, timestamp: BASE + 1600 + threeHoursMs },
			},
		];
		writeFileSync(join(sessDir, "sess.jsonl"), `${lines.map((l) => JSON.stringify(l)).join("\n")}\n`);
		const { runJson } = collect({ root, slug, gitCmd: "false", ghCmd: "false", home, noGithub: true, sessionsDirOverrides: [sessDir] });
		assert.equal(runJson.hard.totals.humanWaitMs, 30 * 60 * 1000, "a 3-hour gap is capped at exactly 30 minutes");
		// agent time sums every assistant entry's gap vs its immediate predecessor
		// regardless of the predecessor's type: m1 (+1000ms vs the session header)
		// plus m2 (+100ms vs the preceding user entry) = 1100ms.
		assert.equal(runJson.hard.totals.agentMs, 1100, "agent time sums every assistant entry's gap vs its immediate predecessor");
	} finally {
		rmSync(root, { recursive: true, force: true });
		rmSync(home, { recursive: true, force: true });
	}
});
// ---------------------------------------------------------------------------
// Usage-error / CLI sanity.
// ---------------------------------------------------------------------------
test("collect-run: no run store exits 1 (nothing collectable)", () => {
	const root = tmp();
	try {
		const r = spawnSync(process.execPath, [collectRunMjs, "--slug", "no-such-run", "--repo-root", root], { encoding: "utf8" });
		assert.equal(r.status, 1);
		assert.ok(r.stderr.includes("sdlc-telemetry:"));
	} finally {
		rmSync(root, { recursive: true, force: true });
	}
});
test("collect-run: writes docs/retros/<slug>/run.json by default and validates", () => {
	const root = tmp();
	const home = tmp("sdlc-lt4-home-");
	try {
		const slug = "lt-cli-run";
		seedManifest(root, slug);
		const r = spawnSync(process.execPath, [collectRunMjs, "--slug", slug, "--repo-root", root, "--no-github", "--git-cmd", "false", "--format", "json"], { encoding: "utf8", env: { ...process.env, HOME: home } });
		assert.equal(r.status, 0, r.stderr);
		const parsed = JSON.parse(r.stdout);
		assert.equal(parsed.ok, true);
		assert.equal(parsed.out, join("docs", "retros", slug, "run.json"));
		const written = JSON.parse(readFileSync(join(root, "docs", "retros", slug, "run.json"), "utf8"));
		assert.equal(schemaValidate(written), true, JSON.stringify(schemaValidate.errors));
	} finally {
		rmSync(root, { recursive: true, force: true });
		rmSync(home, { recursive: true, force: true });
	}
});
test("resolveSessionDirs: an override list is used verbatim; absence marks sessions.dir_unresolved", () => {
	const root = tmp();
	try {
		const { dirs, markers } = resolveSessionDirs(root, { home: root });
		assert.deepEqual(dirs, []);
		assert.deepEqual(markers, [{ marker: "sessions.dir_unresolved" }]);
	} finally {
		rmSync(root, { recursive: true, force: true });
	}
});
bash: cd /home/neil/code/threadsafe/pi-sdlc.worktrees/feat-sdlc...
bash: cd /home/neil/code/threadsafe/pi-sdlc.worktrees/feat-sdlc...
read: /home/neil/code/threadsafe/pi-sdlc.worktrees/feat-sdlc-re...
367:            # panels.malformed_meta:<phase>,
258:   files and `consolidated.md`. The `<phase>-review-<slug>-<date>` form (a
259:   `-review-` infix) is an equally-accepted alternative and the recommended
## 12. Lifecycle telemetry (FS13)
Every instrumented run keeps a durable manifest of its own lifecycle at
`.pi/sdlc/runs/<slug>/events.jsonl` (git-ignored; the sibling `sdlc-retro`
skill distills it into a committed post-mortem — see that skill's SKILL.md
for the collect/render pipeline once the run store has anything to distill).
Emission is fail-soft everywhere (an unresolvable run identity or an
unwritable store degrades to one stderr warning, never a behavioural change)
and additive-only to every frozen FS5 contract (ADR 0028).
Record these prose-emitted inflection points with
`scripts/record-run-event.sh <event>` (relative to this loaded skill;
headless: `node <skill-dir>/scripts/record-run-event.mjs <event>`) and its
event-type payload:
- **Run start**: once, right after the readiness gate confirms this repo is
  ready and before announcing —
  `record-run-event.sh run.started --payload '{"title":"<feature title>","track":"<irreversible|reversible>"}'`.
- **Every phase entry**: on entering brainstorm/plan/spec/build/implement/pr —
  `record-run-event.sh phase.entered --payload '{"phase":"<phase>"}'`.
- **Every human gate approval**: when the human approves a phase's gate —
  `record-run-event.sh gate.approved --payload '{"phase":"<phase>","artifact":"<path>","rev":<n>,"approver":"human:<slug>"}'`.
- **Panel dispatch**: immediately after dispatching a design or PR panel —
  `record-run-event.sh panel.dispatched --payload '{"panelPhase":"<panelPhase>","round":<wave>,"models":[...]}'`
  — and, harvest-at-dispatch, immediately preserve its artifacts with
  `scripts/harvest-panel.sh --phase <panelPhase> --round <label> --wave <wave> --from <asyncDir>`
  (skill-relative; headless: `node <skill-dir>/scripts/harvest-panel.mjs`).
  Two distinct numbers appear here on purpose: `<wave>` is the **logical
  review-wave counter** — a replacement dispatch for an infra-failed reviewer
  belongs to its original wave and carries that wave's `<wave>` in the `round`
  payload field of both the dispatch and consolidation events and in
  `harvest-panel --wave`. `<label>` is the harvest `--round` **destination
  allocation label**, which may advance past the wave to avoid overwriting a
  prior snapshot (see `references/phase-pr-review.md`, "Harvest-at-dispatch");
  it defaults to `<wave>` when omitted. `harvest-panel` records both in a
  `meta.json` sidecar so the collector groups same-wave rounds without parsing
  prose; still note any label↔wave divergence in that wave's `consolidated.md`
  for human readers.
- **Panel consolidation**: after adjudicating a round's findings —
  `record-run-event.sh panel.consolidated --payload '{"panelPhase":"<panelPhase>","round":<wave>,"findings":{"high":<n>,"medium":<n>,"low":<n>},"incorporated":<n>,"dismissed":<n>}'`.
- **Caller-side lifecycle-check recording**: right after running
  `check-lifecycle` (itself untouched, FS9) —
  `record-run-event.sh lifecycle.checked --payload '{"verdict":"<verdict>"}'`.
- **PR open**: right after opening the PR —
  `record-run-event.sh pr.opened --payload '{"number":<n>}'`.
- **Fix wave**: after addressing a post-PR reviewer concern with a commit —
  `record-run-event.sh pr.fix_wave --payload '{"number":<n>,"sha":"<short-sha>"}'`.
`resolve-panel.sh`, `ensure-panel-agent.sh`, and `validate-task.sh` emit their
own events automatically (`panel.resolved`, `panel.agent_stamped`,
`task.validated`) after successful completion — nothing to do beyond passing
`--slug` when it isn't resolvable from the current git branch. Per-task
validator dispatch also harvests: immediately after a `task_validate`
subagent completes, run `scripts/harvest-panel.sh --phase task_validate
--round <n> --from <asyncDir>` the same way as a design/PR panel dispatch.
[60 more lines in file. Use offset=344 to continue.]
bash: cd /home/neil/code/threadsafe/pi-sdlc.worktrees/feat-sdlc...
27:function fullFixture() {
42:			panels: [{ panelPhase: "pr_review", round: 1, dir: ".pi/sdlc/runs/lt20-run/panels/pr_review-round1-2026-07-18", models: [{ model: "openai/gpt-5", tokens: 100, cost: 0.5, durationMs: 1000, turns: 3 }] }],
76:			panels: [],
90:	const html = renderDashboard(fullFixture());
124:	const fx = fullFixture();
158:	const run = fullFixture();
175:		writeFileSync(runPath, JSON.stringify(fullFixture()));
193:	const html = renderDashboard(fullFixture());
203:	const run = fullFixture();
218:	const run = fullFixture();
261:		writeFileSync(runPath, JSON.stringify(fullFixture()));
read: /home/neil/code/threadsafe/pi-sdlc.worktrees/feat-sdlc-re...
	}
});
test("T2: a -review- form review directory yields non-empty precision (F1 extraction guard)", () => {
	const root = tmp();
	const bin = tmp("sdlc-lt5-bin-");
	try {
		const slug = "t2-review";
		seedManifest(root, slug);
		const date = "2026-07-18";
		// a harvested panel the review dir can join to
		const panelDir = join(root, ".pi", "sdlc", "runs", slug, "panels", `pr_review-round1-${date}`);
		mkdirSync(panelDir, { recursive: true });
		writeFileSync(join(panelDir, "status.json"), JSON.stringify({ state: "completed" }));
		writeFileSync(join(panelDir, "events.jsonl"), "");
		// the review dir uses the -review- infix form (would silently unparse before F1)
		const reviewDir = join(root, "docs", "reviews", `pr-review-${slug}-${date}`);
		mkdirSync(reviewDir, { recursive: true });
		writeFileSync(join(reviewDir, "consolidated.md"), "adjudication prose");
		writeFileSync(join(reviewDir, "model-a.md"), "findings");
		const llmCmd = mkLlmStub(bin);
		const { runJson } = collect({ root, slug, gitCmd: "false", ghCmd: "false", noGithub: true, llmCmd });
		const markers = runJson.coverage.map((c) => c.marker);
		assert.ok(!markers.includes(`precision.unparsed:pr-review-${slug}-${date}`), `-review- dir must not unparse; got ${markers}`);
		assert.ok(runJson.soft.panelPrecision.length > 0, "precision recorded for the -review- directory");
		assert.equal(runJson.soft.panelPrecision[0].panelPhase, "pr_review");
	} finally {
		rmSync(root, { recursive: true, force: true });
		rmSync(bin, { recursive: true, force: true });
	}
});
test("T3: same-wave multi-round harvests (a replacement dispatch) join to one wave without precision.unparsed", () => {
	const root = tmp();
	const bin = tmp("sdlc-lt5-bin-");
	try {
		const slug = "t3-onewave";
		seedManifest(root, slug);
		const date = "2026-07-18";
		// two harvested rounds on the same date, both logical wave 1 (round 2 is a replacement)
		for (const [round, wave] of [
			[1, 1],
			[2, 1],
		]) {
			const pdir = join(root, ".pi", "sdlc", "runs", slug, "panels", `pr_review-round${round}-${date}`);
			mkdirSync(pdir, { recursive: true });
			writeFileSync(join(pdir, "status.json"), JSON.stringify({ state: "completed" }));
			writeFileSync(join(pdir, "events.jsonl"), "");
			writeFileSync(join(pdir, "meta.json"), JSON.stringify({ round, wave }));
		}
		const reviewDir = join(root, "docs", "reviews", `pr-review-${slug}-${date}`);
		mkdirSync(reviewDir, { recursive: true });
		writeFileSync(join(reviewDir, "consolidated.md"), "adjudication prose");
		writeFileSync(join(reviewDir, "model-a.md"), "findings");
		const llmCmd = mkLlmStub(bin);
		const { runJson } = collect({ root, slug, gitCmd: "false", ghCmd: "false", noGithub: true, llmCmd });
		const markers = runJson.coverage.map((c) => c.marker);
		assert.ok(!markers.some((m) => m.startsWith("precision.unparsed")), `no unparse expected; got ${markers}`);
		assert.ok(runJson.soft.panelPrecision.length > 0, "precision recorded for the one-wave review");
		assert.ok(
			runJson.soft.panelPrecision.every((p) => p.wave === 1 && p.round === 1),
			"precision attributed to logical wave 1",
		);
	} finally {
		rmSync(root, { recursive: true, force: true });
		rmSync(bin, { recursive: true, force: true });
	}
});
test("T3: harvests that disagree on wave for one review date emit precision.unparsed", () => {
	const root = tmp();
	const bin = tmp("sdlc-lt5-bin-");
	try {
		const slug = "t3-multiwave";
		seedManifest(root, slug);
		const date = "2026-07-18";
		// two harvested rounds on the same date belonging to DIFFERENT waves
		for (const [round, wave] of [
			[1, 1],
			[2, 2],
		]) {
			const pdir = join(root, ".pi", "sdlc", "runs", slug, "panels", `pr_review-round${round}-${date}`);
			mkdirSync(pdir, { recursive: true });
			writeFileSync(join(pdir, "status.json"), JSON.stringify({ state: "completed" }));
			writeFileSync(join(pdir, "events.jsonl"), "");
			writeFileSync(join(pdir, "meta.json"), JSON.stringify({ round, wave }));
		}
		const reviewDir = join(root, "docs", "reviews", `pr-review-${slug}-${date}`);
		mkdirSync(reviewDir, { recursive: true });
		writeFileSync(join(reviewDir, "consolidated.md"), "adjudication prose");
		writeFileSync(join(reviewDir, "model-a.md"), "findings");
		const llmCmd = mkLlmStub(bin);
		const { runJson } = collect({ root, slug, gitCmd: "false", ghCmd: "false", noGithub: true, llmCmd });
		const markers = runJson.coverage.map((c) => c.marker);
		assert.ok(markers.includes(`precision.unparsed:pr-review-${slug}-${date}`), `expected wave-disagreement unparse; got ${markers}`);
		assert.equal(runJson.soft.panelPrecision.length, 0, "no precision when waves disagree");
	} finally {
		rmSync(root, { recursive: true, force: true });
		rmSync(bin, { recursive: true, force: true });
	}
});
test("LT18: an unreadable review directory yields precision.unparsed:<dir> and no precision number", () => {
	const root = tmp();
	const home = tmp("sdlc-lt5-home-empty-");
	const bin = tmp("sdlc-lt5-bin-");
	try {
		const slug = "lt18-precision";
		seedManifest(root, slug);
		// a review dir matching the naming convention but with no readable files
		// (simulated by making the "directory" actually a broken symlink target
		// is platform-fragile; instead we assert via a directory whose only file
		// causes a read to still enumerate to at least consolidated.md content,
		// and instead force failure through an llm-cmd that returns invalid JSON
		// for the precision kind specifically).
		mkdirSync(join(root, "docs", "reviews", `implement-${slug}-2026-07-18`), { recursive: true });
		writeFileSync(join(root, "docs", "reviews", `implement-${slug}-2026-07-18`, "consolidated.md"), "adjudication prose");
[197 more lines in file. Use offset=275 to continue.]
bash: cd /home/neil/code/threadsafe/pi-sdlc.worktrees/feat-sdlc...
test("LT20: full fixture renders all seven anchors with known-answer data bindings", () => {
	const html = renderDashboard(fullFixture());
	for (const anchor of SECTION_ANCHORS) assert.ok(html.includes(`id="${anchor}"`), `missing anchor #${anchor}`);
	// no external references
	assert.ok(!/https?:\/\//.test(html), "no http(s):// references");
bash: cd /home/neil/code/threadsafe/pi-sdlc.worktrees/feat-sdlc...
	const panelPrecision = [];
	for (const dir of reviewDirs) {
		const lifecyclePhase = LIFECYCLE_PHASES.find((phase) => dir.startsWith(`${phase}-${slug}-`));
		const panelPhase = lifecyclePhase ? LIFECYCLE_TO_PANEL[lifecyclePhase] : undefined;
		const reviewDate = dir.match(/-(\d{4}-\d{2}-\d{2})$/)?.[1];
		const matchingPanels = panelPhase ? panels.filter((p) => p.panelPhase === panelPhase) : [];
		const datedPanels = reviewDate ? matchingPanels.filter((p) => p.dir.endsWith(`-${reviewDate}`)) : matchingPanels;
		const candidates = datedPanels.length > 0 ? datedPanels : matchingPanels.length === 1 ? matchingPanels : [];
		const panel = candidates.length === 1 ? candidates[0] : undefined;
		if (!panel) {
			markers.push({ marker: `precision.unparsed:${dir}` });
			continue;
		}
		// Replay reads only raw/reviews/<dir>; it must not consult a mutated or
Now let me verify a critical backward-compat claim in the actual worktree: that the `event.schema.json` is valid JSON Schema, and that `run.schema.json` with `additionalProperties: false` still validates old `panelPrecision` records (without `wave`).
bash: cd /home/neil/code/threadsafe/pi-sdlc.worktrees/feat-sdlc...
Old record (no wave): VALID
New record (with wave): VALID
bash: cd /home/neil/code/threadsafe/pi-sdlc.worktrees/feat-sdlc...
Old record (hand-rolled): VALID
New record (hand-rolled): VALID
### buildSoftData precision fallback widens to all matchingPanels when datedPanels is empty
- severity: low
- confidence: medium
- file: skills/sdlc-retro/scripts/collect-run.mjs
- line: 922 (the `const candidates = datedPanels.length > 0 ? datedPanels : matchingPanels` line)
- problem: When `datedPanels` is empty (no panel harvest dir matches the review dir's date), the old code required exactly one matching panel before attributing precision (`matchingPanels.length === 1`). The new code falls back to ALL `matchingPanels` and attributes precision if they share one wave — silently widening the match for the cross-date case. This behavioral change is not documented in the plan, which only describes the `datedPanels` path.
- repro_or_impact: If a review directory's date doesn't match any panel harvest date (e.g., date skew or a manual review dir), and there are multiple panels for the same phase on different dates that happen to share one wave, the collector attributes precision to the review dir rather than emitting `precision.unparsed`. The old code would have unparsed. In practice this is a narrow edge case (dates should match), but it means `precision.unparsed` is no longer a reliable "could not match" signal — some cross-date mismatches are silently consumed.
- smell: Speculative Generality
### panelPrecision[].round now carries the wave value, not the harvest round — design call with potential consumer confusion
- severity: low
- confidence: high
- file: skills/sdlc-retro/scripts/collect-run.mjs
- line: 963 (`round: wave`)
- problem: `panelPrecision[].round` is semantically repurposed from "harvest round number" to "logical wave value" (always equal to `wave` in new records). The PR body documents this as "keep both" — but the retained `round` field no longer means what it did. A future consumer that reads `panelPrecision[].round` and expects the harvest-round/index would get the wave counter instead for any record with `wave ≠ round` (i.e., every replacement dispatch).
- repro_or_impact: For a replacement dispatch (harvest round 2, logical wave 1), `panelPrecision[].round` is 1, not 2. The current renderer correctly uses `(pr.wave ?? pr.round)` and is unaffected. But the `round` field in `panelPrecision[]` is required by the v1 schema — it exists purely for backward compat — and its semantic shift is a latent footgun for any direct consumer of `panelPrecision[].round` that was written against the pre-wave meaning.
- smell: Mysterious Name
### PASS on all other claims
No findings at severity high. The additive/backward-compat claims are verified: both AJV (committed schema) and the hand-rolled `validateRunJson` accept old `wave`-less and new `wave`-bearing `panelPrecision[]`/`panels[]` records. The `event.schema.json` optional `wave` fields are additive. The `discoverReviewDirs` regex and `buildSoftData` `startsWith` companion fix both accept the `-review-` form (guarded by test T2). The precision join correctly groups same-wave multi-round days and unparses disagreeing-wave days (guarded by T3). The renderer groups by wave and falls back `wave ?? round`. All 404 tests pass.
```acceptance-report
{
  "criteriaSatisfied": [
    {
      "id": "criterion-1",
      "status": "satisfied",
      "evidence": "Returned three concrete findings with file paths, line numbers, severity, and reproduction/impact analysis"
    }
  ],
  "changedFiles": [
    "skills/sdlc-retro/scripts/collect-run.mjs",
    "skills/sdlc-retro/scripts/render-retro.mjs",
    "skills/sdlc/scripts/harvest-panel.mjs",
    "skills/sdlc/scripts/telemetry.mjs",
    "skills/sdlc-retro/schema/event.schema.json",
    "skills/sdlc-retro/schema/run.schema.json",
    "docs/specs/2026-07-17-sdlc-lifecycle-telemetry.md",
    "skills/sdlc/references/phase-pr-review.md",
    "skills/sdlc/references/system-reference.md",
    "skills/sdlc/assets/normative-references.json",
    "test/telemetry-collect.test.js",
    "test/telemetry-collect-soft.test.js",
    "test/telemetry-harvest.test.js",
    "test/telemetry-render.test.js"
  ],
  "testsAddedOrUpdated": [
    "test/telemetry-collect.test.js (T3: discoverPanels meta.json + malformed sidecar, LT15 review-dir discovery both forms)",
    "test/telemetry-collect-soft.test.js (T2: -review- precision guard, T3: same-wave joins / disagreeing-wave unparse)",
    "test/telemetry-harvest.test.js (T1: --wave flag + distinct round/wave + validation)",
    "test/telemetry-render.test.js (T4: wave-collapse render)"
  ],
  "commandsRun": [
    {
      "command": "npm test",
      "result": "passed",
      "summary": "404 tests pass, 0 fail, 0 skip"
    },
    {
      "command": "AJV schema validation of old (wave-less) and new (wave-bearing) run.json records against the updated run.schema.json",
      "result": "passed",
      "summary": "Both old and new records validate against the committed schema; backward-compat claim holds"
    },
    {
      "command": "Hand-rolled validateRunJson validation of old and new records",
      "result": "passed",
      "summary": "Both old and new records validate; hand-rolled validator matches committed schema"
    }
  ],
  "validationOutput": [
    "All 404 tests pass. AJV and hand-rolled validators both accept wave-less and wave-bearing run.json records. event.schema.json is valid JSON Schema. run.schema.json additionalProperties:false with wave in properties correctly permits the new field on both panels[] and panelPrecision[] while rejecting unknown fields."
  ],
  "residualRisks": [
    "buildSoftData precision fallback widens cross-date match (low severity, narrow edge case)",
    "panelPrecision[].round semantic repurposing (low severity, documented design call, latent footgun if a future consumer reads .round expecting harvest-round semantics)"
  ],
  "noStagedFiles": true,
  "diffSummary": "Adds logical review-wave identity through the retro pipeline: harvest-panel.mjs --wave + meta.json sidecar; collect-run.mjs sidecar read + wave-grouped precision join; render-retro.mjs wave grouping; review-dir naming regex widened to accept -review- infix in both discoverReviewDirs and buildSoftData; optional wave on telemetry payloads/schemas/validators (allowed-not-required, no v1->v2 bump). 40 files changed, 4176 insertions, 46 deletions.",
  "reviewFindings": [
    "low: skills/sdlc-retro/scripts/collect-run.mjs:922 — buildSoftData precision fallback widens to all matchingPanels when datedPanels is empty, a behavioral change not in the plan",
    "low: skills/sdlc-retro/scripts/collect-run.mjs:963 — panelPrecision[].round now carries wave value, not harvest round; semantic repurposing is a latent footgun (smell: Mysterious Name)"
  ],
  "manualNotes": "No blockers. The two low-severity findings are both design judgment calls: the cross-date fallback widening (not in the plan but benign in practice) and the panelPrecision[].round semantic shift (documented, but the field name no longer matches its value). Both are acceptable under the reversible track. The core invariants — wave grouping through harvest/collect/render, backward-compat validation, -review- naming discovery — are all correctly implemented and well-tested."
}
```
