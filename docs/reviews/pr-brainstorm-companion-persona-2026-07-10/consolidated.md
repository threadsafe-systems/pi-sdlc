# Consolidated PR review — brainstorm companion persona (PR #2)

- Target: `git diff 6d8eca3..56109f3`
- Panel: openai-codex/gpt-5.6-sol, zai/glm-5.2, moonshotai/kimi-k2.6
  (3 distinct vendors, meets `pr_review` min_panel=3; anthropic excluded as
  author)
- Orchestrating model: anthropic (session), also the author; adjudication
  reviewed by the project owner (final adjudicator).

## High / Medium (same defect, two severities — cross-model agreement)

**Graceful-fallback rule contradicted the Hooks section's blocking
semantics** (codex Sol: high; glm: medium). The new rule named "a worktree
tool a hook names" as an example that should degrade rather than block, but
the already-shipped Hooks section (PR #1) explicitly defines a missing `use:`
tool/skill on a hook as a **hook failure**, and a failed `before` hook
**blocks** the phase. Two directives in the same document told the agent to
do opposite things for the same situation.
→ **Incorporated.** Rewrote the rule to explicitly exclude hooks: "This rule
does not cover hooks. A `hooks` entry a repo has explicitly configured ... is
a deliberate, load-bearing contract, not an opportunistic enhancement ... A
missing `use:` tool/skill on a configured hook is a hook failure, per Hooks,
full stop." Removed the contradictory example.

## Low

**Rule claimed document-wide scope ("anywhere in this document") but was
nested as an H3 under `## Brainstorm`, so heading hierarchy implied
brainstorm-only scope** (glm).
→ **Incorporated.** Promoted to its own top-level `## Skills and tools are
enhancements, not dependencies` section, placed after `## Hooks` (where the
exclusion needs to live, adjacent to the contract it's carving out). The
Brainstorm section's pointer text updated to note the new location and the
hooks exclusion.

## Clean (both reviewers, independently)

- Map-mode body content unchanged (heading-only diff at that boundary); the
  two external `wayfinder-lite` references (`assets/agent-brief.md`,
  `assets/tracker-ops.md`) still resolve.
- Persona triggers are checkable, not vague adjectives (the specific hunt
  this project's panels have flagged before).
- No hard dependency introduced on `questions-helper` (still an example, with
  a stated fallback).
- Heading levels structurally valid.
- Anti-directiveness bullet consistent with the iron law's human-approval
  gate.
- kimi-k2.6: `VERIFIED: no high or medium findings` (did not catch the
  hooks contradiction — the two other vendors' agreement is the operative
  signal here).

## Stop condition

The one real defect (hooks-vs-fallback contradiction) is fixed with an
explicit carve-out, not just a reworded warning — re-reading the hooks
contract confirms `before=block` stands unconditionally for configured
hooks. The scope-vs-heading low is fixed by relocation. `npm test`: 33/33
after the fix. No high or medium finding survives adjudication.
