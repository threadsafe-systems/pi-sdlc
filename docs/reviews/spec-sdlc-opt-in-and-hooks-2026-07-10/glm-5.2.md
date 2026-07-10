### `--hook-use` colon-remainder parse rule contradicts the required `use` shape and defeats OH5

- severity: high
- confidence: high
- location: spec §5.1 flag table (`--hook-use` row) vs §1.1 `use` pattern + §8 OH5
- defect: The `--hook-use` parse rule says "`do` = remainder after 3rd `:`", but the `<use>` token the schema mandates (`^(skill|tool):[a-z][a-z0-9_-]*$`) always contains its own colon, so the flag string always has four colons before `do`. The stated rule therefore mis-splits every valid input.
- evidence: For OH5's exact input `implement:before:tool:worktree_session:enter the worktree`, colon positions are [9,16,21,38]. "Remainder after 3rd colon" yields `do = "worktree_session:enter the worktree"` and `use = "tool"`, which fails the §1.1 pattern `^(skill|tool):…` — so `validateConfig` rejects it and the written shape is never produced. OH5 asserts this input "produce exactly the §1.1 shapes", i.e. the scenario is unsatisfiable under the rule it also pins. This is a frozen-on-ship CLI surface (§3/§5.1; plan M3 deferred the full pin to the spec precisely because "specs pin surfaces").
- impact: An implementer coding to the literal rule ships a broken `--hook-use`; one who "guesses right" still diverges from the written contract. Either way OH5 cannot gate what it claims, and the flag grammar freezes wrong.
- fix: Replace the rule with the precise form: phase and timing are the first two colon fields; `use` consumes the next two colon fields (`<kind>:<name>`); `do` is the remainder after the 4th `:`. Restate OH5's input against that rule.

### Schema and hand-rolled `validateConfig` are required to be "identical", but the prose omits the top-level empty-`hooks` constraint and OH1 doesn't cover it

- severity: medium
- confidence: medium
- location: spec §1.1 (JSON Schema `hooks` `minProperties:1` vs the `validateConfig` prose paragraph) and §8 OH1
- defect: The JSON Schema rejects `hooks: {}` via top-level `minProperties:1`, but the §1.1 prose enumeration of the hand-rolled rules ("phase keys ∈ {…}; each phase object non-empty with only before/after non-empty arrays; each item …") never restates "the top-level `hooks` object must be non-empty". OH1's mutation list likewise omits empty-top-level-`hooks`.
- evidence: §1.1 schema fragment: `"hooks": { … "minProperties": 1, … }`. §1.1 validateConfig prose lists phase-object-non-empty and array-non-empty but not hooks-object-non-empty. OH1 enumerates: unknown phase key, unknown hook kind, empty `do`, both run+use, empty before array, empty phase object, bad use pattern — no `hooks: {}` case.
- impact: The spec's own invariant ("identical rules", verified by "rejected by BOTH") can silently diverge: `hooks: {}` is schema-invalid but a literal reading of the prose validator would accept it (no phase keys to iterate). The two-source-of-truth contract the spec leans on is under-specified exactly where it is hardest to notice.
- fix: Add "the top-level `hooks` object is non-empty" to the §1.1 validateConfig rule list and add `hooks: {}` to OH1's mutation set.

### `run`-hook working directory is unspecified once a `before` worktree hook moves the session root

- severity: medium
- confidence: medium
- location: spec §1.2 ("`run` items: … from the consumer root") vs §1.1/§6.4 worktree `use`/`do` hook (session working root moves into the worktree)
- defect: §1.2 fixes every `run` hook's execution directory as "the consumer root", but an `implement:before` `use` hook (the headline example) moves the session's working root into a worktree. The spec never says whether a later `run` hook (e.g. an `implement:after` or `*:after` build/notify command) runs from the original consumer root or the now-moved worktree root.
- evidence: §1.2 "`run` items: the agent executes the command verbatim from the consumer root". §1.1 example `"do": "Create AND enter a worktree … the session's working root moves into it"`. §6.4 warning reiterates the root-move. No statement reconciling the two for `run` hooks that fire after a root-move.
- impact: A non-notify `run` hook (e.g. `make build`, a linter over the tree) executes in an undefined directory depending on whether a worktree `before` hook fired. Consumers and the agent must guess; the contract is not buildable as written for the motivating scenario.
- fix: Pin one rule, e.g. "`run` hooks always execute from the original consumer root (the resolved FS3 root), independent of any worktree the session has entered", and reflect it in the SKILL §6.2 text.

### OH7 does not verify the plan-required "Advisory mode" heading; §6 item 1 is ambiguous about one section vs two

- severity: low
- confidence: medium
- location: spec §6 item 1 and §8 OH7, vs plan Definition of done ("a section titled 'Advisory mode'")
- defect: §6 item 1 asks for a single `## Opt-in and advisory mode` section that also contains "the literal heading text `Advisory mode`", but OH7 only greps `^## Opt-in and advisory mode`. The plan's distinct "section titled 'Advisory mode'" requirement is therefore not gated.
- evidence: Plan DoD: "an opt-in gate section, a section titled 'Advisory mode'". OH7 greps: `^## Opt-in and advisory mode`, `^## Hooks (local workflow)`, `\[sdlc hook\]`, red-flag lines, create-then-enter warning, and the Implement-row phrase — no grep for a standalone `Advisory mode` heading.
- impact: An implementer can satisfy OH7 with only the combined H2 and omit the capitalized `Advisory mode` heading the plan called for; the scenario under-verifies the DoD.
- fix: Either add a `^#{2,3} Advisory mode$` grep to OH7, or delete the "literal heading text Advisory mode" clause and explicitly restate the plan's advisory heading requirement as a distinct grep.

### NFR4 / "README updated" DoD has no falsifiable scenario

- severity: low
- confidence: medium
- location: spec §7 NFR4 and plan Definition of done, vs §8 scenarios
- defect: NFR4 ("docs stay consistent — README opt-in story matches SKILL.md §2") and the plan DoD item "README updated" have no corresponding verification scenario in §8; nothing in OH1–OH11 touches the README.
- evidence: §7 NFR4 stated as a requirement; §8 OH1–OH11 — none reads or greps `README.md`. The skill's own red-flags list states "A spec outcome that no scenario can falsify [is a red flag]."
- impact: README drift (e.g. a stale "runs with defaults in any repo" sentence contradicting the new refusal policy, or a missing `/setup-sdlc` pointer) cannot be caught by the spec's verification suite.
- fix: Add a minimal OH: grep `README.md` for the opt-in signal (e.g. `sdlc.config.json`/`/setup-sdlc`/`advisory`) and assert it does not assert the old "runs with defaults in any repo" behaviour.

CLEAR: A — the `hooks` shape is additive and complete (schema + allowed-set + example + validator all enumerated); no frozen field is missing or over-committed relative to the plan.
CLEAR: E — pi-framework claims verified: `pi.prompts` package-manifest mechanism (packages.md "Creating a Pi Package"; prompt-templates.md "Locations"), filename→`/command` mapping, and FS3 `resolveRoot` no-manifest→git-toplevel fallback (lib.mjs:51-65) all behave as the spec describes.
CLEAR: G — no over-claiming: §1.4 and OH8 explicitly downgrade hook/workflow enforcement to "documentation presence" and restate "there is no mechanical runner (locked by H2)"; trust-boundary language (§1.3) is accurate.
