I have completed my thorough review. Here are my findings.

---

### SPEC-R2-01

- id: SPEC-R2-01
- severity: medium
- area: C
- quote: `The rule: Plans entered from Brainstorm open with the provenance block (the gate sketch when one exists, then the decisions list — store in plain mode, index in map mode); standalone Plans (sdlc:plan, no committed upstream) record the live-formed intent in the same position with an explicit`no upstream gate`declaration.` — docs/specs/2026-08-09-gate-presentation-contract.md:52–56
- defect: The plan's scope item 4 includes "A plan must not contradict a named decision or resurrect a `rejected:` line without a declared deviation; enforcement rides the plan panel's existing attack surface D (locked decisions) in `prompts/adversary-plan.prompt.md` — by reference, never restated" (docs/plans/2026-08-09-gate-presentation-contract.md, scope item 4). The spec's C2 shape and GPC2 scenario specify only the storage rule (provenance block, plain/map/standalone). A grep of the spec confirms zero occurrences of "contradict", "attack surface", "resurrect", or "adversary-plan" — the contradiction-check routing the plan places in §4 has no contract shape and no gating scenario. An implementer following C2 would omit this statement from §4.
- fix: Add to C2's Signature/shape a clause stating the §4 rule includes the no-contradiction/no-resurrection statement with enforcement routed to the plan panel's attack surface D by reference, and add a corresponding falsifier to GPC2 (the §4 rule missing this statement).

### SPEC-R2-02

- id: SPEC-R2-02
- severity: medium
- area: B
- quote: `the PR panel verifies every edit falls inside the surfaces C1–C6 and C9–C10 declare (phase-brainstorm.md §1/§8/§9, phase-plan.md §4, the one new test file)` — docs/specs/2026-08-09-gate-presentation-contract.md:354–356
- defect: The contract enumeration "C1–C6 and C9–C10" omits C8, yet the parenthetical immediately includes "the one new test file" — which is C8's declared surface (C8 Signature/shape, line 139: `test/gate-presentation-contract.test.js`). C8 declares a surface but is excluded from the enumeration that claims to list all surface-declaring contracts. (The same "C1–C6 and C9–C10" range is correct at line 142 and line 303, where it refers to anchor-naming contracts only — C8 doesn't name anchors. But at line 354 it refers to surface-declaring contracts, where C8 does belong.)
- fix: Change "the surfaces C1–C6 and C9–C10 declare" to "the surfaces C1–C6, C8, and C9–C10 declare" so the enumeration matches the parenthetical.

### SPEC-R2-03

- id: SPEC-R2-03
- severity: low
- area: C
- quote: `Enforce with contract tests only — no gate-time parser, no new dial, no new tooling | C8, GPC10, GPC11, GPC12` — docs/specs/2026-08-09-gate-presentation-contract.md:196
- defect: F7 claims "no gate-time parser" but its binding omits GPC15, whose Falsify is "any new parsing machinery" (line 360) — the only scenario that falsifies a parser added to an existing file rather than a new script. GPC11 (in F7's binding) catches new files under `skills/sdlc/scripts/` and manifest changes, but a pure-JS parser grafted into an existing `.mjs` file evades both GPC11 checks. GPC15 is the comprehensive no-parser gate and is absent from F7's binding.
- fix: Add GPC15 to F7's binding: `C8, GPC10, GPC11, GPC12, GPC15`.

### SPEC-R2-04

- id: SPEC-R2-04
- severity: low
- area: C
- quote: (absence) The plan's DoD 7 requires `bash skills/sdlc/scripts/check-lifecycle.sh --track irreversible --slug gate-presentation-contract exit 0` (docs/plans/2026-08-09-gate-presentation-contract.md, DoD 7). A grep of the spec confirms zero occurrences of "check-lifecycle" or "lifecycle".
- defect: DoD 7 (check-lifecycle exit 0 once Spec and Build artifacts are committed) has no spec scenario. GPC12 gates `npm test`, `check-references.mjs`, and `biome check` but not `check-lifecycle.sh`. The check is mechanically decidable (the script exists at `skills/sdlc/scripts/check-lifecycle.sh` and accepts `--track`/`--slug`), so the omission is not a decidability limitation but a coverage gap.
- fix: Add a falsifier clause to GPC12 (or a new mechanical scenario) asserting `bash skills/sdlc/scripts/check-lifecycle.sh --track irreversible --slug gate-presentation-contract` exits 0.

### SPEC-R2-05

- id: SPEC-R2-05
- severity: low
- area: D
- quote: `the branch adds no file under`skills/sdlc/scripts/`other than none; no governed doc introduces a configuration knob.` — docs/specs/2026-08-09-gate-presentation-contract.md:313
- defect: "no file … other than none" is a grammatically broken double negative. It reads as though "none" is a placeholder for an allowed-files list that was never filled. A runner implementing the check must interpret the intent (zero new scripts) from context rather than from the literal text, which muddies the decidability of a scenario labelled `mechanical`.
- fix: Replace "other than none" with "the branch adds no file under `skills/sdlc/scripts/`" (delete the trailing clause).

### SPEC-R2-06

- id: SPEC-R2-06
- severity: low
- area: B
- quote: `Given: this run's plan (rev 5,`5f105fa`), the map #192 index entries, and the canonical home body (issuecomment-5230679564).` — docs/specs/2026-08-09-gate-presentation-contract.md:341
- defect: The SHA `5f105fa` is not an ancestor of HEAD, not on `main`, and not on the branch `feat/gate-presentation-contract` — it is a dangling reflog entry from a rebased `main@{3}`. The plan at HEAD is at commit `1dd6211` (verified: `git merge-base --is-ancestor 1dd6211 HEAD` succeeds; `git merge-base --is-ancestor 5f105fa HEAD` fails). The same stale SHA also appears in the spec header (line 6). Content is identical at both SHAs, so this is a wrong-identifier defect, not a content defect.
- fix: Replace `5f105fa` with `1dd6211` at lines 6 and 341.

---

CLEAR: A — all 19 CANON items (01–19) verified landed in rev 2 as described; no fix landed wrong, half, or with a new inconsistency attributable to a fix.
CLEAR: E — every skeleton binding rule (Vocabulary both-ways, Contracts six-block completeness, one-kind-per-scenario with readable ratio, NFR response-measure + binding, Given/When–Then/Falsify form) is satisfied after the rewrite.
CLEAR: PROPORTIONALITY — no rev-2 addition has an enforcement cost exceeding the defect it prevents; all scenarios are grep checks, command exits, or human inspections at named points.

VERDICT: 6 findings (0 high, 2 medium, 4 low)
