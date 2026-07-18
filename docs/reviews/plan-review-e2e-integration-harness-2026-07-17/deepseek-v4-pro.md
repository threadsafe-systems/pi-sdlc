Now I have all the evidence I need. Let me write the findings.

---

### Finding 1: DoD determinism "identical verdicts" is unfalsifiable — agent loop is not deterministic even with a scripted provider

- **severity:** high
- **confidence:** high
- **location:** Definition of done, item 2 ("Determinism: two consecutive full runs produce identical verdicts")
- **defect:** The DoD requires "two consecutive full runs produce identical verdicts (asserted in CI by running the suite twice in the e2e job)." A headless `pi -p` agent run invokes a real model-calling loop: pi formats requests, the puppet server matches triggers and returns canned responses, pi executes tool calls, and tool results (with real timestamps, process PIDs, filesystem state) enter the next turn's context. Two consecutive runs on the same sandbox are NOT identical — at minimum, session files contain different UUIDs/timestamps, and the second run will see leftover state from the first (scratch dirs already exist, session files already present). The plan itself warns about "puppet brittleness" and "per-step timeouts" as mitigations for non-determinism. Claiming "identical verdicts" as a DoD gate while simultaneously warning the mechanism is brittle is contradictory. A double-run CI assertion that fails on timestamp diffs is not a meaningful quality gate — it's a flake factory.
- **evidence:**
  - Plan text: "Determinism: two consecutive full runs produce identical verdicts (asserted in CI by running the suite twice in the e2e job)."
  - Plan text (Risks): "Puppet brittleness: SKILL rewording can silently strand a trigger regex → scenario times out. Mitigation: minimal triggers (decision 1), a per-step timeout that fails loudly with the unmatched transcript, and the determinism double-run."
  - sessions.md: session files contain timestamps and UUIDs; every run produces a new session file with a unique path (`~/.pi/agent/sessions/--<path>--/<timestamp>_<uuid>.jsonl`)
- **impact:** The double-run will either pass trivially (asserting only binary pass/fail on deterministic fixtures, not verifying real determinism) or will flake on ambient variance (timestamps, UUIDs, filesystem ordering). Either way, the DoD item cannot serve as a meaningful gate — it either over-claims or under-delivers.
- **fix:** Replace "identical verdicts" with "the same boolean pass/fail outcome per scenario across N consecutive runs" and also require each run to start from a clean sandbox (not the same sandbox directory) so the second run is independent.

---

### Finding 2: Puppet provider extension discovery path is unspecified — the plan does not state how pi loads the extension that registers the `puppet` provider

- **severity:** high
- **confidence:** high
- **location:** Scope in, item 3 ("L2 puppet provider: a pi extension registering provider `puppet`")
- **defect:** The plan says the harness includes "a pi extension registering provider `puppet` pointing at a local `openai-completions` server" but never states how pi discovers this extension. Pi loads extensions from: `extensions` arrays in settings, package manifests, convention directories (`extensions/`), or the `--extension`/`-e` CLI flag. The harness lives at `test/e2e/` — not in any of pi's standard discovery paths. Without specifying the loading mechanism (is it `pi -e test/e2e/puppet-extension.mjs -p "..."`? Or installed as part of the pi-sdlc package's `pi.extensions` manifest?), the harness cannot function. This is not just a missing detail — it's the entire integration seam between the harness and pi.
- **evidence:**
  - Plan text: "a pi extension registering provider `puppet` pointing at a local `openai-completions` server (~one file)"
  - packages.md: extensions are loaded from `extensions/` dirs, `pi.extensions` in package.json, or `--extension`/`-e` flag. None of these are specified for the puppet extension.
  - The pi-sdlc `package.json` has `"pi": { "skills": ["./skills"], "prompts": ["./templates"] }` — no `extensions` key, and adding one would load the puppet extension in production.
- **impact:** Without specifying the loading path, T3 (puppet provider) cannot be implemented. If `-e` is used per-invocation, the command construction must be specified. If the extension is added to the pi-sdlc package manifest, it would be discovered in production installs (security concern). The implementer will have to design this seam from scratch.
- **fix:** Decide and document the loading mechanism: (a) `pi -e <path-to-puppet-extension>` flag per invocation, (b) a dedicated fixture directory added to the scratch project's `.pi/settings.json` `extensions` array, or (c) the extension baked into the pi-sdlc package manifest with a `disable-model-invocation` guard. Pick one and record it in scope item 3.

---

### Finding 3: Negative assertion ("no announce") incompatible with described puppet scenario format

