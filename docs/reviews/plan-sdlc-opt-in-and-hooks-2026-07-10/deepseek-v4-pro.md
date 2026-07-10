### workflow.md has no falsifiable verification path — outcome 3 is unverifiable

- severity: high
- confidence: high
- location: Objectives (3), Scope In (`.pi/sdlc/workflow.md`), DoD
- defect: The plan defines `workflow.md` as "binding local law" with a conflict-resolution rule ("local wins for *process*, global wins for *gates*") that has no operational definition. Neither "process" nor "gates" is defined with enough precision for an agent or test to mechanically adjudicate which rules fall in which category. The plan further states it has "no tooling beyond 'load and obey' (agent-interpreted)" — meaning there is zero automated verification that the workflow is actually followed.
- evidence: Plan lines 27–29 ("Prose workflow layer. An optional `.pi/sdlc/workflow.md` carries local ways-of-working that don't decompose into hooks. Loaded at announce time and treated as binding local law: on conflict, local wins for *process*, global wins for *gates* (locals may add gates, never remove iron-law ones)."); Scope In line 66 ("no tooling beyond 'load and obey' (agent-interpreted)").
- impact: A spec cannot write a falsifiable scenario for "workflow.md rules are obeyed" because (a) rules are unstructured prose, (b) the process/gate distinction has no mechanical test, and (c) no CI or script checks adherence. Outcome 3 is a wish, not a verifiable deliverable.
- fix: Either (a) downgrade `workflow.md` from "binding local law" to "advisory local guidance" (removing the unverifiable conflict-resolution claim), or (b) move it to Out scope for this plan and spec it properly with a schema and validation in a follow-up.

### Hook execution has no enforcement mechanism — behavior is pure agent prose

- severity: high
- confidence: high
- location: Objectives (2), Scope In, DoD
- defect: The plan puts hook execution discipline entirely in SKILL.md prose ("announce each hook as it fires," "before=block, after=warn"). No script runs hooks, no CI validates they fired, and no audit trail records them. The DoD item "SKILL.md carries: ... hook discipline" only verifies that the *text exists* in SKILL.md, not that hooks actually execute. An agent can silently skip every hook and no test, script, or CI check can catch it.
- evidence: Plan lines 65–66 ("no tooling beyond 'load and obey' (agent-interpreted)"); Out line 80 ("CI enforcement that hooks fired (hooks are session behaviour, not artifacts)"); DoD line 91–93 ("SKILL.md carries: opt-in gate at announce, advisory-mode wording, hook discipline (before=block, after=warn, announce on fire)").
- impact: The entire hook system is an honor system. The `before=block` semantics are meaningless if no mechanism prevents the agent from proceeding — the agent must voluntarily choose to block itself. This is indistinguishable from no hooks at all from a verification standpoint.
- fix: Either (a) add a script-level hook runner that `ensure-panel-agent.mjs` or a new script invokes, returning a non-zero exit to actually block, or (b) acknowledge in the plan that hooks are advisory session guidance with no mechanical enforcement, and adjust the DoD and objectives accordingly.

### `additionalProperties: false` in FS1 schema — adding `hooks` is not a trivial additive change

- severity: medium
- confidence: high
- location: Scope In line 60 ("sdlc.config.json schema: add optional `hooks` object ... Additive within schemaVersion 1 (FS1-safe)")
- defect: The current JSON Schema at `skills/sdlc/schema/sdlc.config.schema.json:7` declares `"additionalProperties": false`. Adding a new top-level key `hooks` requires either removing that constraint globally or explicitly adding `hooks` as a schema property. The plan mentions updating the `allowed` Set in `validateConfig` (lib.mjs:101) but never mentions the JSON Schema file that consumers use to validate their configs. This is a meaningful schema change the plan glosses over.
- evidence: `skills/sdlc/schema/sdlc.config.schema.json:7` — `"additionalProperties": false` at the top-level object; `skills/sdlc/scripts/lib.mjs:101` — `const allowed = new Set(["schemaVersion", "prefix", "labelPrefix", "announce", "paths", "tracker"]);`
- impact: If the plan's implementer adds `hooks` to `validateConfig`'s `allowed` set but forgets the JSON Schema file, consumers who validate their config against the published schema will get validation failures for a valid config. The FS1 ADR explicitly says `additionalProperties: false` — this is a frozen decision the plan must acknowledge.
- fix: Add an explicit bullet in Scope In stating that the schema file must add `hooks` as an optional property alongside relaxing or adjusting `additionalProperties`.

### "Six phase names" is ambiguous — lifecycle phases vs panel phases are different vocabularies

- severity: medium
- confidence: high
- location: Scope In line 60 ("per-phase keys from the six phase names + `*`"), Objectives (2)
- defect: The plan says hooks key off "the six phase names" but never enumerates them. SKILL.md defines six lifecycle phases (brainstorm, plan, spec, build, implement, PR), while `lib.mjs` defines four panel phases (`plan_review`, `spec_review`, `pr_review`, `task_validate`). These are different sets with different naming conventions (space-separated vs underscore). The plan must choose and pin one vocabulary.
- evidence: `skills/sdlc/SKILL.md` phase table rows: brainstorm, plan, spec, build, implement, PR. `skills/sdlc/scripts/lib.mjs:9` — `export const PHASES = ["plan_review", "spec_review", "pr_review", "task_validate"];`
- impact: An implementer could use lifecycle names as hook keys (natural reading of "six phases") while the JSON Schema for hooks uses underscore panel names, or vice versa. This ambiguity will cause implementation drift and consumer confusion — the spec cannot pin the hook schema without resolving this.
- fix: Explicitly enumerate the valid hook phase keys in the plan: decide whether they are the six lifecycle phase names (brainstorm, plan, spec, build, implement, PR) or the four panel phases, and name them.

