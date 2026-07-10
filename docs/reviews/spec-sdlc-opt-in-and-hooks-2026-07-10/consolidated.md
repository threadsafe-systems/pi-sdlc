# Consolidated spec review — sdlc opt-in + local workflow hooks

- Target: `docs/specs/2026-07-10-sdlc-opt-in-and-hooks.md` (v1) @ branch
  `feat/sdlc-opt-in-hooks`, 8c3c476 + working tree
- Panel: openai/gpt-5.2, deepseek/deepseek-v4-pro, zai-coding-cn/glm-5.2
  (3 vendors; ≥2 required; anthropic excluded as author vendor; gpt-5.2 passed
  PONG this round — its plan-panel drop was transient)
- Orchestrating model: anthropic (claude-opus-4-8 session) — also the spec
  author; adjudication reviewed by the project owner (final adjudicator)
- Per-model files: `gpt-5.2.md`, `deepseek-v4-pro.md`, `glm-5.2.md`; shared
  prompt: `prompt.md`
- Resolution: spec revised to v2 in place.

## High

**H1. `--hook-use` colon parse rule broken** (deepseek AND glm — cross-model
agreement; glm proved OH5 unsatisfiable under the stated rule since the `use`
token contains its own colon).
→ **Incorporated.** Grammar re-pinned: fields 1–2 = phase/timing; fields 3–4
rejoined = `use` (`<kind>:<name>`, must match the §1.1 pattern); `do` =
remainder after the 4th `:`. OH5 rewritten with exact input→output pairs,
including colons inside `do` and inside a `run` command, plus argv-order
stability.

**H2. Worktree neutrality violated by blessing `tool:worktree_session` in
normative examples and the scaffolder offer** (gpt-5.2 — caught the spec
contradicting its own plan's dependency-direction rule).
→ **Incorporated.** All normative examples now use the consumer-supplied
placeholder `tool:my_worktree_tool`; a header note pins "pi-sdlc ships NO
recommended worktree tool or skill"; the scaffolder interview now ASKS the
developer for their tool/skill name instead of offering a prewritten
mechanism. (The dogfood config of a repo that *chooses* worktree_session may
name it — that is precisely the intended dependency direction.)

## Medium

**M1. Script paths ambiguous (`scripts/…` vs actual `skills/sdlc/scripts/…`)**
(gpt-5.2). → **Incorporated**: all paths pinned to `skills/sdlc/scripts/`,
with the FS3 cwd requirement stated in the §2 procedure.

**M2. Multi-line `run`/`do` breaks the line-oriented announce audit**
(gpt-5.2). → **Incorporated**: `run` and `do` now `pattern: ^[^\r\n]+$`
(single-line, non-empty) in schema + validateConfig prose; OH1 gains the
multi-line mutation.

**M3. Repeated hook-flag ordering unspecified while list order is
semantic** (gpt-5.2). → **Incorporated**: append-in-argv-order pinned; OH5
asserts order stability.

**M4. Advisory "no announce" ambiguous vs plan wording** (gpt-5.2). →
**Incorporated**: advisory mode never uses an announce string (none exists)
and never claims "under law"; `advisory:`-prefixed phase markers explicitly
permitted; plan alignment stated.

**M5. `sdlc-status` missing the `.sh`→`.mjs` pattern** (deepseek). →
**Incorporated** (§3 header).

**M6. `hooks: {}` divergence between schema (`minProperties:1`) and the prose
validator rules; OH1 gap** (glm). → **Incorporated**: prose rule added; OH1
mutation added.

**M7. `run`-hook cwd undefined after a `before` hook moves the session root
into a worktree** (glm — the motivating scenario, no less). →
**Incorporated**: pinned to *the session's current working root at fire
time* (consumer root unless legitimately moved; a worktree is a checkout, so
repo-relative commands resolve). Chosen over glm's "always original root"
suggestion because post-implement `run` checks (builds, linters) must run
where the code is; recorded as a deliberate deviation from the proposed fix,
same defect resolved.

## Low (all fixed in v2)

- Dead `§2.1` reference (gpt-5.2 AND deepseek) → `(§2)`.
- FS5 "zero behaviour change" over-broad (deepseek) → qualified: unchanged
  for all configs valid today; hooks-configs becoming valid IS the additive
  FS1 change.
- OH2 missing the success path (deepseek) → added (strict mode returns config
  incl. hooks when manifest present).
- OH7 not grepping the Advisory-mode heading (glm) → `### Advisory mode`
  subsection required + grep added.
- README/NFR4 had no scenario (glm) → OH12 added (pointer present, stale
  no-manifest claim gone).

## Stop condition

No high or medium finding survives adjudication unaddressed. One deliberate
deviation from a proposed fix (M7 cwd rule) is recorded above with its
reason and flagged to the project owner. Panel clearances: all three models
cleared framework grounding (E) and honesty (G); deepseek cleared all seven
surfaces except the findings above.