- **severity:** high
- **confidence:** high
- **location:** Scope items 1 + 3 + 4; interaction between "ordered steps: trigger regex → canned assistant turn/tool call" (item 3) and scenario A's "unadopted repo → no announce" (item 4)
- **defect:** The puppet scenario format is described as "ordered steps: trigger regex → canned assistant turn/tool call" — a forward-only mechanism. But scenario A asserts "no announce" (the agent must NOT emit the announce string when the repo is unadopted), and scenario D asserts `task_validate` refusal, both of which require verifying the *absence* of specific text across the full agent output. The puppet trigger-matching loop cannot assert absence — it responds only when a trigger matches. Post-hoc transcript scanning (scope item 1 mentions "transcript/session-file readers") could verify absence, but the plan never connects these two mechanisms: it doesn't state whether the scenario format has assertion steps that run after the pi process exits, what format they take, or how they interact with the puppet server's lifecycle. The harness core scope item mentions "assertion helpers" but the scenario format description doesn't reference them.
- **evidence:**
  - Plan, scope item 3: "a scenario scripting format (ordered steps: trigger regex → canned assistant turn/tool call)"
  - Plan, scope item 4: "A: unadopted repo → no announce; setup/advisory offered."
  - Plan, scope item 1: "transcript/session-file readers, assertion helpers, scenario runner" — transcript readers are mentioned but never wired into the scenario format.
- **impact:** Scenario A cannot be implemented as an L2 (puppet-driven) scenario with the described format alone. The implementer must invent the post-hoc assertion mechanism from scratch with zero guidance from the plan, risking incompatible designs between scenarios. If the implementer interprets this as "the puppet just never fires because no announce text matches," the scenario silently passes without verifying the agent actually behaved correctly.
- **fix:** Extend the scenario format description to include a second assertion phase: per-step assertions (must-match/must-not-match regex over the full transcript up to that point, or over the session JSONL) that run after the pi process exits, not inside the puppet server loop.

---

### Finding 4: `-e` (ephemeral) and `-l` (project-scoped) are mutually exclusive install modes, conflated as complementary

- **severity:** medium
- **confidence:** high
- **location:** "Brainstorm" preamble paragraph ("pi install /absolute/path (+ `-e` ephemeral, `-l` project scope)")
- **defect:** The plan's Brainstorm grounding says `pi install /absolute/path` works with "(+ `-e` ephemeral, `-l` project scope)." These are mutually exclusive modes: `-e` (`--extension`) installs to a temp directory for ONE run only and does NOT persist; `-l` writes to `.pi/settings.json` and persists across runs. The harness needs the pi-sdlc package installed persistently (L1 scripts invoke multiple times; L2 runs pi with the skill loaded). Using `-e` means the install evaporates after the first `pi` invocation; using `-l` without `-e` is correct for the harness. Presenting them as complementary in a `(+)` parenthetical suggests they can be combined, which they cannot — `-e` overrides/conflicts with persistent install semantics.
- **evidence:**
  - packages.md: "To try a package without installing it, use `--extension` or `-e`. This installs to a temporary directory for the current run only:" — `-e` is explicitly for "the current run only."
  - packages.md: "By default, `install` and `remove` write to user settings … Use `-l` to write to project settings (`.pi/settings.json`) instead." — `-l` is a persistence switch, not a complement to `-e`.
  - Plan preamble: "pi install /absolute/path (+ `-e` ephemeral, `-l` project scope) installs a local package"
- **impact:** If the implementer reads this as "use both flags" they'll encounter a pi CLI error or undefined behaviour. If they pick `-e`, the install won't survive across pi invocations. The correct path (`pi install /absolute/path -l`) is only one of the two mentioned modes.
- **fix:** Replace the parenthetical with: "`pi install /absolute/path -l` (project-scoped install to `.pi/settings.json`; the package persists across invocations)."

---

### Finding 5: Credential-guard denial list is unspecified — the env-var check will be incomplete

- **severity:** medium
- **confidence:** high
- **location:** Scope in item 1 ("Mechanical guarantee: the harness asserts the env contains no real credential vars before running") + DoD item 3
- **defect:** DoD item 3 requires "the harness refuses to start if real credential env vars are present in its sandbox env" and scope item 1 adds "no real keys present anywhere in the env." Nowhere does the plan specify which env vars are checked. Common AI provider credential vars include `ANTHROPIC_API_KEY`, `OPENAI_API_KEY`, `GOOGLE_API_KEY`, `GITHUB_TOKEN`, `GH_TOKEN`, `COHERE_API_KEY`, `MISTRAL_API_KEY`, `DEEPSEEK_API_KEY`, and many others. CI systems inject their own secrets. Without an explicit, extensible list, the guard is a false sense of security — it will check whatever the implementer happens to think of, and miss the rest.
- **evidence:**
  - Plan DoD item 3: "Isolation: the harness refuses to start if real credential env vars are present in its sandbox env"
  - Plan scope item 1: "the harness asserts the env contains no real credential vars before running, and `gh` is absent/stubbed"
  - custom-provider.md: providers use `$ENV_VAR` references in `apiKey` fields — any env var could be a credential
- **impact:** The harness could run with a real `GITHUB_TOKEN` leaked from CI, the guard check won't catch it because it wasn't in the ad-hoc list, and the sandbox isolation claim is breached silently.
- **fix:** Specify the denial list explicitly in the plan: a hardcoded set of known credential var names (at minimum `ANTHROPIC_API_KEY`, `OPENAI_API_KEY`, `GOOGLE_API_KEY`, `GITHUB_TOKEN`, `GH_TOKEN`), plus a glob pattern (`*_API_KEY`, `*_TOKEN`, `*_SECRET`) as a secondary catch-all, with an explicit escape hatch (`PI_E2E_ALLOW_*`) for future vars the implementer can't predict.

