1. ### Tracker publication still hard-codes the retired two-task rule

   - severity: medium
   - confidence: high
   - file: skills/sdlc/SKILL.md
   - line: 112-116, 213-214, 368-371
   - problem: The M4 fix is incomplete: the phase note still says publication begins at two tasks, the tracker section still calls two the default, and the PR section still grants every single-task build a no-tracker exemption. Remove those constants and express all three decisions only in terms of the committed `shape.publishToTracker` value.
   - repro_or_impact: With `publishToTracker: 1`, lines 115 and 371 tell an agent not to publish a one-task build even though the committed dial requires it; with `publishToTracker: 4` or `"never"`, lines 115 and 214 continue to advertise a conflicting two-task rule.

2. ### `review.tasks` still does not control the SKILL's validator workflow

   - severity: medium
   - confidence: high
   - file: skills/sdlc/SKILL.md
   - line: 328-353
   - problem: The process law still unconditionally says every task ends with a validator subagent and that the subagent runs the runner, despite `review.tasks` allowing `self` and `off`. Branch this section explicitly: retain the current workflow only for `subagent`, define self-run behavior for `self`, and skip per-task validation for `off`.
   - repro_or_impact: The shipped Solo preset commits `review.tasks: "self"`; an agent following lines 330 and 351 will nevertheless try to dispatch a validator subagent, while the corrected `resolve-panel task_validate` now refuses that same operation.

3. ### The authoritative-dials paragraph assigns invalid enums to three dials

   - severity: medium
   - confidence: high
   - file: skills/sdlc/SKILL.md
   - line: 78-82
   - problem: The parenthetical says each named dial accepts `panel|advisory|human|off`, but only `review.design` and `review.code` do; `review.tasks` is `subagent|self|off`, and `review.brainstorm` is `human|off`. Enumerate each dial's real values (and the narrower override set) or remove the misleading enum list.
   - repro_or_impact: An adopter following this newly added normative paragraph can author `review.tasks: "panel"` or `review.brainstorm: "advisory"`; both are rejected by `inspectConfig`, leaving the repo not-ready.

4. ### Forced override deletion is not disclosed as a before-to-after patch

   - severity: medium
   - confidence: high
   - file: skills/sdlc/scripts/setup-sdlc.mjs
   - line: 583-596
   - problem: After `--force` bypasses the new override guard, the patch report prints only `(was <before>)` and omits the resulting intent blocks, contrary to the required before→after disclosure. Include `fmt(before) → fmt(after)` (or an explicit dropped-track list) in both text and JSON report messages.
   - repro_or_impact: Create with `--preset full --override irreversible:code:advisory`, then run `--preset full --force`; exit 0 deletes `overrides.irreversible`, but stdout only prints the old object and never says that the track is absent afterward.

5. ### The SKILL still passes a bare vendor where `provider/model` is required

   - severity: low
   - confidence: high
   - file: skills/sdlc/SKILL.md
   - line: 257-260, 279-281
   - problem: Both canonical panel commands retain `<author-vendor>`/`<vendor>` placeholders even though the vendor heuristic was deleted and the wrapper now correctly documents `--author <provider/model>`. Change both placeholders to `<provider/model>`.
   - repro_or_impact: Substituting a bare value such as `anthropic` as instructed reaches `resolve-panel.mjs`'s `--author must be provider/model` check and exits 1 instead of resolving the panel.
