# Consolidated plan review — sdlc opt-in + local workflow hooks

- Target: `docs/plans/2026-07-10-sdlc-opt-in-and-hooks.md` @ db07616 (working tree)
- Panel: deepseek/deepseek-v4-pro, moonshotai/kimi-k2.6 (2 vendors; ≥2 required;
  anthropic excluded as author vendor; openai/gpt-5.2 dropped: PONG failed)
- Orchestrating model: anthropic (claude-opus-4-8 session) — also the plan author;
  adjudication below reviewed by the project owner (final adjudicator)
- Per-model files: `deepseek-v4-pro.md`, `kimi-k2.6.md`; shared prompt: `prompt.md`

## High

**H1. workflow.md "binding local law" is unfalsifiable** (BOTH models — cross-model
agreement). "Local wins for process, global wins for gates" has no operational
definition; no verification path exists.
→ **Incorporated.** Plan now (a) operationally defines *gates* as the enumerated
gate column of the phase table plus the iron-law skip rules (global always wins
there) and *process* as everything else; (b) states plainly that workflow.md is
prose-enforced by the agent, like the rest of the skill; (c) requires the spec to
make loading falsifiable: the announce output must enumerate the workflow rules
loaded.

**H2. Hook execution is an honor system; `before=block` has no mechanism**
(deepseek).
→ **Partially incorporated; remainder dismissed with reason.** Incorporated: the
plan now states the enforcement model explicitly (agent-prose + announce-on-fire
audit lines; spec scenario = the session transcript/announce log names each hook
as it fires). Dismissed: the proposed script-level hook runner — the entire sdlc
(iron law included) is prose law executed by the agent and gated by humans + CI
artifact checks; a hook engine is already explicitly out of scope and would not
raise the enforcement floor above the rest of the skill.

**H3. `run` hooks are arbitrary command execution from a committed config**
(kimi).
→ **Incorporated.** New Risks section: run hooks execute with the agent's
privileges; mitigations pinned — the agent echoes the exact command and phase
before executing, the scaffolder warns when writing run hooks, and the trust
boundary is pi's existing project-trust model (same boundary as `.pi/prompts`).

## Medium

**M1. JSON Schema is `additionalProperties: false`; adding `hooks` touches the
schema file, not just lib.mjs** (deepseek). → **Incorporated** (explicit bullet:
schema property + example + lib.mjs allowed-set + tests).

**M2. "Six phase names" ambiguous vs the four panel phases in `lib.mjs:9`**
(deepseek). → **Incorporated.** Hook keys pinned to the lifecycle vocabulary:
`brainstorm, plan, spec, build, implement, pr` + `*` — distinct from panel
PHASES.

**M3. `/setup-sdlc` CLI surface unpinned** (deepseek). → **Partially
incorporated.** Plan now carries a flag sketch and exit-code convention
(0 written / 1 declined / 2 error); the full flag table remains spec work, which
is the correct level of detail for a plan. Dismissal of "pin fully in plan":
plans pin shape, specs pin surfaces (per this project's own phase definitions).

**M4. "No-manifest refusal" DoD not honestly coverable by `npm test`**
(deepseek). → **Incorporated.** DoD split: (a) `readConfig` strict mode
(rejects missing manifest when asked) — script-testable; (b) the announce-time
refusal/advisory flow — SKILL prose, verified at spec/PR panels, not claimed as
a unit test.

**M5. One ADR for two surfaces violates "one ADR per frozen surface"** (kimi).
→ **Incorporated.** Two ADRs: opt-in semantics; hooks surface.

**M6. No-manifest change mislabelled FS3** (kimi — correct: ADR 0003 governs
root *resolution*; defaults live in `readConfig`, lib.mjs:79). →
**Incorporated.** Relabelled as a skill-policy + `readConfig` change; FS3
`resolveRoot` explicitly untouched.

**M7. DoD wouldn't catch SKILL.md still prescribing worktrees** (kimi). →
**Incorporated.** Greppable DoD item: the Implement row no longer contains the
phrase "in a worktree" as prescription.

**M8. Prompt-template packaging mechanism unverified** (kimi). → **Resolved and
incorporated.** Verified against pi docs: packages ship templates via
`pi.prompts` in package.json or a `prompts/` dir (docs/packages.md:126,163;
docs/prompt-templates.md "Locations"). Plan pins the field and notes the
collision hazard with the existing `skills/sdlc/prompts/` reviewer prompts
(template goes in a separate top-level dir).

**M9. Bootstrap ordering: refusal behaviour could break this repo before the
dogfood config lands** (kimi). → **Incorporated.** Ordering note: dogfood
config (already in working tree) commits with or before the refusal change;
tests use fixture configs.

## Low (recorded, not blocking; cheap wording fixes applied)

- "Via the scaffolder" unfalsifiable in DoD (deepseek) → reworded; separate
  testable item: scaffolder exercised against a fresh temp repo.
- `run` hooks called "deterministic" (kimi) → reworded to "same command string;
  environment-dependent result".
- `*` vs named-phase ordering undefined (kimi) → pinned: before-hooks `*` then
  phase-specific; after-hooks phase-specific then `*`.
- DoD "carries" wording subjective (kimi) → replaced with greppable
  requirements.

## Stop condition

No high or medium finding survives adjudication unaddressed. Two partial
dismissals (H2 runner, M3 full CLI pin) carry recorded reasons and are flagged
to the project owner for final adjudication.