---

### Finding 6: 3-minute CI budget for two consecutive pi-agent-driven runs is unvalidated and likely unrealistic

- **severity:** medium
- **confidence:** medium
- **location:** Scope in item 5 ("runtime budget ≤ ~3 min") against DoD item 2 (two consecutive runs)
- **defect:** The CI budget is ≤ ~3 min for the full e2e job, which must include two complete runs (DoD determinism check). Each run includes: sandbox construction (~10-20s for temp HOME, npm install of pi-sdlc, settings/auth fabrication), L1 suite (multiple `pi list` calls, script invocations through installed paths, sdlc-status checks — each `pi list` or script invocation is a new process startup), puppet server startup + all 5 L2 scenarios (each a separate `pi -p` invocation with its own agent loop — model-request formatting, puppet HTTP round-trip, tool execution, multiple turns per scenario). `pi` process startup alone takes 1-3 seconds on a warm Node runtime. Two full runs at ~90s each is the best case, leaving zero margin for CI variance. The plan does not cite any benchmarks or a verification spike.
- **evidence:**
  - Plan scope item 5: "runtime budget ≤ ~3 min"
  - Plan DoD item 2: "two consecutive full runs produce identical verdicts (asserted in CI by running the suite twice in the e2e job)"
  - Plan risks section acknowledges "CI runtime creep" but mitigation is "scenarios share one sandbox build where isolation allows" — this saves seconds on sandbox construction, not on pi agent loop runtime.
- **impact:** The job will either blow the 3-min budget (becoming a noisy CI failure) or the scenarios will be cut down to fit (reducing coverage). A budget set before any implementation exists cannot be a meaningful DoD gate — it's a guess.
- **fix:** Either (a) drop the 3-min target from the DoD and replace it with "measure after T4; set a concrete budget in a follow-up commit," or (b) add a T0 verification spike that runs a skeleton harness (one L1, one L2 scenario) against the pinned pi version and records the baseline.

---

### Finding 7: Scenario B — testing `design: human` refusal via puppet requires the agent to call `resolve-panel.sh`, but the scenario description doesn't name this tool call

- **severity:** low
- **confidence:** medium
- **location:** Scope item 4, scenario B ("solo vs full preset → design-gate delta")
- **defect:** Scenario B says "`resolve-panel plan_review` refused under solo's `design: human`; attempted under full." For the agent to "attempt" or observe "refused", it must (a) know to run `resolve-panel.sh plan_review` per the SKILL.md prose, (b) actually call `bash` with that command, and (c) process the exit code/stdout. The plan's puppet scenario format (trigger → canned response) can script this: the canned response would include a `bash` tool call to run resolve-panel, pi executes it, the tool result returns, the next trigger fires. But the plan never states that the scenario scripting format supports multi-turn tool-call loops, and the implementer needs to know the exact tool-call JSON shape to script. The plan doesn't verify that the SKILL.md's panel dispatch instructions are parseable enough for the agent to reach the resolve-panel step under the puppet.
- **evidence:**
  - Plan scope item 4, scenario B: "solo vs full preset → design-gate delta (`resolve-panel plan_review` refused under solo's `design: human`; attempted under full)"
  - Plan scope item 3: "a scenario scripting format (ordered steps: trigger regex → canned assistant turn/tool call)"
  - SKILL.md line ~260: the panel instructions say `scripts/resolve-panel.sh <plan_review|spec_review|pr_review|task_validate> --author <provider/model>` — the agent must parse this prose to know what to run.
- **impact:** Low — this can be resolved during implementation by reading the SKILL.md and scripting the expected tool call. But the plan provides no guidance on how many turns scenario B will need or what the tool-call JSON shape looks like.
- **fix:** Add a note to scenario B: "This scenario will require a multi-turn puppet script: trigger on the agent's expressed intent to check the design gate, respond with a `bash` tool call to `resolve-panel.sh plan_review --author <fixture-author>`, then trigger on the tool-result output to verify refusal/acceptance."

---

### CLEAR: A — DoD items 1, 4, 5, 6, 7 are individually falsifiable (each names a measurable binary outcome).

### CLEAR: B — Every stated outcome has a plausible verification path; the claim ladder explicitly bounds what each layer proves.

### CLEAR: C — Scope in/out is coherent; the L1/L2/L3 split cleanly separates concerns and the out-of-scope list is explicit and non-contradictory.

### CLEAR: D — No locked decisions contradicted; the plan correctly sequences after PR #92 and claims reversible track consistent with the iron law.

### CLEAR: E — Headless project-trust risk is correctly flagged for T1 spike; pi API drift risk is acknowledged with pinned-version mitigation.

### CLEAR: F — Track classification is correct: test tooling with no frozen surface, no schema, no consumer-visible behaviour. The new `pi` devDependency is a dev-time-only pin.

---

Now let me write this to the output file: