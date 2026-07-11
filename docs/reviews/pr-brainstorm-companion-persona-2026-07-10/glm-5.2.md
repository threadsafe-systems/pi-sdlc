### Graceful-fallback rule contradicts the Hooks section's blocking semantics

- severity: medium
- confidence: high
- file: skills/sdlc/SKILL.md
- line: 115-118 (conflicts with 327-328 and 334)
- problem: The new rule states that "Any skill or tool named anywhere in this document (a questions-helper plugin, web research, codebase exploration, **a worktree tool a hook names**, anything else) is an enhancement ... never a hard dependency the phase blocks on. When it's missing, degrade to the plain fallback ... rather than stopping or refusing to proceed." But the Hooks section defines the opposite for `use` hooks: a `tool:<name>` hook with a missing tool = "hook failure" (line 327), a `skill:<name>` hook with a missing skill = "hook failure" (line 328), and "A failed or skipped `before` hook **blocks** the phase" (line 334). The new rule explicitly sweeps hook-named tools into "never blocks / degrade instead of stop," directly conflicting with the hooks' blocking contract in the same binding document.
- repro_or_impact: A repo with a `before` hook `{ "use": "tool:<someTool>", "do": "..." }` whose tool is absent now has two contradictory directives: hooks say block-and-retry; the new rule says degrade-to-fallback-and-continue. An agent that follows the more permissive new rule would enter the phase instead of blocking, weakening a gate — itself a listed "red flag" in this file (advancing past a blocking condition). Fix by narrowing the rule's scope to exclude `use:` hooks, e.g. "tools the *skill prose* reaches for (research, codebase exploration, a questions-helper), not tools a repo's configured hooks bind on — those keep their hook-failure semantics below."

### Document-general fallback rule is nested as a Brainstorm-only subsection

- severity: low
- confidence: medium
- file: skills/sdlc/SKILL.md
- line: 113-124
- problem: The rule claims document-wide scope ("Any skill or tool named **anywhere in this document**") and the plan states it should be "general ... not just for brainstorm." But it is placed as an H3 (`### Skills and tools are enhancements, not dependencies`) under `## Brainstorm`, so the heading hierarchy implies it governs only the Brainstorm phase. The structural placement contradicts the rule's own claimed generality.
- repro_or_impact: A future contributor adding a tool reference under `## Build`, the PR section, or the Hooks section gets no heading-level signal that this fallback rule applies to their section, since it sits visually inside Brainstorm. Scoping ambiguity in a law-grade doc; either lift it to its own H2 or explicitly reword the scope to "skills/tools the brainstorm phase names" so heading and text agree.