### `/setup-sdlc` CLI surface is not pinned — contradicts the plan's own mandate

- severity: medium
- confidence: high
- location: Context for the next agent line 119 ("Spec must pin: ... setup-sdlc CLI surface")
- defect: The plan's "Context for the next agent" says the spec must pin the setup-sdlc CLI surface, but the plan itself does not do this. It only lists interview *topics* ("prefix/labels, tracker y/n, worktree preference, notifications") without naming flags, their types, defaults, or the script's exit codes.
- evidence: Plan lines 35–38 ("interviews the developer — prefix/labels, tracker y/n, worktree preference, notifications — and writes `sdlc.config.json`"); line 119 ("setup-sdlc CLI surface").
- impact: The spec author will need to invent the CLI from scratch, increasing the risk of a design mismatch with the plan's intent. The scaffolded config shape depends on the CLI, so an unpinned CLI means an unpinned output contract.
- fix: Add at minimum: the script name, a flag table (each flag name, whether it takes a value, default when absent, and what config key it maps to), and exit code conventions (0 = written, 1 = declined, 2 = error).

### No-manifest refusal has no script-level test — DoD claim is misleading

- severity: medium
- confidence: high
- location: DoD line 97–98 ("Tests green (npm test), including new cases for hooks validation and no-manifest refusal path in whatever script reads the config")
- defect: The "no-manifest refusal path" is agent prose behavior in SKILL.md — the agent decides whether to refuse at announce time. It is not a script behavior. `readConfig()` in `lib.mjs:80-82` currently returns silent defaults when no manifest exists. Changing that behavior to a refusal would break `ensure-panel-agent.mjs` if it's not adapted. The DoD claims `npm test` can cover this, but `npm test` runs `node --test` which can only test scripts, not agent prose behavior.
- evidence: `skills/sdlc/scripts/lib.mjs:80-82` — `if (!existsSync(p)) { return { ...CONFIG_DEFAULTS, paths: { ...CONFIG_DEFAULTS.paths }, tracker: undefined }; }`; `test/extraction.test.js` — no test currently exercises no-manifest config behavior.
- impact: The DoD item cannot be honestly satisfied. Either the test must be dropped from DoD, or `readConfig()` must actually change behavior (throw/fail when no manifest), and the test must cover that new code path — but that only tests `readConfig`, not the full refusal/advisory flow in SKILL.md.
- fix: Split the DoD item: (a) `readConfig` gains a mode that rejects missing manifests (testable), and (b) SKILL.md's announce-time refusal/advisory flow is separately reviewed as prose, not claimed as a testable item.

### `/setup-sdlc` template registration mechanism in `package.json` is unspecified

- severity: low
- confidence: medium
- location: Scope In line 70 ("the pi prompt template wiring in `package.json`")
- defect: The plan says the `/setup-sdlc` template is "wiring in `package.json`" but never specifies what field or mechanism. The current `package.json` has no template/prompt/command registration fields (`pi.skills` exists, but that's for skill directory discovery, not prompt templates). Without knowing how pi discovers prompt templates, the "wiring" action is undefined.
- evidence: `package.json` — no existing template, prompt, or command registration field beyond `pi.skills`.
- impact: The implementer must either invent a convention or leave the template undiscoverable except by direct file path — making `/setup-sdlc` not actually invokable as a slash command.
- fix: Either (a) pin the `package.json` field (e.g., `pi.templates` or `pi.commands`) after confirming pi's actual template-discovery mechanism, or (b) drop the `/setup-sdlc` claim and ship it as a documented invocation path (`scripts/setup-sdlc.sh` only).

### DoD "dogfood config committed via the scaffolder" contains an unfalsifiable sub-clause

- severity: low
- confidence: high
- location: DoD line 99 ("This repo itself opted in via the scaffolder (dogfood config committed)")
- defect: "Via the scaffolder" is not verifiable after the fact — you cannot inspect a committed config file and determine whether it was generated by `setup-sdlc.sh` or hand-authored. The verifiable portion is "dogfood config committed," but the plan also stakes that on a specific tool path.
- evidence: `.pi/sdlc/sdlc.config.json` already exists in the working tree (pre-scaffolder); no provenance metadata exists in the config schema to distinguish tool-generated from hand-authored.
- impact: A reviewer cannot confirm this DoD item was satisfied without witnessing the scaffolder run — it reduces to trust.
- fix: Change the DoD item to "This repo itself has a committed `.pi/sdlc/sdlc.config.json` (dogfood config committed)" and separately add "the scaffolder was exercised at least once against a fresh temp repo" as a separate testable item.

---

CLEAR: A — Most DoD items are falsifiable except the two flagged above (dogfood scaffolder claim, no-manifest testability). The schema validation, SKILL.md content, ADR, and test-green items are all checkable.

CLEAR: B — Outcomes 1, 2, 4, and 5 have plausible verification paths. Outcome 3 (workflow.md) is the exception flagged above.

CLEAR: C — In/out scope is coherent. The out-of-scope items (no hard worktree dep, no hook engine, no CI enforcement, no deployment phases, no migration tooling) are consistent with the in-scope items. The scope is one spec's worth of work.

CLEAR: D — The plan correctly declares the irreversible track and explicitly flags FS1 and FS3 amendment. It does not silently reopen any locked decision.

CLEAR: F — Track is correctly declared as irreversible. Adding `hooks` to the config schema (FS1) and changing no-manifest semantics (FS3) are both frozen-surface changes requiring the irreversible track. The plan's own declaration is accurate.
