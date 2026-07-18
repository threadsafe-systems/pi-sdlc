1. ### Tracker guidance still asserts a fixed default of two tasks

   - severity: medium
   - confidence: high
   - file: skills/sdlc/SKILL.md
   - line: 216-217
   - problem: The tracker section now uses `shape.publishToTracker` for the decision but still labels **two** as the default, despite the standard preset committing `4`, solo committing `"never"`, and v3 requiring an explicit value. This leaves round-2 finding 1 only partially resolved and violates the requirement to remove the hard-coded task-count law.
   - repro_or_impact: Adopt with `--preset standard`; the config says publication starts at four tasks while the process law still advertises two as the default, so an agent can apply the wrong threshold.
   - fix: Remove `(default **two**; ...)`; state only that `"never"` disables publication and the committed value is authoritative.

2. ### `review.tasks: off` still conflicts with universal validator requirements

   - severity: medium
   - confidence: high
   - file: skills/sdlc/SKILL.md
   - line: 345-365
   - problem: The new opening branch says `off` skips per-task validation, but the remainder still requires **every** implementation task to carry a manifest and receipt, requires the runner to return PASS before completion, and unconditionally says a validator subagent runs it. This leaves round-2 finding 2 only partially resolved; `self` also has no coherent receipt behavior because the mandated receipt includes a generated-agent copy and model.
   - repro_or_impact: With `review.tasks: "off"`, following lines 345-365 still forces the supposedly disabled PV1/PV2 workflow; with `self`, it requires subagent-only receipt fields even though `resolve-panel task_validate` refuses dispatch.
   - fix: Scope the manifest/runner/subagent/receipt requirements explicitly to `subagent`; define whether `self` invokes the runner and what non-subagent receipt it writes, and state that `off` imposes none of those per-task artifacts or PASS gates.
