# Build plan: proactive code-prose discipline

Status: approved derivation  
Track: reversible  
Plan: `docs/plans/2026-08-07-writing-comments-discipline.md`  
Issue: #176  
Run slug: `writing-comments-discipline`

## 1. Build objective

Ship one self-contained authoring sequence that defers reader-facing comments/docstrings until behavior is green, audits test names at task close, blocks validation/closure on a worker attestation, and gives the existing PR panel the same reader-now attack surface. Do not add a scanner, specialist reviewer, dependency, role, phase, floor, schema, or configuration dial.

## 2. Verification budget

| check | purpose | budget |
| --- | --- | ---: |
| `npm test` | full regression corpus (`scope: full`) | 30 s |
| `node --test test/writing-comments-discipline.test.js` | focused author/reviewer/task-close contract (`scope: task`) | 3 s |
| `npx biome check <task files>` | touched-surface formatting/static check | 10 s |
| `node skills/sdlc/scripts/check-references.mjs` | public-reference inventory integrity | 5 s |
| `node --test test/frozen-surfaces.test.js` | deliberate frozen-surface reopening stays bounded | 5 s |

All checks are local and make no network/model calls. The full suite remains the per-commit broad regression net; focused checks make task ownership visible.

## 3. Task graph

```text
wc-t1 ──▶ wc-t2 ──▶ wc-t3
```

The sequence is deliberate: the reviewer parity contract depends on the canonical authoring vocabulary, and the baseline/integration sweep must audit the final package surfaces rather than an intermediate wording.

## 4. Tasks

### wc-t1 — canonical authoring and task-close law

**Outcome:** Implement owns a self-contained comment-last contract and Tasks projects it into every task DoD.

**Surfaces:**

- `skills/sdlc/references/phase-implement.md`
- `skills/sdlc/references/phase-tasks.md`
- `test/writing-comments-discipline.test.js` (new)
- `docs/validation/writing-comments-discipline/wc-t1.json`

**Work:**

1. Add the reader-now law to Implement: comment-last ordering, executable/type-affecting directive exception, no process provenance, no absent/future narration, contracts/invariants/non-obvious rationale only, no code restatement, and the staleness test.
2. Require the final pass to audit all changed reader-facing comments/docstrings and every changed test name; allow local scenario IDs only when the remaining name is a standalone behavioral claim.
3. Define the task-close ordering and exact `Code-prose pass: complete` handoff attestation under `subagent`, `self`, `off`, and standalone operation. Keep the validator mechanistic and the attestation outside manifests/receipts/source.
4. Add the task-DoD projection in Tasks without creating a new gate.
5. Add focused contract tests for the canonical law and configuration-independent closure seam.

**Definition of Done:**

- Plan DoD 1–2 are satisfied.
- Focused tests fail when ordering, exception, test-name audit, exact attestation, or `review.tasks: off` fallback is removed.
- The task's own code-prose pass is complete before validation.

**Checks:**

- `npm test` (`scope: full`, ≤30 s)
- `node --test test/writing-comments-discipline.test.js` (`scope: task`, ≤3 s)
- `npx biome check test/writing-comments-discipline.test.js` (≤10 s)

**PV1 categories:** `tests: required`; `static: required`; `scenarios: n/a` (reversible Plan has no Specification scenario ledger); `standards: n/a` (the focused contract is the package standard); `bannedPatterns: n/a` (a generic provenance scanner is explicitly out of scope).

### wc-t2 — normal-reviewer enforcement and parity

**Blocked by:** `wc-t1`.

**Outcome:** every existing PR reviewer attacks code prose in the same round as behavioral review, with impact-based severity and no specialist role.

**Surfaces:**

- `skills/sdlc/prompts/adversary-review.prompt.md`
- `test/writing-comments-discipline.test.js`
- `test/frozen-surfaces.test.js` (temporary deliberate reopening of the changed prompt)
- `test/iteration-disposition.test.js` (temporary reconciliation of the standing re-freeze guard)
- `test/fixtures/golden/pr_review.agent.md` (stamped prompt projection)
- `docs/validation/writing-comments-discipline/wc-t2.json`

**Work:**

1. Add one self-contained code-prose attack surface to the normal reviewer prompt covering comments, docstrings, and test names.
2. Distinguish machine-consumed/type-affecting directives and valid scenario tags from reader-facing prose without allowing the tag to replace a behavioral test name.
3. Require impact-based severity and concrete reader/maintenance harm; prohibit dismissing process narration as bikeshedding.
4. Extend focused tests so authoring and reviewer surfaces retain the same core obligations while remaining purpose-shaped.
5. Reopen only the changed frozen prompt; restoration after merge remains mandatory under the established frozen-surface protocol.

