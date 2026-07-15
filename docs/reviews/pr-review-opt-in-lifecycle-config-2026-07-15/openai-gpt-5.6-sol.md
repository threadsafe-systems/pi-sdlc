### Interactive custom setup silently coerces invalid Boolean answers

- severity: medium
- confidence: high
- file: skills/sdlc/scripts/setup-sdlc.mjs
- line: 500-501
- problem: The custom interview maps every answer other than case-insensitive `true` to `false`, rather than accepting exactly the advertised `true|false` vocabulary or refusing invalid input. A typo such as `ture` or the common answer `yes` is therefore committed as `mergePlanSpec: false` without warning.
- repro_or_impact: Select `custom`, answer `yes` to `merge plan and spec? (true/false)`, and complete the remaining prompts with valid values; setup writes `phases.mergePlanSpec: false` and adds a separate `spec_review`, so the committed lifecycle does not reflect the user's choice. Validate the answer before coercion (or reprompt) and add a PTY test for the custom branch.

### Invalid custom-interview dials fail with no text diagnostic

- severity: medium
- confidence: high
- file: skills/sdlc/scripts/setup-sdlc.mjs
- line: 386-394, 424-428
- problem: Free-form custom answers such as `brainstorm.mode = banana` reach `inspectConfig`, which sets `report.error`, but the text renderer never emits `report.error`. The command exits 2 after the full interview while printing only the root/reference lines, hiding the first validation issue that caused refusal.
- repro_or_impact: In a TTY select `custom`, enter `banana` at `brainstorm mode`, accept valid values for every other dial, and confirm; no config is written and exit is 2, but stdout/stderr never names `lifecycle.gates.brainstorm.mode`. Render the error in text mode (or validate/reprompt each dial during the interview) and test invalid custom interactive shapes.
