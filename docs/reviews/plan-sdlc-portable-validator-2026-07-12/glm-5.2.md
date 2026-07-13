I have all evidence needed. Here is the adversarial plan review.

---

### Deterministic-verdict DoD is unfalsifiable against the named agent/prose/no-parser architecture

- severity: high
- confidence: high
- location: `docs/plans/2026-07-12-sdlc-portable-validator.md` DoD lines 176–182, 184; PV4 line 73; Risks line 148–152; Constraints line 143
- defect: The DoD commits the validator to *deterministic* `FAIL` for manifest *interpretation* failures (missing category/id/command/reason, duplicate id, validator-invented `n/a`, "vague scenario evidence," and "an undeclared command is introduced"), but the only mechanism the plan names is an agent executing prose law with no parser and no live model in tests. There is no offline-falsifiable path to verify agent judgement, so these DoD items are opinions, not checkable gates.
- evidence: DoD `portable-validator.md:176-179` ("...deterministically yields `FAIL` in contract fixtures"), `:181-182` ("mutation fixtures fail if an undeclared command is introduced or a declared command is substituted"), `:184` ("missing or vague scenario evidence fails"); PV4 `:73` ("Evidence and verdict are deterministic"); Risk `:148-152` ("make its grammar strict enough for an agent to reject omissions consistently **without pretending there is a parser**"); Constraint `:143` ("Tests make no paid model or network call"). The validator is prose law executed by an agent (`skills/sdlc/prompts/validator-task.prompt.md` — no programmatic manifest handling exists).
- impact: Offline "contract fixtures" can only assert prompt-text *presence* or run commands directly in the harness; neither observes the agent's manifest interpretation. A mutation fixture cannot detect that an agent *ran* an undeclared command without a live model. The spec cannot satisfy this DoD as written, so the central portability guarantee ("runs only declared commands," "no invented `n/a`") ships unverifiable and the self-hosting claim at DoD `:191` is likewise a runtime assertion with no offline witness.
- fix: Split the determinism claim: keep deterministic-FAIL only for command execution (exit code / missing-executable), and either (a) downgrade manifest-malformation/vague-evidence detection to "prompt instructs rejection + golden asserts the instruction is present," or (b) introduce an explicit deterministic manifest-contract checker component and stop describing the design as "no parser."

### Re-projecting the human-approved sibling Adoption Readiness Build has no stated re-approval path

- severity: medium
- confidence: high
- location: In-scope `portable-validator.md:120`; PV5 `:99`; programme law `lifecycle-hardening.md:31`; AR Build `adoption-readiness-build.md:10,12`
- defect: The plan takes in-scope "Update the blocked Adoption Readiness Build to use the merged contract," which edits the task-check bodies of a *separate*, already-human-approved programme child (#7–#11), but states neither whether this re-opens that child's Build human gate nor who re-approves the re-projected manifests.
- evidence: In-scope `portable-validator.md:120`; PV5 `:99` only says AR "remains Blocked until this portable-validator PR is merged"; programme `lifecycle-hardening.md:31` ("No child may absorb another child's frozen surface merely for convenience"); AR Build `adoption-readiness-build.md:10` ("Human gate: Build decomposition, tracker projection, checks, and DoD approved by Neil Chambers") and `:12` ("Validator decision: route 2 approved").
- impact: The AR tasks' `static`/`n/a` declarations must change form under the new contract (this JS repo will move `npx tsc --noEmit` to `n/a` and declare `node --check`/Biome), i.e. a sibling child's approved task checks mutate. Without a stated gate, this either silently bypasses the programme's per-child Build-approval discipline or ambiguously re-opens it mid-stream.
- fix: Add one line stating whether updating the AR Build task manifests is a mechanical re-projection (no re-approval) or requires a fresh AR Build human gate, and name the owner of that decision.

### "Bounded" output and "must not echo secrets unnecessarily" are not falsifiable DoD items

- severity: medium
- confidence: medium
- location: DoD `portable-validator.md:186`; Risk `:156-157`
- defect: The DoD gates "grammar are deterministic and bounded" and the risk says evidence "must not echo environment/auth contents unnecessarily," but neither specifies a concrete bound (byte/line limit, redaction pattern) nor a falsifiable check; "unnecessarily" is a judgement, not a testable predicate.
- evidence: DoD `:186` ("Overall output and verdict grammar are deterministic and bounded"); Risk `:156-157` ("raw command output can be large or contain secrets. Evidence must be bounded and must not echo environment/auth contents unnecessarily").
- impact: A reviewer cannot write a failing check for "bounded" or "unnecessarily." The plan defers the exact bound to the Specification (context `:206`), which is acceptable for shape, but the DoD line as written is an opinion and will be checked as documentation-presence only.
- fix: Replace the DoD line with a concrete, spec-pinned bound (e.g. max N lines/bytes per check and a redaction regex) or scope the DoD to "the Specification pins a byte/line ceiling and a redaction rule, with a fixture asserting a secret-token is never echoed."

### DoD "unchanged goldens" enumeration omits the validator resolve golden it promises to preserve

- severity: low
- confidence: high
- location: DoD `portable-validator.md:189`; PV6 `:104`; `test/extraction.test.js:153-159`
- defect: PV6 promises "validator model preference ... remain unchanged," but the DoD item listing preserved goldens enumerates only "plan/spec/PR," omitting `task_validate`. S6 deep-compares `task_validate.resolve.json`, so it is implicitly gated, but the DoD does not state it.
- evidence: PV6 `portable-validator.md:104` ("Model resolution, validator model preference ... remain unchanged"); DoD `:189` ("Existing plan/spec/PR prompt goldens and panel resolution remain unchanged"); `test/extraction.test.js:153` iterates all four phases including `task_validate` against `test/fixtures/golden/task_validate.resolve.json`.
- impact: A future change to validator preference would not be caught by an explicit DoD line; reliance on the implicit S6 gate is fragile if the test is refactored.
- fix: Extend the DoD item to "plan/spec/PR *and task_validate* goldens and panel resolution remain unchanged."

---

CLEAR: C — scope is one Specification's worth (O4-only, correctly split from O5 durable state and child-2 templates); in/out do not contradict the objectives.
CLEAR: D — no locked-decision contradiction; the plan respects ADR 0007 (heading-only freeze), keeps FS2/`sdlc.models.json` and resolver behaviour untouched, and aligns with programme O4/O7.
CLEAR: F — irreversible track is correctly chosen; the per-task gate contract (what authors must supply, what may pass/fail/n/a) is a frozen surface regardless of whether any FS7 heading changes.