**Definition of Done:**

- Plan DoD 3–4 and 8 are satisfied.
- No panel roster, floor, reviewer role, review phase, or config changes.
- The prompt remains one source stamped for all normal PR reviewers.
- The task's own code-prose pass is complete before validation.

**Checks:**

- `npm test` (`scope: full`, ≤30 s)
- `node --test test/writing-comments-discipline.test.js test/extraction.test.js test/iteration-disposition.test.js` (`scope: task`, ≤5 s)
- `npx biome check test/writing-comments-discipline.test.js test/iteration-disposition.test.js test/frozen-surfaces.test.js` (≤10 s)
- `node --test test/frozen-surfaces.test.js` (≤5 s)

**PV1 categories:** `tests: required`; `static: required`; `scenarios: n/a`; `standards: required` (frozen-surface protocol); `bannedPatterns: n/a`.

### wc-t3 — dogfood baseline, local-rule retirement, and integration

**Blocked by:** `wc-t2`.

**Outcome:** pi-sdlc no longer depends on its local optional-skill reminder and its tracked source/test baseline contains no known clear process-provenance violations.

**Surfaces:**

- `.pi/sdlc/workflow.md`
- clear violations found under tracked source/test code
- `test/writing-comments-discipline.test.js`
- public-reference/integration surfaces only if verification proves an update is required
- `docs/validation/writing-comments-discipline/wc-t3.json`

**Work:**

1. Perform the deliberate code-prose audit over tracked source/test files. Rewrite only clear process provenance; preserve ambiguous domain terminology and behaviorally complete scenario-tagged tests.
2. Remove the redundant/misspelled local global-skill reminder now that package law owns the behavior.
3. Confirm no documentation archaeology or canonical scenario-key work leaked into the slice; leave the recorded carries intact.
4. Run full, focused, reference, frozen-surface and lifecycle checks.

**Definition of Done:**

- Plan DoD 5–8 are satisfied.
- The audit records disputed cases in PR adjudication rather than silently broadening cleanup.
- No tracked source/test comment or test name known to cite an implementation issue, review finding/round, reviewer identity, or task/slice history survives without a reader-now justification.
- The task's own code-prose pass is complete before validation.

**Checks:**

- `npm test` (`scope: [full, task]`, ≤30 s)
- `npx biome check .` (≤15 s; Build assumes the merged main baseline is clean)
- `node skills/sdlc/scripts/check-references.mjs` (≤5 s)
- `node --test test/frozen-surfaces.test.js` (≤5 s)

**PV1 categories:** `tests: required`; `static: required`; `scenarios: n/a`; `standards: required`; `bannedPatterns: n/a` (manual bounded audit, not a shipped scanner).

## 5. Spec gap log

None. The reversible Plan supplies sufficient DoD for decomposition and intentionally has no Specification scenario ledger.

## 6. Assumptions

1. The focused test may inspect exact concept anchors across authoring and reviewer Markdown; it is a contract test, not a prose-quality classifier.
2. The current full suite remains below 30 seconds and Biome's merged-main baseline is clean.
3. A prompt frozen-surface reopening follows the existing reopen-in-feature / mandatory post-merge re-freeze pattern.
4. Existing local scenario tags in test names are not baseline violations when paired with independently meaningful behavior.
5. Tracker publication is required: three tasks exceed the configured threshold of two.

## 7. Outbound carries

- **CARRY-TO-#178:** shipped Markdown archaeology/identifier normalisation.
- **CARRY-TO-S1/#178:** immutable scenario namespaces and canonical keys.

These are programme-level carries, not Build deficiencies and not `CARRY-TO-IMPLEMENT` work for this slice.

## 8. Amendments

### A1 — prompt projections and standing re-freeze guard

- Trigger: the first committed `wc-t2` deterministic run failed the full suite because changing the package prompt also invalidates its stamped golden projection and IDV19's standing assertion that all three S5 prompts are currently frozen.
- Class: **(c), normal fix wave**.
- Disposition: **incorporated**. `wc-t2` owns the generated PR-agent golden and temporarily reconciles IDV19 with the deliberate review-prompt reopening. The task-focused command expands to the writing, extraction, and iteration-disposition corpora; the manifest is renewed before revalidation. The mandatory post-merge re-freeze restores both the prompt's FROZEN entry and IDV19's standing all-three assertion.
- Scope unchanged: no runtime behavior, role, floor, phase, or scanner is added.
