# PV1 Validator Report — gate-presentation-contract / t4

- Task: `t4` (owned scenario: GPC2)
- Manifest: `docs/validation/gate-presentation-contract/t4.json`
- Runner report: `docs/reviews/task-validate-gate-presentation-contract-t4-2026-08-09/runner-report.json`
- Verdict: **PASS** (runner exit 0; report `exitCode: 0`, `verdict: PASS`, `errors: []`, `manifestErrors: []` — agree)

## 1. Deterministic runner (re-run by this validator)

Command: `bash skills/sdlc/scripts/validate-task.sh --manifest docs/validation/gate-presentation-contract/t4.json --report docs/reviews/task-validate-gate-presentation-contract-t4-2026-08-09/runner-report.json`

| Check | Status | Note |
|---|---|---|
| tests.task | PASS | `node --test test/gate-presentation-contract.test.js` — 22/22 pass incl. the four GPC2 tests |
| tests.full | PASS | `npm test` — 577/577 pass, 0 fail |
| static.refs | PASS | `check-references.mjs` — phase-plan.md inventory/discovery rows resolve after the §4 insertion |
| static.lint | PASS | `npx biome check test/gate-presentation-contract.test.js` — clean |

Categories: tests PASS, static PASS, scenarios PASS (GPC2 → tests.task), standards N/A and bannedPatterns N/A (Build-approved manifest declarations — not re-judged).

## 2. Independent spot-check: GPC2 vs spec wording

GPC2 (docs/specs/2026-08-09-gate-presentation-contract.md, "§4 storage rule: plain default, map index, standalone declaration · mechanical") requires, against `skills/sdlc/references/phase-plan.md` at HEAD:

1. **Enumeration extended** — CONFIRMED. §4 first paragraph now reads "objectives, rationale, scope in/out, definition of done, context for the next agent, **and the Brainstorm provenance block**" (git diff base 4e682ca…HEAD shows the extension).
2. **Rule between opening paragraph and Dialogue discipline** — CONFIRMED. The new "**Brainstorm provenance storage.**" paragraph sits exactly between "Produce the Plan doc…" and "**Dialogue discipline.**".
3. **Both storage branches + standalone branch** — CONFIRMED. Plain: "in plain mode store both verbatim"; map: "in map mode store the sketch verbatim and index the decisions list (one gist line per ticket, linking to the ticket resolution comment where the full list lives in one place)" with the boundary rule (no line-kind prefix, no uniform classification); standalone: "A Plan entered with no upstream gate declares that explicitly (\"no upstream gate\") in the block's place".
4. **No-contradiction clause with declared deviation** — CONFIRMED. "A plan must not contradict a named decision or resurrect a `rejected:` line without a declared deviation in the plan itself."
5. **Enforcement by reference to attack surface D, prompt untouched** — CONFIRMED. "Adjudication…routes by reference to the frozen adversary plan prompt's attack surface D — the prompt itself stays untouched." Verified independently that (a) `skills/sdlc/prompts/adversary-plan.prompt.md` has an empty diff against base (frozen surface untouched) and (b) attack surface D exists there as "D. Locked decisions: does the plan re-open or contradict a settled decision without flagging it?" — matching spec C2's "attack surface D (locked decisions)".

## 3. Contract test assertions (test/gate-presentation-contract.test.js)

Four GPC2 tests (lines 185–209) assert anchors, not restated substance:
- `assert.match(planSec4, /Brainstorm provenance block/)` — enumeration anchor;
- positional check via `indexOf`: opening paragraph < "**Brainstorm provenance storage.**" < "**Dialogue discipline.**";
- anchor-phrase matches for the three branches (`in plain mode store both verbatim`, `in map mode store the sketch verbatim and index the decisions list`, `no upstream gate`);
- anchor-phrase matches for the no-contradiction clause, the attack-surface-D routing, and `the prompt itself stays untouched`.

No test re-derives or re-states rule substance beyond matching the doc's own anchor strings.

## 4. Findings

- Low / informational: GPC2's When–Then says the §4 rule states "plain is the default". §4 carries this by delegation — "stored per §8's mode rule" — rather than a literal sentence; plain-as-default is grounded upstream in phase-brainstorm.md ("Default brainstorm is a single dialogue gated by human approval", map mode as explicit switch; §8 completion evidence: human-approved design (plain) vs decision-ready map destination (map)). No GPC2 falsifier fires ("plain described as anything but the default" is absent), the runner's scenario gate passed, and the manifest's evidence/mapping are Build-approved — recorded as observation only, not a FAIL.
- No blockers.

## 5. Artifacts written by this validator

- `docs/reviews/task-validate-gate-presentation-contract-t4-2026-08-09/report.json`
- `docs/reviews/task-validate-gate-presentation-contract-t4-2026-08-09/validator.md` (this file)
- `runner-report.json` in the same directory was re-written by the validator's own runner invocation (atomic, exit 0/PASS).

No source files were edited.
